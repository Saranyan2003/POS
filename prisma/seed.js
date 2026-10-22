const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initializing Clean SaaS Platform Database...");

  // 1. Create Single Unlimited Subscription Plan
  const plan = {
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
  };

  await prisma.subscriptionPlan.upsert({
    where: { code: plan.code },
    update: plan,
    create: plan,
  });

  // Remove any legacy plans
  await prisma.subscriptionPlan.deleteMany({
    where: { code: { not: "UNLIMITED" } },
  });

  console.log("✓ Initialized single unlimited subscription plan (4,999 LKR/mo)");

  // 2. Create Platform Super Admin
  const adminPasswordHash = await bcrypt.hash("AdminPassword@123", 12);
  await prisma.user.upsert({
    where: { loginId: "ADMIN-0001" },
    update: {
      passwordHash: adminPasswordHash,
      platformRole: "SUPER_ADMIN",
      isTemporaryPassword: false,
      isActive: true,
    },
    create: {
      loginId: "ADMIN-0001",
      name: "SaaS Super Admin",
      phone: "0704022301",
      email: "admin@ticket2grow.lk",
      passwordHash: adminPasswordHash,
      platformRole: "SUPER_ADMIN",
      isTemporaryPassword: false,
      isActive: true,
    },
  });
  console.log("✓ Initialized Super Admin Account (Login ID: ADMIN-0001 / AdminPassword@123)");

  console.log("\n========================================================");
  console.log("🚀 CLEAN DATABASE READY FOR PRODUCTION USE!");
  console.log("========================================================");
  console.log("SUPER ADMIN LOGIN:");
  console.log("  Portal URL : http://localhost:3000/login");
  console.log("  Login ID   : ADMIN-0001");
  console.log("  Password   : AdminPassword@123");
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
