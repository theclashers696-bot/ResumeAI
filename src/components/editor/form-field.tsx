"use client";

import { memo, type InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  icon?: LucideIcon;
  error?: string;
}

export const FormField = memo(function FormField({
  value,
  onChange,
  icon: Icon,
  error,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 w-full rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
          Icon ? "pl-8 pr-3" : "px-3",
          error && "border-destructive focus:ring-destructive",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
});

interface TextAreaFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
  label?: string;
}

export const TextAreaField = memo(function TextAreaField({
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
  className,
}: TextAreaFieldProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className={cn(
        "w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
    />
  );
});

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function TagsInput({ tags, onChange, placeholder = "Type and press Enter", suggestions }: TagsInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
        e.currentTarget.value = "";
      }
    }
    if (e.key === "Backspace" && !e.currentTarget.value && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="rounded-md border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            <button
              onClick={() => onChange(tags.filter((_, idx) => idx !== i))}
              className="ml-0.5 rounded hover:text-destructive"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label={placeholder}
        />
      </div>
    </div>
  );
}

interface DateRangeProps {
  startDate: string;
  endDate: string;
  current: boolean;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onCurrentChange: (v: boolean) => void;
  currentLabel?: string;
}

export function DateRange({
  startDate,
  endDate,
  current,
  onStartChange,
  onEndChange,
  onCurrentChange,
  currentLabel = "I currently work here",
}: DateRangeProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Start Date</label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Start date"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">End Date</label>
          <input
            type="month"
            value={current ? "" : endDate}
            onChange={(e) => onEndChange(e.target.value)}
            disabled={current}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            aria-label="End date"
          />
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={current}
          onChange={(e) => onCurrentChange(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-input text-primary accent-primary"
        />
        <span className="text-xs text-muted-foreground">{currentLabel}</span>
      </label>
    </div>
  );
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}

export function SelectField({ value, onChange, options, placeholder, className }: SelectFieldProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
        !value && "text-muted-foreground",
        className
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
