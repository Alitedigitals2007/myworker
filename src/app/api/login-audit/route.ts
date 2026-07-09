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
    const userId = searchParams.get("userId");
    const success = searchParams.get("success");
    const role = searchParams.get("role");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (success !== null) where.success = success === "true";
    if (role) where.userRole = role;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, Date>).lte = new Date(dateTo);
    }

    const [logs, total] = await Promise.all([
      prisma.loginAudit.findMany({
        where,
        include: {
          user: {
            select: { email: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.loginAudit.count({ where })
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
    console.error("Login audit fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch login logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, userRole, ipAddress, userAgent, success, failReason } = body;

    if (!userId || !userName || !userRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const log = await prisma.loginAudit.create({
      data: {
        userId,
        userName,
        userRole,
        ipAddress,
        userAgent,
        success,
        failReason
      }
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Login audit create error:", error);
    return NextResponse.json({ error: "Failed to create login log" }, { status: 500 });
  }
}