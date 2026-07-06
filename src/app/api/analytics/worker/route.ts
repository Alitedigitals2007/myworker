import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workerId = session.user.workerId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get all approved sales for this worker
    const approvedSales = await prisma.sale.findMany({
      where: { workerId, status: "APPROVED" },
      select: { totalAmount: true, commission: true, createdAt: true }
    });

    // Calculate earnings
    const todayEarnings = approvedSales
      .filter(s => s.createdAt >= today)
      .reduce((sum, s) => sum + s.commission, 0);

    const weekEarnings = approvedSales
      .filter(s => s.createdAt >= weekStart)
      .reduce((sum, s) => sum + s.commission, 0);

    const monthEarnings = approvedSales
      .filter(s => s.createdAt >= monthStart)
      .reduce((sum, s) => sum + s.commission, 0);

    const totalEarnings = approvedSales.reduce((sum, s) => sum + s.commission, 0);

    // Get pending commission
    const pendingCommission = await prisma.sale.aggregate({
      where: { workerId, status: "PENDING" },
      _sum: { commission: true }
    });

    // Get approved commission (ready for payment)
    const approvedCommission = await prisma.sale.aggregate({
      where: { workerId, status: "APPROVED" },
      _sum: { commission: true }
    });

    // Get paid commission
    const paidCommission = await prisma.payment.aggregate({
      where: { workerId, status: "APPROVED" },
      _sum: { amount: true }
    });

    // Get total sales count
    const totalSales = await prisma.sale.count({
      where: { workerId, status: "APPROVED" }
    });

    return NextResponse.json({
      todayEarnings,
      weekEarnings,
      monthEarnings,
      totalEarnings,
      pendingCommission: pendingCommission._sum.commission || 0,
      approvedCommission: approvedCommission._sum.commission || 0,
      paidCommission: paidCommission._sum.amount || 0,
      totalSales
    });
  } catch (error) {
    console.error("Worker analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}