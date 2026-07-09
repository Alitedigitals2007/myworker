import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType");

    const where: Record<string, unknown> = {};

    // If worker, only show announcements targeted to ALL or their department
    if (session.user.role === "WORKER") {
      where.OR = [
        { targetType: "ALL" },
        { targetType: "DEPARTMENT" },
        { targetIds: { has: session.user.workerId } }
      ];
    } else if (targetType) {
      where.targetType = targetType;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Announcements fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, images, targetType, targetIds } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        images: images || [],
        targetType: targetType || "ALL",
        targetIds: targetIds || [],
        createdBy: session.user.id
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "ANNOUNCEMENT_CREATED",
        entityType: "Announcement",
        entityId: announcement.id,
        details: { title, targetType }
      }
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Announcement creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}