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
import { Plus, Search, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addProductAction, updateProductAction, deleteProductAction } from "@/backend/actions/admin-products";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

const getSquareImageBlob = async (file) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;
      
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
      
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("Canvas to Blob failed"));
        const newFile = new File([blob], file.name, { type: "image/jpeg" });
        resolve(newFile);
      }, "image/jpeg", 1);
    };
    img.onerror = (error) => reject(error);
  });
};

export default function ProductsClient({ initialProducts, categories, filterLowStock = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(filterLowStock);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedRetailStatus, setSelectedRetailStatus] = useState("true");
  const [selectedWholesaleStatus, setSelectedWholesaleStatus] = useState("true");

  const filteredProducts = initialProducts.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = showLowStockOnly ? (p.stock <= lowStockThreshold) : true;
    return matchesSearch && matchesLowStock;
  });

  if (showLowStockOnly) {
    filteredProducts.sort((a, b) => (a.stock || 0) - (b.stock || 0));
  }

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setSelectedCategoryId("");
    setSelectedRetailStatus("true");
    setSelectedWholesaleStatus("true");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setSelectedCategoryId(product.category_id || "");
    setSelectedRetailStatus(product.retail_status !== false ? "true" : "false");
    setSelectedWholesaleStatus(product.wholesale_status !== false ? "true" : "false");
    
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    
    const imageFile = formData.get("image");
    if (imageFile && imageFile.size > 0) {
      try {
        toast.info("Preparing & compressing image...", { id: "img-compress" });
        
        // 1. Attempt to crop to perfect square
        let fileToCompress = imageFile;
        try {
          fileToCompress = await getSquareImageBlob(imageFile);
        } catch (squareErr) {
          console.warn("Squaring failed, proceeding with original dimensions:", squareErr);
        }
        
        // 2. Compress to ~30KB (Guaranteed step)
        const options = {
          maxSizeMB: 0.03,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(fileToCompress, options);
        
        formData.set("image", compressedFile, compressedFile.name);
        toast.dismiss("img-compress");
      } catch (error) {
        console.error("Image processing error:", error);
        toast.error("Failed to process image. Proceeding with original.", { id: "img-compress" });
      }
    }
    
    if (editingProduct) {
      formData.append("id", editingProduct.id);
      const res = await updateProductAction(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Product updated successfully!");
        setIsFormOpen(false);
      }
    } else {
      const res = await addProductAction(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Product added successfully!");
        setIsFormOpen(false);
      }
    }
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const formData = new FormData();
    formData.append("id", id);
    const res = await deleteProductAction(formData);
    if (res.error) toast.error(res.error);
    else toast.success("Product deleted successfully!");
  };

  if (isFormOpen) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details below to update your inventory.</p>
          </div>
          <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="text-gray-500">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Product Name</label>
            <Input name="name" defaultValue={editingProduct?.name || ""} placeholder="e.g. Aashirvaad Atta" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Product Image</label>
            {editingProduct?.image_url && (
              <div className="mb-2">
                <img src={editingProduct.image_url} alt="Current product" className="w-20 h-20 object-cover rounded-md border" />
                <input type="hidden" name="existing_image_url" value={editingProduct.image_url} />
                <p className="text-xs text-gray-500 mt-1">Upload a new image to replace the current one.</p>
              </div>
            )}
            <Input type="file" name="image" accept="image/*" className="cursor-pointer" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Category</label>
              <Select name="category_id" value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  {selectedCategoryId && selectedCategoryId !== "none" ? (categories.find(c => c.id === selectedCategoryId)?.name || "Select Category") : <span className="text-gray-500">Uncategorized (No Category)</span>}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-gray-500 italic">Uncategorized (No Category)</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Current Stock</label>
              <Input type="number" name="stock" defaultValue={editingProduct?.stock || "100"} required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Retail Unit</label>
              <Input name="unit" defaultValue={editingProduct?.unit || ""} placeholder="e.g. 1 piece" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Wholesale Unit (Optional)</label>
              <Input name="shopkeeper_unit" defaultValue={editingProduct?.shopkeeper_unit || ""} placeholder="e.g. 1 Box (Leave empty if same)" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Retail Price (₹)</label>
              <Input type="number" step="0.01" name="retail_price" defaultValue={editingProduct?.retail_price} required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Wholesale Price (₹)</label>
              <Input type="number" step="0.01" name="wholesale_price" defaultValue={editingProduct?.shopkeeper_price} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Retailer Limit (Optional)</label>
              <Input type="number" name="retail_limit" defaultValue={editingProduct?.retail_limit > 0 ? editingProduct.retail_limit : ""} placeholder="Leave empty for No Limit" min="1" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Wholesaler Limit (Optional)</label>
              <Input type="number" name="shopkeeper_limit" defaultValue={editingProduct?.shopkeeper_limit > 0 ? editingProduct.shopkeeper_limit : ""} placeholder="Leave empty for No Limit" min="1" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Retail Status</label>
              <Select name="retail_status" value={selectedRetailStatus} onValueChange={setSelectedRetailStatus}>
                <SelectTrigger>
                  {selectedRetailStatus === "true" ? "Active (Visible)" : "Inactive (Hidden)"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active (Visible)</SelectItem>
                  <SelectItem value="false">Inactive (Hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Wholesale Status</label>
              <Select name="wholesale_status" value={selectedWholesaleStatus} onValueChange={setSelectedWholesaleStatus}>
                <SelectTrigger>
                  {selectedWholesaleStatus === "true" ? "Active (Visible)" : "Inactive (Hidden)"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active (Visible)</SelectItem>
                  <SelectItem value="false">Inactive (Hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store&apos;s inventory, pricing, and limits.</p>
        </div>
        <div className="flex justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <Button 
            variant={showLowStockOnly ? "destructive" : "outline"} 
            className={showLowStockOnly ? "w-[48%] sm:w-auto text-sm px-1 sm:px-4 shrink-0 overflow-hidden" : "bg-white w-[48%] sm:w-auto text-sm px-1 sm:px-4 shrink-0 overflow-hidden"}
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          >
            {showLowStockOnly ? (
              <div className="flex items-center">
                Clear (≤
                <input
                  type="number"
                  className="w-8 bg-transparent border-b border-white outline-none text-center mx-0.5 appearance-none"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                />
                )
              </div>
            ) : (
              <div className="flex items-center">
                Low Stock (≤
                <input
                  type="number"
                  className="w-8 bg-transparent border-b border-gray-400 outline-none text-center mx-0.5 appearance-none"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                />
                )
              </div>
            )}
          </Button>
          <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm w-[48%] sm:w-auto text-sm px-2 sm:px-4 shrink-0 overflow-hidden">
            <Plus className="mr-1 h-4 w-4 shrink-0" /> <span className="truncate">Add Product</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center w-full max-w-sm space-x-2">
        <div className="relative w-full shadow-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search products..." 
            className="pl-9 bg-white border-gray-200" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 border-b">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Product Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Category</TableHead>
              <TableHead className="font-semibold text-gray-700">Unit</TableHead>
              <TableHead className="font-semibold text-gray-700">Stock</TableHead>
              <TableHead className="font-semibold text-gray-700">Retail Price</TableHead>
              <TableHead className="font-semibold text-gray-700">Wholesale Price</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                <TableCell className="text-gray-600">{product.categories?.name || "Uncategorized"}</TableCell>
                <TableCell className="text-gray-600">
                  {product.shopkeeper_unit && product.shopkeeper_unit !== product.unit ? (
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span><span className="font-semibold">R:</span> {product.unit}</span>
                      <span><span className="font-semibold">W:</span> {product.shopkeeper_unit}</span>
                    </div>
                  ) : (
                    product.unit
                  )}
                </TableCell>
                <TableCell>
                  <span className={`font-semibold px-2 py-1 rounded-md text-xs ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-800'}`}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 whitespace-nowrap">₹{product.retail_price}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap border ${product.retail_limit > 0 ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                      (Limit: {product.retail_limit > 0 ? product.retail_limit : "∞"})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 whitespace-nowrap">{product.shopkeeper_price ? `₹${product.shopkeeper_price}` : '-'}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap border ${product.shopkeeper_limit > 0 ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                      (Limit: {product.shopkeeper_limit > 0 ? product.shopkeeper_limit : "∞"})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className={
                      product.retail_status !== false ? "border-green-200 bg-green-50 text-green-700 font-semibold text-[10px]" : "border-red-200 bg-red-50 text-red-700 font-semibold text-[10px]"
                    }>
                      R: {product.retail_status !== false ? "Active" : "Hidden"}
                    </Badge>
                    <Badge variant="outline" className={
                      product.wholesale_status !== false ? "border-blue-200 bg-blue-50 text-blue-700 font-semibold text-[10px]" : "border-red-200 bg-red-50 text-red-700 font-semibold text-[10px]"
                    }>
                      W: {product.wholesale_status !== false ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors" onClick={() => handleOpenEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-900">No products found</p>
                    <p className="text-sm">Click &quot;Add New Product&quot; to create your first item.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
