import { SupabaseClient } from "@supabase/supabase-js";
import type { Invoice } from "@/lib/types";

export class InvoiceService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * List invoices (admin gets all, customer gets their own)
   */
  async listInvoices(filters: { customer_id?: string; page?: number; per_page?: number }): Promise<{ invoices: Invoice[]; total: number }> {
    let query = this.supabase
      .from("invoices")
      .select(`
        *,
        booking:bookings(*, vehicle:vehicles(*)),
        customer:profiles(*)
      `, { count: "exact" });

    if (filters.customer_id) {
      query = query.eq("customer_id", filters.customer_id);
    }

    query = query.order("created_at", { ascending: false });

    if (filters.page && filters.per_page) {
      const from = (filters.page - 1) * filters.per_page;
      const to = from + filters.per_page - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      invoices: data as unknown as Invoice[],
      total: count || 0,
    };
  }

  /**
   * Get detail on a single invoice
   */
  async getInvoiceById(id: string): Promise<Invoice | null> {
    const { data, error } = await this.supabase
      .from("invoices")
      .select(`
        *,
        booking:bookings(*, vehicle:vehicles(*)),
        customer:profiles(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as Invoice;
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from("invoices")
      .insert({
        ...invoiceData,
        status: invoiceData.status || "draft",
      })
      .select(`
        *,
        booking:bookings(*, vehicle:vehicles(*)),
        customer:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data as unknown as Invoice;
  }

  /**
   * Update invoice details
   */
  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from("invoices")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        booking:bookings(*, vehicle:vehicles(*)),
        customer:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data as unknown as Invoice;
  }
}
