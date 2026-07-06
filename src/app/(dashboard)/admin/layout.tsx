"use client";

import { ReactNode, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "./_components/sidebar";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { Header } from "@/components/shared/header";
import { MobileAdminNav } from "./_components/mobile-admin-nav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function AdminDashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  const isWorker = session.user.role === "WORKER";

  if (!isAdmin && !isWorker) {
    redirect("/");
  }

  if (isWorker) {
    redirect("/worker");
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={session.user.role} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-4 md:pt-0">
          {children}
        </main>
      </div>

      {/* Mobile Admin Navigation */}
      <MobileAdminNav />
    </div>
  );
}