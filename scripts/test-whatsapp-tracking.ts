#!/usr/bin/env tsx

/**
 * scripts/test-whatsapp-tracking.ts
 * Comprehensive QA & Verification Suite for WhatsApp Click Tracking Tool
 */

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/test_clashbaze";
process.env.WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "966576742294";
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || "owner@clashbaze.com";
process.env.TRACKING_HASH_SECRET = process.env.TRACKING_HASH_SECRET || "test-salt-secret-2026";

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

console.log("🧪 ========================================================");
console.log("   WhatsApp Click Tracking Full QA Verification Suite");
console.log("========================================================\n");

let passedTests = 0;
let totalTests = 0;

function test(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function asyncTest(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

// -----------------------------------------------------------------------------
// TIER 1: UNIT TESTS — Attribution, Security, Privacy & Classification
// -----------------------------------------------------------------------------
console.log("🔹 TIER 1: Attribution, Security, Privacy & Classification");

import {
  classifyDevice,
  extractBrowser,
  extractOs,
  classifyTraffic,
  hashIp,
  buildSafeWhatsAppDestination,
  checkRateLimit,
  ALLOWED_CTA_IDS,
} from "../artifacts/api-server/src/lib/whatsappTracking";

import { createWhatsAppTrackingUrl } from "../artifacts/clash-base-market/src/lib/whatsappTracking";

test("Device Classification: Mobile detection", () => {
  const iphoneUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
  const androidUA = "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.119 Mobile Safari/537.36";
  assert.equal(classifyDevice(iphoneUA), "mobile");
  assert.equal(classifyDevice(androidUA), "mobile");
});

test("Device Classification: Tablet detection", () => {
  const ipadUA = "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
  const androidTabUA = "Mozilla/5.0 (Linux; Android 13; SM-X800) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Safari/537.36";
  assert.equal(classifyDevice(ipadUA), "tablet");
  assert.equal(classifyDevice(androidTabUA), "tablet");
});

test("Device Classification: Desktop detection", () => {
  const winUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
  const macUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
  assert.equal(classifyDevice(winUA), "desktop");
  assert.equal(classifyDevice(macUA), "desktop");
});

test("Browser and OS Extraction", () => {
  const chromeWinUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
  const safariIosUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
  assert.equal(extractBrowser(chromeWinUA), "Chrome");
  assert.equal(extractOs(chromeWinUA), "Windows");
  assert.equal(extractBrowser(safariIosUA), "Safari");
  assert.equal(extractOs(safariIosUA), "iOS");
});

test("Bot and Crawler Classification", () => {
  const googlebotUA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
  const bingbotUA = "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)";
  const humanUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15";

  assert.equal(classifyTraffic(googlebotUA, false), "bot");
  assert.equal(classifyTraffic(bingbotUA, false), "bot");
  assert.equal(classifyTraffic(humanUA, false), "human");
  assert.equal(classifyTraffic(humanUA, true), "suspicious"); // rate limit exceeded
});

test("Privacy: IP Hashing (No raw IP stored)", () => {
  const ip1 = "192.168.1.100";
  const ip2 = "192.168.1.101";
  const hash1 = hashIp(ip1);
  const hash2 = hashIp(ip2);

  assert.ok(hash1 && hash1.length === 64, "SHA-256 hash length must be 64 chars");
  assert.notEqual(hash1, ip1, "Raw IP must never be output");
  assert.notEqual(hash1, hash2, "Different IPs must produce different hashes");
  assert.equal(hashIp(ip1), hash1, "Same IP must produce deterministic hash");
});

test("Security: Whitelist Destination & Open Redirect Prevention", () => {
  const validUrl1 = buildSafeWhatsAppDestination("966576742294", "مرحبا أريد شراء حساب");
  const validUrl2 = buildSafeWhatsAppDestination("+966 57 674 2294", null);

  assert.ok(validUrl1.startsWith("https://wa.me/966576742294"), "Destination must start with trusted wa.me domain");
  assert.ok(validUrl1.includes("text="), "Text parameter must be attached");
  assert.equal(validUrl2, "https://wa.me/966576742294", "Destination must strip non-digit characters");
});

test("Security: Rate Limiting Sliding Window", () => {
  const testIp = "test_ip_hash_" + Math.random().toString(36);
  let result;
  for (let i = 0; i < 40; i++) {
    result = checkRateLimit(testIp);
    assert.equal(result.allowed, true, `Request ${i + 1} within 40 should be allowed`);
  }
  // 41st request should trigger rate limit
  result = checkRateLimit(testIp);
  assert.equal(result.allowed, false, "41st request must exceed rate limit");
});

test("CTA Registry Integrity", () => {
  assert.ok(ALLOWED_CTA_IDS.has("product_card"));
  assert.ok(ALLOWED_CTA_IDS.has("product_detail"));
  assert.ok(ALLOWED_CTA_IDS.has("product_detail_ssr"));
  assert.ok(ALLOWED_CTA_IDS.has("footer_contact"));
  assert.ok(ALLOWED_CTA_IDS.has("about_contact"));
  assert.ok(ALLOWED_CTA_IDS.has("how_it_works_contact"));
  assert.ok(ALLOWED_CTA_IDS.has("coc_hub_contact"));
  assert.ok(ALLOWED_CTA_IDS.has("cr_hub_contact"));
});

test("Client URL Builder: createWhatsAppTrackingUrl", () => {
  const url = createWhatsAppTrackingUrl({
    cta: "product_card",
    accountId: 42,
    text: "طلب حساب تاون 18",
  });
  assert.ok(url.startsWith("/go/whatsapp/product_card"), "URL must start with /go/whatsapp/product_card");
  assert.ok(url.includes("accountId=42"), "Must include accountId");
  assert.ok(url.includes("text="), "Must include encoded text");
});

// -----------------------------------------------------------------------------
// TIER 2: INTEGRATION TESTS — Express Endpoints, Redirects & SEO Headers
// -----------------------------------------------------------------------------
console.log("\n🔹 TIER 2: Integration Tests — Express Server & Endpoints");

import app from "../artifacts/api-server/src/app";

await asyncTest("Express Integration: /go/whatsapp/:cta issues 302 redirect & security headers", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address() as any;
  const port = addr.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/go/whatsapp/footer_contact`, {
      redirect: "manual",
    });

    assert.equal(res.status, 302, "Must return HTTP 302 temporary redirect");
    const location = res.headers.get("location");
    assert.ok(location && location.startsWith("https://wa.me/"), `Redirect location must be wa.me, got: ${location}`);

    const robotsTag = res.headers.get("x-robots-tag");
    assert.equal(robotsTag, "noindex, nofollow, noarchive", "SEO safety: must prevent indexing of tracking URLs");

    const cacheControl = res.headers.get("cache-control");
    assert.ok(cacheControl && cacheControl.includes("no-store"), "Must prevent caching of tracking redirects");
  } finally {
    server.close();
  }
});

await asyncTest("Express Integration: /go/whatsapp JSON format response", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address() as any;
  const port = addr.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/go/whatsapp/product_card?format=json&accountId=1&utm_source=google`, {
      headers: { Accept: "application/json" },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.redirectUrl.startsWith("https://wa.me/"), `Must return safe redirectUrl, got: ${data.redirectUrl}`);
  } finally {
    server.close();
  }
});

