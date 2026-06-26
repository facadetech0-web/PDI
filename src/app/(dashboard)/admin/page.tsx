"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Calendar, Wrench, IndianRupee, ClipboardList, Plus, ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useBookings } from "@/lib/hooks/use-bookings";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default function AdminDashboardPage() {
  const { bookings, totalCount, isLoading } = useBookings();

  // Calculate quick metrics
  const metrics = React.useMemo(() => {
    const totalBookings = totalCount;
    
    const unassigned = bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length;
    
    const completed = bookings.filter((b) => b.status === "completed");
    
    const totalRevenue = completed.reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const completionRate = totalBookings > 0 
      ? Math.round((completed.length / totalBookings) * 100) 
      : 0;

    return [
      {
        label: "Total Bookings",
        value: totalBookings,
        icon: Calendar,
        description: "Placed booking requests",
        color: "text-primary",
      },
      {
        label: "Estimated Revenue",
        value: formatCurrency(totalRevenue),
        icon: IndianRupee,
        description: "From completed jobs",
        color: "text-success",
      },
      {
        label: "Needs Assignment",
        value: unassigned,
        icon: Wrench,
        description: "Bookings needing inspector",
        color: "text-warning",
      },
      {
        label: "Completion Rate",
        value: `${completionRate}%`,
        icon: ClipboardList,
        description: "Submitted reports percentage",
        color: "text-secondary",
      },
    ];
  }, [bookings, totalCount]);

  // Filter bookings that need assignment (pending/confirmed and inspector_id is null)
  const pendingAssignment = React.useMemo(() => {
    return bookings.filter((b) => b.status === "pending" && !b.inspector_id);
  }, [bookings]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Welcome & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-white/5 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gradient-primary tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Oversee inspection bookings, inspector dispatching, template modifications, and system-wide logs.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/bookings">
            <Button variant="primary" size="sm">
              Manage Bookings
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {metric.label}
                  </span>
                  {isLoading ? (
                    <Spinner size="sm" className="mt-2" />
                  ) : (
                    <span className={`text-2xl font-extrabold mt-1 ${metric.color}`}>
                      {metric.value}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground/60 mt-1">
                    {metric.description}
                  </span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 text-muted-foreground flex items-center justify-center">
                  <Icon className="h-6 w-6 stroke-1.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Needs Assignment Worklist & General Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs assignment column */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning shrink-0" />
              Dispatch Worklist
            </CardTitle>
            <CardDescription>Bookings pending inspector dispatcher assignment</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : pendingAssignment.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-xl bg-white/2">
                <p className="text-sm text-muted-foreground">All bookings dispatched! No pending assignments.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingAssignment.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {booking.vehicle?.make} {booking.vehicle?.model} ({booking.vehicle?.year})
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Booking: {booking.booking_number} • Date: {formatDate(booking.scheduled_date)} • Loc: {booking.location_address}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <StatusBadge status={booking.status} />
                      <Link href={`/admin/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm">
                          Dispatch
                          <ChevronRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Shortcut Quicklinks */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Quick Management</CardTitle>
            <CardDescription>Shortcuts to platform configurations</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            <Link href="/admin/templates" className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
              <span className="text-sm font-semibold text-foreground">Checklist Templates</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/admin/pricing" className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
              <span className="text-sm font-semibold text-foreground">Pricing Tiers</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/admin/coupons" className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
              <span className="text-sm font-semibold text-foreground">Discount Coupons</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/admin/audit-logs" className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
              <span className="text-sm font-semibold text-foreground">Security Audit Trail</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
