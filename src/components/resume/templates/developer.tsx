/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { renderSections, SectionTitle, SkillBadge } from "@/lib/templates/sections";
import { formatDate } from "@/lib/utils";

interface Props { data: ResumeData; }

const SIDEBAR_KEYS = new Set(["skills", "education", "certifications", "languages", "interests"]);

export const DeveloperTemplate = memo(function DeveloperTemplate({ data }: Props) {
  const { personal, theme, skills, educations, certifications, languages, interests } = data;
  const accent = theme.themeColor;
  const dark = "#0D1117";
  const darkMid = "#161B22";
  const green = accent;
  const font = FONT_MAP.inter;
  const m = theme.pageMargin;

  const mainSections = data.sectionOrder.filter((s) => !SIDEBAR_KEYS.has(s) && s !== "summary");

  return (
    <div style={{ fontFamily: font, fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#1a1a1a", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ backgroundColor: dark, padding: `${m * 0.7}px ${m}px`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {personal.photoUrl && (
            <img src={personal.photoUrl} alt={personal.fullName}
              style={{ width: 56, height: 56, borderRadius: theme.photoShape === "circle" ? "50%" : "6px", border: `2px solid ${green}`, objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div>
            <h1 style={{ fontSize: "1.5em", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Courier New', monospace" }}>{personal.fullName || "Your Name"}</h1>
            {personal.headline && <p style={{ color: green, margin: "2px 0 0", fontSize: "0.85em", fontFamily: "'Courier New', monospace" }}>{personal.headline}</p>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
          {[personal.email, personal.github, personal.linkedin, personal.website].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: "0.72em", color: "rgba(255,255,255,0.55)", fontFamily: "'Courier New', monospace" }}>{v}</span>
          ))}
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Dark sidebar */}
        <div style={{ width: "32%", backgroundColor: darkMid, padding: `${m * 0.6}px ${m * 0.5}px`, borderRight: `1px solid ${green}30` }}>
          {personal.summary && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "0.7em", fontFamily: "'Courier New', monospace", color: green, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{"// about"}</div>
              <p style={{ fontSize: "0.78em", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0 }}>{personal.summary}</p>
            </div>
          )}

          {skills.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "0.7em", fontFamily: "'Courier New', monospace", color: green, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{"// skills"}</div>
              {[...new Set(skills.map((s) => s.category).filter(Boolean))].map((cat) => (
                <div key={cat} style={{ marginBottom: "6px" }}>
                  {cat && <div style={{ fontSize: "0.68em", color: "rgba(255,255,255,0.4)", marginBottom: "3px", textTransform: "uppercase" }}>{cat}</div>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                    {skills.filter((s) => s.category === cat).map((s) => (
                      <span key={s.id} style={{ fontSize: "0.72em", backgroundColor: `${green}20`, color: green, padding: "2px 6px", borderRadius: "3px", border: `1px solid ${green}40`, fontFamily: "'Courier New', monospace" }}>{s.name}</span>
                    ))}
                  </div>
                </div>
              ))}
              {skills.filter((s) => !s.category).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                  {skills.filter((s) => !s.category).map((s) => (
                    <span key={s.id} style={{ fontSize: "0.72em", backgroundColor: `${green}20`, color: green, padding: "2px 6px", borderRadius: "3px", border: `1px solid ${green}40`, fontFamily: "'Courier New', monospace" }}>{s.name}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {educations.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "0.7em", fontFamily: "'Courier New', monospace", color: green, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{"// education"}</div>
              {educations.map((e) => (
                <div key={e.id} style={{ marginBottom: "8px" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.78em", color: "#fff" }}>{e.degree}</div>
                  <div style={{ color: green, fontSize: "0.72em" }}>{e.institution}</div>
                  <div style={{ fontSize: "0.7em", color: "rgba(255,255,255,0.4)" }}>{formatDate(e.startDate)} — {e.current ? "Now" : formatDate(e.endDate ?? "")}</div>
                </div>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "0.7em", fontFamily: "'Courier New', monospace", color: green, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{"// certs"}</div>
              {certifications.map((c) => (
                <div key={c.id} style={{ fontSize: "0.75em", color: "rgba(255,255,255,0.65)", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <div style={{ fontSize: "0.85em", color: "rgba(255,255,255,0.4)" }}>{c.issuer}</div>
                </div>
              ))}
            </div>
          )}

          {languages.length > 0 && (
            <div>
              <div style={{ fontSize: "0.7em", fontFamily: "'Courier New', monospace", color: green, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{"// languages"}</div>
              {languages.map((l) => (
                <div key={l.id} style={{ fontSize: "0.75em", color: "rgba(255,255,255,0.65)", marginBottom: "3px" }}>
                  <span style={{ fontWeight: 600 }}>{l.name}</span> <span style={{ color: "rgba(255,255,255,0.4)" }}>— {l.proficiency}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* White main content */}
        <div style={{ flex: 1, padding: `${m * 0.75}px ${m * 0.75}px ${m}px`, backgroundColor: "#fff" }}>
          {renderSections(
            { ...data, sectionOrder: mainSections },
            { accent: green, muted: "#666", sectionStyle: "caps", skillStyle: "badges", bulletChar: "→" }
          )}
        </div>
      </div>

      {theme.watermark !== false && (
        <div style={{ textAlign: "center", padding: "4px", fontSize: "0.65em", color: "#ccc", backgroundColor: dark }}>Created with ResumeAI</div>
      )}
    </div>
  );
});
