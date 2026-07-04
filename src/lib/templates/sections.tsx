import type { ResumeData } from "@/types/resume";
import { FONT_MAP } from "@/types/resume";
import { formatDate } from "@/lib/utils";

export interface SectionRenderOpts {
  accent: string;
  muted?: string;
  sectionStyle?: "line" | "box" | "underline" | "caps" | "none";
  skillStyle?: "badges" | "plain" | "dots";
  bulletChar?: string;
  sectionGap?: number;
  itemGap?: number;
  fontFamily?: string;
  bodyColor?: string;
}

const M = (n: string, color: string): React.CSSProperties => ({ fontFamily: FONT_MAP[n] ?? FONT_MAP.inter, color });

export function getFontStyle(fontFamily: string): string {
  return FONT_MAP[fontFamily] ?? FONT_MAP.inter;
}

function SectionTitle({
  title,
  accent,
  style = "line",
}: {
  title: string;
  accent: string;
  style?: string;
}): React.ReactElement {
  if (style === "box") {
    return (
      <div style={{ backgroundColor: accent, padding: "4px 10px", marginBottom: "8px", marginTop: "4px" }}>
        <h2 style={{ fontSize: "0.8em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "white", margin: 0 }}>{title}</h2>
      </div>
    );
  }
  if (style === "underline") {
    return (
      <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: "4px", marginBottom: "10px", marginTop: "4px" }}>
        <h2 style={{ fontSize: "0.875em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent, margin: 0 }}>{title}</h2>
      </div>
    );
  }
  if (style === "caps") {
    return (
      <h2 style={{ fontSize: "0.75em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#999", margin: "0 0 8px", borderTop: "1px solid #eee", paddingTop: "12px" }}>{title}</h2>
    );
  }
  if (style === "none") {
    return (
      <h2 style={{ fontSize: "0.875em", fontWeight: 700, color: accent, margin: "0 0 8px" }}>{title}</h2>
    );
  }
  // default: "line"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", marginTop: "4px" }}>
      <h2 style={{ fontSize: "0.85em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: accent, margin: 0, whiteSpace: "nowrap" }}>{title}</h2>
      <div style={{ flex: 1, height: "1px", backgroundColor: accent, opacity: 0.25 }} />
    </div>
  );
}

function SkillBadge({ label, accent, style = "badges" }: { label: string; accent: string; style?: string }): React.ReactElement {
  if (style === "plain") {
    return <span style={{ fontSize: "0.8em", color: "#444" }}>• {label}</span>;
  }
  if (style === "dots") {
    return (
      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8em" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: accent, display: "inline-block" }} />
        {label}
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: "4px",
      backgroundColor: `${accent}15`, color: accent, fontSize: "0.75em", fontWeight: 500,
      border: `1px solid ${accent}30`,
    }}>
      {label}
    </span>
  );
}

function BulletItem({ text, accent, bulletChar = "›" }: { text: string; accent: string; bulletChar?: string }): React.ReactElement {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "2px", fontSize: "0.875em" }}>
      <span style={{ color: accent, fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>{bulletChar}</span>
      <span>{text}</span>
    </li>
  );
}

function DateText({ start, end, current, muted = "#666" }: { start: string; end: string; current: boolean; muted?: string }): React.ReactElement | null {
  const s = formatDate(start);
  const e = current ? "Present" : formatDate(end);
  if (!s && !e) return null;
  return <span style={{ fontSize: "0.8em", color: muted, whiteSpace: "nowrap" }}>{[s, e].filter(Boolean).join(" — ")}</span>;
}

function Divider({ show = true }: { show?: boolean }): React.ReactElement | null {
  if (!show) return null;
  return <div style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "10px 0 6px" }} />;
}

