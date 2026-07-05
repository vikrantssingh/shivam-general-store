"use server";

import { createClient } from "@/backend/supabase/server";
import { revalidatePath } from "next/cache";

// Add a new category
export async function addCategoryAction(formData) {
  const supabase = createClient();
  const name = formData.get("name");
  const status = formData.get("status") === "true"; // Assuming radio or switch returns 'true' string

  if (!name) return { error: "Category name is required" };

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, status }])
    .select()
    .single();

  if (error) return { error: error.message };
  
  revalidatePath("/admin/categories");
  return { success: true, data };
}

// Edit an existing category
export async function updateCategoryAction(formData) {
  const supabase = createClient();
  const id = formData.get("id");
  const name = formData.get("name");
  const status = formData.get("status") === "true";

  if (!id || !name) return { error: "ID and name are required" };

  const { data, error } = await supabase
    .from("categories")
    .update({ name, status })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true, data };
}

// Delete a category
export async function deleteCategoryAction(formData) {
  const supabase = createClient();
  const id = formData.get("id");

  if (!id) return { error: "Category ID is required" };

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

// Quick edit product from category modal
export async function quickUpdateProductAction(formData) {
  const supabase = createClient();
  const id = formData.get("id");
  const name = formData.get("name");
  const stock = parseInt(formData.get("stock"));

  if (!id || !name) return { error: "ID and name are required" };

  const { error } = await supabase
    .from("products")
    .update({ name, stock })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

// Quick delete product from category modal
export async function quickDeleteProductAction(formData) {
  const supabase = createClient();
  const id = formData.get("id");

  if (!id) return { error: "Product ID is required" };

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}
