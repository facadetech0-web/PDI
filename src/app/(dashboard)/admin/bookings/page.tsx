"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, ChevronRight, Wrench } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useBookings } from "@/lib/hooks/use-bookings";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils/format";

export default function AdminBookingsPage() {
  const { bookings, isLoading, refresh } = useBookings();

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
            Inspection Bookings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of all scheduled audits and dispatcher logs
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No Bookings Found"
          description="There are currently no inspection bookings registered in the system."
          icon={<Calendar className="h-6 w-6" />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} hoverable>
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-foreground leading-snug">
                      {booking.vehicle?.make} {booking.vehicle?.model} ({booking.vehicle?.year})
                    </h3>
                    <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-muted-foreground mt-1.5">
                      <span>Ref ID: <span className="font-semibold text-foreground/80">{booking.booking_number}</span></span>
                      <span>•</span>
                      <span>Client: <span className="font-semibold text-foreground/80">{booking.customer?.full_name}</span></span>
                      <span>•</span>
                      <span>Inspector: <span className="font-semibold text-foreground/80">{booking.inspector?.full_name || "Unassigned"}</span></span>
                      <span>•</span>
                      <span>Scheduled: <span className="font-semibold text-foreground/80">{formatDate(booking.scheduled_date)}</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <StatusBadge status={booking.status} />
                  <Link href={`/admin/bookings/${booking.id}`}>
                    <Button variant="outline" size="sm">
                      {booking.inspector_id ? "Details" : "Dispatch"}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
