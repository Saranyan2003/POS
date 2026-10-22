const http = require("http");

const routes = [
  "/",
  "/login",
  "/change-password",
  "/pos",
  "/inventory",
  "/reports",
  "/sales",
  "/customers",
  "/suppliers",
  "/purchases",
  "/expenses",
  "/branches",
  "/staff",
  "/settings",
  "/subscription",
  "/admin/dashboard",
  "/admin/businesses",
  "/admin/plans",
  "/admin/audit-logs",
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${route}`, (res) => {
      resolve({ route, status: res.statusCode });
    });
    req.on("error", (err) => {
      resolve({ route, error: err.message });
    });
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ route, error: "TIMEOUT" });
    });
  });
}

async function run() {
  console.log("Checking all routes on http://localhost:3000...\n");
  for (const r of routes) {
    const res = await checkRoute(r);
    if (res.status === 200 || res.status === 307 || res.status === 302) {
      console.log(`[PASS] ${res.route} -> HTTP ${res.status}`);
    } else {
      console.log(`[FAIL] ${res.route} -> ${res.status || res.error}`);
    }
  }
}

run();
