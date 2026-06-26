import { cn } from "@/lib/utils/cn";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <div
      className={cn(
        "bg-white/5 shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
      {...props}
    />
  );
}
