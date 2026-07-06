import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    // Workers can only see their own complaints
    if (session.user.role === "WORKER" && session.user.workerId) {
      where.workerId = session.user.workerId;
    } else if (status) {
      where.status = status;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        worker: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error("Complaints fetch error:", error);
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
    const { title, description, images } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const complaint = await prisma.complaint.create({
      data: {
        workerId: session.user.workerId || "",
        title,
        description,
        images: images || [],
        status: "PENDING"
      },
      include: {
        worker: { select: { fullName: true } }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        workerId: session.user.workerId,
        action: "COMPLAINT_CREATED",
        entityType: "Complaint",
        entityId: complaint.id,
        details: { title }
      }
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error("Complaint creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}