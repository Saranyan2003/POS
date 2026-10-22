import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { AuditService } from "@/services/audit.service";
import { parseDateRange } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    const { businessId, branchId } = await TenantService.requireTenantContext("canManageExpenses");
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const branchParam = searchParams.get("branchId");
    const range = searchParams.get("range");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const { startDate, endDate } = parseDateRange(range, startDateParam, endDateParam);

    const dateFilter = startDate || endDate
      ? {
          expenseDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {};

    // Branch isolation:
    // If the active user has an assigned branch (e.g. cashier / employee), enforce that branch strictly.
    // If the user is an owner without a fixed branch scope, respect branchId query param if provided.
    const targetBranchId = branchId
      ? branchId
      : (branchParam && branchParam !== "ALL" ? branchParam : undefined);

    const expenses = await prisma.expense.findMany({
      where: {
        businessId,
        ...(targetBranchId ? { branchId: targetBranchId } : {}),
        ...(category && category !== "ALL" ? { category } : {}),
        ...dateFilter,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        recordedBy: { select: { name: true, loginId: true } },
      },
      orderBy: { expenseDate: "desc" },
    });

    const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({ success: true, expenses, totalExpenseAmount, activeBranchId: targetBranchId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch expenses." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, branchId, userId } = await TenantService.requireTenantContext("canManageExpenses");
    const body = await req.json();
    const { category, amount, description, expenseDate, branchId: requestedBranchId } = body;

    if (!category || amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "Valid expense category and positive amount are required." }, { status: 400 });
    }

    // Determine target branch
    let targetBranchId = branchId || requestedBranchId;
    if (!targetBranchId) {
      const defaultBranch = await prisma.branch.findFirst({
        where: { businessId, isDefault: true },
      });
      targetBranchId = defaultBranch?.id || null;
    }

    const expense = await prisma.expense.create({
      data: {
        businessId,
        branchId: targetBranchId,
        category,
        amount: parseFloat(amount),
        description: description || null,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        recordedById: userId,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        recordedBy: { select: { name: true, loginId: true } },
      },
    });

    await AuditService.log({
      businessId,
      userId,
      action: "EXPENSE_RECORDED",
      entity: "Expense",
      entityId: expense.id,
      metadata: { category, amount: expense.amount, branchId: targetBranchId },
    });

    return NextResponse.json({ success: true, message: "Expense recorded successfully!", expense });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to record expense." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { businessId, branchId, userId } = await TenantService.requireTenantContext("canManageExpenses");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required to remove entry." }, { status: 400 });
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        businessId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense entry not found or unauthorized for this branch." }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    await AuditService.log({
      businessId,
      userId,
      action: "EXPENSE_DELETED",
      entity: "Expense",
      entityId: id,
      metadata: { category: expense.category, amount: expense.amount, description: expense.description, branchId: expense.branchId },
    });

    return NextResponse.json({ success: true, message: "Mistaken expense entry removed successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to remove expense." }, { status: 500 });
  }
}
