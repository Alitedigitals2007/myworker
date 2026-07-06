import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workers = await prisma.worker.findMany({
      include: {
        sales: {
          where: { status: "APPROVED" },
          select: { totalAmount: true, commission: true }
        },
        payments: {
          where: { status: "APPROVED" },
          select: { amount: true }
        },
        _count: { select: { sales: true, complaints: true } }
      }
    });

    const reportData = workers.map(worker => {
      const totalSales = worker.sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalCommission = worker.sales.reduce((sum, s) => sum + s.commission, 0);
      const totalPaid = worker.payments.reduce((sum, p) => sum + p.amount, 0);

      return {
        "Worker ID": worker.workerId,
        "Full Name": worker.fullName,
        "Email": worker.email,
        "Phone": worker.phone || "N/A",
        "Department": worker.department || "N/A",
        "Position": worker.position || "N/A",
        "Status": worker.status,
        "Commission Rate": `${worker.commissionPercent}%`,
        "Total Sales": worker._count.sales,
        "Total Sales Amount": totalSales,
        "Total Commission": totalCommission,
        "Commission Paid": totalPaid,
        "Commission Pending": totalCommission - totalPaid,
        "Active Complaints": worker._count.complaints,
        "Employment Date": worker.employmentDate ? new Date(worker.employmentDate).toLocaleDateString() : "N/A"
      };
    });

    return NextResponse.json({ report: reportData });
  } catch (error) {
    console.error("Workers report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}