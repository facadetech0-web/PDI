"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { TemplateService } from "@/lib/services/template.service";
import type { InspectionTemplate } from "@/lib/types";
import { toast } from "@/components/ui/toast";

export function useTemplates() {
  const supabase = createClient();
  const [templates, setTemplates] = React.useState<InspectionTemplate[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const templateService = React.useMemo(
    () => new TemplateService(supabase),
    [supabase]
  );

  const fetchTemplates = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await templateService.listTemplates();
      setTemplates(list);
    } catch (err: any) {
      console.error("Error loading templates:", err);
      toast.error("Failed to load templates.");
    } finally {
      setIsLoading(false);
    }
  }, [templateService]);

  const createTemplate = async (templateData: Partial<InspectionTemplate>) => {
    setIsLoading(true);
    try {
      const created = await templateService.createTemplate(templateData);
      setTemplates((prev) => [created, ...prev]);
      toast.success("Template created successfully!");
      return created;
    } catch (err: any) {
      console.error("Error creating template:", err);
      toast.error(err.message || "Failed to create template.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplate = async (id: string, updates: Partial<InspectionTemplate>) => {
    setIsLoading(true);
    try {
      const updated = await templateService.updateTemplate(id, updates);
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success("Template updated successfully!");
      return updated;
    } catch (err: any) {
      console.error("Error updating template:", err);
      toast.error(err.message || "Failed to update template.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    setIsLoading(true);
    try {
      await templateService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted successfully.");
    } catch (err: any) {
      console.error("Error deleting template:", err);
      toast.error(err.message || "Failed to delete template.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    templates,
    isLoading,
    refresh: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
