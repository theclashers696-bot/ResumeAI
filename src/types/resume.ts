export interface PersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  portfolio: string;
  github: string;
  linkedin: string;
  twitter: string;
  photoUrl: string;
  summary: string;
}

export interface WorkExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  order: number;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
  description: string;
  order: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  rating: number;
  order: number;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  url: string;
  github: string;
  technologies: string[];
  images: string[];
  startDate: string;
  endDate: string;
  order: number;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  url: string;
  order: number;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string;
  order: number;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  order: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date: string;
  order: number;
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  order: number;
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
  description: string;
  order: number;
}

export interface InterestItem {
  id: string;
  name: string;
  order: number;
}

export interface ReferenceItem {
  id: string;
  name: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  order: number;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  content: CustomSectionEntry[];
  order: number;
}

export interface CustomSectionEntry {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export interface ResumeTheme {
  themeColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  pageMargin: number;
  headerStyle: string;
  showIcons: boolean;
  // Milestone 5 extended fields (optional for backward compatibility)
  secondaryColor?: string;
  accentColor?: string;
  photoShape?: "circle" | "square" | "rounded";
  sectionStyle?: "line" | "box" | "underline" | "caps" | "none";
  borderRadius?: number;
  showDividers?: boolean;
  columnLayout?: "single" | "two-column" | "hybrid";
  watermark?: boolean;
}

export interface ResumeVersion {
  id: string;
  label: string;
  createdAt: string;
  snapshot: ResumeData;
}

export interface ResumeData {
  id: string;
  title: string;
  slug?: string;
  template: string;
  isPublic: boolean;
  sectionOrder: string[];
  personal: PersonalInfo;
  theme: ResumeTheme;
  workExperiences: WorkExperienceItem[];
  educations: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  awards: AwardItem[];
  achievements: AchievementItem[];
  volunteerWork: VolunteerItem[];
  publications: PublicationItem[];
  interests: InterestItem[];
  references: ReferenceItem[];
  customSections: CustomSectionItem[];
}

export const SECTION_LABELS: Record<string, string> = {
  summary: "Professional Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  awards: "Awards",
  achievements: "Achievements",
  volunteer: "Volunteer Work",
  publications: "Publications",
  interests: "Interests",
  references: "References",
};

export const DEFAULT_SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "awards",
  "achievements",
  "volunteer",
  "publications",
  "interests",
  "references",
];

export const DEFAULT_THEME: ResumeTheme = {
  themeColor: "#3B82F6",
  fontFamily: "inter",
  fontSize: 14,
  lineHeight: 1.5,
  pageMargin: 40,
  headerStyle: "classic",
  showIcons: true,
  secondaryColor: "#1E293B",
  accentColor: "#3B82F6",
  photoShape: "circle",
  sectionStyle: "line",
  borderRadius: 4,
  showDividers: true,
  columnLayout: "single",
  watermark: true,
};

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Remote",
  "Hybrid",
];

export const LANGUAGE_PROFICIENCY = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Basic",
  "Elementary",
];

export const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

export const ACCENT_COLORS = [
  { label: "Blue", value: "#3B82F6" },
  { label: "Indigo", value: "#6366F1" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Pink", value: "#EC4899" },
  { label: "Rose", value: "#F43F5E" },
  { label: "Orange", value: "#F97316" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Green", value: "#10B981" },
  { label: "Teal", value: "#14B8A6" },
  { label: "Cyan", value: "#06B6D4" },
  { label: "Slate", value: "#475569" },
  { label: "Black", value: "#0F172A" },
];

export const FONT_OPTIONS = [
  { label: "Inter", value: "inter" },
  { label: "Roboto", value: "roboto" },
  { label: "Open Sans", value: "opensans" },
  { label: "Lato", value: "lato" },
  { label: "Poppins", value: "poppins" },
  { label: "Nunito", value: "nunito" },
  { label: "Merriweather", value: "merriweather" },
  { label: "Playfair Display", value: "playfair" },
  { label: "Source Serif", value: "sourceserif" },
  { label: "Georgia", value: "georgia" },
];

export const FONT_MAP: Record<string, string> = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  opensans: "'Open Sans', sans-serif",
  lato: "'Lato', sans-serif",
  poppins: "'Poppins', sans-serif",
  nunito: "'Nunito', sans-serif",
  merriweather: "'Merriweather', serif",
  playfair: "'Playfair Display', serif",
  sourceserif: "'Source Serif Pro', serif",
  georgia: "Georgia, serif",
};

export const COLOR_PRESETS = [
  { label: "Ocean Blue", primary: "#2563EB", secondary: "#1E3A5F" },
  { label: "Royal Purple", primary: "#7C3AED", secondary: "#2D1B69" },
  { label: "Forest Green", primary: "#059669", secondary: "#064E3B" },
  { label: "Midnight", primary: "#0F172A", secondary: "#1E293B" },
  { label: "Professional", primary: "#3B82F6", secondary: "#1E40AF" },
  { label: "Minimal", primary: "#374151", secondary: "#111827" },
  { label: "Startup", primary: "#EC4899", secondary: "#7C3AED" },
  { label: "Corporate", primary: "#0369A1", secondary: "#0C4A6E" },
  { label: "Warm", primary: "#D97706", secondary: "#92400E" },
  { label: "Teal", primary: "#0D9488", secondary: "#115E59" },
];

export const TEMPLATES = [
  { id: "modern", label: "Modern", description: "Colored header & clean layout", category: "popular" },
  { id: "classic", label: "Classic", description: "Two-column traditional", category: "popular" },
  { id: "minimal", label: "Minimal", description: "Clean & white-space focused", category: "popular" },
  { id: "creative", label: "Creative", description: "Bold sidebar design", category: "creative" },
  { id: "executive", label: "Executive", description: "Dark luxury header", category: "professional" },
  { id: "corporate", label: "Corporate", description: "Blue structured two-column", category: "professional" },
  { id: "developer", label: "Developer", description: "Code-themed dark sidebar", category: "creative" },
  { id: "designer", label: "Designer", description: "Visual color sidebar", category: "creative" },
  { id: "student", label: "Student", description: "Education-forward clean", category: "popular" },
  { id: "business", label: "Business", description: "Traditional serif formal", category: "professional" },
  { id: "elegant", label: "Elegant", description: "Serif & refined thin lines", category: "professional" },
  { id: "ats", label: "ATS Optimized", description: "Maximum ATS compatibility", category: "professional" },
  { id: "startup", label: "Startup", description: "Bold gradient header", category: "creative" },
  { id: "international", label: "International", description: "European CV style", category: "professional" },
  { id: "bold", label: "Bold", description: "Dramatic typographic statement", category: "creative" },
];
