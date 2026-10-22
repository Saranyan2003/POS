import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { AuditService } from "@/services/audit.service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { businessId, userId } = await TenantService.requireTenantContext("canManageProducts");
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        sku: body.sku ?? existing.sku,
        barcode: body.barcode ?? existing.barcode,
        categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
        supplierId: body.supplierId !== undefined ? body.supplierId : existing.supplierId,
        costPrice: body.costPrice !== undefined ? parseFloat(body.costPrice) : existing.costPrice,
        sellingPrice: body.sellingPrice !== undefined ? parseFloat(body.sellingPrice) : existing.sellingPrice,
        discountPrice: body.discountPrice !== undefined ? (body.discountPrice ? parseFloat(body.discountPrice) : null) : existing.discountPrice,
        minStockLevel: body.minStockLevel !== undefined ? parseInt(body.minStockLevel, 10) : existing.minStockLevel,
        unit: body.unit ?? existing.unit,
        description: body.description !== undefined ? body.description : existing.description,
      },
    });

    await AuditService.log({
      businessId,
      userId,
      action: "PRODUCT_UPDATED",
      entity: "Product",
      entityId: id,
      metadata: { name: updated.name },
    });

    return NextResponse.json({ success: true, message: "Product updated successfully!", product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { businessId, userId } = await TenantService.requireTenantContext("canManageProducts");
    const { id } = await params;

    const existing = await prisma.product.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Soft-delete
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await AuditService.log({
      businessId,
      userId,
      action: "PRODUCT_ARCHIVED",
      entity: "Product",
      entityId: id,
      metadata: { name: existing.name },
    });

    return NextResponse.json({ success: true, message: "Product archived successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to archive product." }, { status: 500 });
  }
}
