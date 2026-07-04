import { memo } from "react";
import { formatDate } from "@/lib/utils";

export const ResumeSection = memo(function ResumeSection({
  title, accent,
}: { title: string; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", marginTop: "4px" }}>
      <h2 style={{ fontSize: "0.9em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: accent, margin: 0, whiteSpace: "nowrap" }}>{title}</h2>
      <div style={{ flex: 1, height: "1px", backgroundColor: accent, opacity: 0.3 }} />
    </div>
  );
});

export const SectionDivider = memo(function SectionDivider() {
  return <div style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "12px 0 8px" }} />;
});

export const ContactRow = memo(function ContactRow({
  label, value, light, href,
}: { label: string; value: string; light?: boolean; href?: boolean }) {
  const color = light ? "rgba(255,255,255,0.8)" : "#555";
  const content = href ? (
    <a href={value.startsWith("http") ? value : `https://${value}`} style={{ color: light ? "rgba(255,255,255,0.9)" : "inherit" }}>{value}</a>
  ) : value;
  return (
    <span style={{ fontSize: "0.8em", color }}>
      {content}
    </span>
  );
});

export const BulletList = memo(function BulletList({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ul style={{ margin: "4px 0", paddingLeft: "0", listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "2px", fontSize: "0.875em" }}>
          <span style={{ color: accent, fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>›</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
});

export const SkillBadge = memo(function SkillBadge({ label, accent }: { label: string; accent: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "4px",
      backgroundColor: `${accent}15`,
      color: accent,
      fontSize: "0.75em",
      fontWeight: 500,
      border: `1px solid ${accent}30`,
    }}>
      {label}
    </span>
  );
});

export const DateRange = memo(function DateRange({
  startDate, endDate, current,
}: { startDate: string; endDate: string; current: boolean }) {
  const start = formatDate(startDate);
  const end = current ? "Present" : formatDate(endDate);
  if (!start && !end) return null;
  return <span>{[start, end].filter(Boolean).join(" — ")}</span>;
});
