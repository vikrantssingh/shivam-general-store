import { createClient } from "@/backend/supabase/server";
import { redirect } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:bg-white print:py-0">
      <div className="container mx-auto max-w-3xl px-4">
        
        {/* Actions - Hidden when printing */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href={isAdmin ? "/admin/orders" : "/orders"}>
            <Button variant="outline" className="bg-white hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
            </Button>
          </Link>
          <Button 
            className="bg-green-700 hover:bg-green-800 text-white font-bold"
            // Use client-side JS to print
            // We use a small script hack since this is a server component, or just use a small Client Component wrapper
            // Actually, we can just use an inline onClick in a client component, but since this is SC, we'll just output standard JS
            // Wait, onClick doesn't work in SC. Let's make this page a client component? No, data fetching is good here.
            // I'll add a tiny client component for the print button below.
          >
            <Printer className="h-4 w-4 mr-2" /> Download / Print Bill
          </Button>
        </div>

        {/* The Bill / Invoice */}
        <div id="print-area" className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 print:shadow-none print:border-none print:p-0">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-green-700 tracking-tight">SHIVAM STORE</h1>
              <p className="text-gray-500 text-sm mt-1">General Store & Wholesale</p>
              <p className="text-gray-500 text-xs">New Delhi, India</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900 uppercase">INVOICE</h2>
              <p className="text-sm font-medium text-gray-600 mt-1">Order #{order.id.split('-')[0].toUpperCase()}</p>
              <p className="text-xs text-gray-500">Date: {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To:</h3>
              <p className="font-bold text-gray-900">{order.users.full_name}</p>
              {order.users.business_name && <p className="text-sm text-gray-700">{order.users.business_name}</p>}
              <p className="text-sm text-gray-600">{order.users.phone}</p>
              <p className="text-sm text-gray-600">{order.users.email}</p>
              {order.users.gst_number && <p className="text-sm text-gray-600 font-mono mt-1">GST: {order.users.gst_number}</p>}
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Details:</h3>
              <p className="font-bold text-gray-900">{order.delivery_type === "home_delivery" ? "Home Delivery" : "Store Pickup"}</p>
              {order.delivery_type === "home_delivery" && order.delivery_address && (
                <div className="text-sm text-gray-600 mt-1">
                  <p>{order.delivery_address.fullName} - {order.delivery_address.phone}</p>
                  <p>{order.delivery_address.addressLine1}</p>
                  <p>{order.delivery_address.city}, {order.delivery_address.pincode}</p>
                </div>
              )}
              <div className="mt-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Payment:</span>
                <span className="text-sm font-medium text-gray-900">{order.payment_method}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-900">Item Description</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 text-center">Qty</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 text-right">Price</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.order_items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {item.products?.name}
                      <span className="block text-xs text-gray-500 font-normal">{item.products?.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-gray-700 text-right">₹{item.price_at_time}</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">₹{(item.price_at_time * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.total_amount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Charge</span>
                <span>{deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-gray-900 border-t pt-3">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t mt-12 pt-6 text-center">
            <p className="text-sm font-bold text-green-700">Thank you for your business!</p>
            <p className="text-xs text-gray-500 mt-1">If you have any questions about this invoice, please contact us.</p>
          </div>

        </div>
      </div>
      
      {/* We inject a tiny script to handle the print button click */}
      <script dangerouslySetInnerHTML={{__html: `
        document.querySelector('button.bg-green-700').addEventListener('click', function() {
          window.print();
        });
      `}} />
    </div>
  );
}
