import { prisma } from "@/lib/db";

export class InventoryService {
  /**
   * Adjusts stock quantity for a product in a branch with audit movement
   */
  static async adjustStock(params: {
    businessId: string;
    branchId: string;
    productId: string;
    newQuantity: number;
    type: "MANUAL_ADJUSTMENT" | "DAMAGED_DISPOSAL" | "BRANCH_TRANSFER_IN" | "BRANCH_TRANSFER_OUT";
    notes?: string;
    userId?: string;
  }) {
    if (params.newQuantity === undefined || isNaN(params.newQuantity)) {
      throw new Error("Invalid stock quantity provided");
    }

    if (params.newQuantity < 0) {
      throw new Error("Stock quantity cannot be negative");
    }

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: params.productId, businessId: params.businessId },
      });

      if (!product) {
        throw new Error("Product not found in business catalog");
      }

      const existing = await tx.inventory.findUnique({
        where: {
          branchId_productId: {
            branchId: params.branchId,
            productId: params.productId,
          },
        },
      });

      const currentQty = existing?.quantity ?? 0;
      const difference = params.newQuantity - currentQty;

      if (existing) {
        await tx.inventory.update({
          where: { id: existing.id },
          data: { quantity: params.newQuantity },
        });
      } else {
        await tx.inventory.create({
          data: {
            branchId: params.branchId,
            productId: params.productId,
            quantity: params.newQuantity,
          },
        });
      }

      const movement = await tx.inventoryMovement.create({
        data: {
          branchId: params.branchId,
          productId: params.productId,
          type: params.type,
          quantity: difference,
          balanceAfter: params.newQuantity,
          notes: params.notes || `Stock adjusted from ${currentQty} to ${params.newQuantity}`,
        },
      });

      return movement;
    });
  }
}
