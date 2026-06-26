import { z } from 'zod';

export const reviewSchema = z.object({
  booking_id: z.string().uuid(),
  inspector_id: z.string().uuid(),
  rating: z.number().int().min(1, 'Please provide a rating').max(5),
  title: z.string().max(100).optional().or(z.literal('')),
  comment: z.string().max(1000).optional().or(z.literal('')),
});

export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20).toUpperCase(),
  description: z.string().max(200).optional().or(z.literal('')),
  coupon_type: z.enum(['percentage', 'fixed']),
  value: z.number().positive('Value must be greater than 0'),
  min_order: z.number().min(0).default(0),
  max_discount: z.number().positive().optional(),
  usage_limit: z.number().int().positive().optional(),
  per_user_limit: z.number().int().positive().default(1),
  valid_from: z.string().min(1, 'Start date is required'),
  valid_until: z.string().min(1, 'End date is required'),
  applicable_plans: z.array(z.string()).default([]),
});

export const blogPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  excerpt: z.string().max(500).optional().or(z.literal('')),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  cover_image: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string()).default([]),
  seo_title: z.string().max(70).optional().or(z.literal('')),
  seo_description: z.string().max(160).optional().or(z.literal('')),
});

export const invoiceSchema = z.object({
  booking_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  subtotal: z.number().positive(),
  discount_amount: z.number().min(0).default(0),
  tax_rate: z.number().min(0).max(100).default(18),
  notes: z.string().max(500).optional().or(z.literal('')),
  due_date: z.string().optional(),
  line_items: z.array(z.object({
    description: z.string().min(1),
    qty: z.number().int().positive(),
    unit_price: z.number().positive(),
    total: z.number().positive(),
  })).min(1, 'At least one line item is required'),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
