'use client';

import { create } from 'zustand';
import type { Booking, BookingFilters } from '@/lib/types';

interface BookingState {
  bookings: Booking[];
  totalCount: number;
  currentBooking: Booking | null;
  filters: BookingFilters;
  isLoading: boolean;

  setBookings: (bookings: Booking[], total?: number) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  setFilters: (filters: Partial<BookingFilters>) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  totalCount: 0,
  currentBooking: null,
  filters: {
    page: 1,
    per_page: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
  },
  isLoading: false,

  setBookings: (bookings, total) =>
    set((state) => ({
      bookings,
      totalCount: total !== undefined ? total : bookings.length,
    })),
  setCurrentBooking: (currentBooking) => set({ currentBooking }),
  setFilters: (updatedFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...updatedFilters },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      bookings: [],
      totalCount: 0,
      currentBooking: null,
      filters: {
        page: 1,
        per_page: 10,
        sort_by: 'created_at',
        sort_order: 'desc',
      },
      isLoading: false,
    }),
}));
