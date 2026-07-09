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
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: {
          select: { id: true, name: true, stock: true, price: true }
        },
        _count: { select: { variants: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      id, name, category, sku, sellingPrice, costPrice,
      description, images, commissionType, commissionValue, variants, status
    } = body;

    if (!id || !name || !category || !sku || !sellingPrice || !costPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Delete existing variants and recreate
    await prisma.productVariant.deleteMany({ where: { productId: id } });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name, category, sku, sellingPrice, costPrice,
        description,
        images: images || [],
        commissionType: commissionType || "PERCENTAGE",
        commissionValue: commissionValue,
        status: status || "ACTIVE",
        variants: variants ? {
          create: variants.map((v: { name: string; sku: string; stock: number; price: number; attributes: Record<string, unknown> }) => ({
            name: v.name,
            sku: v.sku,
            stock: v.stock,
            price: v.price,
            attributes: v.attributes || {}
          }))
        } : undefined
      },
      include: { variants: true }
    });

    await prisma.activityLog.create({
      data: {
        action: "UPDATE",
        entityType: "PRODUCT",
        entityId: product.id,
        details: { name, category }
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update error:", error);
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
    const {
      name, category, sku, sellingPrice, costPrice,
      description, images, commissionType, commissionValue, variants, status
    } = body;

    if (!name || !category || !sku || !sellingPrice || !costPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name, category, sku, sellingPrice, costPrice,
        description,
        images: images || [],
        commissionType: commissionType || "PERCENTAGE",
        commissionValue: commissionValue,
        status: status || "ACTIVE",
        variants: variants ? {
          create: variants.map((v: { name: string; sku: string; stock: number; price: number; attributes: Record<string, unknown> }) => ({
            name: v.name,
            sku: v.sku,
            stock: v.stock,
            price: v.price,
            attributes: v.attributes || {}
          }))
        } : undefined
      },
      include: { variants: true }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "CREATE",
        entityType: "PRODUCT",
        entityId: product.id,
        details: { name, category }
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: "DELETE",
        entityType: "PRODUCT",
        entityId: id,
        details: { deletedAt: new Date().toISOString() }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}