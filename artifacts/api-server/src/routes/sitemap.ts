import { Router } from "express";
import { db, accountsTable, blogTable } from "@workspace/db";
import { ne } from "drizzle-orm";

const router = Router();

const SITE_URL = (process.env["FRONTEND_URL"] || "").replace(/\/$/, "");

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(path: string, opts: { lastmod?: Date; priority?: string; changefreq?: string } = {}) {
  const { lastmod, priority = "0.7", changefreq = "weekly" } = opts;
  return `  <url>
    <loc>${escapeXml(SITE_URL + path)}</loc>
    ${lastmod ? `<lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

router.get("/sitemap.xml", async (req, res) => {
  try {
    if (!SITE_URL) {
      req.log.warn("FRONTEND_URL is not set — sitemap URLs will be relative and likely rejected by search engines.");
    }

    const [accounts, posts] = await Promise.all([
      // نستبعد الحسابات المباعة (sold) من الـ sitemap لأنها صفحات منتهية الغرض التجاري،
      // وإدراجها بيضيّع crawl budget ويقلل جودة الإشارة العامة للموقع.
      db
        .select({ slug: accountsTable.slug, createdAt: accountsTable.createdAt, status: accountsTable.status })
        .from(accountsTable)
        .where(ne(accountsTable.status, "sold")),
      db.select({ slug: blogTable.slug, createdAt: blogTable.createdAt }).from(blogTable),
    ]);

    const staticUrls = [
      urlEntry("/", { priority: "1.0", changefreq: "daily" }),
      urlEntry("/clash-of-clans", { priority: "0.9", changefreq: "daily" }),
      urlEntry("/clash-royale", { priority: "0.9", changefreq: "daily" }),
      urlEntry("/blog", { priority: "0.8", changefreq: "weekly" }),
    ];

    const accountUrls = accounts.map((a) =>
      urlEntry(`/account/${a.slug}`, {
        lastmod: a.createdAt,
        priority: a.status === "reserved" ? "0.7" : "0.8",
        changefreq: "daily",
      }),
    );
    const blogUrls = posts.map((p) => urlEntry(`/blog/${p.slug}`, { lastmod: p.createdAt, priority: "0.6", changefreq: "monthly" }));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...accountUrls, ...blogUrls].join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (err) {
    req.log.error({ err }, "Failed to generate sitemap");
    res.status(500).send("Internal server error");
  }
});

export default router;