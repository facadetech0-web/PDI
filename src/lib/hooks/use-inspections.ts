"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { InspectionService } from "@/lib/services/inspection.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { Inspection, InspectionFilters } from "@/lib/types";
import { toast } from "@/components/ui/toast";

export function useInspections(initialFilters: InspectionFilters = {}) {
  const supabase = createClient();
  const { profile } = useAuthStore();
  const [inspections, setInspections] = React.useState<Inspection[]>([]);
  const [currentInspection, setCurrentInspection] = React.useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const inspectionService = React.useMemo(
    () => new InspectionService(supabase),
    [supabase]
  );

  const fetchInspections = React.useCallback(async (filters: InspectionFilters = {}) => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const activeFilters = { ...filters };
      if (profile.role === "inspector") {
        activeFilters.inspector_id = profile.id;
      }
      const list = await inspectionService.listInspections(activeFilters);
      setInspections(list);
    } catch (err: any) {
      console.error("Error loading inspections:", err);
      toast.error("Failed to load inspections list.");
    } finally {
      setIsLoading(false);
    }
  }, [profile, inspectionService]);

  const loadInspection = React.useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const audit = await inspectionService.getInspectionById(id);
      setCurrentInspection(audit);
      return audit;
    } catch (err: any) {
      console.error("Error loading inspection details:", err);
      toast.error("Failed to load inspection details.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [inspectionService]);

  const startInspection = async (id: string, startLocation?: { lat: number; lng: number; accuracy: number; timestamp: string }) => {
    setIsLoading(true);
    try {
      const audit = await inspectionService.startInspection(id, startLocation);
      setCurrentInspection(audit);
      toast.success("Inspection started. GPS coordinate captured.");
      return audit;
    } catch (err: any) {
      console.error("Error starting audit:", err);
      toast.error("Failed to start inspection.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = async (id: string, draftData: Partial<Inspection>) => {
    try {
      const audit = await inspectionService.saveDraft(id, draftData);
      setCurrentInspection(audit);
      toast.success("Draft saved successfully.");
      return audit;
    } catch (err: any) {
      console.error("Error saving draft:", err);
      toast.error("Failed to save draft details.");
      throw err;
    }
  };

  const submitInspection = async (
    id: string,
    submission: {
      checklist_data: any;
      overall_score: number;
      category_scores: any;
      summary: string;
      recommendations: string[];
      critical_issues: any[];
      inspector_signature: string;
      customer_signature?: string;
      end_location?: { lat: number; lng: number; accuracy: number; timestamp: string };
    }
  ) => {
    setIsLoading(true);
    try {
      const audit = await inspectionService.submitInspection(id, submission);
      setCurrentInspection(audit);
      toast.success("Inspection checklist audit submitted successfully!");
      return audit;
    } catch (err: any) {
      console.error("Error submitting audit:", err);
      toast.error(err.message || "Failed to submit inspection audit.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    inspections,
    currentInspection,
    isLoading,
    fetchInspections,
    loadInspection,
    startInspection,
    saveDraft,
    submitInspection,
  };
}
