/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { renderSections } from "@/lib/templates/sections";

interface Props { data: ResumeData; }

export const StartupTemplate = memo(function StartupTemplate({ data }: Props) {
  const { personal, theme } = data;
  const accent = theme.themeColor;
  const secondary = theme.secondaryColor ?? "#7C3AED";
  const font = FONT_MAP[theme.fontFamily] ?? FONT_MAP.inter;
  const m = theme.pageMargin;

  return (
    <div style={{ fontFamily: font, fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#1a1a1a", backgroundColor: "#fff", minHeight: "100%" }}>
      {/* Gradient header */}
      <div style={{ background: `linear-gradient(135deg, ${accent} 0%, ${secondary} 100%)`, padding: `${m}px ${m}px ${m * 0.8}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {personal.photoUrl && (
            <img src={personal.photoUrl} alt={personal.fullName}
              style={{ width: 72, height: 72, borderRadius: theme.photoShape === "square" ? "8px" : "50%", border: "3px solid rgba(255,255,255,0.5)", objectFit: "cover", flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div>
            <h1 style={{ fontSize: "2em", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.03em" }}>{personal.fullName || "Your Name"}</h1>
            {personal.headline && <p style={{ color: "rgba(255,255,255,0.85)", margin: "4px 0 0", fontSize: "0.9em", fontWeight: 400 }}>{personal.headline}</p>}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "12px" }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.website].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: "0.78em", color: "rgba(255,255,255,0.8)", backgroundColor: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "20px" }}>{v}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: `${m * 0.8}px ${m}px ${m}px` }}>
        {renderSections(data, { accent, muted: "#666", sectionStyle: "line", skillStyle: "badges", bulletChar: "›" })}
      </div>

      {theme.watermark !== false && (
        <div style={{ textAlign: "center", padding: "4px", fontSize: "0.65em", color: "#ccc" }}>Created with ResumeAI</div>
      )}
    </div>
  );
});
