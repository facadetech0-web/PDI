import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  try {
    // 1. Fetch report by share token
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("*, inspection_id")
      .eq("share_token", token)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // 2. Fetch full inspection details (bypassing RLS with admin client)
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
      return NextResponse.json({ error: "Inspection data not found" }, { status: 404 });
    }

    return NextResponse.json({ report, inspection });
  } catch (err: any) {
    console.error("Public report API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch public report" },
      { status: 500 }
    );
  }
}
