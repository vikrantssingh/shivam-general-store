"use client";

import Link from "next/link";
import { useCart } from "@/frontend/context/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-50 mb-6">
          <ShoppingBag className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link href="/">
          <Button className="bg-green-700 hover:bg-green-800 text-white px-8 font-bold rounded-full">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Your Cart</h1>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-20 w-20 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center text-2xl">
                  🛍️
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.unit}</p>
                  <div className="font-bold text-gray-900 mt-1">₹{item.price}</div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-6 w-6 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:bg-gray-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 shadow-sm border-gray-100">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-medium">Calculated at checkout</span>
                </div>
                
                <div className="border-t pt-3 mt-3 flex justify-between font-extrabold text-lg text-gray-900">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full mt-6 bg-green-700 hover:bg-green-800 text-white font-bold h-12 rounded-xl">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
