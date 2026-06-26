"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { NotificationService } from "@/lib/services/notification.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { Notification } from "@/lib/types";
import { toast } from "@/components/ui/toast";

export function useNotifications() {
  const supabase = createClient();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const notificationService = React.useMemo(
    () => new NotificationService(supabase),
    [supabase]
  );

  const fetchNotifications = React.useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const list = await notificationService.listNotifications(user.id);
      setNotifications(list);
    } catch (err: any) {
      console.error("Error loading notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, notificationService]);

  const markAsRead = async (id: string) => {
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
      toast.error("Failed to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      toast.success("All notifications marked as read.");
    } catch (err: any) {
      console.error("Error marking all as read:", err);
      toast.error("Failed to update notifications.");
    }
  };

  // Realtime subscription setup
  React.useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          toast.info(newNotif.title, {
            description: newNotif.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchNotifications]);

  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
