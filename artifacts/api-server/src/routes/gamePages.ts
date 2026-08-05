import { Router } from "express";
import { db, accountsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { escapeHtml, pageShell, SITE_NAME, SITE_URL } from "../lib/pageshell";

const router = Router();

function accountCardHtml(a: {
  slug: string;
  title: string;
  price: string | number;
  images: string[] | null;
}) {
  const img = a.images && a.images.length > 0 ? a.images[0] : "";
  return `
    <a class="card" href="/account/${escapeHtml(a.slug)}">
      ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(a.title)}" loading="lazy" />` : ""}
      <div class="card-body">
        <div class="card-title">${escapeHtml(a.title)}</div>
        <div class="card-price">${Number(a.price).toLocaleString("ar-SA")} ر.س</div>
      </div>
    </a>`;
}

// 1. صفحة قسم كلاش أوف كلانس
router.get("/clash-of-clans", async (req, res) => {
  try {
    const accounts = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.game, "clash-of-clans"), eq(accountsTable.status, "available")))
      .orderBy(desc(accountsTable.id));

    const accountsHtml = accounts.length
      ? `<div class="grid-list">${accounts.map(accountCardHtml).join("")}</div>`
      : `<p>لا توجد حسابات كلاش أوف كلانز متاحة حاليًا.</p>`;

    const title = `حسابات كلاش أوف كلانز للبيع - ${SITE_NAME}`;
    const description = "تسوق أفضل حسابات كلاش أوف كلانز (CoC) الموثوقة والمميزة بأسعار مناسبة وضمان تسليم فوري.";

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: SITE_URL ? `${SITE_URL}/clash-of-clans` : "/clash-of-clans",
    };

    const bodyHtml = `
      <span class="badge coc">كلاش أوف كلانز</span>
      <h1>حسابات كلاش أوف كلانز للبيع</h1>
      <p>${description}</p>
      ${accountsHtml}
      <p><a class="back-link" href="/">← العودة للصفحة الرئيسية</a></p>
    `;

    const html = pageShell({
      title,
      description,
      canonicalPath: "/clash-of-clans",
      bodyHtml,
      jsonLd,
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render Clash of Clans page");
    res.status(500).send("Internal server error");
  }
});

// 2. صفحة قسم كلاش رويال
router.get("/clash-royale", async (req, res) => {
  try {
    const accounts = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.game, "clash-royale"), eq(accountsTable.status, "available")))
      .orderBy(desc(accountsTable.id));

    const accountsHtml = accounts.length
      ? `<div class="grid-list">${accounts.map(accountCardHtml).join("")}</div>`
      : `<p>لا توجد حسابات كلاش رويال متاحة حاليًا.</p>`;

    const title = `حسابات كلاش رويال للبيع - ${SITE_NAME}`;
    const description = "تسوق أحدث حسابات كلاش رويال (Clash Royale) مع كروت ماكس وأرينا عالية وأسعار تنافسية.";

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: SITE_URL ? `${SITE_URL}/clash-royale` : "/clash-royale",
    };

    const bodyHtml = `
      <span class="badge royale">كلاش رويال</span>
      <h1>حسابات كلاش رويال للبيع</h1>
      <p>${description}</p>
      ${accountsHtml}
      <p><a class="back-link" href="/">← العودة للصفحة الرئيسية</a></p>
    `;

    const html = pageShell({
      title,
      description,
      canonicalPath: "/clash-royale",
      bodyHtml,
      jsonLd,
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render Clash Royale page");
    res.status(500).send("Internal server error");
  }
});

export default router;