import { Router } from "express";
import { db, blogTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router = Router();

const SITE_NAME = "كلاش ماركت";
// نفس fallback المستخدم في lib/pageshell.ts — يمنع أن تصبح og:image/canonical
// روابط نسبية لو FRONTEND_URL غير مضبوط في بيئة الإنتاج
const SITE_URL = process.env["FRONTEND_URL"] || "https://www.clashmarket.online";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: SITE_URL ? `${SITE_URL}${item.path}` : item.path,
    })),
  };
}

function breadcrumbHtml(items: { name: string; path: string }[]): string {
  return `<nav class="breadcrumbs" aria-label="breadcrumb">${items
    .map((item, i) =>
      i === items.length - 1
        ? `<span aria-current="page">${escapeHtml(item.name)}</span>`
        : `<a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a>`,
    )
    .join(' <span class="sep">/</span> ')}</nav>`;
}

function pageShell(opts: { title: string; description: string; canonicalPath: string; ogImage?: string | null; bodyHtml: string; jsonLd?: object | object[]; noindex?: boolean }) {
  const canonicalUrl = SITE_URL ? `${SITE_URL}${opts.canonicalPath}` : opts.canonicalPath;
  // لو لم يتم تمرير صورة (أو كانت رابطًا نسبيًا)، استخدم صورة الموقع الافتراضية المطلقة
  // ملاحظة: WhatsApp/Facebook crawlers لا تنفذ JavaScript ولا تقبل روابط نسبية لـ og:image
  const ogImage =
    opts.ogImage && /^https?:\/\//i.test(opts.ogImage)
      ? opts.ogImage
      : `${SITE_URL}/opengraph.png`;
  const robotsContent = opts.noindex ? "noindex, follow" : "index, follow";
  const jsonLdArray = opts.jsonLd ? (Array.isArray(opts.jsonLd) ? opts.jsonLd : [opts.jsonLd]) : [];
  const jsonLdHtml = jsonLdArray
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join("\n  ");
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="application-name" content="${escapeHtml(SITE_NAME)}" />
  <meta name="apple-mobile-web-app-title" content="${escapeHtml(SITE_NAME)}" />
  <link rel="icon" href="${escapeHtml(`${SITE_URL}/favicon.ico`)}" type="image/x-icon" />
  <link rel="shortcut icon" href="${escapeHtml(`${SITE_URL}/favicon.ico`)}" type="image/x-icon" />
  <link rel="apple-touch-icon" href="${escapeHtml(`${SITE_URL}/favicon.ico`)}" />
  <title>${escapeHtml(opts.title)}</title>
  <meta name="description" content="${escapeHtml(opts.description)}" />
  <meta name="robots" content="${robotsContent}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(opts.title)}" />
  <meta property="og:description" content="${escapeHtml(opts.description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
  <meta property="og:locale" content="ar_AR" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(opts.title)}" />
  <meta name="twitter:description" content="${escapeHtml(opts.description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
  ${jsonLdHtml}
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Tajawal', sans-serif;
      background: #fbfaff;
      color: #241d3a;
      line-height: 1.8;
    }
    a { color: #3d2f8c; }
    header {
      background: #ffffff;
      border-bottom: 1px solid #e7e2f5;
      padding: 16px 24px;
    }
    header a.brand {
      font-weight: 800;
      font-size: 1.1rem;
      color: #3d2f8c;
      text-decoration: none;
    }
    main {
      max-width: 760px;
      margin: 0 auto;
      padding: 32px 20px 80px;
    }
    .cover {
      width: 100%;
      height: auto;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    h1 { font-size: 1.9rem; font-weight: 800; margin-bottom: 12px; }
    .meta { color: #6b6480; font-size: 0.9rem; margin-bottom: 24px; }
    .content { font-size: 1.05rem; }
    .content img { max-width: 100%; border-radius: 8px; }
    .content h2 { font-size: 1.4rem; font-weight: 700; margin-top: 32px; }
    .content h3 { font-size: 1.2rem; font-weight: 700; margin-top: 24px; }
    .back-link { display: inline-block; margin-top: 40px; font-weight: 500; }
    footer {
      text-align: center;
      color: #6b6480;
      font-size: 0.85rem;
      padding: 24px;
    }
    ul.post-list { list-style: none; padding: 0; margin: 0; }
    ul.post-list li {
      border-bottom: 1px solid #e7e2f5;
      padding: 20px 0;
    }
    ul.post-list a.post-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #241d3a;
      text-decoration: none;
    }
    ul.post-list a.post-title:hover { color: #3d2f8c; }
    .breadcrumbs { font-size: 0.9rem; color: #6b6480; margin-bottom: 16px; }
    .breadcrumbs a { color: #6b6480; text-decoration: none; }
    .breadcrumbs a:hover { color: #3d2f8c; text-decoration: underline; }
    .breadcrumbs .sep { margin: 0 6px; color: #c9c3e0; }
    .breadcrumbs span[aria-current="page"] { color: #241d3a; font-weight: 600; }
  </style>
</head>
<body>
  <header><a class="brand" href="/">${escapeHtml(SITE_NAME)}</a></header>
  <main>
    ${opts.bodyHtml}
  </main>
  <footer>© ${new Date().getFullYear()} ${escapeHtml(SITE_NAME)}</footer>
</body>
</html>`;
}

// GET /blog — server-rendered list of blog posts
router.get("/blog", async (req, res) => {
  try {
    const rows = await db.select().from(blogTable).orderBy(desc(blogTable.createdAt)).limit(50);

    const listHtml = rows
      .map(
        (p) => `<li>
          <a class="post-title" href="/blog/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>
          <div class="meta">${new Date(p.createdAt).toLocaleDateString("ar-EG")}</div>
        </li>`,
      )
      .join("\n");

    const html = pageShell({
      title: `مدونة ${SITE_NAME}`,
      description: `أحدث المقالات والنصائح حول حسابات كلاش أوف كلانس وكلاش رويال من ${SITE_NAME}.`,
      canonicalPath: "/blog",
      bodyHtml: `<h1>مدونة ${escapeHtml(SITE_NAME)}</h1><ul class="post-list">${listHtml}</ul>`,
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render blog index page");
    res.status(500).send("Internal server error");
  }
});

// GET /blog/:slug — server-rendered single article, fully readable with no JS required
router.get("/blog/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [post] = await db.select().from(blogTable).where(eq(blogTable.slug, slug)).limit(1);

    if (!post) {
      res.status(404).send(
        pageShell({
          title: `المقال غير موجود - ${SITE_NAME}`,
          description: "لم يتم العثور على هذا المقال.",
          canonicalPath: `/blog/${slug}`,
          bodyHtml: `<h1>لم يتم العثور على المقال</h1><a class="back-link" href="/blog">العودة إلى المدونة</a>`,
          noindex: true,
        }),
      );
      return;
    }

    const title = post.seoTitle || post.title;
    const description = post.seoDescription || stripHtml(post.content).slice(0, 160);

    const breadcrumbItems = [
      { name: SITE_NAME, path: "/" },
      { name: "المدونة", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ];

    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description,
      image:
        post.coverImage && /^https?:\/\//i.test(post.coverImage)
          ? post.coverImage
          : SITE_URL
            ? `${SITE_URL}/opengraph.png`
            : undefined,
      datePublished: post.createdAt.toISOString(),
      author: { "@type": "Organization", name: SITE_NAME },
      publisher: { "@type": "Organization", name: SITE_NAME },
      mainEntityOfPage: SITE_URL ? `${SITE_URL}/blog/${post.slug}` : `/blog/${post.slug}`,
    };

    const bodyHtml = `
      ${breadcrumbHtml(breadcrumbItems)}
      <a class="back-link" href="/blog" style="margin-top:0; margin-bottom:16px;">→ رجوع للمدونة</a>
      ${post.coverImage ? `<img class="cover" src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.title)}" />` : ""}
      <h1>${escapeHtml(post.title)}</h1>
      <div class="meta">${new Date(post.createdAt).toLocaleDateString("ar-EG")}</div>
      <div class="content">${post.content}</div>
      <a class="back-link" href="/blog">العودة إلى المدونة</a>
    `;

    const html = pageShell({
      title: `${title} - مدونة ${SITE_NAME}`,
      description,
      canonicalPath: `/blog/${post.slug}`,
      ogImage: post.coverImage,
      bodyHtml,
      jsonLd: [articleJsonLd, breadcrumbJsonLd(breadcrumbItems)],
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render blog post page");
    res.status(500).send("Internal server error");
  }
});

export default router;