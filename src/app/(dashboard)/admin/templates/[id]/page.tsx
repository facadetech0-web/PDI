import * as React from "react";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { TemplateEditor } from "@/components/forms/template-editor";
import type { InspectionTemplate } from "@/lib/types";

interface AdminTemplateEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTemplateEditorPage({ params }: AdminTemplateEditorPageProps) {
  const { id } = await params;
  const isNew = id === "new";

  let initialData: InspectionTemplate | null = null;

  if (!isNew) {
    const supabase = createAdminClient();
    const { data: template, error } = await supabase
      .from("inspection_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !template) {
      notFound();
    }

    initialData = template as unknown as InspectionTemplate;
  }

  return (
    <TemplateEditor 
      templateId={id} 
      initialData={initialData} 
    />
  );
}
