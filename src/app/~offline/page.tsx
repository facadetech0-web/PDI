"use client";

import * as React from "react";
import { WifiOff, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OfflineFallbackPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-primary/30 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-sm p-6 text-center">
        <CardHeader className="p-0 pb-4 flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center">
            <WifiOff className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">You are Offline</CardTitle>
            <CardDescription className="text-xs mt-1">Check your network connection and try again</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col gap-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            If you are an auditor, you can still continue inspecting your assigned vehicle checklist draft. Your changes are automatically stored locally and will sync once internet access is restored.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            
            <a href="/inspector" className="text-xs text-primary hover:underline font-medium mt-1">
              Go to Inspector Dashboard
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
