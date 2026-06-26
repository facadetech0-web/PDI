"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, FileCheck, CheckCircle2, AlertTriangle, Eye, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useInspections } from "@/lib/hooks/use-inspections";
import { calculateOverallScore, generateRecommendations, getScoreSummary } from "@/lib/utils/score-calculator";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { ChecklistItemData, ChecklistItemCondition } from "@/lib/types";
import Link from "next/link";
import { SignaturePad } from "@/components/features/signature-pad";

const FALLBACK_TEMPLATE = {
  "Exterior": ["Body Panels", "Windshield & Glass", "Side Mirrors", "Front & Rear Bumpers", "Door Latches"],
  "Interior": ["Dashboard & Controls", "Seat Condition", "Seatbelts", "Cabin Lighting", "Air Conditioning"],
  "Engine & Mechanical": ["Engine Noise", "Engine Oil & Fluids", "Cooling Fan & Radiator", "Exhaust System", "Drive Belts"],
  "Transmission & Drivetrain": ["Gear Shifting", "Clutch Operation", "Drive Shafts", "Differential Noise"],
  "Brakes & Suspension": ["Front & Rear Suspension", "Brake Pad Wear", "Steering Response", "Shock Absorbers"],
  "Electrical & Electronics": ["Headlights & Tail Lights", "Indicators", "Battery Health", "Power Windows", "Infotainment"],
  "Tyres & Wheels": ["Front Tyres Tread", "Rear Tyres Tread", "Spare Tyre", "Wheel Alignment"],
  "Documents & Compliance": ["Registration Certificate (RC)", "Insurance Policy", "Pollution Certificate (PUC)", "Service Logs"],
};

