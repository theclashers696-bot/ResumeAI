"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, FileText, Mail, Upload, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { GlobalSearch } from "@/components/search/global-search";
import { useDebouncedCallback } from "use-debounce";

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

const SECTION_LABELS: Record<keyof SearchResults, string> = {
  resumes: "Resumes",
  coverLetters: "Cover Letters",
  imports: "Imports",
  aiHistory: "AI History",
};

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const performSearch = useDebouncedCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = (await res.json()) as {
        data?: { results: SearchResults; total: number };
      };
      setResults(json.data?.results ?? null);
      setTotal(json.data?.total ?? 0);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (query) {
      setLoading(true);
      void performSearch(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount to handle initial q= param

  const sections = results
    ? (Object.entries(results) as [keyof SearchResults, SearchResult[]][]).filter(
        ([, items]) => items.length > 0
      )
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Global Search</h1>
        <p className="text-sm text-muted-foreground">
          Search across all your resumes, cover letters, imports, and AI history.
        </p>
      </div>

      {/* Search bar */}
      <GlobalSearch
        className="w-full"
        placeholder="Search everything…"
      />

      {/* Inline results */}
      <div className="w-full">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (val.length >= 2) setLoading(true);
              void performSearch(val);
            }}
            placeholder="Type to search…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Searching…</p>
        </div>
      )}

      {!loading && results && sections.length === 0 && (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">No results found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try different keywords</p>
        </div>
      )}

      {!loading && !query && (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-3 h-12 w-12 text-muted-foreground/20" />
          <p className="text-muted-foreground">Start typing to search</p>
        </div>
      )}

      {!loading && sections.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <p className="text-sm text-muted-foreground">
            {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>

          {sections.map(([key, items]) => (
            <div key={key} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {SECTION_LABELS[key]}
              </p>
              <div className="space-y-1.5">
                {items.map((item) => {
                  const Icon = TYPE_ICON[item.type];
                  return (
                    <Link key={item.id} href={item.href}>
                      <motion.div
                        whileHover={{ x: 2 }}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/30 hover:bg-accent/30"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          {item.subtitle && (
                            <p className="truncate text-xs text-muted-foreground">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
