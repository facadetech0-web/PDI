import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  colorClass?: string;
}

export function Progress({ className, value, colorClass = "bg-primary", ...props }: ProgressProps) {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn("h-2 w-full rounded-full bg-white/10 overflow-hidden", className)}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-300 ease-out", colorClass)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
