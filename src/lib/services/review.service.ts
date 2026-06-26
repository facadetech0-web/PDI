import { SupabaseClient } from "@supabase/supabase-js";
import type { Review } from "@/lib/types";

export class ReviewService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * List reviews for a specific inspector
   */
  async listReviewsForInspector(inspectorId: string): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from("reviews")
      .select(`
        *,
        customer:customer_id(full_name, avatar_url)
      `)
      .eq("inspector_id", inspectorId)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as Review[];
  }

  /**
   * Get review by booking ID
   */
  async getReviewByBookingId(bookingId: string): Promise<Review | null> {
    const { data, error } = await this.supabase
      .from("reviews")
      .select("*")
      .eq("booking_id", bookingId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Review;
  }

  /**
   * Submit a new customer review
   */
  async createReview(
    reviewData: Omit<Review, "id" | "is_published" | "created_at" | "updated_at" | "admin_response">
  ): Promise<Review> {
    const { data, error } = await this.supabase
      .from("reviews")
      .insert({
        ...reviewData,
        is_published: true, // Auto-publish by default, can be moderated by admins
      })
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  }

  /**
   * Update review (e.g., admin publishing toggle or response comment)
   */
  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const { data, error } = await this.supabase
      .from("reviews")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  }

  /**
   * Delete review
   */
  async deleteReview(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
