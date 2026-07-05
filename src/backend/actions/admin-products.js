"use server";

import { createClient } from "@/backend/supabase/server";
import { revalidatePath } from "next/cache";

export async function addProductAction(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const name = formData.get("name");
  const category_id = formData.get("category_id");
  const unit = formData.get("unit");
  const retail_price = parseFloat(formData.get("retail_price"));
  const wholesale_price = parseFloat(formData.get("wholesale_price"));
  const stock = parseInt(formData.get("stock"));
  const retail_limit = parseInt(formData.get("retail_limit") || "5");
  const shopkeeper_limit = parseInt(formData.get("shopkeeper_limit") || "50");
  const status = formData.get("status") === "true";
  const imageFile = formData.get("image");

  if (!name || !unit || isNaN(retail_price) || isNaN(stock)) {
    return { error: "Missing required fields" };
  }

  let image_url = null;
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile);
      
    if (uploadError) {
      console.error("Image upload error:", uploadError);
      return { error: "Failed to upload image: " + uploadError.message };
    }
    
    if (uploadData) {
      const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(fileName);
      image_url = publicUrl;
    }
  }

  const { error } = await supabase.from("products").insert({
    name,
    category_id: category_id || null,
    unit,
    retail_price,
    shopkeeper_price: wholesale_price || null,
    stock,
    retail_limit,
    shopkeeper_limit,
    status,
    image_url
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function updateProductAction(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const id = formData.get("id");
  const name = formData.get("name");
  const category_id = formData.get("category_id");
  const unit = formData.get("unit");
  const retail_price = parseFloat(formData.get("retail_price"));
  const wholesale_price = parseFloat(formData.get("wholesale_price"));
  const stock = parseInt(formData.get("stock"));
  const retail_limit = parseInt(formData.get("retail_limit") || "5");
  const shopkeeper_limit = parseInt(formData.get("shopkeeper_limit") || "50");
  const status = formData.get("status") === "true";
  const imageFile = formData.get("image");

  if (!id || !name || !unit || isNaN(retail_price) || isNaN(stock)) {
    return { error: "Missing required fields" };
  }

  let image_url = formData.get("existing_image_url") || null;
  
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile);
      
    if (uploadError) {
      console.error("Image upload error:", uploadError);
      return { error: "Failed to upload image: " + uploadError.message };
    }
    
    if (uploadData) {
      const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(fileName);
      image_url = publicUrl;
    }
  }

  const { error } = await supabase.from("products").update({
    name,
    category_id: category_id || null,
    unit,
    retail_price,
    shopkeeper_price: wholesale_price || null,
    stock,
    retail_limit,
    shopkeeper_limit,
    status,
    image_url,
    updated_at: new Date().toISOString()
  }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProductAction(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const id = formData.get("id");
  if (!id) return { error: "Missing ID" };

  const { error } = await supabase.from("products").delete().eq("id", id);
  
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}
