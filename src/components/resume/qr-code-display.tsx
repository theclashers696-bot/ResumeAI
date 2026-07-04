"use client";

import { useEffect, useState, useRef } from "react";
import { X, Download, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodeDisplayProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function QRCodeDisplay({ url, title, onClose }: QRCodeDisplayProps) {
  const [svgData, setSvgData] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      try {
        const QRCode = await import("qrcode");
        const svg = await QRCode.toString(url, {
          type: "svg",
          margin: 2,
          color: { dark: "#0F172A", light: "#FFFFFF" },
          width: 300,
          errorCorrectionLevel: "H",
        });
        if (!cancelled) {
          setSvgData(svg);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    void generate();
    return () => { cancelled = true; };
  }, [url]);

  const downloadSVG = () => {
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_qr.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadPNG = async () => {
    try {
      const QRCode = await import("qrcode");
      const dataUrl = await QRCode.toDataURL(url, {
        margin: 2,
        color: { dark: "#0F172A", light: "#FFFFFF" },
        width: 512,
        errorCorrectionLevel: "H",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_qr.png`;
      a.click();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-2xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">QR Code</h3>
        </div>
        <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* QR Display */}
      <div className="flex items-center justify-center rounded-lg border border-border bg-white p-4">
        {loading ? (
          <div className="flex h-[200px] w-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : svgData ? (
          <div
            className="h-[200px] w-[200px]"
            dangerouslySetInnerHTML={{ __html: svgData }}
          />
        ) : (
          <div className="flex h-[200px] w-[200px] items-center justify-center text-sm text-muted-foreground">
            QR generation failed
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* URL */}
      <p className="mt-3 break-all text-center text-xs text-muted-foreground">{url}</p>
      <p className="mt-1 text-center text-xs text-muted-foreground">Scan to open resume</p>

      {/* Downloads */}
      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-1.5 text-xs"
          onClick={downloadSVG}
          disabled={!svgData}
        >
          <Download className="h-3.5 w-3.5" />
          SVG
        </Button>
        <Button
          className="flex-1 gap-1.5 text-xs"
          onClick={() => { void downloadPNG(); }}
          disabled={loading || !svgData}
        >
          <Download className="h-3.5 w-3.5" />
          PNG (512px)
        </Button>
      </div>
    </div>
  );
}
