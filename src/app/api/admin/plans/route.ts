import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TenantService } from "@/services/tenant.service";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { monthlyPriceLkr: "asc" },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });
    return NextResponse.json({ success: true, plans });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch plans." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await TenantService.requireSuperAdmin();
    const body = await req.json();

    const plan = await prisma.subscriptionPlan.create({
      data: body,
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create plan." }, { status: 500 });
  }
}
