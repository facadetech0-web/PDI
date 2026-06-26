import { SupabaseClient } from "@supabase/supabase-js";
import type { Referral, ReferralUse } from "@/lib/types";

export class ReferralService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Get the referral details for a user profile
   */
  async getReferralByUserId(userId: string): Promise<Referral | null> {
    const { data, error } = await this.supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Referral;
  }

  /**
   * Get the list of profiles that signed up or booked using a user's referral code
   */
  async getReferralUses(referralId: string): Promise<(ReferralUse & { referred_profile?: { full_name: string; email: string } })[]> {
    const { data, error } = await this.supabase
      .from("referral_uses")
      .select(`
        *,
        referred_profile:referred_id(full_name, email)
      `)
      .eq("referral_id", referralId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as (ReferralUse & { referred_profile?: { full_name: string; email: string } })[];
  }

  /**
   * Validates a referral code input at checkout
   */
  async validateReferralCode(
    code: string,
    currentUserId: string
  ): Promise<{
    isValid: boolean;
    error: string | null;
    referral: Referral | null;
  }> {
    const cleanCode = code.trim().toUpperCase();

    const { data: referral, error } = await this.supabase
      .from("referrals")
      .select("*")
      .eq("referral_code", cleanCode)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { isValid: false, error: "Referral code does not exist.", referral: null };
      }
      throw error;
    }

    if (!referral.is_active) {
      return { isValid: false, error: "This referral code is inactive.", referral };
    }

    if (referral.referrer_id === currentUserId) {
      return { isValid: false, error: "You cannot use your own referral code.", referral };
    }

    // Check if the current user has already used a referral code before
    const { count, error: countError } = await this.supabase
      .from("referral_uses")
      .select("id", { count: "exact", head: true })
      .eq("referred_id", currentUserId);

    if (countError) throw countError;

    if (count !== null && count > 0) {
      return { isValid: false, error: "You have already used a referral code in the past.", referral };
    }

    return {
      isValid: true,
      error: null,
      referral,
    };
  }

  /**
   * Logs a referral use when a booking is created
   */
  async applyReferralCode(
    code: string,
    referredId: string,
    bookingId: string
  ): Promise<ReferralUse> {
    const validation = await this.validateReferralCode(code, referredId);
    if (!validation.isValid || !validation.referral) {
      throw new Error(validation.error || "Invalid referral code.");
    }

    const { data: useRecord, error } = await this.supabase
      .from("referral_uses")
      .insert({
        referral_id: validation.referral.id,
        referred_id: referredId,
        booking_id: bookingId,
        reward_earned: validation.referral.reward_amount,
      })
      .select()
      .single();

    if (error) throw error;

    // Update totals on referrals table
    const { error: updateError } = await this.supabase.rpc("increment_referral_stats", {
      ref_id: validation.referral.id,
      reward_val: validation.referral.reward_amount,
    });

    // Fallback if RPC is not available/working directly
    if (updateError) {
      await this.supabase
        .from("referrals")
        .update({
          total_referrals: validation.referral.total_referrals + 1,
          total_earned: Number(validation.referral.total_earned) + Number(validation.referral.reward_amount),
        })
        .eq("id", validation.referral.id);
    }

    return useRecord as ReferralUse;
  }
}
