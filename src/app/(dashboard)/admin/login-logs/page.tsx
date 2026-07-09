"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LucideSearch, LucideFilter, LucideDownload, LucideRefreshCw, LucideLogIn, LucideLogOut, LucideShield, LucideUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataCard } from "@/components/shared/data-card";
import { formatDate } from "@/lib/utils";

interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  userRole: "SUPER_ADMIN" | "ADMIN" | "WORKER";
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  failReason: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function LoginLogsPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSuccess, setFilterSuccess] = useState<"all" | "success" | "failed">("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      if (searchQuery) params.append("userId", searchQuery);
      if (filterSuccess !== "all") params.append("success", filterSuccess === "success" ? "true" : "false");
      if (filterRole !== "all") params.append("role", filterRole);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const res = await fetch(`/api/login-audit?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch login logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, fetchLogs]);

  const handleFilter = () => {
    setPagination(p => ({ ...p, page: 1 }));
    fetchLogs();
  };

  const handleExport = () => {
    const csvContent = [
      ["Date", "Time", "User Name", "Role", "Status", "IP Address", "Fail Reason"].join(","),
      ...logs.map(log => [
        formatDate(log.createdAt, "date"),
        formatDate(log.createdAt, "time"),
        log.userName,
        log.userRole,
        log.success ? "Success" : "Failed",
        log.ipAddress || "N/A",
        log.failReason || "N/A"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `login-logs-${formatDate(new Date(), "date").replace(/\s/g, "-")}.csv`;
    a.click();
  };

  const successCount = logs.filter(l => l.success).length;
  const failedCount = logs.filter(l => !l.success).length;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">Login Logs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track all login attempts across the platform
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <LucideDownload size={18} className="mr-2" />
            Export CSV
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DataCard
            title="Total Logs"
            value={pagination.total}
            icon={<LucideLogIn size={20} className="text-blue-500" />}
            loading={loading}
          />
          <DataCard
            title="Successful"
            value={successCount}
            icon={<LucideLogIn size={20} className="text-green-500" />}
            loading={loading}
          />
          <DataCard
            title="Failed"
            value={failedCount}
            icon={<LucideLogOut size={20} className="text-red-500" />}
            loading={loading}
          />
          <DataCard
            title="Page"
            value={`${pagination.page} of ${pagination.pages || 1}`}
            icon={<LucideFilter size={20} className="text-purple-500" />}
            loading={loading}
          />
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <LucideSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterSuccess}
                onChange={(e) => setFilterSuccess(e.target.value as "all" | "success" | "failed")}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
              >
                <option value="all">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="WORKER">Worker</option>
              </select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-auto h-10"
                placeholder="From"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-auto h-10"
                placeholder="To"
              />
              <Button onClick={handleFilter}>
                <LucideRefreshCw size={18} className="mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fail Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No login logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="font-medium">{formatDate(log.createdAt, "date")}</p>
                          <p className="text-muted-foreground text-xs">{formatDate(log.createdAt, "time")}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {log.userRole === "WORKER" ? (
                            <LucideUser size={16} className="text-muted-foreground" />
                          ) : (
                            <LucideShield size={16} className="text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium">{log.userName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={log.userRole === "SUPER_ADMIN" ? "default" : log.userRole === "ADMIN" ? "secondary" : "outline"}>
                          {log.userRole.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {log.success ? (
                          <Badge variant="success" className="gap-1">
                            <LucideLogIn size={12} />
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <LucideLogOut size={12} />
                            Failed
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {log.ipAddress || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.failReason ? (
                          <span className="text-red-500">{log.failReason.replace("_", " ")}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}