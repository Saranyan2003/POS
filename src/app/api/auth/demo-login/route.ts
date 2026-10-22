import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { AuditService } from "@/services/audit.service";

export const DEMO_ACCOUNTS_METADATA = [
  {
    id: "grocery_retail",
    industry: "Grocery & Retail",
    businessName: "Lanka Fresh Supermarket",
    badge: "Supermarket & Provisions",
    icon: "ShoppingBag",
    color: "#059669", // Emerald
    branches: ["Main Supermarket - Colombo 03", "Kandy City Branch"],
    owner: {
      loginId: "OWN-GROCERY",
      name: "Sunil Perera",
      role: "Business Owner",
      roleCode: "BUSINESS_OWNER",
      password: "Demo1234!",
      destination: "Dashboard & Full Access",
    },
    employee: {
      loginId: "EMP-GROCERY",
      name: "Kasun Jayasuriya",
      role: "Counter Cashier",
      roleCode: "CASHIER",
      password: "Demo1234!",
      destination: "Fast POS Checkout",
    },
  },
  {
    id: "restaurant_cafe",
    industry: "Restaurant & Cafe",
    businessName: "Kottu & Cafe House",
    badge: "Kitchen & Dining Terminal",
    icon: "Utensils",
    color: "#ea580c", // Orange
    branches: ["Central Kitchen - Colombo 04", "Galle Beach Cafe"],
    owner: {
      loginId: "OWN-CAFE",
      name: "Nimal Fernando",
      role: "Restaurateur / Owner",
      roleCode: "BUSINESS_OWNER",
      password: "Demo1234!",
      destination: "Dashboard & Menu Controls",
    },
    employee: {
      loginId: "EMP-CAFE",
      name: "Dinesh Bandara",
      role: "Kitchen POS Cashier",
      roleCode: "CASHIER",
      password: "Demo1234!",
      destination: "Fast POS Order Billing",
    },
  },
  {
    id: "bakery_takeaway",
    industry: "Bakery & Takeaway",
    businessName: "Perera Bake House",
    badge: "Bakery & Daily Pastries",
    icon: "Croissant",
    color: "#d97706", // Amber
    branches: ["Main Bakery - Dehiwala", "Nugegoda Super Outlet"],
    owner: {
      loginId: "OWN-BAKERY",
      name: "Chamal Perera",
      role: "Head Baker / Owner",
      roleCode: "BUSINESS_OWNER",
      password: "Demo1234!",
      destination: "Dashboard & Batch Stats",
    },
    employee: {
      loginId: "EMP-BAKERY",
      name: "Ruwan Silva",
      role: "Front Counter Cashier",
      roleCode: "CASHIER",
      password: "Demo1234!",
      destination: "Counter POS Terminal",
    },
  },
  {
    id: "pharmacy",
    industry: "Pharmacy",
    businessName: "MediCare Wellness Pharmacy",
    badge: "Dispensary & OTC Health",
    icon: "Cross",
    color: "#0891b2", // Cyan
    branches: ["Dispensary - Maharagama", "Negombo Town Branch"],
    owner: {
      loginId: "OWN-PHARM",
      name: "Dr. Anura Senanayake",
      role: "Chief Pharmacist / Owner",
      roleCode: "BUSINESS_OWNER",
      password: "Demo1234!",
      destination: "Dashboard & Inventory Stock",
    },
    employee: {
      loginId: "EMP-PHARM",
      name: "Sanduni Wickramasinghe",
      role: "Dispensary Cashier",
      roleCode: "CASHIER",
      password: "Demo1234!",
      destination: "Dispensary POS Terminal",
    },
  },
  {
    id: "clothing_store",
    industry: "Clothing Store",
    businessName: "City Style Boutique",
    badge: "Fashion & Garments",
    icon: "Shirt",
    color: "#db2777", // Pink
    branches: ["Flagship Boutique - Colombo 07", "Kandy City Center Branch"],
    owner: {
      loginId: "OWN-FASHION",
      name: "Malini Wijesinghe",
      role: "Boutique Owner",
      roleCode: "BUSINESS_OWNER",
      password: "Demo1234!",
      destination: "Dashboard & Apparel Catalog",
    },
    employee: {
      loginId: "EMP-FASHION",
      name: "Praveen Rathnayake",
      role: "Showroom Cashier",
      roleCode: "CASHIER",
      password: "Demo1234!",
      destination: "Boutique POS Checkout",
    },
  },
  {
    id: "electronics_mobile",
    industry: "Electronics & Mobile",
    businessName: "iTech Mobile & Gadgets",
    badge: "Devices, Phones & Spares",
    icon: "Smartphone",
    color: "#4f46e5", // Indigo
    branches: ["Main Tech Store - Liberty Plaza", "Majestic City Branch"],
    owner: {
      loginId: "OWN-TECH",
      name: "Sahan Gunasekara",
      role: "Tech Store Owner",
      roleCode: "BUSINESS_OWNER",
      password: "Demo1234!",
      destination: "Dashboard & Device Catalog",
    },
    employee: {
      loginId: "EMP-TECH",
      name: "Nuwan Kumara",
      role: "Store Technician / Cashier",
      roleCode: "CASHIER",
      password: "Demo1234!",
      destination: "Tech POS Terminal",
    },
  },
  {
    id: "wholesale",
    industry: "Wholesale",
    businessName: "Lanka Wholesale Hardware",
    badge: "Bulk Hardware & Building",
    icon: "Truck",
    color: "#475569", // Slate
    branches: ["Pettah Wholesale Yard", "Wattala Storage Depot"],
    owner: {
      loginId: "OWN-WHOLESALE",
      name: "Ranjith Alwis",
      role: "Managing Director",
      roleCode: "BUSINESS_OWNER",
      password: "Demo1234!",
      destination: "Dashboard & Yard Stock",
    },
    employee: {
      loginId: "EMP-WHOLESALE",
      name: "Kavinda Thilakarathne",
      role: "Dispatch Cashier",
      roleCode: "CASHIER",
      password: "Demo1234!",
      destination: "Bulk Billing POS Terminal",
    },
  },
  {
    id: "salon_barber",
    industry: "Salon & Barber",
    businessName: "Crown & Blade Luxury Salon",
    badge: "Grooming & Spa Services",
    icon: "Scissors",
    color: "#7c3aed", // Violet
    branches: ["Salon Main - Bambalapitiya", "Rajagiriya Spa Branch"],
    owner: {
      loginId: "OWN-SALON",
      name: "Ayesha De Silva",
      role: "Salon Director / Owner",
      roleCode: "BUSINESS_OWNER",
      password: "Demo1234!",
      destination: "Dashboard & Service Menu",
    },
    employee: {
      loginId: "EMP-SALON",
      name: "Roshan Mendis",
      role: "Stylist / Front Cashier",
      roleCode: "CASHIER",
      password: "Demo1234!",
      destination: "Salon Front Desk POS",
    },
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    commonPassword: "Demo1234!",
    admin: {
      loginId: "ADMIN-0001",
      name: "SaaS Super Admin",
      role: "Platform Super Administrator",
      roleCode: "SUPER_ADMIN",
      password: "AdminPassword@123",
      destination: "Super Admin Portal",
    },
    industries: DEMO_ACCOUNTS_METADATA,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { loginId } = await req.json();

    if (!loginId) {
      return NextResponse.json({ error: "Missing loginId parameter." }, { status: 400 });
    }

    const trimmedLoginId = String(loginId).trim().toUpperCase();

    // Look up user by unique Login ID
    const user = await prisma.user.findUnique({
      where: { loginId: trimmedLoginId },
      include: {
        userBusinesses: {
          include: {
            business: true,
          },
        },
        userBranches: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: `Demo account '${trimmedLoginId}' not found. Please ensure database is seeded.` }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "This demo account is deactivated." }, { status: 403 });
    }

    // Reset temporary password flag and failed attempts if any
    if (user.isTemporaryPassword || user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isTemporaryPassword: false,
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });
    }

    const activeBusiness = user.userBusinesses[0]?.business;
    const businessRole = user.userBusinesses[0]?.role;
    let activeBranchId: string | undefined = user.userBranches[0]?.branchId;

    if (!activeBranchId && activeBusiness) {
      const defaultBranch = await prisma.branch.findFirst({
        where: { businessId: activeBusiness.id, isDefault: true },
      });
      activeBranchId = defaultBranch?.id;
    }

    // Create session
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    await createSession(user.id, activeBusiness?.id, activeBranchId, ip, userAgent);

    await AuditService.log({
      businessId: activeBusiness?.id,
      userId: user.id,
      action: "DEMO_LOGIN_SUCCESS",
      entity: "User",
      entityId: user.id,
      metadata: { role: user.platformRole === "SUPER_ADMIN" ? "SUPER_ADMIN" : businessRole, loginId: trimmedLoginId },
      ipAddress: ip,
      userAgent,
    });

    // Determine target redirect
    let redirectTo = "/dashboard";
    if (user.platformRole === "SUPER_ADMIN") {
      redirectTo = "/admin/dashboard";
    } else if (businessRole === "CASHIER") {
      redirectTo = "/pos";
    }

    return NextResponse.json({
      success: true,
      redirectTo,
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        platformRole: user.platformRole,
        businessRole,
        businessName: activeBusiness?.name,
        branchId: activeBranchId,
      },
    });
  } catch (error: any) {
    console.error("Demo Login API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during demo 1-click authentication." },
      { status: 500 }
    );
  }
}
