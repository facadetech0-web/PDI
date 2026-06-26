import { SupabaseClient } from "@supabase/supabase-js";
import type { Notification, NotificationType } from "@/lib/types";

export class NotificationService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * List notifications for a specific user
   */
  async listNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Notification[];
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await this.supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  }

  /**
   * Mark all notifications for a user as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
  }

  /**
   * Create a new notification (used by admin or system actions)
   */
  async createNotification(
    notification: Omit<Notification, "id" | "is_read" | "read_at" | "created_at">
  ): Promise<Notification> {
    const { data, error } = await this.supabase
      .from("notifications")
      .insert({
        ...notification,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  }

  /**
   * Broadcast a notification to all users (Admin only)
   */
  async broadcastNotification(
    type: NotificationType,
    title: string,
    message: string,
    data: Record<string, unknown> = {}
  ): Promise<void> {
    // Fetch all active profiles
    const { data: profiles, error: profileError } = await this.supabase
      .from("profiles")
      .select("id")
      .eq("is_active", true);

    if (profileError) throw profileError;

    if (!profiles || profiles.length === 0) return;

    // Create notifications for each user
    const inserts = profiles.map((p) => ({
      user_id: p.id,
      type,
      title,
      message,
      data,
      is_read: false,
    }));

    const { error } = await this.supabase
      .from("notifications")
      .insert(inserts);

    if (error) throw error;
  }
}
