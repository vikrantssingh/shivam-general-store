"use server";

import { createClient } from "@/backend/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function placeOrderAction(orderData, cartItems) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to place an order." };
  }

  // Verify role and cart
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  const isShopkeeper = profile?.role === "shopkeeper_approved";

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
        quantity: newQty,
        unit: actualUnit,
        image_url: dbProduct.image_url
    };
  }).filter(Boolean);

  if (cartUpdated || correctedCart.length !== cartItems.length) {
     return { 
         error: "CART_UPDATED", 
         message: "Some items were updated due to recent price, limit, or availability changes by the admin. Please review your new bill and try again.", 
         correctedCart 
     };
  }

  // Calculate total amount from correctedCart
  const totalAmount = correctedCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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

  revalidatePath("/dashboard/orders");
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

  // If there's an ETA message, we need to fetch the existing delivery_address to update it
  let updateData = {
    status,
    updated_at: new Date().toISOString()
  };

  if (etaMessage !== null && etaMessage !== undefined) {
    const { data: order } = await supabase.from("orders").select("delivery_address").eq("id", id).single();
    if (order) {
      updateData.delivery_address = {
        ...(order.delivery_address || {}),
        eta_message: etaMessage
      };
    }
  }

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  return { success: true };
}
