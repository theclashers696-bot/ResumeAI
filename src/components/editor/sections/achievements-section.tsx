"use client";

import { memo, useCallback } from "react";
import { Trophy, Plus, X } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader, EmptyState } from "@/components/editor/section-ui";
import { Button } from "@/components/ui/button";
import type { AchievementItem } from "@/types/resume";

const defaultItem = (): AchievementItem => ({ id: nanoid(), title: "", description: "", date: "", order: 0 });

interface Props { items: AchievementItem[]; onUpdate: (items: AchievementItem[]) => void; }

export const AchievementsSection = memo(function AchievementsSection({ items, onUpdate }: Props) {
  const addItem = useCallback(() => onUpdate([...items, defaultItem()]), [items, onUpdate]);
  const updateItem = useCallback((id: string, u: Partial<AchievementItem>) => onUpdate(items.map((i) => i.id === id ? { ...i, ...u } : i)), [items, onUpdate]);
  const deleteItem = useCallback((id: string) => onUpdate(items.filter((i) => i.id !== id)), [items, onUpdate]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Trophy} title="Achievements" description="Notable accomplishments and milestones" />
      {items.length === 0 ? (
        <EmptyState icon={Trophy} title="No achievements added" description="Highlight your key accomplishments" action={<Button size="sm" onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Add Achievement</Button>} />
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg bg-muted/30 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <input value={item.title} onChange={(e) => updateItem(item.id, { title: e.target.value })} placeholder="Achievement title" className="h-8 flex-1 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input type="month" value={item.date} onChange={(e) => updateItem(item.id, { date: e.target.value })} className="h-8 w-32 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <button onClick={() => deleteItem(item.id)} className="mt-0.5 text-muted-foreground/50 hover:text-destructive transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <textarea value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} placeholder="Describe this achievement..." rows={2} className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-2" onClick={addItem}><Plus className="h-3.5 w-3.5" /> Add Achievement</Button>
        </div>
      )}
    </div>
  );
});
