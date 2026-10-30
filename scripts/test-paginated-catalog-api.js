const http = require("http");

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log("=========================================================");
  console.log("🧪 TESTING PAGINATED PRODUCTS REST API FOR EXTERNAL WEBSITES");
  console.log("=========================================================\n");

  const baseUrl = "http://localhost:3000/api/v1/catalog";

  // 1. Missing businessCode validation
  console.log("--- 1. Parameter Validation ---");
  const missingRes = await fetchJson(`${baseUrl}`);
  assert(missingRes.status === 400, "Returns 400 when businessCode is omitted");
  assert(missingRes.data.success === false, "Returns success: false on missing param");

  // 2. Page 1 with limit=2 for Perera Bake House (T2G-BAKERY)
  console.log("\n--- 2. Pagination Mechanics (T2G-BAKERY) ---");
  const page1Res = await fetchJson(`${baseUrl}?businessCode=T2G-BAKERY&page=1&limit=2`);
  assert(page1Res.status === 200, "Status 200 on valid request");
  assert(page1Res.headers["access-control-allow-origin"] === "*", "CORS header allow-origin is * for external websites");
  assert(page1Res.data.success === true, "Response has success: true");
  assert(page1Res.data.business.code === "T2G-BAKERY", "Business code matches T2G-BAKERY");
  assert(page1Res.data.pagination.page === 1, "Pagination page is 1");
  assert(page1Res.data.pagination.limit === 2, "Pagination limit is 2");
  assert(page1Res.data.pagination.totalProducts === 6, "Total products is 6");
  assert(page1Res.data.pagination.totalPages === 3, "Total pages is 3 (6 / 2)");
  assert(page1Res.data.pagination.hasNextPage === true, "Page 1 has next page");
  assert(page1Res.data.pagination.hasPrevPage === false, "Page 1 does NOT have prev page");
  assert(page1Res.data.products.length === 2, "Returns exactly 2 products for limit=2");

  const page1ProductNames = page1Res.data.products.map((p) => p.name);
  console.log("   Page 1 items:", page1ProductNames);

  // 3. Page 2 with limit=2
  const page2Res = await fetchJson(`${baseUrl}?businessCode=T2G-BAKERY&page=2&limit=2`);
  assert(page2Res.data.pagination.page === 2, "Pagination page is 2");
  assert(page2Res.data.pagination.hasNextPage === true, "Page 2 has next page");
  assert(page2Res.data.pagination.hasPrevPage === true, "Page 2 has prev page");
  assert(page2Res.data.pagination.nextPage === 3, "Page 2 nextPage is 3");
  assert(page2Res.data.pagination.prevPage === 1, "Page 2 prevPage is 1");
  assert(page2Res.data.products.length === 2, "Returns exactly 2 products for page 2");

  const page2ProductNames = page2Res.data.products.map((p) => p.name);
  console.log("   Page 2 items:", page2ProductNames);

  // Ensure no overlap between page 1 and page 2
  const overlap = page1ProductNames.some((name) => page2ProductNames.includes(name));
  assert(!overlap, "Page 1 and Page 2 products do NOT overlap (proper SQL offset)");

  // 4. Page 3 (Last page)
  const page3Res = await fetchJson(`${baseUrl}?businessCode=T2G-BAKERY&page=3&limit=2`);
  assert(page3Res.data.pagination.page === 3, "Pagination page is 3");
  assert(page3Res.data.pagination.hasNextPage === false, "Page 3 (last page) hasNextPage is false");
  assert(page3Res.data.pagination.hasPrevPage === true, "Page 3 hasPrevPage is true");
  assert(page3Res.data.pagination.nextPage === null, "Page 3 nextPage is null");

  // 5. Out of bounds page
  console.log("\n--- 3. Edge Cases & Boundary Handling ---");
  const outOfBoundsRes = await fetchJson(`${baseUrl}?businessCode=T2G-BAKERY&page=99&limit=10`);
  assert(outOfBoundsRes.data.products.length === 0, "Out of bounds page returns empty products array gracefully");
  assert(outOfBoundsRes.data.pagination.page === 99, "Returns requested page number");
  assert(outOfBoundsRes.data.pagination.hasNextPage === false, "hasNextPage is false for out of bounds page");

  // 6. Search keyword filtering with pagination
  console.log("\n--- 4. Search & Filter Integration ---");
  const searchRes = await fetchJson(`${baseUrl}?businessCode=T2G-BAKERY&search=Puff&page=1&limit=5`);
  assert(searchRes.data.products.length === 1, "Search for 'Puff' returns 1 matching product");
  assert(searchRes.data.products[0].name.includes("Puff"), "Returned product name contains 'Puff'");
  assert(searchRes.data.pagination.totalProducts === 1, "Pagination total reflects search filter count");

  // 7. Category filtering with pagination
  const catRes = await fetchJson(`${baseUrl}?businessCode=T2G-BAKERY&category=Bread%20%26%20Loaves`);
  assert(catRes.data.products.length === 1, "Category 'Bread & Loaves' filter works correctly");
  assert(catRes.data.products[0].name === "Fresh Woodfired Roast Bread", "Correct product filtered by category");

  // 8. Sorting options
  console.log("\n--- 5. Sorting Options ---");
  const sortPriceDesc = await fetchJson(`${baseUrl}?businessCode=T2G-BAKERY&sortBy=price_desc&limit=6`);
  const pricesDesc = sortPriceDesc.data.products.map((p) => p.sellingPrice);
  const isSortedDesc = pricesDesc.every((v, i, a) => !i || a[i - 1] >= v);
  assert(isSortedDesc, `Products properly sorted by price descending: ${pricesDesc.join(", ")}`);

  // 9. Multi-tenant isolation (T2G-GROCERY)
  console.log("\n--- 6. Multi-Tenant Business Isolation ---");
  const groceryRes = await fetchJson(`${baseUrl}?businessCode=T2G-GROCERY&page=1&limit=10`);
  assert(groceryRes.data.business.name === "Lanka Fresh Supermarket", "T2G-GROCERY correctly resolves Lanka Fresh Supermarket");
  assert(groceryRes.data.products.some((p) => p.name.includes("Marie Biscuits")), "Contains Lanka Fresh grocery products");
  assert(!groceryRes.data.products.some((p) => p.name.includes("Donut")), "Does NOT leak Bakery products into Grocery catalog");

  console.log("\n=========================================================");
  console.log("🎉 ALL 12 TESTS PASSED! PAGINATED API READY FOR PRODUCTION!");
  console.log("=========================================================\n");
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
