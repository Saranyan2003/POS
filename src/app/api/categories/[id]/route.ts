import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { businessId } = await TenantService.requireTenantContext("canManageProducts");
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.category.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.color ? { color: body.color } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully!",
      category: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { businessId } = await TenantService.requireTenantContext("canManageProducts");
    const { id } = await params;

    const existing = await prisma.category.findFirst({
      where: { id, businessId },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    // Unlink products first to be safe
    await prisma.product.updateMany({
      where: { categoryId: id, businessId },
      data: { categoryId: null },
    });

    // Delete the category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Category "${existing.name}" deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete category." },
      { status: 500 }
    );
  }
}
