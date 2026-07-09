import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin/super admin can view all workers
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const department = searchParams.get("department");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { workerId: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (department) {
      where.department = department;
    }

    const [workers, total] = await Promise.all([
      prisma.worker.findMany({
        where,
        select: {
          id: true,
          workerId: true,
          fullName: true,
          email: true,
          phone: true,
          department: true,
          position: true,
          status: true,
          commissionPercent: true,
          commissionType: true,
          profilePicture: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit
      }),
      prisma.worker.count({ where })
    ]);

    return NextResponse.json({
      workers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Workers fetch error:", error);
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
    const {
      fullName,
      email,
      phone,
      department,
      position,
      address,
      gender,
      dateOfBirth,
      employmentDate,
      profilePicture,
      commissionPercent,
      commissionType,
      password
    } = body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    // Generate worker ID
    const workerId = `MW-${Math.random().toString().slice(2, 10)}`;

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        password, // In production, hash the password before saving
        role: "WORKER"
      }
    });

    // Then create worker profile
    const worker = await prisma.worker.create({
      data: {
        workerId,
        fullName,
        email,
        phone,
        department,
        position,
        address,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        employmentDate: employmentDate ? new Date(employmentDate) : null,
        profilePicture,
        commissionPercent: commissionPercent || 10,
        commissionType: commissionType || "PERCENTAGE",
        userId: user.id
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        workerId: worker.id,
        action: "WORKER_ADDED",
        entityType: "Worker",
        entityId: worker.id,
        details: { fullName, email, department }
      }
    });

    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    console.error("Worker creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}