import { z } from 'zod';

export const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required').max(100),
  model: z.string().min(1, 'Model is required').max(100),
  year: z.number()
    .int()
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  vin: z.string().length(17, 'VIN must be exactly 17 characters').optional().or(z.literal('')),
  license_plate: z.string().max(20).optional().or(z.literal('')),
  color: z.string().max(50).optional().or(z.literal('')),
  mileage: z.number().int().min(0).optional(),
  fuel_type: z.string().optional().or(z.literal('')),
  transmission: z.string().optional().or(z.literal('')),
  body_type: z.string().optional().or(z.literal('')),
  engine_size: z.string().optional().or(z.literal('')),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
