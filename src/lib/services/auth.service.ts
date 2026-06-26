import { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

export class AuthService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Get the current authenticated user's session details
   */
  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  /**
   * Get the current authenticated user's details
   */
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  /**
   * Get the profile record for a given user ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No profile found
      throw error;
    }
    return data as Profile;
  }

  /**
   * Update the profile of the current authenticated user
   */
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  }
}
