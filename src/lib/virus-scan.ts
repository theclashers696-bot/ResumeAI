/**
 * Virus-scan architecture stub.
 *
 * Provides a uniform interface for file scanning that can be wired to a real
 * provider without touching call-sites.
 *
 * ─── Provider integration points ────────────────────────────────────────────
 *
 * Option A — ClamAV (self-hosted, open-source)
 *   Run a clamd daemon alongside the application and install `clamscan`:
 *
 *     import NodeClam from "clamscan";
 *     const clam = await new NodeClam().init({
 *       clamdscan: { host: process.env.CLAMAV_HOST, port: Number(process.env.CLAMAV_PORT) },
 *     });
 *     const { isInfected, viruses } = await clam.scanBuffer(buffer);
 *     if (isInfected) return { clean: false, threat: viruses[0], scanner: "clamav" };
 *
 * Option B — VirusTotal API v3 (cloud, freemium)
 *   POST the file to https://www.virustotal.com/api/v3/files, poll the
 *   analysis report, and reject if any engine flags it.
 *   Requires: VIRUSTOTAL_API_KEY env var.
 *
 * Option C — AWS Malware Protection for S3 (managed)
 *   Upload to S3, trigger GuardDuty Malware Protection via S3 event, consume
 *   the result from an EventBridge rule before surfacing the file to users.
 *
 * ─── Enabling ───────────────────────────────────────────────────────────────
 *   Set VIRUS_SCAN_ENABLED=true in your environment.
 *
 *   Without it, scanBuffer() is a no-op that logs and returns clean=true.
 *   This is safe for local development but MUST NOT be used in production
 *   without configuring a real provider above.
 */

export type ScannerName = "none" | "clamav" | "virustotal" | "aws" | "stub";

export interface ScanResult {
  clean: boolean;
  /** Human-readable threat name when clean === false. */
  threat?: string;
  /** Which scanner produced this result. */
  scanner: ScannerName;
}

/**
 * Scan a file buffer for malware.
 *
 * Returns `{ clean: true }` when no threat is found.
 * Returns `{ clean: false, threat }` when a threat is detected — callers
 * MUST reject the upload.
 */
export async function scanBuffer(
  buffer: Buffer,
  fileName: string,
): Promise<ScanResult> {
  const enabled = process.env.VIRUS_SCAN_ENABLED === "true";

  if (!enabled) {
    console.warn(
      `[virus-scan] Scan skipped for "${fileName}" (${buffer.byteLength} bytes). ` +
        `Set VIRUS_SCAN_ENABLED=true and wire a provider in src/lib/virus-scan.ts ` +
        `to enable scanning in production.`,
    );
    return { clean: true, scanner: "none" };
  }

  // ── Wire your chosen provider here ──────────────────────────────────────
  // FAIL CLOSED: if scanning is enabled but no provider is wired in, reject
  // the upload rather than silently accepting potentially unsafe files.
  // This prevents a misconfigured production deployment from bypassing the
  // scan entirely.  Wire a real provider from the options above, then remove
  // this throw and replace it with the provider call.
  throw new Error(
    `[virus-scan] VIRUS_SCAN_ENABLED=true but no provider is configured. ` +
      `File "${fileName}" (${buffer.byteLength} bytes) was rejected. ` +
      `Wire a real provider in src/lib/virus-scan.ts before enabling scanning.`,
  );
  // ────────────────────────────────────────────────────────────────────────
}
