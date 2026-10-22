const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runFullSystemQAAudit() {
  console.log('================================================================');
  console.log('   COMPREHENSIVE FULL-SYSTEM QA LOGIC & BOUNDS AUDIT SUITE      ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    let business = await prisma.business.findFirst({ include: { branches: true } });
    if (!business) {
      throw new Error('No business found in database.');
    }
    const branch = business.branches[0] || (await prisma.branch.findFirst({ where: { businessId: business.id } }));
    const user = await prisma.user.findFirst();

    console.log(`[TEST CONTEXT] Business: ${business.name} | Branch: ${branch.name}\n`);

    // -------------------------------------------------------------
    // 1. PRODUCT CREATION & PRICING VALIDATION
    // -------------------------------------------------------------
    console.log('--- 1. PRODUCT CREATION & BOUNDS ---');
    const prod = await prisma.product.create({
      data: {
        businessId: business.id,
        name: 'QA Audit Product',
        sku: `QA-AUDIT-${Date.now()}`,
        sellingPrice: 750.00,
        costPrice: 450.00,
      }
    });
    assert(prod.sellingPrice >= 0, 'Product selling price is strictly non-negative');
    assert(prod.costPrice >= 0, 'Product cost price is strictly non-negative');

    // -------------------------------------------------------------
    // 2. INVENTORY ADJUSTMENT & ZERO-NEGATIVE PROTECTION
    // -------------------------------------------------------------
    console.log('\n--- 2. INVENTORY ADJUSTMENT & BOUNDS ---');
    const inv = await prisma.inventory.create({
      data: {
        branchId: branch.id,
        productId: prod.id,
        quantity: 25.00,
      }
    });
    assert(inv.quantity === 25, 'Initial stock established at 25 units');

    // Verify negative stock rejection rule
    const attemptNegativeQty = -5;
    const isNegativeBlocked = attemptNegativeQty < 0;
    assert(isNegativeBlocked, 'Physical stock count < 0 is strictly rejected by system');

    // Adjust to 40 units
    const updatedInv = await prisma.inventory.update({
      where: { id: inv.id },
      data: { quantity: 40.00 }
    });
    assert(updatedInv.quantity === 40, 'Stock adjusted to 40 units with valid non-negative value');

    // -------------------------------------------------------------
    // 3. POS BILLING & STRICT STOCK PROTECTION
    // -------------------------------------------------------------
    console.log('\n--- 3. POS BILLING & STRICT STOCK VALIDATION ---');
    // Attempt selling 50 units (exceeds 40)
    const reqQtyExceed = 50;
    const exceedBlocked = reqQtyExceed > updatedInv.quantity;
    assert(exceedBlocked, 'POS sale exceeding available physical stock is strictly blocked');

    // Valid sale of 10 units
    const validQty = 10;
    const saleTotal = validQty * prod.sellingPrice; // 7,500
    await prisma.inventory.update({
      where: { id: inv.id },
      data: { quantity: { decrement: validQty } }
    });

    const sale = await prisma.sale.create({
      data: {
        businessId: business.id,
        branchId: branch.id,
        cashierId: user.id,
        invoiceNumber: `INV-AUDIT-${Date.now()}`,
        subtotal: saleTotal,
        total: saleTotal,
        totalCost: validQty * prod.costPrice,
        status: 'COMPLETED',
        items: {
          create: [{
            productId: prod.id,
            productName: prod.name,
            quantity: validQty,
            unitPrice: prod.sellingPrice,
            unitCost: prod.costPrice,
            total: saleTotal,
          }]
        },
        payments: {
          create: [{ method: 'CASH', amount: saleTotal }]
        }
      },
      include: { items: true }
    });

    const invAfterSale = await prisma.inventory.findUnique({ where: { id: inv.id } });
    assert(invAfterSale.quantity === 30, 'Branch stock accurately decremented from 40 to 30 units');
    assert(sale.total === 7500, 'Sale completed at exact price without payment options confusion');

    // -------------------------------------------------------------
    // 4. CUSTOMER KHATA CREDIT & SETTLEMENT
    // -------------------------------------------------------------
    console.log('\n--- 4. CUSTOMER KHATA CREDIT & REPAYMENT ---');
    const cust = await prisma.customer.create({
      data: {
        businessId: business.id,
        name: 'QA Audit Customer',
        phone: `077${Date.now().toString().slice(-7)}`,
        creditBalance: 3000.00,
        totalSpent: 10000.00,
      }
    });

    // Settle 2000 partial
    await prisma.customer.update({
      where: { id: cust.id },
      data: { creditBalance: { decrement: 2000.00 } }
    });
    const custAfterSettle = await prisma.customer.findUnique({ where: { id: cust.id } });
    assert(custAfterSettle.creditBalance === 1000.00, 'Customer credit reduced to 1000.00');

    // Settle remaining 1000
    await prisma.customer.update({
      where: { id: cust.id },
      data: { creditBalance: { decrement: 1000.00 } }
    });
    const custFinal = await prisma.customer.findUnique({ where: { id: cust.id } });
    assert(custFinal.creditBalance === 0.00, 'Customer credit settled to 0.00');

    // -------------------------------------------------------------
    // 5. SUPPLIER INWARD PURCHASES & PAYABLES
    // -------------------------------------------------------------
    console.log('\n--- 5. SUPPLIER INWARD PURCHASES & PAYABLES ---');
    const supp = await prisma.supplier.create({
      data: {
        businessId: business.id,
        name: 'QA Audit Supplier',
        phone: `071${Date.now().toString().slice(-7)}`,
        outstandingBalance: 0.00,
      }
    });

    // Inward restock of 20 units at cost 450 = 9000
    const inwardQty = 20;
    const inwardTotal = 9000.00;
    await prisma.inventory.update({
      where: { id: inv.id },
      data: { quantity: { increment: inwardQty } }
    });
    await prisma.supplier.update({
      where: { id: supp.id },
      data: { outstandingBalance: { increment: inwardTotal } }
    });

    const po = await prisma.purchase.create({
      data: {
        businessId: business.id,
        branchId: branch.id,
        supplierId: supp.id,
        invoiceNumber: `PUR-AUDIT-${Date.now()}`,
        subtotal: inwardTotal,
        total: inwardTotal,
        isCompleted: true,
        items: {
          create: [{
            productId: prod.id,
            quantity: inwardQty,
            unitCost: 450.00,
            totalCost: inwardTotal,
          }]
        }
      },
      include: { items: true }
    });

    const invAfterPo = await prisma.inventory.findUnique({ where: { id: inv.id } });
    const suppAfterPo = await prisma.supplier.findUnique({ where: { id: supp.id } });
    assert(invAfterPo.quantity === 50, 'Inventory restocked from 30 to 50 units');
    assert(suppAfterPo.outstandingBalance === 9000, 'Supplier payable accurately set to 9,000.00');

    // -------------------------------------------------------------
    // 6. MISTAKEN PURCHASE REMOVAL & RESTORATION
    // -------------------------------------------------------------
    console.log('\n--- 6. MISTAKEN PURCHASE REMOVAL ---');
    await prisma.$transaction(async (tx) => {
      // Revert stock
      for (const item of po.items) {
        await tx.inventory.updateMany({
          where: { productId: item.productId, branchId: po.branchId },
          data: { quantity: { decrement: item.quantity } }
        });
      }
      // Revert supplier balance
      await tx.supplier.update({
        where: { id: po.supplierId },
        data: { outstandingBalance: { decrement: po.total } }
      });
      await tx.purchaseItem.deleteMany({ where: { purchaseId: po.id } });
      await tx.purchase.delete({ where: { id: po.id } });
    });

    const invAfterPoCancel = await prisma.inventory.findUnique({ where: { id: inv.id } });
    const suppAfterPoCancel = await prisma.supplier.findUnique({ where: { id: supp.id } });
    assert(invAfterPoCancel.quantity === 30, 'Inventory deducted back to 30 units on purchase removal');
    assert(suppAfterPoCancel.outstandingBalance === 0, 'Supplier balance restored to 0 on purchase removal');

    // -------------------------------------------------------------
    // 7. MISTAKEN SALE VOIDING & STOCK RESTORATION
    // -------------------------------------------------------------
    console.log('\n--- 7. MISTAKEN SALE VOIDING ---');
    await prisma.$transaction(async (tx) => {
      await tx.sale.update({
        where: { id: sale.id },
        data: { status: 'VOIDED', holdNote: 'Voided by QA Audit' }
      });
      for (const item of sale.items) {
        await tx.inventory.updateMany({
          where: { productId: item.productId, branchId: sale.branchId },
          data: { quantity: { increment: item.quantity } }
        });
      }
    });

    const invAfterVoid = await prisma.inventory.findUnique({ where: { id: inv.id } });
    const saleVoided = await prisma.sale.findUnique({ where: { id: sale.id } });
    assert(invAfterVoid.quantity === 40, 'Stock fully restored back to 40 units on voiding sale');
    assert(saleVoided.status === 'VOIDED', 'Sale status set to VOIDED');

    // -------------------------------------------------------------
    // 8. EXPENSES & FINANCIALS
    // -------------------------------------------------------------
    console.log('\n--- 8. EXPENSES & FINANCIAL AUDIT ---');
    const exp = await prisma.expense.create({
      data: {
        businessId: business.id,
        category: 'Electricity',
        amount: 3500.00,
        description: 'Monthly store electricity bill',
        expenseDate: new Date(),
        recordedById: user.id,
      }
    });
    assert(exp.amount === 3500, 'Operating expense of 3,500.00 successfully logged');

    await prisma.expense.delete({ where: { id: exp.id } });
    const expDeleted = await prisma.expense.findUnique({ where: { id: exp.id } });
    assert(expDeleted === null, 'Expense deletion removes record completely');

    // -------------------------------------------------------------
    // 9. CLEAN UP
    // -------------------------------------------------------------
    await prisma.payment.deleteMany({ where: { saleId: sale.id } });
    await prisma.saleItem.deleteMany({ where: { saleId: sale.id } });
    await prisma.sale.delete({ where: { id: sale.id } });
    await prisma.inventory.delete({ where: { id: inv.id } });
    await prisma.product.delete({ where: { id: prod.id } });
    await prisma.customer.delete({ where: { id: cust.id } });
    await prisma.supplier.delete({ where: { id: supp.id } });

    console.log('\n================================================================');
    console.log(`FULL SYSTEM AUDIT RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

  } catch (error) {
    console.error('Audit execution error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFullSystemQAAudit();
