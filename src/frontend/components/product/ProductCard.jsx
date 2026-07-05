"use client";

import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/frontend/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-gray-100 p-4">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover rounded-lg shadow-inner bg-white" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-white shadow-inner">
            <span className="text-4xl">🛍️</span>
          </div>
        )}
        {product.discount && (
          <span className="absolute left-2 top-2 rounded bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">
            {product.discount}% OFF
          </span>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 leading-tight">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500">{product.unit}</p>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
            {product.mrp && (
              <span className="text-[10px] text-gray-400 line-through">₹{product.mrp}</span>
            )}
          </div>
          <Button 
            size="sm" 
            className="h-8 rounded-full bg-green-700 px-3 hover:bg-green-800 text-xs font-semibold"
            onClick={() => addToCart(product)}
          >
            ADD
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
