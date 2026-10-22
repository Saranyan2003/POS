/**
 * Automated End-to-End API Verification Script
 * Validates clean Super Admin provisioning, owner password reset,
 * real product creation, POS transactional checkout, stock decrement, and staff creation.
 */

const baseUrl = "http://localhost:3000";

async function runTestSuite() {
  console.log("🧪 Starting Automated E2E Verification against " + baseUrl);

  let adminCookie = "";
  let ownerCookie = "";
  let newOwnerLoginId = "";
  let tempPassword = "";
  let newOwnerPassword = "MySecurePassword@2026";
  let createdProductId = "";

  // TEST 1: Super Admin Login
  console.log("\n[1] Testing Super Admin Login (ADMIN-0001)...");
  const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginId: "ADMIN-0001", password: "AdminPassword@123" }),
  });

  const adminData = await adminLoginRes.json();
  if (!adminLoginRes.ok || !adminData.user || adminData.user.platformRole !== "SUPER_ADMIN") {
    throw new Error("Super Admin login failed: " + JSON.stringify(adminData));
  }
  adminCookie = adminLoginRes.headers.get("set-cookie")?.split(";")[0] || "";
  console.log("✅ Super Admin Authenticated! Redirects to:", adminData.redirectTo);

  // TEST 2: Super Admin Provisions New Business
  console.log("\n[2] Testing Super Admin Business Provisioning & Temp Credentials...");
  const uniqueCode = "T2G-" + Math.random().toString(36).substring(2, 7).toUpperCase();
  const provRes = await fetch(`${baseUrl}/api/admin/businesses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      name: "Colombo Gourmet Bakery",
      businessType: "Bakery & Cafe",
      ownerName: "Nuwan Jayasuriya",
      phone: "0778899221",
      email: "nuwan@colombobakery.lk",
      address: "No. 45, Duplication Road",
      city: "Colombo 03",
      planCode: "PRO",
    }),
  });

  const provData = await provRes.json();
  if (!provRes.ok || !provData.business) {
    throw new Error("Business provisioning failed: " + JSON.stringify(provData));
  }
  newOwnerLoginId = provData.credentials.loginId;
  tempPassword = provData.credentials.tempPassword;
  console.log("✅ Business Provisioned Successfully!");
  console.log("   Business:", provData.business.name);
  console.log("   Login ID:", newOwnerLoginId);
  console.log("   Temp Password:", tempPassword);

  // TEST 3: First-Time Login with Temporary Password
  console.log("\n[3] Testing First-Login with Temporary Password...");
  const firstLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginId: newOwnerLoginId, password: tempPassword }),
  });

  const firstLoginData = await firstLoginRes.json();
  if (!firstLoginRes.ok || firstLoginData.redirectTo !== "/change-password") {
    throw new Error("Temporary password redirection failed: " + JSON.stringify(firstLoginData));
  }
  let tempSessionCookie = firstLoginRes.headers.get("set-cookie")?.split(";")[0] || "";
  console.log("✅ First Login detected temporary password and strictly intercepted to /change-password!");

  // TEST 4: Forced Password Change
  console.log("\n[4] Testing Password Change...");
  const changePassRes = await fetch(`${baseUrl}/api/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: tempSessionCookie,
    },
    body: JSON.stringify({
      currentPassword: tempPassword,
      newPassword: newOwnerPassword,
      confirmPassword: newOwnerPassword,
    }),
  });

  const changePassData = await changePassRes.json();
  if (!changePassRes.ok || changePassData.redirectTo !== "/dashboard") {
    throw new Error("Password change failed: " + JSON.stringify(changePassData));
  }
  ownerCookie = tempSessionCookie;
  console.log("✅ Permanent password saved! Redirects to:", changePassData.redirectTo);

  // TEST 5: Create Real Product
  console.log("\n[5] Testing Product Creation for New Business...");
  const createProdRes = await fetch(`${baseUrl}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: ownerCookie,
    },
    body: JSON.stringify({
      name: "Fresh Butter Croissant",
      sku: "BCR-001",
      barcode: "4798889990001",
      costPrice: 180,
      sellingPrice: 320,
      minStockLevel: 5,
      unit: "pcs",
      initialStock: 50,
      description: "Artisan buttery French croissant baked fresh daily.",
    }),
  });

  const prodData = await createProdRes.json();
  if (!createProdRes.ok || !prodData.product) {
    throw new Error("Product creation failed: " + JSON.stringify(prodData));
  }
  createdProductId = prodData.product.id;
  console.log("✅ Product created:", prodData.product.name, `(Stock: 50, Selling Price: LKR 320)`);

  // TEST 6: POS Checkout Transaction
  console.log("\n[6] Testing ACID POS Checkout Transaction...");
  const checkoutPayload = {
    items: [
      {
        productId: createdProductId,
        quantity: 3,
        unitPrice: 320,
        discount: 0,
      },
    ],
    orderDiscount: 0,
    payments: [
      {
        method: "CASH",
        amount: 960,
        tenderedAmount: 1000,
        changeAmount: 40,
      },
    ],
  };

  const checkoutRes = await fetch(`${baseUrl}/api/pos/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: ownerCookie,
    },
    body: JSON.stringify(checkoutPayload),
  });

  const checkoutData = await checkoutRes.json();
  if (!checkoutRes.ok || !checkoutData.sale) {
    throw new Error("Checkout failed: " + JSON.stringify(checkoutData));
  }
  console.log("✅ POS Sale Completed Successfully!");
  console.log("   Invoice Number:", checkoutData.sale.invoiceNumber);
  console.log("   Subtotal (LKR):", checkoutData.sale.subtotal);
  console.log("   Total Cost (LKR):", checkoutData.sale.totalCost);

  // TEST 7: Verify Stock Decrement (50 - 3 = 47)
  console.log("\n[7] Verifying Stock Decrement & Audit Ledger...");
  const verifyProdRes = await fetch(`${baseUrl}/api/products`, {
    headers: { Cookie: ownerCookie },
  });
  const verifyProdData = await verifyProdRes.json();
  const updatedProd = verifyProdData.products.find((p) => p.id === createdProductId);

  if (!updatedProd || updatedProd.currentStock !== 47) {
    throw new Error(`Stock verification failed! Expected 47, got ${updatedProd?.currentStock}`);
  }
  console.log(`✅ Stock accurately decremented: 50 -> ${updatedProd.currentStock}`);

  // TEST 8: Create Staff Member
  console.log("\n[8] Testing Staff Member Creation (Cashier)...");
  const createStaffRes = await fetch(`${baseUrl}/api/staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: ownerCookie,
    },
    body: JSON.stringify({
      name: "Kasun Bandara (Cashier)",
      phone: "0712233445",
      email: "kasun@colombobakery.lk",
      role: "CASHIER",
    }),
  });

  const staffData = await createStaffRes.json();
  if (!createStaffRes.ok || !staffData.staff) {
    throw new Error("Staff creation failed: " + JSON.stringify(staffData));
  }
  console.log("✅ Staff Cashier Created!");
  console.log("   Staff Login ID:", staffData.credentials.loginId);
  console.log("   Temp Password:", staffData.credentials.temporaryPassword);

  console.log("\n========================================================");
  console.log("🎉 ALL E2E VERIFICATION TESTS PASSED (100% SUCCESS!)");
  console.log("========================================================\n");
}

runTestSuite().catch((e) => {
  console.error("\n❌ Test Suite Error:", e);
  process.exit(1);
});
