/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { renderSections } from "@/lib/templates/sections";

interface Props { data: ResumeData; }

export const ExecutiveTemplate = memo(function ExecutiveTemplate({ data }: Props) {
  const { personal, theme } = data;
  const accent = "#C9A84C"; // gold
  const navy = "#0F172A";
  const font = FONT_MAP[theme.fontFamily] ?? FONT_MAP.inter;
  const m = theme.pageMargin;

  return (
    <div style={{ fontFamily: font, fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#1a1a1a", backgroundColor: "#fff", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ backgroundColor: navy, padding: `${m}px ${m}px ${m * 0.6}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {personal.photoUrl && (
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              style={{ width: 80, height: 80, borderRadius: theme.photoShape === "square" ? "4px" : "50%", border: `3px solid ${accent}`, objectFit: "cover", flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "2em", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
              {personal.fullName || "Your Name"}
            </h1>
            {personal.headline && (
              <p style={{ color: accent, margin: "4px 0 0", fontSize: "1em", fontWeight: 500 }}>{personal.headline}</p>
            )}
          </div>
        </div>
        {/* Gold divider */}
        <div style={{ height: "1px", backgroundColor: accent, opacity: 0.4, margin: "16px 0" }} />
        {/* Contact bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {[
            personal.email, personal.phone, personal.location,
            personal.linkedin, personal.github, personal.website,
          ].filter(Boolean).map((val, i) => (
            <span key={i} style={{ fontSize: "0.8em", color: "rgba(255,255,255,0.75)" }}>{val}</span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: `${m * 0.75}px ${m}px ${m}px` }}>
        {renderSections(data, { accent, muted: "#666", sectionStyle: "underline", skillStyle: "badges", bulletChar: "▸" })}
      </div>

      {theme.watermark !== false && (
        <div style={{ textAlign: "center", padding: "4px 0 8px", fontSize: "0.65em", color: "#ccc", letterSpacing: "0.05em" }}>
          Created with ResumeAI
        </div>
      )}
    </div>
  );
});