await asyncTest("Express Integration: Fallback resilience (never breaks user redirect)", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address() as any;
  const port = addr.port;

  try {
    // Calling with an invalid accountId that cannot be in DB or when DB errors
    const res = await fetch(`http://127.0.0.1:${port}/go/whatsapp/unknown_cta?accountId=9999999`, {
      redirect: "manual",
    });

    assert.equal(res.status, 302, "Even if DB has no record or errors, must still return 302 redirect");
    const location = res.headers.get("location");
    assert.ok(location && location.startsWith("https://wa.me/"), "Must redirect safely to WhatsApp");
  } finally {
    server.close();
  }
});

await asyncTest("Express Integration: Admin endpoints require authorization (401)", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address() as any;
  const port = addr.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/whatsapp/overview`);
    assert.equal(res.status, 401, "Unauthenticated request to admin overview must return 401");

    const eventsRes = await fetch(`http://127.0.0.1:${port}/api/admin/whatsapp/events`);
    assert.equal(eventsRes.status, 401, "Unauthenticated request to admin events must return 401");
  } finally {
    server.close();
  }
});

await asyncTest("Express Integration: Edge Worker routes /go/* to VPS origin", async () => {
  const workerFile = path.join(ROOT_DIR, "artifacts/worker/index.ts");
  const content = fs.readFileSync(workerFile, "utf-8");
  assert.ok(content.includes('/go/'), "Worker must proxy /go/ to VPS origin");
  assert.ok(content.includes('/api/'), "Worker must proxy /api/ to VPS origin");
});

// -----------------------------------------------------------------------------
// TIER 3: TOUCHPOINT AUDIT & FRONTEND UNIFIED COMPONENT AUDIT
// -----------------------------------------------------------------------------
console.log("\n🔹 TIER 3: Touchpoints Inventory & Unified Abstraction Audit");

