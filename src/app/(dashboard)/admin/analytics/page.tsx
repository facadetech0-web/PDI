"use client";

import * as React from "react";
import { TrendingUp, DollarSign, Calendar, Star, ShieldCheck, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnalyticsChart } from "@/components/features/analytics-chart";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";

export default function AdminAnalyticsPage() {
  const supabase = createClient();
  const [stats, setStats] = React.useState<any>(null);
  const [revenueData, setRevenueData] = React.useState<any[]>([]);
  const [distributionData, setDistributionData] = React.useState<any[]>([]);
  const [performance, setPerformance] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const analyticsService = React.useMemo(
    () => new AnalyticsService(supabase),
    [supabase]
  );

  const loadAnalytics = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const dashboardStats = await analyticsService.getDashboardStats();
      setStats(dashboardStats);

      const revenue = await analyticsService.getRevenueChartData();
      setRevenueData(revenue);

      const distribution = await analyticsService.getBookingPlanDistribution();
      setDistributionData(distribution);

      const perf = await analyticsService.getInspectorPerformance();
      setPerformance(perf);
    } catch (err: any) {
      console.error("Error loading analytics data:", err);
      toast.error("Failed to load business intelligence data.");
    } finally {
      setIsLoading(false);
    }
  }, [analyticsService]);

  React.useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExportCSV = () => {
    if (performance.length === 0) return;
    try {
      const headers = ["Inspector Name", "Email", "Jobs Completed", "Rating Avg", "Rating Count"];
      const rows = performance.map((p) => [
        p.full_name,
        p.email,
        p.completed_jobs,
        p.rating_avg,
        p.rating_count,
      ]);
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inspector_performance_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV export downloaded successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export analytics report.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-gradient">
            Analytics & BI Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze revenues, booking volumes, plan distribution, and inspector performance metrics.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-white/10 hover:bg-white/5 cursor-pointer"
          onClick={handleExportCSV}
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-white/5 bg-card/45 backdrop-blur-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              {formatCurrency(stats?.totalRevenue || 0)}
            </span>
            <span className="text-xs text-emerald-400 mt-1 block font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />+{stats?.revenueGrowth}% MoM
            </span>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-6 border-white/5 bg-card/45 backdrop-blur-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
              Total Bookings
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              {stats?.totalBookings || 0}
            </span>
            <span className="text-xs text-emerald-400 mt-1 block font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />+{stats?.bookingGrowth}% MoM
            </span>
          </div>
          <div className="p-3 bg-accent/10 text-accent rounded-xl">
            <Calendar className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-6 border-white/5 bg-card/45 backdrop-blur-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
              Active Inspectors
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              {stats?.activeInspectors || 0}
            </span>
            <span className="text-xs text-muted-foreground/60 mt-1 block">
              Fully certified experts
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-6 border-white/5 bg-card/45 backdrop-blur-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
              Active Garage Cars
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              {stats?.activeVehicles || 0}
            </span>
            <span className="text-xs text-muted-foreground/60 mt-1 block">
              Registered customers garage
            </span>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-white/5 bg-card/45 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Monthly completed bookings invoice revenue chart</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <AnalyticsChart type="revenue" data={revenueData} />
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/45 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Inspection Tier Distribution</CardTitle>
            <CardDescription>Booked inspections percentage share by plan</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex items-center justify-center">
            <AnalyticsChart type="distribution" data={distributionData} height={260} />
          </CardContent>
        </Card>
      </div>

      {/* Inspector Performance Table */}
      <Card className="border-white/5 bg-card/45 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Inspector Efficiency & Rating Audit</CardTitle>
          <CardDescription>Performance tracking and reviews feedback aggregates</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {performance.length === 0 ? (
            <div className="text-center py-10 px-6">
              <p className="text-sm text-muted-foreground">No active inspectors registered.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-muted-foreground font-medium bg-black/10">
                    <th className="px-6 py-4">Inspector Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Completed Jobs</th>
                    <th className="px-6 py-4">Average Rating</th>
                    <th className="px-6 py-4">Total Reviews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {performance.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {p.full_name}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {p.email}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {p.completed_jobs}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-warning">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          {p.rating_avg.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {p.rating_count} reviews
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
