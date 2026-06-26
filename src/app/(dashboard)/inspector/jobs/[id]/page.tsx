"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Car, User, Calendar, MapPin, ClipboardCheck, Play, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useInspections } from "@/lib/hooks/use-inspections";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

export default function InspectorJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { currentInspection, isLoading, loadInspection, startInspection } = useInspections();

  React.useEffect(() => {
    loadInspection(id);
  }, [id, loadInspection]);

  const handleStartAudit = async () => {
    let gpsLocation = undefined;
    
    // Capture GPS coordinates if browser permits
    if (navigator.geolocation) {
      const getPosition = () => {
        return new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        });
      };
      
      try {
        const position = await getPosition();
        gpsLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
      } catch (err) {
        console.warn("Failed to capture location coordinates:", err);
      }
    }

    try {
      await startInspection(id, gpsLocation);
      router.push(`/inspector/jobs/${id}/inspect`);
    } catch (err) {
      // Handled inside hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentInspection) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-muted-foreground">Inspection job not found.</p>
        <Link href="/inspector/jobs" className="mt-4 inline-block">
          <Button size="sm">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  const booking = currentInspection.booking;
  const isPending = currentInspection.status === "not_started";
  const isWorking = currentInspection.status === "in_progress" || currentInspection.status === "draft";
  const isDone = currentInspection.status === "submitted" || currentInspection.status === "approved";

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      {/* Back button header */}
      <div className="flex items-center gap-4">
        <Link href="/inspector/jobs">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
            Job Audit Details
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Booking ID: {booking?.booking_number || "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Overview and Dispatch Action Banner */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Audit Workspace</CardTitle>
                <CardDescription>Dispatch status details</CardDescription>
              </div>
              <StatusBadge status={currentInspection.status} />
            </CardHeader>
            <CardContent className="p-6 pt-2 flex flex-col gap-6">
              {isPending && (
                <div className="flex flex-col items-center justify-center p-8 border border-white/5 bg-primary/5 rounded-2xl text-center gap-4">
                  <Play className="h-10 w-10 text-primary animate-pulse" />
                  <div>
                    <h3 className="font-bold text-foreground">Audit has not started yet</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Start this audit to record GPS metadata coordinates and open the checklists forms interface.
                    </p>
                  </div>
                  <Button onClick={handleStartAudit} className="px-8 shadow-lg shadow-primary/20">
                    Start Inspection Audit
                  </Button>
                </div>
              )}

              {isWorking && (
                <div className="flex flex-col items-center justify-center p-8 border border-white/5 bg-warning/5 rounded-2xl text-center gap-4">
                  <ClipboardCheck className="h-10 w-10 text-warning" />
                  <div>
                    <h3 className="font-bold text-foreground">Audit in progress</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Resume filling the vehicle checklists and capturing photos.
                    </p>
                  </div>
                  <Link href={`/inspector/jobs/${id}/inspect`}>
                    <Button variant="primary" className="px-8 bg-warning text-black hover:bg-warning/90 shadow-lg shadow-warning/20">
                      Resume Checklist Form
                    </Button>
                  </Link>
                </div>
              )}

              {isDone && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-success/5 text-success">
                    <span className="text-sm font-semibold">Audit submitted successfully</span>
                    <span className="text-xl font-extrabold flex items-center gap-1">
                      <Award className="h-5 w-5" /> {currentInspection.overall_score || "0"} / 100
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Summary Findings</span>
                    <p className="text-sm text-foreground/95 bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed">
                      {currentInspection.summary || "No summary provided."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Quick info panels */}
        <div className="flex flex-col gap-6">
          {/* Customer details */}
          <Card>
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground/80 flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span>Name</span>
                <span className="font-semibold text-foreground">{booking?.customer?.full_name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Email</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{booking?.customer?.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Contact</span>
                <span className="font-semibold text-foreground">{booking?.customer?.phone || "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle details */}
          <Card>
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Vehicle Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground/80 flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span>Make & Model</span>
                <span className="font-semibold text-foreground">
                  {booking?.vehicle?.make} {booking?.vehicle?.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Year</span>
                <span className="font-semibold text-foreground">{booking?.vehicle?.year}</span>
              </div>
              <div className="flex justify-between">
                <span>Plate No</span>
                <span className="font-semibold text-foreground uppercase">{booking?.vehicle?.license_plate || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>VIN</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{booking?.vehicle?.vin || "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling Address */}
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
                  {formatDate(booking?.scheduled_date)} at {booking?.scheduled_time}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-white/5 pt-2">
                <span className="text-xs text-muted-foreground/50">Address location</span>
                <span className="font-semibold text-foreground leading-snug flex items-start gap-1.5 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {booking?.location_address}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