export default function InspectorInspectionFormPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { currentInspection, isLoading, loadInspection, saveDraft, submitInspection } = useInspections();
  const { profile } = useAuthStore();

  const [activeCategory, setActiveCategory] = React.useState<string>("Exterior");
  
  // Checklist data structured: { [category]: { [item]: { condition, notes, photos } } }
  const [checklist, setChecklist] = React.useState<Record<string, Record<string, ChecklistItemData>>>({});
  const [summary, setSummary] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  
  // Custom manual recommendations inputs (if any)
  const [manualRecommendations, setManualRecommendations] = React.useState<string[]>([]);
  const [newRecommendation, setNewRecommendation] = React.useState("");

  // Inspector signature input
  const [signatureText, setSignatureText] = React.useState("");

  React.useEffect(() => {
    async function loadData() {
      const audit = await loadInspection(id);
      if (audit) {
        // Hydrate checklist data
        const initialChecklist: any = {};
        
        // Loop template or fallback
        const templateCategories = audit.template?.categories || [];
        
        if (templateCategories.length > 0) {
          templateCategories.forEach((cat: any) => {
            initialChecklist[cat.name] = {};
            cat.items.forEach((item: any) => {
              initialChecklist[cat.name][item.label] = {
                condition: "not_applicable",
                notes: "",
                photos: [],
              };
            });
          });
        } else {
          Object.entries(FALLBACK_TEMPLATE).forEach(([catName, items]) => {
            initialChecklist[catName] = {};
            items.forEach((label) => {
              initialChecklist[catName][label] = {
                condition: "not_applicable",
                notes: "",
                photos: [],
              };
            });
          });
        }

        // Merge existing audit checklist details
        const savedChecklist = audit.checklist_data || {};
        Object.keys(initialChecklist).forEach((cat) => {
          if (savedChecklist[cat]) {
            Object.keys(initialChecklist[cat]).forEach((item) => {
              if (savedChecklist[cat][item]) {
                initialChecklist[cat][item] = {
                  ...initialChecklist[cat][item],
                  ...savedChecklist[cat][item],
                };
              }
            });
          }
        });

        setChecklist(initialChecklist);
        setSummary(audit.summary || "");
        setSignatureText(audit.inspector_signature || "");
        setManualRecommendations(audit.recommendations || []);
      }
    }
    
    loadData();
  }, [id, loadInspection]);

  // Calculate scores dynamically in real time
  const scoreResults = React.useMemo(() => {
    return calculateOverallScore(checklist);
  }, [checklist]);

  // Auto update summary recommendations based on notes & items condition
  const autoRecommendations = React.useMemo(() => {
    return generateRecommendations(checklist);
  }, [checklist]);

  // Combined final recommendations list
  const finalRecommendations = React.useMemo(() => {
    return Array.from(new Set([...autoRecommendations, ...manualRecommendations]));
  }, [autoRecommendations, manualRecommendations]);

  const handleConditionChange = (category: string, itemLabel: string, value: ChecklistItemCondition) => {
    setChecklist((prev) => {
      const catData = prev[category] || {};
      const itemData = catData[itemLabel] || { condition: "not_applicable" };
      return {
        ...prev,
        [category]: {
          ...catData,
          [itemLabel]: {
            ...itemData,
            condition: value,
          },
        },
      };
    });
  };

  const handleNotesChange = (category: string, itemLabel: string, value: string) => {
    setChecklist((prev) => {
      const catData = prev[category] || {};
      const itemData = catData[itemLabel] || { condition: "not_applicable" };
      return {
        ...prev,
        [category]: {
          ...catData,
          [itemLabel]: {
            ...itemData,
            notes: value,
          },
        },
      };
    });
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await saveDraft(id, {
        checklist_data: checklist,
        overall_score: scoreResults.overallScore,
        category_scores: scoreResults.categoryScores,
        summary,
        recommendations: finalRecommendations,
        critical_issues: scoreResults.criticalIssues,
      });
    } catch (err) {
      // toast error inside hook
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureText) {
      toast.error("Please draw your signature to submit the audit report.");
      return;
    }

    if (scoreResults.overallScore === 0) {
      toast.error("Please evaluate checklist items before submitting.");
      return;
    }

    setIsSubmitting(true);
    
    // Capture GPS coordinates if browser permits
    let gpsEnd = undefined;
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        gpsEnd = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
      } catch (err) {
        console.warn("Failed to capture end position:", err);
      }
    }

    try {
      const finalSummary = summary || getScoreSummary(scoreResults.overallScore);
      
      await submitInspection(id, {
        checklist_data: checklist,
        overall_score: scoreResults.overallScore,
        category_scores: scoreResults.categoryScores,
        summary: finalSummary,
        recommendations: finalRecommendations,
        critical_issues: scoreResults.criticalIssues,
        inspector_signature: signatureText,
        end_location: gpsEnd,
      });
      router.push(`/inspector/jobs/${id}`);
    } catch (err) {
      // toast error inside hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const addManualRecommendation = () => {
    if (!newRecommendation.trim()) return;
    setManualRecommendations((prev) => [...prev, newRecommendation.trim()]);
    setNewRecommendation("");
    toast.success("Recommendation note added.");
  };

  const removeManualRecommendation = (index: number) => {
    setManualRecommendations((prev) => prev.filter((_, idx) => idx !== index));
  };

  const categories = Object.keys(checklist);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl">
      {/* Back button header and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/inspector/jobs/${id}`}>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
              Audit Checklist Editor
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live Score: <span className="font-bold text-primary">{scoreResults.overallScore} / 100</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} isLoading={isSavingDraft}>
            <Save className="mr-1.5 h-4 w-4" />
            Save Draft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Category tabs selector */}
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 no-scrollbar pr-2 lg:border-r border-white/5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const catItems = Object.values(checklist[cat] || {});
            const checkedCount = catItems.filter((i) => i.condition !== "not_applicable").length;
            const totalCount = catItems.length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all whitespace-nowrap cursor-pointer text-left ${
                  isActive
                    ? "bg-primary/10 border-primary text-primary shadow-md shadow-primary/5"
                    : "border-white/5 bg-card/45 text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-xs ml-3 px-2 py-0.5 rounded-full ${
                  checkedCount === totalCount ? "bg-success/20 text-success" : "bg-white/5 text-muted-foreground/60"
                }`}>
                  {checkedCount}/{totalCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Middle/Main Area: Checklist items list */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card>
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle>{activeCategory} Audit Checklist</CardTitle>
              <CardDescription>Evaluate all items in this segment</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-6">
              {Object.entries(checklist[activeCategory] || {}).map(([itemLabel, itemData]) => (
                <div key={itemLabel} className="flex flex-col gap-3 pb-6 border-b border-white/5 last:border-b-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-sm font-semibold text-foreground">{itemLabel}</span>
                    <Select
                      className="max-w-xs"
                      value={itemData.condition}
                      onChange={(e) => handleConditionChange(activeCategory, itemLabel, e.target.value as ChecklistItemCondition)}
                    >
                      <option value="not_applicable">N/A (Exclude)</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor (High Issue)</option>
                      <option value="critical">Critical (Red Flag)</option>
                    </Select>
                  </div>
                  <Input
                    placeholder="Enter observation notes, warnings, or wear details..."
                    value={itemData.notes || ""}
                    onChange={(e) => handleNotesChange(activeCategory, itemLabel, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Finalize section card */}
          <form onSubmit={handleSubmitAudit} className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Finalize Audit findings</CardTitle>
                <CardDescription>Provide audit summary recommendations & signatures</CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex flex-col gap-6">
                <Textarea
                  label="Inspector Summary Verdict"
                  placeholder="Summarize overall car mechanical condition, compliance issues, and immediate repairs required..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  helperText="If left empty, a verdict will be generated based on the overall inspection score."
                />

                {/* Recommendations additions */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-sm font-medium text-foreground/80">Manual Recommendations</span>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add recommendation (e.g. Needs front brake pad replacement in 5000 km)"
                      value={newRecommendation}
                      onChange={(e) => setNewRecommendation(e.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={addManualRecommendation}>
                      Add
                    </Button>
                  </div>
                  {manualRecommendations.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 bg-black/20 p-4 rounded-xl border border-white/5">
                      {manualRecommendations.map((rec, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-3 text-xs text-muted-foreground border-b border-white/5 last:border-b-0 pb-2 last:pb-0">
                          <span>{rec}</span>
                          <button
                            type="button"
                            onClick={() => removeManualRecommendation(idx)}
                            className="text-destructive hover:underline text-xxs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Signature input */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Inspector Signature Canvas
                  </label>
                  <SignaturePad
                    value={signatureText}
                    onChange={(val) => setSignatureText(val)}
                    placeholder="Draw your signature on the pad to certify results"
                  />
                  <span className="text-3xs text-muted-foreground/60 mt-1">
                    By drawing your signature above, you certify that this inspection checklist audit is complete and accurate.
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 bg-black/10 px-6 py-4">
                <Button type="submit" isLoading={isSubmitting}>
                  <FileCheck className="mr-1.5 h-4 w-4" />
                  Submit Report Audit
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
