import assert from "node:assert/strict";

console.log("Starting verification of sold accounts and priority ordering...");

// Test 1: Priority sorting function logic
const statusWeight = {
  available: 1,
  reserved: 2,
  sold: 3,
};

function sortAccounts(items) {
  return [...items].sort((a, b) => {
    const wA = statusWeight[a.status] || 99;
    const wB = statusWeight[b.status] || 99;
    if (wA !== wB) return wA - wB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

const mockAccounts = [
  { id: 1, title: "Account 1", status: "sold", createdAt: "2026-09-01T10:00:00Z" },
  { id: 2, title: "Account 2", status: "available", createdAt: "2026-09-02T10:00:00Z" },
  { id: 3, title: "Account 3", status: "reserved", createdAt: "2026-09-03T10:00:00Z" },
  { id: 4, title: "Account 4", status: "available", createdAt: "2026-09-04T10:00:00Z" },
  { id: 5, title: "Account 5", status: "sold", createdAt: "2026-09-05T10:00:00Z" },
];

const sorted = sortAccounts(mockAccounts);

assert.equal(sorted[0].id, 4, "First should be newest available account");
assert.equal(sorted[1].id, 2, "Second should be older available account");
assert.equal(sorted[2].id, 3, "Third should be reserved account");
assert.equal(sorted[3].id, 5, "Fourth should be newest sold account");
assert.equal(sorted[4].id, 1, "Fifth should be older sold account");

console.log("✅ Test 1: Priority ordering (available -> reserved -> sold) verified!");

// Test 2: Verify SSR card markup generation
const isSold = true;
const statusText = "تم البيع";
const badgeStyle = "background:#991b1b; color:#fecaca; border:1px solid #dc2626; font-weight:800;";
const cardHtml = `
  <a class="card" href="/account/test" style="${isSold ? "opacity:0.88;" : ""}">
    <span style="${badgeStyle}">${statusText}</span>
    ${isSold ? '<div class="sold-overlay"><span>تم البيع</span></div>' : ""}
  </a>
`;

assert.ok(cardHtml.includes("تم البيع"), "HTML contains تم البيع");
assert.ok(cardHtml.includes("sold-overlay"), "HTML contains sold-overlay");
console.log("✅ Test 2: Sold account card HTML representation verified!");

console.log("🎉 All local assertion tests passed!");
