"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Mail, Upload, Sparkles, Clock, X, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "resume" | "cover-letter" | "import" | "ai-history";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  date: string;
}

interface SearchResults {
  resumes: SearchResult[];
  coverLetters: SearchResult[];
  imports: SearchResult[];
  aiHistory: SearchResult[];
}

const TYPE_ICON: Record<SearchResult["type"], React.ComponentType<{ className?: string }>> = {
  resume: FileText,
  "cover-letter": Mail,
  import: Upload,
  "ai-history": Sparkles,
};

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  resume: "Resume",
  "cover-letter": "Cover Letter",
  import: "Import",
  "ai-history": "AI History",
};

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

export function GlobalSearch({ className, placeholder = "Search resumes, cover letters, imports…" }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/search/history")
      .then((r) => r.json())
      .then((j: { data?: { query: string }[] }) => {
        setRecentSearches((j.data ?? []).map((h) => h.query).slice(0, 5));
      })
      .catch(() => undefined);
  }, []);

  const performSearch = useDebouncedCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = (await res.json()) as { data?: { results: SearchResults } };
      setResults(json.data?.results ?? null);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2) setLoading(true);
    void performSearch(val);
  };

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setQuery("");
      setResults(null);
    },
    [router]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allResults: SearchResult[] = results
    ? [
        ...results.resumes,
        ...results.coverLetters,
        ...results.imports,
        ...results.aiHistory,
      ]
    : [];

  const hasResults = allResults.length > 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 transition-all",
          open && "border-primary/50 bg-background shadow-sm"
        )}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuery("");
              setResults(null);
              setLoading(false);
              inputRef.current?.focus();
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {!query && (
          <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-1 w-full min-w-[340px] overflow-hidden rounded-xl border border-border bg-popover shadow-xl"
          >
            {/* No query yet: show recent searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Recent
                </p>
                {recentSearches.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuery(q);
                      void performSearch(q);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* No query + no recent */}
            {!query && recentSearches.length === 0 && (
              <div className="p-6 text-center">
                <Search className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Search across resumes, cover letters, imports, and AI history
                </p>
              </div>
            )}

            {/* Loading */}
            {query && loading && (
              <div className="flex items-center justify-center gap-2 p-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Searching…</p>
              </div>
            )}

            {/* Results */}
            {query && !loading && hasResults && (
              <div className="max-h-80 overflow-y-auto p-2">
                {allResults.map((result) => {
                  const Icon = TYPE_ICON[result.type];
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleNavigate(result.href)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-accent"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{result.title}</p>
                        {result.subtitle && (
                          <p className="truncate text-xs text-muted-foreground">
                            {TYPE_LABEL[result.type]} · {result.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {query && !loading && !hasResults && results !== null && (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
