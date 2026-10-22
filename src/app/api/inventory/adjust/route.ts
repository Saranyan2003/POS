import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { InventoryService } from "@/services/inventory.service";
import { AuditService } from "@/services/audit.service";

export async function POST(req: NextRequest) {
  try {
    const { businessId, branchId, userId } = await TenantService.requireTenantContext("canManageInventory");
    const body = await req.json();
    const { productId, newQuantity, type = "MANUAL_ADJUSTMENT", notes } = body;

    if (!productId || newQuantity === undefined) {
      return NextResponse.json({ error: "Product ID and new stock quantity are required." }, { status: 400 });
    }

    if (!branchId) {
      return NextResponse.json({ error: "Active branch required for stock adjustment." }, { status: 400 });
    }

    const movement = await InventoryService.adjustStock({
      businessId,
      branchId,
      productId,
      newQuantity: parseFloat(newQuantity),
      type,
      notes,
      userId,
    });

    await AuditService.log({
      businessId,
      userId,
      action: "STOCK_ADJUSTED",
      entity: "Inventory",
      entityId: productId,
      metadata: { newQuantity, type, notes },
    });

    return NextResponse.json({ success: true, message: "Inventory adjusted successfully!", movement });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to adjust inventory." }, { status: 500 });
  }
}
