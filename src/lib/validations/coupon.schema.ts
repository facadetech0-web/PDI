import { z } from "zod";

export const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code must be at most 20 characters")
      .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, or underscores"),
    description: z.string().max(200, "Description must be at most 200 characters").optional(),
    coupon_type: z.enum(["percentage", "fixed"]),
    value: z.coerce.number().positive("Value must be a positive number"),
    min_order: z.coerce.number().nonnegative("Minimum order must be 0 or greater").default(0),
    max_discount: z.coerce.number().positive("Maximum discount must be positive").optional().nullable(),
    usage_limit: z.coerce.number().int().positive("Usage limit must be a positive integer").optional().nullable(),
    per_user_limit: z.coerce.number().int().positive("Per user limit must be a positive integer").default(1),
    valid_from: z.string().min(1, "Start date is required"),
    valid_until: z.string().min(1, "End date is required"),
    applicable_plans: z.array(z.string()).default([]),
    is_active: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const start = new Date(data.valid_from);
      const end = new Date(data.valid_until);
      return end > start;
    },
    {
      message: "End date must be after start date",
      path: ["valid_until"],
    }
  )
  .refine(
    (data) => {
      if (data.coupon_type === "percentage") {
        return data.value > 0 && data.value <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount must be between 1 and 100",
      path: ["value"],
    }
  );

export type CouponInput = z.infer<typeof couponSchema>;
