import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  title = "No data found",
  description = "Get started by creating a new entry.",
  icon,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-white/5 rounded-xl bg-card/10 min-h-[300px]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/5 text-muted-foreground/60 mb-4">
        {icon || <FolderOpen className="h-6 w-6 stroke-1.5" />}
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-[280px] sm:max-w-md mx-auto">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
