"use server";

import { createClient } from "@/backend/supabase/server";
import { createAdminClient } from "@/backend/supabase/admin";
import { revalidatePath } from "next/cache";

async function verifyAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile && profile.role === "admin";
}

export async function updateStoreSettingsAction(payload) {
  const supabase = createClient();
  const isAdmin = await verifyAdmin(supabase);

  if (!isAdmin) {
    return { error: "Unauthorized: Only administrators can update store settings." };
  }

  let storeName, phone, email, address;
  if (payload instanceof FormData) {
    storeName = payload.get("storeName");
    phone = payload.get("phone");
    email = payload.get("email");
    address = payload.get("address");
  } else if (payload && typeof payload === "object") {
    storeName = payload.storeName;
    phone = payload.phone;
    email = payload.email;
    address = payload.address;
  }

  const updateData = {
    id: 1,
    shop_name: storeName ? String(storeName).trim() : "SHIVAM GENERAL STORE",
    contact_number: phone ? String(phone).trim() : "",
    email: email ? String(email).trim() : "",
    store_address: address ? String(address).trim() : "",
    updated_at: new Date().toISOString(),
  };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("settings")
    .upsert(updateData, { onConflict: "id" });

  if (error) {
    console.error("Error saving store settings:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/privacy");
  revalidatePath("/terms");
  revalidatePath("/", "layout");

  return { success: true };
}
