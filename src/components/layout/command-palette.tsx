"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  FileText,
  Plus,
  User,
  Settings,
  Sparkles,
  Mail,
  LogOut,
  X,
} from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  action: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useSidebar();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const { signOut } = useAuth();

  const go = useCallback(
    (path: string) => {
      router.push(path);
      setCommandOpen(false);
      setQuery("");
    },
    [router, setCommandOpen]
  );

  const commands: CommandItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      group: "Navigate",
      action: () => go("/dashboard"),
    },
    {
      id: "resumes",
      label: "My Resumes",
      icon: FileText,
      group: "Navigate",
      action: () => go("/resumes"),
    },
    {
      id: "new-resume",
      label: "Create New Resume",
      description: "Start from scratch",
      icon: Plus,
      group: "Actions",
      action: () => go("/resumes/new"),
      keywords: "create build new resume",
    },
    {
      id: "ai-studio",
      label: "AI Studio",
      description: "Generate with AI",
      icon: Sparkles,
      group: "Actions",
      action: () => go("/ai-studio"),
      keywords: "ai generate studio",
    },
    {
      id: "cover-letters",
      label: "Cover Letters",
      icon: Mail,
      group: "Navigate",
      action: () => go("/cover-letters"),
    },
    {
      id: "profile",
      label: "Profile",
      description: "Edit your profile",
      icon: User,
      group: "Account",
      action: () => go("/profile"),
    },
    {
      id: "settings",
      label: "Settings",
      description: "Manage your settings",
      icon: Settings,
      group: "Account",
      action: () => go("/settings"),
    },
    {
      id: "logout",
      label: "Sign Out",
      icon: LogOut,
      group: "Account",
      action: async () => {
        await signOut();
        router.push("/");
        setCommandOpen(false);
      },
    },
  ];

  const filtered = query
    ? commands.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.keywords?.includes(q)
        );
      })
    : commands;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setCommandOpen]);

  useEffect(() => {
    if (!commandOpen) {
      setQuery("");
      setSelected(0);
    }
  }, [commandOpen]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      filtered[selected]?.action();
    } else if (e.key === "Escape") {
      setCommandOpen(false);
    }
  }

  let flatIndex = 0;

  return (
    <AnimatePresence>
      {commandOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setCommandOpen(false)}
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-1/2 top-[20vh] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search commands, pages, actions..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setCommandOpen(false)}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No commands found for &ldquo;{query}&rdquo;
                </p>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group} className="mb-2">
                    <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {group}
                    </p>
                    {items.map((item) => {
                      const idx = flatIndex++;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={item.action}
                          onMouseEnter={() => setSelected(idx)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                            selected === idx ? "bg-accent text-accent-foreground" : "text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{item.label}</p>
                            {item.description && (
                              <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border px-4 py-2">
              <p className="text-[11px] text-muted-foreground">
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd> navigate
                {" · "}
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">↵</kbd> select
                {" · "}
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">esc</kbd> close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
