/* eslint-disable @next/next/no-img-element */
import { memo } from "react";
import type { ResumeData } from "@/types/resume";
import { formatDate } from "@/lib/utils";
import { ResumeSection, ContactRow, BulletList, SkillBadge, DateRange, SectionDivider } from "./shared";

interface Props { data: ResumeData; }

export const ModernTemplate = memo(function ModernTemplate({ data }: Props) {
  const { personal, theme, workExperiences, educations, skills, projects, certifications, languages, awards, achievements, volunteerWork, publications, interests, references, customSections, sectionOrder } = data;

  const fontMap: Record<string, string> = {
    inter: "'Inter', sans-serif",
    roboto: "'Roboto', sans-serif",
    opensans: "'Open Sans', sans-serif",
    lato: "'Lato', sans-serif",
    merriweather: "'Merriweather', serif",
    playfair: "'Playfair Display', serif",
    sourceserif: "'Source Serif Pro', serif",
    georgia: "Georgia, serif",
  };

  const style = {
    fontFamily: fontMap[theme.fontFamily] ?? fontMap.inter,
    fontSize: `${theme.fontSize}px`,
    lineHeight: theme.lineHeight,
    color: "#1a1a1a",
  } as React.CSSProperties;

  const headerBg = theme.themeColor;
  const accent = theme.themeColor;
  const margin = theme.pageMargin;

  return (
    <div style={style} className="bg-white min-h-full">
      {/* Header */}
      <div style={{ backgroundColor: headerBg, padding: `${margin}px ${margin}px ${margin * 0.75}px` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          {personal.photoUrl && (
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              style={{ width: 72, height: 72, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.8)", objectFit: "cover", flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.8em", fontWeight: 700, color: "white", margin: 0, lineHeight: 1.2 }}>{personal.fullName || "Your Name"}</h1>
            {personal.headline && <p style={{ color: "rgba(255,255,255,0.85)", margin: "4px 0 0", fontSize: "0.95em" }}>{personal.headline}</p>}
          </div>
        </div>

        {/* Contact row */}
        {(personal.email || personal.phone || personal.location || personal.website || personal.linkedin) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
            {personal.email && <ContactRow label="Email" value={personal.email} light />}
            {personal.phone && <ContactRow label="Phone" value={personal.phone} light />}
            {personal.location && <ContactRow label="Location" value={personal.location} light />}
            {personal.linkedin && <ContactRow label="LinkedIn" value={personal.linkedin} light />}
            {personal.github && <ContactRow label="GitHub" value={personal.github} light />}
            {personal.website && <ContactRow label="Website" value={personal.website} light href />}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: `${margin * 0.75}px ${margin}px ${margin}px` }}>
        {personal.summary && (
          <>
            <ResumeSection title="Profile" accent={accent} />
            <p style={{ marginBottom: "16px" }}>{personal.summary}</p>
          </>
        )}

        {sectionOrder.map((section) => {
          switch (section) {
            case "experience":
              if (!workExperiences.length) return null;
              return (
                <div key="experience">
                  <ResumeSection title="Experience" accent={accent} />
                  {workExperiences.map((w, i) => (
                    <div key={w.id} style={{ marginBottom: i < workExperiences.length - 1 ? "16px" : "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95em" }}>{w.position}</div>
                          <div style={{ color: accent, fontWeight: 500, fontSize: "0.875em" }}>{w.company}{w.location ? ` · ${w.location}` : ""}</div>
                        </div>
                        <div style={{ fontSize: "0.8em", color: "#666", whiteSpace: "nowrap", marginLeft: "12px" }}>
                          <DateRange startDate={w.startDate} endDate={w.endDate} current={w.current} />
                        </div>
                      </div>
                      {w.description && <p style={{ margin: "4px 0", fontSize: "0.875em" }}>{w.description}</p>}
                      {w.achievements.length > 0 && <BulletList items={w.achievements} accent={accent} />}
                      {w.technologies.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                          {w.technologies.map((t) => <SkillBadge key={t} label={t} accent={accent} />)}
                        </div>
                      )}
                    </div>
                  ))}
                  <SectionDivider />
                </div>
              );

            case "education":
              if (!educations.length) return null;
              return (
                <div key="education">
                  <ResumeSection title="Education" accent={accent} />
                  {educations.map((e, i) => (
                    <div key={e.id} style={{ marginBottom: i < educations.length - 1 ? "12px" : "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95em" }}>{e.degree}{e.fieldOfStudy ? `, ${e.fieldOfStudy}` : ""}</div>
                          <div style={{ color: accent, fontWeight: 500, fontSize: "0.875em" }}>{e.institution}{e.location ? ` · ${e.location}` : ""}</div>
                        </div>
                        <div style={{ fontSize: "0.8em", color: "#666", whiteSpace: "nowrap", marginLeft: "12px" }}>
                          <DateRange startDate={e.startDate} endDate={e.endDate} current={e.current} />
                        </div>
                      </div>
                      {e.gpa && <div style={{ fontSize: "0.8em", color: "#666" }}>GPA: {e.gpa}</div>}
                      {e.description && <p style={{ margin: "4px 0", fontSize: "0.875em" }}>{e.description}</p>}
                    </div>
                  ))}
                  <SectionDivider />
                </div>
              );

            case "skills":
              if (!skills.length) return null;
              const categories = [...new Set(skills.map((s) => s.category))];
              return (
                <div key="skills">
                  <ResumeSection title="Skills" accent={accent} />
                  {categories.length > 1 ? (
                    <div style={{ marginBottom: "8px" }}>
                      {categories.map((cat) => (
                        <div key={cat} style={{ marginBottom: "8px" }}>
                          {cat && <div style={{ fontSize: "0.8em", fontWeight: 600, color: "#555", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat}</div>}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {skills.filter((s) => s.category === cat).map((s) => <SkillBadge key={s.id} label={s.name} accent={accent} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                      {skills.map((s) => <SkillBadge key={s.id} label={s.name} accent={accent} />)}
                    </div>
                  )}
                  <SectionDivider />
                </div>
              );

            case "projects":
              if (!projects.length) return null;
              return (
                <div key="projects">
                  <ResumeSection title="Projects" accent={accent} />
                  {projects.map((p, i) => (
                    <div key={p.id} style={{ marginBottom: i < projects.length - 1 ? "12px" : "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: "0.95em" }}>{p.name}</span>
                          {p.url && <a href={p.url} style={{ marginLeft: "8px", color: accent, fontSize: "0.8em" }}>{p.url}</a>}
                        </div>
                      </div>
                      {p.description && <p style={{ margin: "4px 0", fontSize: "0.875em" }}>{p.description}</p>}
                      {p.technologies.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                          {p.technologies.map((t) => <SkillBadge key={t} label={t} accent={accent} />)}
                        </div>
                      )}
                    </div>
                  ))}
                  <SectionDivider />
                </div>
              );

            case "certifications":
              if (!certifications.length) return null;
              return (
                <div key="certifications">
                  <ResumeSection title="Certifications" accent={accent} />
                  {certifications.map((c) => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: "0.875em" }}>{c.name}</span>
                        <span style={{ color: "#666", fontSize: "0.8em" }}> · {c.issuer}</span>
                      </div>
                      <span style={{ fontSize: "0.8em", color: "#666" }}>{formatDate(c.issueDate)}</span>
                    </div>
                  ))}
                  <SectionDivider />
                </div>
              );

            case "languages":
              if (!languages.length) return null;
              return (
                <div key="languages">
                  <ResumeSection title="Languages" accent={accent} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                    {languages.map((l) => (
                      <div key={l.id} style={{ fontSize: "0.875em" }}>
                        <span style={{ fontWeight: 600 }}>{l.name}</span>
                        <span style={{ color: "#666" }}> — {l.proficiency}</span>
                      </div>
                    ))}
                  </div>
                  <SectionDivider />
                </div>
              );

            case "awards":
              if (!awards.length) return null;
              return (
                <div key="awards">
                  <ResumeSection title="Awards" accent={accent} />
                  {awards.map((a) => (
                    <div key={a.id} style={{ marginBottom: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.875em" }}>{a.title}</span>
                        <span style={{ fontSize: "0.8em", color: "#666" }}>{a.issuer}{a.date ? ` · ${formatDate(a.date)}` : ""}</span>
                      </div>
                      {a.description && <p style={{ margin: "2px 0", fontSize: "0.8em", color: "#555" }}>{a.description}</p>}
                    </div>
                  ))}
                  <SectionDivider />
                </div>
              );

            case "volunteer":
              if (!volunteerWork.length) return null;
              return (
                <div key="volunteer">
                  <ResumeSection title="Volunteer Work" accent={accent} />
                  {volunteerWork.map((v) => (
                    <div key={v.id} style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.875em" }}>{v.role}</div>
                          <div style={{ color: accent, fontSize: "0.8em" }}>{v.organization}</div>
                        </div>
                        <div style={{ fontSize: "0.8em", color: "#666" }}>
                          <DateRange startDate={v.startDate} endDate={v.endDate} current={v.current} />
                        </div>
                      </div>
                      {v.description && <p style={{ margin: "4px 0", fontSize: "0.8em" }}>{v.description}</p>}
                    </div>
                  ))}
                  <SectionDivider />
                </div>
              );

            case "interests":
              if (!interests.length) return null;
              return (
                <div key="interests">
                  <ResumeSection title="Interests" accent={accent} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                    {interests.map((i) => <SkillBadge key={i.id} label={i.name} accent={accent} />)}
                  </div>
                  <SectionDivider />
                </div>
              );

            case "references":
              if (!references.length) return null;
              return (
                <div key="references">
                  <ResumeSection title="References" accent={accent} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px" }}>
                    {references.map((r) => (
                      <div key={r.id}>
                        <div style={{ fontWeight: 600, fontSize: "0.875em" }}>{r.name}</div>
                        <div style={{ fontSize: "0.8em", color: "#555" }}>{r.position}{r.company ? `, ${r.company}` : ""}</div>
                        {r.email && <div style={{ fontSize: "0.8em", color: "#666" }}>{r.email}</div>}
                        {r.phone && <div style={{ fontSize: "0.8em", color: "#666" }}>{r.phone}</div>}
                      </div>
                    ))}
                  </div>
                  <SectionDivider />
                </div>
              );

            case "publications":
              if (!publications.length) return null;
              return (
                <div key="publications">
                  <ResumeSection title="Publications" accent={accent} />
                  {publications.map((p) => (
                    <div key={p.id} style={{ marginBottom: "8px" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875em" }}>{p.title}</div>
                      <div style={{ fontSize: "0.8em", color: "#555" }}>{p.publisher}{p.date ? ` · ${formatDate(p.date)}` : ""}</div>
                      {p.description && <p style={{ margin: "2px 0", fontSize: "0.8em", color: "#555" }}>{p.description}</p>}
                    </div>
                  ))}
                  <SectionDivider />
                </div>
              );

            case "achievements":
              if (!achievements.length) return null;
              return (
                <div key="achievements">
                  <ResumeSection title="Achievements" accent={accent} />
                  {achievements.map((a) => (
                    <div key={a.id} style={{ marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.875em" }}>{a.title}</span>
                      {a.description && <span style={{ color: "#555", fontSize: "0.8em" }}> — {a.description}</span>}
                    </div>
                  ))}
                  <SectionDivider />
                </div>
              );

            default:
              // Custom section
              const customSection = customSections.find((cs) => cs.id === section?.replace("custom-", ""));
              if (!customSection || !customSection.content.length) return null;
              return (
                <div key={section}>
                  <ResumeSection title={customSection.title} accent={accent} />
                  {customSection.content.map((entry) => (
                    <div key={entry.id} style={{ marginBottom: "8px" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875em" }}>{entry.title}</div>
                      {entry.subtitle && <div style={{ color: "#555", fontSize: "0.8em" }}>{entry.subtitle}</div>}
                      {entry.description && <p style={{ margin: "2px 0", fontSize: "0.8em" }}>{entry.description}</p>}
                    </div>
                  ))}
                  <SectionDivider />
                </div>
              );
          }
        })}
      </div>
    </div>
  );
});
