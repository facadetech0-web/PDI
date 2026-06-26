import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "bottom";
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, side = "left", children }: SheetProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideClasses = {
    left: "left-0 top-0 bottom-0 h-full w-full max-w-xs border-r border-white/5 slide-in-from-left",
    right: "right-0 top-0 bottom-0 h-full w-full max-w-xs border-l border-white/5 slide-in-from-right",
    bottom: "bottom-0 left-0 right-0 w-full h-auto max-h-[80vh] border-t border-white/5 slide-in-from-bottom",
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
      />
      {/* Drawer content */}
      <div
        className={cn(
          "fixed z-50 bg-card p-6 shadow-2xl glass-panel duration-300 ease-in-out transition-transform flex flex-col",
          sideClasses[side]
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 pb-4 border-b border-white/5 mb-4", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-foreground tracking-tight", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
