"use client";

import { memo, useState, useCallback } from "react";
import { FolderOpen, Plus, ChevronDown, ChevronUp, GripVertical, Github, Link } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader, EmptyState, ItemActions } from "@/components/editor/section-ui";
import { FormField, TextAreaField, TagsInput } from "@/components/editor/form-field";
import { Button } from "@/components/ui/button";
import type { ProjectItem } from "@/types/resume";

const defaultItem = (): ProjectItem => ({ id: nanoid(), name: "", description: "", url: "", github: "", technologies: [], images: [], startDate: "", endDate: "", order: 0 });

interface Props { items: ProjectItem[]; onUpdate: (items: ProjectItem[]) => void; }

function ProjectCard({ item, index, total, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown }: { item: ProjectItem; index: number; total: number; onUpdate: (u: Partial<ProjectItem>) => void; onDelete: () => void; onDuplicate: () => void; onMoveUp: () => void; onMoveDown: () => void; }) {
  const [open, setOpen] = useState(true);
  const set = (key: keyof ProjectItem) => (value: unknown) => onUpdate({ [key]: value });

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors" onClick={() => setOpen(!open)}>
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{item.name || "New Project"}</p>
          {item.technologies.length > 0 && <p className="text-xs text-muted-foreground">{item.technologies.slice(0, 3).join(", ")}</p>}
        </div>
        <ItemActions onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDuplicate={onDuplicate} onDelete={onDelete} isFirst={index === 0} isLast={index === total - 1} />
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
      {open && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Project Name *</label>
            <FormField value={item.name} onChange={set("name") as (v: string) => void} placeholder="My Awesome Project" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <TextAreaField value={item.description} onChange={set("description") as (v: string) => void} placeholder="What does this project do? What problem does it solve?" rows={3} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Live URL</label>
              <FormField value={item.url} onChange={set("url") as (v: string) => void} placeholder="https://myproject.com" type="url" icon={Link} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">GitHub</label>
              <FormField value={item.github} onChange={set("github") as (v: string) => void} placeholder="github.com/user/repo" icon={Github} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Technologies</label>
            <TagsInput tags={item.technologies} onChange={set("technologies") as (v: string[]) => void} placeholder="React, Node.js, MongoDB..." />
          </div>
        </div>
      )}
    </div>
  );
}

export const ProjectsSection = memo(function ProjectsSection({ items, onUpdate }: Props) {
  const addItem = useCallback(() => onUpdate([...items, defaultItem()]), [items, onUpdate]);
  const updateItem = useCallback((id: string, u: Partial<ProjectItem>) => onUpdate(items.map((i) => i.id === id ? { ...i, ...u } : i)), [items, onUpdate]);
  const deleteItem = useCallback((id: string) => onUpdate(items.filter((i) => i.id !== id)), [items, onUpdate]);
  const duplicateItem = useCallback((id: string) => { const item = items.find((i) => i.id === id); if (item) onUpdate([...items, { ...item, id: nanoid() }]); }, [items, onUpdate]);
  const moveItem = useCallback((id: string, dir: -1 | 1) => { const idx = items.findIndex((i) => i.id === id); if (idx === -1) return; const arr = [...items]; const swap = idx + dir; if (swap < 0 || swap >= arr.length) return; [arr[idx], arr[swap]] = [arr[swap], arr[idx]]; onUpdate(arr); }, [items, onUpdate]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={FolderOpen} title="Projects" description="Showcase your personal and professional projects" />
      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No projects added yet" description="Add your best work to stand out" action={<Button size="sm" onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Add Project</Button>} />
        ) : (
          items.map((item, i) => <ProjectCard key={item.id} item={item} index={i} total={items.length} onUpdate={(u) => updateItem(item.id, u)} onDelete={() => deleteItem(item.id)} onDuplicate={() => duplicateItem(item.id)} onMoveUp={() => moveItem(item.id, -1)} onMoveDown={() => moveItem(item.id, 1)} />)
        )}
      </div>
      {items.length > 0 && <Button variant="outline" className="w-full gap-2" onClick={addItem}><Plus className="h-4 w-4" /> Add Project</Button>}
    </div>
  );
});
