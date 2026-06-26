"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Car, User, Calendar, MapPin, Wrench } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/client";
import { BookingService } from "@/lib/services/booking.service";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";
import type { Booking, Profile } from "@/lib/types";
import Link from "next/link";

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params.id as string;

  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [inspectors, setInspectors] = React.useState<Profile[]>([]);
  const [selectedInspectorId, setSelectedInspectorId] = React.useState("");
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDispatching, setIsDispatching] = React.useState(false);

  const bookingService = React.useMemo(() => new BookingService(supabase), [supabase]);

  React.useEffect(() => {
    async function loadData() {
      try {
        // 1. Load booking details
        const details = await bookingService.getBookingById(id);
        setBooking(details);
        if (details?.inspector_id) {
          setSelectedInspectorId(details.inspector_id);
        }

        // 2. Load available inspectors list
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "inspector")
          .eq("is_active", true);

        if (error) throw error;
        setInspectors(profiles as Profile[]);
      } catch (err) {
        console.error("Error loading dispatch page data:", err);
        toast.error("Failed to load details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id, bookingService, supabase]);

  const handleDispatch = async () => {
    if (!selectedInspectorId) {
      toast.error("Please select an inspector to dispatch.");
      return;
    }
    setIsDispatching(true);
    try {
      // 1. Call assign inspector service
      const updated = await bookingService.assignInspector(id, selectedInspectorId);
      setBooking(updated);
      toast.success("Inspector dispatched successfully!");
      router.refresh();
    } catch (err: any) {
      console.error("Dispatch error:", err);
      toast.error(err.message || "Failed to dispatch inspector.");
    } finally {
      setIsDispatching(false);
    }
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
        <Link href="/admin/bookings" className="mt-4 inline-block">
          <Button size="sm">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
            Dispatch Audit
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Booking: {booking.booking_number}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Dispatch action control card */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dispatched Auditor</CardTitle>
                <CardDescription>Allocate an active inspector dispatcher to start audit</CardDescription>
              </div>
              <StatusBadge status={booking.status} />
            </CardHeader>
            <CardContent className="p-6 pt-2 flex flex-col gap-6">
              <Select
                label="Select Inspector"
                value={selectedInspectorId}
                onChange={(e) => setSelectedInspectorId(e.target.value)}
                disabled={isDispatching || booking.status === "completed" || booking.status === "cancelled"}
              >
                <option value="">Choose an inspector...</option>
                {inspectors.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.full_name} ({ins.email})
                  </option>
                ))}
              </Select>
            </CardContent>
            {booking.status !== "completed" && booking.status !== "cancelled" && (
              <CardFooter className="flex justify-end bg-black/10 px-6 py-4">
                <Button onClick={handleDispatch} isLoading={isDispatching}>
                  <Wrench className="mr-1.5 h-4 w-4" />
                  Assign & Dispatch
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Right Side: details overview panel */}
        <div className="flex flex-col gap-6">
          {/* Client profile info */}
          <Card>
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Client Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground/80 flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Name</span>
                <span className="font-semibold text-foreground">{booking.customer?.full_name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Email</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{booking.customer?.email || "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle detail */}
          <Card>
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Vehicle Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground/80 flex flex-col gap-2">
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
                <span>Plate</span>
                <span className="font-semibold text-foreground uppercase">{booking.vehicle?.license_plate || "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Appt schedule info */}
          <Card>
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Appointment
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
                <span className="text-xs text-muted-foreground/50">Address location</span>
                <span className="font-semibold text-foreground leading-snug flex items-start gap-1.5 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {booking.location_address}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
