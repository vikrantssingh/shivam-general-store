"use server";

import { createClient } from "@/backend/supabase/server";
import { cookies } from "next/headers";

export async function getStorefrontProducts({ page = 0, categoryId = "all", q = "", limit = 14, isShopkeeper = null }) {
  const supabase = createClient();

  if (isShopkeeper === null) {
    const { data: { user } } = await supabase.auth.getUser();
    isShopkeeper = false;
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
  }

  // Omit sensitive wholesale fields for non-wholesale customers
  const selectColumns = isShopkeeper 
    ? "*" 
    : "id, category_id, name, description, unit, image_url, retail_price, mrp, stock, retail_limit, low_stock_threshold, status, retail_status, wholesale_status, created_at, updated_at";
  const statusField = isShopkeeper ? "wholesale_status" : "retail_status";

  const cleanQ = (q || "").trim();

  // If no search query, perform simple paginated query
  if (!cleanQ) {
    let query = supabase
      .from("products")
      .select(selectColumns)
      .eq(statusField, true)
      .order("created_at", { ascending: false });

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    const offset = page * limit;
    const { data: products } = await query.range(offset, offset + limit - 1);
    return products || [];
  }

  // When searching: fetch direct matches and related products from same categories
  const cleanQLower = cleanQ.toLowerCase();

  // 1. Fetch categories
  const { data: categories } = await supabase.from("categories").select("id, name");

  // 2. Prepare conditions for direct matches: full query + individual keywords
  const orConditions = [`name.ilike.%${cleanQ}%`];
  const words = cleanQ.split(/\s+/).filter(w => w.length >= 3);
  words.forEach(w => {
    orConditions.push(`name.ilike.%${w}%`);
    const singular = w.endsWith('s') ? w.slice(0, -1) : null;
    if (singular && singular.length >= 3) {
      orConditions.push(`name.ilike.%${singular}%`);
    }
  });

  const uniqueOrConditions = Array.from(new Set(orConditions));

  let directQuery = supabase
    .from("products")
    .select(selectColumns)
    .eq(statusField, true)
    .or(uniqueOrConditions.join(","))
    .order("created_at", { ascending: false });

  if (categoryId && categoryId !== "all") {
    directQuery = directQuery.eq("category_id", categoryId);
  }

  const { data: directMatchesRaw } = await directQuery;

  // 3. Rank direct matches: exact phrase matches first, then multi-word matches, then recency
  const sortedDirectMatches = (directMatchesRaw || []).sort((a, b) => {
    const aName = (a.name || "").toLowerCase();
    const bName = (b.name || "").toLowerCase();
    const aExact = aName.includes(cleanQLower);
    const bExact = bName.includes(cleanQLower);
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    const aWordsMatch = words.filter(w => aName.includes(w.toLowerCase())).length;
    const bWordsMatch = words.filter(w => bName.includes(w.toLowerCase())).length;
    if (aWordsMatch !== bWordsMatch) return bWordsMatch - aWordsMatch;

    return new Date(b.created_at) - new Date(a.created_at);
  });

  // 4. Collect related category IDs
  const relatedCategoryIds = new Set();
  sortedDirectMatches.forEach(p => {
    if (p.category_id) relatedCategoryIds.add(p.category_id);
  });

  // Also check if any category name matches the query or its words
  (categories || []).forEach(c => {
    const cName = (c.name || "").toLowerCase();
    const matches = 
      cName.includes(cleanQLower) || 
      cleanQLower.includes(cName) || 
      words.some(w => {
        const wLower = w.toLowerCase();
        const singular = wLower.endsWith('s') ? wLower.slice(0, -1) : wLower;
        return cName.includes(wLower) || wLower.includes(cName) || (singular.length >= 3 && cName.includes(singular));
      });

    if (matches) {
      if (!categoryId || categoryId === "all" || categoryId === c.id) {
        relatedCategoryIds.add(c.id);
      }
    }
  });

  // 5. Fetch related products from matched categories
  let relatedProducts = [];
  const directMatchIds = new Set(sortedDirectMatches.map(p => p.id));

  if (relatedCategoryIds.size > 0) {
    let relatedQuery = supabase
      .from("products")
      .select(selectColumns)
      .eq(statusField, true)
      .in("category_id", Array.from(relatedCategoryIds))
      .order("created_at", { ascending: false });

    if (categoryId && categoryId !== "all") {
      relatedQuery = relatedQuery.eq("category_id", categoryId);
    }

    const { data: catProducts } = await relatedQuery;
    // Filter out products already in directMatches to avoid duplicates
    relatedProducts = (catProducts || []).filter(p => !directMatchIds.has(p.id));
  }

  // 6. Combine: Direct matching products first, followed by related category products
  const combined = [...sortedDirectMatches, ...relatedProducts];

  // 7. Paginate
  const offset = page * limit;
  return combined.slice(offset, offset + limit);
}

export async function getMoreProducts({ page, categoryId, q, limit = 14 }) {
  return getStorefrontProducts({ page, categoryId, q, limit });
}
