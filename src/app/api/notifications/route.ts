import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unread") === "true";

    const workerId = session.user.role === "WORKER"
      ? session.user.workerId
      : undefined;

    const where: Record<string, unknown> = {};
    if (workerId) where.workerId = workerId;
    if (unreadOnly) where.read = false;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.notification.count({
        where: { ...where, read: false }
      })
    ]);

    return NextResponse.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (action === "markAllRead") {
      const workerId = session.user.role === "WORKER"
        ? session.user.workerId
        : undefined;

      await prisma.notification.updateMany({
        where: { workerId, read: false },
        data: { read: true }
      });

      return NextResponse.json({ success: true });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}