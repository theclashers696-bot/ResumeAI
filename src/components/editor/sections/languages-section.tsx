"use client";

import { memo, useCallback } from "react";
import { Globe, Plus, X } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader, EmptyState } from "@/components/editor/section-ui";
import { SelectField } from "@/components/editor/form-field";
import { Button } from "@/components/ui/button";
import type { LanguageItem } from "@/types/resume";
import { LANGUAGE_PROFICIENCY } from "@/types/resume";

const defaultItem = (): LanguageItem => ({ id: nanoid(), name: "", proficiency: "Conversational", order: 0 });

interface Props { items: LanguageItem[]; onUpdate: (items: LanguageItem[]) => void; }

export const LanguagesSection = memo(function LanguagesSection({ items, onUpdate }: Props) {
  const addItem = useCallback(() => onUpdate([...items, defaultItem()]), [items, onUpdate]);
  const updateItem = useCallback((id: string, u: Partial<LanguageItem>) => onUpdate(items.map((i) => i.id === id ? { ...i, ...u } : i)), [items, onUpdate]);
  const deleteItem = useCallback((id: string) => onUpdate(items.filter((i) => i.id !== id)), [items, onUpdate]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Globe} title="Languages" description="Languages you speak and their proficiency levels" />
      {items.length === 0 ? (
        <EmptyState icon={Globe} title="No languages added" description="Add the languages you speak" action={<Button size="sm" onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Add Language</Button>} />
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <input
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                placeholder="Language (e.g. Spanish)"
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <SelectField
                value={item.proficiency}
                onChange={(v) => updateItem(item.id, { proficiency: v })}
                options={LANGUAGE_PROFICIENCY.map((p) => ({ label: p, value: p }))}
                className="w-36"
              />
              <button onClick={() => deleteItem(item.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors" aria-label="Remove language">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-2 mt-2" onClick={addItem}>
            <Plus className="h-3.5 w-3.5" /> Add Language
          </Button>
        </div>
      )}
    </div>
  );
});
