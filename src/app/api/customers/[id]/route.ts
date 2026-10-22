import { NextRequest, NextResponse } from "next/server";
import { TenantService } from "@/services/tenant.service";
import { prisma } from "@/lib/db";
import { AuditService } from "@/services/audit.service";
import { parseDateRange } from "@/lib/date-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { businessId, branchId } = await TenantService.requireTenantContext();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const branchParam = searchParams.get("branchId");

    const targetBranchId = branchId ? branchId : (branchParam && branchParam !== "ALL" ? branchParam : undefined);

    const { startDate, endDate } = parseDateRange(range, startDateParam, endDateParam);

    const dateFilter = startDate || endDate
      ? {
          saleDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {};

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        sales: {
          where: {
            businessId,
            ...(targetBranchId ? { branchId: targetBranchId } : {}),
            ...dateFilter,
          },
          include: {
            branch: { select: { id: true, name: true, code: true } },
            items: true,
            payments: true,
          },
          orderBy: { saleDate: "desc" },
        },
      },
    });

    if (!customer || customer.businessId !== businessId) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer, activeBranchId: targetBranchId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch customer." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { businessId, userId } = await TenantService.requireTenantContext("canManageCustomers");
    const { id } = await params;
    const body = await req.json();

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer || customer.businessId !== businessId) {
      return NextResponse.json({ error: "Customer account not found." }, { status: 404 });
    }

    // Action: Settle Credit Payment (Khata Repayment)
    if (body.action === "SETTLE_CREDIT") {
      const settlementAmount = parseFloat(body.amount);
      if (isNaN(settlementAmount) || settlementAmount <= 0) {
        return NextResponse.json({ error: "Valid settlement amount greater than 0 is required." }, { status: 400 });
      }

      if (customer.creditBalance <= 0) {
        return NextResponse.json(
          { error: "This customer currently has no outstanding credit balance (Rs. 0.00)." },
          { status: 400 }
        );
      }

      if (settlementAmount > customer.creditBalance) {
        return NextResponse.json(
          {
            error: `Settlement amount (Rs. ${settlementAmount.toFixed(2)}) cannot exceed outstanding credit balance (Rs. ${customer.creditBalance.toFixed(2)}).`,
          },
          { status: 400 }
        );
      }

      const newCreditBalance = Math.max(0, customer.creditBalance - settlementAmount);

      const updatedCustomer = await prisma.customer.update({
        where: { id },
        data: {
          creditBalance: newCreditBalance,
        },
      });

      await AuditService.log({
        businessId,
        userId,
        action: "CUSTOMER_CREDIT_SETTLED",
        entity: "Customer",
        entityId: customer.id,
        metadata: {
          customerName: customer.name,
          settlementAmount,
          method: body.paymentMethod || "CASH",
          notes: body.notes || "",
          previousBalance: customer.creditBalance,
          newBalance: newCreditBalance,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Settlement of Rs. ${settlementAmount.toLocaleString()} recorded successfully! Remaining balance: Rs. ${newCreditBalance.toFixed(2)}`,
        customer: updatedCustomer,
      });
    }

    // Action: Update Customer Details
    const { name, phone, email, address, notes } = body;

    // If phone is changing, ensure uniqueness within business
    if (phone && phone.trim() !== customer.phone) {
      const existing = await prisma.customer.findFirst({
        where: { businessId, phone: phone.trim(), NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Another customer is already registered with this phone number." },
          { status: 400 }
        );
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        email: email !== undefined ? (email ? email.trim() : null) : undefined,
        address: address !== undefined ? (address ? address.trim() : null) : undefined,
        notes: notes !== undefined ? (notes ? notes.trim() : null) : undefined,
      },
    });

    await AuditService.log({
      businessId,
      userId,
      action: "CUSTOMER_UPDATED",
      entity: "Customer",
      entityId: customer.id,
      metadata: { name: updatedCustomer.name, phone: updatedCustomer.phone },
    });

    return NextResponse.json({
      success: true,
      message: "Customer details updated successfully!",
      customer: updatedCustomer,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update customer." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { businessId, userId } = await TenantService.requireTenantContext("canManageCustomers");
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: { select: { sales: true } },
      },
    });

    if (!customer || customer.businessId !== businessId) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    if (customer.creditBalance > 0) {
      return NextResponse.json(
        { error: `Cannot remove customer with an outstanding debt balance of Rs. ${customer.creditBalance.toFixed(2)}. Settle or clear credit first.` },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id },
    });

    await AuditService.log({
      businessId,
      userId,
      action: "CUSTOMER_DELETED",
      entity: "Customer",
      entityId: id,
      metadata: { name: customer.name, phone: customer.phone },
    });

    return NextResponse.json({
      success: true,
      message: `Customer ${customer.name} removed successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to remove customer." }, { status: 500 });
  }
}

