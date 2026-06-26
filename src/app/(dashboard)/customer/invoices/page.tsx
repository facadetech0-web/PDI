"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Download, CreditCard, Calendar, Receipt, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import type { Invoice } from "@/lib/types";

export default function CustomerInvoicesPage() {
  const supabase = createClient();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [payingInvoiceId, setPayingInvoiceId] = React.useState<string | null>(null);

  const loadInvoices = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          booking:bookings(booking_number, scheduled_date)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data as unknown as Invoice[]);
    } catch (err) {
      console.error("Error loading invoices:", err);
      toast.error("Failed to load invoice statements.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handlePayInvoice = async (invoiceId: string) => {
    setPayingInvoiceId(invoiceId);
    try {
      const { error } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId);

      if (error) throw error;

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? { ...inv, status: "paid", paid_at: new Date().toISOString() }
            : inv
        )
      );
      toast.success("Payment successful! Thank you.");
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to process payment.");
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success";
      case "sent":
      case "draft":
        return "warning";
      case "overdue":
      case "failed":
      case "cancelled":
        return "destructive";
      default:
        return "primary";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
          Billing & Invoices
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View statements, pay outstanding balances and download branded tax invoices
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : invoices.length === 0 ? (
        <Card className="bg-slate-900/40 border-slate-800 p-8 text-center flex flex-col items-center justify-center gap-3">
          <Receipt className="h-10 w-10 text-muted-foreground/45" />
          <h3 className="text-md font-semibold text-foreground">No invoices generated yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Outstanding billing invoices will appear here once an inspection plan has been confirmed.
          </p>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-muted-foreground font-semibold">
                    <th className="px-6 py-4">Invoice Details</th>
                    <th className="px-6 py-4">Booking Ref</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{invoice.invoice_number}</span>
                          <span className="text-3xs text-muted-foreground mt-0.5">
                            Created: {formatDate(invoice.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                        {invoice.booking?.booking_number || "—"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {formatCurrency(invoice.total_amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="h-8 px-3 text-xs"
                              disabled={payingInvoiceId === invoice.id}
                              onClick={() => handlePayInvoice(invoice.id)}
                            >
                              {payingInvoiceId === invoice.id ? (
                                <Spinner size="sm" className="mr-1" />
                              ) : (
                                <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              Pay Now
                            </Button>
                          )}
                          <Link href={`/api/invoices/${invoice.id}/pdf`} target="_blank">
                            <Button variant="outline" size="icon" className="h-8 w-8 border-slate-800" title="Download PDF">
                              <Download className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
