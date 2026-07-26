import ProductCard from "@/frontend/components/product/ProductCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/backend/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import CategoryList from "@/frontend/components/storefront/CategoryList";

export default async function StorefrontHome({ searchParams }) {
  const supabase = createClient();
  const q = searchParams?.q || "";
  const categoryId = searchParams?.category || "all";

  // Check if user is an approved shopkeeper
  const { data: { user } } = await supabase.auth.getUser();
  let isShopkeeper = false;
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    
    if (profile && profile.role === 'shopkeeper_approved') {
      isShopkeeper = true;
    }
    
    // Admin Override View
    if (profile && profile.role === 'admin') {
      const cookieStore = cookies();
      const viewAs = cookieStore.get('admin_viewAs')?.value;
      if (viewAs === 'shopkeeper') {
        isShopkeeper = true;
      } else if (viewAs === 'retail') {
        isShopkeeper = false;
      }
    }
  }

  // Fetch categories (removed status filter so all show up)
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch products
  let productsQuery = supabase
    .from("products")
    .select("*")
    .eq(isShopkeeper ? "wholesale_status" : "retail_status", true)
    .order("created_at", { ascending: false });

  if (categoryId && categoryId !== "all") {
    productsQuery = productsQuery.eq("category_id", categoryId);
  }
  if (q) {
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

  const { data: products } = await productsQuery;

  // Use a fallback if categories are empty
  const displayCategories = categories && categories.length > 0 
    ? [{ id: "all", name: "All" }, ...categories]
    : [{ id: "all", name: "All" }];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      {/* Banner / Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-green-50 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col items-start max-w-[60%]">
          <Badge className="bg-green-600 hover:bg-green-700 mb-3 text-[10px] uppercase tracking-wider">
            Everyday Low Prices
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-green-950 leading-tight">
            Fresh Products<br/>Everyday At Best Prices
          </h1>
          <p className="mt-2 text-sm text-green-800 font-medium">Shop from our wide range of daily essentials.</p>
        </div>
        {/* Abstract decorative shapes for premium look */}
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-green-200/50 blur-3xl" />
        <div className="absolute right-20 -top-10 h-32 w-32 rounded-full bg-yellow-200/40 blur-2xl" />
      </div>

      {/* Categories */}
      <CategoryList 
        categories={displayCategories} 
        currentCategoryId={categoryId} 
        q={q} 
      />

      {/* Product Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {q ? `Search Results for "${q}"` : "Top Offers on Daily Essentials"}
          </h2>
          {!q && <span className="text-sm font-semibold text-green-700 cursor-pointer hover:underline">View All</span>}
        </div>
        
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6">
            {products.map((product) => {
              // Determine effective price and MRP based on user role
              const effectivePrice = isShopkeeper && product.shopkeeper_price 
                ? product.shopkeeper_price 
                : product.retail_price;
                
              const displayMrp = isShopkeeper && product.shopkeeper_price 
                ? product.retail_price // Shopkeepers see retail price as MRP
                : (product.mrp || product.retail_price);
                
              const discount = displayMrp && displayMrp > effectivePrice
                ? Math.round(((displayMrp - effectivePrice) / displayMrp) * 100) 
                : 0;

              const maxLimit = isShopkeeper ? product.shopkeeper_limit : product.retail_limit;
              const displayUnit = isShopkeeper && product.shopkeeper_unit ? product.shopkeeper_unit : product.unit;

              return (
                <ProductCard key={product.id} product={{
                  id: product.id,
                  name: product.name,
                  unit: displayUnit,
                  price: effectivePrice,
                  mrp: displayMrp,
                  discount: discount,
                  image_url: product.image_url,
                  maxLimit: maxLimit
                }} />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">No products available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
