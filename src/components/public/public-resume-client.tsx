"use client";

import Link from "next/link";
import { ExternalLink, Download, Share2, Globe, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ResumePreview } from "@/components/resume/resume-preview";
import type { ResumeData } from "@/types/resume";

interface PublicResumeClientProps {
  data: ResumeData;
  ownerName: string | null;
}

export function PublicResumeClient({ data, ownerName }: PublicResumeClientProps) {
  const name = data.personal.fullName || ownerName || data.title;
  const [copied, setCopied] = useState(false);

  const handlePrint = () => window.print();

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .resume-page { box-shadow: none !important; border-radius: 0 !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>

      {/* Top bar */}
      <header className="no-print sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
              <Globe className="h-5 w-5" />
              <span className="hidden sm:block">ResumeAI</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="max-w-[160px] truncate text-sm font-medium sm:max-w-xs">{name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:block">Save PDF</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:block">{copied ? "Copied!" : "Share"}</span>
            </Button>
            <Link href="/" target="_blank">
              <Button size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:block">Build yours</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Resume */}
      <main className="min-h-screen bg-muted/30 py-8">
        <div className="mx-auto max-w-[860px] px-4">
          <div className="resume-page overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/5">
            <ResumePreview data={data} />
          </div>
        </div>

        {/* Footer */}
        <div className="no-print mt-8 pb-8 text-center text-sm text-muted-foreground">
          <p>
            Created with{" "}
            <Link href="/" className="font-medium text-primary hover:underline">
              ResumeAI
            </Link>
            {" "}— Build your perfect resume in minutes
          </p>
        </div>
      </main>
    </>
  );
}
