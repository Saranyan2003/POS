import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { businessId } = await TenantService.requireTenantContext();

    const categories = await prisma.category.findMany({
      where: { businessId, isActive: true },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch categories." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await TenantService.requireTenantContext("canManageProducts");
    const { name, color = "#0f766e", description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        businessId,
        name: name.trim(),
        color,
        description,
      },
    });

    return NextResponse.json({ success: true, message: "Category created successfully!", category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category." }, { status: 500 });
  }
}
