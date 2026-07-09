"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LucideSearch, LucideFilter, LucideDownload, LucideRefreshCw, LucideUser, LucidePackage, LucideShoppingCart, LucideDollarSign, LucideMegaphone, LucideAlertTriangle, LucideEdit, LucidePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataCard } from "@/components/shared/data-card";
import { formatDate } from "@/lib/utils";

interface ActivityLog {
  id: string;
  workerId: string | null;
  worker: {
    fullName: string;
    workerId: string;
    profilePicture: string | null;
  } | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const entityIcons: Record<string, typeof LucideUser> = {
  WORKER: LucideUser,
  PRODUCT: LucidePackage,
  SALE: LucideShoppingCart,
  PAYMENT: LucideDollarSign,
  ANNOUNCEMENT: LucideMegaphone,
  COMPLAINT: LucideAlertTriangle,
};

const actionColors: Record<string, string> = {
  CREATE: "success",
  UPDATE: "secondary",
  DELETE: "destructive",
  APPROVE: "success",
  REJECT: "destructive",
  LOGIN: "default",
  LOGOUT: "default",
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      if (searchQuery) params.append("workerId", searchQuery);
      if (filterAction) params.append("action", filterAction);
      if (filterEntity) params.append("entityType", filterEntity);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const res = await fetch(`/api/activity-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
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
      ["Date", "Time", "User", "Action", "Entity Type", "Entity ID", "Details", "IP Address"].join(","),
      ...logs.map(log => [
        formatDate(log.createdAt, "date"),
        formatDate(log.createdAt, "time"),
        log.worker?.fullName || "System",
        log.action,
        log.entityType,
        log.entityId || "N/A",
        log.details ? JSON.stringify(log.details).replace(/,/g, ";") : "N/A",
        log.ipAddress || "N/A"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${formatDate(new Date(), "date").replace(/\s/g, "-")}.csv`;
    a.click();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">Activity Logs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track all system activities and changes
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <LucideDownload size={18} className="mr-2" />
            Export CSV
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DataCard
            title="Total Activities"
            value={pagination.total}
            icon={<LucideEdit size={20} className="text-blue-500" />}
            loading={loading}
          />
          <DataCard
            title="Today"
            value={logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
            icon={<LucidePlus size={20} className="text-green-500" />}
            loading={loading}
          />
          <DataCard
            title="This Week"
            value={logs.filter(l => {
              const logDate = new Date(l.createdAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return logDate >= weekAgo;
            }).length}
            icon={<LucidePackage size={20} className="text-purple-500" />}
            loading={loading}
          />
          <DataCard
            title="Page"
            value={`${pagination.page} of ${pagination.pages || 1}`}
            icon={<LucideFilter size={20} className="text-amber-500" />}
            loading={loading}
          />
        </div>

        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <LucideSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by worker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">All Entities</option>
                <option value="WORKER">Worker</option>
                <option value="PRODUCT">Product</option>
                <option value="SALE">Sale</option>
                <option value="PAYMENT">Payment</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="COMPLAINT">Complaint</option>
              </select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-auto h-10"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-auto h-10"
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IP Address</th>
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
                      No activity logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const IconComponent = entityIcons[log.entityType] || LucideUser;
                    return (
                      <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className="font-medium">{formatDate(log.createdAt, "date")}</p>
                            <p className="text-muted-foreground text-xs">{formatDate(log.createdAt, "time")}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <LucideUser size={14} className="text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{log.worker?.fullName || "System"}</p>
                              <p className="text-xs text-muted-foreground">{log.worker?.workerId || "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={(actionColors[log.action] || "default") as "success" | "secondary" | "destructive" | "default"}>
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <IconComponent size={16} className="text-muted-foreground" />
                            <span className="text-sm">{log.entityType}</span>
                            {log.entityId && (
                              <span className="text-xs text-muted-foreground">#{log.entityId.slice(-6)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {log.details ? (
                            <details className="text-sm">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                View details
                              </summary>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto max-w-[300px]">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {log.ipAddress || "N/A"}
                        </td>
                      </tr>
                    );
                  })
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