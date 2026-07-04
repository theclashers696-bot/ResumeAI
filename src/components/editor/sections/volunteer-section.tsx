"use client";

import { memo, useState, useCallback } from "react";
import { Heart, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader, EmptyState, ItemActions } from "@/components/editor/section-ui";
import { FormField, TextAreaField, DateRange } from "@/components/editor/form-field";
import { Button } from "@/components/ui/button";
import type { VolunteerItem } from "@/types/resume";

const defaultItem = (): VolunteerItem => ({ id: nanoid(), organization: "", role: "", startDate: "", endDate: "", current: false, description: "", order: 0 });

interface Props { items: VolunteerItem[]; onUpdate: (items: VolunteerItem[]) => void; }

function VolunteerCard({ item, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }: { item: VolunteerItem; index: number; total: number; onUpdate: (u: Partial<VolunteerItem>) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; }) {
  const [open, setOpen] = useState(true);
  const set = (key: keyof VolunteerItem) => (v: unknown) => onUpdate({ [key]: v });
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex-1 min-w-0"><p className="truncate text-sm font-medium">{item.role || item.organization || "New Volunteer Role"}</p>{item.organization && <p className="text-xs text-muted-foreground">{item.organization}</p>}</div>
        <ItemActions onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} isFirst={index === 0} isLast={index === total - 1} />
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
      {open && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Organization *</label><FormField value={item.organization} onChange={set("organization") as (v: string) => void} placeholder="Red Cross" /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Role *</label><FormField value={item.role} onChange={set("role") as (v: string) => void} placeholder="Volunteer Coordinator" /></div>
          </div>
          <DateRange startDate={item.startDate} endDate={item.endDate} current={item.current} onStartChange={set("startDate") as (v: string) => void} onEndChange={set("endDate") as (v: string) => void} onCurrentChange={set("current") as (v: boolean) => void} currentLabel="Currently volunteering here" />
          <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Description</label><TextAreaField value={item.description} onChange={set("description") as (v: string) => void} placeholder="What did you do and what impact did you make?" rows={3} /></div>
        </div>
      )}
    </div>
  );
}

export const VolunteerSection = memo(function VolunteerSection({ items, onUpdate }: Props) {
  const addItem = useCallback(() => onUpdate([...items, defaultItem()]), [items, onUpdate]);
  const updateItem = useCallback((id: string, u: Partial<VolunteerItem>) => onUpdate(items.map((i) => i.id === id ? { ...i, ...u } : i)), [items, onUpdate]);
  const deleteItem = useCallback((id: string) => onUpdate(items.filter((i) => i.id !== id)), [items, onUpdate]);
  const moveItem = useCallback((id: string, dir: -1 | 1) => { const idx = items.findIndex((i) => i.id === id); if (idx === -1) return; const arr = [...items]; const swap = idx + dir; if (swap < 0 || swap >= arr.length) return; [arr[idx], arr[swap]] = [arr[swap], arr[idx]]; onUpdate(arr); }, [items, onUpdate]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Heart} title="Volunteer Work" description="Community involvement and volunteer experience" />
      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState icon={Heart} title="No volunteer work added" description="Show your community involvement" action={<Button size="sm" onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Add Volunteer Work</Button>} />
        ) : (
          items.map((item, i) => <VolunteerCard key={item.id} item={item} index={i} total={items.length} onUpdate={(u) => updateItem(item.id, u)} onDelete={() => deleteItem(item.id)} onMoveUp={() => moveItem(item.id, -1)} onMoveDown={() => moveItem(item.id, 1)} />)
        )}
      </div>
      {items.length > 0 && <Button variant="outline" className="w-full gap-2" onClick={addItem}><Plus className="h-4 w-4" /> Add Volunteer Work</Button>}
    </div>
  );
});
