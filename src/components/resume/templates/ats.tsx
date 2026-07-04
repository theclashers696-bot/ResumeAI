import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { renderSections } from "@/lib/templates/sections";

interface Props { data: ResumeData; }

export const ATSTemplate = memo(function ATSTemplate({ data }: Props) {
  const { personal, theme } = data;
  const accent = "#000000";
  const font = FONT_MAP.opensans;
  const m = theme.pageMargin;

  return (
    <div style={{ fontFamily: font, fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#000", backgroundColor: "#fff", minHeight: "100%" }}>
      {/* Minimal ATS-friendly header */}
      <div style={{ padding: `${m * 0.7}px ${m}px`, borderBottom: "2px solid #000" }}>
        <h1 style={{ fontSize: "1.7em", fontWeight: 700, color: "#000", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {personal.fullName || "Your Name"}
        </h1>
        {personal.headline && (
          <div style={{ fontSize: "0.9em", color: "#333", fontWeight: 500 }}>{personal.headline}</div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "6px" }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.website].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: "0.8em", color: "#333" }}>{v}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: `${m * 0.6}px ${m}px ${m}px` }}>
        {renderSections(data, { accent, muted: "#444", sectionStyle: "underline", skillStyle: "plain", bulletChar: "•" })}
      </div>
    </div>
  );
});
