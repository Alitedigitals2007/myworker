"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucidePlus, LucideSearch, LucidePackage, LucideGrid, LucideList, LucideEdit, LucideTrash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataCard } from "@/components/shared/data-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  attributes?: Record<string, unknown>;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  sellingPrice: number;
  costPrice: number;
  description?: string;
  commissionType?: string;
  commissionValue?: number;
  images: string[];
  status: string;
  variants: ProductVariant[];
  _count?: { variants: number };
}

const categories = ["Electronics", "Fashion", "Home", "Beauty", "Sports", "Other"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Electronics",
    sku: "",
    sellingPrice: "",
    costPrice: "",
    description: "",
    commissionType: "PERCENTAGE",
    commissionValue: "10",
    status: "ACTIVE"
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([
        { id: "1", name: "iPhone 15 Pro Max", category: "Electronics", sku: "IP-PM-001", sellingPrice: 1200000, costPrice: 1050000, status: "ACTIVE", images: [], variants: [{ id: "1", name: "256GB", stock: 50, price: 1200000, sku: "IP-PM-256" }, { id: "2", name: "512GB", stock: 25, price: 1400000, sku: "IP-PM-512" }] },
        { id: "2", name: "Nike Air Max 90", category: "Fashion", sku: "NK-AM90", sellingPrice: 85000, costPrice: 55000, status: "ACTIVE", images: [], variants: [{ id: "1", name: "Black 42", stock: 15, price: 85000, sku: "NK-AM90-B42" }, { id: "2", name: "White 41", stock: 8, price: 85000, sku: "NK-AM90-W41" }] },
        { id: "3", name: "Samsung 55\" Smart TV", category: "Electronics", sku: "SS-TV55", sellingPrice: 450000, costPrice: 380000, status: "ACTIVE", images: [], variants: [] },
        { id: "4", name: "Dyson V15 Vacuum", category: "Home", sku: "DY-V15", sellingPrice: 280000, costPrice: 220000, status: "ACTIVE", images: [], variants: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: Product) => {
    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    if (totalStock === 0) return { label: "Out of Stock", color: "destructive" };
    if (totalStock < 10) return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      sku: product.sku,
      sellingPrice: product.sellingPrice.toString(),
      costPrice: product.costPrice.toString(),
      description: product.description || "",
      commissionType: product.commissionType || "PERCENTAGE",
      commissionValue: product.commissionValue?.toString() || "10",
      status: product.status
    });
    setVariants([...product.variants]);
    setShowEditDialog(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products?id=${deletingProduct.id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== deletingProduct.id));
        toast.success("Product deleted successfully");
        setShowDeleteDialog(false);
      } else {
        toast.error("Failed to delete product");
      }
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setIsSubmitting(false);
      setDeletingProduct(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSubmitting(true);
    try {
      const payload = {
        id: editingProduct.id,
        name: formData.name,
        category: formData.category,
        sku: formData.sku,
        sellingPrice: parseFloat(formData.sellingPrice),
        costPrice: parseFloat(formData.costPrice),
        description: formData.description,
        commissionType: formData.commissionType,
        commissionValue: parseFloat(formData.commissionValue),
        status: formData.status,
        variants: variants.map(v => ({
          name: v.name,
          sku: v.sku,
          stock: v.stock,
          price: v.price,
          attributes: v.attributes || {}
        }))
      };

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map(p => p.id === editingProduct.id ? { ...updated, variants: updated.variants || [] } : p));
        toast.success("Product updated successfully");
        setShowEditDialog(false);
        setEditingProduct(null);
      } else {
        toast.error("Failed to update product");
      }
    } catch {
      toast.error("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        sku: formData.sku,
        sellingPrice: parseFloat(formData.sellingPrice),
        costPrice: parseFloat(formData.costPrice),
        description: formData.description,
        commissionType: formData.commissionType,
        commissionValue: parseFloat(formData.commissionValue),
        status: formData.status,
        variants: variants.map(v => ({
          name: v.name,
          sku: v.sku,
          stock: v.stock,
          price: v.price,
          attributes: v.attributes || {}
        }))
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newProduct = await res.json();
        setProducts([{ ...newProduct, variants: newProduct.variants || [] }, ...products]);
        toast.success("Product added successfully");
        setShowAddDialog(false);
        resetForm();
      } else {
        toast.error("Failed to add product");
      }
    } catch {
      toast.error("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Electronics",
      sku: "",
      sellingPrice: "",
      costPrice: "",
      description: "",
      commissionType: "PERCENTAGE",
      commissionValue: "10",
      status: "ACTIVE"
    });
    setVariants([]);
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your inventory and product catalog
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <LucidePlus size={18} className="mr-2" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DataCard
            title="Total Products"
            value={products.length}
            icon={<LucidePackage size={20} className="text-blue-500" />}
            loading={loading}
          />
          <DataCard
            title="In Stock"
            value={products.filter(p => p.variants.some(v => v.stock > 10)).length}
            icon={<LucidePackage size={20} className="text-green-500" />}
            loading={loading}
          />
          <DataCard
            title="Low Stock"
            value={products.filter(p => p.variants.some(v => v.stock <= 10 && v.stock > 0)).length}
            icon={<LucidePackage size={20} className="text-amber-500" />}
            loading={loading}
          />
          <DataCard
            title="Out of Stock"
            value={products.filter(p => p.variants.every(v => v.stock === 0)).length}
            icon={<LucidePackage size={20} className="text-red-500" />}
            loading={loading}
          />
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <LucideSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex gap-2 overflow-x-auto">
                <Button
                  variant={categoryFilter === "All" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("All")}
                  className="whitespace-nowrap"
                >
                  All
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(cat)}
                    className="whitespace-nowrap"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <div className="flex border rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-accent" : ""}`}
                >
                  <LucideGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-accent" : ""}`}
                >
                  <LucideList size={18} />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="aspect-square bg-muted rounded-xl mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <LucidePackage size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== "All"
                ? "Try adjusting your search or filter"
                : "Get started by adding your first product"}
            </p>
            <Button onClick={openAddDialog}>
              <LucidePlus size={18} className="mr-2" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
            {filteredProducts.map((product, index) => {
              const stockStatus = getStockStatus(product);
              return (
                <motion.Card
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                >
                  {viewMode === "grid" ? (
                    <>
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                        <LucidePackage size={48} className="text-gray-400" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                          </div>
                          <Badge variant={stockStatus.color as "success" | "warning" | "destructive"}>
                            {stockStatus.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold">₦{product.sellingPrice.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Cost: ₦{product.costPrice.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                              <LucideEdit size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product)}>
                              <LucideTrash2 size={16} className="text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                        <LucidePackage size={24} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          <Badge variant={stockStatus.color as "success" | "warning" | "destructive"}>
                            {stockStatus.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{product.category} • {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₦{product.sellingPrice.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{product.variants.length} variants</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                          <LucideEdit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product)}>
                          <LucideTrash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.Card>
              );
            })}
          </div>
        )}

        {/* Add Product Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Product Name</label>
                  <Input
                    placeholder="iPhone 15 Pro Max"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">SKU</label>
                  <Input
                    placeholder="IP-PM-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Selling Price</label>
                  <Input
                    type="number"
                    placeholder="1200000"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Cost Price</label>
                  <Input
                    type="number"
                    placeholder="1050000"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Commission %</label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.commissionValue}
                    onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Status</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <textarea
                    className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    placeholder="Product description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Product"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Product Name</label>
                  <Input
                    placeholder="iPhone 15 Pro Max"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">SKU</label>
                  <Input
                    placeholder="IP-PM-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Selling Price</label>
                  <Input
                    type="number"
                    placeholder="1200000"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Cost Price</label>
                  <Input
                    type="number"
                    placeholder="1050000"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Commission %</label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.commissionValue}
                    onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Status</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <textarea
                    className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    placeholder="Product description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}