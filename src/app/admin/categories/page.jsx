import { createClient } from "@/backend/supabase/server";
import CategoriesClient from "@/frontend/components/admin/CategoriesClient";

export default async function AdminCategoriesPage() {
  const supabase = createClient();

  // Fetch real categories from the database
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all products to calculate stock and item count
  const { data: products } = await supabase
    .from("products")
    .select("id, category_id, name, stock");

  // Merge products and stats into categories
  const categoriesWithStats = (categories || []).map(cat => {
    const catProducts = (products || []).filter(p => p.category_id === cat.id);
    const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
    return {
      ...cat,
      itemsCount: catProducts.length,
      totalStock,
      products: catProducts // Pass products down so the modal can display them
    };
  });

  return (
    <CategoriesClient categories={categoriesWithStats} />
  );
}
