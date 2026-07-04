import type { Prisma } from "@prisma/client";

export interface ParsedResume {
  fullName?: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  summary?: string;
  workExperiences: ParsedWorkExperience[];
  educations: ParsedEducation[];
  skills: ParsedSkill[];
  projects: ParsedProject[];
  certifications: ParsedCertification[];
  languages: ParsedLanguage[];
  awards: ParsedAward[];
  achievements: ParsedAchievement[];
  references: ParsedReference[];
}

export interface ParsedWorkExperience {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  achievements: string[];
  technologies: string[];
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  description?: string;
}

export interface ParsedSkill {
  name: string;
  category?: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
}

export interface ParsedProject {
  name: string;
  description?: string;
  url?: string;
  github?: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
}

export interface ParsedCertification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface ParsedLanguage {
  name: string;
  proficiency: string;
}

export interface ParsedAward {
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface ParsedAchievement {
  title: string;
  description?: string;
  date?: string;
}

export interface ParsedReference {
  name: string;
  company?: string;
  position?: string;
  phone?: string;
  email?: string;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    /* eslint-disable */
    const pdfParse = (require("pdf-parse") as unknown) as (
      buf: Buffer,
      opts?: { max?: number }
    ) => Promise<{ text: string }>;
    /* eslint-enable */
    const data = await pdfParse(buffer, { max: 0 });
    return data.text ?? "";
  } catch (err) {
    console.error("[resume-parser] PDF extraction failed:", err);
    throw new Error("Failed to extract text from PDF");
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? "";
  } catch (err) {
    console.error("[resume-parser] DOCX extraction failed:", err);
    throw new Error("Failed to extract text from DOCX");
  }
}

export function extractTextFromTXT(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

export function parseResumeJSON(buffer: Buffer): ParsedResume {
  try {
    const json = JSON.parse(buffer.toString("utf-8")) as Record<string, unknown>;
    return normalizeJSONResume(json);
  } catch {
    throw new Error("Invalid JSON file — could not parse resume data");
  }
}

function normalizeJSONResume(json: Record<string, unknown>): ParsedResume {
  return {
    fullName: safeString(json.fullName),
    headline: safeString(json.headline),
    email: safeString(json.email),
    phone: safeString(json.phone),
    location: safeString(json.location),
    website: safeString(json.website),
    portfolio: safeString(json.portfolio),
    github: safeString(json.github),
    linkedin: safeString(json.linkedin),
    twitter: safeString(json.twitter),
    summary: safeString(json.summary),
    workExperiences: safeArray<ParsedWorkExperience>(json.workExperiences),
    educations: safeArray<ParsedEducation>(json.educations),
    skills: safeArray<ParsedSkill>(json.skills),
    projects: safeArray<ParsedProject>(json.projects),
    certifications: safeArray<ParsedCertification>(json.certifications),
    languages: safeArray<ParsedLanguage>(json.languages),
    awards: safeArray<ParsedAward>(json.awards),
    achievements: safeArray<ParsedAchievement>(json.achievements),
    references: safeArray<ParsedReference>(json.references),
  };
}

function safeString(val: unknown): string | undefined {
  if (typeof val === "string" && val.trim()) return val.trim();
  return undefined;
}

function safeArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  return [];
}

export type SupportedFileType = "pdf" | "docx" | "txt" | "json";

export function detectFileType(fileName: string, mimeType: string): SupportedFileType | null {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "pdf" || mimeType === "application/pdf") return "pdf";
  if (
    ext === "docx" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx";
  if (ext === "txt" || mimeType === "text/plain") return "txt";
  if (ext === "json" || mimeType === "application/json") return "json";

  return null;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/json",
];

export function validateFile(
  fileName: string,
  mimeType: string,
  size: number
): { valid: true } | { valid: false; error: string } {
  const fileType = detectFileType(fileName, mimeType);
  if (!fileType) {
    return {
      valid: false,
      error: "Unsupported file type. Please upload a PDF, DOCX, TXT, or JSON file.",
    };
  }
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
    };
  }
  return { valid: true };
}

export async function extractText(
  buffer: Buffer,
  fileType: SupportedFileType
): Promise<string> {
  switch (fileType) {
    case "pdf":
      return extractTextFromPDF(buffer);
    case "docx":
      return extractTextFromDOCX(buffer);
    case "txt":
      return extractTextFromTXT(buffer);
    case "json":
      return buffer.toString("utf-8");
    default:
      throw new Error("Unsupported file type");
  }
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, 50000);
}

export type ParsedResumeJson = Prisma.InputJsonValue & ParsedResume;
