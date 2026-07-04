"use client";

import { memo, useState, useCallback } from "react";
import { Award, Plus, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader, EmptyState, ItemActions } from "@/components/editor/section-ui";
import { FormField } from "@/components/editor/form-field";
import { Button } from "@/components/ui/button";
import type { CertificationItem } from "@/types/resume";

const defaultItem = (): CertificationItem => ({ id: nanoid(), name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", url: "", order: 0 });

interface Props { items: CertificationItem[]; onUpdate: (items: CertificationItem[]) => void; }

function CertCard({ item, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }: { item: CertificationItem; index: number; total: number; onUpdate: (u: Partial<CertificationItem>) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; }) {
  const [open, setOpen] = useState(true);
  const set = (key: keyof CertificationItem) => (v: string) => onUpdate({ [key]: v });

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors" onClick={() => setOpen(!open)}>
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{item.name || "New Certification"}</p>
          {item.issuer && <p className="text-xs text-muted-foreground">{item.issuer}</p>}
        </div>
        <ItemActions onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} isFirst={index === 0} isLast={index === total - 1} />
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
      {open && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Certification Name *</label>
              <FormField value={item.name} onChange={set("name")} placeholder="AWS Solutions Architect" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Issuing Organization *</label>
              <FormField value={item.issuer} onChange={set("issuer")} placeholder="Amazon Web Services" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Credential ID</label>
              <FormField value={item.credentialId} onChange={set("credentialId")} placeholder="ABC-123456" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Issue Date</label>
              <input type="month" value={item.issueDate} onChange={(e) => set("issueDate")(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Expiry Date</label>
              <input type="month" value={item.expiryDate} onChange={(e) => set("expiryDate")(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Credential URL</label>
              <FormField value={item.url} onChange={set("url")} placeholder="https://credly.com/badges/..." type="url" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const CertificationsSection = memo(function CertificationsSection({ items, onUpdate }: Props) {
  const addItem = useCallback(() => onUpdate([...items, defaultItem()]), [items, onUpdate]);
  const updateItem = useCallback((id: string, u: Partial<CertificationItem>) => onUpdate(items.map((i) => i.id === id ? { ...i, ...u } : i)), [items, onUpdate]);
  const deleteItem = useCallback((id: string) => onUpdate(items.filter((i) => i.id !== id)), [items, onUpdate]);
  const moveItem = useCallback((id: string, dir: -1 | 1) => { const idx = items.findIndex((i) => i.id === id); if (idx === -1) return; const arr = [...items]; const swap = idx + dir; if (swap < 0 || swap >= arr.length) return; [arr[idx], arr[swap]] = [arr[swap], arr[idx]]; onUpdate(arr); }, [items, onUpdate]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Award} title="Certifications" description="Professional certifications and credentials" />
      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState icon={Award} title="No certifications yet" description="Add your professional certifications" action={<Button size="sm" onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Add Certification</Button>} />
        ) : (
          items.map((item, i) => <CertCard key={item.id} item={item} index={i} total={items.length} onUpdate={(u) => updateItem(item.id, u)} onDelete={() => deleteItem(item.id)} onMoveUp={() => moveItem(item.id, -1)} onMoveDown={() => moveItem(item.id, 1)} />)
        )}
      </div>
      {items.length > 0 && <Button variant="outline" className="w-full gap-2" onClick={addItem}><Plus className="h-4 w-4" /> Add Certification</Button>}
    </div>
  );
});
