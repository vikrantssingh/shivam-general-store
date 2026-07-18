"use client";

import { useState } from "react";
import { Package, Truck, Store, Clock, CheckCircle, ChevronDown, ChevronUp, Download } from "lucide-react";
import Link from "next/link";
import { downloadThermalReceipt } from "@/frontend/utils/pdfGenerator";

const statusConfig = {
  placed: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Order Placed", icon: Package },
  preparing: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Preparing", icon: Clock },
  ready_for_pickup: { color: "bg-orange-50 text-orange-700 border-orange-200", label: "Ready for Pickup", icon: Store },
  out_for_delivery: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Out for Delivery", icon: Truck },
  delivered: { color: "bg-green-50 text-green-700 border-green-200", label: "Delivered", icon: CheckCircle },
  cancelled: { color: "bg-red-50 text-red-700 border-red-200", label: "Cancelled", icon: Package },
};

export default function OrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = statusConfig[order.status] || statusConfig.placed;
  const StatusIcon = config.icon;
  const etaMessage = order.delivery_address?.eta_message;
  
  const grandTotal = Number(order.total_amount) + (order.delivery_type === 'home_delivery' ? 40 : 0);
  const itemCount = order.order_items?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Order #</p>
              <p className="text-sm font-bold text-gray-900 uppercase">{order.id.split('-')[0]}</p>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 mt-1 sm:mt-4 rounded-full text-xs font-bold border ${config.color}`}>
              <StatusIcon className="h-3.5 w-3.5" /> {config.label}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Total</p>
              <p className="text-sm font-bold text-gray-900">₹{grandTotal}</p>
            </div>
            <Link href={`/orders/${order.id}/bill`} className="text-sm font-bold text-green-700 hover:text-green-800 bg-green-100 hover:bg-green-200 px-4 py-2 rounded-lg transition-colors inline-flex items-center hidden sm:inline-flex">
              View Bill
            </Link>
            <button onClick={() => downloadThermalReceipt(order, order.users)} className="text-sm font-bold text-white bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5">
              <Download className="h-4 w-4" /> Download Bill
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
          <p className="text-xs text-gray-500 font-medium">Placed on {new Date(order.created_at).toLocaleString()} • {order.delivery_type === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}</p>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            {isExpanded ? "Hide Items" : `View ${itemCount} Items`}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Dynamic ETA / Pickup Message */}
      {etaMessage && (
        <div className="bg-green-50/80 px-5 py-3 border-b border-green-100 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
          <span className="text-sm font-bold text-green-800">{etaMessage}</span>
        </div>
      )}

      {/* Expandable Items List */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 bg-white">
          <div className="space-y-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  {item.products?.image_url ? (
                    <img src={item.products.image_url} alt={item.products.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm line-clamp-1">{item.products?.name || "Product Unavailable"}</p>
                  <p className="text-xs text-gray-500">{item.products?.unit}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900 text-sm">₹{item.price_at_time}</p>
                  <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
