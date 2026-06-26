"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { Breadcrumbs } from "./breadcrumbs";
import { AuthProvider } from "./auth-provider";
import { useUIStore } from "@/lib/stores/ui.store";
import { OfflineIndicator } from "@/components/features/offline-indicator";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <AuthProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Large screen sidebar */}
        <Sidebar />

        {/* Mobile slide-out navigation */}
        <MobileNav />

        {/* Main portal space */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Header */}
          <Header />

          {/* Scrollable workspace */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 flex flex-col gap-6">
            <Breadcrumbs />
            <div className="flex-1 flex flex-col">{children}</div>
          </main>
        </div>
      </div>
      <OfflineIndicator />
    </AuthProvider>
  );
}
