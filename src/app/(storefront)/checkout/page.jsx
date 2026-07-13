"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/frontend/context/CartContext";
import { placeOrderAction } from "@/backend/actions/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, MapPin, Store } from "lucide-react";
import { createClient } from "@/backend/supabase/client";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPrice, clearCart, updateEntireCart } = useCart();
  
  const [isPending, setIsPending] = useState(false);
  const [deliveryType, setDeliveryType] = useState("home_delivery");
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    pincode: ""
  });
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to place an order.");
        router.push("/login?redirect=/checkout");
        return;
      }
      
      setUser(session.user);
      // Pre-fill name and phone if available
      setAddress(prev => ({
        ...prev,
        fullName: session.user.user_metadata?.full_name || "",
        phone: session.user.user_metadata?.phone || ""
      }));
      setAuthChecked(true);
    }
    checkAuth();
  }, [router]);

  if (!authChecked) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-700" /></div>;
  }

  if (cart.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (deliveryType === "home_delivery") {
      if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.pincode) {
        toast.error("Please fill in all address fields.");
        return;
      }
    }

    setIsPending(true);
    const orderData = { deliveryType, address };
    const result = await placeOrderAction(orderData, cart);
    setIsPending(false);

    if (result?.error) {
      if (result.error === "CART_UPDATED") {
        updateEntireCart(result.correctedCart);
        toast.error(result.message, { duration: 6000 });
      } else {
        toast.error(result.error);
      }
    } else {
      toast.success("Order placed successfully!");
      clearCart();
      router.push("/dashboard/orders");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Checkout</h1>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Delivery Options</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue={deliveryType} onValueChange={setDeliveryType} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="home_delivery" id="home" className="peer sr-only" />
                  <Label
                    htmlFor="home"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 [&:has([data-state=checked])]:border-green-600 cursor-pointer"
                  >
                    <MapPin className="mb-3 h-6 w-6 text-gray-700 peer-data-[state=checked]:text-green-700" />
                    <span className="font-bold text-gray-900">Home Delivery</span>
                    <span className="text-xs text-gray-500 mt-1">Delivered to your door</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="store_pickup" id="pickup" className="peer sr-only" />
                  <Label
                    htmlFor="pickup"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 [&:has([data-state=checked])]:border-green-600 cursor-pointer"
                  >
                    <Store className="mb-3 h-6 w-6 text-gray-700" />
                    <span className="font-bold text-gray-900">Store Pickup</span>
                    <span className="text-xs text-gray-500 mt-1">Pick up yourself (Free)</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {deliveryType === "home_delivery" && (
            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input name="phone" value={address.phone} onChange={handleAddressChange} placeholder="9876543210" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address Line 1</Label>
                  <Textarea name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} placeholder="Flat, House no., Building, Company" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input name="city" value={address.city} onChange={handleAddressChange} placeholder="New Delhi" />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input name="pincode" value={address.pincode} onChange={handleAddressChange} placeholder="110001" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border-2 border-green-600 bg-green-50 p-4 font-bold text-green-900">
                Cash on Delivery / Pay at Store
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 shadow-sm border-gray-100">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4 max-h-[30vh] overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span className="line-clamp-1 mr-4">{item.quantity}x {item.name}</span>
                    <span className="font-medium text-gray-900 whitespace-nowrap">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-medium">
                    {deliveryType === 'store_pickup' ? 'Free' : '₹40'}
                  </span>
                </div>
                
                <div className="border-t pt-3 mt-3 flex justify-between font-extrabold text-lg text-gray-900">
                  <span>Total To Pay</span>
                  <span>₹{deliveryType === 'store_pickup' ? totalPrice : totalPrice + 40}</span>
                </div>
              </div>

              <Button 
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-green-700 hover:bg-green-800 text-white font-bold h-12 rounded-xl"
                disabled={isPending}
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
