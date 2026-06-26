import * as React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./pdf-styles";
import type { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";

export interface InvoiceDocumentProps {
  invoice: Invoice;
}

export function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  const booking = invoice.booking;
  const customer = invoice.customer;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.logoSection}>
            <Text style={pdfStyles.logoText}>PreCar Inspect</Text>
            <Text style={pdfStyles.companyDetails}>123 Tech Square, Bangalore, India</Text>
            <Text style={pdfStyles.companyDetails}>GSTIN: 29AAAAA1111A1Z1</Text>
          </View>
          <View style={pdfStyles.metaSection}>
            <Text style={pdfStyles.metaTitle}>INVOICE</Text>
            <Text style={pdfStyles.metaText}>Invoice #: {invoice.invoice_number}</Text>
            <Text style={pdfStyles.metaText}>Date: {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "—"}</Text>
            <Text style={pdfStyles.metaText}>Due Date: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}</Text>
          </View>
        </View>

        {/* Client details */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Billed To</Text>
          <View style={pdfStyles.grid}>
            <View style={pdfStyles.gridCol6}>
              <Text style={pdfStyles.label}>Client Name</Text>
              <Text style={pdfStyles.value}>{customer?.full_name || "—"}</Text>
            </View>
            <View style={pdfStyles.gridCol6}>
              <Text style={pdfStyles.label}>Client Email</Text>
              <Text style={pdfStyles.value}>{customer?.email || "—"}</Text>
            </View>
          </View>
        </View>

        {/* Invoice details summary */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Invoice Summary</Text>
          <View style={pdfStyles.grid}>
            <View style={pdfStyles.gridCol6}>
              <Text style={pdfStyles.label}>Inspection Booking ID</Text>
              <Text style={pdfStyles.value}>{booking?.booking_number || "—"}</Text>
            </View>
            <View style={pdfStyles.gridCol6}>
              <Text style={pdfStyles.label}>Payment Status</Text>
              <Text style={[pdfStyles.value, { textTransform: "uppercase", fontWeight: "bold" }]}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Line Items</Text>
          <View style={pdfStyles.table}>
            <View style={tableStyles.rowHeader}>
              <Text style={tableStyles.colDescHeader}>Description</Text>
              <Text style={tableStyles.colQtyHeader}>Qty</Text>
              <Text style={tableStyles.colPriceHeader}>Unit Price</Text>
              <Text style={tableStyles.colTotalHeader}>Total</Text>
            </View>
            
            {invoice.line_items && invoice.line_items.length > 0 ? (
              invoice.line_items.map((item, index) => (
                <View key={index} style={tableStyles.row}>
                  <Text style={tableStyles.colDesc}>{item.description}</Text>
                  <Text style={tableStyles.colQty}>{item.qty}</Text>
                  <Text style={tableStyles.colPrice}>{formatCurrency(item.unit_price)}</Text>
                  <Text style={tableStyles.colTotal}>{formatCurrency(item.total)}</Text>
                </View>
              ))
            ) : (
              <View style={tableStyles.row}>
                <Text style={{ flex: 1, textAlign: "center", fontSize: 8, padding: 6 }}>
                  No items listed.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Totals Breakdown */}
        <View style={{ alignItems: "flex-end", marginTop: 20, paddingRight: 10 }}>
          <View style={{ width: "40%", flexDirection: "column", gap: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={pdfStyles.label}>Subtotal: </Text>
              <Text style={pdfStyles.value}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            {invoice.discount_amount > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={pdfStyles.label}>Discount: </Text>
                <Text style={[pdfStyles.value, { color: "#10b981" }]}>-{formatCurrency(invoice.discount_amount)}</Text>
              </View>
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={pdfStyles.label}>GST ({invoice.tax_rate}%): </Text>
              <Text style={pdfStyles.value}>{formatCurrency(invoice.tax_amount)}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: "#e5e7eb", marginVertical: 4 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[pdfStyles.label, { fontWeight: "bold" }]}>Total Due: </Text>
              <Text style={[pdfStyles.value, { fontSize: 12, fontWeight: "bold", color: "#3b82f6" }]}>{formatCurrency(invoice.total_amount)}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

const tableStyles = {
  rowHeader: {
    flexDirection: "row" as const,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 6,
  },
  row: {
    flexDirection: "row" as const,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    padding: 6,
  },
  colDescHeader: { flex: 4, fontSize: 8, fontWeight: "bold" as const, color: "#4b5563" },
  colQtyHeader: { flex: 1, fontSize: 8, fontWeight: "bold" as const, color: "#4b5563", textAlign: "center" as const },
  colPriceHeader: { flex: 2, fontSize: 8, fontWeight: "bold" as const, color: "#4b5563", textAlign: "right" as const },
  colTotalHeader: { flex: 2, fontSize: 8, fontWeight: "bold" as const, color: "#4b5563", textAlign: "right" as const },

  colDesc: { flex: 4, fontSize: 8, color: "#111827" },
  colQty: { flex: 1, fontSize: 8, color: "#111827", textAlign: "center" as const },
  colPrice: { flex: 2, fontSize: 8, color: "#111827", textAlign: "right" as const },
  colTotal: { flex: 2, fontSize: 8, color: "#111827", textAlign: "right" as const },
};
