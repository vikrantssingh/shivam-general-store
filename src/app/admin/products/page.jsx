import { createClient } from "@/backend/supabase/server";
import ProductsClient from "@/frontend/components/admin/ProductsClient";

export default async function AdminProductsPage({ searchParams }) {
  const supabase = createClient();
  const isLowStockView = searchParams?.lowStock === 'true';
  
  // Fetch products with their categories
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  // Fetch categories for the select dropdown
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (productsError) {
    console.error("Error fetching products:", productsError);
  }

  return (
    <ProductsClient 
      initialProducts={products || []} 
      categories={categories || []} 
      filterLowStock={isLowStockView}
    />
  );
}
