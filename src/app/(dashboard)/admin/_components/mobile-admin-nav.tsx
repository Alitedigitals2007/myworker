"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LucideLayoutDashboard,
  LucideUsers,
  LucidePackage,
  LucideShoppingCart,
  LucideMenu,
  LucideX
} from "lucide-react";
import { useState } from "react";

const mobileNavItems = [
  { href: "/admin", icon: LucideLayoutDashboard, label: "Home" },
  { href: "/admin/workers", icon: LucideUsers, label: "Workers" },
  { href: "/admin/products", icon: LucidePackage, label: "Products" },
  { href: "/admin/sales", icon: LucideShoppingCart, label: "Sales" },
];

export function MobileAdminNav() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg"
          >
            <LucideMenu size={20} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMenu(false)} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute right-0 top-0 bottom-0 w-72 bg-background border-l p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">MW</span>
                </div>
                <span className="font-bold">MY WORKER</span>
              </div>
              <button onClick={() => setShowMenu(false)} className="p-2">
                <LucideX size={20} />
              </button>
            </div>
            <div className="space-y-1">
              {[
                { href: "/admin/payments", label: "Payments" },
                { href: "/admin/analytics", label: "Analytics" },
                { href: "/admin/complaints", label: "Complaints" },
                { href: "/admin/announcements", label: "Announcements" },
                { href: "/admin/reports", label: "Reports" },
                { href: "/admin/settings", label: "Settings" },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2.5 rounded-lg hover:bg-accent text-sm font-medium"
                  onClick={() => setShowMenu(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}