import { createClient } from "@/backend/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PrintBillButton from "@/frontend/components/storefront/PrintBillButton";

export default async function OrderBillPage({ params }) {
  const { id } = params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/orders/${id}/bill`);
  }

  // Get user profile to check if admin
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // Fetch the order with items and customer details
  const { data: order, error } = await supabase
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
        products (name, unit)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !order) {
    return <div className="p-8 text-center text-red-500">Order not found or access denied.</div>;
  }

  // Security Check: Only the order owner or an admin can view this bill
  if (order.user_id !== user.id && !isAdmin) {
    redirect("/orders");
  }

  const deliveryCharge = order.delivery_type === "home_delivery" ? 40 : 0;
  const grandTotal = Number(order.total_amount) + deliveryCharge;

  const dateObj = new Date(order.created_at);
  const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear().toString().slice(-2)}, ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
  
  const customerName = (order.users?.full_name || "CUSTOMER").toUpperCase();

  return (
    <div className="bg-gray-200 min-h-screen py-8 print:bg-white print:py-0">
      <div className="container mx-auto max-w-sm px-4">
        
        {/* Actions - Hidden when printing */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href={isAdmin ? "/admin/orders" : "/orders"}>
            <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <PrintBillButton order={order} profile={order.users} />
        </div>

        {/* The Thermal Bill */}
        <div id="print-area" className="bg-white shadow-xl mx-auto p-5 print:shadow-none font-sans text-black" style={{ width: '100%', maxWidth: '320px' }}>
          
          <div className="text-center font-bold text-base mb-3">
            SHIVAM GENERAL STORE
          </div>
          
          <div className="flex justify-between text-[15px] mb-1">
            <span>#{order.id.split('-')[0].toUpperCase()}</span>
            <span>{dateStr}</span>
          </div>
          
          <div className="font-bold text-[15px] mb-3">
            {customerName}
          </div>

          <table className="w-full text-[15px] mb-4">
            <thead>
              <tr className="font-bold">
                <th className="text-left pb-1">Item</th>
                <th className="text-right pb-1 w-8">Q</th>
                <th className="text-right pb-1 w-16">Amt</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item) => (
                <tr key={item.id}>
                  <td className="py-0.5 align-top pr-1">{item.products?.name || "Item"}</td>
                  <td className="py-0.5 text-right align-top">{item.quantity}</td>
                  <td className="py-0.5 text-right align-top">{item.price_at_time}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-[15px] space-y-0.5">
            <div className="flex justify-between">
              <span>Items Total:</span>
              <span>{Number(order.total_amount).toFixed(2)}</span>
            </div>
            {deliveryCharge > 0 && (
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{deliveryCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[15px] mt-1 pt-1">
              <span>Total:</span>
              <span>{grandTotal.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
