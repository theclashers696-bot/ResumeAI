"use client";

import { memo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResumeTheme } from "@/types/resume";
import {
  ACCENT_COLORS, FONT_OPTIONS, TEMPLATES,
} from "@/types/resume";

interface ThemePanelProps {
  theme: ResumeTheme;
  template: string;
  onThemeChange: (updates: Partial<ResumeTheme>) => void;
  onTemplateChange: (template: string) => void;
  onClose: () => void;
}

export const ThemePanel = memo(function ThemePanel({
  theme,
  template,
  onThemeChange,
  onTemplateChange,
  onClose,
}: ThemePanelProps) {
  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-l border-border bg-background">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-semibold">Theme & Style</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Templates */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Template
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => onTemplateChange(t.id)}
                className={cn(
                  "group flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all",
                  template === t.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="h-12 w-full rounded bg-gradient-to-br from-muted to-muted/50 p-1">
                  <TemplateThumb id={t.id} color={theme.themeColor} />
                </div>
                <span className={cn("text-xs font-medium", template === t.id ? "text-primary" : "text-foreground")}>
                  {t.label}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">{t.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Accent Color */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Accent Color
          </h3>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => onThemeChange({ themeColor: c.value })}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition-all",
                  theme.themeColor === c.value ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: c.value }}
                title={c.label}
                aria-label={`Set accent color to ${c.label}`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={theme.themeColor}
              onChange={(e) => onThemeChange({ themeColor: e.target.value })}
              className="h-8 w-12 cursor-pointer rounded border border-input"
              aria-label="Custom accent color"
            />
            <span className="text-xs text-muted-foreground">Custom color</span>
          </div>
        </section>

        {/* Font */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Font Family
          </h3>
          <div className="space-y-1">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => onThemeChange({ fontFamily: f.value })}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-all",
                  theme.fontFamily === f.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent text-foreground"
                )}
              >
                {f.label}
                {theme.fontFamily === f.value && (
                  <span className="text-xs text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Font Size */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Font Size — {theme.fontSize}px
          </h3>
          <input
            type="range"
            min={10}
            max={18}
            step={1}
            value={theme.fontSize}
            onChange={(e) => onThemeChange({ fontSize: Number(e.target.value) })}
            className="w-full accent-primary"
            aria-label="Font size"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Small</span><span>Large</span>
          </div>
        </section>

        {/* Line Height */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Line Height — {theme.lineHeight}
          </h3>
          <input
            type="range"
            min={1.2}
            max={2.0}
            step={0.1}
            value={theme.lineHeight}
            onChange={(e) => onThemeChange({ lineHeight: Number(e.target.value) })}
            className="w-full accent-primary"
            aria-label="Line height"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Compact</span><span>Spacious</span>
          </div>
        </section>

        {/* Page Margin */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Page Margin — {theme.pageMargin}px
          </h3>
          <input
            type="range"
            min={20}
            max={80}
            step={4}
            value={theme.pageMargin}
            onChange={(e) => onThemeChange({ pageMargin: Number(e.target.value) })}
            className="w-full accent-primary"
            aria-label="Page margin"
          />
        </section>

        {/* Header Style */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Header Style
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {(["classic", "centered", "compact"] as const).map((style) => (
              <button
                key={style}
                onClick={() => onThemeChange({ headerStyle: style })}
                className={cn(
                  "rounded-md border py-2 text-xs capitalize transition-all",
                  theme.headerStyle === style
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:border-primary/40 text-muted-foreground"
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </section>

        {/* Show Icons */}
        <section>
          <label className="flex cursor-pointer items-center justify-between">
            <span className="text-sm font-medium">Show Icons</span>
            <div
              onClick={() => onThemeChange({ showIcons: !theme.showIcons })}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors cursor-pointer",
                theme.showIcons ? "bg-primary" : "bg-muted"
              )}
              role="switch"
              aria-checked={theme.showIcons}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onThemeChange({ showIcons: !theme.showIcons })}
            >
              <div
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                  theme.showIcons ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </div>
          </label>
          <p className="mt-1 text-xs text-muted-foreground">Show icons next to contact details</p>
        </section>
      </div>
    </div>
  );
});

function TemplateThumb({ id, color }: { id: string; color: string }) {
  if (id === "modern") {
    return (
      <div className="h-full w-full rounded overflow-hidden">
        <div className="h-3 w-full rounded-t" style={{ backgroundColor: color }} />
        <div className="p-0.5 space-y-0.5">
          <div className="h-0.5 w-3/4 rounded bg-gray-200" />
          <div className="h-0.5 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
    );
  }
  if (id === "classic") {
    return (
      <div className="h-full w-full rounded overflow-hidden flex">
        <div className="w-2/5 rounded-l" style={{ backgroundColor: color + "20" }} />
        <div className="flex-1 p-0.5 space-y-0.5">
          <div className="h-0.5 w-full rounded bg-gray-200" />
          <div className="h-0.5 w-3/4 rounded bg-gray-200" />
        </div>
      </div>
    );
  }
  if (id === "minimal") {
    return (
      <div className="h-full w-full rounded overflow-hidden p-0.5 space-y-0.5">
        <div className="h-0.5 w-full rounded" style={{ backgroundColor: color }} />
        <div className="h-0.5 w-3/4 rounded bg-gray-200" />
        <div className="h-0.5 w-1/2 rounded bg-gray-200" />
      </div>
    );
  }
  return (
    <div className="h-full w-full rounded overflow-hidden flex">
      <div className="w-1/3 rounded-l" style={{ backgroundColor: color }} />
      <div className="flex-1 p-0.5 space-y-0.5">
        <div className="h-0.5 w-full rounded bg-gray-200" />
        <div className="h-0.5 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}
