"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucideTrendingUp, LucideTrendingDown, LucideDollarSign, LucideShoppingCart, LucideUsers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/shared/data-card";
import { RevenueChart, SalesChart, WorkersChart, ProfitChart } from "../_components/charts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your business performance and growth
            </p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DataCard
            title="Total Revenue"
            value={12500000}
            formatFn={(v) => `₦${(v as number).toLocaleString()}`}
            trend={12.5}
            trendPrefix="+"
            icon={<LucideDollarSign size={20} className="text-green-500" />}
            loading={loading}
          />
          <DataCard
            title="Total Sales"
            value={156}
            trend={8.3}
            trendPrefix="+"
            icon={<LucideShoppingCart size={20} className="text-blue-500" />}
            loading={loading}
          />
          <DataCard
            title="Active Workers"
            value={24}
            icon={<LucideUsers size={20} className="text-purple-500" />}
            loading={loading}
          />
          <DataCard
            title="Avg. Order Value"
            value={80128}
            formatFn={(v) => `₦${(v as number).toLocaleString()}`}
            trend={-2.1}
            trendPrefix=""
            icon={<LucideTrendingDown size={20} className="text-amber-500" />}
            loading={loading}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <div className="h-72">
              <RevenueChart dataKey="revenue" />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
            <div className="h-72">
              <SalesChart />
            </div>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Workers</h3>
            <div className="h-72">
              <WorkersChart />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue vs Profit</h3>
            <div className="h-72">
              <ProfitChart />
            </div>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Leaderboard</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">#</th>
                  <th className="text-left py-3 px-4 font-medium">Worker</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Sales</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium">Commission</th>
                  <th className="text-right py-3 px-4 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: "Sarah Johnson", workerId: "MW-12345678", sales: 45, revenue: 4500000, commission: 450000, trend: 15 },
                  { rank: 2, name: "John Smith", workerId: "MW-23456789", sales: 38, revenue: 3800000, commission: 380000, trend: 8 },
                  { rank: 3, name: "Emily Davis", workerId: "MW-34567890", sales: 32, revenue: 3200000, commission: 320000, trend: 12 },
                  { rank: 4, name: "Michael Brown", workerId: "MW-45678901", sales: 28, revenue: 2800000, commission: 280000, trend: -3 },
                  { rank: 5, name: "Lisa Anderson", workerId: "MW-56789012", sales: 25, revenue: 2500000, commission: 250000, trend: 5 }
                ].map((worker, index) => (
                  <motion.tr
                    key={worker.workerId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className={`font-bold ${worker.rank === 1 ? "text-yellow-500" : worker.rank === 2 ? "text-gray-400" : worker.rank === 3 ? "text-amber-600" : ""}`}>
                        {worker.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {worker.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{worker.name}</p>
                          <p className="text-xs text-muted-foreground">{worker.workerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">{worker.sales}</td>
                    <td className="py-3 px-4 hidden md:table-cell">₦{worker.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4">₦{worker.commission.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`flex items-center justify-end gap-1 ${worker.trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {worker.trend >= 0 ? <LucideTrendingUp size={14} /> : <LucideTrendingDown size={14} />}
                        {Math.abs(worker.trend)}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Export Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Export Reports</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              Export as Excel
            </Button>
            <Button variant="outline">
              Export as CSV
            </Button>
            <Button variant="outline">
              Export as PDF
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}