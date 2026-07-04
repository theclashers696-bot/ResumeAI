"use client";

import { memo, useState, useCallback } from "react";
import { GraduationCap, Plus, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader, EmptyState, ItemActions } from "@/components/editor/section-ui";
import { FormField, TextAreaField, DateRange } from "@/components/editor/form-field";
import { Button } from "@/components/ui/button";
import type { EducationItem } from "@/types/resume";

const defaultItem = (): EducationItem => ({
  id: nanoid(),
  institution: "",
  degree: "",
  fieldOfStudy: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  gpa: "",
  description: "",
  order: 0,
});

interface Props {
  items: EducationItem[];
  onUpdate: (items: EducationItem[]) => void;
}

function EducationCard({
  item,
  index,
  total,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: {
  item: EducationItem;
  index: number;
  total: number;
  onUpdate: (updates: Partial<EducationItem>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(true);
  const set = (key: keyof EducationItem) => (value: unknown) => onUpdate({ [key]: value });
  const title = item.institution || item.degree ? `${item.degree}${item.institution ? ` — ${item.institution}` : ""}` : "New Education";

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          {item.fieldOfStudy && <p className="text-xs text-muted-foreground">{item.fieldOfStudy}</p>}
        </div>
        <ItemActions onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDuplicate={onDuplicate} onDelete={onDelete} isFirst={index === 0} isLast={index === total - 1} />
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>

      {open && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">University / Institution *</label>
              <FormField value={item.institution} onChange={set("institution") as (v: string) => void} placeholder="MIT" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Degree *</label>
              <FormField value={item.degree} onChange={set("degree") as (v: string) => void} placeholder="Bachelor of Science" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Field of Study</label>
              <FormField value={item.fieldOfStudy} onChange={set("fieldOfStudy") as (v: string) => void} placeholder="Computer Science" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <FormField value={item.location} onChange={set("location") as (v: string) => void} placeholder="Cambridge, MA" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">GPA / CGPA</label>
              <FormField value={item.gpa} onChange={set("gpa") as (v: string) => void} placeholder="3.9 / 4.0" />
            </div>
          </div>
          <DateRange
            startDate={item.startDate}
            endDate={item.endDate}
            current={item.current}
            onStartChange={set("startDate") as (v: string) => void}
            onEndChange={set("endDate") as (v: string) => void}
            onCurrentChange={set("current") as (v: boolean) => void}
            currentLabel="Currently studying here"
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <TextAreaField value={item.description} onChange={set("description") as (v: string) => void} placeholder="Relevant coursework, activities, honors..." rows={3} />
          </div>
        </div>
      )}
    </div>
  );
}

export const EducationSection = memo(function EducationSection({ items, onUpdate }: Props) {
  const addItem = useCallback(() => onUpdate([...items, defaultItem()]), [items, onUpdate]);
  const updateItem = useCallback((id: string, u: Partial<EducationItem>) => onUpdate(items.map((i) => i.id === id ? { ...i, ...u } : i)), [items, onUpdate]);
  const deleteItem = useCallback((id: string) => onUpdate(items.filter((i) => i.id !== id)), [items, onUpdate]);
  const duplicateItem = useCallback((id: string) => { const item = items.find((i) => i.id === id); if (item) onUpdate([...items, { ...item, id: nanoid() }]); }, [items, onUpdate]);
  const moveItem = useCallback((id: string, dir: -1 | 1) => { const idx = items.findIndex((i) => i.id === id); if (idx === -1) return; const arr = [...items]; const swap = idx + dir; if (swap < 0 || swap >= arr.length) return; [arr[idx], arr[swap]] = [arr[swap], arr[idx]]; onUpdate(arr); }, [items, onUpdate]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={GraduationCap} title="Education" description="Your academic background and qualifications" />
      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No education added yet" description="Add your degrees and academic achievements" action={<Button size="sm" onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Add Education</Button>} />
        ) : (
          items.map((item, i) => (
            <EducationCard key={item.id} item={item} index={i} total={items.length} onUpdate={(u) => updateItem(item.id, u)} onDelete={() => deleteItem(item.id)} onDuplicate={() => duplicateItem(item.id)} onMoveUp={() => moveItem(item.id, -1)} onMoveDown={() => moveItem(item.id, 1)} />
          ))
        )}
      </div>
      {items.length > 0 && <Button variant="outline" className="w-full gap-2" onClick={addItem}><Plus className="h-4 w-4" /> Add Education</Button>}
    </div>
  );
});
