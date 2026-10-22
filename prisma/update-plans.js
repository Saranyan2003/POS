const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Updating subscription plans to Single Unlimited Plan (Rs. 4,999/mo)...");

  // 1. Create or update the single Unlimited plan
  const unlimitedPlan = await prisma.subscriptionPlan.upsert({
    where: { code: "UNLIMITED" },
    update: {
      name: "All-in-One Unlimited",
      description: "Complete unrestricted access with unlimited products, staff, branches, and monthly invoices.",
      monthlyPriceLkr: 4999.0,
      yearlyPriceLkr: 49990.0,
      maxProducts: 999999,
      maxEmployees: 999999,
      maxBranches: 999999,
      maxMonthlyInvoices: 999999,
      hasAdvancedReports: true,
      hasBarcodePrinting: true,
      hasMultiBranch: true,
      hasWhatsAppAlerts: true,
    },
    create: {
      name: "All-in-One Unlimited",
      code: "UNLIMITED",
      description: "Complete unrestricted access with unlimited products, staff, branches, and monthly invoices.",
      monthlyPriceLkr: 4999.0,
      yearlyPriceLkr: 49990.0,
      maxProducts: 999999,
      maxEmployees: 999999,
      maxBranches: 999999,
      maxMonthlyInvoices: 999999,
      hasAdvancedReports: true,
      hasBarcodePrinting: true,
      hasMultiBranch: true,
      hasWhatsAppAlerts: true,
    },
  });

  console.log("✓ Created/Updated UNLIMITED Plan:", unlimitedPlan.id);

  // 2. Re-point any existing subscriptions to the UNLIMITED plan
  const updatedSubs = await prisma.subscription.updateMany({
    data: {
      planId: unlimitedPlan.id,
    },
  });
  console.log(`✓ Re-pointed ${updatedSubs.count} existing subscriptions to UNLIMITED plan.`);

  // 3. Delete old plans
  const deletedOldPlans = await prisma.subscriptionPlan.deleteMany({
    where: {
      code: {
        not: "UNLIMITED",
      },
    },
  });
  console.log(`✓ Removed ${deletedOldPlans.count} outdated tiered plans.`);

  console.log("🎉 Database successfully updated to Single Unlimited Plan (4,999 LKR) with NO limitations!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