export function renderSections(data: ResumeData, opts: SectionRenderOpts): React.ReactNode[] {
  const {
    accent,
    muted = "#6b7280",
    sectionStyle = "line",
    skillStyle = "badges",
    bulletChar = "›",
    sectionGap = 14,
    showDividers,
  } = { ...opts, showDividers: data.theme.showDividers !== false };

  const {
    workExperiences, educations, skills, projects, certifications,
    languages, awards, achievements, volunteerWork, publications,
    interests, references, customSections, sectionOrder,
  } = data;

  const nodes: React.ReactNode[] = [];

  for (const section of sectionOrder) {
    switch (section) {
      case "summary":
        if (!data.personal.summary) break;
        nodes.push(
          <div key="summary" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Profile" accent={accent} style={sectionStyle} />
            <p style={{ fontSize: "0.875em", lineHeight: 1.6, color: "#333", margin: 0 }}>{data.personal.summary}</p>
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "experience":
        if (!workExperiences.length) break;
        nodes.push(
          <div key="experience" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Experience" accent={accent} style={sectionStyle} />
            {workExperiences.map((w, i) => (
              <div key={w.id} style={{ marginBottom: i < workExperiences.length - 1 ? "14px" : "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "4px" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95em" }}>{w.position}</div>
                    <div style={{ color: accent, fontWeight: 500, fontSize: "0.85em" }}>{w.company}{w.location ? ` · ${w.location}` : ""}</div>
                  </div>
                  <DateText start={w.startDate} end={w.endDate ?? ""} current={w.current} muted={muted} />
                </div>
                {w.description && <p style={{ margin: "4px 0", fontSize: "0.875em", color: "#444" }}>{w.description}</p>}
                {w.achievements.length > 0 && (
                  <ul style={{ margin: "4px 0", paddingLeft: 0, listStyle: "none" }}>
                    {w.achievements.map((a, j) => <BulletItem key={j} text={a} accent={accent} bulletChar={bulletChar} />)}
                  </ul>
                )}
                {w.technologies.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                    {w.technologies.map((t) => <SkillBadge key={t} label={t} accent={accent} style={skillStyle} />)}
                  </div>
                )}
              </div>
            ))}
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "education":
        if (!educations.length) break;
        nodes.push(
          <div key="education" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Education" accent={accent} style={sectionStyle} />
            {educations.map((e, i) => (
              <div key={e.id} style={{ marginBottom: i < educations.length - 1 ? "10px" : "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "4px" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9em" }}>{e.degree}{e.fieldOfStudy ? `, ${e.fieldOfStudy}` : ""}</div>
                    <div style={{ color: accent, fontSize: "0.85em", fontWeight: 500 }}>{e.institution}{e.location ? ` · ${e.location}` : ""}</div>
                  </div>
                  <DateText start={e.startDate} end={e.endDate ?? ""} current={e.current} muted={muted} />
                </div>
                {e.gpa && <div style={{ fontSize: "0.8em", color: muted }}>GPA: {e.gpa}</div>}
                {e.description && <p style={{ margin: "3px 0", fontSize: "0.8em", color: "#555" }}>{e.description}</p>}
              </div>
            ))}
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "skills":
        if (!skills.length) break;
        nodes.push(
          <div key="skills" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Skills" accent={accent} style={sectionStyle} />
            {(() => {
              const cats = [...new Set(skills.map((s) => s.category).filter(Boolean))];
              if (cats.length > 1) {
                return cats.map((cat) => (
                  <div key={cat} style={{ marginBottom: "8px" }}>
                    {cat && <div style={{ fontSize: "0.75em", fontWeight: 600, color: muted, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat}</div>}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {skills.filter((s) => s.category === cat).map((s) => <SkillBadge key={s.id} label={s.name} accent={accent} style={skillStyle} />)}
                    </div>
                  </div>
                ));
              }
              return (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "4px" }}>
                  {skills.map((s) => <SkillBadge key={s.id} label={s.name} accent={accent} style={skillStyle} />)}
                </div>
              );
            })()}
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "projects":
        if (!projects.length) break;
        nodes.push(
          <div key="projects" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Projects" accent={accent} style={sectionStyle} />
            {projects.map((p, i) => (
              <div key={p.id} style={{ marginBottom: i < projects.length - 1 ? "12px" : "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9em" }}>{p.name}</span>
                  {p.url && <a href={p.url} style={{ color: accent, fontSize: "0.75em" }}>{p.url}</a>}
                </div>
                {p.description && <p style={{ margin: "3px 0", fontSize: "0.875em", color: "#444" }}>{p.description}</p>}
                {p.technologies.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                    {p.technologies.map((t) => <SkillBadge key={t} label={t} accent={accent} style={skillStyle} />)}
                  </div>
                )}
              </div>
            ))}
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "certifications":
        if (!certifications.length) break;
        nodes.push(
          <div key="certifications" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Certifications" accent={accent} style={sectionStyle} />
            {certifications.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", flexWrap: "wrap", gap: "4px" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "0.875em" }}>{c.name}</span>
                  <span style={{ color: muted, fontSize: "0.8em" }}> · {c.issuer}</span>
                </div>
                <span style={{ fontSize: "0.8em", color: muted }}>{formatDate(c.issueDate)}</span>
              </div>
            ))}
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "languages":
        if (!languages.length) break;
        nodes.push(
          <div key="languages" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Languages" accent={accent} style={sectionStyle} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {languages.map((l) => (
                <div key={l.id} style={{ fontSize: "0.875em" }}>
                  <span style={{ fontWeight: 600 }}>{l.name}</span>
                  <span style={{ color: muted }}> — {l.proficiency}</span>
                </div>
              ))}
            </div>
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "awards":
        if (!awards.length) break;
        nodes.push(
          <div key="awards" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Awards & Honors" accent={accent} style={sectionStyle} />
            {awards.map((a) => (
              <div key={a.id} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875em" }}>{a.title}</span>
                  <span style={{ fontSize: "0.8em", color: muted }}>{a.issuer}{a.date ? ` · ${formatDate(a.date)}` : ""}</span>
                </div>
                {a.description && <p style={{ margin: "2px 0", fontSize: "0.8em", color: "#555" }}>{a.description}</p>}
              </div>
            ))}
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "achievements":
        if (!achievements.length) break;
        nodes.push(
          <div key="achievements" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Achievements" accent={accent} style={sectionStyle} />
            {achievements.map((a) => (
              <div key={a.id} style={{ marginBottom: "6px", fontSize: "0.875em" }}>
                <span style={{ fontWeight: 600 }}>{a.title}</span>
                {a.description && <span style={{ color: "#555" }}> — {a.description}</span>}
              </div>
            ))}
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "volunteer":
        if (!volunteerWork.length) break;
        nodes.push(
          <div key="volunteer" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Volunteer Work" accent={accent} style={sectionStyle} />
            {volunteerWork.map((v) => (
              <div key={v.id} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875em" }}>{v.role}</div>
                    <div style={{ color: accent, fontSize: "0.8em" }}>{v.organization}</div>
                  </div>
                  <DateText start={v.startDate ?? ""} end={v.endDate ?? ""} current={v.current} muted={muted} />
                </div>
                {v.description && <p style={{ margin: "3px 0", fontSize: "0.8em", color: "#555" }}>{v.description}</p>}
              </div>
            ))}
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "publications":
        if (!publications.length) break;
        nodes.push(
          <div key="publications" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Publications" accent={accent} style={sectionStyle} />
            {publications.map((p) => (
              <div key={p.id} style={{ marginBottom: "8px" }}>
                <div style={{ fontWeight: 600, fontSize: "0.875em" }}>{p.title}</div>
                <div style={{ fontSize: "0.8em", color: muted }}>{p.publisher}{p.date ? ` · ${formatDate(p.date)}` : ""}</div>
                {p.description && <p style={{ margin: "2px 0", fontSize: "0.8em", color: "#555" }}>{p.description}</p>}
              </div>
            ))}
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "interests":
        if (!interests.length) break;
        nodes.push(
          <div key="interests" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="Interests" accent={accent} style={sectionStyle} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {interests.map((i) => <SkillBadge key={i.id} label={i.name} accent={accent} style={skillStyle} />)}
            </div>
            <Divider show={showDividers} />
          </div>
        );
        break;

      case "references":
        if (!references.length) break;
        nodes.push(
          <div key="references" style={{ marginBottom: sectionGap }}>
            <SectionTitle title="References" accent={accent} style={sectionStyle} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {references.map((r) => (
                <div key={r.id}>
                  <div style={{ fontWeight: 600, fontSize: "0.875em" }}>{r.name}</div>
                  <div style={{ fontSize: "0.8em", color: "#555" }}>{r.position}{r.company ? `, ${r.company}` : ""}</div>
                  {r.email && <div style={{ fontSize: "0.8em", color: muted }}>{r.email}</div>}
                  {r.phone && <div style={{ fontSize: "0.8em", color: muted }}>{r.phone}</div>}
                </div>
              ))}
            </div>
            <Divider show={showDividers} />
          </div>
        );
        break;

      default: {
        if (!section.startsWith("custom-")) break;
        const cs = customSections.find((c) => c.id === section.replace("custom-", ""));
        if (!cs || !cs.content.length) break;
        nodes.push(
          <div key={section} style={{ marginBottom: sectionGap }}>
            <SectionTitle title={cs.title} accent={accent} style={sectionStyle} />
            {cs.content.map((entry) => (
              <div key={entry.id} style={{ marginBottom: "8px" }}>
                <div style={{ fontWeight: 600, fontSize: "0.875em" }}>{entry.title}</div>
                {entry.subtitle && <div style={{ color: "#555", fontSize: "0.8em" }}>{entry.subtitle}</div>}
                {entry.description && <p style={{ margin: "2px 0", fontSize: "0.8em", color: "#555" }}>{entry.description}</p>}
              </div>
            ))}
            <Divider show={showDividers} />
          </div>
        );
        break;
      }
    }
  }

  return nodes;
}

// Named export for explicit use
export { SectionTitle, SkillBadge, BulletItem, DateText, Divider };
export { M as buildFontStyle };
