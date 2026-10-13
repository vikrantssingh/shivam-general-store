"use server";

import { createClient } from "@/backend/supabase/server";
import { cookies } from "next/headers";

export async function getMoreProducts({ page, categoryId, q, limit = 14 }) {
  const supabase = createClient();
  const offset = page * limit;

  // Verify shopkeeper role securely on server
  const { data: { user } } = await supabase.auth.getUser();
  let isShopkeeper = false;
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role === 'shopkeeper_approved') {
      isShopkeeper = true;
    } else if (profile?.role === 'admin') {
      const cookieStore = cookies();
      const viewAs = cookieStore.get('admin_viewAs')?.value;
      if (viewAs === 'shopkeeper') isShopkeeper = true;
    }
  }

  // Omit sensitive wholesale fields for non-wholesale customers
  const selectColumns = isShopkeeper 
    ? "*" 
    : "id, category_id, name, description, unit, image_url, retail_price, mrp, stock, retail_limit, low_stock_threshold, status, retail_status, wholesale_status, created_at, updated_at";

  let productsQuery = supabase
    .from("products")
    .select(selectColumns)
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
