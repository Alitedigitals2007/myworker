"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LucideSearch,
  LucideBell,
  LucideMenu,
  LucideX,
  LucideChevronDown,
  LucideLogOut,
  LucideSettings
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./global-search";

interface HeaderProps {
  userRole?: string;
}

export function Header({ userRole }: HeaderProps) {
  const { data: session } = useSession();
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b">
        <div className="h-14 md:h-16 px-4 flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-accent"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <LucideX size={20} /> : <LucideMenu size={20} />}
          </button>

          {/* Search */}
          <div className={cn("flex-1 max-w-md", showSearch ? "block" : "hidden md:block")}>
            <button
              onClick={() => setShowGlobalSearch(true)}
              className="relative w-full flex items-center gap-2 h-9 md:h-10 px-3 rounded-lg bg-muted/50 border-0 hover:bg-muted transition-colors text-left"
            >
              <LucideSearch size={18} className="text-muted-foreground" />
              <span className="hidden md:block text-sm text-muted-foreground flex-1">Search... (Cmd+K)</span>
              <kbd className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </button>
          </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent"
            onClick={() => setShowSearch(!showSearch)}
          >
            <LucideSearch size={20} />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-accent">
            <LucideBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {session?.user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium">
                {session?.user?.name || "User"}
              </span>
              <LucideChevronDown size={16} className="hidden md:block" />
            </button>

            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-56 bg-background border rounded-xl shadow-xl p-2"
              >
                <div className="px-3 py-2 border-b mb-2">
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
                <Link
                  href={userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? "/admin/settings" : "/worker/profile"}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-sm"
                  onClick={() => setShowProfile(false)}
                >
                  <LucideSettings size={16} />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-accent text-sm text-red-500"
                >
                  <LucideLogOut size={16} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </header>

    <GlobalSearch open={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />
    </>
  );
}