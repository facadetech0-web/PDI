import { SupabaseClient } from "@supabase/supabase-js";
import type { Vehicle } from "@/lib/types";

export class VehicleService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * List vehicles owned by a specific profile (customer)
   */
  async listVehicles(ownerId: string): Promise<Vehicle[]> {
    const { data, error } = await this.supabase
      .from("vehicles")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Vehicle[];
  }

  /**
   * Get detail on a single vehicle
   */
  async getVehicleById(id: string): Promise<Vehicle | null> {
    const { data, error } = await this.supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Vehicle;
  }

  /**
   * Create a new vehicle record
   */
  async createVehicle(ownerId: string, vehicleData: Omit<Vehicle, "id" | "owner_id" | "is_active" | "created_at" | "updated_at">): Promise<Vehicle> {
    const { data, error } = await this.supabase
      .from("vehicles")
      .insert({
        ...vehicleData,
        owner_id: ownerId,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Vehicle;
  }

  /**
   * Update an existing vehicle record
   */
  async updateVehicle(id: string, updates: Partial<Omit<Vehicle, "id" | "owner_id" | "created_at">>): Promise<Vehicle> {
    const { data, error } = await this.supabase
      .from("vehicles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Vehicle;
  }

  /**
   * Deactivate a vehicle (soft delete)
   */
  async deleteVehicle(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("vehicles")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }
}
