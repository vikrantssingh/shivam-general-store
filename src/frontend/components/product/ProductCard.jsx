"use client";

import { Plus, Minus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/frontend/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart, cart, updateQuantity } = useCart();
  
  const currentQty = cart?.find((item) => item.id === product.id)?.quantity || 0;
  const isMaxLimitReached = product.maxLimit > 0 && currentQty >= product.maxLimit;
  
  // Stock checks
  const stock = product.stock || 0;
  const purchasableStock = stock > 4 ? stock - 4 : 0;
  const isOutOfStock = purchasableStock <= 0;
  const isStockLimitReached = currentQty >= purchasableStock;
  const isAddDisabled = isMaxLimitReached || isStockLimitReached;

  return (
    <Card className={`overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="relative aspect-square bg-gray-100 p-4">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover rounded-lg shadow-inner bg-white" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-white shadow-inner">
            <span className="text-4xl">🛍️</span>
          </div>
        )}
        {product.discount > 0 && (
          <div className="absolute top-0 right-0 rounded-bl-xl rounded-tr-xl bg-orange-500 px-2 py-1 text-[10px] font-extrabold text-white shadow-sm z-10">
            {product.discount}% OFF
          </div>
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
          {isOutOfStock ? (
            <button 
              className="h-8 rounded-full bg-gray-200 px-4 text-gray-500 text-xs font-semibold shadow-sm cursor-pointer hover:bg-gray-300"
              onClick={() => alert("This item is currently out of stock!")}
            >
              OUT OF STOCK
            </button>
          ) : currentQty > 0 ? (
            <div className="flex h-8 items-center rounded-full border border-green-700 bg-white overflow-hidden shadow-sm">
              <button
                className="flex h-full w-8 items-center justify-center text-green-700 hover:bg-green-50 transition-colors"
                onClick={() => updateQuantity(product.id, currentQty - 1)}
              >
                {currentQty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
              </button>
              <span className="flex h-full w-6 items-center justify-center text-xs font-bold text-green-700 bg-green-50/50">
                {currentQty}
              </span>
              <button
                className="flex h-full w-8 items-center justify-center text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                onClick={() => {
                  if (isStockLimitReached) {
                    alert(`Only ${purchasableStock} units available in stock!`);
                  } else {
                    addToCart(product);
                  }
                }}
                disabled={isAddDisabled && !isStockLimitReached} // If max limit reached, actually disable. If stock limit, keep clickable to show alert
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <Button 
              size="sm" 
              className="h-8 rounded-full bg-green-700 px-4 hover:bg-green-800 text-xs font-semibold shadow-sm"
              onClick={() => {
                if (isOutOfStock) {
                  alert("This item is currently out of stock!");
                } else {
                  addToCart(product);
                }
              }}
            >
              ADD
            </Button>
          )}
        </div>
        {isMaxLimitReached && !isOutOfStock && (
          <p className="mt-2 text-[10px] font-semibold text-red-600 leading-tight">
            This item reached to its max limit. Contact owner.
          </p>
        )}
        {isStockLimitReached && !isMaxLimitReached && !isOutOfStock && (
          <p className="mt-2 text-[10px] font-semibold text-orange-600 leading-tight">
            Only {purchasableStock} units available in stock.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
