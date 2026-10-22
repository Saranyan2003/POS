const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const BASE_URL = "http://localhost:3000";

async function loginDemo(loginId) {
  const res = await fetch(`${BASE_URL}/api/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(`Failed to login as ${loginId}: ${data.error || "Unknown error"}`);
  }
  const cookies = res.headers.get("set-cookie") || "";
  return { token: data.token, user: data.user, cookies };
}

async function runTests() {
  console.log("========================================================================");
  console.log("🧪 STARTING FULL COMPREHENSIVE BUSINESS LOGIC & POS E2E API AUDIT");
  console.log("========================================================================\n");

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

  // =========================================================================
  // TEST 1: SALON & BARBER (T2G-SALON)
  // =========================================================================
  console.log("\n💇 TEST SUITE 1: Salon & Spa Business Logic Audit (T2G-SALON)");
  try {
    const salonAuth = await loginDemo("OWN-SALON");
    assert(salonAuth.user.loginId === "OWN-SALON", "Salon Owner successfully logged in");

    // Fetch products API
    const pRes = await fetch(`${BASE_URL}/api/products`, {
      headers: { Cookie: salonAuth.cookies },
    });
    const pData = await pRes.json();
    assert(pRes.ok && pData.products?.length === 5, "Fetched 5 salon items (3 services, 2 retail products)");

    const haircut = pData.products.find((p) => p.unit === "service");
    const arganOil = pData.products.find((p) => p.unit === "bottle");

    assert(haircut && haircut.isService === true, "Haircut marked as isService: true");
    assert(haircut.costPrice === 0, "Haircut cost price is Rs. 0.00 (Pure labor/service)");
    assert(haircut.isOutOfStock === false, "Haircut is never marked out of stock");
    assert(arganOil && arganOil.isService === false, "Argan Oil marked as isService: false (Physical retail product)");
    assert(arganOil.costPrice === 2400, "Argan Oil cost price is Rs. 2,400.00 (Tracked physical asset)");
    const initialArganStock = arganOil.currentStock;
    assert(initialArganStock > 0, `Argan Oil stock is positive (${initialArganStock} bottles)`);

    // POS Checkout: 1 Haircut (Service) + 1 Argan Oil (Retail)
    const empAuth = await loginDemo("EMP-SALON");
    const checkoutRes = await fetch(`${BASE_URL}/api/pos/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: empAuth.cookies },
      body: JSON.stringify({
        items: [
          { productId: haircut.id, quantity: 1, unitPrice: haircut.sellingPrice, discount: 0 },
          { productId: arganOil.id, quantity: 1, unitPrice: arganOil.sellingPrice, discount: 0 },
        ],
        payments: [{ method: "CASH", amount: haircut.sellingPrice + arganOil.sellingPrice }],
      }),
    });
    const checkoutData = await checkoutRes.json();
    assert(checkoutRes.ok && checkoutData.success, `POS checkout completed invoice: ${checkoutData.sale?.invoiceNumber}`);

    // Verify inventory balances after checkout
    const arganStockAfter = await prisma.inventory.findFirst({
      where: { productId: arganOil.id, branchId: empAuth.user.branchId },
    });
    assert(arganStockAfter.quantity === initialArganStock - 1, `Argan Oil physical inventory decremented from ${initialArganStock} to ${initialArganStock - 1}`);

    const haircutStockAfter = await prisma.inventory.findFirst({
      where: { productId: haircut.id, branchId: empAuth.user.branchId },
    });
    assert(!haircutStockAfter || haircutStockAfter.quantity >= 0, "Haircut service did not create negative or invalid inventory records");
  } catch (e) {
    console.error("Salon test error:", e);
    failed++;
  }

  // =========================================================================
  // TEST 2: RESTAURANT & CAFE (T2G-CAFE)
  // =========================================================================
  console.log("\n🍽️ TEST SUITE 2: Restaurant & Cafe Kitchen Prep Logic Audit (T2G-CAFE)");
  try {
    const cafeAuth = await loginDemo("OWN-CAFE");
    const pRes = await fetch(`${BASE_URL}/api/products`, {
      headers: { Cookie: cafeAuth.cookies },
    });
    const pData = await pRes.json();
    assert(pRes.ok && pData.products?.length === 6, "Fetched 6 restaurant menu items");

    const kottu = pData.products.find((p) => p.name.includes("Kottu"));
    assert(kottu && kottu.isMadeToOrder === true, "Chicken Cheese Kottu is marked isMadeToOrder: true");
    assert(kottu.costPrice === 950, "Kottu estimated recipe food cost is Rs. 950.00");
    assert(kottu.sellingPrice === 1450, "Kottu portion menu price is Rs. 1450.00");

    // Checkout 2x Kottu
    const empAuth = await loginDemo("EMP-CAFE");
    const checkoutRes = await fetch(`${BASE_URL}/api/pos/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: empAuth.cookies },
      body: JSON.stringify({
        items: [{ productId: kottu.id, quantity: 2, unitPrice: kottu.sellingPrice, discount: 0 }],
        payments: [{ method: "CASH", amount: kottu.sellingPrice * 2 }],
      }),
    });
    const checkoutData = await checkoutRes.json();
    assert(checkoutRes.ok && checkoutData.success, `Fresh kitchen prep billed on POS: ${checkoutData.sale?.invoiceNumber}`);
  } catch (e) {
    console.error("Restaurant test error:", e);
    failed++;
  }

  // =========================================================================
  // TEST 3: GROCERY & RETAIL (T2G-GROCERY)
  // =========================================================================
  console.log("\n🛒 TEST SUITE 3: Grocery & Retail Physical Stock Logic Audit (T2G-GROCERY)");
  try {
    const auth = await loginDemo("OWN-GROCERY");
    const pRes = await fetch(`${BASE_URL}/api/products`, {
      headers: { Cookie: auth.cookies },
    });
    const pData = await pRes.json();
    assert(pRes.ok && pData.products?.length === 6, "Fetched 6 grocery retail products");

    for (const p of pData.products) {
      assert(p.isService === false, `Grocery item "${p.name}" strictly tracked as physical retail stock`);
      assert(p.costPrice > 0, `Grocery item "${p.name}" has valid supplier buying cost (Rs. ${p.costPrice})`);
      assert(p.sellingPrice > p.costPrice, `Grocery item "${p.name}" has positive profit margin`);
    }
  } catch (e) {
    console.error("Grocery test error:", e);
    failed++;
  }

  // =========================================================================
  // TEST 4: PHARMACY (T2G-PHARM)
  // =========================================================================
  console.log("\n💊 TEST SUITE 4: Pharmacy Medicine & OTC Logic Audit (T2G-PHARM)");
  try {
    const auth = await loginDemo("OWN-PHARM");
    const pRes = await fetch(`${BASE_URL}/api/products`, {
      headers: { Cookie: auth.cookies },
    });
    const pData = await pRes.json();
    assert(pRes.ok && pData.products?.length === 6, "Fetched 6 pharmacy drugs and supplies");

    const paracetamol = pData.products.find((p) => p.name.includes("Paracetamol"));
    assert(paracetamol && paracetamol.unit === "strip", "Paracetamol has unit 'strip'");
    assert(paracetamol.costPrice === 120 && paracetamol.sellingPrice === 180, "Paracetamol buying/selling prices accurate");
  } catch (e) {
    console.error("Pharmacy test error:", e);
    failed++;
  }

  // =========================================================================
  // TEST 5: ELECTRONICS & MOBILE (T2G-TECH)
  // =========================================================================
  console.log("\n📱 TEST SUITE 5: Electronics & Mobile Tech Logic Audit (T2G-TECH)");
  try {
    const auth = await loginDemo("OWN-TECH");
    const pRes = await fetch(`${BASE_URL}/api/products`, {
      headers: { Cookie: auth.cookies },
    });
    const pData = await pRes.json();
    assert(pRes.ok && pData.products?.length === 5, "Fetched 5 electronics devices/accessories");

    const iphone = pData.products.find((p) => p.name.includes("iPhone 15 Pro"));
    assert(iphone && iphone.costPrice === 310000 && iphone.sellingPrice === 345000, "High value device unit prices accurate");
  } catch (e) {
    console.error("Tech test error:", e);
    failed++;
  }

  // =========================================================================
  // TEST 6: CLOTHING BOUTIQUE (T2G-FASHION)
  // =========================================================================
  console.log("\n👗 TEST SUITE 6: Clothing Store Apparel Logic Audit (T2G-FASHION)");
  try {
    const auth = await loginDemo("OWN-FASHION");
    const pRes = await fetch(`${BASE_URL}/api/products`, {
      headers: { Cookie: auth.cookies },
    });
    const pData = await pRes.json();
    assert(pRes.ok && pData.products?.length === 5, "Fetched 5 fashion garments");
  } catch (e) {
    console.error("Fashion test error:", e);
    failed++;
  }

  // =========================================================================
  // TEST 7: WHOLESALE (T2G-WHOLESALE)
  // =========================================================================
  console.log("\n🏗️ TEST SUITE 7: Wholesale Hardware & Bulk Lot Audit (T2G-WHOLESALE)");
  try {
    const auth = await loginDemo("OWN-WHOLESALE");
    const pRes = await fetch(`${BASE_URL}/api/products`, {
      headers: { Cookie: auth.cookies },
    });
    const pData = await pRes.json();
    assert(pRes.ok && pData.products?.length === 5, "Fetched 5 wholesale lines");

    const cement = pData.products.find((p) => p.name.includes("Cement"));
    assert(cement && cement.unit === "bag" && cement.costPrice === 2150, "Bulk cement bag wholesale pricing accurate");
  } catch (e) {
    console.error("Wholesale test error:", e);
    failed++;
  }

  // =========================================================================
  // TEST 8: BAKERY & TAKEAWAY (T2G-BAKERY)
  // =========================================================================
  console.log("\n🥐 TEST SUITE 8: Bakery & Pastry Daily Bake Audit (T2G-BAKERY)");
  try {
    const auth = await loginDemo("OWN-BAKERY");
    const pRes = await fetch(`${BASE_URL}/api/products`, {
      headers: { Cookie: auth.cookies },
    });
    const pData = await pRes.json();
    assert(pRes.ok && pData.products?.length === 6, "Fetched 6 bakery products");

    const maluPaan = pData.products.find((p) => p.name.includes("Malu Paan"));
    assert(maluPaan && maluPaan.costPrice === 65 && maluPaan.sellingPrice === 120, "Bakery short eats pricing accurate");
  } catch (e) {
    console.error("Bakery test error:", e);
    failed++;
  }

  console.log("\n========================================================================");
  console.log(`🏁 TEST RUN SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("========================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
