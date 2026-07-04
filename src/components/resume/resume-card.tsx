"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FileText,
  Globe,
  Lock,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Star,
  Archive,
  ArchiveRestore,
  Download,
  Share2,
  Type,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatFullDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ResumeListItem } from "@/types";

interface ResumeCardProps {
  resume: ResumeListItem;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onFavorite?: (id: string, value: boolean) => void;
  onArchive?: (id: string, value: boolean) => void;
  onRename?: (id: string, title: string) => void;
}

function atsColor(score: number) {
  if (score === 0) return "bg-muted";
  if (score < 50) return "bg-red-500";
  if (score < 75) return "bg-amber-500";
  if (score < 90) return "bg-blue-500";
  return "bg-green-500";
}

function atsLabel(score: number) {
  if (score === 0) return "Not scored";
  if (score < 50) return "Needs work";
  if (score < 75) return "Fair";
  if (score < 90) return "Good";
  return "Excellent";
}

const templateColors: Record<string, string> = {
  modern: "from-blue-500 to-indigo-500",
  classic: "from-slate-500 to-slate-700",
  minimal: "from-teal-500 to-emerald-500",
  creative: "from-purple-500 to-pink-500",
  executive: "from-gray-600 to-gray-800",
};

export function ResumeCard({
  resume,
  onDelete,
  onDuplicate,
  onFavorite,
  onArchive,
  onRename,
}: ResumeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(resume.title);
  const [deleting, setDeleting] = useState(false);
  const [renaming, setRenaming] = useState(false);

  const gradient = templateColors[resume.template] ?? "from-blue-500 to-indigo-500";

  async function handleRename() {
    if (!renameValue.trim() || renameValue === resume.title) {
      setRenameOpen(false);
      return;
    }
    setRenaming(true);
    onRename?.(resume.id, renameValue.trim());
    setRenameOpen(false);
    setRenaming(false);
  }

  async function handleDelete() {
    setDeleting(true);
    onDelete?.(resume.id);
    setDeleteOpen(false);
    setDeleting(false);
  }

  const menuItems = [
    {
      label: "Open",
      icon: ExternalLink,
      href: `/resumes/${resume.id}/edit`,
    },
    {
      label: "Edit",
      icon: Pencil,
      href: `/resumes/${resume.id}/edit`,
    },
    { label: "Rename", icon: Type, action: () => { setMenuOpen(false); setRenameValue(resume.title); setRenameOpen(true); } },
    { label: "Duplicate", icon: Copy, action: () => { setMenuOpen(false); onDuplicate?.(resume.id); } },
    {
      label: resume.isFavorite ? "Unfavorite" : "Favorite",
      icon: Star,
      action: () => { setMenuOpen(false); onFavorite?.(resume.id, !resume.isFavorite); },
    },
    {
      label: resume.isArchived ? "Restore" : "Archive",
      icon: resume.isArchived ? ArchiveRestore : Archive,
      action: () => { setMenuOpen(false); onArchive?.(resume.id, !resume.isArchived); },
    },
    { label: "Download PDF", icon: Download, action: () => setMenuOpen(false), disabled: true },
    { label: "Share", icon: Share2, action: () => setMenuOpen(false), disabled: true },
    { label: "Delete", icon: Trash2, action: () => { setMenuOpen(false); setDeleteOpen(true); }, destructive: true },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
        layout
        className={cn("group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg", resume.isArchived && "opacity-60")}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {resume.thumbnailUrl ? (
            <Image
              src={resume.thumbnailUrl}
              alt={resume.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          ) : (
            <div className={cn("flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br", gradient)}>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <p className="text-sm font-semibold capitalize text-white/90">{resume.template}</p>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

          {/* Favorite toggle on hover */}
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite?.(resume.id, !resume.isFavorite); }}
            className={cn(
              "absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-sm transition-all",
              resume.isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            aria-label="Toggle favorite"
          >
            <Star className={cn("h-3.5 w-3.5", resume.isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </button>

          {/* Actions menu */}
          <div className="absolute right-2 top-2">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Resume actions"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
                    {menuItems.map((item, i) => {
                      const Icon = item.icon;
                      if ("href" in item && item.href) {
                        return (
                          <Link
                            key={i}
                            href={item.href}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent"
                            onClick={() => setMenuOpen(false)}
                          >
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.label}
                          </Link>
                        );
                      }
                      if ("action" in item) {
                        const isDestructive = "destructive" in item && item.destructive;
                        const isDisabled = "disabled" in item && item.disabled;
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={isDisabled}
                            onClick={item.action}
                            className={cn(
                              "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-40",
                              isDestructive && "text-destructive hover:bg-destructive/10"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {item.label}
                            {isDisabled && <span className="ml-auto text-[10px] uppercase text-muted-foreground">Soon</span>}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ATS score badge */}
          {resume.atsScore > 0 && (
            <div className="absolute bottom-2 right-2">
              <div className="rounded-full bg-background/90 px-2 py-0.5 shadow-sm backdrop-blur-sm">
                <span className={cn("text-xs font-bold", resume.atsScore >= 75 ? "text-green-600" : resume.atsScore >= 50 ? "text-amber-600" : "text-red-600")}>
                  {resume.atsScore}%
                </span>
              </div>
            </div>
          )}

          {/* Archived badge */}
          {resume.isArchived && (
            <div className="absolute left-2 bottom-2 rounded-full bg-background/90 px-2 py-0.5 shadow-sm backdrop-blur-sm">
              <span className="text-xs font-medium text-muted-foreground">Archived</span>
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-3">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold">{resume.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Edited {formatFullDate(resume.updatedAt)}
              </p>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge variant={resume.isPublic ? "success" : "secondary"} className="text-xs">
              {resume.isPublic ? <Globe className="mr-1 h-2.5 w-2.5" /> : <Lock className="mr-1 h-2.5 w-2.5" />}
              {resume.isPublic ? "Public" : "Private"}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {resume.template}
            </Badge>
          </div>

          {/* ATS score bar */}
          {resume.atsScore > 0 && (
            <div className="mt-2.5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">ATS Score</span>
                <span className="text-[10px] font-medium">{atsLabel(resume.atsScore)}</span>
              </div>
              <Progress
                value={resume.atsScore}
                className="h-1.5"
                indicatorClassName={atsColor(resume.atsScore)}
              />
            </div>
          )}

          <div className="mt-3">
            <Link href={`/resumes/${resume.id}/edit`}>
              <Button size="sm" variant="outline" className="h-7 w-full text-xs">
                <Pencil className="h-3 w-3" />
                Edit Resume
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent open={renameOpen} onOpenChange={setRenameOpen}>
          <DialogHeader>
            <DialogTitle>Rename Resume</DialogTitle>
            <DialogDescription>Enter a new name for this resume.</DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
            maxLength={100}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button onClick={handleRename} isLoading={renaming} disabled={!renameValue.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{resume.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
