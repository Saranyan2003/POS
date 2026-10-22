import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { SubscriptionService } from "@/services/subscription.service";
import { AuditService } from "@/services/audit.service";
import { setActiveBranch } from "@/lib/auth";

export async function GET() {
  try {
    const { businessId } = await TenantService.requireTenantContext();

    const branches = await prisma.branch.findMany({
      where: { businessId, isActive: true },
      include: {
        _count: { select: { sales: true, inventory: true, userBranches: true } },
      },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ success: true, branches });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch branches." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, userId } = await TenantService.requireTenantContext("canManageBranches");

    const quotaCheck = await SubscriptionService.checkCanAddBranch(businessId);
    if (!quotaCheck.allowed) {
      return NextResponse.json({ error: quotaCheck.reason }, { status: 403 });
    }

    const body = await req.json();
    const { name, code, phone, address } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Branch name and branch code (e.g. BR-02) are required." }, { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: {
        businessId,
        name,
        code: code.toUpperCase().trim(),
        phone: phone || null,
        address: address || null,
        isDefault: false,
      },
    });

    await AuditService.log({
      businessId,
      userId,
      action: "BRANCH_CREATED",
      entity: "Branch",
      entityId: branch.id,
      metadata: { name, code },
    });

    return NextResponse.json({ success: true, message: "Branch created successfully!", branch });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create branch." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Switch active branch context
    const body = await req.json();
    const { branchId } = body;

    if (!branchId) {
      return NextResponse.json({ error: "Branch ID required." }, { status: 400 });
    }

    const success = await setActiveBranch(branchId);
    return NextResponse.json({ success, message: "Active branch switched successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to switch branch." }, { status: 500 });
  }
}
