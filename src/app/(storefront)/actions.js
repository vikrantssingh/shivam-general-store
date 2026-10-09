"use server";

import { createClient } from "@/backend/supabase/server";

export async function getMoreProducts({ page, isShopkeeper, categoryId, q, limit = 14 }) {
  const supabase = createClient();
  const offset = page * limit;

  let productsQuery = supabase
    .from("products")
    .select("*")
    .eq(isShopkeeper ? "wholesale_status" : "retail_status", true)
    .order("created_at", { ascending: false });

  if (categoryId && categoryId !== "all") {
    productsQuery = productsQuery.eq("category_id", categoryId);
  }

  if (q) {
    // Need to fetch categories again for search logic
    const { data: categories } = await supabase.from("categories").select("id, name");
    const matchingCategories = (categories || []).filter(c => 
      c.name.toLowerCase().includes(q.toLowerCase())
    );
    
    if (matchingCategories.length > 0) {
      const categoryIds = matchingCategories.map(c => c.id).join(',');
      productsQuery = productsQuery.or(`name.ilike.%${q}%,category_id.in.(${categoryIds})`);
    } else {
      productsQuery = productsQuery.ilike("name", `%${q}%`);
    }
  }

  const { data: products } = await productsQuery.range(offset, offset + limit - 1);
  return products || [];
}
