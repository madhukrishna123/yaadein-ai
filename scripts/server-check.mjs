const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";

const checks = [
  { name: "home", path: "/", expectedStatus: 200 },
  { name: "admin login", path: "/admin/login", expectedStatus: 200 },
  { name: "mock WhatsApp start", path: "/api/mock-whatsapp/start", method: "POST", expectedStatus: 200 },
  { name: "admin jobs protected", path: "/api/admin/jobs", expectedStatus: 401 }
];

let failed = 0;

for (const check of checks) {
  const url = new URL(check.path, baseUrl);
  try {
    const response = await fetch(url, { method: check.method || "GET", redirect: "manual" });
    const ok = response.status === check.expectedStatus;
    console.log(`${ok ? "OK" : "FAIL"} ${check.name}: ${response.status} ${url}`);
    if (!ok) failed += 1;
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${check.name}: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

if (failed > 0) {
  process.exitCode = 1;
}
