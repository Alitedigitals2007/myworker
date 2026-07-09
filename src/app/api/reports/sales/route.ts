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

    const sales = await prisma.sale.findMany({
      where,
      include: {
        worker: { select: { fullName: true, workerId: true } },
        items: {
          include: { product: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const reportData = sales.map(sale => ({
      "Sale ID": sale.id.slice(-8).toUpperCase(),
      "Date": new Date(sale.createdAt).toLocaleDateString(),
      "Time": new Date(sale.createdAt).toLocaleTimeString(),
      "Worker Name": sale.worker.fullName,
      "Worker ID": sale.worker.workerId,
      "Customer Name": sale.customerName,
      "Customer Phone": sale.customerPhone || "N/A",
      "Products": sale.items.map(i => `${i.product.name} x${i.quantity}`).join("; "),
      "Subtotal": sale.totalAmount + sale.discount,
      "Discount": sale.discount,
      "Total Amount": sale.totalAmount,
      "Commission": sale.commission,
      "Status": sale.status,
      "Payment Method": sale.paymentMethod || "N/A"
    }));

    return NextResponse.json({ report: reportData });
  } catch (error) {
    console.error("Sales report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}