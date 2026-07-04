import type React from "react";
import type {
  User,
  Resume,
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  Profile,
  SkillLevel,
  Notification,
  ResumeActivity,
  NotificationType,
  ActivityAction,
} from "@prisma/client";

export type { SkillLevel, NotificationType, ActivityAction };

export type SafeUser = Omit<User, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type ResumeWithRelations = Resume & {
  workExperiences: WorkExperience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  user?: Pick<User, "name" | "email" | "image">;
};

export type ResumeListItem = Pick<
  Resume,
  | "id"
  | "title"
  | "slug"
  | "isPublic"
  | "template"
  | "thumbnailUrl"
  | "atsScore"
  | "isFavorite"
  | "isArchived"
  | "downloadCount"
  | "createdAt"
  | "updatedAt"
>;

export type ProfileWithUser = Profile & {
  user: Pick<User, "name" | "email" | "image">;
};

export type NotificationItem = Pick<
  Notification,
  "id" | "title" | "body" | "type" | "isRead" | "href" | "createdAt"
>;

export type ActivityItem = ResumeActivity & {
  resume: Pick<Resume, "id" | "title"> | null;
};

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ResumeTemplate = "modern" | "classic" | "minimal" | "creative";

export type NavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
};

export type SidebarGroup = {
  title: string;
  items: NavItem[];
};

export type ToastVariant = "default" | "success" | "error" | "warning";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

export type DashboardStats = {
  totalResumes: number;
  downloadedPDFs: number;
  avgAtsScore: number;
  aiCreditsUsed: number;
  favoriteCount: number;
};

export type ChartDataPoint = {
  month: string;
  resumes: number;
  downloads: number;
};
