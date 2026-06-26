import * as React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { pdfStyles } from "./pdf-styles";
import type { Inspection } from "@/lib/types";

export interface ReportDocumentProps {
  inspection: Inspection;
  qrCodeDataUrl?: string; // Optional QR code base64 url
}

export function ReportDocument({ inspection, qrCodeDataUrl }: ReportDocumentProps) {
  const booking = inspection.booking;
  const vehicle = booking?.vehicle;
  const customer = booking?.customer;

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case "excellent":
        return pdfStyles.badgeExcellent;
      case "good":
        return pdfStyles.badgeGood;
      case "fair":
        return pdfStyles.badgeFair;
      case "poor":
        return pdfStyles.badgePoor;
      case "critical":
        return pdfStyles.badgeCritical;
      default:
        return pdfStyles.badgeNA;
    }
  };

  const getConditionLabel = (cond: string) => {
    return cond.replace(/_/g, " ").toUpperCase();
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.logoSection}>
            <Text style={pdfStyles.logoText}>PreCar Inspect</Text>
            <Text style={pdfStyles.companyDetails}>Certified Vehicle Inspection Report</Text>
          </View>
          <View style={pdfStyles.metaSection}>
            <Text style={pdfStyles.metaTitle}>INSPECTION REPORT</Text>
            <Text style={pdfStyles.metaText}>Ref: {booking?.booking_number || "—"}</Text>
            <Text style={pdfStyles.metaText}>Date: {booking?.scheduled_date ? new Date(booking.scheduled_date).toLocaleDateString() : "—"}</Text>
          </View>
        </View>

        {/* Score overview card */}
        <View style={pdfStyles.scoreCard}>
          <View style={pdfStyles.scoreInfo}>
            <Text style={pdfStyles.label}>Inspection Score</Text>
            <Text style={pdfStyles.value}>A weighted evaluation of all checklist items</Text>
          </View>
          <View>
            <Text style={pdfStyles.scoreNumber}>{inspection.overall_score || "0"} / 100</Text>
          </View>
        </View>

        {/* Vehicle & Client details */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Vehicle & Client Details</Text>
          <View style={pdfStyles.grid}>
            <View style={pdfStyles.gridCol6}>
              <Text style={pdfStyles.label}>Client Name</Text>
              <Text style={pdfStyles.value}>{customer?.full_name || "—"}</Text>
            </View>
            <View style={pdfStyles.gridCol6}>
              <Text style={pdfStyles.label}>Vehicle Model</Text>
              <Text style={pdfStyles.value}>{vehicle?.make} {vehicle?.model} ({vehicle?.year})</Text>
            </View>
            <View style={pdfStyles.gridCol4}>
              <Text style={pdfStyles.label}>License Plate</Text>
              <Text style={pdfStyles.value}>{vehicle?.license_plate || "—"}</Text>
            </View>
            <View style={pdfStyles.gridCol4}>
              <Text style={pdfStyles.label}>VIN / Chassis</Text>
              <Text style={pdfStyles.value}>{vehicle?.vin || "—"}</Text>
            </View>
            <View style={pdfStyles.gridCol4}>
              <Text style={pdfStyles.label}>Odometer Mileage</Text>
              <Text style={pdfStyles.value}>{vehicle?.mileage ? `${vehicle.mileage.toLocaleString()} km` : "—"}</Text>
            </View>
          </View>
        </View>

        {/* Summary of findings */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Executive Summary Findings</Text>
          <Text style={pdfStyles.value}>{inspection.summary || "No summary verdict provided."}</Text>
        </View>

        {/* Recommendations */}
        {inspection.recommendations && inspection.recommendations.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Inspector Recommendations</Text>
            {inspection.recommendations.map((rec, index) => (
              <Text key={index} style={[pdfStyles.value, { marginBottom: 4 }]}>
                • {rec}
              </Text>
            ))}
          </View>
        )}

        {/* QR Code link if URL is provided */}
        {qrCodeDataUrl && (
          <View style={{ alignItems: "center", marginTop: 15, marginBottom: 15 }}>
            <Image src={qrCodeDataUrl} style={{ width: 60, height: 60 }} />
            <Text style={{ fontSize: 6, color: "#6b7280", marginTop: 4 }}>Scan to verify this report online</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={pdfStyles.signatureSection}>
          <View style={pdfStyles.signatureBox}>
            <Text style={pdfStyles.label}>Customer Signature</Text>
            <Text style={pdfStyles.signatureText}>{inspection.customer_signature || "Pending Audit Signoff"}</Text>
          </View>
          <View style={pdfStyles.signatureBox}>
            <Text style={pdfStyles.label}>Certified Auditor Signature</Text>
            <Text style={pdfStyles.signatureText}>{inspection.inspector_signature || "—"}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
