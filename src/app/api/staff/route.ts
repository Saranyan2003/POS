import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { SubscriptionService } from "@/services/subscription.service";
import { generateEmployeeLoginId, generateTemporaryPassword } from "@/lib/login-id";
import { hashPassword } from "@/lib/auth";
import { WhatsAppService } from "@/services/whatsapp.service";
import { AuditService } from "@/services/audit.service";

export async function GET(req: NextRequest) {
  try {
    const { businessId, branchId } = await TenantService.requireTenantContext("canManageStaff");
    const { searchParams } = new URL(req.url);
    const branchParam = searchParams.get("branchId");

    const targetBranchId = branchId ? branchId : (branchParam && branchParam !== "ALL" ? branchParam : undefined);

    const staffMembers = await prisma.userBusiness.findMany({
      where: {
        businessId,
        ...(targetBranchId
          ? {
              user: {
                userBranches: {
                  some: { branchId: targetBranchId },
                },
              },
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            loginId: true,
            name: true,
            phone: true,
            email: true,
            isActive: true,
            isTemporaryPassword: true,
            lastLoginAt: true,
            createdAt: true,
            userBranches: {
              include: {
                branch: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      staff: staffMembers.map((sm) => ({
        ...sm.user,
        role: sm.role,
        isOwner: sm.isOwner,
        branch: sm.user.userBranches[0]?.branch || null,
      })),
      activeBranchId: targetBranchId || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch staff members." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, branchId, userId, business } = await TenantService.requireTenantContext("canManageStaff");

    // Check staff plan limits
    const quotaCheck = await SubscriptionService.checkCanAddEmployee(businessId);
    if (!quotaCheck.allowed) {
      return NextResponse.json({ error: quotaCheck.reason }, { status: 403 });
    }

    const body = await req.json();
    const { name, phone, email, role = "CASHIER", assignedBranchId } = body;

    if (!name || !phone || !role) {
      return NextResponse.json({ error: "Staff name, phone, and role are required." }, { status: 400 });
    }

    const targetBranchId = assignedBranchId || branchId;

    // Generate unique EMP-XXXXX login ID and temporary password
    const loginId = await generateEmployeeLoginId();
    const tempPassword = generateTemporaryPassword(8);
    const passwordHash = await hashPassword(tempPassword);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          loginId,
          name,
          phone,
          email: email || null,
          passwordHash,
          isTemporaryPassword: true,
          platformRole: "USER",
          isActive: true,
        },
      });

      // 2. Link User to Business
      await tx.userBusiness.create({
        data: {
          userId: user.id,
          businessId,
          role,
          isOwner: false,
        },
      });

      // 3. Link User to Branch if branch specified
      if (targetBranchId) {
        await tx.userBranch.create({
          data: {
            userId: user.id,
            branchId: targetBranchId,
          },
        });
      }

      return user;
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const loginUrl = `${appUrl}/login`;

    const whatsappLink = WhatsAppService.generateDirectLink({
      toPhone: phone,
      businessName: business.name,
      loginUrl,
      loginId,
      tempPassword,
      type: "WELCOME_STAFF",
    });

    await AuditService.log({
      businessId,
      userId,
      action: "STAFF_CREATED",
      entity: "User",
      entityId: result.id,
      metadata: { name, role, loginId },
    });

    return NextResponse.json({
      success: true,
      message: "Staff account created successfully!",
      staff: {
        id: result.id,
        loginId: result.loginId,
        name: result.name,
        role,
      },
      credentials: {
        loginId,
        tempPassword,
        loginUrl,
        whatsappLink,
      },
    });
  } catch (error: any) {
    console.error("Staff creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create staff account." }, { status: 500 });
  }
}
