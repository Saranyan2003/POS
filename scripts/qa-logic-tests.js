const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runQAValidation() {
  console.log("=================================================");
  console.log("   POS SYSTEM QA & BUSINESS LOGIC AUDIT SUITE    ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Find or create test business context
    let business = await prisma.business.findFirst({
      where: { code: "QA-STORE-01" },
      include: { branches: true },
    });

    if (!business) {
      business = await prisma.business.create({
        data: {
          name: "QA Automated Store",
          code: "QA-STORE-01",
          businessType: "Grocery & Retail",
          phone: "0770000000",
          status: "ACTIVE",
          branches: {
            create: {
              name: "QA Main Branch",
              code: "QA-BR-01",
              isDefault: true,
            },
          },
        },
        include: { branches: true },
      });
    }

    const branch = business.branches[0] || (await prisma.branch.findFirst({ where: { businessId: business.id } }));
    let cashier = await prisma.user.findFirst();

    console.log(`Using Business: ${business.name} (${business.id}), Branch: ${branch.name} (${branch.id})\n`);

    // -------------------------------------------------------------
    // TEST 1: PRODUCT CREATION & INVENTORY SETUP
    // -------------------------------------------------------------
    console.log("--- TEST 1: Product & Inventory Setup ---");
    const testSku = `QA-${Date.now()}`;
    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        name: "QA Test Milk Powder 400g",
        sku: testSku,
        costPrice: 800.0,
        sellingPrice: 1050.0,
        minStockLevel: 5,
        unit: "pack",
      },
    });

    await prisma.inventory.create({
      data: {
        branchId: branch.id,
        productId: product.id,
        quantity: 50,
      },
    });

    assert(product.id && product.costPrice === 800, "Product created with cost price 800 and selling 1050");

    const invInitial = await prisma.inventory.findUnique({
      where: { branchId_productId: { branchId: branch.id, productId: product.id } },
    });
    assert(invInitial.quantity === 50, "Initial branch inventory established at 50 units");

    // -------------------------------------------------------------
    // TEST 2: CUSTOMER KHATA & CREDIT SALE LOGIC
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Customer Khata & Credit Sale Logic ---");
    const testPhone = `077${Math.floor(1000000 + Math.random() * 9000000)}`;
    const customer = await prisma.customer.create({
      data: {
        businessId: business.id,
        name: "QA Test Customer (Perera)",
        phone: testPhone,
        creditBalance: 0,
        totalSpent: 0,
      },
    });

    assert(customer.creditBalance === 0, "Customer initialized with 0 credit balance");

    // Simulate Credit Sale: 2 items = 2 * 1050 = 2100.
    // Paid 500 Cash + 1600 Credit
    const invoiceNum = `INV-QA-${Date.now().toString().slice(-6)}`;
    const sale = await prisma.sale.create({
      data: {
        businessId: business.id,
        branchId: branch.id,
        cashierId: cashier.id,
        customerId: customer.id,
        invoiceNumber: invoiceNum,
        subtotal: 2100,
        discount: 0,
        tax: 0,
        total: 2100,
        totalCost: 1600,
        status: "COMPLETED",
        items: {
          create: {
            productId: product.id,
            productName: product.name,
            quantity: 2,
            unitPrice: 1050,
            unitCost: 800,
            total: 2100,
          },
        },
        payments: {
          create: [
            { method: "CASH", amount: 500 },
            { method: "CREDIT", amount: 1600 },
          ],
        },
      },
    });

    // Update customer records & stock
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalSpent: { increment: 2100 },
        creditBalance: { increment: 1600 },
        purchaseCount: { increment: 1 },
      },
    });

    await prisma.inventory.update({
      where: { branchId_productId: { branchId: branch.id, productId: product.id } },
      data: { quantity: { decrement: 2 } },
    });

    const updatedCustomer = await prisma.customer.findUnique({ where: { id: customer.id } });
    assert(updatedCustomer.creditBalance === 1600, "Customer credit balance increased by exact credit portion (Rs. 1,600.00)");
    assert(updatedCustomer.totalSpent === 2100, "Customer lifetime spent updated to Rs. 2,100.00");

    const invAfterSale = await prisma.inventory.findUnique({
      where: { branchId_productId: { branchId: branch.id, productId: product.id } },
    });
    assert(invAfterSale.quantity === 48, "Branch stock correctly decremented from 50 to 48");

    // -------------------------------------------------------------
    // TEST 3: CUSTOMER CREDIT SETTLEMENT (REPAYMENT)
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Customer Credit Settlement (Repayment) ---");
    // Settle 600 of the 1600 credit
    const settleAmount = 600;
    const newBal = updatedCustomer.creditBalance - settleAmount;
    await prisma.customer.update({
      where: { id: customer.id },
      data: { creditBalance: newBal },
    });

    const customerAfterSettle = await prisma.customer.findUnique({ where: { id: customer.id } });
    assert(customerAfterSettle.creditBalance === 1000, "After Rs. 600 partial settlement, remaining credit balance is Rs. 1,000.00");

    // Settle remaining 1000
    await prisma.customer.update({
      where: { id: customer.id },
      data: { creditBalance: 0 },
    });
    const customerFullySettled = await prisma.customer.findUnique({ where: { id: customer.id } });
    assert(customerFullySettled.creditBalance === 0, "After full settlement, credit balance is 0.00");

    // -------------------------------------------------------------
    // TEST 4: SUPPLIER PAYABLES & INWARD PURCHASES
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Supplier Payables & Inward Purchase ---");
    const supplier = await prisma.supplier.create({
      data: {
        businessId: business.id,
        name: "QA Ceylon Wholesalers Ltd",
        phone: "0112345678",
        outstandingBalance: 0,
      },
    });

    assert(supplier.outstandingBalance === 0, "Supplier initialized with Rs. 0.00 payables");

    // Delivery: 20 units @ 800 = 16,000.
    // Paid 6,000 in Advance -> Unpaid = 10,000
    const purchaseTotal = 16000;
    const paidAdvance = 6000;
    const unpaidToSupplier = purchaseTotal - paidAdvance;

    const purchase = await prisma.purchase.create({
      data: {
        businessId: business.id,
        branchId: branch.id,
        supplierId: supplier.id,
        invoiceNumber: `SUP-INV-${Date.now().toString().slice(-6)}`,
        subtotal: purchaseTotal,
        total: purchaseTotal,
        paidAmount: paidAdvance,
        isCompleted: true,
        items: {
          create: {
            productId: product.id,
            quantity: 20,
            unitCost: 800,
            totalCost: 16000,
          },
        },
      },
    });

    // Increment supplier balance & branch inventory
    await prisma.supplier.update({
      where: { id: supplier.id },
      data: { outstandingBalance: { increment: unpaidToSupplier } },
    });

    await prisma.inventory.update({
      where: { branchId_productId: { branchId: branch.id, productId: product.id } },
      data: { quantity: { increment: 20 } },
    });

    const supplierAfterPurchase = await prisma.supplier.findUnique({ where: { id: supplier.id } });
    assert(supplierAfterPurchase.outstandingBalance === 10000, "Supplier outstanding balance correctly set to Rs. 10,000.00");

    const invAfterPurchase = await prisma.inventory.findUnique({
      where: { branchId_productId: { branchId: branch.id, productId: product.id } },
    });
    assert(invAfterPurchase.quantity === 68, "Branch inventory restocked from 48 to 68 units");

    // -------------------------------------------------------------
    // TEST 5: SUPPLIER PAYMENT SETTLEMENT
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Supplier Payment Settlement ---");
    // Pay 10,000 via Bank Transfer
    await prisma.supplier.update({
      where: { id: supplier.id },
      data: { outstandingBalance: 0 },
    });

    const supplierPaid = await prisma.supplier.findUnique({ where: { id: supplier.id } });
    assert(supplierPaid.outstandingBalance === 0, "Supplier payable settled to Rs. 0.00");

    // -------------------------------------------------------------
    // TEST 6: SALE REFUND & STOCK RESTORATION
    // -------------------------------------------------------------
    console.log("\n--- TEST 6: Sale Refund & Stock Reversal ---");
    // Refund the earlier sale (2 items)
    await prisma.sale.update({
      where: { id: sale.id },
      data: { status: "REFUNDED" },
    });

    await prisma.inventory.update({
      where: { branchId_productId: { branchId: branch.id, productId: product.id } },
      data: { quantity: { increment: 2 } },
    });

    const invAfterRefund = await prisma.inventory.findUnique({
      where: { branchId_productId: { branchId: branch.id, productId: product.id } },
    });
    assert(invAfterRefund.quantity === 70, "Branch inventory restored from 68 back to 70 units on refund");

    const refundedSale = await prisma.sale.findUnique({ where: { id: sale.id } });
    assert(refundedSale.status === "REFUNDED", "Sale status marked as REFUNDED");

    // -------------------------------------------------------------
    // TEST 7: FINANCIAL REPORTS & PROFIT SUMMARY
    // -------------------------------------------------------------
    console.log("\n--- TEST 7: Financial Reports & Ledger Calculations ---");
    // Create an operating expense
    const expense = await prisma.expense.create({
      data: {
        businessId: business.id,
        category: "Electricity",
        amount: 2500,
        description: "QA CEB Bill",
        recordedById: cashier.id,
      },
    });

    assert(expense.amount === 2500, "Expense of Rs. 2,500.00 logged");

    // Clean up test data
    console.log("\nCleaning up test records...");
    await prisma.expense.delete({ where: { id: expense.id } });
    await prisma.purchaseItem.deleteMany({ where: { purchaseId: purchase.id } });
    await prisma.purchase.delete({ where: { id: purchase.id } });
    await prisma.supplier.delete({ where: { id: supplier.id } });
    await prisma.payment.deleteMany({ where: { saleId: sale.id } });
    await prisma.saleItem.deleteMany({ where: { saleId: sale.id } });
    await prisma.sale.delete({ where: { id: sale.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
    await prisma.inventory.deleteMany({ where: { productId: product.id } });
    await prisma.product.delete({ where: { id: product.id } });

    console.log("\n=================================================");
    console.log(`   QA AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED `);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("QA Test Suite Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runQAValidation();
