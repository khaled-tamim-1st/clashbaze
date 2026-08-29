import { Router } from "express";
import { db, blogTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import {
  SITE_NAME,
  SITE_URL,
  escapeHtml,
  stripHtml,
  breadcrumbJsonLd,
  breadcrumbHtml,
  pageShell,
} from "../lib/pageshell";

const router = Router();

// GET /blog — server-rendered list of blog posts
router.get("/blog", async (req, res) => {
  try {
    const rows = await db.select().from(blogTable).orderBy(desc(blogTable.createdAt)).limit(50);

    const listHtml = rows.length
      ? rows
          .map(
            (p) => `<li>
              <a class="post-title" href="/blog/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>
              <div class="meta">${new Date(p.createdAt).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </li>`,
          )
          .join("\n")
      : `<p style="color: #94a3b8;">لا توجد مقالات منشورة حالياً.</p>`;

    const breadcrumbItems = [
      { name: SITE_NAME, path: "/" },
      { name: "المدونة", path: "/blog" },
    ];

    const title = `مدونة ${SITE_NAME} | أحدث استراتيجيات وشروحات كلاش أوف كلانس وكلاش رويال`;
    const description = `دليلك الشامل ونصائح احترافية حول بيع وشراء حسابات وتصاميم قرى كلاش أوف كلانس وأقوى تشكيلات كلاش رويال في السعودية والخليج.`;

    const html = pageShell({
      title,
      description,
      canonicalPath: "/blog",
      bodyHtml: `
        ${breadcrumbHtml(breadcrumbItems)}
        <h1>مدونة ${escapeHtml(SITE_NAME)}</h1>
        <p style="margin-bottom: 32px; color: #94a3b8;">${description}</p>
        <ul class="post-list">${listHtml}</ul>
      `,
      jsonLd: [breadcrumbJsonLd(breadcrumbItems)],
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
          description: "لم يتم العثور على هذا المقال في مدونة كلاش ماركت.",
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
      inLanguage: "ar-SA",
      image:
        post.coverImage && /^https?:\/\//i.test(post.coverImage)
          ? [post.coverImage]
          : [`${SITE_URL}/opengraph.png`],
      datePublished: post.createdAt.toISOString(),
      dateModified: post.createdAt.toISOString(),
      author: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL || "https://www.clashmarket.online",
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL || "https://www.clashmarket.online",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/opengraph.png`,
        },
      },
      mainEntityOfPage: SITE_URL ? `${SITE_URL}/blog/${post.slug}` : `/blog/${post.slug}`,
    };

    const relatedPosts = await db
      .select({
        slug: blogTable.slug,
        title: blogTable.title,
      })
      .from(blogTable)
      .orderBy(desc(blogTable.createdAt))
      .limit(4);

    const relatedFiltered = relatedPosts.filter((p) => p.slug !== slug).slice(0, 3);
    const relatedHtml = relatedFiltered.length
      ? `<div style="margin-top: 40px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px;">
          <h3 style="color: #f59e0b; margin-bottom: 12px; font-size: 1.15rem;">مقالات أخرى قد تهمك:</h3>
          <ul style="padding-right: 20px; line-height: 2; margin: 0;">
            ${relatedFiltered.map((r) => `<li><a href="/blog/${escapeHtml(r.slug)}" style="color: #60a5fa; font-weight: 500;">${escapeHtml(r.title)}</a></li>`).join("")}
          </ul>
        </div>`
      : "";

    const bodyHtml = `
      ${breadcrumbHtml(breadcrumbItems)}
      <a class="back-link" href="/blog" style="margin-top:0; margin-bottom:16px;">→ رجوع للمدونة</a>
      ${post.coverImage ? `<div style="margin: 20px 0;"><img src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.title)}" style="width:100%; max-height:450px; object-fit:cover; border-radius:12px; border: 1px solid #334155;" /></div>` : ""}
      <h1>${escapeHtml(post.title)}</h1>
      <div class="meta" style="margin-bottom: 24px; color: #94a3b8;">
        نُشر بتاريخ: ${new Date(post.createdAt).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' })} | بواسطة فريق ${escapeHtml(SITE_NAME)}
      </div>
      <article class="content" style="color: #e2e8f0; line-height: 2; font-size: 1.1rem;">
        ${post.content}
      </article>
      ${relatedHtml}
      <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #334155;">
        <a class="cta" href="/clash-of-clans" style="margin-left: 12px;">تصفح حسابات كلاش أوف كلانس</a>
        <a class="cta" href="/clash-royale" style="background: #2563eb; color: #fff;">تصفح حسابات كلاش رويال</a>
      </div>
      <p><a class="back-link" href="/blog">← العودة إلى قائمة مقالات المدونة</a></p>
    `;

    const resolvedTitle = (post.seoTitle || post.title).includes(SITE_NAME)
      ? (post.seoTitle || post.title)
      : `${post.seoTitle || post.title} | ${SITE_NAME}`;

    const html = pageShell({
      title: resolvedTitle,
      description,
      canonicalPath: `/blog/${post.slug}`,
      ogImage: post.coverImage,
      ogType: "article",
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