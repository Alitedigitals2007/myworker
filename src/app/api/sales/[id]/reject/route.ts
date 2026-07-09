import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    const sale = await prisma.sale.findUnique({ where: { id } });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    if (sale.status !== "PENDING") {
      return NextResponse.json({ error: "Sale is not pending" }, { status: 400 });
    }

    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedReason: reason || "Rejected by admin"
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "SALE_REJECTED",
        entityType: "Sale",
        entityId: sale.id,
        details: { reason: reason || "Rejected by admin" }
      }
    });

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error("Sale rejection error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}