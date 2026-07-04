import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: RouteContext): Promise<NextResponse<ApiResponse<{ ok: boolean }>>> {
  const { id } = await ctx.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const resume = await prisma.resume.findUnique({ where: { id }, select: { userId: true } });
  if (!resume || resume.userId !== session.user.id) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    template,
    themeColor,
    fontFamily,
    fontSize,
    lineHeight,
    pageMargin,
    headerStyle,
    showIcons,
    secondaryColor,
    accentColor,
    photoShape,
    sectionStyle,
    borderRadius,
    showDividers,
    columnLayout,
    watermark,
    sectionOrder,
  } = body;

  const updates: Record<string, unknown> = {};
  if (template !== undefined)       updates.template = template;
  if (themeColor !== undefined)     updates.themeColor = themeColor;
  if (fontFamily !== undefined)     updates.fontFamily = fontFamily;
  if (fontSize !== undefined)       updates.fontSize = Number(fontSize);
  if (lineHeight !== undefined)     updates.lineHeight = Number(lineHeight);
  if (pageMargin !== undefined)     updates.pageMargin = Number(pageMargin);
  if (headerStyle !== undefined)    updates.headerStyle = headerStyle;
  if (showIcons !== undefined)      updates.showIcons = Boolean(showIcons);
  if (secondaryColor !== undefined) updates.secondaryColor = secondaryColor;
  if (accentColor !== undefined)    updates.accentColor = accentColor;
  if (photoShape !== undefined)     updates.photoShape = photoShape;
  if (sectionStyle !== undefined)   updates.sectionStyle = sectionStyle;
  if (borderRadius !== undefined)   updates.borderRadius = Number(borderRadius);
  if (showDividers !== undefined)   updates.showDividers = Boolean(showDividers);
  if (columnLayout !== undefined)   updates.columnLayout = columnLayout;
  if (watermark !== undefined)      updates.watermark = Boolean(watermark);
  if (sectionOrder !== undefined)   updates.sectionOrder = sectionOrder;

  await prisma.resume.update({ where: { id }, data: updates });

  return NextResponse.json({ success: true, data: { ok: true } });
}
