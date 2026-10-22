import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { getBusinessProfile } from "@/lib/business-profiles";

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await TenantService.requireTenantContext("canManageProducts");

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { businessType: true },
    });

    const body = await req.json().catch(() => ({}));
    const businessType = body.businessType || business?.businessType || "Electronics & Mobile";

    const profile = getBusinessProfile(businessType);
    const suggestedCategories = profile.suggestedCategories || [];

    if (suggestedCategories.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No preset categories found for this industry.",
        addedCount: 0,
      });
    }

    // Get existing categories for this business
    const existingCategories = await prisma.category.findMany({
      where: { businessId },
      select: { name: true },
    });

    const existingNames = new Set(existingCategories.map((c) => c.name.toLowerCase().trim()));

    const toCreate = suggestedCategories.filter(
      (catName) => !existingNames.has(catName.toLowerCase().trim())
    );

    if (toCreate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All suggested categories for your business are already loaded!",
        addedCount: 0,
      });
    }

    await prisma.$transaction(
      toCreate.map((name) =>
        prisma.category.create({
          data: {
            businessId,
            name: name.trim(),
            color: "#000000",
          },
        })
      )
    );

    const updatedCategories = await prisma.category.findMany({
      where: { businessId, isActive: true },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully loaded ${toCreate.length} standard categories for ${profile.name}!`,
      addedCount: toCreate.length,
      categories: updatedCategories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to seed industry categories." },
      { status: 500 }
    );
  }
}
