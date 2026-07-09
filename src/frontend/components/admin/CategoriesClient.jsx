"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Package, Save, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { 
  addCategoryAction, 
  updateCategoryAction, 
  deleteCategoryAction,
  quickUpdateProductAction,
  quickDeleteProductAction
} from "@/backend/actions/admin-categories";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CategoriesClient({ categories }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [categoryProducts, setCategoryProducts] = useState([]);
  
  // Product Edit State inside Modal
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductName, setEditProductName] = useState("");
  const [editProductStock, setEditProductStock] = useState("");
  const [isProductActionLoading, setIsProductActionLoading] = useState(false);

  // Filter Data
  const filteredCategories = categories.filter(c => 
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setCategoryId("");
    setName("");
    setCategoryProducts([]);
    setIsEditing(false);
    setEditingProductId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setCategoryId(cat.id);
    setName(cat.name);
    setCategoryProducts(cat.products || []);
    setIsEditing(true);
    setEditingProductId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    // Status is always active implicitly or ignored now

    if (isEditing) {
      formData.append("id", categoryId);
      const res = await updateCategoryAction(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Category updated successfully!");
        setIsModalOpen(false);
      }
    } else {
      const res = await addCategoryAction(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Category added successfully!");
        setIsModalOpen(false);
      }
    }
    
    setIsLoading(false);
  };

  const handleDelete = async (id, catName) => {
    if (!confirm(`Are you sure you want to delete "${catName}"?`)) return;
    
    const formData = new FormData();
    formData.append("id", id);
    const res = await deleteCategoryAction(formData);
    
    if (res.error) toast.error(res.error);
    else toast.success("Category deleted!");
  };

  // --- Product Quick Actions ---
  const handleStartProductEdit = (product) => {
    setEditingProductId(product.id);
    setEditProductName(product.name);
    setEditProductStock(product.stock);
  };

  const handleCancelProductEdit = () => {
    setEditingProductId(null);
  };

  const handleSaveProduct = async (productId) => {
    setIsProductActionLoading(true);
    const formData = new FormData();
    formData.append("id", productId);
    formData.append("name", editProductName);
    formData.append("stock", editProductStock);

    const res = await quickUpdateProductAction(formData);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Product updated!");
      // Update local state so UI reflects immediately without closing modal
      setCategoryProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, name: editProductName, stock: parseInt(editProductStock) } : p)
      );
      setEditingProductId(null);
    }
    setIsProductActionLoading(false);
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`Are you sure you want to remove "${productName}"?`)) return;
    
    setIsProductActionLoading(true);
    const formData = new FormData();
    formData.append("id", productId);
    
    const res = await quickDeleteProductAction(formData);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Product deleted!");
      setCategoryProducts(prev => prev.filter(p => p.id !== productId));
    }
    setIsProductActionLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Categories & Inventory</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage categories and quickly update item stock.</p>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all rounded-full px-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full shadow-sm rounded-xl overflow-hidden">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        <Input 
          placeholder="Search categories by name..." 
          className="pl-12 py-6 bg-white border-gray-200 text-lg w-full focus-visible:ring-green-500" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="font-semibold text-gray-700 py-4 pl-6">Category</TableHead>
              <TableHead className="font-semibold text-gray-700">Total Items</TableHead>
              <TableHead className="font-semibold text-gray-700">Total Stock</TableHead>
              <TableHead className="font-semibold text-gray-700">Added On</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((cat) => (
              <TableRow key={cat.id} className="hover:bg-green-50/30 transition-colors group">
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-gray-900 text-base">{cat.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-gray-700">{cat.itemsCount} products</span>
                </TableCell>
                <TableCell>
                  <span className={`font-bold ${cat.totalStock > 0 ? "text-green-600" : "text-red-500"}`}>
                    {cat.totalStock} units
                  </span>
                </TableCell>
                <TableCell className="text-gray-500 text-sm font-medium">
                  {new Date(cat.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenEdit(cat)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">No categories found.</p>
                    <p className="text-sm">Try adjusting your search or add a new category.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {isEditing ? "Edit Category & Items" : "Add New Category"}
              </DialogTitle>
              <DialogDescription className="text-green-100 mt-1">
                {isEditing ? "Update category name or manage its products below." : "Create a new product category for your store."}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
            {/* Category Form */}
            <form id="categoryForm" onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900 font-bold">Category Name</Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dairy Products" 
                  className="w-full border-gray-300 focus-visible:ring-green-500 rounded-xl"
                  required
                />
              </div>
            </form>

            {/* Products List (Only when Editing) */}
            {isEditing && (
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 flex items-center justify-between">
                  Products in this Category
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{categoryProducts.length} items</span>
                </h3>
                
                {categoryProducts.length > 0 ? (
                  <div className="space-y-2">
                    {categoryProducts.map(product => (
                      <div key={product.id} className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-green-300 transition-colors">
                        
                        {/* If this product is being edited */}
                        {editingProductId === product.id ? (
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Input 
                              value={editProductName} 
                              onChange={(e) => setEditProductName(e.target.value)} 
                              className="sm:col-span-2 h-8 text-sm"
                              placeholder="Product Name"
                            />
                            <div className="flex items-center gap-2">
                              <Input 
                                type="number" 
                                value={editProductStock} 
                                onChange={(e) => setEditProductStock(e.target.value)} 
                                className="h-8 text-sm w-20"
                                placeholder="Stock"
                              />
                              <div className="flex gap-1 ml-auto">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 text-green-600 hover:bg-green-100 rounded-full"
                                  onClick={() => handleSaveProduct(product.id)}
                                  disabled={isProductActionLoading}
                                >
                                  {isProductActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 text-gray-500 hover:bg-gray-200 rounded-full"
                                  onClick={handleCancelProductEdit}
                                  disabled={isProductActionLoading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Stock: <span className="font-bold text-gray-700">{product.stock}</span></p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-full"
                                onClick={() => handleStartProductEdit(product)}
                                disabled={isProductActionLoading}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-full"
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                disabled={isProductActionLoading}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 text-center shadow-sm">
                    <p className="text-gray-500 text-sm">No products found in this category.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 bg-white border-t border-gray-100 shrink-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="rounded-full font-semibold border-gray-200 hover:bg-gray-50"
            >
              Close
            </Button>
            <Button 
              type="submit" 
              form="categoryForm"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full font-bold px-6 shadow-md"
            >
              {isLoading ? "Saving..." : (isEditing ? "Save Category Name" : "Create Category")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
