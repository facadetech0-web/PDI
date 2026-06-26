import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "info" | "outline";
}

export function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary/10 text-primary border border-primary/20",
    secondary: "bg-secondary/10 text-secondary border border-secondary/20",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    destructive: "bg-destructive/10 text-destructive border border-destructive/20",
    info: "bg-accent/10 text-accent border border-accent/20",
    outline: "text-foreground border border-border bg-transparent",
  };

  return <span className={cn(baseStyles, variants[variant], className)} {...props} />;
}
