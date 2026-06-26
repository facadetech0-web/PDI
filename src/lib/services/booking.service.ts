import { SupabaseClient } from "@supabase/supabase-js";
import type { Booking, BookingStatus, BookingFilters } from "@/lib/types";

export class BookingService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * List bookings with flexible filtering based on user role and query parameters
   */
  async listBookings(filters: BookingFilters): Promise<{ bookings: Booking[]; total: number }> {
    let query = this.supabase
      .from("bookings")
      .select(`
        *,
        vehicle:vehicles(*),
        customer:profiles!bookings_customer_id_fkey(*),
        inspector:profiles!bookings_inspector_id_fkey(*),
        pricing_plan:pricing_plans(*)
      `, { count: "exact" });

    // Apply role-based filters
    if (filters.customer_id) {
      query = query.eq("customer_id", filters.customer_id);
    }
    if (filters.inspector_id) {
      query = query.eq("inspector_id", filters.inspector_id);
    }

    // Apply status filters
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    // Date range filters
    if (filters.date_from) {
      query = query.gte("scheduled_date", filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte("scheduled_date", filters.date_to);
    }

    // Sorting
    const sortBy = filters.sort_by || "created_at";
    const sortOrder = filters.sort_order || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Pagination
    if (filters.page && filters.per_page) {
      const from = (filters.page - 1) * filters.per_page;
      const to = from + filters.per_page - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      bookings: data as Booking[],
      total: count || 0,
    };
  }

  /**
   * Get detail on a single booking including related models
   */
  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select(`
        *,
        vehicle:vehicles(*),
        customer:profiles!bookings_customer_id_fkey(*),
        inspector:profiles!bookings_inspector_id_fkey(*),
        pricing_plan:pricing_plans(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Booking;
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    const { data, error } = await this.supabase
      .from("bookings")
      .insert({
        ...bookingData,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  }

  /**
   * Update booking info
   */
  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const { data, error } = await this.supabase
      .from("bookings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  }

  /**
   * Assign an inspector to a booking
   */
  async assignInspector(id: string, inspectorId: string): Promise<Booking> {
    const { data, error } = await this.supabase
      .from("bookings")
      .update({
        inspector_id: inspectorId,
        status: "assigned",
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  }

  /**
   * Cancel an existing booking
   */
  async cancelBooking(id: string, reason: string): Promise<Booking> {
    const { data, error } = await this.supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  }
}
