"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Phone, User, Car, Download, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";
import type { Booking } from "@/lib/types";
import Link from "next/link";

export default function CustomerBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params.id as string;

  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadBooking() {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            vehicle:vehicles(*),
            customer:profiles!bookings_customer_id_fkey(*),
            inspector:profiles!bookings_inspector_id_fkey(*),
            pricing_plan:pricing_plans(*)
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        setBooking(data as Booking);
      } catch (err) {
        console.error("Error loading booking details:", err);
        toast.error("Failed to load booking details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBooking();
  }, [id, supabase]);

  const timelineSteps = [
    { status: "pending", label: "Booking Placed", description: "Waiting for confirmation" },
    { status: "confirmed", label: "Confirmed", description: "Audit request approved by admin" },
    { status: "assigned", label: "Inspector Dispatched", description: "Inspector allocated for audit" },
    { status: "in_progress", label: "Audit In Progress", description: "Inspector on-site checking vehicle" },
    { status: "completed", label: "Audit Completed", description: "PDF report generated successfully" },
  ];

  const getStepIndex = (currentStatus: string) => {
    if (currentStatus === "cancelled") return -1;
    if (currentStatus === "refunded") return -1;
    return timelineSteps.findIndex((s) => s.status === currentStatus);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-muted-foreground">Booking not found.</p>
        <Link href="/customer/bookings" className="mt-4 inline-block">
          <Button size="sm">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(booking.status);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      {/* Header back trigger */}
      <div className="flex items-center gap-4">
        <Link href="/customer/bookings">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
            Booking Details
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ref: {booking.booking_number}
          </p>
        </div>
      </div>

      {/* Grid: Timeline status tracker & Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Status Tracker Card */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Timeline Tracker</CardTitle>
              <CardDescription>Track inspection audit completion progress</CardDescription>
            </div>
            <StatusBadge status={booking.status} />
          </CardHeader>
          <CardContent className="flex-1 py-4">
            {booking.status === "cancelled" ? (
              <div className="p-4 border border-destructive/10 rounded-xl bg-destructive/5 text-destructive text-sm">
                <span className="font-bold">Booking Cancelled:</span> {booking.cancelled_reason || "No reason provided."}
              </div>
            ) : booking.status === "refunded" ? (
              <div className="p-4 border border-neutral/10 rounded-xl bg-neutral/5 text-neutral-400 text-sm">
                Booking Refunded.
              </div>
            ) : (
              <div className="relative pl-8 border-l border-white/10 flex flex-col gap-8 py-2">
                {timelineSteps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  
                  return (
                    <div key={idx} className="relative flex flex-col gap-1.5">
                      {/* Check Node circle */}
                      <div
                        className={`absolute -left-12 top-0 h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                          isCurrent
                            ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20 scale-110"
                            : isDone
                            ? "bg-success border-success text-primary-foreground"
                            : "bg-background border-white/15 text-muted-foreground/60"
                        }`}
                      >
                        {isDone && !isCurrent ? (
                          <CheckCircle className="h-4.5 w-4.5" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-bold leading-none ${
                          isDone ? "text-foreground" : "text-muted-foreground/50"
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        {step.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details right sidebar */}
        <div className="flex flex-col gap-6">
          {/* Vehicle card details */}
          <Card>
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Vehicle Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground/80 flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span>Model</span>
                <span className="font-semibold text-foreground">
                  {booking.vehicle?.make} {booking.vehicle?.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Year</span>
                <span className="font-semibold text-foreground">{booking.vehicle?.year}</span>
              </div>
              <div className="flex justify-between">
                <span>Plate No</span>
                <span className="font-semibold text-foreground uppercase">{booking.vehicle?.license_plate || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Odometer</span>
                <span className="font-semibold text-foreground">{booking.vehicle?.mileage ? `${booking.vehicle.mileage.toLocaleString()} km` : "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Schedule details */}
          <Card>
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Scheduling Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground/80 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground/50">Date & Time</span>
                <span className="font-semibold text-foreground">
                  {formatDate(booking.scheduled_date)} at {booking.scheduled_time}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-white/5 pt-2">
                <span className="text-xs text-muted-foreground/50">Inspection Address</span>
                <span className="font-semibold text-foreground leading-snug flex items-start gap-1.5 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {booking.location_address}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Inspector detail (if any) */}
          {booking.inspector_id && booking.inspector && (
            <Card>
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Assigned Auditor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm text-muted-foreground/80 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {booking.inspector.full_name[0]}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">
                    {booking.inspector.full_name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {booking.inspector.phone || "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Audit certificate download */}
          {booking.status === "completed" && (
            <Link href={`/customer/reports/`} className="w-full">
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Report PDF
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
