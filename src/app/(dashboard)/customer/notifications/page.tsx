"use client";

import * as React from "react";
import {
  Bell,
  CheckCheck,
  Calendar,
  FileCheck,
  CreditCard,
  Tag,
  Gift,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function CustomerNotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Helper to map notification type to styling icons
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_created":
      case "booking_confirmed":
      case "booking_assigned":
        return {
          icon: <Calendar className="h-4 w-4" />,
          classes: "bg-primary/10 text-primary border border-primary/20",
        };
      case "inspection_started":
      case "inspection_completed":
      case "report_ready":
        return {
          icon: <FileCheck className="h-4 w-4" />,
          classes: "bg-accent/10 text-accent border border-accent/20",
        };
      case "invoice_generated":
      case "payment_received":
        return {
          icon: <CreditCard className="h-4 w-4" />,
          classes: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        };
      case "coupon_applied":
        return {
          icon: <Tag className="h-4 w-4" />,
          classes: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        };
      case "referral_earned":
        return {
          icon: <Gift className="h-4 w-4" />,
          classes: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        };
      default:
        return {
          icon: <Bell className="h-4 w-4" />,
          classes: "bg-white/5 text-muted-foreground border border-white/10",
        };
    }
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-gradient flex items-center gap-2">
            Notification Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with realtime alerts regarding your vehicle bookings, inspection status, and rewards.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="flex items-center gap-2 border-white/10 hover:bg-white/5 cursor-pointer"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-card/25 border border-white/5 rounded-xl h-[40vh]">
            <Bell className="h-12 w-12 text-muted-foreground/45 mb-3 animate-bounce" />
            <h3 className="text-base font-semibold text-foreground">All caught up!</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              You do not have any notification alerts at this time.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const config = getNotificationIcon(n.type);
            return (
              <Card
                key={n.id}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={cn(
                  "p-5 flex gap-4 border-white/5 transition-all",
                  n.is_read
                    ? "bg-card/25 opacity-75"
                    : "bg-card/65 border-l-4 border-l-primary cursor-pointer hover:bg-card/75"
                )}
              >
                <div className="flex-shrink-0 pt-0.5">
                  <div className={cn("p-2.5 rounded-lg flex items-center justify-center", config.classes)}>
                    {config.icon}
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className={cn("text-sm font-semibold text-foreground truncate", !n.is_read && "text-primary-foreground")}>
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatDate(n.created_at)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words">
                    {n.message}
                  </p>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
