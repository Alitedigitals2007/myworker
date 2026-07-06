"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { LucideArrowUp, LucideArrowDown, LucideUsers, LucideDollarSign, LucideWarehouse, LucideChartBar, LucidePercent, LucideClock, LucideAlertTriangle, LucideCheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { DataCard } from "@/components/shared/data-card";
import { Button } from "@/components/ui/button";
import { StatCardSkeleton, RevenueChartSkeleton } from "@/components/shared/skeleton";
import { RevenueChart, SalesChart, WorkersChart, InventoryChart, CommissionChart } from "./_components/charts";
import { RecentActivity } from "./_components/recent-activity";

interface DashboardStats {
  totalWorkers: number;
  activeWorkers: number;
  onlineWorkers: number;
  newWorkers: number;
  pendingReviews: number;
  pendingComplaints: number;
  pendingPayments: number;
  pendingCommission: number;
  paidCommission: number;
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  inventoryValue: number;
  monthlyRevenue: number;
  monthlyProfit: number;
}

const tabData = [
  { label: "7 Days", value: "7" },
  { label: "30 Days", value: "30" },
  { label: "90 Days", value: "90" }
];

export default function AdminDashboard() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  
  const [activeTab, setActiveTab] = useState("30");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics/dashboard?range=${activeTab}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch analytics");
        }
        
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Failed fetching dashboard data:", err);
        setError("Failed loading dashboard metrics");
        setStats({
          totalWorkers: 0, activeWorkers: 0, onlineWorkers: 0, newWorkers: 0,
          pendingReviews: 0, pendingComplaints: 0, pendingPayments: 0,
          pendingCommission: 0, paidCommission: 0, totalRevenue: 0,
          totalSales: 0, totalProducts: 0, inventoryValue: 0,
          monthlyRevenue: 0, monthlyProfit: 0
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [activeTab]);

  const isWorkerStatPositive = (val: number) => val > 0;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(new Date(), 'date')}
            </p>
          </div>
          {isSuperAdmin && (
            <Button size="lg" onClick={() => {}}>
              Add Admin
            </Button>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {loading || !stats ? (
            <>
              {Array.from({ length: 8 }).map((_, idx) => (
                <StatCardSkeleton key={idx} />
              ))}
            </>
          ) : (
            <>
              <DataCard
                title="Total Workers"
                value={stats.totalWorkers}
                trend={isWorkerStatPositive(stats.newWorkers) ? stats.newWorkers : undefined}
                trendPrefix={`${stats.newWorkers > 0 ? '+' : ''}`}
                icon={<LucideUsers size={20} className="text-blue-500" />}
                className="bg-blue-50 dark:bg-blue-900/20"
              />
              <DataCard
                title="Active Workers"
                value={stats.activeWorkers}
                icon={<LucideCheckCircle size={20} className="text-green-500" />}
                className="bg-green-50 dark:bg-green-900/20"
              />
              <DataCard
                title="Online Now"
                value={stats.onlineWorkers}
                icon={<LucideClock size={20} className="text-emerald-500" />}
                className="bg-emerald-50 dark:bg-emerald-900/20"
              />
              <DataCard
                title="Pending Reviews"
                value={stats.pendingReviews}
                icon={<LucideAlertTriangle size={20} className="text-amber-500" />}
                className="bg-amber-50 dark:bg-amber-900/20"
              />

              <DataCard
                title="Revenue"
                value={formatCurrency(stats.totalRevenue)}
                trend={isWorkerStatPositive(stats.monthlyRevenue) ? Math.round((stats.monthlyRevenue/stats.totalRevenue)*100) : undefined}
                icon={<LucideDollarSign size={20} className="text-purple-500" />}
                className="bg-purple-50 dark:bg-purple-900/20"
                formatFn={formatCurrency}
              />
              <DataCard
                title="Total Sales"
                value={stats.totalSales}
                icon={<LucideChartBar size={20} className="text-blue-500" />}
                className="bg-blue-50 dark:bg-blue-900/20"
              />
              <DataCard
                title="Products"
                value={stats.totalProducts}
                icon={<LucideWarehouse size={20} className="text-indigo-500" />}
                className="bg-indigo-50 dark:bg-indigo-900/20"
              />
              <DataCard
                title="Commission Pending"
                value={formatCurrency(stats.pendingCommission)}
                icon={<LucidePercent size={20} className="text-rose-500" />}
                className="bg-rose-50 dark:bg-rose-900/20"
                formatFn={formatCurrency}
              />
            </>
          )}
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-4 md:grid-cols-2"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Revenue</h3>
              <div className="flex gap-2">
                {tabData.map(tab => (
                  <Button
                    size="sm"
                    variant={activeTab === tab.value ? "outline" : "ghost"}
                    onClick={() => setActiveTab(tab.value)}
                    key={tab.value}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="h-64 mt-4">
              {loading ? (
                <RevenueChartSkeleton />
              ) : stats ? (
                <RevenueChart dataKey="revenue" duration={parseInt(activeTab)} />
              ) : error && (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}
            </div>
          </Card>

          <div className="grid gap-4 grid-cols-2">
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Sales Trend</h3>
              <div className="h-36 mt-4">
                {loading ? <StatCardSkeleton /> : <SalesChart />}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Top Workers</h3>
              <div className="h-36 mt-4">
                {loading ? <StatCardSkeleton /> : <WorkersChart />}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Inventory</h3>
              <div className="h-36 mt-4 flex items-center justify-center">
                {loading ? <StatCardSkeleton /> : <InventoryChart />}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Commission</h3>
              <div className="h-36 mt-4 flex items-center justify-center">
                {loading ? <StatCardSkeleton /> : <CommissionChart />}
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Quick Actions & Recent Activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid gap-6 md:grid-cols-3"
        >
          <div className="md:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <Card className="p-4 sticky top-28">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <LucideUsers size={18} className="mr-2" />
                  Add Worker
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <LucideDollarSign size={18} className="mr-2" />
                  Create Sales
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <LucideWarehouse size={18} className="mr-2" />
                  Add Product
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <LucideAlertTriangle size={18} className="mr-2" />
                  Send Announcement
                </Button>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}