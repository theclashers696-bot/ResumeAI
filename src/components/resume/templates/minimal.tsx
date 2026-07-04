import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { formatDate } from "@/lib/utils";
import { BulletList, SkillBadge, DateRange } from "./shared";

interface Props { data: ResumeData; }

export const MinimalTemplate = memo(function MinimalTemplate({ data }: Props) {
  const { personal, theme, workExperiences, educations, skills, projects, certifications, languages, interests, sectionOrder } = data;
  const accent = theme.themeColor;
  const margin = theme.pageMargin;

  return (
    <div style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#1a1a1a", padding: `${margin}px` }}>
      {/* Header */}
      <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: "16px", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "2em", fontWeight: 300, letterSpacing: "-0.02em", margin: "0 0 4px", color: "#0f172a" }}>{personal.fullName || "Your Name"}</h1>
        {personal.headline && <p style={{ color: "#475569", margin: "0 0 12px", fontSize: "1em" }}>{personal.headline}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.website].filter(Boolean).map((v, i) => (
            <span key={i} style={{ fontSize: "0.8em", color: "#64748b" }}>{v}</span>
          ))}
        </div>
      </div>

      {personal.summary && (
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "0.9em", color: "#334155", lineHeight: 1.7 }}>{personal.summary}</p>
        </div>
      )}

      {sectionOrder.map((section) => {
        switch (section) {
          case "experience":
            if (!workExperiences.length) return null;
            return (
              <div key="experience" style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: "12px", fontWeight: 600 }}>Experience</h2>
                {workExperiences.map((w, i) => (
                  <div key={w.id} style={{ marginBottom: i < workExperiences.length - 1 ? "20px" : "0", paddingLeft: "0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: "0.95em" }}>{w.position}</span>
                        <span style={{ color: "#64748b", fontSize: "0.85em" }}> · {w.company}</span>
                      </div>
                      <span style={{ fontSize: "0.8em", color: "#94a3b8", flexShrink: 0, marginLeft: "16px" }}><DateRange startDate={w.startDate} endDate={w.endDate} current={w.current} /></span>
                    </div>
                    {w.description && <p style={{ fontSize: "0.875em", color: "#334155", margin: "0 0 4px" }}>{w.description}</p>}
                    {w.achievements.length > 0 && <BulletList items={w.achievements} accent={accent} />}
                    {w.technologies.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>{w.technologies.map((t) => <SkillBadge key={t} label={t} accent={accent} />)}</div>}
                  </div>
                ))}
              </div>
            );

          case "education":
            if (!educations.length) return null;
            return (
              <div key="education" style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: "12px", fontWeight: 600 }}>Education</h2>
                {educations.map((e) => (
                  <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9em" }}>{e.degree}{e.fieldOfStudy ? `, ${e.fieldOfStudy}` : ""}</div>
                      <div style={{ color: "#64748b", fontSize: "0.8em" }}>{e.institution}{e.gpa ? ` · GPA: ${e.gpa}` : ""}</div>
                    </div>
                    <span style={{ fontSize: "0.8em", color: "#94a3b8" }}><DateRange startDate={e.startDate} endDate={e.endDate} current={e.current} /></span>
                  </div>
                ))}
              </div>
            );

          case "skills":
            if (!skills.length) return null;
            return (
              <div key="skills" style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: "12px", fontWeight: 600 }}>Skills</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {skills.map((s) => <SkillBadge key={s.id} label={s.name} accent={accent} />)}
                </div>
              </div>
            );

          case "projects":
            if (!projects.length) return null;
            return (
              <div key="projects" style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: "12px", fontWeight: 600 }}>Projects</h2>
                {projects.map((p) => (
                  <div key={p.id} style={{ marginBottom: "12px" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9em" }}>{p.name}{p.url && <a href={p.url} style={{ color: accent, fontSize: "0.8em", marginLeft: "8px" }}>{p.url}</a>}</div>
                    {p.description && <p style={{ fontSize: "0.85em", color: "#334155", margin: "2px 0" }}>{p.description}</p>}
                    {p.technologies.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>{p.technologies.map((t) => <SkillBadge key={t} label={t} accent={accent} />)}</div>}
                  </div>
                ))}
              </div>
            );

          case "certifications":
            if (!certifications.length) return null;
            return (
              <div key="certifications" style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: "12px", fontWeight: 600 }}>Certifications</h2>
                {certifications.map((c) => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div><span style={{ fontWeight: 600, fontSize: "0.85em" }}>{c.name}</span><span style={{ color: "#64748b", fontSize: "0.8em" }}> · {c.issuer}</span></div>
                    <span style={{ fontSize: "0.78em", color: "#94a3b8" }}>{formatDate(c.issueDate)}</span>
                  </div>
                ))}
              </div>
            );

          case "languages":
            if (!languages.length) return null;
            return (
              <div key="languages" style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: "12px", fontWeight: 600 }}>Languages</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                  {languages.map((l) => <span key={l.id} style={{ fontSize: "0.875em" }}><strong>{l.name}</strong> <span style={{ color: "#64748b" }}>({l.proficiency})</span></span>)}
                </div>
              </div>
            );

          case "interests":
            if (!interests.length) return null;
            return (
              <div key="interests" style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.15em", color: accent, marginBottom: "12px", fontWeight: 600 }}>Interests</h2>
                <p style={{ fontSize: "0.875em", color: "#334155" }}>{data.interests.map((i) => i.name).join(" · ")}</p>
              </div>
            );

          default: return null;
        }
      })}
    </div>
  );
});
