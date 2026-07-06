"use client";

import { useEffect, useState } from "react";
import { LucideActivity, LucideUserPlus, LucideShoppingCart, LucideDollarSign, LucideMessageSquare, LucideBell } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/shared/skeleton";

interface Activity {
  id: string;
  action: string;
  entityType: string;
  details: string;
  createdAt: string;
  worker?: {
    fullName: string;
  };
}

const activityIcons: Record<string, React.ElementType> = {
  WORKER_ADDED: LucideUserPlus,
  SALE_CREATED: LucideShoppingCart,
  PAYMENT_MADE: LucideDollarSign,
  MESSAGE_SENT: LucideMessageSquare,
  ANNOUNCEMENT: LucideBell
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch("/api/activities?limit=10");
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        // Use placeholder data
        setActivities([
          { id: "1", action: "WORKER_ADDED", entityType: "Worker", details: "Sarah Johnson joined as Sales Rep", createdAt: new Date().toISOString() },
          { id: "2", action: "SALE_CREATED", entityType: "Sale", details: "New sale of ₦150,000 from John Doe", createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: "3", action: "PAYMENT_MADE", entityType: "Payment", details: "Commission payment of ₦25,000 approved", createdAt: new Date(Date.now() - 7200000).toISOString() },
          { id: "4", action: "ANNOUNCEMENT", entityType: "Announcement", details: "Monthly targets announced for Q2", createdAt: new Date(Date.now() - 14400000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <LucideActivity size={18} className="text-primary" />
          Recent Activity
        </h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          activities.map((activity) => {
            const Icon = activityIcons[activity.action] || LucideActivity;
            return (
              <div key={activity.id} className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.details}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(activity.createdAt, 'datetime')}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}