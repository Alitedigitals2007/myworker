"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucideCheck, LucideX, LucideEye, LucideSearch, LucideFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableSkeleton } from "@/components/shared/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Sale {
  id: string;
  worker: { fullName: string };
  customerName: string;
  customerPhone: string | null;
  totalAmount: number;
  discount: number;
  status: string;
  paymentMethod: string | null;
  notes: string | null;
  items: { product: { name: string }; quantity: number; unitPrice: number }[];
  createdAt: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch(`/api/sales?status=${activeTab === "all" ? "" : activeTab}`);
        if (res.ok) {
          const data = await res.json();
          setSales(data.sales || []);
        }
      } catch (error) {
        console.error("Failed to fetch sales:", error);
        setSales([
          { id: "1", worker: { fullName: "Sarah Johnson" }, customerName: "John Doe", customerPhone: "+2348012345678", totalAmount: 150000, discount: 0, status: "PENDING", paymentMethod: "Bank Transfer", notes: "Regular customer", items: [{ product: { name: "iPhone 15" }, quantity: 1, unitPrice: 150000 }], createdAt: new Date().toISOString() },
          { id: "2", worker: { fullName: "John Smith" }, customerName: "Jane Doe", customerPhone: "+2348012345679", totalAmount: 85000, discount: 5000, status: "APPROVED", paymentMethod: "Cash", notes: null, items: [{ product: { name: "Air Max 90" }, quantity: 1, unitPrice: 85000 }], createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: "3", worker: { fullName: "Emily Davis" }, customerName: "Bob Smith", customerPhone: null, totalAmount: 450000, discount: 20000, status: "REJECTED", paymentMethod: "POS", notes: "Customer rejected", items: [{ product: { name: "Samsung TV" }, quantity: 1, unitPrice: 450000 }], createdAt: new Date(Date.now() - 172800000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, [activeTab]);

  const handleApprove = async (saleId: string) => {
    try {
      const res = await fetch(`/api/sales/${saleId}/approve`, { method: "POST" });
      if (res.ok) {
        setSales(sales.map(s => s.id === saleId ? { ...s, status: "APPROVED" } : s));
      }
    } catch (error) {
      console.error("Failed to approve sale:", error);
    }
  };

  const handleReject = async (saleId: string, reason: string) => {
    try {
      const res = await fetch(`/api/sales/${saleId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setSales(sales.map(s => s.id === saleId ? { ...s, status: "REJECTED" } : s));
      }
    } catch (error) {
      console.error("Failed to reject sale:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "APPROVED":
        return <Badge variant="success">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.worker.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Sales Review</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve pending sales
            </p>
          </div>
        </div>

        {/* Filters & Tabs */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-64">
              <LucideSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Sales List */}
        <Card className="p-4 md:p-6">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <LucideFilter size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sales found</h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === "pending"
                  ? "No pending sales to review"
                  : `No ${activeTab} sales`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Worker</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale, index) => (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{sale.customerName}</p>
                          <p className="text-sm text-muted-foreground">{sale.customerPhone || "No phone"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">{sale.worker.fullName}</td>
                      <td className="py-3 px-4 font-semibold">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(sale.createdAt, 'datetime')}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(sale.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedSale(sale)}
                          >
                            <LucideEye size={18} />
                          </Button>
                          {sale.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprove(sale.id)}
                              >
                                <LucideCheck size={18} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleReject(sale.id, "Rejected by admin")}
                              >
                                <LucideX size={18} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Sale Detail Dialog */}
        {selectedSale && (
          <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Sale Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedSale.customerName}</p>
                    <p className="text-sm">{selectedSale.customerPhone || "No phone"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Worker</p>
                    <p className="font-medium">{selectedSale.worker.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(selectedSale.createdAt, 'datetime')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedSale.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{selectedSale.paymentMethod || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-bold text-lg">{formatCurrency(selectedSale.totalAmount)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <div className="border rounded-lg divide-y">
                    {selectedSale.items.map((item, i) => (
                      <div key={i} className="p-3 flex justify-between">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSale.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{selectedSale.notes}</p>
                  </div>
                )}

                {selectedSale.status === "PENDING" && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        handleReject(selectedSale.id, "Rejected by admin");
                        setSelectedSale(null);
                      }}
                    >
                      <LucideX size={18} className="mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        handleApprove(selectedSale.id);
                        setSelectedSale(null);
                      }}
                    >
                      <LucideCheck size={18} className="mr-2" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}