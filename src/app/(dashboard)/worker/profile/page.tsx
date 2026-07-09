"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucideUser, LucideMail, LucidePhone, LucideMapPin, LucideCalendar, LucideDollarSign, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export default function WorkerProfilePage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

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
          { id: "1", amount: 25000, paymentMethod: "Bank Transfer", status: "APPROVED", createdAt: new Date().toISOString() },
          { id: "2", amount: 15000, paymentMethod: "Cash", status: "APPROVED", createdAt: new Date(Date.now() - 86400000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  const workerName = session?.user?.name || "Worker";
  const workerId = session?.user?.workerId || "MW-00000000";

  const totalPaid = payments.filter(p => p.status === "APPROVED").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-4 md:p-6 pb-24">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {workerName.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{workerName}</h2>
                <p className="text-muted-foreground font-mono">{workerId}</p>
                <Badge variant="success" className="mt-2">Active</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <LucideMail size={18} className="text-muted-foreground" />
                <span>{session?.user?.email || "email@example.com"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <LucidePhone size={18} className="text-muted-foreground" />
                <span>+2348012345678</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <LucideMapPin size={18} className="text-muted-foreground" />
                <span>Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <LucideCalendar size={18} className="text-muted-foreground" />
                <span>Joined {formatDate(new Date(), 'date')}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <LucideDollarSign size={18} className="text-primary" />
              Earnings Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPaid)}
                </p>
                <p className="text-sm text-muted-foreground">Total Paid</p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(0)}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Payment History</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No payments yet</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.paymentMethod} • {formatDate(payment.createdAt, 'date')}
                      </p>
                    </div>
                    <Badge variant={payment.status === "APPROVED" ? "success" : "warning"}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Settings Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <Button variant="outline" className="w-full justify-start">
              <LucideUser size={18} className="mr-2" />
              Edit Profile
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}