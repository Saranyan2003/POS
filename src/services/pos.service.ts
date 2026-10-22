import { prisma } from "@/lib/db";
import { calculateOrderTotals } from "@/lib/currency";
import { AuditService } from "./audit.service";

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface CheckoutPaymentInput {
  method: "CASH" | "CARD" | "BANK_TRANSFER" | "CREDIT" | "OTHER";
  amount: number;
  tenderedAmount?: number;
  changeAmount?: number;
  transactionRef?: string;
}

export interface ProcessSaleInput {
  businessId: string;
  branchId: string;
  cashierId: string;
  customerId?: string;
  items: CheckoutItemInput[];
  orderDiscount?: number;
  taxRatePercent?: number;
  payments: CheckoutPaymentInput[];
  notes?: string;
}

export class POSService {
  /**
   * Generates sequential, clean invoice number (e.g., INV-202609-0001)
   */
  static async generateInvoiceNumber(businessId: string): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prefix = `INV-${yearMonth}-`;

    const lastSale = await prisma.sale.findFirst({
      where: {
        businessId,
        invoiceNumber: { startsWith: prefix },
      },
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true },
    });

    let seq = 1;
    if (lastSale?.invoiceNumber) {
      const parts = lastSale.invoiceNumber.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${String(seq).padStart(4, "0")}`;
  }

  /**
   * Executes a safe, ACID-compliant sale transaction with full credit and stock validation
   */
  static async completeSale(input: ProcessSaleInput) {
    if (!input.items || input.items.length === 0) {
      throw new Error("Cannot checkout an empty cart");
    }

    if (!input.payments || input.payments.length === 0) {
      throw new Error("Payment information is required to complete sale");
    }

    // Validate Item quantities
    for (const item of input.items) {
      if (!item.productId) {
        throw new Error("Invalid item: product ID missing");
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        throw new Error("Item quantity must be greater than zero");
      }
      if (typeof item.unitPrice !== "number" || item.unitPrice < 0) {
        throw new Error("Item unit price cannot be negative");
      }
    }

    // Check Credit Payment Condition:
    // If any payment method is "CREDIT", a registered customer is strictly required!
    const creditPayments = input.payments.filter((p) => p.method === "CREDIT");
    const totalCreditAmount = creditPayments.reduce((sum, p) => sum + (parseFloat(p.amount as any) || 0), 0);

    if (totalCreditAmount > 0) {
      if (!input.customerId) {
        throw new Error("A registered customer account is required to process a Credit (Khata) sale.");
      }
    }

    // Run within a Prisma transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Verify Customer exists and belongs to this business if provided
      let customerRecord = null;
      if (input.customerId) {
        customerRecord = await tx.customer.findFirst({
          where: { id: input.customerId, businessId: input.businessId },
        });
        if (!customerRecord) {
          throw new Error("Selected customer does not exist in this business directory.");
        }
      }

      // 2. Fetch product details and check stock
      const productIds = input.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          businessId: input.businessId,
          isActive: true,
        },
        include: {
          inventory: {
            where: { branchId: input.branchId },
          },
        },
      });

      if (products.length !== productIds.length) {
        throw new Error("One or more items in the cart are invalid or inactive");
      }

      // STRICT INVENTORY CHECK: Prevent selling when requested quantity exceeds available branch stock
      // Services (Haircuts, Sessions) and Made-to-Order food (Kottu, Fresh Tea) are always fulfilled on demand
      for (const item of input.items) {
        const prod = products.find((p) => p.id === item.productId)!;
        const unitLower = (prod.unit || "pcs").toLowerCase().trim();
        const isService = unitLower === "service" || unitLower === "session" || unitLower === "treatment" || unitLower === "hour" || unitLower === "job";
        const isMadeToOrder = isService || unitLower === "portion" || unitLower === "plate" || unitLower === "cup" || unitLower === "glass";
        const availableStock = prod.inventory[0]?.quantity ?? 0;

        if (!isService && !isMadeToOrder && availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${prod.name}". Available: ${availableStock} ${prod.unit || "pcs"}, Requested: ${item.quantity} ${prod.unit || "pcs"}. Sales cannot exceed available stock.`
          );
        }
      }

      // Map products with costs
      const enrichedItems = input.items.map((item) => {
        const prod = products.find((p) => p.id === item.productId)!;
        return {
          ...item,
          productName: prod.name,
          costPrice: prod.costPrice || 0,
        };
      });

      // 3. Exact Decimal calculations
      const totals = calculateOrderTotals(
        enrichedItems.map((i) => ({
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
          costPrice: i.costPrice,
        })),
        input.orderDiscount || 0,
        input.taxRatePercent || 0
      );

      // Validate payment totals
      const totalPaidAmount = input.payments.reduce((sum, p) => sum + (parseFloat(p.amount as any) || 0), 0);
      if (Math.abs(totalPaidAmount - totals.grandTotal) > 0.05 && totalPaidAmount < totals.grandTotal) {
        throw new Error(
          `Payment amount (Rs. ${totalPaidAmount.toFixed(2)}) does not cover the required total (Rs. ${totals.grandTotal.toFixed(2)})`
        );
      }

      // 4. Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(input.businessId);

      // 5. Create Sale Record
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          businessId: input.businessId,
          branchId: input.branchId,
          cashierId: input.cashierId,
          customerId: input.customerId || null,
          subtotal: totals.subtotal,
          discount: totals.totalDiscount,
          tax: totals.taxAmount,
          total: totals.grandTotal,
          totalCost: totals.totalCost,
          status: "COMPLETED",
          holdNote: input.notes,
        },
      });

      // 6. Create Sale Items & Update Branch Inventory for physical goods
      for (const item of enrichedItems) {
        const prod = products.find((p) => p.id === item.productId)!;
        const unitLower = (prod.unit || "pcs").toLowerCase().trim();
        const isService = unitLower === "service" || unitLower === "session" || unitLower === "treatment" || unitLower === "hour" || unitLower === "job";
        const lineTotal = item.quantity * item.unitPrice - (item.discount || 0);

        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unitCost: item.costPrice,
            discount: item.discount || 0,
            total: Math.max(0, lineTotal),
          },
        });

        // Only update physical branch inventory for physical retail items, not labor services
        if (!isService) {
          const existingInv = await tx.inventory.findUnique({
            where: {
              branchId_productId: {
                branchId: input.branchId,
                productId: item.productId,
              },
            },
          });

          const currentQty = existingInv?.quantity ?? 0;
          const newQty = Math.max(0, currentQty - item.quantity);

          if (existingInv) {
            await tx.inventory.update({
              where: { id: existingInv.id },
              data: { quantity: newQty },
            });
          } else if (currentQty > 0) {
            await tx.inventory.create({
              data: {
                branchId: input.branchId,
                productId: item.productId,
                quantity: newQty,
              },
            });
          }

          // Record stock movement
          await tx.inventoryMovement.create({
            data: {
              branchId: input.branchId,
              productId: item.productId,
              type: "SALE",
              quantity: -item.quantity,
              balanceAfter: newQty,
              referenceId: sale.id,
              notes: `POS Sale ${invoiceNumber}`,
            },
          });
        }
      }

      // 7. Create Payments records
      for (const p of input.payments) {
        await tx.payment.create({
          data: {
            saleId: sale.id,
            method: p.method,
            amount: parseFloat(p.amount as any) || 0,
            tenderedAmount: p.tenderedAmount !== undefined ? parseFloat(p.tenderedAmount as any) : null,
            changeAmount: p.changeAmount !== undefined ? parseFloat(p.changeAmount as any) : null,
            transactionRef: p.transactionRef || null,
          },
        });
      }

      // 8. Update Customer Metrics & Khata Credit Balance if customer attached
      if (input.customerId && customerRecord) {
        const creditAmount = input.payments
          .filter((p) => p.method === "CREDIT")
          .reduce((sum, p) => sum + (parseFloat(p.amount as any) || 0), 0);

        await tx.customer.update({
          where: { id: input.customerId },
          data: {
            totalSpent: { increment: totals.grandTotal },
            purchaseCount: { increment: 1 },
            ...(creditAmount > 0 ? { creditBalance: { increment: creditAmount } } : {}),
          },
        });
      }

      return {
        saleId: sale.id,
        invoiceNumber: sale.invoiceNumber,
        total: totals.grandTotal,
        subtotal: totals.subtotal,
        discount: totals.totalDiscount,
        tax: totals.taxAmount,
        createdAt: sale.createdAt,
      };
    });
  }

  /**
   * Holds a pending cart for later checkout
   */
  static async holdSale(input: {
    businessId: string;
    branchId: string;
    cashierId: string;
    customerId?: string;
    items: CheckoutItemInput[];
    holdNote?: string;
  }) {
    const invoiceNumber = `HOLD-${Date.now().toString().slice(-6)}`;
    const subtotal = input.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

    return await prisma.sale.create({
      data: {
        invoiceNumber,
        businessId: input.businessId,
        branchId: input.branchId,
        cashierId: input.cashierId,
        customerId: input.customerId || null,
        subtotal,
        total: subtotal,
        status: "HELD",
        holdNote: input.holdNote || "Held Cart",
        items: {
          create: input.items.map((i) => ({
            productId: i.productId,
            productName: "Held Item",
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.quantity * i.unitPrice,
          })),
        },
      },
    });
  }

  /**
   * Processes a return/refund with automatic stock restoration and customer Khata credit balance reversal
   */
  static async processReturn(input: {
    saleId: string;
    businessId: string;
    branchId: string;
    processedById: string;
    reason: string;
    items: Array<{ productId: string; quantity: number; refundPrice: number }>;
  }) {
    return await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: input.saleId },
        include: {
          items: true,
          payments: true,
          customer: true,
        },
      });

      if (!sale || sale.businessId !== input.businessId) {
        throw new Error("Sale record not found");
      }

      if (sale.status === "REFUNDED") {
        throw new Error("This sale invoice has already been fully refunded.");
      }

      const totalRefund = input.items.reduce((sum, item) => sum + item.quantity * item.refundPrice, 0);
      const returnNumber = `RET-${Date.now().toString().slice(-6)}`;

      const returnRecord = await tx.return.create({
        data: {
          saleId: sale.id,
          returnNumber,
          refundAmount: totalRefund,
          reason: input.reason,
          processedById: input.processedById,
          items: {
            create: input.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              refundPrice: i.refundPrice,
            })),
          },
        },
      });

      // 1. Restore stock for each returned item
      for (const item of input.items) {
        const inv = await tx.inventory.findUnique({
          where: {
            branchId_productId: {
              branchId: input.branchId,
              productId: item.productId,
            },
          },
        });

        const currentQty = inv?.quantity ?? 0;
        const newQty = currentQty + item.quantity;

        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: newQty },
          });
        } else {
          await tx.inventory.create({
            data: {
              branchId: input.branchId,
              productId: item.productId,
              quantity: newQty,
            },
          });
        }

        await tx.inventoryMovement.create({
          data: {
            branchId: input.branchId,
            productId: item.productId,
            type: "SALE_RETURN",
            quantity: item.quantity,
            balanceAfter: newQty,
            referenceId: returnRecord.id,
            notes: `Refund for Sale ${sale.invoiceNumber}: ${input.reason}`,
          },
        });
      }

      // 2. Adjust Customer metrics and Khata credit balance if applicable
      if (sale.customerId && sale.customer) {
        // Calculate if original sale had credit payment
        const creditPayments = sale.payments.filter((p) => p.method === "CREDIT");
        const originalCreditAmount = creditPayments.reduce((sum, p) => sum + p.amount, 0);

        // Calculate credit balance reversal (reversing up to the credit amount or refund amount)
        let creditReversal = 0;
        if (originalCreditAmount > 0) {
          creditReversal = Math.min(originalCreditAmount, totalRefund, sale.customer.creditBalance);
        }

        const newTotalSpent = Math.max(0, sale.customer.totalSpent - totalRefund);
        const newCreditBalance = Math.max(0, sale.customer.creditBalance - creditReversal);

        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            totalSpent: newTotalSpent,
            creditBalance: newCreditBalance,
          },
        });
      }

      // 3. Update sale status to REFUNDED
      await tx.sale.update({
        where: { id: sale.id },
        data: { status: "REFUNDED" },
      });

      return returnRecord;
    });
  }

  /**
   * Voids an entire mistaken sale invoice, restoring all stock and reversing customer balances
   */
  static async voidSale(input: {
    saleId: string;
    businessId: string;
    branchId: string;
    userId: string;
    reason?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: input.saleId },
        include: {
          items: true,
          payments: true,
          customer: true,
        },
      });

      if (!sale || sale.businessId !== input.businessId) {
        throw new Error("Sale record not found or access denied.");
      }

      if (sale.status === "VOIDED" || sale.status === "REFUNDED") {
        throw new Error(`This invoice has already been ${sale.status.toLowerCase()}.`);
      }

      // 1. Restore stock for all sold items
      for (const item of sale.items) {
        const inv = await tx.inventory.findUnique({
          where: {
            branchId_productId: {
              branchId: sale.branchId,
              productId: item.productId,
            },
          },
        });

        const currentQty = inv?.quantity ?? 0;
        const restoredQty = currentQty + item.quantity;

        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: restoredQty },
          });
        } else {
          await tx.inventory.create({
            data: {
              branchId: sale.branchId,
              productId: item.productId,
              quantity: restoredQty,
            },
          });
        }

        await tx.inventoryMovement.create({
          data: {
            branchId: sale.branchId,
            productId: item.productId,
            type: "SALE_VOIDED",
            quantity: item.quantity,
            balanceAfter: restoredQty,
            referenceId: sale.id,
            notes: `Mistaken Invoice Voided (${sale.invoiceNumber}): ${input.reason || "Accidental entry removal"}`,
          },
        });
      }

      // 2. Reverse customer spend & credit balance
      if (sale.customerId && sale.customer) {
        const creditPayments = sale.payments.filter((p) => p.method === "CREDIT");
        const creditAmount = creditPayments.reduce((sum, p) => sum + p.amount, 0);

        const newTotalSpent = Math.max(0, sale.customer.totalSpent - sale.total);
        const newCreditBalance = Math.max(0, sale.customer.creditBalance - creditAmount);
        const newPurchaseCount = Math.max(0, sale.customer.purchaseCount - 1);

        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            totalSpent: newTotalSpent,
            creditBalance: newCreditBalance,
            purchaseCount: newPurchaseCount,
          },
        });
      }

      // 3. Mark sale as VOIDED
      const voidedSale = await tx.sale.update({
        where: { id: sale.id },
        data: {
          status: "VOIDED",
          holdNote: input.reason ? `VOIDED: ${input.reason}` : "VOIDED: Mistaken entry",
        },
      });

      return voidedSale;
    });
  }
}

