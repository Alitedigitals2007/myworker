"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LucideHome,
  LucideMessageSquare,
  LucideShoppingCart,
  LucideFileText,
  LucideUser,
  LucidePlus
} from "lucide-react";

const workerNavItems = [
  { href: "/worker", icon: LucideHome, label: "Home" },
  { href: "/worker/chats", icon: LucideMessageSquare, label: "Chats" },
  { href: "/worker/sales/new", icon: LucidePlus, label: "Sale", isAction: true },
  { href: "/worker/logs", icon: LucideFileText, label: "Logs" },
  { href: "/worker/profile", icon: LucideUser, label: "Profile" },
];

interface MobileBottomNavProps {
  workerId?: string;
}

export function MobileBottomNav({ workerId }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {workerNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/worker" && pathname.startsWith(item.href));
            const isAction = item.isAction;

            if (isAction) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-6"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                    <LucidePlus size={24} className="text-white" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon size={20} className={isActive ? "scale-110" : ""} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-0.5 w-8 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FAB placeholder for when nav is hidden */}
      <div className="fixed bottom-20 right-4 z-30 md:hidden" />
    </>
  );
}