"use client";

import { memo, useState, useCallback } from "react";
import { Trophy, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader, EmptyState, ItemActions } from "@/components/editor/section-ui";
import { FormField, TextAreaField } from "@/components/editor/form-field";
import { Button } from "@/components/ui/button";
import type { AwardItem } from "@/types/resume";

const defaultItem = (): AwardItem => ({ id: nanoid(), title: "", issuer: "", date: "", description: "", order: 0 });

interface Props { items: AwardItem[]; onUpdate: (items: AwardItem[]) => void; }

function AwardCard({ item, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }: { item: AwardItem; index: number; total: number; onUpdate: (u: Partial<AwardItem>) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; }) {
  const [open, setOpen] = useState(true);
  const set = (key: keyof AwardItem) => (v: string) => onUpdate({ [key]: v });
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex-1 min-w-0"><p className="truncate text-sm font-medium">{item.title || "New Award"}</p>{item.issuer && <p className="text-xs text-muted-foreground">{item.issuer}</p>}</div>
        <ItemActions onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} isFirst={index === 0} isLast={index === total - 1} />
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
      {open && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2"><label className="text-xs font-medium text-muted-foreground">Award Title *</label><FormField value={item.title} onChange={set("title")} placeholder="Best Innovation Award" /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Issuer / Organization</label><FormField value={item.issuer} onChange={set("issuer")} placeholder="Acme Corp" /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Date</label><input type="month" value={item.date} onChange={(e) => set("date")(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          </div>
          <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Description</label><TextAreaField value={item.description} onChange={set("description")} placeholder="Brief description of the award..." rows={2} /></div>
        </div>
      )}
    </div>
  );
}

export const AwardsSection = memo(function AwardsSection({ items, onUpdate }: Props) {
  const addItem = useCallback(() => onUpdate([...items, defaultItem()]), [items, onUpdate]);
  const updateItem = useCallback((id: string, u: Partial<AwardItem>) => onUpdate(items.map((i) => i.id === id ? { ...i, ...u } : i)), [items, onUpdate]);
  const deleteItem = useCallback((id: string) => onUpdate(items.filter((i) => i.id !== id)), [items, onUpdate]);
  const moveItem = useCallback((id: string, dir: -1 | 1) => { const idx = items.findIndex((i) => i.id === id); if (idx === -1) return; const arr = [...items]; const swap = idx + dir; if (swap < 0 || swap >= arr.length) return; [arr[idx], arr[swap]] = [arr[swap], arr[idx]]; onUpdate(arr); }, [items, onUpdate]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Trophy} title="Awards" description="Recognition and honors you've received" />
      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState icon={Trophy} title="No awards added" description="Add awards and recognitions" action={<Button size="sm" onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Add Award</Button>} />
        ) : (
          items.map((item, i) => <AwardCard key={item.id} item={item} index={i} total={items.length} onUpdate={(u) => updateItem(item.id, u)} onDelete={() => deleteItem(item.id)} onMoveUp={() => moveItem(item.id, -1)} onMoveDown={() => moveItem(item.id, 1)} />)
        )}
      </div>
      {items.length > 0 && <Button variant="outline" className="w-full gap-2" onClick={addItem}><Plus className="h-4 w-4" /> Add Award</Button>}
    </div>
  );
});
