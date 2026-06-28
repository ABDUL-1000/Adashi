"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSideBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-page-bg text-foreground lg:flex">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
