"use client";

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

const mockOrders = [
  { id: "ORD-9281", customer: "Rahul Sharma", role: "retail", total: 450, type: "home_delivery", status: "placed", date: "2023-10-24 10:30 AM" },
  { id: "ORD-9282", customer: "Gupta Traders", role: "shopkeeper", total: 12400, type: "store_pickup", status: "preparing", date: "2023-10-24 11:15 AM" },
  { id: "ORD-9283", customer: "Anjali Verma", role: "retail", total: 120, type: "home_delivery", status: "out_for_delivery", date: "2023-10-24 12:45 PM" },
  { id: "ORD-9284", customer: "Sharma Stores", role: "shopkeeper", total: 8900, type: "store_pickup", status: "ready_for_pickup", date: "2023-10-24 02:20 PM" },
  { id: "ORD-9285", customer: "Vikram Singh", role: "retail", total: 320, type: "home_delivery", status: "delivered", date: "2023-10-24 04:10 PM" },
];

const statusStyles = {
  placed: "bg-blue-50 text-blue-700 border-blue-200",
  preparing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ready_for_pickup: "bg-orange-50 text-orange-700 border-orange-200",
  out_for_delivery: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = mockOrders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <TableCell className="font-bold text-gray-900">{order.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{order.customer}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">{order.role}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-500">{order.date}</TableCell>
                <TableCell className="font-bold text-gray-900">₹{order.total}</TableCell>
                <TableCell>
                  {order.type === 'home_delivery' ? (
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">Home Delivery</span>
                  ) : (
                    <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">Store Pickup</span>
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
                      className="text-xs border rounded p-1 bg-gray-50 text-gray-700 outline-none focus:border-green-500"
                      defaultValue={order.status}
                    >
                      <option value="placed">Placed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
