import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { POSService } from "@/services/pos.service";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { businessId, branchId, userId } = await TenantService.requireTenantContext("canAccessPOS");
    const body = await req.json();
    const { items, customerId, holdNote } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const heldSale = await POSService.holdSale({
      businessId,
      branchId: branchId || "",
      cashierId: userId,
      customerId,
      items,
      holdNote,
    });

    return NextResponse.json({
      success: true,
      message: "Cart held successfully.",
      heldSale,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to hold sale." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { businessId } = await TenantService.requireTenantContext("canAccessPOS");

    const heldSales = await prisma.sale.findMany({
      where: {
        businessId,
        status: "HELD",
      },
      include: {
        items: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, heldSales });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch held sales." }, { status: 500 });
  }
}
