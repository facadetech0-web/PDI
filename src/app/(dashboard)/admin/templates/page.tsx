"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Settings, Trash2, Check, X, FileText, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useTemplates } from "@/lib/hooks/use-templates";
import { formatDate } from "@/lib/utils/format";

export default function AdminTemplatesPage() {
  const { templates, isLoading, refresh, updateTemplate, deleteTemplate } = useTemplates();

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateTemplate(id, { is_active: !currentStatus });
    } catch (err) {
      console.error("Failed to toggle template status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this template? This cannot be undone.")) {
      try {
        await deleteTemplate(id);
      } catch (err) {
        console.error("Failed to delete template:", err);
      }
    }
  };

  const getPlanBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case "premium":
        return "destructive";
      case "standard":
        return "secondary";
      default:
        return "primary";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
            Checklist Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage categories and checklist items for vehicle audits
          </p>
        </div>
        <Link href="/admin/templates/new">
          <Button variant="primary" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center gap-3">
              <FileText className="h-10 w-10 text-muted-foreground/45" />
              <span>No checklist templates found.</span>
              <Link href="/admin/templates/new" className="mt-2">
                <Button size="sm">Create First Template</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-muted-foreground font-semibold">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-center">Version</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{template.name}</span>
                          {template.description && (
                            <span className="text-xs text-muted-foreground mt-0.5 truncate max-w-[300px]">
                              {template.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getPlanBadgeVariant(template.inspection_type)}>
                          {template.inspection_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-xs">v{template.version}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(template.created_at)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(template.id, template.is_active)}
                          className="focus:outline-none inline-flex align-middle cursor-pointer"
                          title={template.is_active ? "Deactivate" : "Activate"}
                        >
                          {template.is_active ? (
                            <Badge variant="success" className="gap-1">
                              <Check className="h-3 w-3" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 border-slate-700 text-slate-400 bg-slate-900/40">
                              <X className="h-3 w-3" /> Inactive
                            </Badge>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/templates/${template.id}`}>
                            <Button variant="outline" size="icon" className="h-8 w-8" title="Edit Template">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30"
                            onClick={() => handleDelete(template.id)}
                            title="Delete Template"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
