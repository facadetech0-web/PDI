"use client";

import * as React from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useOffline } from "@/lib/hooks/use-offline";
import { Badge } from "@/components/ui/badge";

export function OfflineIndicator() {
  const { isOnline, isSyncing, queueSize, sync } = useOffline();

  if (isOnline && queueSize === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
      {!isOnline ? (
        <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1.5 shadow-lg border border-red-500/20 backdrop-blur-md">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Offline Mode</span>
          {queueSize > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/30 text-3xs font-bold">
              {queueSize} pending
            </span>
          )}
        </Badge>
      ) : (
        <Badge variant="warning" className="flex items-center gap-1.5 px-3 py-1.5 shadow-lg border border-amber-500/20 backdrop-blur-md">
          <Wifi className="h-3.5 w-3.5 text-amber-400" />
          <span>Syncing Drafts...</span>
          <button
            onClick={() => sync()}
            disabled={isSyncing}
            className="ml-1 p-0.5 hover:bg-black/10 rounded transition-colors"
            title="Sync Now"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
          </button>
        </Badge>
      )}
    </div>
  );
}
