"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Cell,
  Pie,
  Legend,
} from "recharts";
import type { ChartDataPoint } from "@/lib/types";

interface AnalyticsChartProps {
  type: "revenue" | "bookings" | "distribution";
  data: ChartDataPoint[];
  height?: number;
}

export function AnalyticsChart({ type, data, height = 300 }: AnalyticsChartProps) {
  // Curated color palette
  const colors = ["#2563eb", "#a855f7", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

  const renderTooltipContent = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-card/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-foreground">{dataPoint.label}</p>
          <p className="text-primary mt-1">
            {type === "revenue" ? `₹${dataPoint.value.toLocaleString()}` : `${dataPoint.value} items`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground bg-white/[0.01] rounded-xl border border-white/5" style={{ height }}>
        No analytics data available.
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "revenue" ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip content={renderTooltipContent} />
            <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        ) : type === "bookings" ? (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip content={renderTooltipContent} />
            <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="label">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
