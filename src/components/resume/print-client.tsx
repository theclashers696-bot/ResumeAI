"use client";

import { useEffect } from "react";
import { ResumePreview } from "@/components/resume/resume-preview";
import type { ResumeData } from "@/types/resume";

interface PrintClientProps {
  data: ResumeData;
  pageSize: "A4" | "Letter";
}

export function PrintClient({ data, pageSize }: PrintClientProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const size = pageSize === "Letter" ? "216mm 279mm" : "210mm 297mm";
  const width = pageSize === "Letter" ? "216mm" : "210mm";
  const minHeight = pageSize === "Letter" ? "279mm" : "297mm";

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: white; }
        @media print {
          @page { size: ${size}; margin: 0; }
          html, body { width: ${width}; }
          .no-print { display: none !important; }
        }
        @media screen {
          body { background: #f1f5f9; display: flex; justify-content: center; padding: 2rem; }
          .resume-wrapper { background: white; box-shadow: 0 4px 32px rgba(0,0,0,0.12); }
        }
      `}</style>
      <div
        className="no-print"
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          zIndex: 1000,
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={() => window.print()}
          style={{
            padding: "0.5rem 1rem",
            background: "#3B82F6",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          Print / Save PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{
            padding: "0.5rem 1rem",
            background: "#f1f5f9",
            color: "#1e293b",
            border: "1px solid #e2e8f0",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Close
        </button>
      </div>
      <div
        className="resume-wrapper"
        style={{ width, minHeight }}
      >
        <ResumePreview data={data} />
      </div>
    </>
  );
}
