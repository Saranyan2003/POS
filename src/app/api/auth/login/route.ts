import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { AuditService } from "@/services/audit.service";

export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json();

    if (!loginId || !password) {
      return NextResponse.json(
        { error: "Please enter your Login ID and password." },
        { status: 400 }
      );
    }

    const trimmedLoginId = loginId.trim().toUpperCase();

    // Look up user by unique Login ID
    const user = await prisma.user.findUnique({
      where: { loginId: trimmedLoginId },
      include: {
        userBusinesses: {
          include: {
            business: true,
          },
        },
      },
    });

    // Generic error message to prevent account enumeration
    const genericAuthError = "Invalid login credentials.";

    if (!user) {
      return NextResponse.json({ error: genericAuthError }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "This account has been disabled. Please contact your administrator." },
        { status: 403 }
      );
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: "Account temporarily locked due to multiple failed attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Verify Password
    const isMatch = await verifyPassword(password, user.passwordHash);

    if (!isMatch) {
      // Increment failed attempts
      const newAttempts = user.failedLoginAttempts + 1;
      const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil,
        },
      });

      await AuditService.log({
        userId: user.id,
        action: "LOGIN_FAILED",
        entity: "User",
        entityId: user.id,
        metadata: { loginId: trimmedLoginId, attemptCount: newAttempts },
      });

      return NextResponse.json({ error: genericAuthError }, { status: 401 });
    }

    // Reset failed attempts & update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const activeBusiness = user.userBusinesses[0]?.business;
    const businessRole = user.userBusinesses[0]?.role;

    // Check if business trial has finished or business is suspended
    if (activeBusiness && user.platformRole !== "SUPER_ADMIN") {
      const latestSub = await prisma.subscription.findFirst({
        where: { businessId: activeBusiness.id },
        orderBy: { createdAt: "desc" },
      });

      const isTrial = activeBusiness.status === "TRIAL" || latestSub?.status === "TRIAL";
      const isExpiredTrial = isTrial && latestSub?.trialEndDate && new Date() > new Date(latestSub.trialEndDate);

      if (isExpiredTrial) {
        await prisma.business.update({
          where: { id: activeBusiness.id },
          data: { status: "SUSPENDED" },
        });

        if (latestSub) {
          await prisma.subscription.update({
            where: { id: latestSub.id },
            data: { status: "SUSPENDED" },
          });
        }

        return NextResponse.json(
          { error: "Your free trial period has ended. Your business account is automatically suspended. Please contact Ticket2Grow support to activate your subscription." },
          { status: 403 }
        );
      }

      if (activeBusiness.status === "SUSPENDED") {
        return NextResponse.json(
          { error: "Your business account has been suspended. Please contact Ticket2Grow support to activate." },
          { status: 403 }
        );
      }
    }

    // Create session
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    await createSession(user.id, activeBusiness?.id, undefined, ip, userAgent);

    await AuditService.log({
      businessId: activeBusiness?.id,
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entity: "User",
      entityId: user.id,
      metadata: { role: user.platformRole === "SUPER_ADMIN" ? "SUPER_ADMIN" : businessRole },
      ipAddress: ip,
      userAgent,
    });

    // Determine target redirect
    let redirectTo = "/dashboard";
    if (user.isTemporaryPassword) {
      redirectTo = "/change-password";
    } else if (user.platformRole === "SUPER_ADMIN") {
      redirectTo = "/admin/dashboard";
    } else if (businessRole === "CASHIER") {
      redirectTo = "/pos";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        platformRole: user.platformRole,
        businessRole,
        businessName: activeBusiness?.name,
        isTemporaryPassword: user.isTemporaryPassword,
      },
      redirectTo,
    });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}
