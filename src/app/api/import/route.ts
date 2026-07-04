import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  detectFileType,
  extractText,
  parseResumeJSON,
  sanitizeText,
  validateFile,
} from "@/lib/resume-parser";
import { aiParseResume } from "@/lib/ai/import-parser";
import { checkRateLimit } from "@/lib/rate-limit";
import { scanBuffer } from "@/lib/virus-scan";
import type { ApiResponse } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse>({ error: "No file provided" }, { status: 400 });
    }

    // Rate limit: 10 uploads per user per minute
    const rl = checkRateLimit(`import:${session.user.id}`, { windowMs: 60_000, max: 10 });
    if (!rl.allowed) {
      return NextResponse.json<ApiResponse>(
        { error: "Too many uploads. Please wait a moment before trying again." },
        { status: 429 },
      );
    }

    const validation = validateFile(file.name, file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>({ error: validation.error }, { status: 400 });
    }

    const fileType = detectFileType(file.name, file.type)!;

    const record = await prisma.resumeImport.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        status: "PARSING",
      },
    });

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Virus scan (no-op unless VIRUS_SCAN_ENABLED=true — see src/lib/virus-scan.ts)
      const scan = await scanBuffer(buffer, file.name);
      if (!scan.clean) {
        await prisma.resumeImport.update({
          where: { id: record.id },
          data: { status: "FAILED", errorMessage: `File rejected by virus scanner: ${scan.threat}` },
        });
        return NextResponse.json<ApiResponse>(
          { error: "File rejected: potential security threat detected." },
          { status: 422 },
        );
      }

      let rawText: string;
      let parsedData: ReturnType<typeof parseResumeJSON> | null = null;

      if (fileType === "json") {
        parsedData = parseResumeJSON(buffer);
        rawText = JSON.stringify(parsedData);
      } else {
        rawText = sanitizeText(await extractText(buffer, fileType));
      }

      let aiResult: typeof parsedData = null;
      try {
        aiResult = await aiParseResume(rawText);
      } catch (aiErr) {
        console.error("[import] AI parsing failed:", aiErr);
      }

      const finalParsed = aiResult ?? parsedData;

      await prisma.resumeImport.update({
        where: { id: record.id },
        data: {
          status: "PARSED",
          rawText: rawText.slice(0, 50000),
          parsedData: finalParsed
            ? (finalParsed as unknown as import("@prisma/client").Prisma.InputJsonValue)
            : undefined,
          aiEnhanced: aiResult
            ? (aiResult as unknown as import("@prisma/client").Prisma.InputJsonValue)
            : undefined,
        },
      });

      await prisma.importHistory.create({
        data: {
          importId: record.id,
          userId: session.user.id,
          action: "PARSED",
          metadata: { fileName: file.name, fileType, fileSize: file.size },
        },
      });

      return NextResponse.json<ApiResponse>({
        data: {
          id: record.id,
          status: "PARSED",
          parsedData: finalParsed,
          fileName: file.name,
          fileType,
        },
      });
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : "Parsing failed";
      await prisma.resumeImport.update({
        where: { id: record.id },
        data: { status: "FAILED", errorMessage: msg },
      });

      return NextResponse.json<ApiResponse>({ error: msg }, { status: 422 });
    }
  } catch (err) {
    console.error("[POST /api/import]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "20", 10), 50);
    const skip = (page - 1) * pageSize;

    const [imports, total] = await Promise.all([
      prisma.resumeImport.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          status: true,
          resumeId: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
          resume: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.resumeImport.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      data: imports,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("[GET /api/import]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
