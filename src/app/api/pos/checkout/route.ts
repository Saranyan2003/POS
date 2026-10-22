import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TenantService } from "@/services/tenant.service";
import { POSService } from "@/services/pos.service";
import { AuditService } from "@/services/audit.service";
import { WhatsAppService } from "@/services/whatsapp.service";
import { formatLKR } from "@/lib/currency";

export async function POST(req: NextRequest) {
  try {
    const { session, businessId, branchId, userId, business } = await TenantService.requireTenantContext("canAccessPOS");

    const body = await req.json();
    const {
      items,
      customerId,
      orderDiscount = 0,
      taxRatePercent = 0,
      payments,
      notes,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart." }, { status: 400 });
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json({ error: "Payment details are required." }, { status: 400 });
    }

    let activeBranchId = branchId;
    if (!activeBranchId) {
      const defaultBranch = await prisma.branch.findFirst({
        where: { businessId, isDefault: true },
      });
      activeBranchId = defaultBranch?.id;
    }

    if (!activeBranchId) {
      return NextResponse.json({ error: "No active branch selected." }, { status: 400 });
    }

    // Process Transactional Sale
    const saleResult = await POSService.completeSale({
      businessId,
      branchId: activeBranchId,
      cashierId: userId,
      customerId: customerId || undefined,
      items,
      orderDiscount,
      taxRatePercent: taxRatePercent || Number(business.defaultTaxRate) || 0,
      payments,
      notes,
    });

    await AuditService.log({
      businessId,
      userId,
      action: "SALE_COMPLETED",
      entity: "Sale",
      entityId: saleResult.saleId,
      metadata: {
        invoiceNumber: saleResult.invoiceNumber,
        total: saleResult.total,
        itemsCount: items.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sale completed successfully!",
      sale: saleResult,
    });
  } catch (error: any) {
    console.error("POS Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process sale transaction." },
      { status: 500 }
    );
  }
}
