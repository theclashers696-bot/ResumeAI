import { z } from "zod";

export const resumeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  summary: z.string().max(1000, "Summary must be under 1000 characters").optional(),
  template: z.enum(["modern", "classic", "minimal", "creative"]).default("modern"),
  isPublic: z.boolean().default(false),
});

export const workExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().max(2000, "Description is too long").optional(),
  achievements: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  gpa: z.string().optional(),
  description: z.string().max(1000, "Description is too long").optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(50, "Skill name is too long"),
  category: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).default("INTERMEDIATE"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().max(1000, "Description is too long").optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  technologies: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type ResumeInput = z.infer<typeof resumeSchema>;
export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
