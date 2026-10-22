const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("🧹 Starting Complete Removal of All Mock Data...");

  // 1. Delete transactional records
  console.log("  Deleting mock payments, return items, returns, sale items, and sales...");
  await prisma.payment.deleteMany({});
  await prisma.returnItem.deleteMany({});
  await prisma.return.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});

  // 2. Delete inventory & products
  console.log("  Deleting mock inventory movements, inventory items, products, and categories...");
  await prisma.inventoryMovement.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // 3. Delete purchases, suppliers, expenses, customers
  console.log("  Deleting mock purchase items, purchases, suppliers, expenses, and customers...");
  await prisma.purchaseItem.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.customer.deleteMany({});

  // 4. Delete audit logs, sessions, and subscriptions
  console.log("  Deleting audit logs, sessions, and subscriptions...");
  await prisma.auditLog.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.subscription.deleteMany({});

  // 5. Delete user associations, branches, and businesses
  console.log("  Deleting user branch and business relationships...");
  await prisma.userBranch.deleteMany({});
  await prisma.userBusiness.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.business.deleteMany({});

  // 6. Delete all non-Super-Admin users
  console.log("  Deleting mock tenant users and staff...");
  await prisma.user.deleteMany({
    where: {
      platformRole: { not: "SUPER_ADMIN" },
    },
  });

  // 7. Ensure Standard SaaS Subscription Plans exist
  console.log("  Ensuring standard subscription plans exist...");
  const plans = [
    {
      name: "Starter",
      code: "STARTER",
      description: "Ideal for small kiosks, bakeries and single-counter retail shops.",
      monthlyPriceLkr: 2900.0,
      yearlyPriceLkr: 29000.0,
      maxProducts: 200,
      maxEmployees: 2,
      maxBranches: 1,
      maxMonthlyInvoices: 1000,
      hasAdvancedReports: false,
      hasBarcodePrinting: true,
      hasMultiBranch: false,
      hasWhatsAppAlerts: false,
    },
    {
      name: "Pro",
      code: "PRO",
      description: "Perfect for growing grocery stores, pharmacies, cafes and restaurants.",
      monthlyPriceLkr: 5900.0,
      yearlyPriceLkr: 59000.0,
      maxProducts: 1500,
      maxEmployees: 5,
      maxBranches: 2,
      maxMonthlyInvoices: 5000,
      hasAdvancedReports: true,
      hasBarcodePrinting: true,
      hasMultiBranch: true,
      hasWhatsAppAlerts: true,
    },
    {
      name: "Business",
      code: "BUSINESS",
      description: "Designed for multi-branch retail chains, wholesalers and busy supermarkets.",
      monthlyPriceLkr: 9900.0,
      yearlyPriceLkr: 99000.0,
      maxProducts: 10000,
      maxEmployees: 20,
      maxBranches: 5,
      maxMonthlyInvoices: 25000,
      hasAdvancedReports: true,
      hasBarcodePrinting: true,
      hasMultiBranch: true,
      hasWhatsAppAlerts: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }

  // 8. Ensure Super Admin account is ready
  console.log("  Ensuring Super Admin account is ready...");
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
      phone: "0770000000",
      email: "admin@lankapos.lk",
      passwordHash: adminPasswordHash,
      platformRole: "SUPER_ADMIN",
      isTemporaryPassword: false,
      isActive: true,
    },
  });

  // Verification counts
  const businessCount = await prisma.business.count();
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const saleCount = await prisma.sale.count();
  const customerCount = await prisma.customer.count();
  const supplierCount = await prisma.supplier.count();
  const expenseCount = await prisma.expense.count();

  console.log("\n========================================================");
  console.log("✨ ALL MOCK DATA HAS BEEN COMPLETELY REMOVED!");
  console.log("========================================================");
  console.log(`Current Businesses in DB : ${businessCount}`);
  console.log(`Current Products in DB   : ${productCount}`);
  console.log(`Current Sales in DB      : ${saleCount}`);
  console.log(`Current Customers in DB  : ${customerCount}`);
  console.log(`Current Suppliers in DB  : ${supplierCount}`);
  console.log(`Current Expenses in DB   : ${expenseCount}`);
  console.log(`Current Users in DB      : ${userCount} (Super Admin only)`);
  console.log("--------------------------------------------------------");
  console.log("SUPER ADMIN CREDENTIALS:");
  console.log("  Portal URL : http://localhost:3000/login");
  console.log("  Login ID   : ADMIN-0001");
  console.log("  Password   : AdminPassword@123");
  console.log("========================================================\n");
}

cleanDatabase()
  .catch((e) => {
    console.error("Error cleaning database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
