import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        variants: true,
        _count: { select: { saleItems: true } }
      }
    });

    const reportData = products.map(product => {
      const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
      const stockValue = product.variants.reduce((sum, v) => sum + (v.stock * v.price), 0);
      const commissionValue = product.commissionValue ?? 0;

      return {
        "SKU": product.sku,
        "Product Name": product.name,
        "Category": product.category,
        "Description": product.description || "N/A",
        "Cost Price": product.costPrice,
        "Selling Price": product.sellingPrice,
        "Margin": product.sellingPrice - product.costPrice,
        "Margin %": ((product.sellingPrice - product.costPrice) / product.costPrice * 100).toFixed(2) + "%",
        "Total Stock": totalStock,
        "Stock Value": stockValue,
        "Variants": product.variants.length,
        "Total Sold": product._count.saleItems,
        "Status": product.status,
        "Commission Type": product.commissionType,
        "Commission Value": commissionValue
      };
    });

    return NextResponse.json({ report: reportData });
  } catch (error) {
    console.error("Products report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}