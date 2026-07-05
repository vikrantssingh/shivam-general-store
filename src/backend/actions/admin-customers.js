"use server";

import { createClient } from "@/backend/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveShopkeeperAction(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const id = formData.get("id");
  if (!id) return { error: "Missing user ID" };

  const { error } = await supabase
    .from("users")
    .update({ 
      role: "shopkeeper_approved",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/customers");
  return { success: true };
}

export async function rejectShopkeeperAction(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const id = formData.get("id");
  if (!id) return { error: "Missing user ID" };

  // Set them back to retail instead of deleting
  const { error } = await supabase
    .from("users")
    .update({ 
      role: "retail",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/customers");
  return { success: true };
}
