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
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const activities = await prisma.activityLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: {
        worker: {
          select: { fullName: true, profilePicture: true }
        }
      }
    });

    const total = await prisma.activityLog.count();

    return NextResponse.json({ activities, total });
  } catch (error) {
    console.error("Activities fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, entityType, entityId, details } = body;

    const activity = await prisma.activityLog.create({
      data: {
        workerId: session.user.workerId || null,
        action,
        entityType,
        entityId,
        details
      }
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Activity creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}