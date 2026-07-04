import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  PageOrientation,
} from "docx";


interface ResumeRow {
  title: string;
  slug: string;
  fullName: string | null;
  headline: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  summary: string | null;
  themeColor: string;
  fontFamily: string;
  workExperiences: Array<{
    company: string;
    position: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string | null;
    achievements: unknown;
  }>;
  educations: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
    gpa: string | null;
    description: string | null;
  }>;
  skills: Array<{ name: string; category: string | null; level: string }>;
  projects: Array<{
    name: string;
    description: string | null;
    url: string | null;
    technologies: unknown;
    startDate: string | null;
    endDate: string | null;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string | null;
    credentialId: string | null;
    url: string | null;
  }>;
  languages: Array<{ name: string; proficiency: string }>;
  awards: Array<{ title: string; issuer: string | null; date: string | null; description: string | null }>;
  achievements: Array<{ title: string; description: string | null; date: string | null }>;
}

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((x): x is string => typeof x === "string");
  return [];
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    text: text.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "3B82F6", space: 4 },
    },
  });
}

function contactText(parts: string[]): Paragraph {
  const runs = parts
    .filter(Boolean)
    .flatMap((p, i) => [
      new TextRun({ text: p, size: 20 }),
      ...(i < parts.filter(Boolean).length - 1 ? [new TextRun({ text: "  |  ", size: 20, color: "94A3B8" })] : []),
    ]);
  return new Paragraph({
    children: runs,
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
  });
}

