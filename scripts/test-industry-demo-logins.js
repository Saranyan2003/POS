const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

const TEST_ACCOUNTS = [
  { loginId: "ADMIN-0001", expectedRole: "SUPER_ADMIN", expectedRedirect: "/admin/dashboard", industry: "System Administration" },
  { loginId: "OWN-GROCERY", expectedRole: "BUSINESS_OWNER", expectedRedirect: "/dashboard", industry: "Grocery & Retail" },
  { loginId: "EMP-GROCERY", expectedRole: "CASHIER", expectedRedirect: "/pos", industry: "Grocery & Retail" },
  { loginId: "OWN-CAFE", expectedRole: "BUSINESS_OWNER", expectedRedirect: "/dashboard", industry: "Restaurant & Cafe" },
  { loginId: "EMP-CAFE", expectedRole: "CASHIER", expectedRedirect: "/pos", industry: "Restaurant & Cafe" },
  { loginId: "OWN-BAKERY", expectedRole: "BUSINESS_OWNER", expectedRedirect: "/dashboard", industry: "Bakery & Takeaway" },
  { loginId: "EMP-BAKERY", expectedRole: "CASHIER", expectedRedirect: "/pos", industry: "Bakery & Takeaway" },
  { loginId: "OWN-PHARM", expectedRole: "BUSINESS_OWNER", expectedRedirect: "/dashboard", industry: "Pharmacy" },
  { loginId: "EMP-PHARM", expectedRole: "CASHIER", expectedRedirect: "/pos", industry: "Pharmacy" },
  { loginId: "OWN-FASHION", expectedRole: "BUSINESS_OWNER", expectedRedirect: "/dashboard", industry: "Clothing Store" },
  { loginId: "EMP-FASHION", expectedRole: "CASHIER", expectedRedirect: "/pos", industry: "Clothing Store" },
  { loginId: "OWN-TECH", expectedRole: "BUSINESS_OWNER", expectedRedirect: "/dashboard", industry: "Electronics & Mobile" },
  { loginId: "EMP-TECH", expectedRole: "CASHIER", expectedRedirect: "/pos", industry: "Electronics & Mobile" },
  { loginId: "OWN-WHOLESALE", expectedRole: "BUSINESS_OWNER", expectedRedirect: "/dashboard", industry: "Wholesale" },
  { loginId: "EMP-WHOLESALE", expectedRole: "CASHIER", expectedRedirect: "/pos", industry: "Wholesale" },
  { loginId: "OWN-SALON", expectedRole: "BUSINESS_OWNER", expectedRedirect: "/dashboard", industry: "Salon & Barber" },
  { loginId: "EMP-SALON", expectedRole: "CASHIER", expectedRedirect: "/pos", industry: "Salon & Barber" },
];

async function runDemoTests() {
  console.log("🧪 Running End-to-End Test Suite for All Industry Demo Accounts...\n");

  let passed = 0;
  let failed = 0;

  // 1. Test GET /api/auth/demo-login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/demo-login`);
    const data = await res.json();

    if (res.status === 200 && data.industries && data.industries.length >= 7) {
      console.log(`✅ [GET /api/auth/demo-login]: Returned ${data.industries.length} industry demo profiles.`);
      passed++;
    } else {
      console.error(`❌ [GET /api/auth/demo-login] Failed:`, data);
      failed++;
    }
  } catch (err) {
    console.error(`❌ [GET /api/auth/demo-login] Error:`, err.message);
    failed++;
  }

  // 2. Test 1-Click Instant Login for all 17 accounts
  console.log("\n--- Testing 1-Click Authentication & Redirection for Each Persona ---");

  for (const acc of TEST_ACCOUNTS) {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/demo-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: acc.loginId }),
      });

      const setCookie = res.headers.get("set-cookie");
      const data = await res.json();

      if (res.status === 200 && data.success && setCookie && setCookie.includes("pos_session_token")) {
        const matchesRedirect = data.redirectTo === acc.expectedRedirect;
        if (matchesRedirect) {
          console.log(`✅ [${acc.industry}] ${acc.loginId.padEnd(14)} -> Logged in successfully -> Routes to '${data.redirectTo}'`);
          passed++;
        } else {
          console.error(`⚠️ [${acc.industry}] ${acc.loginId} Redirect mismatch: expected ${acc.expectedRedirect}, got ${data.redirectTo}`);
          failed++;
        }
      } else {
        console.error(`❌ [${acc.industry}] ${acc.loginId} Login Failed:`, res.status, data);
        failed++;
      }
    } catch (err) {
      console.error(`❌ [${acc.industry}] ${acc.loginId} Exception:`, err.message);
      failed++;
    }
  }

  // 3. Test Database Integrity (Products and isolated inventory per industry)
  console.log("\n--- Testing Database Seed Verification ---");
  const businesses = await prisma.business.findMany({
    include: {
      branches: true,
      products: { include: { inventory: true } },
      customers: true,
      suppliers: true,
    },
  });

  for (const b of businesses) {
    const totalInventoryStock = b.products.reduce((acc, p) => {
      return acc + p.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    }, 0);

    console.log(`📊 [${b.businessType}] "${b.name}":`);
    console.log(`   Branches: ${b.branches.length} | Products: ${b.products.length} | Stock Units: ${totalInventoryStock} | Customers: ${b.customers.length} | Suppliers: ${b.suppliers.length}`);
  }

  console.log("\n========================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runDemoTests()
  .catch((e) => {
    console.error("Test runner failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
