"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { VehicleService } from "@/lib/services/vehicle.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { Vehicle } from "@/lib/types";
import { toast } from "@/components/ui/toast";

export function useVehicles() {
  const supabase = createClient();
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicleService = React.useMemo(
    () => new VehicleService(supabase),
    [supabase]
  );

  const fetchVehicles = React.useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const list = await vehicleService.listVehicles(user.id);
      setVehicles(list);
    } catch (err: any) {
      console.error("Error loading vehicles:", err);
      toast.error("Failed to load vehicle list.");
    } finally {
      setIsLoading(false);
    }
  }, [user, vehicleService]);

  React.useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const addVehicle = async (vehicleData: Omit<Vehicle, "id" | "owner_id" | "is_active" | "created_at" | "updated_at">) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const newVehicle = await vehicleService.createVehicle(user.id, vehicleData);
      setVehicles((prev) => [newVehicle, ...prev]);
      toast.success("Vehicle added successfully!");
      return newVehicle;
    } catch (err: any) {
      console.error("Error creating vehicle:", err);
      toast.error(err.message || "Failed to add vehicle.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    setIsLoading(true);
    try {
      const updated = await vehicleService.updateVehicle(id, updates);
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
      toast.success("Vehicle updated successfully!");
      return updated;
    } catch (err: any) {
      console.error("Error updating vehicle:", err);
      toast.error(err.message || "Failed to update vehicle.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    setIsLoading(true);
    try {
      await vehicleService.deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      toast.success("Vehicle removed successfully.");
    } catch (err: any) {
      console.error("Error deleting vehicle:", err);
      toast.error("Failed to remove vehicle.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vehicles,
    isLoading,
    refresh: fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  };
}
