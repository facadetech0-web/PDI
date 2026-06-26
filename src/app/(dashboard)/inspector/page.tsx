"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardCheck, Calendar, FileCheck, CheckCircle2, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useInspections } from "@/lib/hooks/use-inspections";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils/format";

export default function InspectorDashboardPage() {
  const { profile } = useAuthStore();
  const { inspections, isLoading, fetchInspections } = useInspections();

  React.useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const fullName = profile?.full_name || "Inspector";

  // Filter today's and pending jobs
  const todayJobs = React.useMemo(() => {
    return inspections.filter(
      (ins) => ins.status === "not_started" || ins.status === "in_progress" || ins.status === "draft"
    );
  }, [inspections]);

  const stats = React.useMemo(() => {
    return [
      {
        label: "Assigned Audits",
        value: inspections.length,
        icon: ClipboardCheck,
        description: "All assigned jobs",
      },
      {
        label: "Pending Audits",
        value: todayJobs.length,
        icon: Calendar,
        description: "Jobs needing audit execution",
      },
      {
        label: "Completed Audits",
        value: inspections.filter((ins) => ins.status === "submitted" || ins.status === "approved").length,
        icon: FileCheck,
        description: "Reports submitted to admin",
      },
    ];
  }, [inspections, todayJobs]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-white/5 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gradient-primary tracking-tight">
            Welcome back, {fullName}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access assigned vehicle audits, manage drafts, and upload media logs.
          </p>
        </div>
        <div>
          <Link href="/inspector/jobs">
            <Button variant="primary" size="sm">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              View Assigned Jobs
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

      {/* Action Items List */}
      <Card className="w-full flex-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Audit Workload</CardTitle>
            <CardDescription>Inspections assigned needing updates</CardDescription>
          </div>
          <Link href="/inspector/jobs" className="text-xs text-primary hover:underline font-medium">
            Manage Worklist
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : todayJobs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/5 rounded-xl bg-white/2">
              <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-foreground">You are all caught up!</h3>
              <p className="text-xs text-muted-foreground mt-1">No pending inspections assigned currently.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {todayJobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">
                        {job.booking?.vehicle?.make} {job.booking?.vehicle?.model} ({job.booking?.vehicle?.year})
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-2 items-center">
                        <span>Owner: {job.booking?.customer?.full_name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {job.booking?.location_address}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <StatusBadge status={job.status} />
                    <Link href={`/inspector/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        Start Audit
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
