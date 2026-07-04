/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { renderSections, SectionTitle, SkillBadge } from "@/lib/templates/sections";
import { formatDate } from "@/lib/utils";

interface Props { data: ResumeData; }

const SIDEBAR_KEYS = new Set(["skills", "languages", "interests", "certifications"]);

export const DesignerTemplate = memo(function DesignerTemplate({ data }: Props) {
  const { personal, theme, skills, languages, certifications, interests } = data;
  const accent = theme.themeColor;
  const lightAccent = `${accent}18`;
  const font = FONT_MAP[theme.fontFamily] ?? FONT_MAP.inter;
  const m = theme.pageMargin;

  const mainSections = data.sectionOrder.filter((s) => !SIDEBAR_KEYS.has(s));

  return (
    <div style={{ fontFamily: font, fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#1a1a1a", minHeight: "100%", display: "flex" }}>
      {/* Color sidebar */}
      <div style={{ width: "38%", backgroundColor: accent, padding: `${m}px ${m * 0.7}px`, display: "flex", flexDirection: "column", gap: "16px" }}>
        {personal.photoUrl && (
          <div style={{ textAlign: "center" }}>
            <img src={personal.photoUrl} alt={personal.fullName}
              style={{ width: 90, height: 90, borderRadius: theme.photoShape === "square" ? "8px" : "50%", border: "4px solid rgba(255,255,255,0.4)", objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}

        <div>
          <h1 style={{ fontSize: "1.6em", fontWeight: 800, color: "#fff", margin: "0 0 4px", lineHeight: 1.1 }}>{personal.fullName || "Your Name"}</h1>
          {personal.headline && <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "0.9em", fontWeight: 300, fontStyle: "italic" }}>{personal.headline}</p>}
        </div>

        {/* Contact */}
        <div>
          <div style={{ fontSize: "0.65em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Contact</div>
          <div style={{ fontSize: "0.78em", color: "rgba(255,255,255,0.85)", lineHeight: 1.9 }}>
            {personal.email && <div>{personal.email}</div>}
            {personal.phone && <div>{personal.phone}</div>}
            {personal.location && <div>{personal.location}</div>}
            {personal.website && <div>{personal.website}</div>}
            {personal.linkedin && <div>{personal.linkedin}</div>}
            {personal.portfolio && <div>{personal.portfolio}</div>}
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <div style={{ fontSize: "0.65em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Skills</div>
            {[...new Set(skills.map((s) => s.category).filter(Boolean))].map((cat) => (
              <div key={cat} style={{ marginBottom: "6px" }}>
                {cat && <div style={{ fontSize: "0.65em", color: "rgba(255,255,255,0.5)", marginBottom: "3px", textTransform: "uppercase" }}>{cat}</div>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                  {skills.filter((s) => s.category === cat).map((s) => (
                    <span key={s.id} style={{ fontSize: "0.73em", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", padding: "2px 7px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.25)" }}>{s.name}</span>
                  ))}
                </div>
              </div>
            ))}
            {skills.filter((s) => !s.category).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                {skills.filter((s) => !s.category).map((s) => (
                  <span key={s.id} style={{ fontSize: "0.73em", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", padding: "2px 7px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.25)" }}>{s.name}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <div style={{ fontSize: "0.65em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Languages</div>
            {languages.map((l) => (
              <div key={l.id} style={{ fontSize: "0.78em", color: "rgba(255,255,255,0.8)", marginBottom: "3px" }}>
                <span style={{ fontWeight: 600 }}>{l.name}</span> <span style={{ opacity: 0.7 }}>— {l.proficiency}</span>
              </div>
            ))}
          </div>
        )}

        {interests.length > 0 && (
          <div>
            <div style={{ fontSize: "0.65em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>Interests</div>
            <div style={{ fontSize: "0.78em", color: "rgba(255,255,255,0.75)" }}>{interests.map((i) => i.name).join(" · ")}</div>
          </div>
        )}
      </div>

      {/* White main */}
      <div style={{ flex: 1, padding: `${m}px ${m * 0.8}px`, backgroundColor: "#fff" }}>
        {renderSections(
          { ...data, sectionOrder: mainSections },
          { accent, muted: "#888", sectionStyle: "line", skillStyle: "badges", bulletChar: "•" }
        )}
      </div>
    </div>
  );
});
