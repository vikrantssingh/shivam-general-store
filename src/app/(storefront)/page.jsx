import ProductCard from "@/frontend/components/product/ProductCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/backend/supabase/server";

export default async function StorefrontHome() {
  const supabase = createClient();

  // Check if user is an approved shopkeeper
  const { data: { user } } = await supabase.auth.getUser();
  let isShopkeeper = false;
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile && profile.role === 'shopkeeper_approved') {
      isShopkeeper = true;
    }
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("status", true)
    .order("name");

  // Fetch products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("status", true)
    .order("created_at", { ascending: false });

  // Use a fallback if categories are empty
  const displayCategories = categories && categories.length > 0 
    ? [{ name: "All" }, ...categories]
    : [{ name: "All" }];

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

      {/* Categories Horizontal Scroll */}
      <div className="mt-8 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Shop by Category</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 pb-4">
            {displayCategories.map((category, i) => (
              <div 
                key={category.name} 
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl p-3 px-5 transition-colors ${
                  i === 0 ? "bg-green-700 text-white" : "bg-white border border-gray-100 hover:bg-green-50 text-gray-600"
                }`}
              >
                <span className="text-sm font-semibold">{category.name}</span>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* Product Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Top Offers on Daily Essentials</h2>
          <span className="text-sm font-semibold text-green-700 cursor-pointer hover:underline">View All</span>
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

              return (
                <ProductCard key={product.id} product={{
                  id: product.id,
                  name: product.name,
                  unit: product.unit,
                  price: effectivePrice,
                  mrp: displayMrp,
                  discount: discount,
                  image_url: product.image_url
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
