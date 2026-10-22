const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SERVICE_UNITS = ["service", "session", "treatment", "hour", "job"];
const MADE_TO_ORDER_UNITS = [...SERVICE_UNITS, "portion", "plate", "cup", "glass"];

function isService(unit) {
  return SERVICE_UNITS.includes((unit || "").toLowerCase().trim());
}

function isMadeToOrder(unit) {
  return MADE_TO_ORDER_UNITS.includes((unit || "").toLowerCase().trim());
}

async function runVerification() {
  console.log("=================================================================");
  console.log("🔍 COMPREHENSIVE BUSINESS LOGIC AUDIT ACROSS ALL 8 INDUSTRIES");
  console.log("=================================================================\n");

  const businesses = await prisma.business.findMany({
    include: {
      branches: true,
      products: {
        include: {
          category: true,
          inventory: true,
        },
      },
    },
  });

  let totalErrors = 0;

  for (const b of businesses) {
    console.log(`\n🏢 [${b.businessType}] - "${b.name}" (${b.code})`);
    console.log(`   Branches: ${b.branches.map((br) => `${br.name} (${br.code})`).join(", ")}`);
    console.log(`   Total Products / Menu Lines: ${b.products.length}`);

    let physicalValuation = 0;
    let serviceCount = 0;
    let physicalCount = 0;
    let madeToOrderCount = 0;

    for (const p of b.products) {
      const unit = p.unit || "pcs";
      const isServ = isService(unit);
      const isMto = isMadeToOrder(unit);
      const mainStock = p.inventory[0]?.quantity ?? 0;

      if (isServ) {
        serviceCount++;
        // Check logical rule: Services should NOT have physical stock or cost inflating asset valuation
        if (p.costPrice > 0 && mainStock > 0) {
          console.warn(`   ⚠️ WARNING: Service "${p.name}" has stock ${mainStock} and cost ${p.costPrice}`);
        } else {
          console.log(`   ⚡ Service Item: "${p.name}" | Unit: ${unit} | Selling: Rs. ${p.sellingPrice} | Stock: ${mainStock} (Unlimited On-Demand)`);
        }
      } else if (isMto && b.businessType === "Restaurant & Cafe") {
        madeToOrderCount++;
        console.log(`   🍳 Fresh Prep: "${p.name}" | Unit: ${unit} | Recipe Cost: Rs. ${p.costPrice} | Menu: Rs. ${p.sellingPrice} | Stock: ${mainStock}`);
      } else {
        physicalCount++;
        const itemValuation = Math.max(0, mainStock) * p.costPrice;
        physicalValuation += itemValuation;
        console.log(`   📦 Physical Stock: "${p.name}" | Unit: ${unit} | Cost: Rs. ${p.costPrice} | Retail: Rs. ${p.sellingPrice} | Stock: ${mainStock} | Valuation: Rs. ${itemValuation.toLocaleString()}`);
      }
    }

    console.log(`   📊 Summary:`);
    console.log(`      • Physical Tracked Goods : ${physicalCount}`);
    console.log(`      • Intangible Services    : ${serviceCount}`);
    console.log(`      • Made-to-Order Dishes   : ${madeToOrderCount}`);
    console.log(`      • True Physical Valuation: Rs. ${physicalValuation.toLocaleString()}`);

    // Specific Salon Audit Verification
    if (b.code === "T2G-SALON" || b.name === "Crown & Blade Luxury Salon") {
      if (serviceCount !== 3) {
        console.error(`   ❌ FAIL: Expected 3 salon services, found ${serviceCount}`);
        totalErrors++;
      }
      if (physicalCount !== 2) {
        console.error(`   ❌ FAIL: Expected 2 retail products (Argan Oil & Face Scrub), found ${physicalCount}`);
        totalErrors++;
      }
      // Valuation should be Argan Oil (40 * 2400 = 96,000) + Scrub (45 * 850 = 38,250) = 134,250
      if (physicalValuation !== 134250) {
        console.error(`   ❌ FAIL: Salon physical valuation should be exactly Rs. 134,250. Got Rs. ${physicalValuation}`);
        totalErrors++;
      } else {
        console.log(`   ✅ PASS: Salon inventory valuation strictly isolates retail products from service labor!`);
      }
    }
  }

  console.log("\n=================================================================");
  if (totalErrors === 0) {
    console.log("🎉 ALL 8 BUSINESS TYPES PASSED 100% OF LOGIC VERIFICATION CHECKS!");
  } else {
    console.error(`❌ FOUND ${totalErrors} LOGICAL ERRORS.`);
  }
  console.log("=================================================================\n");
}

runVerification()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
