const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 STARTING MISTAKEN ENTRY REMOVAL / VOID QA TEST SUITE...\n');
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
    // Get default business & branch
    let business = await prisma.business.findFirst({
      include: { branches: true },
    });

    if (!business) {
      business = await prisma.business.create({
        data: {
          name: 'QA Void Store',
          code: `QA-VOID-${Date.now()}`,
          businessType: 'Retail',
          phone: '0771234567',
          branches: {
            create: {
              name: 'Main Branch',
              code: 'MB-01',
              isDefault: true,
            },
          },
        },
        include: { branches: true },
      });
    }

    const branch = business.branches[0] || (await prisma.branch.findFirst({ where: { businessId: business.id } }));
    let adminUser = await prisma.user.findFirst();

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          loginId: `ADMIN-${Date.now()}`,
          name: 'Admin Tester',
          passwordHash: 'hashed',
        }
      });
    }

    // 1. TEST EXPENSE DELETION
    console.log('--- TEST 1: EXPENSE REMOVAL ---');
    const exp = await prisma.expense.create({
      data: {
        businessId: business.id,
        category: 'Maintenance',
        amount: 250.00,
        description: 'Mistakenly entered maintenance fee',
        expenseDate: new Date(),
        recordedById: adminUser.id
      }
    });

    const expBefore = await prisma.expense.findUnique({ where: { id: exp.id } });
    assert(expBefore !== null, 'Mistaken expense created successfully');

    // Simulate API deletion
    await prisma.expense.delete({ where: { id: exp.id } });
    const expAfter = await prisma.expense.findUnique({ where: { id: exp.id } });
    assert(expAfter === null, 'Mistaken expense completely removed from DB');

    // 2. TEST SALE VOIDING & STOCK/CREDIT RESTORATION
    console.log('\n--- TEST 2: SALE VOIDING & INVENTORY/KHATA RESTORATION ---');
    // Create test customer
    const testCust = await prisma.customer.create({
      data: {
        businessId: business.id,
        name: 'Mistake Test Customer',
        phone: `077${Date.now().toString().slice(-7)}`,
        creditBalance: 0,
        totalSpent: 0
      }
    });

    // Create test product
    const testProd = await prisma.product.create({
      data: {
        businessId: business.id,
        name: 'Mistake Test Item',
        sku: `SKU-${Date.now()}`,
        sellingPrice: 100.00,
        costPrice: 60.00
      }
    });

    // Create inventory
    const initStock = 50;
    const inv = await prisma.inventory.create({
      data: {
        branchId: branch.id,
        productId: testProd.id,
        quantity: initStock
      }
    });

    // Perform a sale with 5 qty, 200 CASH, 300 CREDIT
    const saleQty = 5;
    const itemTotal = 500.00;
    const creditPortion = 300.00;

    // Deduct stock for sale
    await prisma.inventory.update({
      where: { id: inv.id },
      data: { quantity: { decrement: saleQty } }
    });

    // Increase customer credit & spend
    await prisma.customer.update({
      where: { id: testCust.id },
      data: {
        creditBalance: { increment: creditPortion },
        totalSpent: { increment: itemTotal }
      }
    });

    // Create Sale record
    const sale = await prisma.sale.create({
      data: {
        businessId: business.id,
        branchId: branch.id,
        cashierId: adminUser.id,
        customerId: testCust.id,
        invoiceNumber: `INV-MISTAKE-${Date.now()}`,
        subtotal: itemTotal,
        tax: 0,
        discount: 0,
        total: itemTotal,
        totalCost: 300.00,
        status: 'COMPLETED',
        items: {
          create: [{
            productId: testProd.id,
            productName: testProd.name,
            quantity: saleQty,
            unitPrice: 100.00,
            unitCost: 60.00,
            discount: 0,
            total: itemTotal
          }]
        },
        payments: {
          create: [
            { method: 'CASH', amount: 200.00 },
            { method: 'CREDIT', amount: 300.00 }
          ]
        }
      },
      include: { items: true, payments: true }
    });

    // Verify state after sale
    const invAfterSale = await prisma.inventory.findUnique({ where: { id: inv.id } });
    const custAfterSale = await prisma.customer.findUnique({ where: { id: testCust.id } });
    assert(invAfterSale.quantity === 45, 'Stock decremented from 50 to 45 after sale');
    assert(custAfterSale.creditBalance === 300, 'Customer credit increased to 300');
    assert(custAfterSale.totalSpent === 500, 'Customer total spend increased to 500');

    // VOID THE SALE using POSService logic simulation in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Mark sale as VOIDED
      await tx.sale.update({
        where: { id: sale.id },
        data: {
          status: 'VOIDED',
          holdNote: 'Voided mistaken invoice: Customer changed mind'
        }
      });

      // 2. Restore items to inventory
      for (const item of sale.items) {
        await tx.inventory.updateMany({
          where: {
            productId: item.productId,
            branchId: sale.branchId
          },
          data: {
            quantity: { increment: item.quantity }
          }
        });
      }

      // 3. Revert customer balance
      const creditPayment = sale.payments.find(p => p.method === 'CREDIT');
      if (sale.customerId) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            ...(creditPayment ? { creditBalance: { decrement: creditPayment.amount } } : {}),
            totalSpent: { decrement: sale.total }
          }
        });
      }
    });

    // Check post-void state
    const saleVoided = await prisma.sale.findUnique({ where: { id: sale.id } });
    const invAfterVoid = await prisma.inventory.findUnique({ where: { id: inv.id } });
    const custAfterVoid = await prisma.customer.findUnique({ where: { id: testCust.id } });

    assert(saleVoided.status === 'VOIDED', 'Sale status marked as VOIDED');
    assert(invAfterVoid.quantity === 50, 'Inventory stock restored accurately back to 50');
    assert(custAfterVoid.creditBalance === 0, 'Customer credit balance reversed back to 0');
    assert(custAfterVoid.totalSpent === 0, 'Customer total spend reversed back to 0');

    // 3. TEST PURCHASE REMOVAL & INWARD STOCK/PAYABLE REVERSAL
    console.log('\n--- TEST 3: PURCHASE REMOVAL & VENDOR PAYABLE REVERSAL ---');
    const testSupp = await prisma.supplier.create({
      data: {
        businessId: business.id,
        name: 'Mistake Test Supplier',
        contactPerson: 'Vendor Rep',
        phone: `071${Date.now().toString().slice(-7)}`,
        outstandingBalance: 0
      }
    });

    // Inward delivery of 20 items at $40 each = $800 total, unpaid
    const inwardQty = 20;
    const inwardCost = 800.00;

    // Stock increment
    await prisma.inventory.update({
      where: { id: inv.id },
      data: { quantity: { increment: inwardQty } }
    });

    // Supplier balance increment
    await prisma.supplier.update({
      where: { id: testSupp.id },
      data: { outstandingBalance: { increment: inwardCost } }
    });

    // Purchase Record
    const po = await prisma.purchase.create({
      data: {
        businessId: business.id,
        branchId: branch.id,
        supplierId: testSupp.id,
        invoiceNumber: `PUR-MISTAKE-${Date.now()}`,
        subtotal: inwardCost,
        total: inwardCost,
        paidAmount: 0,
        isCompleted: true,
        items: {
          create: [{
            productId: testProd.id,
            quantity: inwardQty,
            unitCost: 40.00,
            totalCost: inwardCost
          }]
        }
      },
      include: { items: true }
    });

    const invAfterPo = await prisma.inventory.findUnique({ where: { id: inv.id } });
    const suppAfterPo = await prisma.supplier.findUnique({ where: { id: testSupp.id } });
    assert(invAfterPo.quantity === 70, 'Stock increased from 50 to 70 after inward delivery');
    assert(suppAfterPo.outstandingBalance === 800, 'Supplier payable increased to $800');

    // REMOVE THE MISTAKEN PURCHASE ORDER (Simulating API)
    await prisma.$transaction(async (tx) => {
      // Deduct received quantities
      for (const item of po.items) {
        await tx.inventory.updateMany({
          where: {
            productId: item.productId,
            branchId: po.branchId
          },
          data: {
            quantity: { decrement: item.quantity }
          }
        });
      }

      // Revert supplier balance
      const unpaidBalance = po.total - po.paidAmount;
      if (unpaidBalance > 0) {
        await tx.supplier.update({
          where: { id: po.supplierId },
          data: {
            outstandingBalance: { decrement: unpaidBalance }
          }
        });
      }

      // Delete items & Purchase
      await tx.purchaseItem.deleteMany({ where: { purchaseId: po.id } });
      await tx.purchase.delete({ where: { id: po.id } });
    });

    const poAfterDelete = await prisma.purchase.findUnique({ where: { id: po.id } });
    const invAfterPoDel = await prisma.inventory.findUnique({ where: { id: inv.id } });
    const suppAfterPoDel = await prisma.supplier.findUnique({ where: { id: testSupp.id } });

    assert(poAfterDelete === null, 'Mistaken Purchase record removed from database');
    assert(invAfterPoDel.quantity === 50, 'Stock decremented back to 50');
    assert(suppAfterPoDel.outstandingBalance === 0, 'Supplier payable restored back to 0');

    // 4. TEST CUSTOMER / SUPPLIER CONTACT DELETION & SAFETY
    console.log('\n--- TEST 4: CUSTOMER / SUPPLIER CONTACT DELETION & SAFETY ---');
    // Test customer with zero balance can be deleted
    await prisma.payment.deleteMany({ where: { saleId: sale.id } });
    await prisma.saleItem.deleteMany({ where: { saleId: sale.id } });
    await prisma.sale.delete({ where: { id: sale.id } });
    await prisma.customer.delete({ where: { id: testCust.id } });
    const custFinal = await prisma.customer.findUnique({ where: { id: testCust.id } });
    assert(custFinal === null, 'Customer with zero balance successfully deleted');

    // Test supplier with zero balance can be deleted
    await prisma.supplier.delete({ where: { id: testSupp.id } });
    const suppFinal = await prisma.supplier.findUnique({ where: { id: testSupp.id } });
    assert(suppFinal === null, 'Supplier with zero balance successfully deleted');

    // Clean up test product & inventory
    await prisma.inventory.delete({ where: { id: inv.id } });
    await prisma.product.delete({ where: { id: testProd.id } });

    console.log('\n=======================================');
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('=======================================');

  } catch (error) {
    console.error('Error running QA test:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
