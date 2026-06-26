"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardCheck, MapPin, Calendar, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useInspections } from "@/lib/hooks/use-inspections";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils/format";

export default function InspectorJobsPage() {
  const { inspections, isLoading, fetchInspections } = useInspections();

  React.useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
          My Dispatch Jobs
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View and execute vehicle audit inspections assigned to you
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : inspections.length === 0 ? (
        <EmptyState
          title="No Inspections Assigned"
          description="Your dispatch list is currently empty."
          icon={<ClipboardCheck className="h-6 w-6" />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {inspections.map((job) => (
            <Card key={job.id} hoverable>
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-foreground leading-snug">
                      {job.booking?.vehicle?.make} {job.booking?.vehicle?.model} ({job.booking?.vehicle?.year})
                    </h3>
                    <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-muted-foreground mt-1.5">
                      <span>Booking: <span className="font-semibold text-foreground/80">{job.booking?.booking_number}</span></span>
                      <span>•</span>
                      <span>Client: <span className="font-semibold text-foreground/80">{job.booking?.customer?.full_name}</span></span>
                      <span>•</span>
                      <span>Date: <span className="font-semibold text-foreground/80">{formatDate(job.booking?.scheduled_date)}</span></span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 max-w-[200px] truncate">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                        {job.booking?.location_address}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <StatusBadge status={job.status} />
                  <Link href={`/inspector/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      Open Job
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
