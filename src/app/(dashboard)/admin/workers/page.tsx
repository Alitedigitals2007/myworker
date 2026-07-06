"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucidePlus, LucideSearch, LucideFilter, LucideMoreVertical, LucideUserCheck, LucideUserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/shared/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface Worker {
  id: string;
  workerId: string;
  fullName: string;
  email: string;
  phone: string | null;
  department: string | null;
  position: string | null;
  status: string;
  commissionPercent: number;
  createdAt: string;
  profilePicture: string | null;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    async function fetchWorkers() {
      try {
        const res = await fetch("/api/workers");
        if (res.ok) {
          const data = await res.json();
          setWorkers(data.workers || []);
        }
      } catch (error) {
        console.error("Failed to fetch workers:", error);
        // Use sample data
        setWorkers([
          { id: "1", workerId: "MW-12345678", fullName: "Sarah Johnson", email: "sarah@example.com", phone: "+2348012345678", department: "Sales", position: "Sales Rep", status: "ACTIVE", commissionPercent: 10, createdAt: new Date().toISOString(), profilePicture: null },
          { id: "2", workerId: "MW-23456789", fullName: "John Doe", email: "john@example.com", phone: "+2348012345679", department: "Marketing", position: "Marketing Lead", status: "ACTIVE", commissionPercent: 15, createdAt: new Date().toISOString(), profilePicture: null },
          { id: "3", workerId: "MW-34567890", fullName: "Emily Davis", email: "emily@example.com", phone: "+2348012345680", department: "Sales", position: "Sales Rep", status: "INACTIVE", commissionPercent: 10, createdAt: new Date().toISOString(), profilePicture: null }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.workerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || worker.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || worker.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="warning">Inactive</Badge>;
      case "SUSPENDED":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Workers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your team members and their access
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <LucidePlus size={18} className="mr-2" />
            Add Worker
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <LucideSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workers..."
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
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Workers Table */}
        <Card className="p-4 md:p-6">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-12">
              <LucideUserX size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workers found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || departmentFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by adding your first worker"}
              </p>
              {!searchQuery && statusFilter === "all" && departmentFilter === "all" && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <LucidePlus size={18} className="mr-2" />
                  Add Worker
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Worker</th>
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Department</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Commission</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map((worker, index) => (
                    <motion.tr
                      key={worker.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {worker.fullName.split(" ").map(n => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{worker.fullName}</p>
                            <p className="text-sm text-muted-foreground">{worker.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono">{worker.workerId}</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {worker.department || "-"}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(worker.status)}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">{worker.commissionPercent}%</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="icon">
                          <LucideMoreVertical size={18} />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Add Worker Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                  <Input placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <Input placeholder="+2348012345678" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Department</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Position</label>
                  <Input placeholder="Sales Rep" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Commission %</label>
                  <Input type="number" placeholder="10" defaultValue="10" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Worker</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}