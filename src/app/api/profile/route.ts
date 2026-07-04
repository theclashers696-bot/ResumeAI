import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validations/profile";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true, email: true, image: true } } },
    });

    return NextResponse.json<ApiResponse<typeof profile>>({ data: profile });
  } catch (error) {
    console.error("[GET /api/profile]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { error: "Validation failed", message: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { name, ...profileData } = parsed.data;

    const [profile] = await Promise.all([
      prisma.profile.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, ...profileData },
        update: profileData,
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      }),
    ]);

    return NextResponse.json<ApiResponse<typeof profile>>({ data: profile });
  } catch (error) {
    console.error("[PUT /api/profile]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
