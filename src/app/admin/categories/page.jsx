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
import { Plus, Search, Edit, Trash2 } from "lucide-react";

const mockCategories = [
  { id: 1, name: "Grocery", itemsCount: 45, status: "Active" },
  { id: 2, name: "Beverages", itemsCount: 12, status: "Active" },
  { id: 3, name: "Personal Care", itemsCount: 28, status: "Active" },
  { id: 4, name: "Household", itemsCount: 15, status: "Active" },
  { id: 5, name: "Snacks", itemsCount: 30, status: "Active" },
  { id: 6, name: "Dairy", itemsCount: 8, status: "Disabled" },
];

export default function AdminCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = mockCategories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-sm text-gray-500 mt-1">Organize products into intuitive categories.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="flex items-center w-full max-w-sm space-x-2">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search categories..." 
            className="pl-9 bg-white" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden max-w-4xl">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Total Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-bold text-gray-900">{cat.name}</TableCell>
                <TableCell>{cat.itemsCount} items</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    cat.status === "Active" ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500"
                  }>
                    {cat.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
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
