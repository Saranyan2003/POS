const http = require('http');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const baseURL = 'http://localhost:3000';

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url, baseURL);
    const req = http.request(parsed, {
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, json: () => JSON.parse(data), text: () => data });
        } catch(e) {
          resolve({ status: res.statusCode, headers: res.headers, json: () => null, text: () => data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runDateFilterTests() {
  console.log("=================================================");
  console.log("  COMMENCING UNIVERSAL DATE RANGE QA TEST SUITE  ");
  console.log("=================================================\n");

  // 1. Authenticate by finding an active business & user, setting role to BUSINESS_OWNER
  const business = await prisma.business.findFirst({
    where: { status: "ACTIVE" },
    include: { branches: true }
  });

  let user = await prisma.user.findFirst();
  if (user && business) {
    await prisma.userBusiness.upsert({
      where: {
        userId_businessId: { userId: user.id, businessId: business.id }
      },
      update: { role: 'BUSINESS_OWNER' },
      create: {
        userId: user.id,
        businessId: business.id,
        role: 'BUSINESS_OWNER'
      }
    });
  }

  const businessId = business?.id;
  const branchId = business?.branches[0]?.id;

  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      activeBusinessId: businessId,
      activeBranchId: branchId,
      expiresAt
    }
  });

  const cookie = `pos_session_token=${sessionToken}`;
  console.log(`[AUTH] Established active session for user: ${user.name} (${user.loginId}) [Role: BUSINESS_OWNER]`);
  console.log(`[AUTH] Business: ${business?.name || 'Default Store'} (${businessId}), Branch ID: ${branchId}\n`);

  // Ensure at least 1 customer and 1 supplier exist for drawer tests
  let testCust = await prisma.customer.findFirst({ where: { businessId } });
  if (!testCust) {
    testCust = await prisma.customer.create({
      data: {
        businessId,
        name: "QA Test Customer",
        phone: "0771234567"
      }
    });
  }

  let testSup = await prisma.supplier.findFirst({ where: { businessId } });
  if (!testSup) {
    testSup = await prisma.supplier.create({
      data: {
        businessId,
        name: "QA Test Supplier",
        phone: "0779876543"
      }
    });
  }

  const headers = {
    'Cookie': cookie,
    'Content-Type': 'application/json'
  };

  const testRanges = [
    { label: 'Custom Range (2024.01.01 - 2026.02.01)', params: 'startDate=2024-01-01&endDate=2026-02-01' },
    { label: 'Preset: today', params: 'range=today' },
    { label: 'Preset: week (Past 7 Days)', params: 'range=week' },
    { label: 'Preset: month (This Month)', params: 'range=month' },
    { label: 'Preset: year (This Year)', params: 'range=year' },
    { label: 'Preset: all (All Time)', params: 'range=all' }
  ];

  const endpoints = [
    { name: 'Reports Summary API', path: '/api/reports/summary' },
    { name: 'Sales Transactions API', path: '/api/sales' },
    { name: 'Inventory Movement Logs API', path: '/api/inventory/movements' },
    { name: 'Operating Expenses API', path: '/api/expenses' },
    { name: 'Purchases Inward Deliveries API', path: '/api/purchases' },
    { name: 'System Security Audit Logs API', path: '/api/admin/audit-logs' }
  ];

  let totalTests = 0;
  let passedTests = 0;

  for (const ep of endpoints) {
    console.log(`--- Testing ${ep.name} (${ep.path}) ---`);
    for (const r of testRanges) {
      totalTests++;
      const fullUrl = `${ep.path}?${r.params}`;
      const res = await fetch(fullUrl, { headers });
      const rawText = res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch(e) {
        console.error(`  ✗ [ERR] Failed parsing JSON for ${fullUrl} (Status: ${res.status}): ${rawText.slice(0, 300)}`);
        continue;
      }

      if (res.status === 200 && data) {
        console.log(`  ✓ [PASS] ${r.label.padEnd(42)} -> Status 200 OK`);
        passedTests++;
      } else {
        console.error(`  ✗ [FAIL] ${r.label.padEnd(42)} -> Status ${res.status}:`, data);
      }
    }
    console.log('');
  }

  // 2. Test Customer Ledger with Date Filter
  console.log(`--- Testing Customer Ledger Drawer with Date Range ---`);
  const custId = testCust.id;
  for (const r of testRanges) {
    totalTests++;
    const res = await fetch(`/api/customers/${custId}?${r.params}`, { headers });
    const data = await res.json();
    if (res.status === 200 && data?.customer) {
      console.log(`  ✓ [PASS] Customer Ledger (${r.label.padEnd(35)}) -> Status 200 OK (${data.customer.sales?.length || 0} invoices)`);
      passedTests++;
    } else {
      console.error(`  ✗ [FAIL] Customer Ledger (${r.label}) -> Status ${res.status}`);
    }
  }
  console.log('');

  // 3. Test Supplier Deliveries with Date Filter
  console.log(`--- Testing Supplier Deliveries Drawer with Date Range ---`);
  const supId = testSup.id;
  for (const r of testRanges) {
    totalTests++;
    const res = await fetch(`/api/suppliers/${supId}?${r.params}`, { headers });
    const data = await res.json();
    if (res.status === 200 && data?.supplier) {
      console.log(`  ✓ [PASS] Supplier Invoices (${r.label.padEnd(35)}) -> Status 200 OK (${data.supplier.purchases?.length || 0} deliveries)`);
      passedTests++;
    } else {
      console.error(`  ✗ [FAIL] Supplier Invoices (${r.label}) -> Status ${res.status}`);
    }
  }

  console.log(`\n=================================================`);
  console.log(`  DATE RANGE TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log(`=================================================`);

  await prisma.$disconnect();

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runDateFilterTests().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
