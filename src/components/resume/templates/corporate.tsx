/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { renderSections, SectionTitle, SkillBadge } from "@/lib/templates/sections";
import { formatDate } from "@/lib/utils";

interface Props { data: ResumeData; }

const SIDEBAR_KEYS = new Set(["skills", "education", "certifications", "languages", "interests", "references"]);

export const CorporateTemplate = memo(function CorporateTemplate({ data }: Props) {
  const { personal, theme, workExperiences, educations, skills, certifications, languages, interests, references } = data;
  const accent = theme.themeColor;
  const sidebar = "#EFF4F9";
  const sidebarAccent = "#1E40AF";
  const font = FONT_MAP[theme.fontFamily] ?? FONT_MAP.inter;
  const m = theme.pageMargin;

  const mainSections = data.sectionOrder.filter((s) => !SIDEBAR_KEYS.has(s));

  return (
    <div style={{ fontFamily: font, fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#1a1a1a", backgroundColor: "#fff", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* Top header bar */}
      <div style={{ backgroundColor: accent, padding: `${m * 0.7}px ${m}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {personal.photoUrl && (
            <img src={personal.photoUrl} alt={personal.fullName}
              style={{ width: 64, height: 64, borderRadius: theme.photoShape === "square" ? "4px" : "50%", border: "2px solid rgba(255,255,255,0.7)", objectFit: "cover", flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div>
            <h1 style={{ fontSize: "1.7em", fontWeight: 800, color: "#fff", margin: 0 }}>{personal.fullName || "Your Name"}</h1>
            {personal.headline && <p style={{ color: "rgba(255,255,255,0.85)", margin: "3px 0 0", fontSize: "0.9em" }}>{personal.headline}</p>}
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: "33%", backgroundColor: sidebar, padding: `${m * 0.75}px ${m * 0.6}px`, borderRight: "1px solid #dde6f0" }}>
          {/* Contact */}
          <div style={{ marginBottom: "16px" }}>
            <SectionTitle title="Contact" accent={sidebarAccent} style="box" />
            <div style={{ fontSize: "0.78em", color: "#333", lineHeight: 1.8 }}>
              {personal.email && <div>{personal.email}</div>}
              {personal.phone && <div>{personal.phone}</div>}
              {personal.location && <div>{personal.location}</div>}
              {personal.linkedin && <div>{personal.linkedin}</div>}
              {personal.github && <div>{personal.github}</div>}
              {personal.website && <div>{personal.website}</div>}
            </div>
          </div>

          {skills.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <SectionTitle title="Skills" accent={sidebarAccent} style="box" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {skills.map((s) => <SkillBadge key={s.id} label={s.name} accent={sidebarAccent} style="badges" />)}
              </div>
            </div>
          )}

          {educations.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <SectionTitle title="Education" accent={sidebarAccent} style="box" />
              {educations.map((e) => (
                <div key={e.id} style={{ marginBottom: "8px" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.8em" }}>{e.degree}</div>
                  {e.fieldOfStudy && <div style={{ fontSize: "0.75em", color: "#444" }}>{e.fieldOfStudy}</div>}
                  <div style={{ color: sidebarAccent, fontSize: "0.78em" }}>{e.institution}</div>
                  <div style={{ fontSize: "0.75em", color: "#666" }}>{formatDate(e.startDate)} — {e.current ? "Present" : formatDate(e.endDate ?? "")}</div>
                </div>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <SectionTitle title="Certifications" accent={sidebarAccent} style="box" />
              {certifications.map((c) => (
                <div key={c.id} style={{ marginBottom: "6px" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.78em" }}>{c.name}</div>
                  <div style={{ fontSize: "0.75em", color: "#555" }}>{c.issuer}</div>
                </div>
              ))}
            </div>
          )}

          {languages.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <SectionTitle title="Languages" accent={sidebarAccent} style="box" />
              {languages.map((l) => (
                <div key={l.id} style={{ fontSize: "0.8em", marginBottom: "3px" }}>
                  <span style={{ fontWeight: 600 }}>{l.name}</span> <span style={{ color: "#666" }}>— {l.proficiency}</span>
                </div>
              ))}
            </div>
          )}

          {interests.length > 0 && (
            <div>
              <SectionTitle title="Interests" accent={sidebarAccent} style="box" />
              <div style={{ fontSize: "0.78em", color: "#444", lineHeight: 1.8 }}>
                {interests.map((i) => i.name).join(" · ")}
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: `${m * 0.75}px ${m * 0.75}px ${m}px` }}>
          {personal.summary && (
            <div style={{ marginBottom: "16px" }}>
              <SectionTitle title="Executive Summary" accent={accent} style="underline" />
              <p style={{ fontSize: "0.875em", lineHeight: 1.6, color: "#333", margin: 0 }}>{personal.summary}</p>
            </div>
          )}
          {renderSections(
            { ...data, sectionOrder: mainSections.filter((s) => s !== "summary") },
            { accent, muted: "#666", sectionStyle: "underline", skillStyle: "badges", bulletChar: "›" }
          )}
        </div>
      </div>

      {theme.watermark !== false && (
        <div style={{ textAlign: "center", padding: "4px", fontSize: "0.65em", color: "#ccc" }}>Created with ResumeAI</div>
      )}
    </div>
  );
});
