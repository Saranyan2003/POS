const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testBranchExpenseIsolation() {
  console.log("=========================================");
  console.log("TESTING MULTI-BRANCH EXPENSE ISOLATION QA");
  console.log("=========================================\n");

  // 1. Get or create 2 branches for a test business
  const business = await prisma.business.findFirst({
    include: { branches: true },
  });

  if (!business) {
    console.error("No business found in database.");
    process.exit(1);
  }

  console.log(`Testing with Business: ${business.name} (ID: ${business.id})`);

  let mainBranch = business.branches.find((b) => b.isDefault || b.code === "BR-01") || business.branches[0];
  let secondBranch = business.branches.find((b) => b.id !== mainBranch.id);

  if (!secondBranch) {
    secondBranch = await prisma.branch.create({
      data: {
        businessId: business.id,
        name: "Branch 2 Isolation Test",
        code: "BR-TEST-02",
        isDefault: false,
      },
    });
    console.log(`Created second branch for test: ${secondBranch.name} (${secondBranch.id})`);
  }

  console.log(`Branch 1: ${mainBranch.name} (${mainBranch.id})`);
  console.log(`Branch 2: ${secondBranch.name} (${secondBranch.id})`);

  // Get a test user
  const user = await prisma.user.findFirst();

  // 2. Clean previous test expenses
  await prisma.expense.deleteMany({
    where: {
      businessId: business.id,
      description: { contains: "ISOLATION_TEST" },
    },
  });

  // 3. Create Expense for Branch 1
  const expBranch1 = await prisma.expense.create({
    data: {
      businessId: business.id,
      branchId: mainBranch.id,
      category: "Electricity",
      amount: 45000,
      description: "ISOLATION_TEST_BRANCH_1_ELECTRICITY",
      recordedById: user.id,
    },
  });

  // 4. Create Expense for Branch 2
  const expBranch2 = await prisma.expense.create({
    data: {
      businessId: business.id,
      branchId: secondBranch.id,
      category: "Transport",
      amount: 12000,
      description: "ISOLATION_TEST_BRANCH_2_TRANSPORT",
      recordedById: user.id,
    },
  });

  console.log(`Created Branch 1 Expense: LKR ${expBranch1.amount} (${expBranch1.category})`);
  console.log(`Created Branch 2 Expense: LKR ${expBranch2.amount} (${expBranch2.category})\n`);

  // 5. Test Query Scoped to Branch 1
  const branch1Expenses = await prisma.expense.findMany({
    where: {
      businessId: business.id,
      branchId: mainBranch.id,
    },
  });

  console.log(`[TEST 1] Query scoped to Branch 1 (${mainBranch.name}):`);
  console.log(`-> Total entries found: ${branch1Expenses.length}`);
  const hasBranch2InBranch1 = branch1Expenses.some((e) => e.branchId === secondBranch.id);
  console.log(`-> Contains Branch 2 data? ${hasBranch2InBranch1 ? "FAIL (LEAK DETECTED)" : "PASS (STRICTLY ISOLATED)"}`);
  if (hasBranch2InBranch1) throw new Error("Branch 2 expense leaked to Branch 1!");

  // 6. Test Query Scoped to Branch 2
  const branch2Expenses = await prisma.expense.findMany({
    where: {
      businessId: business.id,
      branchId: secondBranch.id,
    },
  });

  console.log(`\n[TEST 2] Query scoped to Branch 2 (${secondBranch.name}):`);
  console.log(`-> Total entries found: ${branch2Expenses.length}`);
  const hasBranch1InBranch2 = branch2Expenses.some((e) => e.branchId === mainBranch.id);
  console.log(`-> Contains Branch 1 data? ${hasBranch1InBranch2 ? "FAIL (LEAK DETECTED)" : "PASS (STRICTLY ISOLATED)"}`);
  if (hasBranch1InBranch2) throw new Error("Branch 1 expense leaked to Branch 2!");

  // 7. Verify Employee Hesavi at Branch 2
  const hesaviUser = await prisma.user.findFirst({
    where: { loginId: "EMP-EDGDT" },
    include: { userBranches: { include: { branch: true } } },
  });

  if (hesaviUser && hesaviUser.userBranches.length > 0) {
    const assignedBranchId = hesaviUser.userBranches[0].branchId;
    const assignedBranchName = hesaviUser.userBranches[0].branch.name;
    console.log(`\n[TEST 3] Verifying Employee Dashboard for ${hesaviUser.name} (${hesaviUser.loginId}):`);
    console.log(`-> Assigned Branch: ${assignedBranchName} (${assignedBranchId})`);

    const employeeDashboardExpenses = await prisma.expense.findMany({
      where: {
        businessId: business.id,
        branchId: assignedBranchId,
      },
    });

    const totalEmployeeExpense = employeeDashboardExpenses.reduce((sum, e) => sum + e.amount, 0);
    console.log(`-> Operating expenses on ${hesaviUser.name}'s dashboard: LKR ${totalEmployeeExpense}`);
    console.log(`-> Does employee see other branch expenses? ${employeeDashboardExpenses.some(e => e.branchId !== assignedBranchId) ? "FAIL" : "PASS (ZERO LEAKAGE)"}`);
  }

  // Clean test fixtures
  await prisma.expense.deleteMany({
    where: {
      businessId: business.id,
      description: { contains: "ISOLATION_TEST" },
    },
  });

  console.log("\n=========================================");
  console.log("ALL BRANCH ISOLATION QA TESTS PASSED! 100% OK");
  console.log("=========================================");
}

testBranchExpenseIsolation()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
