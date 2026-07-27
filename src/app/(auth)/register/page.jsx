"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { retailRegisterSchema, shopkeeperRegisterSchema } from "@/backend/validations/auth";
import { registerRetailAction, registerShopkeeperAction } from "@/backend/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Store, User, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState(null); // 'retail' or 'shopkeeper'
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const retailForm = useForm({
    resolver: zodResolver(retailRegisterSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const shopkeeperForm = useForm({
    resolver: zodResolver(shopkeeperRegisterSchema),
    defaultValues: { fullName: "", email: "", phone: "", businessName: "", businessAddress: "", gstNumber: "", password: "", confirmPassword: "" },
  });

  async function onRetailSubmit(values) {
    setIsPending(true);
    const result = await registerRetailAction(values);
    setIsPending(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Account created successfully!");
    }
  }

  async function onShopkeeperSubmit(values) {
    setIsPending(true);
    const result = await registerShopkeeperAction(values);
    setIsPending(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Request submitted successfully! Pending admin approval.");
    }
  }

  if (!accountType) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-green-900">Create Account</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">Choose your account type to get started</p>
        </div>
        
        <div className="grid w-full max-w-md gap-4">
          <Card 
            className="cursor-pointer border-2 border-transparent hover:border-green-600 hover:shadow-md transition-all"
            onClick={() => setAccountType('retail')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Retail Customer</h3>
                <p className="text-xs font-medium text-gray-500">For personal shopping and home use.</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer border-2 border-transparent hover:border-green-600 hover:shadow-md transition-all"
            onClick={() => setAccountType('shopkeeper')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Store className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Wholesale Customer</h3>
                <p className="text-xs font-medium text-gray-500">For bulk purchasing and business use.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-sm text-gray-500 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-green-700 hover:underline">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const isRetail = accountType === 'retail';
  const themeColor = "green";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 py-10">
      <Card className="w-full max-w-md border-gray-100 shadow-lg">
        <CardHeader className="space-y-1 text-center relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-2 top-2 h-8"
            onClick={() => setAccountType(null)}
          >
            &larr; Back
          </Button>
          <CardTitle className={`text-2xl font-extrabold tracking-tight mt-4 text-${themeColor}-900`}>
            {isRetail ? "Create Retail Account" : "Request Wholesale Account"}
          </CardTitle>
          <CardDescription className="text-gray-500 font-medium">
            Fill in your details to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRetail ? (
            <form onSubmit={retailForm.handleSubmit(onRetailSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <Input {...retailForm.register("fullName")} placeholder="Enter your full name" className="bg-gray-50 focus-visible:ring-green-500" />
                {retailForm.formState.errors.fullName && <p className="text-xs text-red-500">{retailForm.formState.errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <Input type="email" {...retailForm.register("email")} placeholder="Enter your email" className="bg-gray-50 focus-visible:ring-green-500" />
                {retailForm.formState.errors.email && <p className="text-xs text-red-500">{retailForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <Input {...retailForm.register("phone")} placeholder="Enter your phone number" className="bg-gray-50 focus-visible:ring-green-500" />
                {retailForm.formState.errors.phone && <p className="text-xs text-red-500">{retailForm.formState.errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} {...retailForm.register("password")} placeholder="Create a password" className="bg-gray-50 focus-visible:ring-green-500 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {retailForm.formState.errors.password && <p className="text-xs text-red-500">{retailForm.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Input type={showConfirmPassword ? "text" : "password"} {...retailForm.register("confirmPassword")} placeholder="Confirm your password" className="bg-gray-50 focus-visible:ring-green-500 pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {retailForm.formState.errors.confirmPassword && <p className="text-xs text-red-500">{retailForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold h-11 mt-6" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Retail Account"}
              </Button>
            </form>
          ) : (
            <form onSubmit={shopkeeperForm.handleSubmit(onShopkeeperSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Shop / Business Name</label>
                <Input {...shopkeeperForm.register("businessName")} placeholder="Enter shop name" className="bg-gray-50 focus-visible:ring-green-500" />
                {shopkeeperForm.formState.errors.businessName && <p className="text-xs text-red-500">{shopkeeperForm.formState.errors.businessName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Owner Name</label>
                <Input {...shopkeeperForm.register("fullName")} placeholder="Enter owner name" className="bg-gray-50 focus-visible:ring-green-500" />
                {shopkeeperForm.formState.errors.fullName && <p className="text-xs text-red-500">{shopkeeperForm.formState.errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <Input {...shopkeeperForm.register("phone")} placeholder="Enter phone number" className="bg-gray-50 focus-visible:ring-green-500" />
                {shopkeeperForm.formState.errors.phone && <p className="text-xs text-red-500">{shopkeeperForm.formState.errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <Input type="email" {...shopkeeperForm.register("email")} placeholder="Enter your email" className="bg-gray-50 focus-visible:ring-green-500" />
                {shopkeeperForm.formState.errors.email && <p className="text-xs text-red-500">{shopkeeperForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Complete Business Address</label>
                <Input {...shopkeeperForm.register("businessAddress")} placeholder="Enter full address" className="bg-gray-50 focus-visible:ring-green-500" />
                {shopkeeperForm.formState.errors.businessAddress && <p className="text-xs text-red-500">{shopkeeperForm.formState.errors.businessAddress.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">GST Number (Optional)</label>
                <Input {...shopkeeperForm.register("gstNumber")} placeholder="Enter GST number" className="bg-gray-50 focus-visible:ring-green-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} {...shopkeeperForm.register("password")} placeholder="Create a password" className="bg-gray-50 focus-visible:ring-green-500 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {shopkeeperForm.formState.errors.password && <p className="text-xs text-red-500">{shopkeeperForm.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Input type={showConfirmPassword ? "text" : "password"} {...shopkeeperForm.register("confirmPassword")} placeholder="Confirm your password" className="bg-gray-50 focus-visible:ring-green-500 pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {shopkeeperForm.formState.errors.confirmPassword && <p className="text-xs text-red-500">{shopkeeperForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold h-11 mt-6" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Request Wholesale Account"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-gray-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className={`font-bold text-${themeColor}-700 hover:underline`}>
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
