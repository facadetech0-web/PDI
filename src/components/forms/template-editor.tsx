"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save, ChevronUp, ChevronDown, Layers, CheckSquare, PlusCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { InspectionTemplate, TemplateCategory, TemplateItem } from "@/lib/types";

interface TemplateEditorProps {
  templateId?: string;
  initialData?: InspectionTemplate | null;
}

const DEFAULT_OPTIONS = ["excellent", "good", "fair", "poor", "critical"];

const DEFAULT_CATEGORIES: TemplateCategory[] = [
  {
    name: "Exterior & Body",
    sort_order: 1,
    items: [
      { label: "Body Panels & Paint", type: "condition", required: true, options: DEFAULT_OPTIONS },
      { label: "Windshield & Windows", type: "condition", required: true, options: DEFAULT_OPTIONS },
      { label: "Headlights & Taillights", type: "condition", required: true, options: DEFAULT_OPTIONS },
      { label: "Side Mirrors & Trim", type: "condition", required: true, options: DEFAULT_OPTIONS },
    ],
  },
  {
    name: "Interior & Comfort",
    sort_order: 2,
    items: [
      { label: "Seats & Seatbelts", type: "condition", required: true, options: DEFAULT_OPTIONS },
      { label: "Dashboard & Controls", type: "condition", required: true, options: DEFAULT_OPTIONS },
      { label: "Air Conditioning & Heater", type: "condition", required: true, options: DEFAULT_OPTIONS },
      { label: "Infotainment & Audio", type: "condition", required: false, options: DEFAULT_OPTIONS },
    ],
  },
  {
    name: "Engine & Mechanical",
    sort_order: 3,
    items: [
      { label: "Engine Oil Level & Quality", type: "condition", required: true, options: DEFAULT_OPTIONS },
      { label: "Radiator, Coolant & Hoses", type: "condition", required: true, options: DEFAULT_OPTIONS },
      { label: "Battery & Alternator", type: "condition", required: true, options: DEFAULT_OPTIONS },
      { label: "Belts & Pulleys", type: "condition", required: true, options: DEFAULT_OPTIONS },
      { label: "Engine Performance & Noise", type: "condition", required: true, options: DEFAULT_OPTIONS },
    ],
  },
];

