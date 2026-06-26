import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata = {
  title: "Dashboard | PreCar Inspect",
  description: "Manage bookings, view inspections, and update profile settings.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
