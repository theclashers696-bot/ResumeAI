"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Pencil,
  Download,
  Trash2,
  Copy,
  Sparkles,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SerializedActivityItem {
  id: string;
  userId: string;
  resumeId: string | null;
  action: string;
  metadata: unknown;
  createdAt: string | Date;
  resume: { id: string; title: string } | null;
}

const actionConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  RESUME_CREATED: { label: "Created resume", icon: FileText, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  RESUME_EDITED: { label: "Edited resume", icon: Pencil, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950" },
  RESUME_DOWNLOADED: { label: "Downloaded resume", icon: Download, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
  RESUME_DELETED: { label: "Deleted a resume", icon: Trash2, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
  RESUME_DUPLICATED: { label: "Duplicated resume", icon: Copy, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
  AI_RESUME_GENERATED: { label: "AI generated resume", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  COVER_LETTER_GENERATED: { label: "Generated cover letter", icon: Mail, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950" },
};

function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface ActivityFeedProps {
  activities: SerializedActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FileText className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No activity yet. Start creating resumes!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((item, i) => {
        const config = actionConfig[item.action] ?? actionConfig.RESUME_EDITED;
        const Icon = config.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
          >
            <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", config.bg)}>
              <Icon className={cn("h-3.5 w-3.5", config.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">{config.label}</span>
                {item.resume && (
                  <span className="text-muted-foreground">
                    {" "}— <span className="font-medium text-foreground">{item.resume.title}</span>
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
