"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LucideLayoutDashboard,
  LucideUsers,
  LucidePackage,
  LucideShoppingCart,
  LucideDollarSign,
  LucideBarChart3,
  LucideAlertTriangle,
  LucideMegaphone,
  LucideFileText,
  LucideSettings,
  LucideChevronLeft,
  LucideLogOut,
  LucideHistory,
  LucideLogIn
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

const adminNavItems = [
  { href: "/admin", icon: LucideLayoutDashboard, label: "Dashboard" },
  { href: "/admin/workers", icon: LucideUsers, label: "Workers" },
  { href: "/admin/products", icon: LucidePackage, label: "Products" },
  { href: "/admin/sales", icon: LucideShoppingCart, label: "Sales" },
  { href: "/admin/payments", icon: LucideDollarSign, label: "Payments" },
  { href: "/admin/analytics", icon: LucideBarChart3, label: "Analytics" },
  { href: "/admin/complaints", icon: LucideAlertTriangle, label: "Complaints" },
  { href: "/admin/announcements", icon: LucideMegaphone, label: "Announcements" },
  { href: "/admin/login-logs", icon: LucideLogIn, label: "Login Logs" },
  { href: "/admin/activity-logs", icon: LucideHistory, label: "Activity Logs" },
  { href: "/admin/reports", icon: LucideFileText, label: "Reports" },
  { href: "/admin/settings", icon: LucideSettings, label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-card border-r transition-all duration-300 z-40",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">MW</span>
            </div>
            <span className="font-bold text-lg">MY WORKER</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto">
            <span className="text-sm font-bold text-white">MW</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-background border rounded-md text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 z-50 shadow-md">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle & Sign Out */}
      <div className="p-3 border-t space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
        >
          <LucideChevronLeft size={20} className={collapsed ? "rotate-180" : ""} />
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full"
        >
          <LucideLogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}