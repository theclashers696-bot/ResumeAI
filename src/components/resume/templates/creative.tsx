/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { formatDate } from "@/lib/utils";
import { BulletList, DateRange } from "./shared";

interface Props { data: ResumeData; }

export const CreativeTemplate = memo(function CreativeTemplate({ data }: Props) {
  const { personal, theme, workExperiences, educations, skills, projects, certifications, languages, interests, sectionOrder } = data;
  const accent = theme.themeColor;
  const margin = theme.pageMargin;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: `${theme.fontSize}px`, lineHeight: theme.lineHeight, color: "#1a1a1a", display: "flex", minHeight: "100%" }}>
      {/* Bold sidebar */}
      <div style={{ width: "240px", flexShrink: 0, backgroundColor: accent, color: "white", padding: `${margin}px 20px`, display: "flex", flexDirection: "column", gap: "20px" }}>
        {personal.photoUrl && (
          <div style={{ textAlign: "center" }}>
            <img src={personal.photoUrl} alt={personal.fullName} style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.5)" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}

        <div>
          <h1 style={{ fontSize: "1.2em", fontWeight: 700, margin: "0 0 4px", color: "white" }}>{personal.fullName || "Your Name"}</h1>
          {personal.headline && <p style={{ fontSize: "0.78em", opacity: 0.85, margin: 0 }}>{personal.headline}</p>}
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ fontSize: "0.65em", textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.7, marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "4px" }}>Contact</h3>
          {personal.email && <p style={{ fontSize: "0.72em", margin: "4px 0", opacity: 0.9, wordBreak: "break-all" }}>{personal.email}</p>}
          {personal.phone && <p style={{ fontSize: "0.72em", margin: "4px 0", opacity: 0.9 }}>{personal.phone}</p>}
          {personal.location && <p style={{ fontSize: "0.72em", margin: "4px 0", opacity: 0.9 }}>{personal.location}</p>}
          {personal.linkedin && <p style={{ fontSize: "0.72em", margin: "4px 0", opacity: 0.9, wordBreak: "break-all" }}>{personal.linkedin}</p>}
          {personal.github && <p style={{ fontSize: "0.72em", margin: "4px 0", opacity: 0.9, wordBreak: "break-all" }}>{personal.github}</p>}
          {personal.website && <p style={{ fontSize: "0.72em", margin: "4px 0", opacity: 0.9, wordBreak: "break-all" }}>{personal.website}</p>}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h3 style={{ fontSize: "0.65em", textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.7, marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "4px" }}>Skills</h3>
            {skills.slice(0, 12).map((s) => (
              <div key={s.id} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                  <span style={{ fontSize: "0.72em" }}>{s.name}</span>
                </div>
                <div style={{ height: "3px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "2px" }}>
                  <div style={{ height: "100%", width: `${(s.rating / 5) * 100}%`, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <h3 style={{ fontSize: "0.65em", textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.7, marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "4px" }}>Languages</h3>
            {languages.map((l) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.72em" }}>
                <span>{l.name}</span><span style={{ opacity: 0.75 }}>{l.proficiency}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div>
            <h3 style={{ fontSize: "0.65em", textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.7, marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "4px" }}>Interests</h3>
            <p style={{ fontSize: "0.72em", opacity: 0.85 }}>{interests.map((i) => i.name).join(" · ")}</p>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: `${margin}px ${margin * 0.75}px` }}>
        {personal.summary && (
          <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: `${accent}08`, borderLeft: `4px solid ${accent}`, borderRadius: "0 8px 8px 0" }}>
            <p style={{ fontSize: "0.875em", color: "#334155", margin: 0 }}>{personal.summary}</p>
          </div>
        )}

        {sectionOrder.filter((s) => !["skills", "languages", "interests"].includes(s)).map((section) => {
          switch (section) {
            case "experience":
              if (!workExperiences.length) return null;
              return (
                <div key="experience" style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "0.85em", fontWeight: 700, color: accent, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "inline-block", width: "20px", height: "2px", backgroundColor: accent }} />
                    EXPERIENCE
                  </h2>
                  {workExperiences.map((w, i) => (
                    <div key={w.id} style={{ marginBottom: i < workExperiences.length - 1 ? "16px" : "0", position: "relative", paddingLeft: "16px", borderLeft: `2px solid ${accent}20` }}>
                      <div style={{ position: "absolute", left: "-5px", top: "6px", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: accent }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div><div style={{ fontWeight: 700, fontSize: "0.9em" }}>{w.position}</div><div style={{ color: accent, fontSize: "0.8em", fontWeight: 500 }}>{w.company}</div></div>
                        <div style={{ fontSize: "0.75em", color: "#94a3b8", flexShrink: 0 }}><DateRange startDate={w.startDate} endDate={w.endDate} current={w.current} /></div>
                      </div>
                      {w.description && <p style={{ fontSize: "0.85em", color: "#475569", margin: "4px 0" }}>{w.description}</p>}
                      {w.achievements.length > 0 && <BulletList items={w.achievements} accent={accent} />}
                    </div>
                  ))}
                </div>
              );

            case "education":
              if (!educations.length) return null;
              return (
                <div key="education" style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "0.85em", fontWeight: 700, color: accent, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "inline-block", width: "20px", height: "2px", backgroundColor: accent }} />
                    EDUCATION
                  </h2>
                  {educations.map((e) => (
                    <div key={e.id} style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div><div style={{ fontWeight: 600, fontSize: "0.9em" }}>{e.degree}{e.fieldOfStudy ? `, ${e.fieldOfStudy}` : ""}</div><div style={{ color: accent, fontSize: "0.8em" }}>{e.institution}</div></div>
                        <span style={{ fontSize: "0.78em", color: "#94a3b8" }}><DateRange startDate={e.startDate} endDate={e.endDate} current={e.current} /></span>
                      </div>
                      {e.gpa && <div style={{ fontSize: "0.78em", color: "#64748b" }}>GPA: {e.gpa}</div>}
                    </div>
                  ))}
                </div>
              );

            case "projects":
              if (!projects.length) return null;
              return (
                <div key="projects" style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "0.85em", fontWeight: 700, color: accent, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "inline-block", width: "20px", height: "2px", backgroundColor: accent }} />
                    PROJECTS
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {projects.map((p) => (
                      <div key={p.id} style={{ padding: "10px", backgroundColor: `${accent}06`, borderRadius: "6px", border: `1px solid ${accent}20` }}>
                        <div style={{ fontWeight: 600, fontSize: "0.85em", color: accent }}>{p.name}</div>
                        {p.description && <p style={{ fontSize: "0.78em", color: "#475569", margin: "4px 0" }}>{p.description}</p>}
                        {p.technologies.length > 0 && <div style={{ fontSize: "0.72em", color: "#64748b" }}>{p.technologies.join(" · ")}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );

            case "certifications":
              if (!certifications.length) return null;
              return (
                <div key="certifications" style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "0.85em", fontWeight: 700, color: accent, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "inline-block", width: "20px", height: "2px", backgroundColor: accent }} />
                    CERTIFICATIONS
                  </h2>
                  {certifications.map((c) => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div><span style={{ fontWeight: 600, fontSize: "0.875em" }}>{c.name}</span><span style={{ color: "#64748b", fontSize: "0.8em" }}> · {c.issuer}</span></div>
                      <span style={{ fontSize: "0.78em", color: "#94a3b8" }}>{formatDate(c.issueDate)}</span>
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
