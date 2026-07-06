"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { Header } from "@/components/shared/header";

interface WorkerDashboardLayoutProps {
  children: ReactNode;
}

export default function WorkerDashboardLayout({ children }: WorkerDashboardLayoutProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect("/worker-login");
  }

  // Only workers can access worker dashboard
  if (session.user.role !== "WORKER") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 flex-col">
      <Header userRole={session.user.role} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto pb-24">
        {children}
      </main>
      <MobileBottomNav workerId={session.user.workerId} />
    </div>
  );
}