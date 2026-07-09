"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  LucideTrendingUp,
  LucideDollarSign,
  LucideShoppingCart,
  LucideMessageSquare,
  LucideMegaphone,
  LucideClock,
  LucideArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataCard } from "@/components/shared/data-card";
import Link from "next/link";

interface WorkerStats {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalEarnings: number;
  pendingCommission: number;
  approvedCommission: number;
  paidCommission: number;
  totalSales: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
}

export default function WorkerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<WorkerStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, announcementsRes] = await Promise.all([
          fetch("/api/analytics/worker"),
          fetch("/api/announcements/recent")
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }

        if (announcementsRes.ok) {
          const data = await announcementsRes.json();
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error("Failed to fetch worker data:", error);
        setStats({
          todayEarnings: 0,
          weekEarnings: 0,
          monthEarnings: 0,
          totalEarnings: 0,
          pendingCommission: 0,
          approvedCommission: 0,
          paidCommission: 0,
          totalSales: 0
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const workerName = session?.user?.name || "Worker";
  const firstName = workerName.split(" ")[0];

  return (
    <div className="min-h-screen p-4 pb-24 md:p-6 md:pb-6">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="gradient-text">{firstName}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(new Date(), 'date')}
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <LucideClock size={14} className="mr-1" />
            Active
          </Badge>
        </motion.div>

        {/* Earnings Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <DataCard
            title="Today"
            value={stats?.todayEarnings || 0}
            formatFn={formatCurrency}
            icon={<LucideDollarSign size={20} className="text-green-500" />}
            loading={loading}
          />
          <DataCard
            title="This Week"
            value={stats?.weekEarnings || 0}
            formatFn={formatCurrency}
            icon={<LucideTrendingUp size={20} className="text-blue-500" />}
            loading={loading}
          />
          <DataCard
            title="This Month"
            value={stats?.monthEarnings || 0}
            formatFn={formatCurrency}
            icon={<LucideDollarSign size={20} className="text-purple-500" />}
            loading={loading}
          />
          <DataCard
            title="Total Sales"
            value={stats?.totalSales || 0}
            icon={<LucideShoppingCart size={20} className="text-orange-500" />}
            loading={loading}
          />
        </motion.div>

        {/* Commission & Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Commission Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Commission Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(stats?.pendingCommission || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats?.approvedCommission || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats?.paidCommission || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Paid</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/worker/sales/new">
                  <Button variant="outline" className="w-full justify-start">
                    <LucideShoppingCart size={18} className="mr-2" />
                    New Sale
                  </Button>
                </Link>
                <Link href="/worker/chats">
                  <Button variant="outline" className="w-full justify-start">
                    <LucideMessageSquare size={18} className="mr-2" />
                    Messages
                  </Button>
                </Link>
                <Link href="/worker/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <LucideDollarSign size={18} className="mr-2" />
                    View Earnings
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <LucideMegaphone size={18} className="text-primary" />
                Announcements
              </h3>
              <Link href="/worker/announcements">
                <Button variant="ghost" size="sm">
                  View All
                  <LucideArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No announcements yet</p>
            ) : (
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <h4 className="font-medium mb-1">{ann.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ann.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(ann.publishedAt, 'datetime')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Bottom Navigation Placeholder */}
        <div className="h-20 md:hidden" />
      </div>
    </div>
  );
}