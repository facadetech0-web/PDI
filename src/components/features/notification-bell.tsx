"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useAuthStore } from "@/lib/stores/auth.store";

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const { profile } = useAuthStore();
  const role = profile?.role || "customer";

  return (
    <Link
      href={`/${role}/notifications`}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors relative cursor-pointer block"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <>
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-destructive animate-ping" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-destructive" />
          <span className="absolute -top-1 -right-1 bg-destructive text-[8px] font-bold text-white h-4 min-w-4 px-1 flex items-center justify-center rounded-full border border-card leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        </>
      )}
      <span className="sr-only">Notifications ({unreadCount} unread)</span>
    </Link>
  );
}
