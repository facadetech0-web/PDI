'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OfflineAction } from '@/lib/types';
import { generateId } from '@/lib/utils/helpers';

interface OfflineQueueState {
  queue: OfflineAction[];
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncAt: string | null;

  enqueue: (action: Omit<OfflineAction, 'id' | 'created_at' | 'retries'>) => void;
  dequeue: (id: string) => void;
  clearQueue: () => void;
  setSyncing: (syncing: boolean) => void;
  setOnline: (online: boolean) => void;
  setLastSync: (timestamp: string) => void;
  incrementRetries: (id: string) => void;
  getQueueSize: () => number;
}

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,
      isOnline: true,
      lastSyncAt: null,

      enqueue: (action) =>
        set((state) => ({
          queue: [
            ...state.queue,
            {
              ...action,
              id: generateId(),
              created_at: new Date().toISOString(),
              retries: 0,
            },
          ],
        })),

      dequeue: (id) =>
        set((state) => ({
          queue: state.queue.filter((a) => a.id !== id),
        })),

      clearQueue: () => set({ queue: [] }),

      setSyncing: (isSyncing) => set({ isSyncing }),

      setOnline: (isOnline) => set({ isOnline }),

      setLastSync: (lastSyncAt) => set({ lastSyncAt }),

      incrementRetries: (id) =>
        set((state) => ({
          queue: state.queue.map((a) =>
            a.id === id ? { ...a, retries: a.retries + 1 } : a
          ),
        })),

      getQueueSize: () => get().queue.length,
    }),
    {
      name: 'precar-offline-queue',
      // Only persist queue and lastSyncAt
      partialize: (state) => ({
        queue: state.queue,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);
