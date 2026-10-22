import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { SubscriptionService } from "@/services/subscription.service";
import { AuditService } from "@/services/audit.service";

export async function GET(req: NextRequest) {
  try {
    const { businessId, branchId } = await TenantService.requireTenantContext();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const barcode = searchParams.get("barcode") || "";

    const products = await prisma.product.findMany({
      where: {
        businessId,
        isActive: true,
        ...(barcode
          ? { barcode: { equals: barcode } }
          : search
          ? {
              OR: [
                { name: { contains: search } },
                { barcode: { contains: search } },
                { sku: { contains: search } },
              ],
            }
          : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
        supplier: true,
        inventory: {
          where: { branchId: branchId || undefined },
        },
      },
      orderBy: { name: "asc" },
    });

    const enrichedProducts = products.map((p) => {
      const unitLower = (p.unit || "pcs").toLowerCase().trim();
      const isService = unitLower === "service" || unitLower === "session" || unitLower === "treatment" || unitLower === "hour" || unitLower === "job";
      const isMadeToOrder = isService || unitLower === "portion" || unitLower === "plate" || unitLower === "cup" || unitLower === "glass";
      const stock = p.inventory[0]?.quantity ?? 0;

      return {
        ...p,
        isService,
        isMadeToOrder,
        currentStock: stock,
        isLowStock: isService ? false : stock <= p.minStockLevel && stock > 0,
        isOutOfStock: isService ? false : stock <= 0,
      };
    });

    return NextResponse.json({ success: true, products: enrichedProducts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch products." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, branchId, userId } = await TenantService.requireTenantContext("canManageProducts");

    // Check Plan Entitlements
    const quotaCheck = await SubscriptionService.checkCanAddProduct(businessId);
    if (!quotaCheck.allowed) {
      return NextResponse.json({ error: quotaCheck.reason }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      sku,
      barcode,
      categoryId,
      supplierId,
      description,
      costPrice = 0,
      sellingPrice,
      discountPrice,
      minStockLevel = 5,
      unit = "pcs",
      initialStock = 0,
    } = body;

    if (!name || sellingPrice === undefined) {
      return NextResponse.json({ error: "Product name and selling price are required." }, { status: 400 });
    }

    // Check unique barcode / SKU within business if provided
    if (barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: { businessId, barcode, isActive: true },
      });
      if (existingBarcode) {
        return NextResponse.json({ error: "A product with this barcode already exists." }, { status: 400 });
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          businessId,
          categoryId: categoryId || null,
          supplierId: supplierId || null,
          name,
          sku: sku || null,
          barcode: barcode || null,
          description: description || null,
          costPrice: parseFloat(costPrice) || 0,
          sellingPrice: parseFloat(sellingPrice),
          discountPrice: discountPrice ? parseFloat(discountPrice) : null,
          minStockLevel: parseInt(minStockLevel, 10) || 5,
          unit,
        },
      });

      if (branchId && initialStock > 0) {
        await tx.inventory.create({
          data: {
            branchId,
            productId: prod.id,
            quantity: parseFloat(initialStock),
          },
        });

        await tx.inventoryMovement.create({
          data: {
            branchId,
            productId: prod.id,
            type: "PURCHASE_INWARD",
            quantity: parseFloat(initialStock),
            balanceAfter: parseFloat(initialStock),
            notes: "Initial opening stock upon product creation",
          },
        });
      }

      return prod;
    });

    await AuditService.log({
      businessId,
      userId,
      action: "PRODUCT_CREATED",
      entity: "Product",
      entityId: product.id,
      metadata: { name: product.name, sellingPrice: product.sellingPrice },
    });

    return NextResponse.json({ success: true, message: "Product created successfully!", product });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product." }, { status: 500 });
  }
}
