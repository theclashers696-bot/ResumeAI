"use client";

import { memo, useState, useCallback } from "react";
import { Star, Plus, X, GripVertical } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader, EmptyState } from "@/components/editor/section-ui";
import { FormField, SelectField } from "@/components/editor/form-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SkillItem } from "@/types/resume";
import { SKILL_LEVELS } from "@/types/resume";

const defaultSkill = (): SkillItem => ({ id: nanoid(), name: "", category: "", level: "INTERMEDIATE", rating: 3, order: 0 });

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-slate-100 text-slate-600",
  INTERMEDIATE: "bg-blue-100 text-blue-700",
  ADVANCED: "bg-green-100 text-green-700",
  EXPERT: "bg-purple-100 text-purple-700",
};

const SUGGESTIONS = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "AWS", "Docker", "Figma", "Git", "PostgreSQL", "GraphQL", "Kubernetes", "Next.js", "Vue.js"];

interface Props {
  items: SkillItem[];
  onUpdate: (items: SkillItem[]) => void;
}

export const SkillsSection = memo(function SkillsSection({ items, onUpdate }: Props) {
  const [newSkill, setNewSkill] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const addSkill = useCallback((name?: string) => {
    const skillName = name ?? newSkill.trim();
    if (!skillName) return;
    onUpdate([...items, { ...defaultSkill(), name: skillName, category: newCategory }]);
    if (!name) setNewSkill("");
  }, [items, newSkill, newCategory, onUpdate]);

  const updateItem = useCallback((id: string, updates: Partial<SkillItem>) => {
    onUpdate(items.map((s) => s.id === id ? { ...s, ...updates } : s));
  }, [items, onUpdate]);

  const deleteItem = useCallback((id: string) => onUpdate(items.filter((s) => s.id !== id)), [items, onUpdate]);

  const categories = [...new Set(items.map((s) => s.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <SectionHeader icon={Star} title="Skills" description="Showcase your technical and professional skills" />

      {/* Add skill */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold">Add Skill</h3>
        <div className="flex gap-2">
          <FormField
            value={newSkill}
            onChange={setNewSkill}
            placeholder="Skill name (e.g. React)"
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
          />
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category (optional)"
            className="h-9 w-32 shrink-0 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={() => addSkill()} className="shrink-0 gap-1.5">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {/* Suggestions */}
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.filter((s) => !items.find((i) => i.name === s)).slice(0, 10).map((s) => (
              <button
                key={s}
                onClick={() => addSkill(s)}
                className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs hover:border-primary hover:text-primary transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills list */}
      {items.length === 0 ? (
        <EmptyState icon={Star} title="No skills added yet" description="Add skills to show employers what you know" />
      ) : (
        <div className="space-y-4">
          {categories.length > 0 ? (
            <>
              {categories.map((cat) => (
                <div key={cat} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">{cat}</h3>
                  <SkillList items={items.filter((s) => s.category === cat)} onUpdate={updateItem} onDelete={deleteItem} />
                </div>
              ))}
              {items.filter((s) => !s.category).length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Other</h3>
                  <SkillList items={items.filter((s) => !s.category)} onUpdate={updateItem} onDelete={deleteItem} />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <SkillList items={items} onUpdate={updateItem} onDelete={deleteItem} />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

function SkillList({
  items,
  onUpdate,
  onDelete,
}: {
  items: SkillItem[];
  onUpdate: (id: string, u: Partial<SkillItem>) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((skill) => (
        <div key={skill.id} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
          <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
          <span className="flex-1 text-sm font-medium">{skill.name}</span>

          {/* Rating dots */}
          <div className="flex gap-0.5" role="group" aria-label={`Rating: ${skill.rating}/5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => onUpdate(skill.id, { rating: n })}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  n <= skill.rating ? "bg-primary" : "bg-muted-foreground/20"
                )}
                aria-label={`Rate ${n}`}
              />
            ))}
          </div>

          <select
            value={skill.level}
            onChange={(e) => onUpdate(skill.id, { level: e.target.value as SkillItem["level"] })}
            className={cn(
              "rounded-full border-0 px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring",
              LEVEL_COLORS[skill.level]
            )}
            aria-label={`Skill level for ${skill.name}`}
          >
            {SKILL_LEVELS.map((l) => (
              <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
            ))}
          </select>

          <button onClick={() => onDelete(skill.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors" aria-label={`Remove ${skill.name}`}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
