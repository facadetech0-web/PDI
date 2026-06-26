import { SupabaseClient } from "@supabase/supabase-js";
import type { ChartDataPoint } from "@/lib/types";

export class AnalyticsService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Fetch core dashboard totals for admin overview cards
   */
  async getDashboardStats(): Promise<{
    totalRevenue: number;
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
    activeInspectors: number;
    activeVehicles: number;
    revenueGrowth: number; // percentage MoM
    bookingGrowth: number; // percentage MoM
  }> {
    // 1. Fetch total paid revenue from invoices
    const { data: revenueData, error: revenueError } = await this.supabase
      .from("invoices")
      .select("total_amount")
      .eq("status", "paid");

    if (revenueError) throw revenueError;
    const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

    // 2. Fetch bookings count
    const { count: totalBookings, error: bookingsError } = await this.supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    if (bookingsError) throw bookingsError;

    // 3. Fetch pending bookings count
    const { count: pendingBookings, error: pendingError } = await this.supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "confirmed", "assigned", "in_progress"]);

    if (pendingError) throw pendingError;

    // 4. Fetch completed bookings count
    const { count: completedBookings, error: completedError } = await this.supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    if (completedError) throw completedError;

    // 5. Count active inspectors
    const { count: activeInspectors, error: inspectorsError } = await this.supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "inspector")
      .eq("is_active", true);

    if (inspectorsError) throw inspectorsError;

    // 6. Count active vehicles
    const { count: activeVehicles, error: vehiclesError } = await this.supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (vehiclesError) throw vehiclesError;

    // Set static mock growth calculations for default display
    const revenueGrowth = 12.5;
    const bookingGrowth = 8.3;

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalBookings: totalBookings || 0,
      pendingBookings: pendingBookings || 0,
      completedBookings: completedBookings || 0,
      activeInspectors: activeInspectors || 0,
      activeVehicles: activeVehicles || 0,
      revenueGrowth,
      bookingGrowth,
    };
  }

  /**
   * Fetch revenue chart data grouped by month
   */
  async getRevenueChartData(): Promise<ChartDataPoint[]> {
    const { data, error } = await this.supabase
      .from("invoices")
      .select("total_amount, paid_at")
      .eq("status", "paid")
      .not("paid_at", "is", null);

    if (error) throw error;

    // Group by month
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTotals: Record<string, number> = {};

    months.forEach((m) => {
      monthlyTotals[m] = 0;
    });

    data?.forEach((inv) => {
      const date = new Date(inv.paid_at);
      const monthLabel = months[date.getMonth()];
      monthlyTotals[monthLabel] = (monthlyTotals[monthLabel] || 0) + Number(inv.total_amount);
    });

    return months.map((m) => ({
      label: m,
      value: Number(monthlyTotals[m].toFixed(2)),
    }));
  }

  /**
   * Fetch booking categories / distribution
   */
  async getBookingPlanDistribution(): Promise<ChartDataPoint[]> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select("pricing_plan:pricing_plan_id(name)");

    if (error) throw error;

    const counts: Record<string, number> = {};

    data?.forEach((b) => {
      const planName = (b.pricing_plan as unknown as { name: string } | null)?.name || "Unassigned Plan";
      counts[planName] = (counts[planName] || 0) + 1;
    });

    return Object.keys(counts).map((plan) => ({
      label: plan,
      value: counts[plan],
    }));
  }

  /**
   * Fetch performance ratings for inspectors
   */
  async getInspectorPerformance(): Promise<
    {
      id: string;
      full_name: string;
      email: string;
      rating_avg: number;
      rating_count: number;
      completed_jobs: number;
    }[]
  > {
    const { data: profiles, error: pError } = await this.supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        inspector_profiles:id(rating_avg, rating_count)
      `)
      .eq("role", "inspector")
      .eq("is_active", true);

    if (pError) throw pError;

    const performance = [];

    for (const p of profiles) {
      const inspectorId = p.id;
      // Get completed bookings count
      const { count, error: countError } = await this.supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("inspector_id", inspectorId)
        .eq("status", "completed");

      if (countError) throw countError;

      const profileDetails = p.inspector_profiles as unknown as { rating_avg: number; rating_count: number } | null;

      performance.push({
        id: inspectorId,
        full_name: p.full_name,
        email: p.email,
        rating_avg: Number(profileDetails?.rating_avg || 0),
        rating_count: Number(profileDetails?.rating_count || 0),
        completed_jobs: count || 0,
      });
    }

    return performance;
  }
}
