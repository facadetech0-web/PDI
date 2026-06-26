import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument } from "@/components/pdf/invoice-document";
import type { Invoice } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    // 1. Fetch invoice details with joined booking & customer details
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(`
        *,
        booking:bookings(*, vehicle:vehicles(*)),
        customer:profiles(*)
      `)
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: "Invoice not found or unauthorized" }, { status: 404 });
    }

    // 2. Render react-pdf document to buffer
    const buffer = await renderToBuffer(
      <InvoiceDocument invoice={invoice as unknown as Invoice} />
    );

    // 3. Return pdf stream response
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoice_number || id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("Invoice PDF generation API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
