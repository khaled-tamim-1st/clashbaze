import { Router } from "express";
import { db, accountsTable, blogTable } from "@workspace/db";
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

router.get("/", async (req, res) => {
  try {
    // 1. جلب البيانات باستخدام قيم enum الصحيحة في قاعدة البيانات ("clash-of-clans" و "clash-royale")
    const [cocAccounts, royaleAccounts, latestPosts] = await Promise.all([
      db
        .select()
        .from(accountsTable)
        .where(and(eq(accountsTable.game, "clash-of-clans"), eq(accountsTable.status, "available")))
        .orderBy(desc(accountsTable.featured), desc(accountsTable.id))
        .limit(6),
      db
        .select()
        .from(accountsTable)
        .where(and(eq(accountsTable.game, "clash-royale"), eq(accountsTable.status, "available")))
        .orderBy(desc(accountsTable.featured), desc(accountsTable.id))
        .limit(6),
      db.select().from(blogTable).orderBy(desc(blogTable.createdAt)).limit(3),
    ]);

    const cocHtml = cocAccounts.length
      ? `<div class="grid-list">${cocAccounts.map(accountCardHtml).join("")}</div>`
      : `<p>لا توجد حسابات كلاش أوف كلانز متاحة حاليًا.</p>`;

    const royaleHtml = royaleAccounts.length
      ? `<div class="grid-list">${royaleAccounts.map(accountCardHtml).join("")}</div>`
      : `<p>لا توجد حسابات كلاش رويال متاحة حاليًا.</p>`;

    const blogHtml = latestPosts.length
      ? `<ul class="post-list">${latestPosts
          .map(
            (p) => `<li>
              <a class="post-title" href="/blog/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>
              <div class="meta">${new Date(p.createdAt).toLocaleDateString("ar-EG")}</div>
            </li>`,
          )
          .join("")}</ul>`
      : "";

    const description =
      "كلاش ماركت - المتجر الموثوق لبيع وشراء حسابات كلاش أوف كلانز وكلاش رويال بأسعار مناسبة وضمان كامل.";

    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL || undefined,
        description,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL || undefined,
        inLanguage: "ar",
      },
    ];

    const bodyHtml = `
      <h1>${escapeHtml(SITE_NAME)} - بيع وشراء حسابات كلاش</h1>
      <p>${description}</p>

      <h2>حسابات كلاش أوف كلانز</h2>
      ${cocHtml}
      <p><a href="/clash-of-clans">عرض كل حسابات كلاش أوف كلانز ←</a></p>

      <h2>حسابات كلاش رويال</h2>
      ${royaleHtml}
      <p><a href="/clash-royale">عرض كل حسابات كلاش رويال ←</a></p>

      ${latestPosts.length ? `<h2>أحدث المقالات</h2>${blogHtml}<p><a href="/blog">عرض كل المقالات ←</a></p>` : ""}
    `;

    const html = pageShell({
      title: `${SITE_NAME} - بيع وشراء حسابات كلاش أوف كلانز وكلاش رويال`,
      description,
      canonicalPath: "/",
      ogImage: `${SITE_URL}/opengraph.png`,
      bodyHtml,
      jsonLd,
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err: any) {
    req.log.error({ err }, "Failed to render home page");
    res.status(500).send("Internal server error");
  }
});

export default router;