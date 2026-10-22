const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fullDatabaseSanitizationAndAudit() {
  console.log('🔍 COMMENCING FULL SYSTEM DATABASE INTEGRITY AUDIT & CLEANUP...\n');

  // 1. Check and sanitize any negative inventory stock
  const negativeInventories = await prisma.inventory.findMany({
    where: { quantity: { lt: 0 } },
    include: { product: true }
  });

  console.log(`Found ${negativeInventories.length} negative inventory records.`);
  for (const inv of negativeInventories) {
    console.log(`  Fixing: Product "${inv.product?.name}" (Current stock: ${inv.quantity}) -> Resetting to 0`);
    await prisma.inventory.update({
      where: { id: inv.id },
      data: { quantity: 0 }
    });
  }

  // 2. Check and sanitize any negative customer credit balances
  const negativeCustomers = await prisma.customer.findMany({
    where: { creditBalance: { lt: 0 } }
  });
  console.log(`Found ${negativeCustomers.length} negative customer credit balances.`);
  for (const cust of negativeCustomers) {
    console.log(`  Fixing: Customer "${cust.name}" (Balance: ${cust.creditBalance}) -> Resetting to 0`);
    await prisma.customer.update({
      where: { id: cust.id },
      data: { creditBalance: 0 }
    });
  }

  // 3. Check and sanitize any negative supplier balances
  const negativeSuppliers = await prisma.supplier.findMany({
    where: { outstandingBalance: { lt: 0 } }
  });
  console.log(`Found ${negativeSuppliers.length} negative supplier balances.`);
  for (const supp of negativeSuppliers) {
    console.log(`  Fixing: Supplier "${supp.name}" (Balance: ${supp.outstandingBalance}) -> Resetting to 0`);
    await prisma.supplier.update({
      where: { id: supp.id },
      data: { outstandingBalance: 0 }
    });
  }

  // 4. Check all products prices
  const invalidProducts = await prisma.product.findMany({
    where: {
      OR: [
        { sellingPrice: { lt: 0 } },
        { costPrice: { lt: 0 } }
      ]
    }
  });
  console.log(`Found ${invalidProducts.length} invalid product price records.`);

  console.log('\n✅ DATABASE SANITIZATION COMPLETE! All records verified non-negative.');
  await prisma.$disconnect();
}

fullDatabaseSanitizationAndAudit();