export function TemplateEditor({ templateId, initialData }: TemplateEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const isNew = !templateId || templateId === "new";

  const [name, setName] = React.useState(initialData?.name || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [inspectionType, setInspectionType] = React.useState(initialData?.inspection_type || "standard");
  const [isActive, setIsActive] = React.useState(initialData?.is_active ?? true);
  const [categories, setCategories] = React.useState<TemplateCategory[]>(
    initialData?.categories || DEFAULT_CATEGORIES
  );
  const [isSaving, setIsSaving] = React.useState(false);

  // Category functions
  const addCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        name: `New Category ${prev.length + 1}`,
        sort_order: prev.length + 1,
        items: [],
      },
    ]);
  };

  const removeCategory = (index: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCategoryName = (index: number, newName: string) => {
    setCategories((prev) =>
      prev.map((cat, i) => (i === index ? { ...cat, name: newName } : cat))
    );
  };

  const moveCategory = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === categories.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newCategories = [...categories];
    
    // Swap elements
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    // Update sort_order
    const updated = newCategories.map((cat, i) => ({
      ...cat,
      sort_order: i + 1,
    }));

    setCategories(updated);
  };

  // Item functions
  const addItem = (categoryIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, idx) => {
        if (idx !== categoryIndex) return cat;
        return {
          ...cat,
          items: [
            ...cat.items,
            {
              label: "New Checklist Item",
              type: "condition",
              required: true,
              options: DEFAULT_OPTIONS,
            },
          ],
        };
      })
    );
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, idx) => {
        if (idx !== categoryIndex) return cat;
        return {
          ...cat,
          items: cat.items.filter((_, i) => i !== itemIndex),
        };
      })
    );
  };

  const updateItem = (
    categoryIndex: number,
    itemIndex: number,
    field: keyof TemplateItem,
    value: any
  ) => {
    setCategories((prev) =>
      prev.map((cat, idx) => {
        if (idx !== categoryIndex) return cat;
        return {
          ...cat,
          items: cat.items.map((item, i) =>
            i === itemIndex ? { ...item, [field]: value } : item
          ),
        };
      })
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a template name.");
      return;
    }

    if (categories.length === 0) {
      toast.error("Template must have at least one category.");
      return;
    }

    for (const cat of categories) {
      if (!cat.name.trim()) {
        toast.error("All categories must have a valid name.");
        return;
      }
      if (cat.items.length === 0) {
        toast.error(`Category "${cat.name}" must contain at least one item.`);
        return;
      }
      for (const item of cat.items) {
        if (!item.label.trim()) {
          toast.error(`All items in "${cat.name}" must have labels.`);
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const templatePayload = {
        name,
        description: description || null,
        inspection_type: inspectionType,
        is_active: isActive,
        categories,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { error } = await supabase
          .from("inspection_templates")
          .insert({
            ...templatePayload,
            version: 1,
          });

        if (error) throw error;
        toast.success("Checklist template created successfully!");
      } else {
        // Fetch current version to increment
        const nextVersion = (initialData?.version || 1) + 1;
        const { error } = await supabase
          .from("inspection_templates")
          .update({
            ...templatePayload,
            version: nextVersion,
          })
          .eq("id", templateId);

        if (error) throw error;
        toast.success("Checklist template version bumped and updated!");
      }

      router.push("/admin/templates");
      router.refresh();
    } catch (err: any) {
      console.error("Save template error:", err);
      toast.error(err.message || "Failed to save checklist template.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/templates")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
              {isNew ? "Create Template" : `Edit Template: ${initialData?.name}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isNew ? "Configure audit questions from scratch" : `Revision v${initialData?.version}`}
            </p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Card */}
        <Card className="lg:col-span-1 bg-slate-900/50 border-slate-800 backdrop-blur-sm self-start">
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
            <CardDescription>Primary rules defining checklist categorization</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Template Name</label>
              <Input
                placeholder="e.g. Premium 150-Point Audit"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
              <Textarea
                placeholder="Checklist description summary..."
                className="min-h-[100px] resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inspection Plan Type</label>
              <Select
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value)}
                className="h-10"
              >
                <option value="basic">BASIC</option>
                <option value="standard">STANDARD</option>
                <option value="premium">PREMIUM</option>
              </Select>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider">Publish Status</span>
                <span className="text-3xs text-muted-foreground">Make active for inspectors immediately</span>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </CardContent>
        </Card>

        {/* Builder Panel */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Layers className="h-4 w-4" /> Checklist Hierarchy
            </h3>
            <Button variant="outline" size="sm" onClick={addCategory}>
              <PlusCircle className="mr-2 h-4 w-4 text-primary" />
              Add Category
            </Button>
          </div>

          <div className="flex flex-col gap-6">
            {categories.map((cat, catIdx) => (
              <Card key={catIdx} className="bg-slate-900/30 border-slate-850 hover:border-slate-800 transition-colors">
                <CardHeader className="bg-slate-900/60 p-4 border-b border-slate-850 flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="h-6 w-6 rounded bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {catIdx + 1}
                    </span>
                    <Input
                      className="bg-transparent border-none focus-visible:ring-0 text-sm font-bold text-foreground p-0 h-7"
                      value={cat.name}
                      placeholder="Category Title"
                      onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 border-slate-800 bg-slate-900/40"
                      disabled={catIdx === 0}
                      onClick={() => moveCategory(catIdx, "up")}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 border-slate-800 bg-slate-900/40"
                      disabled={catIdx === categories.length - 1}
                      onClick={() => moveCategory(catIdx, "down")}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10"
                      onClick={() => removeCategory(catIdx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    {cat.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-slate-950/40 border border-slate-850 rounded-xl"
                      >
                        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                          <div className="flex items-center gap-2 shrink-0">
                            <CheckSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-mono">Item {itemIdx + 1}:</span>
                          </div>
                          
                          <Input
                            placeholder="Checklist Item Label (e.g. Oil Leaks)"
                            className="bg-transparent border-slate-850 focus-visible:border-slate-700 text-xs h-8"
                            value={item.label}
                            onChange={(e) => updateItem(catIdx, itemIdx, "label", e.target.value)}
                          />
                        </div>

                        <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                          <label className="flex items-center gap-2 text-3xs font-semibold uppercase tracking-wider text-muted-foreground select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.required}
                              onChange={(e) => updateItem(catIdx, itemIdx, "required", e.target.checked)}
                              className="rounded border-slate-800 bg-slate-900 text-primary focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
                            />
                            Required
                          </label>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive border-slate-850 hover:bg-destructive/5 hover:border-destructive/20"
                            onClick={() => removeItem(catIdx, itemIdx)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-1 border-dashed border-slate-800 text-muted-foreground hover:text-foreground text-xs h-9 bg-slate-950/20"
                    onClick={() => addItem(catIdx)}
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" /> Add Checklist Item
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
