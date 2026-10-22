import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { AuditService } from "@/services/audit.service";

export async function GET() {
  try {
    const { businessId } = await TenantService.requireTenantContext();

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        branches: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, business });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch settings." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { businessId, userId } = await TenantService.requireTenantContext("canManageSettings");
    const body = await req.json();

    const {
      name,
      phone,
      email,
      businessType,
      address,
      city,
      taxNumber,
      defaultTaxRate,
      receiptHeader,
      receiptFooter,
    } = body;

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: name ? name.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        email: email !== undefined ? (email ? email.trim() : null) : undefined,
        businessType: businessType ? businessType.trim() : undefined,
        address: address !== undefined ? (address ? address.trim() : null) : undefined,
        city: city !== undefined ? (city ? city.trim() : null) : undefined,
        taxNumber: taxNumber !== undefined ? (taxNumber ? taxNumber.trim() : null) : undefined,
        defaultTaxRate: defaultTaxRate !== undefined ? parseFloat(defaultTaxRate) : undefined,
        receiptHeader: receiptHeader !== undefined ? receiptHeader : undefined,
        receiptFooter: receiptFooter !== undefined ? receiptFooter : undefined,
      },
    });

    await AuditService.log({
      businessId,
      userId,
      action: "SETTINGS_UPDATED",
      entity: "Business",
      entityId: businessId,
      metadata: { name: updatedBusiness.name },
    });

    return NextResponse.json({
      success: true,
      message: "Business settings updated successfully!",
      business: updatedBusiness,
    });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to update business settings." }, { status: 500 });
  }
}
