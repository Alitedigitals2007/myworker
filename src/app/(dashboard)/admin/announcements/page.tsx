"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucideMegaphone, LucidePlus, LucideSearch, LucideUsers, LucideSend } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetType: string;
  publishedAt: string | null;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState("ALL");

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        setAnnouncements([
          { id: "1", title: "Monthly Targets Q2 2026", content: "New monthly targets have been set for Q2. Please review and reach out if you have any concerns.", targetType: "ALL", publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
          { id: "2", title: "System Maintenance", content: "The system will be undergoing maintenance this weekend from Saturday 10pm to Sunday 6am.", targetType: "ALL", publishedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: "3", title: "Sales Training Workshop", content: "A sales training workshop will be held next week. All sales team members are required to attend.", targetType: "DEPARTMENT", publishedAt: null, createdAt: new Date(Date.now() - 172800000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, targetType })
      });

      if (res.ok) {
        const newAnn = await res.json();
        setAnnouncements([newAnn, ...announcements]);
        setShowCreateDialog(false);
        setTitle("");
        setContent("");
      }
    } catch (error) {
      console.error("Failed to create announcement:", error);
    }
  };

  const getTargetBadge = (type: string) => {
    switch (type) {
      case "ALL": return <Badge variant="info">All Workers</Badge>;
      case "DEPARTMENT": return <Badge variant="outline">Department</Badge>;
      case "INDIVIDUAL": return <Badge variant="secondary">Individual</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage company announcements
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <LucidePlus size={18} className="mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Title</label>
                  <Input
                    placeholder="Announcement title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Content</label>
                  <textarea
                    className="w-full h-32 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                    placeholder="Announcement content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target</label>
                  <Select value={targetType} onValueChange={setTargetType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Workers</SelectItem>
                      <SelectItem value="DEPARTMENT">Specific Department</SelectItem>
                      <SelectItem value="INDIVIDUAL">Specific Workers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!title || !content}>
                    <LucideSend size={16} className="mr-2" />
                    Publish
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <LucideMegaphone size={24} className="mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{announcements.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {announcements.filter(a => a.publishedAt).length}
            </p>
            <p className="text-sm text-muted-foreground">Published</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">
              {announcements.filter(a => !a.publishedAt).length}
            </p>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">
              {announcements.filter(a => a.targetType === "ALL").length}
            </p>
            <p className="text-sm text-muted-foreground">Broadcasts</p>
          </Card>
        </div>

        {/* Announcements List */}
        <Card className="p-4 md:p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <LucideMegaphone size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first announcement</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <LucidePlus size={18} className="mr-2" />
                Create Announcement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        {getTargetBadge(announcement.targetType)}
                        {!announcement.publishedAt && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(announcement.createdAt, 'datetime')}
                        </span>
                        {announcement.publishedAt && (
                          <span className="text-xs text-green-500 flex items-center gap-1">
                            <LucideSend size={12} />
                            Published
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      {!announcement.publishedAt && (
                        <Button size="sm">
                          <LucideSend size={14} className="mr-1" />
                          Publish
                        </Button>
                      )}
                    </div>
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