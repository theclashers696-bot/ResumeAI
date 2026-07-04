"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronLeft, Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, Palette, Layout,
  Layers, Check, GripVertical, Save, ExternalLink, ChevronDown, Wand2,
  RotateCcw, BookmarkPlus, Trash2, Download, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumePreview } from "@/components/resume/resume-preview";
import {
  TEMPLATES, FONT_OPTIONS, ACCENT_COLORS, COLOR_PRESETS, DEFAULT_THEME,
  DEFAULT_SECTION_ORDER, SECTION_LABELS, FONT_MAP,
} from "@/types/resume";
import type { ResumeData, ResumeTheme } from "@/types/resume";
import { Button } from "@/components/ui/button";

type Breakpoint = "desktop" | "tablet" | "mobile";
type StudioTab = "templates" | "theme" | "sections";

const BREAKPOINT_WIDTHS: Record<Breakpoint, number> = {
  desktop: 794,
  tablet: 600,
  mobile: 375,
};

interface ResumeListItem {
  id: string;
  title: string;
  template: string;
  themeColor: string;
  updatedAt: Date;
}

interface DesignStudioClientProps {
  resumes: ResumeListItem[];
}

// ─── Section Sortable Item ───────────────────────────────────────────────────
function SortableSection({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm select-none",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground" aria-label="Drag to reorder">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 font-medium">{label}</span>
    </div>
  );
}

