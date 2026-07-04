/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { formatDate } from "@/lib/utils";
import { BulletList, SkillBadge, DateRange } from "./shared";

interface Props { data: ResumeData; }

export const ClassicTemplate = memo(function ClassicTemplate({ data }: Props) {
  const { personal, theme, workExperiences, educations, skills, projects, certifications, languages, interests, sectionOrder } = data;

  const accent = theme.themeColor;
  const margin = theme.pageMargin;

  return (
    <div style={{ fontFamily: "Georgia, serif", fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#1a1a1a", display: "flex", minHeight: "100%" }}>
      {/* Left sidebar */}
      <div style={{ width: "220px", flexShrink: 0, backgroundColor: "#f8f9fa", borderRight: "1px solid #e5e7eb", padding: `${margin}px 20px` }}>
        {personal.photoUrl && (
          <div style={{ marginBottom: "16px", textAlign: "center" }}>
            <img src={personal.photoUrl} alt={personal.fullName} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}` }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "1.15em", fontWeight: 700, color: accent, margin: "0 0 4px" }}>{personal.fullName || "Your Name"}</h1>
          {personal.headline && <p style={{ fontSize: "0.75em", color: "#555", margin: 0 }}>{personal.headline}</p>}
        </div>

        {/* Contact */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.1em", color: accent, marginBottom: "8px", borderBottom: `1px solid ${accent}40`, paddingBottom: "4px" }}>Contact</h3>
          {personal.email && <p style={{ fontSize: "0.75em", margin: "4px 0", wordBreak: "break-all" }}>{personal.email}</p>}
          {personal.phone && <p style={{ fontSize: "0.75em", margin: "4px 0" }}>{personal.phone}</p>}
          {personal.location && <p style={{ fontSize: "0.75em", margin: "4px 0" }}>{personal.location}</p>}
          {personal.linkedin && <p style={{ fontSize: "0.75em", margin: "4px 0", wordBreak: "break-all" }}>{personal.linkedin}</p>}
          {personal.github && <p style={{ fontSize: "0.75em", margin: "4px 0", wordBreak: "break-all" }}>{personal.github}</p>}
          {personal.website && <p style={{ fontSize: "0.75em", margin: "4px 0", wordBreak: "break-all" }}>{personal.website}</p>}
        </div>

        {/* Skills in sidebar */}
        {skills.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.1em", color: accent, marginBottom: "8px", borderBottom: `1px solid ${accent}40`, paddingBottom: "4px" }}>Skills</h3>
            {skills.map((s) => (
              <div key={s.id} style={{ marginBottom: "6px" }}>
                <div style={{ fontSize: "0.75em", fontWeight: 600, marginBottom: "2px" }}>{s.name}</div>
                <div style={{ height: "4px", backgroundColor: "#e5e7eb", borderRadius: "2px" }}>
                  <div style={{ height: "100%", width: `${(s.rating / 5) * 100}%`, backgroundColor: accent, borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages in sidebar */}
        {languages.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.1em", color: accent, marginBottom: "8px", borderBottom: `1px solid ${accent}40`, paddingBottom: "4px" }}>Languages</h3>
            {languages.map((l) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.75em", fontWeight: 600 }}>{l.name}</span>
                <span style={{ fontSize: "0.7em", color: "#666" }}>{l.proficiency}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interests in sidebar */}
        {data.interests.length > 0 && (
          <div>
            <h3 style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: "0.1em", color: accent, marginBottom: "8px", borderBottom: `1px solid ${accent}40`, paddingBottom: "4px" }}>Interests</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {data.interests.map((i) => <span key={i.id} style={{ fontSize: "0.7em", padding: "1px 6px", backgroundColor: `${accent}15`, color: accent, borderRadius: "3px" }}>{i.name}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: `${margin}px ${margin * 0.75}px ${margin}px ${margin * 0.75}px` }}>
        {personal.summary && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "0.85em", textTransform: "uppercase", letterSpacing: "0.1em", color: accent, marginBottom: "8px", borderBottom: `2px solid ${accent}`, paddingBottom: "4px" }}>Profile</h2>
            <p style={{ fontSize: "0.875em" }}>{personal.summary}</p>
          </div>
        )}

        {sectionOrder.filter((s) => !["skills", "languages", "interests"].includes(s)).map((section) => {
          switch (section) {
            case "experience":
              if (!workExperiences.length) return null;
              return (
                <div key="experience" style={{ marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "0.85em", textTransform: "uppercase", letterSpacing: "0.1em", color: accent, marginBottom: "8px", borderBottom: `2px solid ${accent}`, paddingBottom: "4px" }}>Experience</h2>
                  {workExperiences.map((w, i) => (
                    <div key={w.id} style={{ marginBottom: i < workExperiences.length - 1 ? "16px" : "0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div><div style={{ fontWeight: 700, fontSize: "0.9em" }}>{w.position}</div><div style={{ color: accent, fontSize: "0.8em" }}>{w.company}{w.location ? ` · ${w.location}` : ""}</div></div>
                        <div style={{ fontSize: "0.78em", color: "#666", textAlign: "right" }}><DateRange startDate={w.startDate} endDate={w.endDate} current={w.current} /></div>
                      </div>
                      {w.description && <p style={{ margin: "4px 0", fontSize: "0.85em" }}>{w.description}</p>}
                      {w.achievements.length > 0 && <BulletList items={w.achievements} accent={accent} />}
                    </div>
                  ))}
                </div>
              );

            case "education":
              if (!educations.length) return null;
              return (
                <div key="education" style={{ marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "0.85em", textTransform: "uppercase", letterSpacing: "0.1em", color: accent, marginBottom: "8px", borderBottom: `2px solid ${accent}`, paddingBottom: "4px" }}>Education</h2>
                  {educations.map((e) => (
                    <div key={e.id} style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div><div style={{ fontWeight: 700, fontSize: "0.9em" }}>{e.degree}{e.fieldOfStudy ? `, ${e.fieldOfStudy}` : ""}</div><div style={{ color: accent, fontSize: "0.8em" }}>{e.institution}</div></div>
                        <div style={{ fontSize: "0.78em", color: "#666" }}><DateRange startDate={e.startDate} endDate={e.endDate} current={e.current} /></div>
                      </div>
                      {e.gpa && <div style={{ fontSize: "0.78em", color: "#666" }}>GPA: {e.gpa}</div>}
                    </div>
                  ))}
                </div>
              );

            case "projects":
              if (!projects.length) return null;
              return (
                <div key="projects" style={{ marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "0.85em", textTransform: "uppercase", letterSpacing: "0.1em", color: accent, marginBottom: "8px", borderBottom: `2px solid ${accent}`, paddingBottom: "4px" }}>Projects</h2>
                  {projects.map((p) => (
                    <div key={p.id} style={{ marginBottom: "10px" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.9em" }}>{p.name}</div>
                      {p.description && <p style={{ margin: "2px 0", fontSize: "0.85em" }}>{p.description}</p>}
                      {p.technologies.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>{p.technologies.map((t) => <SkillBadge key={t} label={t} accent={accent} />)}</div>}
                    </div>
                  ))}
                </div>
              );

            case "certifications":
              if (!certifications.length) return null;
              return (
                <div key="certifications" style={{ marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "0.85em", textTransform: "uppercase", letterSpacing: "0.1em", color: accent, marginBottom: "8px", borderBottom: `2px solid ${accent}`, paddingBottom: "4px" }}>Certifications</h2>
                  {certifications.map((c) => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div><span style={{ fontWeight: 600, fontSize: "0.875em" }}>{c.name}</span><span style={{ color: "#555", fontSize: "0.8em" }}> · {c.issuer}</span></div>
                      <span style={{ fontSize: "0.78em", color: "#666" }}>{formatDate(c.issueDate)}</span>
                    </div>
                  ))}
                </div>
              );

            default: return null;
          }
        })}
      </div>
    </div>
  );
});
