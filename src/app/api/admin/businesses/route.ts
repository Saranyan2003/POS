import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TenantService } from "@/services/tenant.service";
import { generateOwnerLoginId, generateTemporaryPassword } from "@/lib/login-id";
import { hashPassword } from "@/lib/auth";
import { WhatsAppService } from "@/services/whatsapp.service";
import { AuditService } from "@/services/audit.service";

export async function GET(req: NextRequest) {
  try {
    await TenantService.requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const businesses = await prisma.business.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { code: { contains: search } },
                { phone: { contains: search } },
                { city: { contains: search } },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
      },
      include: {
        userBusinesses: {
          where: { isOwner: true },
          include: { user: true },
        },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            products: true,
            sales: true,
            userBusinesses: true,
            branches: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, businesses });
  } catch (error: any) {
    if (error.message === "FORBIDDEN_SUPER_ADMIN_REQUIRED" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized. Super Admin privileges required." }, { status: 403 });
    }
    console.error("Fetch businesses error:", error);
    return NextResponse.json({ error: "Failed to fetch businesses." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session } = await TenantService.requireSuperAdmin();

    const body = await req.json();
    const {
      name,
      ownerName,
      phone,
      email,
      businessType,
      address,
      city,
      planCode = "STARTER",
      trialDays = 14,
    } = body;

    if (!name || !ownerName || !phone || !businessType) {
      return NextResponse.json(
        { error: "Business name, owner name, WhatsApp phone, and business type are required." },
        { status: 400 }
      );
    }

    // 1. Generate unique Owner Login ID (e.g. T2G-48291)
    const loginId = await generateOwnerLoginId();
    const tempPassword = generateTemporaryPassword(8);
    const passwordHash = await hashPassword(tempPassword);

    // 2. Resolve Plan (Single Unlimited Plan)
    let plan = await prisma.subscriptionPlan.findFirst({
      where: { code: planCode || "UNLIMITED" },
    });

    if (!plan) {
      plan = await prisma.subscriptionPlan.findFirst();
    }

    if (!plan) {
      return NextResponse.json({ error: "No active subscription plan configured." }, { status: 400 });
    }

    const now = new Date();
    const trialEndDate = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    // 3. Atomically create Business, Branch, User, and Subscription
    const result = await prisma.$transaction(async (tx) => {
      // Create Owner User
      const ownerUser = await tx.user.create({
        data: {
          loginId,
          name: ownerName,
          phone,
          email: email || null,
          passwordHash,
          isTemporaryPassword: true,
          platformRole: "USER",
          isActive: true,
        },
      });

      // Create Business
      const business = await tx.business.create({
        data: {
          name,
          code: loginId,
          businessType,
          phone,
          email: email || null,
          address: address || null,
          city: city || null,
          status: "TRIAL",
          currency: "LKR",
          timezone: "Asia/Colombo",
          branches: {
            create: {
              name: "Main Branch",
              code: "BR-01",
              phone,
              address: address || null,
              isDefault: true,
            },
          },
          subscriptions: {
            create: {
              planId: plan.id,
              status: "TRIAL",
              trialStartDate: now,
              trialEndDate,
              currentPeriodStart: now,
              currentPeriodEnd: trialEndDate,
              notes: `Initial ${trialDays}-day trial period provisioned by Super Admin`,
            },
          },
        },
        include: {
          branches: true,
        },
      });

      const defaultBranch = business.branches[0];

      // Link Owner to Business
      await tx.userBusiness.create({
        data: {
          userId: ownerUser.id,
          businessId: business.id,
          role: "BUSINESS_OWNER",
          isOwner: true,
        },
      });

      // Link Owner to Branch
      await tx.userBranch.create({
        data: {
          userId: ownerUser.id,
          branchId: defaultBranch.id,
        },
      });

      return { business, ownerUser, defaultBranch };
    });

    // 4. Construct WhatsApp Onboarding Link
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const loginUrl = `${appUrl}/login`;

    const whatsappLink = WhatsAppService.generateDirectLink({
      toPhone: phone,
      businessName: name,
      loginUrl,
      loginId,
      tempPassword,
      type: "WELCOME_OWNER",
    });

    // 5. Audit Log
    await AuditService.log({
      businessId: result.business.id,
      userId: session.userId,
      action: "BUSINESS_PROVISIONED",
      entity: "Business",
      entityId: result.business.id,
      metadata: {
        businessName: name,
        loginId,
        plan: plan.name,
        trialDays,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Business created successfully!",
      business: {
        id: result.business.id,
        name: result.business.name,
        code: result.business.code,
        businessType: result.business.businessType,
        status: result.business.status,
      },
      credentials: {
        loginId,
        tempPassword,
        loginUrl,
        whatsappNumber: phone,
        whatsappLink,
      },
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN_SUPER_ADMIN_REQUIRED" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized. Super Admin privileges required." }, { status: 403 });
    }
    console.error("Create Business Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the business." },
      { status: 500 }
    );
  }
}
