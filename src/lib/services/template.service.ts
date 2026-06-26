import { SupabaseClient } from "@supabase/supabase-js";
import type { InspectionTemplate } from "@/lib/types";

export class TemplateService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * List templates
   */
  async listTemplates(): Promise<InspectionTemplate[]> {
    const { data, error } = await this.supabase
      .from("inspection_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as InspectionTemplate[];
  }

  /**
   * Get active templates
   */
  async listActiveTemplates(): Promise<InspectionTemplate[]> {
    const { data, error } = await this.supabase
      .from("inspection_templates")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as InspectionTemplate[];
  }

  /**
   * Get template by id
   */
  async getTemplateById(id: string): Promise<InspectionTemplate | null> {
    const { data, error } = await this.supabase
      .from("inspection_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as InspectionTemplate;
  }

  /**
   * Create template
   */
  async createTemplate(templateData: Partial<InspectionTemplate>): Promise<InspectionTemplate> {
    const { data, error } = await this.supabase
      .from("inspection_templates")
      .insert({
        ...templateData,
        is_active: templateData.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as InspectionTemplate;
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, updates: Partial<InspectionTemplate>): Promise<InspectionTemplate> {
    const { data, error } = await this.supabase
      .from("inspection_templates")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as InspectionTemplate;
  }

  /**
   * Delete template (or toggle active)
   */
  async deleteTemplate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("inspection_templates")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
