import { z } from 'zod';

export const bookingSchema = z.object({
  vehicle_id: z.string().uuid('Please select a vehicle'),
  pricing_plan_id: z.string().uuid('Please select an inspection plan'),
  scheduled_date: z.string().min(1, 'Please select a date'),
  scheduled_time: z.string().min(1, 'Please select a time'),
  location_address: z.string().min(5, 'Please enter the inspection location'),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().or(z.literal('')),
  coupon_code: z.string().optional().or(z.literal('')),
  referral_code: z.string().optional().or(z.literal('')),
});

export const assignInspectorSchema = z.object({
  inspector_id: z.string().uuid('Please select an inspector'),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason for cancellation').max(500),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type AssignInspectorInput = z.infer<typeof assignInspectorSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
