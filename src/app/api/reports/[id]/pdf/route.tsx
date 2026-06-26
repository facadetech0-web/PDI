import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument } from "@/components/pdf/report-document";
import QRCode from "qrcode";
import type { Inspection } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    // 1. Fetch inspection details
    const { data: inspection, error } = await supabase
      .from("inspections")
      .select(`
        *,
        booking:bookings(*, vehicle:vehicles(*), customer:profiles(*)),
        template:inspection_templates(*)
      `)
      .eq("id", id)
      .single();

    if (error || !inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    // 2. Fetch or create report share token to generate verification QR code
    const { data: report } = await supabase
      .from("reports")
      .select("share_token")
      .eq("inspection_id", id)
      .single();

    let qrCodeDataUrl = "";
    if (report?.share_token) {
      const shareUrl = `${request.nextUrl.origin}/reports/${report.share_token}`;
      qrCodeDataUrl = await QRCode.toDataURL(shareUrl);
    }

    // 3. Render react-pdf document to buffer
    const buffer = await renderToBuffer(
      <ReportDocument
        inspection={inspection as unknown as Inspection}
        qrCodeDataUrl={qrCodeDataUrl}
      />
    );

    // 4. Return pdf stream response
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vehicle-report-${id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("PDF generation api error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate report PDF" },
      { status: 500 }
    );
  }
}
