import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { AuditService } from "@/services/audit.service";

export async function GET(req: NextRequest) {
  try {
    const { businessId, branchId } = await TenantService.requireTenantContext();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const branchParam = searchParams.get("branchId");

    // Strict branch isolation:
    // If the active user has an assigned branch (e.g. cashier / employee), enforce that branch strictly.
    // If the user is an owner without a fixed branch scope, respect branchId query param if provided.
    const targetBranchId = branchId
      ? branchId
      : (branchParam && branchParam !== "ALL" ? branchParam : undefined);

    const customers = await prisma.customer.findMany({
      where: {
        businessId,
        ...(targetBranchId ? { branchId: targetBranchId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { phone: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        sales: {
          where: {
            businessId,
            ...(targetBranchId ? { branchId: targetBranchId } : {}),
            status: "COMPLETED",
          },
          select: { total: true },
        },
      },
      orderBy: { totalSpent: "desc" },
    });

    const enrichedCustomers = customers.map((c) => {
      // If scoped to a branch, calculate branch-specific spent from branch sales
      const branchSpent = targetBranchId
        ? c.sales.reduce((sum, s) => sum + s.total, 0)
        : c.totalSpent;

      return {
        ...c,
        totalSpent: targetBranchId ? branchSpent : c.totalSpent,
        creditBalance: targetBranchId && c.branchId !== targetBranchId ? 0 : c.creditBalance,
      };
    });

    const totalCustomerSpend = enrichedCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalOutstandingCredit = enrichedCustomers.reduce((sum, c) => sum + (c.creditBalance || 0), 0);

    return NextResponse.json({
      success: true,
      customers: enrichedCustomers,
      totalCustomerSpend,
      totalOutstandingCredit,
      activeBranchId: targetBranchId || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch customers." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, branchId, userId } = await TenantService.requireTenantContext("canManageCustomers");
    const body = await req.json();
    const { name, phone, email, address, notes, branchId: requestedBranchId } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Customer name and phone number are required." }, { status: 400 });
    }

    const existing = await prisma.customer.findFirst({
      where: { businessId, phone },
    });

    if (existing) {
      return NextResponse.json({ error: "A customer with this phone number already exists." }, { status: 400 });
    }

    // Determine target branch
    let targetBranchId = branchId || requestedBranchId;
    if (!targetBranchId) {
      const defaultBranch = await prisma.branch.findFirst({
        where: { businessId, isDefault: true },
      });
      targetBranchId = defaultBranch?.id || null;
    }

    const customer = await prisma.customer.create({
      data: {
        businessId,
        branchId: targetBranchId,
        name: name.trim(),
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
      action: "CUSTOMER_CREATED",
      entity: "Customer",
      entityId: customer.id,
      metadata: { name, phone, branchId: targetBranchId },
    });

    return NextResponse.json({ success: true, message: "Customer registered successfully!", customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create customer." }, { status: 500 });
  }
}
