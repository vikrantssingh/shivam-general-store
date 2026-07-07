import { createClient } from "@/backend/supabase/server";
import { redirect } from "next/navigation";
import OrdersClient from "@/frontend/components/admin/OrdersClient";

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Fetch all orders with user details, ordered by newest first
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      users (
        full_name,
        role
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return <div>Error loading orders. Please try again.</div>;
  }

  return <OrdersClient initialOrders={orders || []} />;
}
