'use client';

import { create } from 'zustand';
import type { Inspection, ChecklistItemData } from '@/lib/types';

interface InspectionState {
  currentInspection: Inspection | null;
  checklistData: Record<string, Record<string, ChecklistItemData>>;
  isDirty: boolean;
  isLoading: boolean;

  setCurrentInspection: (inspection: Inspection | null) => void;
  setChecklistData: (data: Record<string, Record<string, ChecklistItemData>>) => void;
  updateChecklistItem: (category: string, itemLabel: string, value: Partial<ChecklistItemData>) => void;
  setDirty: (isDirty: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useInspectionStore = create<InspectionState>((set) => ({
  currentInspection: null,
  checklistData: {},
  isDirty: false,
  isLoading: false,

  setCurrentInspection: (currentInspection) => {
    const checklistData = currentInspection?.checklist_data || {};
    set({
      currentInspection,
      checklistData,
      isDirty: false,
    });
  },

  setChecklistData: (checklistData) => set({ checklistData, isDirty: true }),

  updateChecklistItem: (category, itemLabel, value) =>
    set((state) => {
      const categoryData = state.checklistData[category] || {};
      const itemData = categoryData[itemLabel] || { condition: 'not_applicable' };
      
      const updatedItem = {
        ...itemData,
        ...value,
      };

      const updatedChecklist = {
        ...state.checklistData,
        [category]: {
          ...categoryData,
          [itemLabel]: updatedItem,
        },
      };

      return {
        checklistData: updatedChecklist,
        isDirty: true,
      };
    }),

  setDirty: (isDirty) => set({ isDirty }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      currentInspection: null,
      checklistData: {},
      isDirty: false,
      isLoading: false,
    }),
}));
