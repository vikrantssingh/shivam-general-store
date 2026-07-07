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

  // Calculate total amount from cart items to prevent client-side tampering
  // (In a real app, you'd fetch prices from DB again, but for this MVP we'll use the cart prices)
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
  const orderItemsData = cartItems.map((item) => ({
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
