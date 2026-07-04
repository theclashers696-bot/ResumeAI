"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Sparkles, Upload, Mail } from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";

const actions = [
  {
    icon: Plus,
    label: "Create Resume",
    description: "Start from scratch",
    href: "/resumes/new",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    iconColor: "text-blue-600",
  },
  {
    icon: Sparkles,
    label: "Generate with AI",
    description: "AI-powered creation",
    href: null,
    gradient: "from-purple-500 to-pink-600",
    bg: "bg-purple-50 dark:bg-purple-950",
    iconColor: "text-purple-600",
    soon: true,
  },
  {
    icon: Upload,
    label: "Import Resume",
    description: "Upload existing PDF",
    href: null,
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    iconColor: "text-emerald-600",
    soon: true,
  },
  {
    icon: Mail,
    label: "Cover Letter",
    description: "AI cover letter",
    href: null,
    gradient: "from-orange-500 to-amber-600",
    bg: "bg-orange-50 dark:bg-orange-950",
    iconColor: "text-orange-600",
    soon: true,
  },
];

export function QuickActions() {
  const { setCommandOpen } = useSidebar();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action, i) => {
        const Icon = action.icon;
        const inner = (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            whileHover={!action.soon ? { y: -2, transition: { duration: 0.15 } } : undefined}
            className="group relative flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border border-border bg-background p-4 text-center shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.bg}`}
            >
              <Icon className={`h-5 w-5 ${action.iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-semibold">{action.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
            </div>
            {action.soon && (
              <span className="absolute right-2 top-2 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Soon
              </span>
            )}
          </motion.div>
        );

        if (action.href) {
          return (
            <Link key={action.label} href={action.href}>
              {inner}
            </Link>
          );
        }

        if (action.label === "Generate with AI") {
          return (
            <div key={action.label} onClick={() => setCommandOpen(true)}>
              {inner}
            </div>
          );
        }

        return <div key={action.label}>{inner}</div>;
      })}
    </div>
  );
}
