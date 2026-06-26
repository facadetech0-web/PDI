import { z } from "zod";

export const checklistItemSchema = z.object({
  condition: z.enum([
    "excellent",
    "good",
    "fair",
    "poor",
    "critical",
    "not_applicable",
  ]),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  photos: z.array(z.string().url("Must be a valid media URL")).optional(),
});

export const saveDraftSchema = z.object({
  checklist_data: z.record(z.string(), z.record(z.string(), checklistItemSchema)),
  overall_score: z.number().min(0).max(100).optional(),
  category_scores: z.record(z.string(), z.number().min(0).max(100)).optional(),
  summary: z.string().max(2000, "Summary cannot exceed 2000 characters").optional(),
  recommendations: z.array(z.string().max(200, "Recommendation is too long")).optional(),
});

export const submitInspectionSchema = z.object({
  checklist_data: z.record(z.string(), z.record(z.string(), checklistItemSchema)),
  overall_score: z.number().min(0).max(100, "Score must be between 0 and 100"),
  category_scores: z.record(z.string(), z.number().min(0).max(100)),
  summary: z.string().min(10, "Summary must be at least 10 characters").max(2000),
  recommendations: z.array(z.string().min(3).max(200)),
  inspector_signature: z.string().min(10, "Inspector signature is required"),
  customer_signature: z.string().optional(),
  start_location: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number(),
    timestamp: z.string(),
  }).optional(),
  end_location: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number(),
    timestamp: z.string(),
  }).optional(),
});

export type ChecklistItemInput = z.infer<typeof checklistItemSchema>;
export type SaveDraftInput = z.infer<typeof saveDraftSchema>;
export type SubmitInspectionInput = z.infer<typeof submitInspectionSchema>;
