import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

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

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    if (sale.status !== "PENDING") {
      return NextResponse.json({ error: "Sale is not pending" }, { status: 400 });
    }

    // Approve sale and update inventory
    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date()
      }
    });

    // Update inventory (decrease stock)
    for (const item of sale.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "SALE_APPROVED",
        entityType: "Sale",
        entityId: sale.id,
        details: { totalAmount: sale.totalAmount, commission: sale.commission }
      }
    });

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error("Sale approval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}