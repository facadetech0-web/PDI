import { SupabaseClient } from "@supabase/supabase-js";
import type { Inspection, InspectionStatus, InspectionFilters } from "@/lib/types";

export class InspectionService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * List inspection records
   */
  async listInspections(filters: InspectionFilters): Promise<Inspection[]> {
    let query = this.supabase
      .from("inspections")
      .select(`
        *,
        booking:bookings(*, vehicle:vehicles(*), customer:profiles(*))
      `);

    if (filters.inspector_id) {
      query = query.eq("inspector_id", filters.inspector_id);
    }
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.booking_id) {
      query = query.eq("booking_id", filters.booking_id);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data as Inspection[];
  }

  /**
   * Get detail on a single inspection
   */
  async getInspectionById(id: string): Promise<Inspection | null> {
    const { data, error } = await this.supabase
      .from("inspections")
      .select(`
        *,
        booking:bookings(*, vehicle:vehicles(*), customer:profiles(*)),
        template:inspection_templates(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Inspection;
  }

  /**
   * Create a new inspection record
   */
  async createInspection(bookingId: string, inspectorId: string, templateId: string): Promise<Inspection> {
    const { data, error } = await this.supabase
      .from("inspections")
      .insert({
        booking_id: bookingId,
        inspector_id: inspectorId,
        template_id: templateId,
        status: "not_started",
      })
      .select()
      .single();

    if (error) throw error;
    return data as Inspection;
  }

  /**
   * Start an inspection audit (captures start GPS & timestamp)
   */
  async startInspection(id: string, startLocation?: { lat: number; lng: number; accuracy: number; timestamp: string }): Promise<Inspection> {
    const { data, error } = await this.supabase
      .from("inspections")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
        start_location: startLocation || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Update booking status
    const inspection = data as Inspection;
    await this.supabase
      .from("bookings")
      .update({ status: "in_progress" })
      .eq("id", inspection.booking_id);

    return inspection;
  }

  /**
   * Save draft checklist details for the inspection audit
   */
  async saveDraft(id: string, draftData: Partial<Inspection>): Promise<Inspection> {
    const { data, error } = await this.supabase
      .from("inspections")
      .update({
        checklist_data: draftData.checklist_data,
        overall_score: draftData.overall_score,
        category_scores: draftData.category_scores,
        summary: draftData.summary,
        recommendations: draftData.recommendations,
        critical_issues: draftData.critical_issues,
        draft_saved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Inspection;
  }

  /**
   * Final submission of the vehicle inspection report
   */
  async submitInspection(
    id: string,
    submission: {
      checklist_data: any;
      overall_score: number;
      category_scores: any;
      summary: string;
      recommendations: string[];
      critical_issues: any[];
      inspector_signature: string;
      customer_signature?: string;
      end_location?: { lat: number; lng: number; accuracy: number; timestamp: string };
    }
  ): Promise<Inspection> {
    const { data, error } = await this.supabase
      .from("inspections")
      .update({
        status: "submitted",
        checklist_data: submission.checklist_data,
        overall_score: submission.overall_score,
        category_scores: submission.category_scores,
        summary: submission.summary,
        recommendations: submission.recommendations,
        critical_issues: submission.critical_issues,
        inspector_signature: submission.inspector_signature,
        customer_signature: submission.customer_signature || null,
        end_location: submission.end_location || null,
        completed_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const inspection = data as Inspection;

    // Update booking status to completed
    await this.supabase
      .from("bookings")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", inspection.booking_id);

    // Auto-create initial report draft in database
    const reportNumber = `RPT-${Date.now().toString().slice(-8)}`;
    await this.supabase
      .from("reports")
      .insert({
        inspection_id: inspection.id,
        booking_id: inspection.booking_id,
        report_number: reportNumber,
        overall_score: inspection.overall_score,
        summary: inspection.summary,
        is_published: false,
      });

    return inspection;
  }
}
