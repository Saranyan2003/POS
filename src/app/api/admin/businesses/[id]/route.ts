import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TenantService } from "@/services/tenant.service";
import { generateTemporaryPassword } from "@/lib/login-id";
import { hashPassword } from "@/lib/auth";
import { WhatsAppService } from "@/services/whatsapp.service";
import { AuditService } from "@/services/audit.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await TenantService.requireSuperAdmin();
    const { id } = await params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        branches: true,
        userBusinesses: {
          include: { user: true },
        },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            products: true,
            sales: true,
            customers: true,
            suppliers: true,
            expenses: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, business });
  } catch (error: any) {
    if (error.message === "FORBIDDEN_SUPER_ADMIN_REQUIRED" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch business details." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session } = await TenantService.requireSuperAdmin();
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        userBusinesses: {
          where: { isOwner: true },
          include: { user: true },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    // ACTION: EDIT BUSINESS DETAILS
    if (action === "EDIT_BUSINESS") {
      const { name, ownerName, phone, businessType, city, address } = body;

      const updatedBusiness = await prisma.business.update({
        where: { id },
        data: {
          name: name?.trim() || business.name,
          phone: phone?.trim() || business.phone,
          businessType: businessType || business.businessType,
          city: city?.trim() || business.city,
          address: address?.trim() || business.address,
        },
      });

      const owner = business.userBusinesses[0]?.user;
      if (owner && ownerName?.trim()) {
        await prisma.user.update({
          where: { id: owner.id },
          data: {
            name: ownerName.trim(),
            phone: phone?.trim() || owner.phone,
          },
        });
      }

      await AuditService.log({
        businessId: id,
        userId: session.userId,
        action: "BUSINESS_DETAILS_EDITED",
        entity: "Business",
        entityId: id,
        metadata: { name, ownerName, phone },
      });

      return NextResponse.json({
        success: true,
        message: "Business details updated successfully!",
        business: updatedBusiness,
      });
    }

    // ACTION: SUSPEND / ACTIVATE / TOGGLE STATUS
    if (action === "TOGGLE_STATUS" || action === "SUSPEND" || action === "ACTIVATE") {
      let newStatus: string;
      if (action === "SUSPEND") {
        newStatus = "SUSPENDED";
      } else if (action === "ACTIVATE") {
        newStatus = "ACTIVE";
      } else {
        newStatus = business.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
      }

      const updated = await prisma.business.update({
        where: { id },
        data: { status: newStatus },
      });

      const latestSub = await prisma.subscription.findFirst({
        where: { businessId: id },
        orderBy: { createdAt: "desc" },
      });

      if (latestSub) {
        await prisma.subscription.update({
          where: { id: latestSub.id },
          data: { status: newStatus },
        });
      }

      await AuditService.log({
        businessId: id,
        userId: session.userId,
        action: newStatus === "SUSPENDED" ? "BUSINESS_SUSPENDED" : "BUSINESS_ACTIVATED",
        entity: "Business",
        entityId: id,
      });

      return NextResponse.json({
        success: true,
        message: `Business ${newStatus === "SUSPENDED" ? "suspended" : "activated"} successfully.`,
        status: updated.status,
      });
    }

    // ACTION: RESET OWNER PASSWORD (Generate new Temporary Password)
    if (action === "RESET_PASSWORD") {
      const owner = business.userBusinesses[0]?.user;
      if (!owner) {
        return NextResponse.json({ error: "No owner user found for this business." }, { status: 400 });
      }

      const tempPassword = generateTemporaryPassword(8);
      const passwordHash = await hashPassword(tempPassword);

      await prisma.user.update({
        where: { id: owner.id },
        data: {
          passwordHash,
          isTemporaryPassword: true,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const loginUrl = `${appUrl}/login`;
      const whatsappLink = WhatsAppService.generateDirectLink({
        toPhone: business.phone,
        businessName: business.name,
        loginUrl,
        loginId: owner.loginId,
        tempPassword,
        type: "PASSWORD_RESET",
      });

      await AuditService.log({
        businessId: id,
        userId: session.userId,
        action: "OWNER_PASSWORD_RESET_ADMIN",
        entity: "User",
        entityId: owner.id,
      });

      return NextResponse.json({
        success: true,
        message: "New temporary password generated successfully!",
        credentials: {
          businessName: business.name,
          loginId: owner.loginId,
          tempPassword,
          loginUrl,
          whatsappLink,
        },
      });
    }

    // ACTION: EDIT / EXTEND TRIAL PERIOD
    if (action === "EXTEND_TRIAL" || action === "SET_TRIAL") {
      const { days, additionalDays, newDate } = body;
      const trialDaysCount = days || additionalDays || 14;

      const latestSub = await prisma.subscription.findFirst({
        where: { businessId: id },
        orderBy: { createdAt: "desc" },
      });

      let newTrialEnd: Date;
      if (newDate) {
        newTrialEnd = new Date(newDate);
      } else {
        const baseDate = action === "EXTEND_TRIAL" && latestSub?.trialEndDate && new Date(latestSub.trialEndDate) > new Date()
          ? new Date(latestSub.trialEndDate)
          : new Date();
        newTrialEnd = new Date(baseDate.getTime() + trialDaysCount * 24 * 60 * 60 * 1000);
      }

      if (latestSub) {
        await prisma.subscription.update({
          where: { id: latestSub.id },
          data: {
            status: "TRIAL",
            trialEndDate: newTrialEnd,
            currentPeriodEnd: newTrialEnd,
          },
        });
      }

      await prisma.business.update({
        where: { id },
        data: { status: "TRIAL" },
      });

      await AuditService.log({
        businessId: id,
        userId: session.userId,
        action: "TRIAL_EXTENDED",
        entity: "Subscription",
        metadata: { newTrialEnd },
      });

      return NextResponse.json({
        success: true,
        message: `Trial updated successfully until ${newTrialEnd.toLocaleDateString("en-LK")}.`,
        newTrialEnd,
      });
    }

    // ACTION: ACTIVATE PAID SUBSCRIPTION
    if (action === "ACTIVATE_PAID") {
      const { durationMonths = 1 } = body;
      const now = new Date();
      const periodEnd = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);

      const latestSub = await prisma.subscription.findFirst({
        where: { businessId: id },
        orderBy: { createdAt: "desc" },
      });

      if (latestSub) {
        await prisma.subscription.update({
          where: { id: latestSub.id },
          data: {
            status: "ACTIVE",
            trialEndDate: null,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            notes: `Paid subscription activated by Super Admin (${durationMonths} month(s))`,
          },
        });
      }

      await prisma.business.update({
        where: { id },
        data: { status: "ACTIVE" },
      });

      await AuditService.log({
        businessId: id,
        userId: session.userId,
        action: "SUBSCRIPTION_ACTIVATED_PAID",
        entity: "Business",
        metadata: { durationMonths, periodEnd },
      });

      return NextResponse.json({
        success: true,
        message: `Business converted to Active Paid Subscription (${durationMonths} mo) successfully!`,
      });
    }

    return NextResponse.json({ error: "Unknown action specified." }, { status: 400 });
  } catch (error: any) {
    if (error.message === "FORBIDDEN_SUPER_ADMIN_REQUIRED" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update business." }, { status: 500 });
  }
}
