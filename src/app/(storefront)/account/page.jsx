import { createClient } from "@/backend/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, CheckCircle, Clock, XCircle, Package, Info, Phone, ShieldCheck, FileText } from "lucide-react";
import { logoutAction } from "@/backend/actions/auth";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./ProfileForm";

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const renderStatus = () => {
    switch (profile?.role) {
      case "shopkeeper_pending":
        return (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <Clock className="h-6 w-6 text-yellow-500" />
            <div>
              <h3 className="font-bold text-yellow-800">Pending Approval</h3>
              <p className="text-sm text-yellow-700">We are reviewing your shopkeeper application. Please check back later.</p>
            </div>
          </div>
        );
      case "shopkeeper_approved":
        return (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-bold text-green-800">Approved Shopkeeper</h3>
              <p className="text-sm text-green-700">Your wholesale account is active. You are now seeing wholesale prices.</p>
            </div>
          </div>
        );
      case "shopkeeper_rejected":
        return (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <XCircle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-bold text-red-800">Application Rejected</h3>
              <p className="text-sm text-red-700">Your shopkeeper application was not approved. You can continue shopping as a retail customer.</p>
            </div>
          </div>
        );
      default:
        // Retail users (or admins) who never applied for shopkeeper
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between border-b pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center overflow-hidden border border-green-200">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-green-700" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name || "My Account"}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Profile Details</h2>
            <ProfileForm profile={profile} userEmail={user.email} />
          </div>

          {(profile?.role?.startsWith("shopkeeper") || profile?.role === "admin") && (
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Wholesale Request Status</h2>
              {renderStatus()}
            </div>
          )}

          <div className="pt-6 border-t mt-8">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Help & Support</h2>
            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
              <Link href="/about" className="flex items-center p-4 hover:bg-gray-100 transition-colors group">
                <Info className="h-5 w-5 text-gray-400 group-hover:text-green-600 mr-3" />
                <span className="font-medium text-gray-700 group-hover:text-gray-900">About Us</span>
              </Link>
              <Link href="/contact" className="flex items-center p-4 hover:bg-gray-100 transition-colors group">
                <Phone className="h-5 w-5 text-gray-400 group-hover:text-green-600 mr-3" />
                <span className="font-medium text-gray-700 group-hover:text-gray-900">Contact Support</span>
              </Link>
              <Link href="/privacy" className="flex items-center p-4 hover:bg-gray-100 transition-colors group">
                <ShieldCheck className="h-5 w-5 text-gray-400 group-hover:text-green-600 mr-3" />
                <span className="font-medium text-gray-700 group-hover:text-gray-900">Privacy Policy</span>
              </Link>
              <Link href="/terms" className="flex items-center p-4 hover:bg-gray-100 transition-colors group">
                <FileText className="h-5 w-5 text-gray-400 group-hover:text-green-600 mr-3" />
                <span className="font-medium text-gray-700 group-hover:text-gray-900">Terms & Conditions</span>
              </Link>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">© {new Date().getFullYear()} Shivam General Store. All rights reserved.</p>
            </div>
          </div>

          <div className="pt-6 border-t mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/orders" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full font-semibold border-gray-200 text-gray-700 hover:bg-gray-50">
                <Package className="mr-2 h-4 w-4" /> My Orders
              </Button>
            </Link>
            <form action={logoutAction} className="w-full sm:w-auto">
              <Button type="submit" variant="destructive" className="w-full font-semibold">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
