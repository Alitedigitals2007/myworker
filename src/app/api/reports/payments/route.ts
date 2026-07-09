import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, Date>).lte = new Date(dateTo);
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        worker: { select: { fullName: true, workerId: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const reportData = payments.map(payment => ({
      "Payment ID": payment.id.slice(-8).toUpperCase(),
      "Date": new Date(payment.createdAt).toLocaleDateString(),
      "Time": new Date(payment.createdAt).toLocaleTimeString(),
      "Worker Name": payment.worker.fullName,
      "Worker ID": payment.worker.workerId,
      "Amount": payment.amount,
      "Payment Method": payment.paymentMethod,
      "Reference": payment.reference || "N/A",
      "Status": payment.status,
      "Notes": payment.notes || "N/A",
      "Processed At": payment.processedAt ? new Date(payment.processedAt).toLocaleDateString() : "Pending"
    }));

    return NextResponse.json({ report: reportData });
  } catch (error) {
    console.error("Payments report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}