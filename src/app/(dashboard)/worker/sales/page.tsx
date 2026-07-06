"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LucidePlus, LucideEye, LucideShoppingCart, LucideClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Sale {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  items: { product: { name: string }; quantity: number }[];
  createdAt: string;
}

export default function WorkerSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch("/api/sales");
        if (res.ok) {
          const data = await res.json();
          setSales(data.sales || []);
        }
      } catch (error) {
        console.error("Failed to fetch sales:", error);
        setSales([
          { id: "1", customerName: "John Doe", totalAmount: 150000, status: "PENDING", items: [{ product: { name: "iPhone 15" }, quantity: 1 }], createdAt: new Date().toISOString() },
          { id: "2", customerName: "Jane Smith", totalAmount: 85000, status: "APPROVED", items: [{ product: { name: "Air Max 90" }, quantity: 1 }], createdAt: new Date(Date.now() - 86400000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge variant="warning">Pending</Badge>;
      case "APPROVED": return <Badge variant="success">Approved</Badge>;
      case "REJECTED": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Sales</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your sales and commissions
            </p>
          </div>
          <Link href="/worker/sales/new">
            <Button>
              <LucidePlus size={18} className="mr-2" />
              New Sale
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">{sales.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-amber-500">
              {sales.filter(s => s.status === "PENDING").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-500">
              {sales.filter(s => s.status === "APPROVED").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">
              {formatCurrency(sales.reduce((sum, s) => sum + s.totalAmount, 0))}
            </p>
          </Card>
        </div>

        {/* Sales List */}
        <Card className="p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-12">
              <LucideShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start making sales to track your performance</p>
              <Link href="/worker/sales/new">
                <Button>
                  <LucidePlus size={18} className="mr-2" />
                  Create First Sale
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale, index) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LucideShoppingCart size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{sale.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.items.map(i => i.product.name).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(sale.totalAmount)}</p>
                    <div className="flex items-center gap-2">
                      <LucideClock size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(sale.createdAt, 'datetime')}
                      </span>
                    </div>
                    <div className="mt-1">{getStatusBadge(sale.status)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}