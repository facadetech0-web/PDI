"use client";

import * as React from "react";
import { useOfflineQueueStore } from "@/lib/stores/offline-queue.store";
import { toast } from "@/components/ui/toast";

export function useOffline() {
  const { queue, isOnline, isSyncing, setOnline, setSyncing, dequeue, setLastSync, incrementRetries } = useOfflineQueueStore();

  const syncOfflineQueue = React.useCallback(async () => {
    if (queue.length === 0 || isSyncing) return;
    setSyncing(true);

    try {
      for (const action of queue) {
        try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };

          const options: RequestInit = {
            method: action.method,
            headers,
          };

          if (action.files && action.files.length > 0) {
            // Handle multipart form data if files are present
            const formData = new FormData();
            formData.append("body", JSON.stringify(action.body));
            action.files.forEach((file) => {
              formData.append(file.fieldName, file.blob, file.fileName);
            });
            options.body = formData;
            delete headers["Content-Type"]; // Let browser set boundary
          } else {
            options.body = JSON.stringify(action.body);
          }

          const response = await fetch(action.endpoint, options);

          if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
          }

          dequeue(action.id);
        } catch (err) {
          console.error(`Sync failed for action ID ${action.id}:`, err);
          incrementRetries(action.id);
        }
      }
      setLastSync(new Date().toISOString());
      toast.success("Offline actions synchronized successfully.");
    } catch (err: any) {
      console.error("Offline queue sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }, [queue, isSyncing, setSyncing, dequeue, incrementRetries, setLastSync]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setOnline(true);
      toast.success("Network connection restored! Syncing data...");
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setOnline(false);
      toast.warning("Network connection lost. Running in offline draft mode.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial setting
    setOnline(navigator.onLine);
    if (navigator.onLine && queue.length > 0) {
      syncOfflineQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnline, queue.length, syncOfflineQueue]);

  return {
    isOnline,
    isSyncing,
    queueSize: queue.length,
    sync: syncOfflineQueue,
  };
}
