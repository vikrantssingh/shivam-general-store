"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "@/frontend/components/product/ProductCard";
import { getMoreProducts } from "@/app/(storefront)/actions";
import { Loader2 } from "lucide-react";

export default function InfiniteProductGrid({ initialProducts, isShopkeeper, categoryId, q }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState((initialProducts || []).length === 14);
  const observerRef = useRef(null);

  // Reset state if filters change
  useEffect(() => {
    setProducts(initialProducts || []);
    setPage(1);
    setHasMore((initialProducts || []).length === 14);
  }, [initialProducts, categoryId, q]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const newProducts = await getMoreProducts({ page, isShopkeeper, categoryId, q, limit: 14 });
      if (newProducts.length > 0) {
        setProducts(prev => {
          // Prevent duplicates in strict mode
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = newProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });
        setPage(prev => prev + 1);
      }
      if (newProducts.length < 14) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, isShopkeeper, categoryId, q, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-500">No products available at the moment. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-2 gap-3 w-full sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6">
        {products.map((product) => {
          const effectivePrice = isShopkeeper && product.shopkeeper_price 
            ? product.shopkeeper_price 
            : product.retail_price;
            
          const displayMrp = isShopkeeper && product.shopkeeper_price 
            ? product.retail_price 
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
              maxLimit: maxLimit,
              stock: product.stock
            }} />
          );
        })}
      </div>
      
      {hasMore && (
        <div ref={observerRef} className="mt-8 mb-4 flex justify-center items-center py-4 w-full">
          {loading ? (
            <div className="flex items-center text-green-700 font-medium">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading more products...
            </div>
          ) : (
            <div className="h-10 w-full"></div>
          )}
        </div>
      )}
    </div>
  );
}
