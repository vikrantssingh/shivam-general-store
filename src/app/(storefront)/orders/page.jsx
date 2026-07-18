import { createClient } from "@/backend/supabase/server";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import OrderCard from "@/frontend/components/storefront/OrderCard";

export default async function CustomerOrdersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  // Fetch orders for this user
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      users (
        full_name,
        email,
        phone,
        business_name,
        gst_number
      ),
      order_items (
        id,
        quantity,
        price_at_time,
        products (name, image_url, unit)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return <div className="container mx-auto px-4 py-8">Error loading your orders.</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">My Orders</h1>

      {orders?.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">No orders yet</h2>
          <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
