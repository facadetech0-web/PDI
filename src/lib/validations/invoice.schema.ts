import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  qty: z.number().int().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be positive or zero'),
  total: z.number().min(0, 'Total must be positive or zero'),
});

export const invoiceSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  customer_id: z.string().uuid('Invalid customer ID'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  subtotal: z.number().min(0, 'Subtotal must be positive or zero'),
  discount_amount: z.number().min(0, 'Discount must be positive or zero').default(0),
  tax_rate: z.number().min(0, 'Tax rate must be positive or zero').default(18.00),
  tax_amount: z.number().min(0, 'Tax amount must be positive or zero').default(0),
  total_amount: z.number().min(0, 'Total amount must be positive or zero'),
  currency: z.string().default('INR'),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  due_date: z.string().optional().nullable(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
});

export const updateInvoiceSchema = invoiceSchema.partial();

export type LineItemInput = z.infer<typeof lineItemSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
