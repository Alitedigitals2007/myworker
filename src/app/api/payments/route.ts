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
    const workerId = searchParams.get("workerId");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    // Workers can only see their own payments
    if (session.user.role === "WORKER" && session.user.workerId) {
      where.workerId = session.user.workerId;
    } else if (workerId) {
      where.workerId = workerId;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        worker: { select: { id: true, fullName: true, workerId: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Payments fetch error:", error);
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
    const { workerId, amount, paymentMethod, reference, notes } = body;

    if (!workerId || !amount || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        workerId,
        amount,
        paymentMethod,
        reference,
        notes,
        status: "PENDING"
      },
      include: {
        worker: { select: { fullName: true } }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "PAYMENT_INITIATED",
        entityType: "Payment",
        entityId: payment.id,
        details: { workerId, amount, paymentMethod }
      }
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}