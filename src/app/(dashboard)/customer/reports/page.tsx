"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Download, Eye, Award, Car, Calendar, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatDate, getScoreColor, getScoreLabel } from "@/lib/utils/format";

interface ReportWithRelations {
  id: string;
  report_number: string;
  share_token: string;
  overall_score: number;
  summary: string;
  created_at: string;
  inspection_id: string;
  booking: {
    id: string;
    booking_number: string;
    scheduled_date: string;
    vehicle: {
      make: string;
      model: string;
      year: number;
      vin: string;
    };
  };
}

export default function CustomerReportsPage() {
  const supabase = createClient();
  const [reports, setReports] = React.useState<ReportWithRelations[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadReports() {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select(`
            *,
            booking:bookings(
              id,
              booking_number,
              scheduled_date,
              vehicle:vehicles(make, model, year, vin)
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        // Filter out records where booking is null (due to RLS/join constraints)
        const validReports = (data || []).filter((r: any) => r.booking) as unknown as ReportWithRelations[];
        setReports(validReports);
      } catch (err) {
        console.error("Error loading reports:", err);
        toast.error("Failed to load inspection reports.");
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();
  }, [supabase]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
          Inspection Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Access and share verified audit results for your vehicles
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <Card className="bg-slate-900/40 border-slate-800 p-8 text-center flex flex-col items-center justify-center gap-3">
          <FileText className="h-10 w-10 text-muted-foreground/45" />
          <h3 className="text-md font-semibold text-foreground">No reports generated yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Once an inspector completes the audit and submits the checklist, your official report card will appear here.
          </p>
          <Link href="/customer/bookings/new" className="mt-2">
            <Button size="sm">Schedule an Inspection</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="bg-slate-900/50 border-slate-800/80 backdrop-blur-md flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="border-slate-800 text-slate-400 font-mono text-3xs mb-2">
                    {report.report_number}
                  </Badge>
                  <CardTitle className="text-md font-bold text-foreground">
                    {report.booking.vehicle.make} {report.booking.vehicle.model}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Year: {report.booking.vehicle.year} • VIN: {report.booking.vehicle.vin || "—"}
                  </CardDescription>
                </div>
                
                {/* Score badge */}
                <div className="flex flex-col items-center p-2 rounded-xl bg-slate-950/40 border border-slate-800 shrink-0 min-w-[70px]">
                  <span className={`text-lg font-extrabold ${getScoreColor(report.overall_score)}`}>
                    {Math.round(report.overall_score)}
                  </span>
                  <span className="text-3xs text-muted-foreground leading-none mt-0.5">/100</span>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-between gap-4">
                <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
                  {report.summary || "Inspection complete. Technical diagnostic checklists available."}
                </p>

                <div className="flex items-center gap-4 text-3xs text-muted-foreground border-t border-slate-800/60 pt-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Inspected: {formatDate(report.booking.scheduled_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold text-slate-300">{getScoreLabel(report.overall_score)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/30">
                  <Link href={`/reports/${report.share_token}`} target="_blank" className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs h-9 bg-slate-900 border-slate-800 hover:bg-slate-800">
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View Online
                    </Button>
                  </Link>
                  <Link href={`/api/reports/${report.inspection_id}/pdf`} target="_blank" className="w-full">
                    <Button variant="primary" size="sm" className="w-full text-xs h-9">
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download PDF
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
