"use client";

import { memo, useState, useCallback } from "react";
import { Briefcase, Plus, ChevronDown, ChevronUp, GripVertical, Sparkles } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader, EmptyState, ItemActions } from "@/components/editor/section-ui";
import { FormField, TextAreaField, TagsInput, DateRange, SelectField } from "@/components/editor/form-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkExperienceItem } from "@/types/resume";
import { EMPLOYMENT_TYPES } from "@/types/resume";

const defaultItem = (): WorkExperienceItem => ({
  id: nanoid(),
  company: "",
  position: "",
  location: "",
  employmentType: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  achievements: [],
  technologies: [],
  order: 0,
});

interface Props {
  items: WorkExperienceItem[];
  onUpdate: (items: WorkExperienceItem[]) => void;
}

function ExperienceCard({
  item,
  index,
  total,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: {
  item: WorkExperienceItem;
  index: number;
  total: number;
  onUpdate: (updates: Partial<WorkExperienceItem>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(true);
  const set = (key: keyof WorkExperienceItem) => (value: unknown) => onUpdate({ [key]: value });
  const title = item.position || item.company ? `${item.position}${item.company ? ` at ${item.company}` : ""}` : "New Experience";

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
          {item.startDate && (
            <p className="text-xs text-muted-foreground">
              {item.startDate} — {item.current ? "Present" : item.endDate || "..."}
            </p>
          )}
        </div>
        <ItemActions
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          isFirst={index === 0}
          isLast={index === total - 1}
        />
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>

      {open && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Company *</label>
              <FormField value={item.company} onChange={set("company") as (v: string) => void} placeholder="Acme Corporation" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Job Title *</label>
              <FormField value={item.position} onChange={set("position") as (v: string) => void} placeholder="Software Engineer" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <FormField value={item.location} onChange={set("location") as (v: string) => void} placeholder="New York, NY" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Employment Type</label>
              <SelectField
                value={item.employmentType}
                onChange={set("employmentType") as (v: string) => void}
                options={EMPLOYMENT_TYPES.map((t) => ({ label: t, value: t }))}
                placeholder="Select type"
              />
            </div>
          </div>

          <DateRange
            startDate={item.startDate}
            endDate={item.endDate}
            current={item.current}
            onStartChange={set("startDate") as (v: string) => void}
            onEndChange={set("endDate") as (v: string) => void}
            onCurrentChange={set("current") as (v: boolean) => void}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <TextAreaField
              value={item.description}
              onChange={set("description") as (v: string) => void}
              placeholder="Describe your role, responsibilities, and impact..."
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Key Achievements</label>
            <TagsInput
              tags={item.achievements}
              onChange={set("achievements") as (v: string[]) => void}
              placeholder="Add achievement, press Enter"
            />
            <p className="text-[11px] text-muted-foreground">{"Use numbers and metrics where possible (e.g., \"Reduced load time by 40%\")"}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Technologies Used</label>
            <TagsInput
              tags={item.technologies}
              onChange={set("technologies") as (v: string[]) => void}
              placeholder="React, Node.js, AWS..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const ExperienceSection = memo(function ExperienceSection({ items, onUpdate }: Props) {
  const addItem = useCallback(() => {
    onUpdate([...items, defaultItem()]);
  }, [items, onUpdate]);

  const updateItem = useCallback(
    (id: string, updates: Partial<WorkExperienceItem>) => {
      onUpdate(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    },
    [items, onUpdate]
  );

  const deleteItem = useCallback(
    (id: string) => onUpdate(items.filter((item) => item.id !== id)),
    [items, onUpdate]
  );

  const duplicateItem = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item) onUpdate([...items, { ...item, id: nanoid() }]);
    },
    [items, onUpdate]
  );

  const moveItem = useCallback(
    (id: string, dir: -1 | 1) => {
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return;
      const newItems = [...items];
      const swap = idx + dir;
      if (swap < 0 || swap >= newItems.length) return;
      [newItems[idx], newItems[swap]] = [newItems[swap], newItems[idx]];
      onUpdate(newItems);
    },
    [items, onUpdate]
  );

  return (
    <div className="space-y-6">
      <SectionHeader icon={Briefcase} title="Work Experience" description="Add your professional work history" />

      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No experience added yet"
            description="Add your work history to showcase your professional background"
            action={
              <Button size="sm" onClick={addItem} className="gap-2">
                <Plus className="h-4 w-4" /> Add Experience
              </Button>
            }
          />
        ) : (
          items.map((item, i) => (
            <ExperienceCard
              key={item.id}
              item={item}
              index={i}
              total={items.length}
              onUpdate={(updates) => updateItem(item.id, updates)}
              onDelete={() => deleteItem(item.id)}
              onDuplicate={() => duplicateItem(item.id)}
              onMoveUp={() => moveItem(item.id, -1)}
              onMoveDown={() => moveItem(item.id, 1)}
            />
          ))
        )}
      </div>

      {items.length > 0 && (
        <Button variant="outline" className="w-full gap-2" onClick={addItem}>
          <Plus className="h-4 w-4" /> Add Experience
        </Button>
      )}
    </div>
  );
});