test("Touchpoints Inventory: AccountCard uses TrackedWhatsAppLink", () => {
  const code = fs.readFileSync(path.join(ROOT_DIR, "artifacts/clash-base-market/src/components/AccountCard.tsx"), "utf-8");
  assert.ok(code.includes("TrackedWhatsAppLink"), "AccountCard must use TrackedWhatsAppLink");
  assert.ok(code.includes('cta="product_card"'), "AccountCard must set cta='product_card'");
  assert.ok(!code.includes('href="https://wa.me/'), "Direct un-tracked wa.me link must not exist in AccountCard");
});

test("Touchpoints Inventory: AccountDetail uses TrackedWhatsAppLink", () => {
  const code = fs.readFileSync(path.join(ROOT_DIR, "artifacts/clash-base-market/src/pages/AccountDetail.tsx"), "utf-8");
  assert.ok(code.includes("TrackedWhatsAppLink"), "AccountDetail must use TrackedWhatsAppLink");
  assert.ok(code.includes('cta="product_detail"'), "AccountDetail must set cta='product_detail'");
  assert.ok(!code.includes('href={whatsappLink}'), "Direct un-tracked wa.me link must not exist in AccountDetail");
});

test("Touchpoints Inventory: Footer uses TrackedWhatsAppLink", () => {
  const code = fs.readFileSync(path.join(ROOT_DIR, "artifacts/clash-base-market/src/components/layout/Footer.tsx"), "utf-8");
  assert.ok(code.includes("TrackedWhatsAppLink"), "Footer must use TrackedWhatsAppLink");
  assert.ok(code.includes('cta="footer_contact"'), "Footer must set cta='footer_contact'");
  assert.ok(!code.includes('href={whatsappLink}'), "Direct un-tracked wa.me link must not exist in Footer");
});

test("Touchpoints Inventory: About page uses TrackedWhatsAppLink", () => {
  const code = fs.readFileSync(path.join(ROOT_DIR, "artifacts/clash-base-market/src/pages/About.tsx"), "utf-8");
  assert.ok(code.includes("TrackedWhatsAppLink"), "About must use TrackedWhatsAppLink");
  assert.ok(code.includes('cta="about_contact"'), "About must set cta='about_contact'");
});

test("Touchpoints Inventory: HowItWorks page uses TrackedWhatsAppLink", () => {
  const code = fs.readFileSync(path.join(ROOT_DIR, "artifacts/clash-base-market/src/pages/HowItWorks.tsx"), "utf-8");
  assert.ok(code.includes("TrackedWhatsAppLink"), "HowItWorks must use TrackedWhatsAppLink");
  assert.ok(code.includes('cta="how_it_works_contact"'), "HowItWorks must set cta='how_it_works_contact'");
});

test("Touchpoints Inventory: ClashOfClans hub uses TrackedWhatsAppLink", () => {
  const code = fs.readFileSync(path.join(ROOT_DIR, "artifacts/clash-base-market/src/pages/ClashOfClans.tsx"), "utf-8");
  assert.ok(code.includes("TrackedWhatsAppLink"), "ClashOfClans must use TrackedWhatsAppLink");
  assert.ok(code.includes('cta="coc_hub_contact"'), "ClashOfClans must set cta='coc_hub_contact'");
});

test("Touchpoints Inventory: ClashRoyale hub uses TrackedWhatsAppLink", () => {
  const code = fs.readFileSync(path.join(ROOT_DIR, "artifacts/clash-base-market/src/pages/ClashRoyale.tsx"), "utf-8");
  assert.ok(code.includes("TrackedWhatsAppLink"), "ClashRoyale must use TrackedWhatsAppLink");
  assert.ok(code.includes('cta="cr_hub_contact"'), "ClashRoyale must set cta='cr_hub_contact'");
});

test("Touchpoints Inventory: SSR accountpages uses tracked /go/whatsapp URL", () => {
  const code = fs.readFileSync(path.join(ROOT_DIR, "artifacts/api-server/src/routes/accountpages.ts"), "utf-8");
  assert.ok(code.includes("/go/whatsapp/product_detail_ssr"), "SSR accountpages must point to /go/whatsapp/product_detail_ssr");
  assert.ok(!code.includes("return `https://wa.me/"), "SSR accountpages must not generate un-tracked direct wa.me link");
});

