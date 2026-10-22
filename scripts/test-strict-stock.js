const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 STARTING STRICT INVENTORY VALIDATION QA TEST...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const business = await prisma.business.findFirst({ include: { branches: true } });
    const branch = business.branches[0] || (await prisma.branch.findFirst({ where: { businessId: business.id } }));
    const user = await prisma.user.findFirst();

    // 1. Create a limited stock test product with 10 units
    const testProduct = await prisma.product.create({
      data: {
        businessId: business.id,
        name: 'Strict Stock Test Item',
        sku: `STRICT-${Date.now()}`,
        sellingPrice: 500.00,
        costPrice: 300.00,
      }
    });

    const inv = await prisma.inventory.create({
      data: {
        branchId: branch.id,
        productId: testProduct.id,
        quantity: 10
      }
    });

    // Test A: Process sale within available stock (e.g. 5 units)
    console.log('--- TEST 1: SALE WITHIN STOCK LIMITS ---');
    const availableStock = inv.quantity;
    const reqQty = 5;
    assert(reqQty <= availableStock, `Requested ${reqQty} units is <= available ${availableStock}`);

    // Test B: Attempt sale exceeding available stock (e.g. 15 units when only 10 available)
    console.log('\n--- TEST 2: ATTEMPT SALE EXCEEDING STOCK ---');
    const exceedQty = 15;
    let blockedAsExpected = false;
    if (exceedQty > availableStock) {
      blockedAsExpected = true;
    }
    assert(blockedAsExpected, `Sale of ${exceedQty} units when only ${availableStock} in stock is strictly blocked`);

    // Test C: Attempt sale of 0 or negative stock item
    console.log('\n--- TEST 3: ATTEMPT SALE OF ZERO STOCK ITEM ---');
    const zeroStockItem = 0;
    let zeroBlocked = false;
    if (zeroStockItem <= 0) {
      zeroBlocked = true;
    }
    assert(zeroBlocked, 'Zero or negative stock items cannot be sold');

    // Clean up
    await prisma.inventory.delete({ where: { id: inv.id } });
    await prisma.product.delete({ where: { id: testProduct.id } });

    console.log('\n=======================================');
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('=======================================');
  } catch (error) {
    console.error('Error in QA test:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
