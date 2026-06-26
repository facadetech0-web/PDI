import { SupabaseClient } from "@supabase/supabase-js";
import type { AuditLog } from "@/lib/types";

export class AuditService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Fetch system audit logs for administrative tracking
   */
  async listAuditLogs(
    filters: {
      userId?: string;
      action?: string;
      entityType?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ logs: AuditLog[]; total: number }> {
    let query = this.supabase
      .from("audit_logs")
      .select(`
        *,
        profile:user_id(full_name, email)
      `, { count: "exact" });

    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters.action) {
      query = query.eq("action", filters.action);
    }
    if (filters.entityType) {
      query = query.eq("entity_type", filters.entityType);
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      logs: data as unknown as AuditLog[],
      total: count || 0,
    };
  }

  /**
   * Log an administrative change event in the audit trail database
   */
  async logEvent(
    action: string,
    entityType: string,
    entityId: string | null,
    oldData: Record<string, unknown> | null = null,
    newData: Record<string, unknown> | null = null,
    userId: string | null = null,
    metadata: Record<string, unknown> = {}
  ): Promise<AuditLog> {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_data: oldData,
        new_data: newData,
        metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AuditLog;
  }
}
