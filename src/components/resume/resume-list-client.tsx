"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  SlidersHorizontal,
  FileText,
  Sparkles,
  Star,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResumeCard } from "@/components/resume/resume-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastContext } from "@/components/ui/toaster";
import type { ResumeListItem } from "@/types";
import { cn } from "@/lib/utils";

type FilterType = "all" | "favorites" | "archived" | string;
type SortType = "newest" | "oldest" | "alpha" | "ats";

const sortOptions: { value: SortType; label: string }[] = [
  { value: "newest", label: "Recently Edited" },
  { value: "oldest", label: "Oldest First" },
  { value: "alpha", label: "Alphabetically" },
  { value: "ats", label: "Highest ATS Score" },
];

const filterOptions = [
  { value: "all", label: "All Resumes", icon: FileText },
  { value: "favorites", label: "Favorites", icon: Star },
  { value: "archived", label: "Archived", icon: Archive },
];

interface ResumeListClientProps {
  initialResumes: ResumeListItem[];
}

export function ResumeListClient({ initialResumes }: ResumeListClientProps) {
  const [items, setItems] = useState<ResumeListItem[]>(initialResumes);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const { toast } = useToastContext();

  const filtered = useMemo(() => {
    let result = [...items];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(q));
    }

    if (filter === "favorites") result = result.filter((r) => r.isFavorite && !r.isArchived);
    else if (filter === "archived") result = result.filter((r) => r.isArchived);
    else result = result.filter((r) => !r.isArchived);

    switch (sort) {
      case "newest":
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "alpha":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "ats":
        result.sort((a, b) => b.atsScore - a.atsScore);
        break;
    }

    return result;
  }, [items, search, filter, sort]);

  const handleDelete = useCallback(async (id: string) => {
    const prev = [...items];
    setItems((i) => i.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Resume deleted", variant: "success" });
    } catch {
      setItems(prev);
      toast({ title: "Failed to delete resume", variant: "error" });
    }
  }, [items, toast]);

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { data?: ResumeListItem };
      if (data.data) {
        setItems((prev) => [data.data!, ...prev]);
        toast({ title: "Resume duplicated", variant: "success" });
      }
    } catch {
      toast({ title: "Failed to duplicate resume", variant: "error" });
    }
  }, [toast]);

  const handleFavorite = useCallback(async (id: string, value: boolean) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, isFavorite: value } : r)));
    try {
      const res = await fetch(`/api/resumes/${id}/favorite`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, isFavorite: !value } : r)));
      toast({ title: "Failed to update favorite", variant: "error" });
    }
  }, [toast]);

  const handleArchive = useCallback(async (id: string, value: boolean) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, isArchived: value } : r)));
    try {
      const res = await fetch(`/api/resumes/${id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: value }),
      });
      if (!res.ok) throw new Error();
      toast({ title: value ? "Resume archived" : "Resume restored", variant: "success" });
    } catch {
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, isArchived: !value } : r)));
      toast({ title: "Failed to update archive status", variant: "error" });
    }
  }, [toast]);

  const handleRename = useCallback(async (id: string, title: string) => {
    const prev = items.find((r) => r.id === id)?.title ?? "";
    setItems((p) => p.map((r) => (r.id === id ? { ...r, title } : r)));
    try {
      const res = await fetch(`/api/resumes/${id}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Resume renamed", variant: "success" });
    } catch {
      setItems((p) => p.map((r) => (r.id === id ? { ...r, title: prev } : r)));
      toast({ title: "Failed to rename resume", variant: "error" });
    }
  }, [items, toast]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resumes..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter pills */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {filter !== "all" && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-border bg-background shadow-xl">
                  <div className="p-1">
                    {filterOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => { setFilter(opt.value); setFilterOpen(false); }}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                            filter === opt.value && "bg-accent font-medium"
                          )}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-border p-2">
                    <p className="mb-1 px-2 text-[10px] font-semibold uppercase text-muted-foreground">Sort by</p>
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSort(opt.value); setFilterOpen(false); }}
                        className={cn(
                          "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                          sort === opt.value && "bg-accent font-medium"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              onClick={() => setView("grid")}
              className={cn("rounded-md p-1.5 transition-colors", view === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("rounded-md p-1.5 transition-colors", view === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Link href="/resumes/new">
            <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4" />
              New Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* Result count */}
      {search && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-[400px] flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              {search ? "No resumes found" : filter === "favorites" ? "No favorites yet" : filter === "archived" ? "Nothing archived" : "No resumes yet"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {search
                ? `No resumes match "${search}". Try a different search term.`
                : filter === "favorites"
                ? "Star a resume to add it to your favorites."
                : filter === "archived"
                ? "Archived resumes will appear here."
                : "Create your first resume and let AI help you land interviews."}
            </p>
          </div>
          {!search && filter === "all" && (
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/resumes/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Resume
                </Button>
              </Link>
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Grid */}
      {filtered.length > 0 && view === "grid" && (
        <AnimatePresence mode="popLayout">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onFavorite={handleFavorite}
                onArchive={handleArchive}
                onRename={handleRename}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* List view */}
      {filtered.length > 0 && view === "list" && (
        <div className="space-y-2">
          {filtered.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{resume.title}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {resume.template} · Updated {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
              </div>
              {resume.atsScore > 0 && (
                <span className="hidden text-sm font-semibold sm:block">
                  {resume.atsScore}% ATS
                </span>
              )}
              {resume.isFavorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
              <Link href={`/resumes/${resume.id}/edit`}>
                <Button size="sm" variant="outline" className="shrink-0">
                  Edit
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ResumeListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
      </div>
    </div>
  );
}
