"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast glass-panel bg-card text-foreground border-white/10 rounded-xl shadow-2xl",
          description: "text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground font-medium rounded-lg",
          cancelButton:
            "bg-muted text-muted-foreground font-medium rounded-lg",
        },
      }}
    />
  );
}

export { toast } from "sonner";
