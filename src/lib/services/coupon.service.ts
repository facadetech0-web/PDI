import { SupabaseClient } from "@supabase/supabase-js";
import type { Coupon } from "@/lib/types";

export class CouponService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * List all coupons (ordered by creation date)
   */
  async listCoupons(): Promise<Coupon[]> {
    const { data, error } = await this.supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Coupon[];
  }

  /**
   * Get coupon detail by ID
   */
  async getCouponById(id: string): Promise<Coupon | null> {
    const { data, error } = await this.supabase
      .from("coupons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Coupon;
  }

  /**
   * Get coupon detail by code
   */
  async getCouponByCode(code: string): Promise<Coupon | null> {
    const { data, error } = await this.supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Coupon;
  }

  /**
   * Create a new coupon
   */
  async createCoupon(
    couponData: Omit<Coupon, "id" | "usage_count" | "created_at" | "updated_at">
  ): Promise<Coupon> {
    const { data, error } = await this.supabase
      .from("coupons")
      .insert({
        ...couponData,
        code: couponData.code.toUpperCase(),
        usage_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Coupon;
  }

  /**
   * Update an existing coupon
   */
  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const { data, error } = await this.supabase
      .from("coupons")
      .update({
        ...updates,
        code: updates.code ? updates.code.toUpperCase() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Coupon;
  }

  /**
   * Hard delete a coupon
   */
  async deleteCoupon(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Validates a coupon code against a plan and order amount for a user.
   * Returns verification state and calculated discount amount.
   */
  async validateCoupon(
    code: string,
    planSlug: string,
    orderAmount: number,
    userId: string
  ): Promise<{
    isValid: boolean;
    error: string | null;
    discountAmount: number;
    coupon: Coupon | null;
  }> {
    const coupon = await this.getCouponByCode(code);

    if (!coupon) {
      return { isValid: false, error: "Invalid coupon code.", discountAmount: 0, coupon: null };
    }

    if (!coupon.is_active) {
      return { isValid: false, error: "This coupon is no longer active.", discountAmount: 0, coupon };
    }

    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom) {
      return { isValid: false, error: "This coupon is not yet valid.", discountAmount: 0, coupon };
    }

    if (now > validUntil) {
      return { isValid: false, error: "This coupon has expired.", discountAmount: 0, coupon };
    }

    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return { isValid: false, error: "This coupon has reached its maximum usage limit.", discountAmount: 0, coupon };
    }

    if (
      coupon.applicable_plans &&
      coupon.applicable_plans.length > 0 &&
      !coupon.applicable_plans.includes(planSlug)
    ) {
      return {
        isValid: false,
        error: "This coupon is not applicable to the selected pricing plan.",
        discountAmount: 0,
        coupon,
      };
    }

    if (orderAmount < coupon.min_order) {
      return {
        isValid: false,
        error: `Minimum order amount of ₹${coupon.min_order} required.`,
        discountAmount: 0,
        coupon,
      };
    }

    // Check per-user usage limits (excluding cancelled bookings)
    const { count, error: countError } = await this.supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", userId)
      .eq("coupon_id", coupon.id)
      .not("status", "eq", "cancelled");

    if (countError) throw countError;

    if (count !== null && count >= coupon.per_user_limit) {
      return {
        isValid: false,
        error: "You have exceeded the usage limit for this coupon.",
        discountAmount: 0,
        coupon,
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.coupon_type === "percentage") {
      discountAmount = (orderAmount * coupon.value) / 100;
      if (coupon.max_discount !== null && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = coupon.value;
    }

    // Cap discount amount to order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    return {
      isValid: true,
      error: null,
      discountAmount: Number(discountAmount.toFixed(2)),
      coupon,
    };
  }
}
