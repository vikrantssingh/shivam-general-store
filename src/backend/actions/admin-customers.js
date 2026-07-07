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

  // Set them to shopkeeper_rejected so they can see their status, but they will still function as retail
  const { error } = await supabase
    .from("users")
    .update({ 
      role: "shopkeeper_rejected",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/customers");
  return { success: true };
}

export async function changeUserRoleAction(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const id = formData.get("id");
  const newRole = formData.get("role");
  
  if (!id || !newRole) return { error: "Missing required fields" };
  
  // Validate role to prevent setting admin accidentally
  if (newRole !== "retail" && newRole !== "shopkeeper_approved") {
    return { error: "Invalid role selected" };
  }

  const { error } = await supabase
    .from("users")
    .update({ 
      role: newRole,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/customers");
  return { success: true };
}

