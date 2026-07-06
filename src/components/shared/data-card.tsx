"use client";

import { LucideTrendingUp, LucideTrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: number;
  trendPrefix?: string;
  formatFn?: (val: number | string) => string;
  className?: string;
  loading?: boolean;
}

export function DataCard({
  title,
  value,
  icon,
  trend,
  trendPrefix,
  formatFn,
  className,
  loading
}: DataCardProps) {
  if (loading) {
    return (
      <div className={cn("rounded-xl bg-card p-5 border shadow-sm animate-pulse", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 w-10 bg-muted rounded-lg" />
        </div>
        <div className="h-8 w-32 bg-muted rounded" />
      </div>
    );
  }

  const displayValue = formatFn && typeof value === "number" ? formatFn(value) : value;
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <div className={cn("rounded-xl bg-card p-5 border shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && (
          <div className="p-2 rounded-lg bg-muted/50">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl md:text-3xl font-bold">{displayValue}</span>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-sm font-medium", isPositiveTrend ? "text-green-500" : "text-red-500")}>
            {isPositiveTrend ? <LucideTrendingUp size={16} /> : <LucideTrendingDown size={16} />}
            <span>{trendPrefix || ""}{Math.abs(trend)}{typeof trend === "number" && !formatFn ? "%" : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
}