/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { renderSections } from "@/lib/templates/sections";

interface Props { data: ResumeData; }

export const StudentTemplate = memo(function StudentTemplate({ data }: Props) {
  const { personal, theme } = data;
  const accent = theme.themeColor;
  const font = FONT_MAP[theme.fontFamily] ?? FONT_MAP.inter;
  const m = theme.pageMargin;
  const lightBg = `${accent}0C`;

  return (
    <div style={{ fontFamily: font, fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#1a1a1a", backgroundColor: "#fff", minHeight: "100%" }}>
      {/* Header: light background, fresh feel */}
      <div style={{ backgroundColor: lightBg, borderTop: `4px solid ${accent}`, padding: `${m * 0.8}px ${m}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {personal.photoUrl && (
            <img src={personal.photoUrl} alt={personal.fullName}
              style={{ width: 70, height: 70, borderRadius: theme.photoShape === "square" ? "6px" : "50%", border: `2px solid ${accent}`, objectFit: "cover", flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.8em", fontWeight: 700, color: "#111", margin: 0 }}>{personal.fullName || "Your Name"}</h1>
            {personal.headline && <p style={{ color: accent, margin: "4px 0 0", fontSize: "0.9em", fontWeight: 500 }}>{personal.headline}</p>}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "12px" }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.website].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: "0.8em", color: "#555" }}>{v}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: `${m * 0.8}px ${m}px ${m}px` }}>
        {renderSections(data, { accent, muted: "#666", sectionStyle: "underline", skillStyle: "badges", bulletChar: "•" })}
      </div>

      {theme.watermark !== false && (
        <div style={{ textAlign: "center", padding: "4px", fontSize: "0.65em", color: "#ccc" }}>Created with ResumeAI</div>
      )}
    </div>
  );
});
