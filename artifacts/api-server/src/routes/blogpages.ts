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
        <p style="margin-bottom: 24px; color: #cbd5e1; line-height: 1.8;">${description} تصفح الشروحات الحصرية أدناه، أو انتقل مباشرة إلى <strong><a href="/clash-of-clans" style="color: #f59e0b; font-weight: 700;">متجر كلاش اوف كلانس</a></strong> لاستعراض أقوى قريات تاون هول 15 إلى 18 ماكس مع تسليم فوري وضمان ذهبي.</p>
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

      <!-- تنويه واستدعاء سيو داخلي يربط المقالات بمتجر كلاش اوف كلانس مباشرة -->
      <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid #3b82f6; border-radius: 12px; padding: 18px 20px; margin: 24px 0;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="font-size:1.4rem;">🏰</span>
          <strong style="color:#f8fafc; font-size:1.05rem;">تنويه من متجر كلاش ماركت:</strong>
        </div>
        <p style="color:#cbd5e1; font-size:0.95rem; margin:0 0 12px; line-height:1.7;">
          هل تبحث عن قرية كلاش جاهزة بمواصفات ماكس دون عناء سنوات التطوير؟ تفضل بزيارة <strong><a href="/clash-of-clans" style="color:#60a5fa; text-decoration:underline; font-weight:700;">متجر كلاش اوف كلانس</a></strong> لاقتناء أقوى حسابات تاون هول 15 إلى 18 ماكس مع تسليم فوري بالواتساب وضمان ذهبي شامل مدى الحياة.
        </p>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a href="/clash-of-clans" class="cta" style="font-size:0.85rem; padding:6px 14px;">دخول متجر كلاش اوف كلانس ←</a>
          <a href="/clash-of-clans/town-hall-18" style="color:#94a3b8; font-size:0.85rem; text-decoration:underline; align-self:center;">قريات تاون 18 ماكس</a>
          <a href="/clash-of-clans/town-hall-17" style="color:#94a3b8; font-size:0.85rem; text-decoration:underline; align-self:center;">قريات تاون 17</a>
        </div>
      </div>

      <article class="content" style="color: #e2e8f0; line-height: 2; font-size: 1.1rem;">
        ${post.content.replace(/<h1(\s+[^>]*)?>([\s\S]*?)<\/h1>/gi, "<h2$1>$2</h2>")}
      </article>
      ${relatedHtml}
      <div style="margin-top: 48px; padding: 24px; background: #1e293b; border-radius: 12px; border: 1px solid #334155; text-align: center;">
        <h3 style="color: #f8fafc; margin-bottom: 8px; font-size: 1.25rem;">تسوّق الآن بأمان من متجر كلاش ماركت</h3>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 16px;">قريات كلاش أوف كلانس وحسابات كلاش رويال مفحوصة ومضمونة مع تسليم يدوي فوري بالواتساب.</p>
        <a class="cta" href="/clash-of-clans" style="margin-left: 12px; font-weight:700;">زيارة متجر كلاش اوف كلانس (قريات ماكس) ←</a>
        <a class="cta" href="/clash-royale" style="background: #2563eb; color: #fff;">متجر كلاش رويال ←</a>
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