// ─── Template Thumbnail ──────────────────────────────────────────────────────
function TemplateThumbnail({ id, color }: { id: string; color: string }) {
  const thumbnails: Record<string, React.ReactNode> = {
    modern: (
      <div className="h-full w-full overflow-hidden rounded">
        <div className="h-4 w-full" style={{ backgroundColor: color }} />
        <div className="space-y-0.5 p-1">
          <div className="h-0.5 w-3/4 rounded bg-gray-200" />
          <div className="h-0.5 w-1/2 rounded bg-gray-200" />
          <div className="h-0.5 w-full rounded bg-gray-100 mt-1" />
          <div className="h-0.5 w-5/6 rounded bg-gray-100" />
        </div>
      </div>
    ),
    classic: (
      <div className="h-full w-full overflow-hidden rounded flex">
        <div className="w-2/5 rounded-l" style={{ backgroundColor: `${color}25` }} />
        <div className="flex-1 space-y-0.5 p-1">
          <div className="h-0.5 w-full rounded bg-gray-200" />
          <div className="h-0.5 w-3/4 rounded bg-gray-200" />
          <div className="h-0.5 w-full rounded bg-gray-100 mt-1" />
          <div className="h-0.5 w-5/6 rounded bg-gray-100" />
        </div>
      </div>
    ),
    minimal: (
      <div className="h-full w-full overflow-hidden rounded p-1 space-y-0.5">
        <div className="h-0.5 w-full rounded" style={{ backgroundColor: color }} />
        <div className="h-0.5 w-3/4 rounded bg-gray-200" />
        <div className="h-0.5 w-1/2 rounded bg-gray-200" />
        <div className="h-0.5 w-full rounded bg-gray-100 mt-0.5" />
        <div className="h-0.5 w-5/6 rounded bg-gray-100" />
      </div>
    ),
    creative: (
      <div className="h-full w-full overflow-hidden rounded flex">
        <div className="w-1/3 rounded-l" style={{ backgroundColor: color }} />
        <div className="flex-1 space-y-0.5 p-1">
          <div className="h-0.5 w-full rounded bg-gray-200" />
          <div className="h-0.5 w-2/3 rounded bg-gray-200" />
          <div className="h-0.5 w-full rounded bg-gray-100 mt-1" />
        </div>
      </div>
    ),
    executive: (
      <div className="h-full w-full overflow-hidden rounded">
        <div className="h-5 w-full rounded-t" style={{ backgroundColor: "#0F172A" }} />
        <div className="h-0.5 w-full" style={{ backgroundColor: "#C9A84C" }} />
        <div className="space-y-0.5 p-1">
          <div className="h-0.5 w-2/3 rounded bg-gray-200" />
          <div className="h-0.5 w-full rounded bg-gray-100" />
        </div>
      </div>
    ),
    corporate: (
      <div className="h-full w-full overflow-hidden rounded">
        <div className="h-3 w-full" style={{ backgroundColor: color }} />
        <div className="flex flex-1">
          <div className="w-2/5" style={{ backgroundColor: `${color}12` }} />
          <div className="flex-1 space-y-0.5 p-0.5">
            <div className="h-0.5 w-full rounded bg-gray-200" />
            <div className="h-0.5 w-3/4 rounded bg-gray-100" />
          </div>
        </div>
      </div>
    ),
    developer: (
      <div className="h-full w-full overflow-hidden rounded flex">
        <div className="w-1/3 rounded-l" style={{ backgroundColor: "#0D1117" }}>
          <div className="m-0.5 h-0.5 rounded" style={{ backgroundColor: color }} />
        </div>
        <div className="flex-1 bg-white space-y-0.5 p-1">
          <div className="h-0.5 w-full rounded bg-gray-200" />
          <div className="h-0.5 w-3/4 rounded bg-gray-100" />
        </div>
      </div>
    ),
    designer: (
      <div className="h-full w-full overflow-hidden rounded flex">
        <div className="w-2/5 rounded-l" style={{ backgroundColor: color }} />
        <div className="flex-1 bg-white space-y-0.5 p-1">
          <div className="h-0.5 w-full rounded bg-gray-200" />
          <div className="h-0.5 w-2/3 rounded bg-gray-100" />
          <div className="h-0.5 w-full rounded bg-gray-100" />
        </div>
      </div>
    ),
    student: (
      <div className="h-full w-full overflow-hidden rounded">
        <div className="h-4 w-full border-t-2" style={{ backgroundColor: `${color}15`, borderColor: color }} />
        <div className="space-y-0.5 p-1">
          <div className="h-0.5 w-3/4 rounded bg-gray-200" />
          <div className="h-0.5 w-full rounded bg-gray-100" />
          <div className="h-0.5 w-5/6 rounded bg-gray-100" />
        </div>
      </div>
    ),
    business: (
      <div className="h-full w-full overflow-hidden rounded p-1">
        <div className="text-center space-y-0.5 border-b border-gray-300 pb-0.5 mb-0.5">
          <div className="h-0.5 w-1/2 mx-auto rounded bg-gray-300" />
          <div className="h-0.5 w-1/3 mx-auto rounded bg-gray-200" />
        </div>
        <div className="space-y-0.5">
          <div className="h-0.5 w-full rounded bg-gray-100" />
          <div className="h-0.5 w-5/6 rounded bg-gray-100" />
        </div>
      </div>
    ),
    elegant: (
      <div className="h-full w-full overflow-hidden rounded p-1 text-center">
        <div className="h-0.5 w-1/2 mx-auto rounded mb-0.5" style={{ backgroundColor: color }} />
        <div className="h-0.5 w-2/3 mx-auto rounded bg-gray-200 mb-0.5" />
        <div className="h-px w-1/4 mx-auto rounded bg-gray-300 my-0.5" />
        <div className="h-0.5 w-full rounded bg-gray-100" />
      </div>
    ),
    ats: (
      <div className="h-full w-full overflow-hidden rounded p-1">
        <div className="h-0.5 w-2/3 rounded bg-gray-400 mb-0.5" />
        <div className="h-px w-full bg-black mb-0.5" />
        <div className="space-y-0.5">
          <div className="h-0.5 w-full rounded bg-gray-200" />
          <div className="h-0.5 w-5/6 rounded bg-gray-200" />
          <div className="h-0.5 w-full rounded bg-gray-100" />
        </div>
      </div>
    ),
    startup: (
      <div className="h-full w-full overflow-hidden rounded">
        <div className="h-4 w-full rounded-t" style={{ background: `linear-gradient(135deg, ${color}, #7C3AED)` }} />
        <div className="space-y-0.5 p-1">
          <div className="h-0.5 w-3/4 rounded bg-gray-200" />
          <div className="h-0.5 w-full rounded bg-gray-100" />
        </div>
      </div>
    ),
    international: (
      <div className="h-full w-full overflow-hidden rounded p-1">
        <div className="flex justify-between items-start mb-0.5 border-b pb-0.5" style={{ borderColor: color }}>
          <div className="space-y-0.5">
            <div className="h-0.5 w-10 rounded" style={{ backgroundColor: color }} />
            <div className="h-0.5 w-8 rounded bg-gray-200" />
          </div>
          <div className="space-y-0.5">
            <div className="h-0.5 w-6 rounded bg-gray-200" />
            <div className="h-0.5 w-8 rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-0.5 w-full rounded bg-gray-100" />
      </div>
    ),
    bold: (
      <div className="h-full w-full overflow-hidden rounded p-1">
        <div className="h-3 font-black text-gray-800 flex items-end gap-0.5">
          <div className="h-2 w-5 rounded bg-gray-800" />
          <div className="h-2.5 w-4 rounded" style={{ backgroundColor: color }} />
        </div>
        <div className="h-1 w-full rounded mt-0.5" style={{ backgroundColor: color }} />
        <div className="space-y-0.5 mt-0.5">
          <div className="h-0.5 w-full rounded bg-gray-100" />
        </div>
      </div>
    ),
  };

  return thumbnails[id] ?? thumbnails.modern;
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", checked ? "bg-primary" : "bg-muted")}
      >
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-4" : "translate-x-0.5")} />
      </button>
    </label>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function DesignStudioClient({ resumes }: DesignStudioClientProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id ?? "");
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [template, setTemplate] = useState("modern");
  const [theme, setTheme] = useState<ResumeTheme>(DEFAULT_THEME);
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [zoom, setZoom] = useState(0.55);
  const [activeTab, setActiveTab] = useState<StudioTab>("templates");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);

  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load resume
  useEffect(() => {
    if (!selectedResumeId) return;
    setIsLoading(true);
    fetch(`/api/resumes/${selectedResumeId}/content`)
      .then((r) => r.json())
      .then((result: { success: boolean; data: ResumeData }) => {
        if (result.success) {
          const data = result.data;
          setPreviewData(data);
          setTemplate(data.template);
          setTheme({ ...DEFAULT_THEME, ...data.theme });
          setSectionOrder(data.sectionOrder);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedResumeId]);

  // Computed display data (derived, not stored)
  const displayData: ResumeData | null = previewData
    ? { ...previewData, template, theme, sectionOrder }
    : null;

  // Debounced save
  const scheduleSave = useCallback((updates: Record<string, unknown>) => {
    if (!selectedResumeId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await fetch(`/api/resumes/${selectedResumeId}/theme`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } finally {
        setIsSaving(false);
      }
    }, 900);
  }, [selectedResumeId]);

  const handleThemeChange = useCallback((updates: Partial<ResumeTheme>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    scheduleSave({ ...newTheme, template, sectionOrder });
  }, [theme, template, sectionOrder, scheduleSave]);

  const handleTemplateChange = useCallback((newTemplate: string) => {
    setTemplate(newTemplate);
    scheduleSave({ template: newTemplate, ...theme, sectionOrder });
  }, [theme, sectionOrder, scheduleSave]);

  const handleSectionOrderChange = useCallback((newOrder: string[]) => {
    setSectionOrder(newOrder);
    scheduleSave({ template, ...theme, sectionOrder: newOrder });
  }, [template, theme, scheduleSave]);

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sectionOrder.indexOf(String(active.id));
    const newIdx = sectionOrder.indexOf(String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;
    handleSectionOrderChange(arrayMove(sectionOrder, oldIdx, newIdx));
  }, [sectionOrder, handleSectionOrderChange]);

  // Save preset
  const savePreset = async () => {
    if (!presetName.trim()) return;
    await fetch("/api/design-presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: presetName.trim(), template, themeJson: theme }),
    });
    setPresetName("");
    setShowPresetInput(false);
  };

  const previewWidth = BREAKPOINT_WIDTHS[breakpoint];

  const tabs: { id: StudioTab; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { id: "templates", icon: Layout, label: "Templates" },
    { id: "theme", icon: Palette, label: "Theme" },
    { id: "sections", icon: Layers, label: "Sections" },
  ];

  const SECTION_STYLE_OPTIONS: Array<{ value: ResumeTheme["sectionStyle"]; label: string }> = [
    { value: "line", label: "Line" },
    { value: "box", label: "Box" },
    { value: "underline", label: "Under" },
    { value: "caps", label: "Caps" },
    { value: "none", label: "None" },
  ];

  const PHOTO_SHAPES: Array<{ value: ResumeTheme["photoShape"]; label: string }> = [
    { value: "circle", label: "Circle" },
    { value: "square", label: "Square" },
    { value: "rounded", label: "Rounded" },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Design Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Resume picker */}
          {resumes.length > 0 && (
            <div className="relative">
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                aria-label="Select resume"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          )}

          {isSaving && (
            <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>
          )}

          {/* Save preset */}
          {showPresetInput ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && savePreset()}
                placeholder="Preset name…"
                className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-36"
                autoFocus
              />
              <Button size="sm" variant="default" onClick={savePreset} className="h-8 px-2">
                <Save className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowPresetInput(false)} className="h-8 px-2">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setShowPresetInput(true)} className="h-8 gap-1.5">
              <BookmarkPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Save Preset</span>
            </Button>
          )}

          {selectedResumeId && (
            <Link href={`/resumes/${selectedResumeId}/edit`}>
              <Button size="sm" variant="outline" className="h-8 gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Open Editor</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ── */}
        <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-background">
          {/* Tabs */}
          <div className="flex h-10 shrink-0 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* ── Templates Tab ── */}
            {activeTab === "templates" && (
              <div className="p-3">
                {(["popular", "professional", "creative"] as const).map((cat) => {
                  const catTemplates = TEMPLATES.filter((t) => t.category === cat);
                  return (
                    <div key={cat} className="mb-4">
                      <h3 className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {cat}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {catTemplates.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => handleTemplateChange(t.id)}
                            className={cn(
                              "flex flex-col items-start gap-1 rounded-lg border-2 p-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              template === t.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40 hover:bg-accent/30"
                            )}
                            aria-pressed={template === t.id}
                          >
                            <div className="relative h-14 w-full rounded bg-muted/50 overflow-hidden">
                              <TemplateThumbnail id={t.id} color={theme.themeColor} />
                              {template === t.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <span className={cn("text-[11px] font-semibold leading-tight", template === t.id ? "text-primary" : "text-foreground")}>
                              {t.label}
                            </span>
                            <span className="text-[9px] leading-tight text-muted-foreground line-clamp-1">{t.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Theme Tab ── */}
            {activeTab === "theme" && (
              <div className="space-y-5 p-4">
                {/* Color presets */}
                <section>
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Color Presets</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => handleThemeChange({ themeColor: preset.primary, secondaryColor: preset.secondary })}
                        className={cn(
                          "flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-xs font-medium transition-all hover:border-primary/40 hover:bg-accent/30",
                          theme.themeColor === preset.primary && "border-primary bg-primary/5"
                        )}
                      >
                        <div className="flex gap-0.5">
                          <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: preset.primary }} />
                          <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: preset.secondary }} />
                        </div>
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Primary color */}
                <section>
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Primary Color</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => handleThemeChange({ themeColor: c.value })}
                        className={cn(
                          "h-7 w-7 rounded-full border-2 transition-transform",
                          theme.themeColor === c.value ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                        aria-label={`Set primary color to ${c.label}`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.themeColor}
                      onChange={(e) => handleThemeChange({ themeColor: e.target.value })}
                      className="h-8 w-12 cursor-pointer rounded border border-input"
                      aria-label="Custom primary color"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{theme.themeColor}</span>
                  </div>
                </section>

                {/* Secondary color */}
                <section>
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Secondary Color</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.secondaryColor ?? "#1E293B"}
                      onChange={(e) => handleThemeChange({ secondaryColor: e.target.value })}
                      className="h-8 w-12 cursor-pointer rounded border border-input"
                      aria-label="Secondary color"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{theme.secondaryColor ?? "#1E293B"}</span>
                  </div>
                </section>

                {/* Font family */}
                <section>
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Font Family</h3>
                  <div className="space-y-0.5">
                    {FONT_OPTIONS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => handleThemeChange({ fontFamily: f.value })}
                        style={{ fontFamily: FONT_MAP[f.value] ?? "inherit" }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-all",
                          theme.fontFamily === f.value ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent text-foreground"
                        )}
                      >
                        {f.label}
                        {theme.fontFamily === f.value && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Font size */}
                <section>
                  <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Font Size — {theme.fontSize}px</h3>
                  <input type="range" min={10} max={18} step={1} value={theme.fontSize}
                    onChange={(e) => handleThemeChange({ fontSize: Number(e.target.value) })}
                    className="w-full accent-primary" aria-label="Font size" />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5"><span>Small</span><span>Large</span></div>
                </section>

                {/* Line height */}
                <section>
                  <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Line Height — {theme.lineHeight.toFixed(1)}</h3>
                  <input type="range" min={1.2} max={2.0} step={0.1} value={theme.lineHeight}
                    onChange={(e) => handleThemeChange({ lineHeight: Number(e.target.value) })}
                    className="w-full accent-primary" aria-label="Line height" />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5"><span>Compact</span><span>Spacious</span></div>
                </section>

                {/* Page margin */}
                <section>
                  <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Page Margin — {theme.pageMargin}px</h3>
                  <input type="range" min={20} max={80} step={4} value={theme.pageMargin}
                    onChange={(e) => handleThemeChange({ pageMargin: Number(e.target.value) })}
                    className="w-full accent-primary" aria-label="Page margin" />
                </section>

                {/* Header style */}
                <section>
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Header Style</h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["classic", "centered", "compact"] as const).map((s) => (
                      <button key={s} onClick={() => handleThemeChange({ headerStyle: s })}
                        className={cn(
                          "rounded-md border py-1.5 text-xs capitalize transition-all",
                          theme.headerStyle === s ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/40 text-muted-foreground"
                        )}>{s}</button>
                    ))}
                  </div>
                </section>

                {/* Section style */}
                <section>
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Section Titles</h3>
                  <div className="flex flex-wrap gap-1">
                    {SECTION_STYLE_OPTIONS.map((s) => (
                      <button key={s.value} onClick={() => handleThemeChange({ sectionStyle: s.value })}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-xs transition-all",
                          theme.sectionStyle === s.value ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/40 text-muted-foreground"
                        )}>{s.label}</button>
                    ))}
                  </div>
                </section>

                {/* Photo shape */}
                <section>
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Photo Shape</h3>
                  <div className="flex gap-2">
                    {PHOTO_SHAPES.map((s) => (
                      <button key={s.value} onClick={() => handleThemeChange({ photoShape: s.value })}
                        className={cn(
                          "flex flex-1 flex-col items-center gap-1.5 rounded-md border py-2 text-xs transition-all",
                          theme.photoShape === s.value ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/40 text-muted-foreground"
                        )}>
                        <div className={cn(
                          "h-6 w-6 bg-primary/20 border-2",
                          s.value === "circle" ? "rounded-full border-primary/40" : s.value === "rounded" ? "rounded-lg border-primary/40" : "rounded-none border-primary/40"
                        )} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Toggles */}
                <section className="space-y-3">
                  <Toggle checked={theme.showIcons ?? true} onChange={(v) => handleThemeChange({ showIcons: v })} label="Show Icons" />
                  <Toggle checked={theme.showDividers !== false} onChange={(v) => handleThemeChange({ showDividers: v })} label="Show Dividers" />
                  <Toggle checked={theme.watermark !== false} onChange={(v) => handleThemeChange({ watermark: v })} label="Watermark (free plan)" />
                </section>
              </div>
            )}

            {/* ── Sections Tab ── */}
            {activeTab === "sections" && (
              <div className="p-4">
                <p className="mb-3 text-xs text-muted-foreground">Drag sections to reorder them on your resume.</p>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1.5">
                      {sectionOrder.map((sectionId) => {
                        const isCustom = sectionId.startsWith("custom-");
                        const label = isCustom
                          ? (previewData?.customSections.find((cs) => cs.id === sectionId.replace("custom-", ""))?.title ?? "Custom Section")
                          : (SECTION_LABELS[sectionId] ?? sectionId);
                        return <SortableSection key={sectionId} id={sectionId} label={label} />;
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
                <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground">
                  ✓ Changes auto-save instantly
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Preview Panel ── */}
        <main className="flex flex-1 flex-col overflow-hidden bg-muted/30">
          {/* Preview controls */}
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-background px-4">
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              {([
                { key: "desktop", icon: Monitor },
                { key: "tablet", icon: Tablet },
                { key: "mobile", icon: Smartphone },
              ] as const).map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setBreakpoint(key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                    breakpoint === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-pressed={breakpoint === key}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline capitalize">{key}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">{previewWidth}px</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(0.3, z - 0.05))}
                  className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="w-12 text-center text-xs font-mono text-muted-foreground">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(1.2, z + 0.05))}
                  className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Preview content */}
          <div className="flex flex-1 items-start justify-center overflow-auto p-6">
            {isLoading ? (
              <div className="flex h-96 w-full max-w-md items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading resume…</p>
                </div>
              </div>
            ) : !displayData ? (
              <div className="flex h-96 w-full max-w-md flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Palette className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">No resume selected</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {resumes.length === 0
                      ? "Create a resume first to start designing."
                      : "Select a resume above to begin customizing."}
                  </p>
                </div>
                {resumes.length === 0 && (
                  <Link href="/resumes/new">
                    <Button variant="default" size="sm">Create Resume</Button>
                  </Link>
                )}
              </div>
            ) : (
              <motion.div
                layout
                style={{
                  width: previewWidth,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  flexShrink: 0,
                  marginBottom: `${-(previewWidth * (1 - zoom) * 0.5)}px`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <ResumePreview data={displayData} />
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
