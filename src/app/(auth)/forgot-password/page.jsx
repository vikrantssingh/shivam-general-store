"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/backend/validations/auth";
import { forgotPasswordAction } from "@/backend/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values) {
    setIsPending(true);
    const result = await forgotPasswordAction(values);
    setIsPending(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      setIsSuccess(true);
      toast.success("Password reset link sent to your email!");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-gray-100 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-extrabold text-green-900 tracking-tight">Forgot Password</CardTitle>
          <CardDescription className="text-gray-500 font-medium">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center p-4 bg-green-50 text-green-800 rounded-md border border-green-200">
              <p className="font-medium">Check your email!</p>
              <p className="text-sm mt-1">We&apos;ve sent a password reset link to your email address.</p>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  {...form.register("email")}
                  className="bg-gray-50 border-gray-200 focus-visible:ring-green-500"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold h-11" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-gray-500 font-medium">
            Remember your password?{" "}
            <Link href="/login" className="font-bold text-green-700 hover:underline">
              Back to Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
