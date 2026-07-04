import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ApiResponse } from "@/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 20 image uploads per user per minute
    const rl = checkRateLimit(`upload:${session.user.id}`, { windowMs: 60_000, max: 20 });
    if (!rl.allowed) {
      return NextResponse.json<ApiResponse>(
        { error: "Too many uploads. Please wait before trying again." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) ?? "avatars";

    // Sanitize folder — allow only alphanumeric + hyphens to prevent path traversal
    const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 64) || "avatars";

    if (!file) {
      return NextResponse.json<ApiResponse>({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json<ApiResponse>(
        { error: "File type not allowed. Use JPEG, PNG, or WebP." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse>(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await uploadImage(dataUri, {
      folder: `resume-ai/${safeFolder}/${session.user.id}`,
      transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
    });

    return NextResponse.json<ApiResponse<typeof result>>({ data: result }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json<ApiResponse>({ error: "Upload failed" }, { status: 500 });
  }
}
