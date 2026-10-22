import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { AuditService } from "@/services/audit.service";

export async function GET(req: NextRequest) {
  try {
    const { businessId, branchId } = await TenantService.requireTenantContext();
    const { searchParams } = new URL(req.url);
    const branchParam = searchParams.get("branchId");

    const targetBranchId = branchId
      ? branchId
      : (branchParam && branchParam !== "ALL" ? branchParam : undefined);

    const suppliers = await prisma.supplier.findMany({
      where: {
        businessId,
        ...(targetBranchId ? { branchId: targetBranchId } : {}),
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        _count: { select: { products: true, purchases: true } },
      },
      orderBy: { name: "asc" },
    });

    const totalOutstandingPayables = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);

    return NextResponse.json({
      success: true,
      suppliers,
      totalOutstandingPayables,
      activeBranchId: targetBranchId || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch suppliers." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, branchId, userId } = await TenantService.requireTenantContext("canManageSuppliers");
    const body = await req.json();
    const { name, contactPerson, phone, email, address, notes, branchId: requestedBranchId } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Supplier name and phone are required." }, { status: 400 });
    }

    // Determine target branch
    let targetBranchId = branchId || requestedBranchId;
    if (!targetBranchId) {
      const defaultBranch = await prisma.branch.findFirst({
        where: { businessId, isDefault: true },
      });
      targetBranchId = defaultBranch?.id || null;
    }

    const supplier = await prisma.supplier.create({
      data: {
        businessId,
        branchId: targetBranchId,
        name: name.trim(),
        contactPerson: contactPerson ? contactPerson.trim() : null,
        phone: phone.trim(),
        email: email ? email.trim() : null,
        address: address ? address.trim() : null,
        notes: notes ? notes.trim() : null,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    await AuditService.log({
      businessId,
      userId,
      action: "SUPPLIER_CREATED",
      entity: "Supplier",
      entityId: supplier.id,
      metadata: { name: supplier.name, branchId: targetBranchId },
    });

    return NextResponse.json({ success: true, message: "Supplier created successfully!", supplier });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create supplier." }, { status: 500 });
  }
}
