"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucideAlertTriangle, LucideCheck, LucideX, LucideSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/shared/skeleton";
import { formatDate } from "@/lib/utils";
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

interface Complaint {
  id: string;
  worker: { fullName: string };
  title: string;
  description: string;
  status: string;
  response: string | null;
  createdAt: string;
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const res = await fetch("/api/complaints");
        if (res.ok) {
          const data = await res.json();
          setComplaints(data.complaints || []);
        }
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
        setComplaints([
          { id: "1", worker: { fullName: "Sarah Johnson" }, title: "Payment Issue", description: "My commission was not credited properly for last month sales.", status: "PENDING", response: null, createdAt: new Date().toISOString() },
          { id: "2", worker: { fullName: "John Smith" }, title: "Schedule Problem", description: "The shifts are not being scheduled correctly.", status: "UNDER_REVIEW", response: "We are looking into this issue.", createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: "3", worker: { fullName: "Emily Davis" }, title: "Equipment Request", description: "I need a new laptop for work.", status: "RESOLVED", response: "New laptop has been approved and will be delivered.", createdAt: new Date(Date.now() - 172800000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.worker.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge variant="warning">Pending</Badge>;
      case "UNDER_REVIEW": return <Badge variant="info">Under Review</Badge>;
      case "RESOLVED": return <Badge variant="success">Resolved</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Complaints</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review and respond to worker complaints
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">
              {complaints.filter(c => c.status === "PENDING").length}
            </p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">
              {complaints.filter(c => c.status === "UNDER_REVIEW").length}
            </p>
            <p className="text-sm text-muted-foreground">Under Review</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {complaints.filter(c => c.status === "RESOLVED").length}
            </p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <LucideSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
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
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Complaints List */}
        <Card className="p-4 md:p-6">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <LucideAlertTriangle size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No complaints found</h3>
              <p className="text-sm text-muted-foreground">There are no complaints matching your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{complaint.title}</h3>
                        {getStatusBadge(complaint.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        From {complaint.worker.fullName} • {formatDate(complaint.createdAt, 'datetime')}
                      </p>
                    </div>
                    {complaint.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); }}>
                          <LucideX size={14} className="mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); }}>
                          <LucideCheck size={14} className="mr-1" />
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Complaint Detail Dialog */}
        {selectedComplaint && (
          <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedComplaint.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">From: {selectedComplaint.worker.fullName}</span>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm">{selectedComplaint.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Date</p>
                  <p className="text-sm">{formatDate(selectedComplaint.createdAt, 'datetime')}</p>
                </div>
                {selectedComplaint.response && (
                  <div>
                    <p className="text-sm font-medium mb-1">Response</p>
                    <p className="text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">{selectedComplaint.response}</p>
                  </div>
                )}
                {selectedComplaint.status !== "RESOLVED" && (
                  <div>
                    <p className="text-sm font-medium mb-1">Add Response</p>
                    <textarea className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="Type your response..." />
                    <div className="flex gap-3 mt-3">
                      <Button variant="outline" className="flex-1">Reject</Button>
                      <Button className="flex-1">Send Response</Button>
                    </div>
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