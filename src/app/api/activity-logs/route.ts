import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const workerId = searchParams.get("workerId");
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};
    if (workerId) where.workerId = workerId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, Date>).lte = new Date(dateTo);
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          worker: {
            select: { fullName: true, workerId: true, profilePicture: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.activityLog.count({ where })
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Activity log fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, entityType, entityId, details, ipAddress } = body;

    if (!action || !entityType) {
      return NextResponse.json({ error: "Action and entity type are required" }, { status: 400 });
    }

    const log = await prisma.activityLog.create({
      data: {
        workerId: session.user.workerId || null,
        action,
        entityType,
        entityId,
        details,
        ipAddress
      }
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Activity log create error:", error);
    return NextResponse.json({ error: "Failed to create activity log" }, { status: 500 });
  }
}