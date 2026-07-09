import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

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

    // Workers can only see their own sales
    if (session.user.role === "WORKER" && session.user.workerId) {
      where.workerId = session.user.workerId;
    } else if (workerId) {
      where.workerId = workerId;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        worker: { select: { id: true, fullName: true } },
        items: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Sales fetch error:", error);
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
    const { customerName, customerPhone, items, discount, paymentMethod, notes, receiptUrl } = body;

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json({ error: "Customer name and items are required" }, { status: 400 });
    }

    // For workers, use their workerId
    const workerId = session.user.workerId;

    if (!workerId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Worker ID not found" }, { status: 400 });
    }

    // Calculate totals and commission
    let totalAmount = 0;
    let commission = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: item.variantId ? { where: { id: item.variantId } } : undefined }
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      const unitPrice = item.variantId
        ? product.variants[0]?.price || product.sellingPrice
        : product.sellingPrice;

      totalAmount += unitPrice * item.quantity;

      // Calculate commission
      if (product.commissionType === "PERCENTAGE") {
        commission += totalAmount * (product.commissionValue || 10) / 100;
      } else if (product.commissionType === "FIXED") {
        commission += product.commissionValue || 0;
      }
    }

    totalAmount -= discount || 0;

    // Create sale with items
    const sale = await prisma.sale.create({
      data: {
        workerId: workerId!,
        customerName,
        customerPhone,
        totalAmount,
        discount: discount || 0,
        commission,
        paymentMethod,
        notes,
        receiptUrl,
        status: "PENDING",
        items: {
          create: await Promise.all(items.map(async (item: { productId: string; variantId?: string; quantity: number }) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            const variant = item.variantId
              ? await prisma.productVariant.findUnique({ where: { id: item.variantId } })
              : null;
            const unitPrice = variant?.price || product?.sellingPrice || 0;
            return {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice,
              totalPrice: unitPrice * item.quantity
            };
          }))
        }
      },
      include: { items: true }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        workerId,
        action: "SALE_CREATED",
        entityType: "Sale",
        entityId: sale.id,
        details: { customerName, totalAmount }
      }
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Sale creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}