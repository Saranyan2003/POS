import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    const { businessId, branchId } = await TenantService.requireTenantContext("canViewReports");
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "month";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");
    const branchParam = searchParams.get("branchId");

    // Branch isolation:
    // If the active user has an assigned branch (e.g. cashier / employee), enforce that branch strictly.
    // If the user is an owner without a fixed branch scope, respect branchId query param if provided.
    const targetBranchId = branchId
      ? branchId
      : (branchParam && branchParam !== "ALL" ? branchParam : undefined);

    const { startDate, endDate, label } = parseDateRange(range, customStart, customEnd);

    const dateFilterSales = startDate || endDate
      ? {
          saleDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {};

    const dateFilterExpenses = startDate || endDate
      ? {
          expenseDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {};

    // 1. Fetch Sales in Date Range (scoped by target branch)
    const sales = await prisma.sale.findMany({
      where: {
        businessId,
        ...(targetBranchId ? { branchId: targetBranchId } : {}),
        status: "COMPLETED",
        ...dateFilterSales,
      },
      include: {
        items: true,
        payments: true,
      },
    });

    // 2. Fetch Expenses in Date Range (strictly scoped by target branch)
    const expenses = await prisma.expense.findMany({
      where: {
        businessId,
        ...(targetBranchId ? { branchId: targetBranchId } : {}),
        ...dateFilterExpenses,
      },
    });

    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalCostOfGoods = sales.reduce((sum, s) => sum + (s.totalCost || 0), 0);
    const totalGrossProfit = totalRevenue - totalCostOfGoods;
    const totalDiscounts = sales.reduce((sum, s) => sum + s.discount, 0);
    const totalTax = sales.reduce((sum, s) => sum + s.tax, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const estimatedNetProfit = totalGrossProfit - totalExpenses;

    // 3. Payment Methods Breakdown
    const paymentBreakdown: Record<string, number> = {};
    for (const s of sales) {
      for (const p of s.payments) {
        paymentBreakdown[p.method] = (paymentBreakdown[p.method] || 0) + p.amount;
      }
    }

    // 4. Top Selling Products
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const s of sales) {
      for (const item of s.items) {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += item.total;
      }
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // 5. Inventory Valuation (scoped by target branch)
    const allProductsWithInventory = await prisma.product.findMany({
      where: { businessId, isActive: true },
      include: {
        inventory: { where: { branchId: targetBranchId || undefined } },
      },
    });

    let totalInventoryValue = 0;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const p of allProductsWithInventory) {
      const qty = p.inventory[0]?.quantity ?? 0;
      totalStockUnits += qty;
      totalInventoryValue += qty * p.costPrice;
      if (qty <= 0) outOfStockCount++;
      else if (qty <= p.minStockLevel) lowStockCount++;
    }

    // 6. Customer Receivables & Supplier Payables
    const [customers, suppliers] = await Promise.all([
      prisma.customer.findMany({
        where: { businessId },
        select: { creditBalance: true },
      }),
      prisma.supplier.findMany({
        where: { businessId },
        select: { outstandingBalance: true },
      }),
    ]);

    const totalCustomerReceivables = customers.reduce((sum, c) => sum + (c.creditBalance || 0), 0);
    const totalSupplierPayables = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);

    return NextResponse.json({
      success: true,
      summary: {
        range,
        rangeLabel: label,
        activeBranchId: targetBranchId || null,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        totalSalesCount: sales.length,
        totalRevenue,
        totalCostOfGoods,
        totalGrossProfit,
        grossMarginPercent: totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : "0.0",
        totalDiscounts,
        totalTax,
        totalExpenses,
        estimatedNetProfit,
        totalCustomerReceivables,
        totalSupplierPayables,
        paymentBreakdown,
        topProducts,
        inventory: {
          totalProductsCount: allProductsWithInventory.length,
          totalStockUnits,
          totalInventoryValue,
          lowStockCount,
          outOfStockCount,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate report summary." }, { status: 500 });
  }
}
