/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { renderSections } from "@/lib/templates/sections";

interface Props { data: ResumeData; }

export const BoldTemplate = memo(function BoldTemplate({ data }: Props) {
  const { personal, theme } = data;
  const accent = theme.themeColor;
  const font = FONT_MAP[theme.fontFamily] ?? FONT_MAP.inter;
  const m = theme.pageMargin;

  const nameParts = (personal.fullName || "Your Name").split(" ");
  const firstName = nameParts.slice(0, -1).join(" ");
  const lastName = nameParts[nameParts.length - 1];

  return (
    <div style={{ fontFamily: font, fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#111", backgroundColor: "#fff", minHeight: "100%" }}>
      {/* Bold dramatic header */}
      <div style={{ padding: `${m}px ${m}px ${m * 0.5}px` }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "3.2em", fontWeight: 900, color: "#111", margin: 0, lineHeight: 0.9, letterSpacing: "-0.04em" }}>
              {firstName && <span style={{ display: "block" }}>{firstName}</span>}
              <span style={{ display: "block", color: accent }}>{lastName}</span>
            </h1>
            {personal.headline && <p style={{ color: "#555", margin: "10px 0 0", fontSize: "0.9em", fontWeight: 400, letterSpacing: "0.02em" }}>{personal.headline}</p>}
          </div>
          {personal.photoUrl && (
            <img src={personal.photoUrl} alt={personal.fullName}
              style={{ width: 80, height: 80, borderRadius: theme.photoShape === "square" ? "8px" : "50%", border: `3px solid ${accent}`, objectFit: "cover", flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
        </div>

        {/* Contact strip */}
        <div style={{ backgroundColor: accent, padding: "8px 12px", marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "16px", borderRadius: "4px" }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.website].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: "0.75em", color: "#fff", fontWeight: 500 }}>{v}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: `${m * 0.6}px ${m}px ${m}px` }}>
        {renderSections(data, { accent, muted: "#666", sectionStyle: "none", skillStyle: "badges", bulletChar: "→" })}
      </div>

      {theme.watermark !== false && (
        <div style={{ textAlign: "center", padding: "4px", fontSize: "0.65em", color: "#ccc" }}>Created with ResumeAI</div>
      )}
    </div>
  );
});
