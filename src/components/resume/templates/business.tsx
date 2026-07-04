/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { renderSections } from "@/lib/templates/sections";

interface Props { data: ResumeData; }

export const BusinessTemplate = memo(function BusinessTemplate({ data }: Props) {
  const { personal, theme } = data;
  const accent = theme.themeColor;
  const navy = "#1e3a5f";
  const serifFont = "'Georgia', 'Times New Roman', serif";
  const baseFont = FONT_MAP[theme.fontFamily] ?? FONT_MAP.inter;
  const m = theme.pageMargin;

  return (
    <div style={{ fontFamily: baseFont, fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#1a1a1a", backgroundColor: "#fff", minHeight: "100%" }}>
      {/* Classic centered header */}
      <div style={{ textAlign: "center", borderBottom: `3px double ${navy}`, padding: `${m * 0.8}px ${m}px` }}>
        {personal.photoUrl && (
            <img src={personal.photoUrl} alt={personal.fullName}
            style={{ width: 72, height: 72, borderRadius: theme.photoShape === "square" ? "4px" : "50%", border: `2px solid ${navy}`, objectFit: "cover", marginBottom: "8px" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        )}
        <h1 style={{ fontSize: "2em", fontWeight: 700, color: navy, margin: 0, fontFamily: serifFont, letterSpacing: "0.02em" }}>
          {personal.fullName || "Your Name"}
        </h1>
        {personal.headline && (
          <p style={{ color: "#555", margin: "6px 0 0", fontSize: "0.9em", fontStyle: "italic", fontFamily: serifFont }}>{personal.headline}</p>
        )}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "16px", marginTop: "10px" }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: "0.8em", color: "#555" }}>{v}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: `${m * 0.8}px ${m}px ${m}px` }}>
        {renderSections(data, { accent: navy, muted: "#666", sectionStyle: "underline", skillStyle: "plain", bulletChar: "•" })}
      </div>

      {theme.watermark !== false && (
        <div style={{ textAlign: "center", padding: "4px", fontSize: "0.65em", color: "#ccc" }}>Created with ResumeAI</div>
      )}
    </div>
  );
});
