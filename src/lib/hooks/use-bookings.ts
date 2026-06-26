"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { BookingService } from "@/lib/services/booking.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { Booking, BookingFilters } from "@/lib/types";
import { toast } from "@/components/ui/toast";

export function useBookings(initialFilters: BookingFilters = {}) {
  const supabase = createClient();
  const { profile } = useAuthStore();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filters, setFilters] = React.useState<BookingFilters>(initialFilters);

  const bookingService = React.useMemo(
    () => new BookingService(supabase),
    [supabase]
  );

  const fetchBookings = React.useCallback(async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const roleFilters: BookingFilters = { ...filters };
      
      // Inject role constraints
      if (profile.role === "customer") {
        roleFilters.customer_id = profile.id;
      } else if (profile.role === "inspector") {
        roleFilters.inspector_id = profile.id;
      }

      const { bookings: list, total } = await bookingService.listBookings(roleFilters);
      setBookings(list);
      setTotalCount(total);
    } catch (err: any) {
      console.error("Error loading bookings:", err);
      toast.error("Failed to load bookings list.");
    } finally {
      setIsLoading(false);
    }
  }, [profile, filters, bookingService]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = async (bookingData: Partial<Booking>) => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const newBooking = await bookingService.createBooking({
        ...bookingData,
        customer_id: profile.id,
      });
      setBookings((prev) => [newBooking, ...prev]);
      toast.success("Booking placed successfully!");
      return newBooking;
    } catch (err: any) {
      console.error("Error creating booking:", err);
      toast.error(err.message || "Failed to submit booking.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    setIsLoading(true);
    try {
      const updated = await bookingService.updateBooking(id, updates);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      toast.success("Booking updated successfully!");
      return updated;
    } catch (err: any) {
      console.error("Error updating booking:", err);
      toast.error(err.message || "Failed to update booking.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (id: string, reason: string) => {
    setIsLoading(true);
    try {
      const updated = await bookingService.cancelBooking(id, reason);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      toast.success("Booking cancelled successfully.");
      return updated;
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      toast.error(err.message || "Failed to cancel booking.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    bookings,
    totalCount,
    isLoading,
    filters,
    setFilters,
    refresh: fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
  };
}
