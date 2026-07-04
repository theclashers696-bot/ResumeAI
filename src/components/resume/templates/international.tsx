/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { renderSections } from "@/lib/templates/sections";

interface Props { data: ResumeData; }

export const InternationalTemplate = memo(function InternationalTemplate({ data }: Props) {
  const { personal, theme } = data;
  const accent = theme.themeColor;
  const font = FONT_MAP[theme.fontFamily] ?? FONT_MAP.inter;
  const m = theme.pageMargin;

  return (
    <div style={{ fontFamily: font, fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#1a1a1a", backgroundColor: "#fff", minHeight: "100%" }}>
      {/* Header: name left, contact right — European CV style */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", padding: `${m * 0.8}px ${m}px`, borderBottom: `3px solid ${accent}` }}>
        <div style={{ flex: 1 }}>
          {personal.photoUrl && (
            <img src={personal.photoUrl} alt={personal.fullName}
              style={{ width: 64, height: 64, borderRadius: theme.photoShape === "square" ? "4px" : "50%", objectFit: "cover", marginBottom: "8px", border: `2px solid ${accent}` }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <h1 style={{ fontSize: "1.9em", fontWeight: 700, color: "#111", margin: 0, letterSpacing: "-0.01em" }}>{personal.fullName || "Your Name"}</h1>
          {personal.headline && <p style={{ color: accent, margin: "4px 0 0", fontSize: "0.9em", fontWeight: 500 }}>{personal.headline}</p>}
        </div>
        <div style={{ textAlign: "right", fontSize: "0.8em", color: "#555", lineHeight: 1.9, minWidth: "160px" }}>
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && <div>{personal.location}</div>}
          {personal.website && <div>{personal.website}</div>}
          {personal.linkedin && <div>{personal.linkedin}</div>}
          {personal.github && <div>{personal.github}</div>}
        </div>
      </div>

      <div style={{ padding: `${m * 0.8}px ${m}px ${m}px` }}>
        {renderSections(data, { accent, muted: "#666", sectionStyle: "underline", skillStyle: "badges", bulletChar: "›" })}
      </div>

      {theme.watermark !== false && (
        <div style={{ textAlign: "center", padding: "4px", fontSize: "0.65em", color: "#ccc" }}>Created with ResumeAI</div>
      )}
    </div>
  );
});
