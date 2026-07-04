"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X, Link2, Plus, Trash2, Copy, Check, Eye, EyeOff, Clock, Lock,
  Globe, Loader2, QrCode, ExternalLink, ToggleLeft, ToggleRight, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LinkVisibility } from "@prisma/client";
import { QRCodeDisplay } from "@/components/resume/qr-code-display";

interface ShareLink {
  id: string;
  token: string;
  label: string;
  visibility: LinkVisibility;
  expiresAt: string | null;
  maxViews: number | null;
  viewCount: number;
  isActive: boolean;
  createdAt: string;
}

interface ShareDialogProps {
  resumeId: string;
  resumeTitle: string;
  resumeSlug: string;
  isPublic: boolean;
  onClose: () => void;
}

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function VisibilityIcon({ v }: { v: LinkVisibility }) {
  if (v === "PUBLIC") return <Globe className="h-3.5 w-3.5 text-green-600" />;
  if (v === "PASSWORD") return <Lock className="h-3.5 w-3.5 text-amber-600" />;
  return <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />;
}

export function ShareDialog({ resumeId, resumeTitle, resumeSlug, isPublic, onClose }: ShareDialogProps) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [qrFor, setQrFor] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create form state
  const [newLabel, setNewLabel] = useState("Share Link");
  const [newVisibility, setNewVisibility] = useState<LinkVisibility>("PUBLIC");
  const [newPassword, setNewPassword] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newMaxViews, setNewMaxViews] = useState("");
  const [createError, setCreateError] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/resumes/${resumeId}/share`);
      const j = await r.json() as { data?: ShareLink[] };
      setLinks(j.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => { void loadLinks(); }, [loadLinks]);

  const createLink = async () => {
    if (newVisibility === "PASSWORD" && !newPassword) {
      setCreateError("Password is required for password-protected links.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const r = await fetch(`/api/resumes/${resumeId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newLabel,
          visibility: newVisibility,
          password: newVisibility === "PASSWORD" ? newPassword : undefined,
          expiresAt: newExpiry || undefined,
          maxViews: newMaxViews ? parseInt(newMaxViews, 10) : undefined,
        }),
      });
      const j = await r.json() as { error?: string };
      if (j.error) { setCreateError(j.error); return; }
      setShowCreate(false);
      setNewLabel("Share Link");
      setNewVisibility("PUBLIC");
      setNewPassword("");
      setNewExpiry("");
      setNewMaxViews("");
      await loadLinks();
    } finally {
      setCreating(false);
    }
  };

  const deleteLink = async (linkId: string) => {
    await fetch(`/api/resumes/${resumeId}/share?linkId=${linkId}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  const toggleLink = async (link: ShareLink) => {
    await fetch(`/api/resumes/${resumeId}/share`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId: link.id, isActive: !link.isActive }),
    });
    setLinks((prev) => prev.map((l) => l.id === link.id ? { ...l, isActive: !l.isActive } : l));
  };

  const copyLink = (token: string) => {
    const url = `${baseUrl}/share/${token}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const publicPageUrl = `${baseUrl}/r/${resumeSlug}`;

  if (qrFor) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <QRCodeDisplay
          url={qrFor}
          title={resumeTitle}
          onClose={() => setQrFor(null)}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Share Resume</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Public page section */}
          {isPublic && (
            <div className="border-b border-border p-6">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Public Resume Page</p>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <Globe className="h-4 w-4 shrink-0 text-green-600" />
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{publicPageUrl}</span>
                <button onClick={() => copyLink(resumeSlug)} className="shrink-0">
                  {copiedId === resumeSlug ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />}
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setQrFor(publicPageUrl)}>
                  <QrCode className="h-3.5 w-3.5" />
                  QR Code
                </Button>
                <a href={publicPageUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Share links */}
          <div className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Share Links</p>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
                <Plus className="h-3.5 w-3.5" />
                New link
              </Button>
            </div>

            {/* Create form */}
            {showCreate && (
              <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="mb-3 text-sm font-medium">New Share Link</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Label</label>
                    <input
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Visibility</label>
                    <div className="flex gap-2">
                      {(["PUBLIC", "PASSWORD"] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => setNewVisibility(v)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                            newVisibility === v ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"
                          )}
                        >
                          <VisibilityIcon v={v} />
                          {v === "PUBLIC" ? "Public" : "Password"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {newVisibility === "PASSWORD" && (
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Set a password"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-muted-foreground">Expires (optional)</label>
                      <input
                        type="date"
                        value={newExpiry}
                        onChange={(e) => setNewExpiry(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-muted-foreground">Max views (optional)</label>
                      <input
                        type="number"
                        value={newMaxViews}
                        onChange={(e) => setNewMaxViews(e.target.value)}
                        min="1"
                        placeholder="Unlimited"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {createError && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {createError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
                    <Button size="sm" onClick={() => { void createLink(); }} disabled={creating} className="gap-1.5">
                      {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Links list */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : links.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Link2 className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No share links yet. Create one to start sharing.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {links.map((link) => {
                  const url = `${baseUrl}/share/${link.token}`;
                  const expired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;
                  const atLimit = link.maxViews ? link.viewCount >= link.maxViews : false;

                  return (
                    <div
                      key={link.id}
                      className={cn(
                        "rounded-lg border border-border bg-muted/20 p-3 transition-opacity",
                        (!link.isActive || expired || atLimit) && "opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <VisibilityIcon v={link.visibility} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{link.label}</span>
                            {expired && <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">Expired</span>}
                            {atLimit && !expired && <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-600">Limit reached</span>}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{url}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{link.viewCount} views</span>
                            {link.expiresAt && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Expires {formatDate(link.expiresAt)}</span>}
                            {link.maxViews && <span>{link.maxViews - link.viewCount} remaining</span>}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button onClick={() => copyLink(link.token)} title="Copy link" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                            {copiedId === link.token ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => setQrFor(url)} title="QR code" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <QrCode className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { void toggleLink(link); }} title={link.isActive ? "Deactivate" : "Activate"} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                            {link.isActive ? <ToggleRight className="h-3.5 w-3.5 text-green-600" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => { void deleteLink(link.id); }} title="Delete link" className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
