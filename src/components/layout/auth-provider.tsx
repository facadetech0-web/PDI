"use client";

import * as React from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized, isLoading } = useAuth();

  if (!isInitialized && isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Initializing secure session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
