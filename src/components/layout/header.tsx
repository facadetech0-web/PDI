"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/utils/constants";
import Link from "next/link";

import { NotificationBell } from "@/components/features/notification-bell";

export function Header() {
  const { setSidebarOpen } = useUIStore();
  const { profile } = useAuthStore();

  const role = profile?.role || "customer";
  const label = ROLE_LABELS[role];

  return (
    <header className="h-16 border-b border-white/5 bg-card/65 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      {/* Left side: Hamburger for mobile */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 focus:outline-none cursor-pointer"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open Sidebar</span>
        </button>
        <div className="hidden md:block">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Portal
          </span>
          <h1 className="text-sm font-bold text-foreground">
            {label} Control Panel
          </h1>
        </div>
      </div>

      {/* Right side: Action triggers and avatar */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <NotificationBell />

        {/* User Information */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-sm font-medium text-foreground leading-tight">
              {profile?.full_name || "User"}
            </span>
            <span className="text-xs text-muted-foreground leading-none mt-1">
              {profile?.email || ""}
            </span>
          </div>
          <Link href={`/${role}/profile`}>
            <Avatar
              src={profile?.avatar_url}
              fallback={profile?.full_name || "User"}
              size="sm"
              className="cursor-pointer hover:border-primary/50 transition-colors"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
