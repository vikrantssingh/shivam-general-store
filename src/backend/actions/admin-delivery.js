"use server";

import { createClient } from "@/backend/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDeliveryRulesAction(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const rulesJson = formData.get("rules");
  if (!rulesJson) return { error: "No rules provided" };

  let rules = [];
  try {
    rules = JSON.parse(rulesJson);
  } catch (e) {
    return { error: "Invalid format for rules" };
  }

  // Update the singleton settings table (id=1)
  const { error } = await supabase
    .from("settings")
    .update({ 
      delivery_charges: rules,
      updated_at: new Date().toISOString()
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/admin/delivery");
  return { success: true };
}
