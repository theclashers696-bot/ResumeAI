"use client";

import { memo, useCallback } from "react";
import { Layers, Plus, X } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader } from "@/components/editor/section-ui";
import { TextAreaField } from "@/components/editor/form-field";
import { Button } from "@/components/ui/button";
import type { CustomSectionItem, CustomSectionEntry } from "@/types/resume";

const defaultEntry = (): CustomSectionEntry => ({ id: nanoid(), title: "", subtitle: "", date: "", description: "" });

interface Props { section: CustomSectionItem; onUpdate: (section: CustomSectionItem) => void; }

export const CustomSectionEditor = memo(function CustomSectionEditor({ section, onUpdate }: Props) {
  const updateTitle = useCallback((title: string) => onUpdate({ ...section, title }), [section, onUpdate]);

  const addEntry = useCallback(() => {
    onUpdate({ ...section, content: [...section.content, defaultEntry()] });
  }, [section, onUpdate]);

  const updateEntry = useCallback((id: string, updates: Partial<CustomSectionEntry>) => {
    onUpdate({ ...section, content: section.content.map((e) => e.id === id ? { ...e, ...updates } : e) });
  }, [section, onUpdate]);

  const deleteEntry = useCallback((id: string) => {
    onUpdate({ ...section, content: section.content.filter((e) => e.id !== id) });
  }, [section, onUpdate]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Layers} title="Custom Section" description="Add any custom content to your resume" />

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Section Title</label>
          <input
            value={section.title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="e.g. Patents, Speaking, Side Projects..."
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-3">
        {section.content.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Entry</span>
              <button onClick={() => deleteEntry(entry.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input value={entry.title} onChange={(e) => updateEntry(entry.id, { title: e.target.value })} placeholder="Entry title" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Subtitle</label>
                <input value={entry.subtitle} onChange={(e) => updateEntry(entry.id, { subtitle: e.target.value })} placeholder="Subtitle or organization" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <input type="month" value={entry.date} onChange={(e) => updateEntry(entry.id, { date: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <TextAreaField value={entry.description} onChange={(v) => updateEntry(entry.id, { description: v })} placeholder="Describe this entry..." rows={2} />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full gap-2" onClick={addEntry}><Plus className="h-4 w-4" /> Add Entry</Button>
      </div>
    </div>
  );
});