export async function generateDocx(resume: ResumeRow): Promise<Buffer> {
  const children: Paragraph[] = [];

  // ── Header ─────────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: resume.fullName ?? resume.title,
          bold: true,
          size: 48,
          color: "1E293B",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    })
  );

  if (resume.headline) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: resume.headline, size: 26, color: "3B82F6", italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      })
    );
  }

  const contactParts = [
    resume.email,
    resume.phone,
    resume.location,
    resume.website,
    resume.linkedin ? `linkedin.com/in/${resume.linkedin}` : null,
    resume.github ? `github.com/${resume.github}` : null,
  ].filter((p): p is string => Boolean(p));

  if (contactParts.length) children.push(contactText(contactParts));

  // ── Summary ─────────────────────────────────────────────────────────────────
  if (resume.summary) {
    children.push(sectionHeading("Professional Summary"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: resume.summary, size: 22 })],
        spacing: { after: 120 },
      })
    );
  }

  // ── Work Experience ─────────────────────────────────────────────────────────
  if (resume.workExperiences.length > 0) {
    children.push(sectionHeading("Work Experience"));
    for (const exp of resume.workExperiences) {
      const dateRange = exp.current ? `${exp.startDate} – Present` : `${exp.startDate} – ${exp.endDate ?? ""}`;

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true, size: 24 }),
            new TextRun({ text: `  •  ${exp.company}`, size: 24, color: "475569" }),
            new TextRun({ text: `  |  ${dateRange}`, size: 22, color: "94A3B8" }),
          ],
          spacing: { before: 120, after: 40 },
        })
      );

      if (exp.location) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: exp.location, size: 20, color: "94A3B8", italics: true })],
            spacing: { after: 60 },
          })
        );
      }

      if (exp.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: exp.description, size: 22 })],
            spacing: { after: 60 },
          })
        );
      }

      const achievements = toStringArray(exp.achievements);
      for (const a of achievements) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${a}`, size: 22 })],
            indent: { left: convertInchesToTwip(0.25) },
            spacing: { after: 40 },
          })
        );
      }
    }
  }

  // ── Education ───────────────────────────────────────────────────────────────
  if (resume.educations.length > 0) {
    children.push(sectionHeading("Education"));
    for (const edu of resume.educations) {
      const dateRange = edu.current ? `${edu.startDate} – Present` : `${edu.startDate} – ${edu.endDate ?? ""}`;
      const degree = edu.fieldOfStudy ? `${edu.degree} in ${edu.fieldOfStudy}` : edu.degree;

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: degree, bold: true, size: 24 }),
            new TextRun({ text: `  •  ${edu.institution}`, size: 24, color: "475569" }),
            new TextRun({ text: `  |  ${dateRange}`, size: 22, color: "94A3B8" }),
          ],
          spacing: { before: 120, after: 40 },
        })
      );

      if (edu.gpa) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 20, color: "475569" })],
            spacing: { after: 40 },
          })
        );
      }
    }
  }

  // ── Skills ──────────────────────────────────────────────────────────────────
  if (resume.skills.length > 0) {
    children.push(sectionHeading("Skills"));

    const categories = [...new Set(resume.skills.map((s) => s.category ?? "General"))];
    for (const cat of categories) {
      const catSkills = resume.skills.filter((s) => (s.category ?? "General") === cat);
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${cat}: `, bold: true, size: 22 }),
            new TextRun({ text: catSkills.map((s) => s.name).join(", "), size: 22 }),
          ],
          spacing: { after: 80 },
        })
      );
    }
  }

  // ── Projects ────────────────────────────────────────────────────────────────
  if (resume.projects.length > 0) {
    children.push(sectionHeading("Projects"));
    for (const proj of resume.projects) {
      const techs = toStringArray(proj.technologies);
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.name, bold: true, size: 24 }),
            ...(proj.url ? [new TextRun({ text: `  (${proj.url})`, size: 20, color: "3B82F6" })] : []),
          ],
          spacing: { before: 120, after: 40 },
        })
      );
      if (proj.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.description, size: 22 })],
            spacing: { after: 40 },
          })
        );
      }
      if (techs.length) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Technologies: ", bold: true, size: 20, color: "475569" }),
              new TextRun({ text: techs.join(", "), size: 20, color: "475569" }),
            ],
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  // ── Certifications ──────────────────────────────────────────────────────────
  if (resume.certifications.length > 0) {
    children.push(sectionHeading("Certifications"));
    for (const cert of resume.certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name, bold: true, size: 24 }),
            new TextRun({ text: `  •  ${cert.issuer}`, size: 22, color: "475569" }),
            new TextRun({ text: `  |  ${cert.issueDate}`, size: 20, color: "94A3B8" }),
          ],
          spacing: { before: 100, after: 60 },
        })
      );
    }
  }

  // ── Languages ───────────────────────────────────────────────────────────────
  if (resume.languages.length > 0) {
    children.push(sectionHeading("Languages"));
    children.push(
      new Paragraph({
        children: resume.languages.flatMap((l, i) => [
          new TextRun({ text: l.name, bold: true, size: 22 }),
          new TextRun({ text: ` (${l.proficiency})`, size: 22, color: "475569" }),
          ...(i < resume.languages.length - 1 ? [new TextRun({ text: "   ", size: 22 })] : []),
        ]),
        spacing: { after: 120 },
      })
    );
  }

  // ── Awards ──────────────────────────────────────────────────────────────────
  if (resume.awards.length > 0) {
    children.push(sectionHeading("Awards & Honors"));
    for (const award of resume.awards) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: award.title, bold: true, size: 24 }),
            ...(award.issuer ? [new TextRun({ text: `  •  ${award.issuer}`, size: 22, color: "475569" })] : []),
            ...(award.date ? [new TextRun({ text: `  |  ${award.date}`, size: 20, color: "94A3B8" })] : []),
          ],
          spacing: { before: 100, after: 60 },
        })
      );
      if (award.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: award.description, size: 22 })],
            spacing: { after: 60 },
          })
        );
      }
    }
  }

  // ── Build Document ──────────────────────────────────────────────────────────
  const doc = new Document({
    creator: "ResumeAI",
    title: resume.title,
    description: `Resume for ${resume.fullName ?? resume.title}`,
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
            color: "1E293B",
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
        heading2: {
          run: {
            font: "Calibri",
            size: 24,
            bold: true,
            color: "1E293B",
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.9),
              right: convertInchesToTwip(0.9),
            },
            size: { orientation: PageOrientation.PORTRAIT },
          },
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
