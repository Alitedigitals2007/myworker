"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucidePlus, LucideSearch, LucideDollarSign, LucideCheck, LucideX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataCard } from "@/components/shared/data-card";
import { TableSkeleton } from "@/components/shared/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Payment {
  id: string;
  worker: { fullName: string; workerId: string };
  amount: number;
  paymentMethod: string;
  reference: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch("/api/payments");
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
        }
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        setPayments([
          { id: "1", worker: { fullName: "Sarah Johnson", workerId: "MW-12345678" }, amount: 25000, paymentMethod: "Bank Transfer", reference: "TRF-001", status: "APPROVED", notes: "Monthly commission", createdAt: new Date().toISOString() },
          { id: "2", worker: { fullName: "John Smith", workerId: "MW-23456789" }, amount: 15000, paymentMethod: "Cash", reference: null, status: "PENDING", notes: "Bonus payment", createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: "3", worker: { fullName: "Emily Davis", workerId: "MW-34567890" }, amount: 35000, paymentMethod: "POS", reference: "POS-123", status: "REJECTED", notes: "Payment rejected - wrong account", createdAt: new Date(Date.now() - 172800000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.worker.workerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge variant="warning">Pending</Badge>;
      case "APPROVED": return <Badge variant="success">Approved</Badge>;
      case "REJECTED": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const totalPaid = payments.filter(p => p.status === "APPROVED").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage worker payments and disbursements
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <LucidePlus size={18} className="mr-2" />
                Initiate Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Initiate Payment</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Worker</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select worker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Sarah Johnson (MW-12345678)</SelectItem>
                      <SelectItem value="2">John Smith (MW-23456789)</SelectItem>
                      <SelectItem value="3">Emily Davis (MW-34567890)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Amount</label>
                  <Input type="number" placeholder="25000" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Payment Method</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="pos">POS</SelectItem>
                      <SelectItem value="ussd">USSD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Reference</label>
                  <Input placeholder="Transaction reference" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Notes</label>
                  <textarea className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="Payment notes..." />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Initiate Payment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DataCard
            title="Total Paid"
            value={formatCurrency(totalPaid)}
            icon={<LucideCheck size={20} className="text-green-500" />}
            loading={loading}
            formatFn={formatCurrency}
          />
          <DataCard
            title="Pending"
            value={formatCurrency(totalPending)}
            icon={<LucideDollarSign size={20} className="text-amber-500" />}
            loading={loading}
            formatFn={formatCurrency}
          />
          <DataCard
            title="This Month"
            value={formatCurrency(totalPaid)}
            icon={<LucideDollarSign size={20} className="text-blue-500" />}
            loading={loading}
            formatFn={formatCurrency}
          />
          <DataCard
            title="Transactions"
            value={payments.length}
            icon={<LucideDollarSign size={20} className="text-purple-500" />}
            loading={loading}
          />
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <LucideSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Payments List */}
        <Card className="p-4 md:p-6">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <LucideDollarSign size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-sm text-muted-foreground">Get started by initiating a payment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Worker</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Reference</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{payment.worker.fullName}</p>
                          <p className="text-sm text-muted-foreground">{payment.worker.workerId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell font-mono text-sm">
                        {payment.reference || "-"}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(payment.createdAt, 'datetime')}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}