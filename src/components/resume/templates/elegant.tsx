/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { renderSections } from "@/lib/templates/sections";

interface Props { data: ResumeData; }

export const ElegantTemplate = memo(function ElegantTemplate({ data }: Props) {
  const { personal, theme } = data;
  const accent = theme.themeColor;
  const serifFont = "'Playfair Display', 'Georgia', serif";
  const baseFont = FONT_MAP[theme.fontFamily] ?? FONT_MAP.inter;
  const m = theme.pageMargin;

  return (
    <div style={{ fontFamily: baseFont, fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#222", backgroundColor: "#fafaf8", minHeight: "100%" }}>
      {/* Elegant centered header */}
      <div style={{ textAlign: "center", padding: `${m}px ${m}px ${m * 0.5}px`, borderBottom: `1px solid #ccc` }}>
        {personal.photoUrl && (
            <img src={personal.photoUrl} alt={personal.fullName}
            style={{ width: 72, height: 72, borderRadius: theme.photoShape === "square" ? "4px" : "50%", objectFit: "cover", marginBottom: "10px", border: "1px solid #ddd" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        )}
        <h1 style={{ fontSize: "2.2em", fontWeight: 700, color: "#111", margin: 0, fontFamily: serifFont, letterSpacing: "0.04em" }}>
          {personal.fullName || "Your Name"}
        </h1>
        {personal.headline && (
          <p style={{ color: "#888", margin: "6px 0 0", fontSize: "0.85em", fontStyle: "italic", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {personal.headline}
          </p>
        )}
        <div style={{ width: 40, height: "1px", backgroundColor: accent, margin: "12px auto" }} />
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "14px" }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: "0.75em", color: "#777", letterSpacing: "0.03em" }}>{v}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: `${m * 0.8}px ${m * 1.2}px ${m}px` }}>
        {renderSections(data, { accent, muted: "#888", sectionStyle: "caps", skillStyle: "plain", bulletChar: "—" })}
      </div>

      {theme.watermark !== false && (
        <div style={{ textAlign: "center", padding: "4px", fontSize: "0.65em", color: "#ccc" }}>Created with ResumeAI</div>
      )}
    </div>
  );
});
