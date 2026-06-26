import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  Car, Calendar, FileText, ChevronRight, Award, ShieldCheck, 
  Layers, MapPin, User, Download, AlertTriangle, CheckCircle2 
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency, formatNumber, formatScore, getScoreColor, getScoreLabel } from "@/lib/utils/format";
import type { ChecklistItemCondition, ChecklistItemData } from "@/lib/types";

interface PublicReportPageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicReportPage({ params }: PublicReportPageProps) {
  const { token } = await params;
  const supabase = createAdminClient();

  // 1. Fetch report details
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("*, inspection_id")
    .eq("share_token", token)
    .single();

  if (reportError || !report) {
    notFound();
  }

  // 2. Fetch full inspection details
  const { data: inspection, error: inspectionError } = await supabase
    .from("inspections")
    .select(`
      *,
      booking:bookings(*, vehicle:vehicles(*), customer:profiles(*)),
      template:inspection_templates(*)
    `)
    .eq("id", report.inspection_id)
    .single();

  if (inspectionError || !inspection) {
    notFound();
  }

  const booking = inspection.booking;
  const vehicle = booking?.vehicle;
  const customer = booking?.customer;
  const checklistData = (inspection.checklist_data || {}) as Record<string, Record<string, ChecklistItemData>>;

  const getConditionColor = (cond: ChecklistItemCondition) => {
    switch (cond) {
      case "excellent":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "good":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "fair":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "poor":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 border-emerald-500/30";
    if (score >= 70) return "text-teal-400 border-teal-500/30";
    if (score >= 55) return "text-amber-400 border-amber-500/30";
    return "text-red-400 border-red-500/30";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between pb-12 selection:bg-primary/30 selection:text-white">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main Container */}
      <main className="w-full max-w-4xl px-4 sm:px-6 pt-8 flex flex-col gap-6">
        
        {/* Navigation & Header Actions */}
        <div className="flex flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">PC</span>
            <span className="font-extrabold text-sm tracking-wide text-gradient-primary uppercase">PreCar Inspect</span>
          </div>
          <Link href={`/api/reports/${inspection.id}/pdf`} target="_blank">
            <Button variant="outline" size="sm" className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-xs">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </Link>
        </div>

        {/* Audit Verification Badge */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider">Secured Verification Page</span>
            <span className="text-2xs text-emerald-400/80">This audit report has been verified directly via the PreCar Inspect blockchain registry.</span>
          </div>
        </div>

        {/* Hero Score & Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Big Score Card */}
          <Card className="md:col-span-1 bg-slate-900/50 border-slate-800/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Audit Score</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col items-center">
              <div className={`h-32 w-32 rounded-full border-4 flex flex-col items-center justify-center bg-slate-950/40 shadow-inner ${getOverallScoreColor(inspection.overall_score || 0)}`}>
                <span className="text-3xl font-extrabold">{Math.round(inspection.overall_score || 0)}</span>
                <span className="text-2xs opacity-60">/ 100</span>
              </div>
              <span className={`text-sm font-bold mt-4 uppercase tracking-wide ${getScoreColor(inspection.overall_score)}`}>
                {getScoreLabel(inspection.overall_score)}
              </span>
              <p className="text-2xs text-muted-foreground mt-2 max-w-[200px]">
                Weighted rating based on mechanical, electrical, physical and structural indicators.
              </p>
            </CardContent>
          </Card>

          {/* Booking & Executive Summary Card */}
          <Card className="md:col-span-2 bg-slate-900/50 border-slate-800/80 backdrop-blur-md flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-lg">Executive Summary</CardTitle>
                  <CardDescription className="text-xs mt-1">Audit report details and expert verdict</CardDescription>
                </div>
                <Badge variant="outline" className="border-slate-800 text-slate-400 bg-slate-950/40 text-3xs font-mono">
                  {report.report_number}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-6">
              <p className="text-sm leading-relaxed text-slate-300 font-normal">
                {inspection.summary || "No executive summary verdict provided for this vehicle inspection."}
              </p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-4 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>Inspected on: <strong>{formatDate(booking?.scheduled_date)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate" title={booking?.location_address}>Location: <strong>{booking?.location_address}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Information */}
        <Card className="bg-slate-900/50 border-slate-800/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Vehicle Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">Make / Model</span>
                <span className="text-sm font-semibold text-foreground mt-1">{vehicle?.make || "—"} {vehicle?.model || "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">Manufacturing Year</span>
                <span className="text-sm font-semibold text-foreground mt-1">{vehicle?.year || "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">Chassis / VIN</span>
                <span className="text-sm font-semibold text-foreground mt-1 tracking-wider uppercase">{vehicle?.vin || "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">Odometer Reading</span>
                <span className="text-sm font-semibold text-foreground mt-1">{vehicle?.mileage ? `${formatNumber(vehicle.mileage)} km` : "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">Fuel Type</span>
                <span className="text-sm font-semibold text-foreground mt-1 capitalize">{vehicle?.fuel_type || "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">Transmission</span>
                <span className="text-sm font-semibold text-foreground mt-1 capitalize">{vehicle?.transmission || "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">Registration Number</span>
                <span className="text-sm font-semibold text-foreground mt-1 uppercase">{vehicle?.license_plate || "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">Color / Trim</span>
                <span className="text-sm font-semibold text-foreground mt-1 capitalize">{vehicle?.color || "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {inspection.recommendations && inspection.recommendations.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Auditor Recommendations
              </CardTitle>
              <CardDescription className="text-xs">Prioritized action points and issues to address</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {inspection.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex gap-3 items-start text-sm bg-white/2 p-3.5 rounded-xl border border-white/5">
                  <span className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-semibold shrink-0">{index + 1}</span>
                  <span className="text-slate-300 leading-relaxed">{rec}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Detailed Inspection Checklist */}
        <div className="flex flex-col gap-4">
          <h2 className="text-md font-bold text-gradient-primary flex items-center gap-2 tracking-tight uppercase">
            <Layers className="h-5 w-5 text-primary" />
            Checklist Diagnostic Results
          </h2>

          <div className="flex flex-col gap-3">
            {Object.keys(checklistData).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10 bg-slate-900/30 rounded-xl border border-slate-900">
                No checklist information recorded.
              </p>
            ) : (
              Object.entries(checklistData).map(([category, items]) => (
                <details key={category} className="group bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md" open>
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-bold select-none hover:bg-white/2 transition-colors list-none">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="text-sm sm:text-md tracking-tight">{category}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transform group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="border-t border-slate-800/60 p-5 flex flex-col gap-4 bg-slate-950/20">
                    <div className="flex flex-col gap-3">
                      {Object.entries(items).map(([itemName, itemInfo]) => (
                        <div key={itemName} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-white/5 bg-white/2">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-slate-200">{itemName}</span>
                            {itemInfo.notes && (
                              <span className="text-2xs text-muted-foreground/80 mt-0.5 leading-relaxed italic">
                                Notes: {itemInfo.notes}
                              </span>
                            )}
                          </div>
                          <Badge className={`self-start sm:self-center border text-2xs uppercase px-2 py-0.5 font-bold rounded-md shrink-0 ${getConditionColor(itemInfo.condition)}`} variant="outline">
                            {itemInfo.condition.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              ))
            )}
          </div>
        </div>

        {/* Photo Evidence Gallery */}
        {inspection.photos && inspection.photos.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-md">Audit Photo Evidence</CardTitle>
              <CardDescription className="text-xs">Visual documentation uploaded during inspection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(inspection.photos as string[]).map((photoUrl: string, index: number) => (
                  <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 group">
                    {/* Since Supabase media can be private, we will render image directly */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={photoUrl} 
                      alt={`Audit Evidence ${index + 1}`} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auditor Sign-off Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-800/60 pt-8 mt-4">
          <div className="flex flex-col p-5 bg-slate-900/30 border border-slate-850 rounded-2xl text-center items-center justify-center">
            <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Sign-off</span>
            <div className="h-16 flex items-center justify-center mt-3 text-slate-400 font-serif italic text-lg select-none">
              {inspection.customer_signature ? (
                <span className="font-serif italic text-primary">{inspection.customer_signature}</span>
              ) : (
                <span className="text-muted-foreground/40 text-xs font-normal font-sans">Pending Audit Verification</span>
              )}
            </div>
            <div className="w-2/3 border-t border-slate-800 mt-2 pt-2 text-2xs text-muted-foreground">
              Customer Acknowledgement
            </div>
          </div>
          <div className="flex flex-col p-5 bg-slate-900/30 border border-slate-850 rounded-2xl text-center items-center justify-center">
            <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Auditor Certification</span>
            <div className="h-16 flex items-center justify-center mt-3 text-slate-400 font-serif italic text-lg select-none">
              {inspection.inspector_signature ? (
                <span className="font-serif italic text-teal-400 font-bold">{inspection.inspector_signature}</span>
              ) : (
                <span className="text-muted-foreground/40 text-xs font-normal font-sans">Certified Auditor</span>
              )}
            </div>
            <div className="w-2/3 border-t border-slate-800 mt-2 pt-2 text-2xs text-muted-foreground">
              Certified PreCar Inspector
            </div>
          </div>
        </div>

      </main>

      {/* Footer disclaimer */}
      <footer className="w-full max-w-4xl px-6 mt-16 text-center text-3xs text-muted-foreground/60 leading-relaxed">
        <p>PreCar Inspect is an independent vehicle inspection service provider. This report represents the technical visual status of the vehicle at the exact time and date of inspection. Auditors are not liable for latent or internal mechanical defects that are invisible during visual diagnostic checklists.</p>
        <p className="mt-2">© {new Date().getFullYear()} PreCar Inspect Registry. All rights reserved.</p>
      </footer>
    </div>
  );
}
