"use client";

import Link from "next/link";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Filter } from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/backend/actions/order";

const statusStyles = {
  placed: "bg-blue-50 text-blue-700 border-blue-200",
  preparing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ready_for_pickup: "bg-orange-50 text-orange-700 border-orange-200",
  out_for_delivery: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OrdersClient({ initialOrders }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const filteredOrders = initialOrders.filter(o => 
    (o.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.users?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (orderId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;

    let etaMessage = "";
    if (newStatus === "out_for_delivery") {
      etaMessage = prompt("Enter ETA (e.g., 'Reaching in 20 mins'):") || "";
    } else if (newStatus === "ready_for_pickup") {
      etaMessage = prompt("Enter pickup instructions (e.g., 'Your order is ready to be picked up!'):") || "";
    }

    setLoadingId(orderId);
    const formData = new FormData();
    formData.append("id", orderId);
    formData.append("status", newStatus);
    if (etaMessage) formData.append("etaMessage", etaMessage);

    const res = await updateOrderStatusAction(formData);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Order status updated!");
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all customer and wholesale orders.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search by Order ID or Customer..." 
            className="pl-9 bg-white" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-white">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-bold text-gray-900 uppercase">
                  {order.id.split('-')[0]}...
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{order.users?.full_name || "Unknown"}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">{order.users?.role === 'retail' ? 'Retail' : 'Wholesale'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleString()}</TableCell>
                <TableCell className="font-bold text-gray-900">
                  ₹{Number(order.total_amount) + (order.delivery_type === 'home_delivery' ? 40 : 0)}
                </TableCell>
                <TableCell>
                  {order.delivery_type === 'home_delivery' ? (
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">Home Delivery</span>
                  ) : (
                    <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded">Store Pickup</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${statusStyles[order.status]} capitalize`}>
                    {order.status.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 items-center">
                    <select 
                      className="text-xs border rounded p-1 bg-gray-50 text-gray-700 outline-none focus:border-green-500 disabled:opacity-50"
                      value={order.status}
                      disabled={loadingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, order.status, e.target.value)}
                    >
                      <option value="placed">Placed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Link href={`/orders/${order.id}/bill`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50" title="View Bill">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
