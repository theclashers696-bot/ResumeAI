"use client";

import { memo, useState, useCallback } from "react";
import { Users, Plus, ChevronDown, ChevronUp, Mail, Phone } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader, EmptyState, ItemActions } from "@/components/editor/section-ui";
import { FormField } from "@/components/editor/form-field";
import { Button } from "@/components/ui/button";
import type { ReferenceItem } from "@/types/resume";

const defaultItem = (): ReferenceItem => ({ id: nanoid(), name: "", company: "", position: "", phone: "", email: "", order: 0 });

interface Props { items: ReferenceItem[]; onUpdate: (items: ReferenceItem[]) => void; }

function RefCard({ item, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }: { item: ReferenceItem; index: number; total: number; onUpdate: (u: Partial<ReferenceItem>) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; }) {
  const [open, setOpen] = useState(true);
  const set = (key: keyof ReferenceItem) => (v: string) => onUpdate({ [key]: v });
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex-1 min-w-0"><p className="truncate text-sm font-medium">{item.name || "New Reference"}</p>{item.position && <p className="text-xs text-muted-foreground">{item.position}{item.company ? ` at ${item.company}` : ""}</p>}</div>
        <ItemActions onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} isFirst={index === 0} isLast={index === total - 1} />
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
      {open && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Full Name *</label><FormField value={item.name} onChange={set("name")} placeholder="Jane Smith" /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Company</label><FormField value={item.company} onChange={set("company")} placeholder="Acme Corp" /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Position</label><FormField value={item.position} onChange={set("position")} placeholder="Engineering Manager" /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Phone</label><FormField value={item.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" icon={Phone} type="tel" /></div>
            <div className="space-y-1.5 sm:col-span-2"><label className="text-xs font-medium text-muted-foreground">Email</label><FormField value={item.email} onChange={set("email")} placeholder="jane@example.com" icon={Mail} type="email" /></div>
          </div>
        </div>
      )}
    </div>
  );
}

export const ReferencesSection = memo(function ReferencesSection({ items, onUpdate }: Props) {
  const addItem = useCallback(() => onUpdate([...items, defaultItem()]), [items, onUpdate]);
  const updateItem = useCallback((id: string, u: Partial<ReferenceItem>) => onUpdate(items.map((i) => i.id === id ? { ...i, ...u } : i)), [items, onUpdate]);
  const deleteItem = useCallback((id: string) => onUpdate(items.filter((i) => i.id !== id)), [items, onUpdate]);
  const moveItem = useCallback((id: string, dir: -1 | 1) => { const idx = items.findIndex((i) => i.id === id); if (idx === -1) return; const arr = [...items]; const swap = idx + dir; if (swap < 0 || swap >= arr.length) return; [arr[idx], arr[swap]] = [arr[swap], arr[idx]]; onUpdate(arr); }, [items, onUpdate]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Users} title="References" description="Professional references who can vouch for your work" />
      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState icon={Users} title="No references added" description="Add professional references" action={<Button size="sm" onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Add Reference</Button>} />
        ) : (
          items.map((item, i) => <RefCard key={item.id} item={item} index={i} total={items.length} onUpdate={(u) => updateItem(item.id, u)} onDelete={() => deleteItem(item.id)} onMoveUp={() => moveItem(item.id, -1)} onMoveDown={() => moveItem(item.id, 1)} />)
        )}
      </div>
      {items.length > 0 && <Button variant="outline" className="w-full gap-2" onClick={addItem}><Plus className="h-4 w-4" /> Add Reference</Button>}
    </div>
  );
});
