import { Router } from "express";
import { db, accountsTable, blogTable } from "@workspace/db";
import { ne } from "drizzle-orm";

const router = Router();

// نفس fallback المستخدم في lib/pageshell.ts — يمنع أن يصبح sitemap.xml فيه
// روابط نسبية لو FRONTEND_URL غير مضبوط في بيئة الإنتاج
const SITE_URL = (process.env["FRONTEND_URL"] || "https://www.clashmarket.online").replace(/\/$/, "");

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(
  path: string,
  opts: {
    lastmod?: Date;
    priority?: string;
    changefreq?: string;
    imageUrl?: string | null;
    imageTitle?: string;
  } = {},
) {
  const { lastmod, priority = "0.7", changefreq = "weekly", imageUrl, imageTitle } = opts;
  const imageXml = imageUrl
    ? `\n    <image:image>
      <image:loc>${escapeXml(imageUrl.startsWith("http") ? imageUrl : `${SITE_URL}${imageUrl}`)}</image:loc>
      ${imageTitle ? `<image:title>${escapeXml(imageTitle)}</image:title>` : ""}
    </image:image>`
    : "";

  return `  <url>
    <loc>${escapeXml(SITE_URL + path)}</loc>
    ${lastmod ? `<lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageXml}
  </url>`;
}

// GET /robots.txt — served dynamically because the Cloudflare Worker in
// artifacts/worker always proxies "/robots.txt" and "/sitemap.xml" to this
// VPS (see artifacts/worker/index.ts), so a static file in the frontend's
// public/ folder is never actually reached in production. Without this
// route, bots requesting /robots.txt hit the 404 handler in app.ts instead.
router.get("/robots.txt", (req, res) => {
  const sitemapUrl = SITE_URL ? `${SITE_URL}/sitemap.xml` : "/sitemap.xml";
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/accounts",
    "Disallow: /admin/blog",
    "Disallow: /login",
    "",
    `Sitemap: ${sitemapUrl}`,
    "",
  ].join("\n");

  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(body);
});

router.get("/sitemap.xml", async (req, res) => {
  try {
    const [accounts, posts] = await Promise.all([
      db
        .select({
          slug: accountsTable.slug,
          title: accountsTable.title,
          images: accountsTable.images,
          createdAt: accountsTable.createdAt,
          status: accountsTable.status,
        })
        .from(accountsTable)
        .where(ne(accountsTable.status, "sold")),
      db
        .select({
          slug: blogTable.slug,
          title: blogTable.title,
          coverImage: blogTable.coverImage,
          createdAt: blogTable.createdAt,
        })
        .from(blogTable),
    ]);

    const staticUrls = [
      urlEntry("/", {
        priority: "1.0",
        changefreq: "daily",
        imageUrl: `${SITE_URL}/thumbnail.png`,
        imageTitle: "كلاش ماركت | بيع وشراء حسابات كلاش أوف كلانس وكلاش رويال",
      }),
      urlEntry("/clash-of-clans", {
        priority: "0.9",
        changefreq: "daily",
        imageUrl: `${SITE_URL}/thumbnail.png`,
        imageTitle: "حسابات كلاش أوف كلانس للبيع",
      }),
      urlEntry("/clash-royale", {
        priority: "0.9",
        changefreq: "daily",
        imageUrl: `${SITE_URL}/thumbnail.png`,
        imageTitle: "حسابات كلاش رويال للبيع",
      }),
      urlEntry("/blog", {
        priority: "0.8",
        changefreq: "weekly",
        imageUrl: `${SITE_URL}/thumbnail.png`,
        imageTitle: "مدونة كلاش ماركت",
      }),
    ];

function formatCloudinaryUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    let formatted = url.replace(/\.(heic|heif)$/i, ".jpg");
    if (!formatted.includes("/f_auto") && !formatted.includes("/q_auto")) {
      formatted = formatted.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return formatted;
  }
  return url;
}

    const accountUrls = accounts.map((a) =>
      urlEntry(`/account/${a.slug}`, {
        lastmod: a.createdAt,
        priority: a.status === "reserved" ? "0.7" : "0.8",
        changefreq: "daily",
        imageUrl: a.images && a.images.length > 0 ? formatCloudinaryUrl(a.images[0]) : `${SITE_URL}/thumbnail.png`,
        imageTitle: a.title,
      }),
    );

    const blogUrls = posts.map((p) =>
      urlEntry(`/blog/${p.slug}`, {
        lastmod: p.createdAt,
        priority: "0.6",
        changefreq: "monthly",
        imageUrl: p.coverImage ? formatCloudinaryUrl(p.coverImage) : `${SITE_URL}/thumbnail.png`,
        imageTitle: p.title,
      }),
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
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