"use client";

import { memo, useState, useCallback } from "react";
import { Lightbulb, X, Plus } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { SectionHeader, EmptyState } from "@/components/editor/section-ui";
import { Button } from "@/components/ui/button";
import type { InterestItem } from "@/types/resume";

const SUGGESTIONS = ["Reading", "Photography", "Hiking", "Cooking", "Gaming", "Traveling", "Music", "Yoga", "Cycling", "Gardening", "Chess", "Open Source"];

const defaultItem = (name = ""): InterestItem => ({ id: nanoid(), name, order: 0 });

interface Props { items: InterestItem[]; onUpdate: (items: InterestItem[]) => void; }

export const InterestsSection = memo(function InterestsSection({ items, onUpdate }: Props) {
  const [input, setInput] = useState("");

  const addItem = useCallback((name?: string) => {
    const n = name ?? input.trim();
    if (!n || items.find((i) => i.name === n)) return;
    onUpdate([...items, defaultItem(n)]);
    if (!name) setInput("");
  }, [items, input, onUpdate]);

  const deleteItem = useCallback((id: string) => onUpdate(items.filter((i) => i.id !== id)), [items, onUpdate]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Lightbulb} title="Interests" description="Hobbies and personal interests" />
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add an interest..."
            className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={() => addItem()} className="gap-1.5"><Plus className="h-4 w-4" /> Add</Button>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span key={item.id} className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {item.name}
                <button onClick={() => deleteItem(item.id)} className="text-primary/60 hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}

        <div>
          <p className="mb-2 text-xs text-muted-foreground">Suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.filter((s) => !items.find((i) => i.name === s)).map((s) => (
              <button key={s} onClick={() => addItem(s)} className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs hover:border-primary hover:text-primary transition-colors">+ {s}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
