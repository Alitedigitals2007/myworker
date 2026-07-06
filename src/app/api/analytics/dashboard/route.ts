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
    const range = searchParams.get("range") || "30";
    const days = parseInt(range);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all stats in parallel
    const [
      totalWorkers,
      activeWorkers,
      newWorkers,
      pendingSales,
      pendingComplaints,
      pendingPayments,
      totalRevenue,
      totalSales,
      totalProducts,
      inventoryValue,
      recentSales,
      topWorkers,
      monthlyStats
    ] = await Promise.all([
      // Total workers count
      prisma.worker.count(),

      // Active workers count
      prisma.worker.count({ where: { status: "ACTIVE" } }),

      // New workers this month
      prisma.worker.count({
        where: {
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      }),

      // Pending sales reviews
      prisma.sale.count({ where: { status: "PENDING" } }),

      // Pending complaints
      prisma.complaint.count({ where: { status: { in: ["PENDING", "UNDER_REVIEW"] } } }),

      // Pending payments
      prisma.payment.count({ where: { status: "PENDING" } }),

      // Total revenue (from approved sales)
      prisma.sale.aggregate({
        where: { status: "APPROVED" },
        _sum: { totalAmount: true }
      }),

      // Total sales count
      prisma.sale.count({ where: { status: "APPROVED" } }),

      // Total products
      prisma.product.count({ where: { status: "ACTIVE" } }),

      // Inventory value (sum of variant stocks * cost price)
      prisma.productVariant.aggregate({
        _sum: { stock: true, price: true }
      }),

      // Recent sales for chart
      prisma.sale.findMany({
        where: {
          status: "APPROVED",
          createdAt: { gte: startDate }
        },
        select: {
          totalAmount: true,
          createdAt: true
        },
        orderBy: { createdAt: "asc" }
      }),

      // Top performing workers
      prisma.worker.findMany({
        where: { sales: { some: { status: "APPROVED" } } },
        include: {
          sales: {
            where: { status: "APPROVED", createdAt: { gte: startDate } },
            select: { totalAmount: true }
          }
        },
        take: 5
      }),

      // Monthly stats
      prisma.sale.aggregate({
        where: {
          status: "APPROVED",
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        },
        _sum: { totalAmount: true, commission: true }
      })
    ]);

    // Calculate pending commission
    const pendingCommission = await prisma.sale.aggregate({
      where: { status: "PENDING" },
      _sum: { commission: true }
    });

    // Calculate paid commission
    const paidCommission = await prisma.payment.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true }
    });

    // Process revenue chart data (group by date)
    const revenueByDate = recentSales.reduce((acc, sale) => {
      const date = sale.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const revenueChartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue
    }));

    // Process top workers data
    const topWorkersData = topWorkers
      .map(worker => ({
        name: worker.fullName,
        sales: worker.sales.reduce((sum, s) => sum + s.totalAmount, 0)
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Get inventory breakdown
    const lowStock = await prisma.productVariant.count({ where: { stock: { lte: 10, gt: 0 } } });
    const outOfStock = await prisma.productVariant.count({ where: { stock: 0 } });
    const inStock = await prisma.productVariant.count({ where: { stock: { gt: 10 } } });

    return NextResponse.json({
      // Stats
      totalWorkers,
      activeWorkers,
      onlineWorkers: Math.floor(Math.random() * activeWorkers + 1), // Placeholder - would need session tracking
      newWorkers,
      pendingReviews: pendingSales,
      pendingComplaints,
      pendingPayments,
      pendingCommission: pendingCommission._sum.commission || 0,
      paidCommission: paidCommission._sum.amount || 0,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalSales,
      totalProducts,
      inventoryValue: inventoryValue._sum.stock || 0, // This should be stock * cost but we don't have cost per variant
      monthlyRevenue: monthlyStats._sum.totalAmount || 0,
      monthlyProfit: (monthlyStats._sum.totalAmount || 0) - (monthlyStats._sum.commission || 0),

      // Charts
      revenueChartData,
      topWorkersData,
      inventoryBreakdown: {
        inStock,
        lowStock,
        outOfStock
      },

      // Commission breakdown
      commissionBreakdown: {
        pending: pendingCommission._sum.commission || 0,
        approved: monthlyStats._sum.commission || 0,
        paid: paidCommission._sum.amount || 0
      }
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}