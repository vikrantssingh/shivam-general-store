"use server";

import { createClient } from "@/backend/supabase/server";
import { createAdminClient } from "@/backend/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function placeOrderAction(orderData, cartItems) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to place an order." };
  }

  // Rate Limiting: Prevent rapid double-submission or bot spam (10-second cooldown)
  const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", user.id)
    .gte("created_at", tenSecondsAgo)
    .limit(1);

  if (recentOrders && recentOrders.length > 0) {
    return { error: "Please wait a few seconds before placing another order." };
  }

  // Verify role and cart
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  let isShopkeeper = profile?.role === "shopkeeper_approved";
  if (profile?.role === "admin") {
    const cookieStore = cookies();
    const viewAs = cookieStore.get("admin_viewAs")?.value;
    if (viewAs === "shopkeeper") {
      isShopkeeper = true;
    }
  }

  // Fetch LIVE product data
  const productIds = cartItems.map(item => item.id);
  const { data: dbProducts } = await supabase.from("products").select("*").in("id", productIds);

  let cartUpdated = false;
  const correctedCart = cartItems.map(cartItem => {
    const dbProduct = dbProducts?.find(p => p.id === cartItem.id);
    if (!dbProduct || dbProduct.status === false) {
      cartUpdated = true;
      return null;
    }

    const currentStock = dbProduct.stock || 0;
    const purchasableStock = currentStock > 4 ? currentStock - 4 : 0;
    
    if (purchasableStock <= 0 || purchasableStock < cartItem.quantity) {
      cartUpdated = true;
      // Item is out of stock (< 5) or insufficient stock
    }

    const actualPrice = isShopkeeper && dbProduct.shopkeeper_price 
        ? dbProduct.shopkeeper_price 
        : dbProduct.retail_price;

    const actualLimit = isShopkeeper 
        ? Number(dbProduct.shopkeeper_limit || 0)
        : Number(dbProduct.retail_limit || 0);

    let newQty = Number(cartItem.quantity || 1);
    
    if (actualLimit > 0 && newQty > actualLimit) {
        newQty = actualLimit;
        cartUpdated = true;
    }

    // Hard limit based on available stock
    if (newQty > purchasableStock) {
        newQty = purchasableStock;
        cartUpdated = true;
    }

    if (cartItem.maxLimit !== actualLimit) {
        cartUpdated = true;
    }

    if (cartItem.price !== actualPrice) {
        cartUpdated = true;
    }
    
    const actualUnit = isShopkeeper && dbProduct.shopkeeper_unit ? dbProduct.shopkeeper_unit : dbProduct.unit;
    if (cartItem.unit !== actualUnit || cartItem.name !== dbProduct.name) {
       cartUpdated = true;
    }

    return {
        ...cartItem,
        id: dbProduct.id,
        name: dbProduct.name,
        price: actualPrice,
        maxLimit: actualLimit,
        stock: currentStock,
        quantity: newQty,
        unit: actualUnit,
        image_url: dbProduct.image_url
    };
  }).filter(Boolean);

  if (cartUpdated || correctedCart.length !== cartItems.length || correctedCart.some(item => item.quantity <= 0)) {
     return { 
         error: "CART_UPDATED", 
         message: "Some items were updated due to recent stock availability (< 5), price, or limit changes by the admin. Please review your new bill and try again.", 
         correctedCart: correctedCart.filter(item => item.quantity > 0)
     };
  }

  // Calculate total amount from correctedCart
  const totalAmount = correctedCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Validate minimum purchase limit: ₹500 for retailer, ₹2000 for shopkeeper
  const minLimit = isShopkeeper ? 2000 : 500;
  if (totalAmount < minLimit) {
    return {
      error: isShopkeeper
        ? `Minimum order amount for shopkeeper is ₹2000. Your current order total is ₹${totalAmount}. Please add more items to place order.`
        : `Minimum order amount for retailer is ₹500. Your current order total is ₹${totalAmount}. Please add more items to place order.`
    };
  }

  // Create the Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        user_id: user.id,
        total_amount: totalAmount,
        delivery_type: orderData.deliveryType,
        payment_method: "Cash on Delivery", // Defaulting for now
        delivery_address: orderData.deliveryType === "home_delivery" ? orderData.address : null,
        status: "placed"
      }
    ])
    .select()
    .single();

  if (orderError) {
    return { error: "Failed to create order: " + orderError.message };
  }

  // Create Order Items
  const orderItemsData = correctedCart.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    price_at_time: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsData);

  if (itemsError) {
    return { error: "Failed to add items to order: " + itemsError.message };
  }

  // Deduct stock atomically to prevent race conditions and overselling
  const adminSupabase = createAdminClient();
  for (const item of correctedCart) {
    const { data: success, error: stockError } = await adminSupabase.rpc('decrement_product_stock', {
      p_product_id: item.id,
      p_quantity: item.quantity,
    });

    if (stockError) {
      console.error("Stock deduction RPC error:", stockError);
      return { error: "Database error while updating stock." };
    }

    if (!success) {
      return { 
        error: "CART_UPDATED", 
        message: `Item "${item.name}" was just purchased by another customer and is now out of stock. Please review your cart.` 
      };
    }
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/admin/products"); // revalidate products so frontend and admin see updated stock
  revalidatePath("/");
  return { success: true, orderId: order.id };
}

export async function updateOrderStatusAction(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const id = formData.get("id");
  const status = formData.get("status");
  const etaMessage = formData.get("etaMessage");
  
  if (!id || !status) return { error: "Missing required fields" };

  // Fetch existing order to check status
  const { data: order } = await supabase.from("orders").select("status, delivery_address").eq("id", id).single();
  if (!order) return { error: "Order not found" };

  let updateData = {
    status,
    updated_at: new Date().toISOString()
  };

  if (etaMessage !== null && etaMessage !== undefined) {
    updateData.delivery_address = {
      ...(order.delivery_address || {}),
      eta_message: etaMessage
    };
  }

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  return { success: true };
}

export async function cancelCustomerOrderAction(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const id = formData.get("id");
  const reason = formData.get("reason") || "No reason provided";

  if (!id) return { error: "Missing order ID" };

  // Fetch existing order to verify ownership and check status
  const { data: order } = await supabase
    .from("orders")
    .select("status, delivery_address, user_id")
    .eq("id", id)
    .single();

  if (!order) return { error: "Order not found" };
  if (order.user_id !== user.id) return { error: "Unauthorized" };

  if (order.status !== "placed" && order.status !== "preparing") {
    return { error: "Order cannot be cancelled at this stage." };
  }

  // Restore stock for this order's items atomically
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", id);

  if (orderItems && orderItems.length > 0) {
    const adminSupabase = createAdminClient();
    for (const item of orderItems) {
      if (item.product_id) {
        await adminSupabase.rpc("increment_product_stock", {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });
      }
    }
  }

  let updateData = {
    status: "cancelled",
    updated_at: new Date().toISOString(),
    delivery_address: {
      ...(order.delivery_address || {}),
      cancellation_reason: reason
    }
  };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("orders")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}
