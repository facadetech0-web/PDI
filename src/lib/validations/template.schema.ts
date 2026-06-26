import { z } from "zod";

export const checklistItemTemplateSchema = z.object({
  label: z.string().min(1, "Item label is required"),
  type: z.enum(["select", "text", "boolean"]).default("select"),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(),
});

export const categoryTemplateSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  sort: z.number().int().default(0),
  items: z.array(checklistItemTemplateSchema).min(1, "At least one item is required in a category"),
});

export const templateSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().nullable(),
  inspection_type: z.string().min(1, "Inspection type is required"),
  categories: z.array(categoryTemplateSchema).min(1, "At least one category is required"),
  is_active: z.boolean().default(true),
});

export type ChecklistItemTemplateInput = z.infer<typeof checklistItemTemplateSchema>;
export type CategoryTemplateInput = z.infer<typeof categoryTemplateSchema>;
export type TemplateInput = z.infer<typeof templateSchema>;
