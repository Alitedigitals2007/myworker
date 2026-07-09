import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({ results: [] });
    }

    const [workers, products, sales] = await Promise.all([
      prisma.worker.findMany({
        where: {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { workerId: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } }
          ]
        },
        select: { id: true, fullName: true, workerId: true, email: true },
        take: 5
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } }
          ]
        },
        select: { id: true, name: true, sku: true, category: true },
        take: 5
      }),
      prisma.sale.findMany({
        where: {
          OR: [
            { customerName: { contains: q, mode: "insensitive" } },
            { id: { contains: q, mode: "insensitive" } }
          ]
        },
        include: {
          worker: { select: { fullName: true } }
        },
        take: 5
      })
    ]);

    const results = [
      ...workers.map(w => ({
        type: "worker" as const,
        id: w.id,
        title: w.fullName,
        subtitle: `${w.workerId} • ${w.email}`,
        href: `/admin/workers?id=${w.id}`
      })),
      ...products.map(p => ({
        type: "product" as const,
        id: p.id,
        title: p.name,
        subtitle: `${p.sku} • ${p.category}`,
        href: `/admin/products?id=${p.id}`
      })),
      ...sales.map(s => ({
        type: "sale" as const,
        id: s.id,
        title: `Sale to ${s.customerName}`,
        subtitle: `${s.worker.fullName} • ₦${s.totalAmount.toLocaleString()}`,
        href: `/admin/sales?id=${s.id}`
      }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}