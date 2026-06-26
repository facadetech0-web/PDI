"use client";

import * as React from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("App Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary)_0%,_transparent_40%),_radial-gradient(ellipse_at_bottom_left,_var(--color-destructive)_0%,_transparent_40%)] bg-background">
      <div className="max-w-md text-center flex flex-col items-center gap-6 glass-panel p-8 rounded-2xl bg-card/45 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10 text-destructive">
          <AlertOctagon className="h-10 w-10 animate-pulse" />
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-gradient">
            Something went wrong!
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            An unexpected error occurred in the application. We apologize for the inconvenience.
          </p>
          <div className="p-3 bg-black/35 rounded-lg text-xs font-mono text-destructive max-w-xs overflow-auto text-left border border-white/5 mt-2">
            {error?.message || "Unknown error details"}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 relative z-10 w-full">
          <Button variant="primary" className="w-full" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