test("Admin Navigation: WhatsApp Analytics present in AdminLayout & App.tsx", () => {
  const adminLayoutCode = fs.readFileSync(path.join(ROOT_DIR, "artifacts/clash-base-market/src/components/layout/AdminLayout.tsx"), "utf-8");
  const appTsxCode = fs.readFileSync(path.join(ROOT_DIR, "artifacts/clash-base-market/src/App.tsx"), "utf-8");
  assert.ok(adminLayoutCode.includes("/admin/whatsapp"), "AdminLayout must link to /admin/whatsapp");
  assert.ok(appTsxCode.includes("/admin/whatsapp"), "App.tsx must register /admin/whatsapp route");
});

// -----------------------------------------------------------------------------
// TIER 4: NEW REGRESSION & ROBUSTNESS TESTS (Post-Fix Verification)
// -----------------------------------------------------------------------------
console.log("\n🔹 TIER 4: Regression & Robustness Tests (Fixes Verification)");

test("Developer API: createWhatsAppRedirect and trackWhatsAppClick exported", async () => {
  const mod = await import("../artifacts/clash-base-market/src/lib/whatsappTracking");
  assert.equal(typeof mod.createWhatsAppRedirect, "function", "createWhatsAppRedirect must be exported");
  assert.equal(typeof mod.trackWhatsAppClick, "function", "trackWhatsAppClick must be exported");
  const url = mod.createWhatsAppRedirect({ cta: "test_cta" });
  assert.ok(url.startsWith("/go/whatsapp/test_cta"), "createWhatsAppRedirect must return /go/whatsapp/... url");
});

test("Security: Unauthorized destination number rejection", async () => {
  const mod = await import("../artifacts/api-server/src/lib/whatsappTracking");
  // Attacker tries to pass an external number
  const safeUrl = mod.buildSafeWhatsAppDestination("1234567890", "malicious test");
  assert.ok(
    safeUrl.startsWith("https://wa.me/966576742294"),
    `Unauthorized number must fall back to trusted store number, got: ${safeUrl}`
  );
});

await asyncTest("Express Integration: Link click with Accept: application/json still 302 redirects", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address() as any;
  const port = addr.port;

  try {
    // Normal browser or webview click without ?format=json
    const res = await fetch(`http://127.0.0.1:${port}/go/whatsapp/footer_contact`, {
      redirect: "manual",
      headers: { Accept: "application/json, text/html, */*" },
    });

    assert.equal(res.status, 302, "Standard navigation link click must 302 redirect even if Accept includes application/json");
    const loc = res.headers.get("location");
    assert.ok(loc && loc.startsWith("https://wa.me/"), "Redirect location must be wa.me");
  } finally {
    server.close();
  }
});

await asyncTest("SEO Safety: robots.txt disallows /go/ and /api/track/", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address() as any;
  const port = addr.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/robots.txt`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes("Disallow: /go/"), "robots.txt must disallow /go/");
    assert.ok(text.includes("Disallow: /api/track/"), "robots.txt must disallow /api/track/");
  } finally {
    server.close();
  }
});

test("Admin UI Integrity: All API calls use /api/admin/whatsapp and render Page Performance", () => {
  const code = fs.readFileSync(path.join(ROOT_DIR, "artifacts/clash-base-market/src/pages/admin/WhatsAppAnalytics.tsx"), "utf-8");
  assert.ok(code.includes("customFetch<OverviewData>(`/api/admin/whatsapp/overview"), "Must use /api/admin/whatsapp/overview");
  assert.ok(code.includes("customFetch<{ pages: PageStat[] }>(`/api/admin/whatsapp/pages"), "Must use /api/admin/whatsapp/pages");
  assert.ok(!code.includes("customFetch<OverviewData>(`/admin/whatsapp/overview"), "Must not use un-proxied /admin/whatsapp");
  assert.ok(code.includes("أداء الصفحات المصدر"), "Must render Page Performance section");
  assert.ok(code.includes("toggleProductSort"), "Must support configurable product table sorting");
  assert.ok(code.includes("customStartDate"), "Must support custom date range filtering");
});

test("Vite Proxy Integrity: Proxies /go and /api", () => {
  const code = fs.readFileSync(path.join(ROOT_DIR, "artifacts/clash-base-market/vite.config.ts"), "utf-8");
  assert.ok(code.includes('"/api"'), "Vite config must proxy /api");
  assert.ok(code.includes('"/go"'), "Vite config must proxy /go");
});

console.log("\n========================================================");
console.log(`🎉 All ${passedTests} / ${totalTests} WhatsApp Click Tracking tests passed successfully!`);
console.log("========================================================\n");

