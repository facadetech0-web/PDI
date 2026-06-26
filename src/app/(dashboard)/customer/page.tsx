"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Car, Calendar, FileText, ChevronRight, LayoutDashboard, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useBookings } from "@/lib/hooks/use-bookings";
import { useVehicles } from "@/lib/hooks/use-vehicles";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils/format";

export default function CustomerDashboardPage() {
  const { profile } = useAuthStore();
  const { bookings, isLoading: bookingsLoading } = useBookings({ per_page: 5 });
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();

  const fullName = profile?.full_name || "Customer";

  const stats = React.useMemo(() => {
    return [
      {
        label: "Registered Vehicles",
        value: vehicles.length,
        icon: Car,
        description: "Active cars in garage",
      },
      {
        label: "Total Bookings",
        value: bookings.length,
        icon: Calendar,
        description: "Scheduled inspections",
      },
      {
        label: "Available Reports",
        value: bookings.filter((b) => b.status === "completed").length,
        icon: FileText,
        description: "Branded PDF audit certificates",
      },
    ];
  }, [vehicles, bookings]);

  const isLoading = bookingsLoading || vehiclesLoading;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Welcome Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-white/5 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gradient-primary tracking-tight">
            Welcome back, {fullName}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your vehicle inspection bookings, access reports, and manage your cars.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/customer/vehicles/new">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </Link>
          <Link href="/customer/bookings/new">
            <Button variant="primary" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Book Inspection
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </span>
                  {isLoading ? (
                    <Spinner size="sm" className="mt-2" />
                  ) : (
                    <span className="text-2xl font-extrabold text-foreground mt-1">
                      {stat.value}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground/60 mt-1">
                    {stat.description}
                  </span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/5 border border-white/5 text-primary flex items-center justify-center">
                  <Icon className="h-6 w-6 stroke-1.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Recent Bookings & Garage Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings column */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Status updates of your scheduled inspections</CardDescription>
            </div>
            <Link href="/customer/bookings" className="text-xs text-primary hover:underline font-medium">
              View All
            </Link>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {bookingsLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-xl bg-white/2">
                <p className="text-sm text-muted-foreground">No bookings scheduled yet.</p>
                <Link href="/customer/bookings/new" className="mt-4 inline-block">
                  <Button size="sm">Book Your First Audit</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {bookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          {booking.vehicle?.make} {booking.vehicle?.model} ({booking.vehicle?.year})
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          Booking: {booking.booking_number} • Date: {formatDate(booking.scheduled_date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <StatusBadge status={booking.status} />
                      <Link href={`/customer/bookings/${booking.id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Garage Preview Column */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Garage</CardTitle>
              <CardDescription>Manage active vehicles</CardDescription>
            </div>
            <Link href="/customer/vehicles" className="text-xs text-primary hover:underline font-medium">
              View All
            </Link>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {vehiclesLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-xl bg-white/2">
                <p className="text-sm text-muted-foreground">Garage is empty.</p>
                <Link href="/customer/vehicles/new" className="mt-4 inline-block">
                  <Button size="sm">Register A Car</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {vehicles.slice(0, 3).map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <Car className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          {vehicle.make} {vehicle.model}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          VIN: {vehicle.vin || "Not recorded"}
                        </span>
                      </div>
                    </div>
                    <Link href={`/customer/vehicles/${vehicle.id}`}>
                      <Button variant="outline" size="icon" className="h-7 w-7">
                        <ChevronRight className="h-4.5 w-4.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
