// Fallback يحمي من أن يصبح SITE_URL فارغًا لو متغيّر البيئة FRONTEND_URL
// غير مضبوط في الإنتاج — لأن SITE_URL فارغ يعني أن og:image/canonical/og:url
// ستصبح روابط نسبية، وهو ما يمنع WhatsApp/Facebook من عرض صورة المعاينة
// (تظهر بطاقة فيها عنوان ورابط بدون صورة). الدومين الافتراضي هنا مطابق
// للدومين المكتوب في artifacts/worker/index.ts (FRONTEND_ORIGIN).
const FALLBACK_SITE_URL = "https://www.clashmarket.online";
export const SITE_NAME = "كلاش ماركت";
export const SITE_URL = (process.env["FRONTEND_URL"] || FALLBACK_SITE_URL).replace(/\/$/, "");

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
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

export function breadcrumbHtml(
  items: { name: string; path: string }[]
): string {
  return `<nav class="breadcrumbs" aria-label="breadcrumb">
    ${items
      .map((item, i) =>
        i === items.length - 1
          ? `<span>${escapeHtml(item.name)}</span>`
          : `<a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a>`
      )
      .join(' <span class="sep">/</span> ')}
  </nav>`;
}

export function pageShell(opts: {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string | null;
  bodyHtml: string;
  jsonLd?: object | object[];
  /** استخدم noindex للصفحات غير المخصصة للفهرسة (مثل صفحات 404) */
  noindex?: boolean;
  ogType?: string;
}) {
  const canonicalUrl = SITE_URL
    ? `${SITE_URL}${opts.canonicalPath}`
    : opts.canonicalPath;

  // لو لم يتم تمرير صورة (أو كانت رابطًا نسبيًا)، استخدم صورة الموقع الافتراضية المطلقة
  // ملاحظة: WhatsApp/Facebook crawlers لا تنفذ JavaScript ولا تقبل روابط نسبية لـ og:image
  const resolvedOgImage =
    opts.ogImage && /^https?:\/\//i.test(opts.ogImage)
      ? opts.ogImage
      : `${SITE_URL}/opengraph.png`;
  const ogImage = resolvedOgImage;

  const jsonLdArray = opts.jsonLd
    ? Array.isArray(opts.jsonLd)
      ? opts.jsonLd
      : [opts.jsonLd]
    : [];
  const jsonLd = jsonLdArray
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join("\n  ");

  const ogType = opts.ogType === "article" ? "article" : "website";
  const robotsContent = opts.noindex ? "noindex, follow" : "index, follow";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="application-name" content="${escapeHtml(SITE_NAME)}" />
  <meta name="apple-mobile-web-app-title" content="${escapeHtml(SITE_NAME)}" />

  <!-- Google PageMap (داخل تعليق مخصص لمحركات البحث) -->
  <!--
  <PageMap>
    <DataObject type="thumbnail">
      <Attribute name="src" value="${escapeHtml(ogImage)}" />
      <Attribute name="width" value="1200" />
      <Attribute name="height" value="630" />
    </DataObject>
  </PageMap>
  -->
  
  <link rel="icon" href="${escapeHtml(`${SITE_URL}/favicon.ico`)}" type="image/x-icon" />
  <link rel="shortcut icon" href="${escapeHtml(`${SITE_URL}/favicon.ico`)}" type="image/x-icon" />
  <link rel="apple-touch-icon" href="${escapeHtml(`${SITE_URL}/opengraph.png`)}" />

  <title>${escapeHtml(opts.title)}</title>
  <meta name="description" content="${escapeHtml(opts.description)}" />
  <meta name="robots" content="${robotsContent}" />

  <!-- Canonical -->
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:title" content="${escapeHtml(opts.title)}" />
  <meta property="og:description" content="${escapeHtml(opts.description)}" />
  <meta property="og:type" content="${escapeHtml(ogType)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
  <meta property="og:locale" content="ar_SA" />
  <meta property="og:locale:alternate" content="ar_AE" />
  <meta property="og:locale:alternate" content="ar_KW" />
  <meta property="og:locale:alternate" content="ar_QA" />
  <meta property="og:locale:alternate" content="ar_BH" />
  <meta property="og:locale:alternate" content="ar_OM" />
  <meta property="og:locale:alternate" content="ar_EG" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(opts.title)}" />
  <meta name="twitter:description" content="${escapeHtml(opts.description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />

  <!-- Google Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />

  ${jsonLd}

  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Tajawal', sans-serif;
      background: #0f172a;
      color: #f8fafc;
      line-height: 1.8;
      direction: rtl;
    }
    a { color: #f59e0b; text-decoration: none; }
    a:hover { text-decoration: underline; }
    header {
      background: #1e293b;
      border-bottom: 1px solid #334155;
      padding: 16px 24px;
    }
    .header-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      font-weight: 900;
      font-size: 1.4rem;
      color: #f59e0b;
    }
    nav.main-nav {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    nav.main-nav a {
      color: #cbd5e1;
      font-weight: 600;
      font-size: 0.95rem;
    }
    nav.main-nav a:hover {
      color: #f59e0b;
    }
    main.container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 20px 80px;
    }
    h1 { font-size: 2rem; font-weight: 800; margin-bottom: 16px; color: #f8fafc; }
    h2 { font-size: 1.5rem; font-weight: 700; margin-top: 36px; margin-bottom: 16px; color: #f8fafc; }
    p { color: #94a3b8; font-size: 1.05rem; }
    .breadcrumbs { font-size: 0.9rem; color: #64748b; margin-bottom: 20px; }
    .breadcrumbs a { color: #94a3b8; }
    .breadcrumbs a:hover { color: #f59e0b; }
    .breadcrumbs .sep { margin: 0 8px; color: #475569; }
    .breadcrumbs span { color: #f1f5f9; font-weight: 600; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 12px;
      color: #fff;
    }
    .badge.coc { background: #2563eb; }
    .badge.royale { background: #dc2626; }
    .grid-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
      margin: 24px 0;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      overflow: hidden;
      display: block;
      transition: border-color 0.2s, transform 0.2s;
    }
    .card:hover {
      border-color: #f59e0b;
      transform: translateY(-2px);
      text-decoration: none;
    }
    .card img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      display: block;
      background: #0f172a;
    }
    .card-body {
      padding: 16px;
    }
    .card-title {
      font-weight: 700;
      font-size: 1.1rem;
      color: #f8fafc;
      margin-bottom: 8px;
    }
    .card-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: #f59e0b;
    }
    .price-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 20px 0;
    }
    .price { font-size: 2rem; font-weight: 800; color: #f59e0b; }
    .old-price { font-size: 1.3rem; color: #64748b; text-decoration: line-through; }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .gallery img {
      width: 100%;
      height: auto;
      border-radius: 8px;
      border: 1px solid #334155;
    }
    .specs {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .spec-label { display: block; font-size: 0.85rem; color: #94a3b8; }
    .spec-value { display: block; font-size: 1.1rem; font-weight: 700; color: #f8fafc; }
    .cta {
      display: inline-block;
      background: #f59e0b;
      color: #0f172a;
      font-weight: 800;
      padding: 14px 28px;
      border-radius: 8px;
      font-size: 1.1rem;
      text-align: center;
      margin-top: 16px;
    }
    .cta:hover {
      background: #d97706;
      text-decoration: none;
    }
    .post-list { list-style: none; padding: 0; margin: 0; }
    .post-list li {
      border-bottom: 1px solid #334155;
      padding: 16px 0;
    }
    .post-title { font-size: 1.2rem; font-weight: 700; color: #f8fafc; }
    .post-title:hover { color: #f59e0b; }
    .meta { color: #64748b; font-size: 0.85rem; margin-top: 4px; }
    .back-link { display: inline-block; margin-top: 24px; color: #f59e0b; font-weight: 600; }
    footer {
      background: #0b1120;
      border-top: 1px solid #1e293b;
      color: #64748b;
      font-size: 0.9rem;
      padding: 32px 20px;
      text-align: center;
    }
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .footer-links a { color: #94a3b8; }
    .footer-links a:hover { color: #f59e0b; }
  </style>
</head>

<body>
  <header>
    <div class="header-inner">
      <a class="brand" href="/">${escapeHtml(SITE_NAME)}</a>
      <nav class="main-nav">
        <a href="/clash-of-clans">كلاش أوف كلانس</a>
        <a href="/clash-royale">كلاش رويال</a>
        <a href="/blog">المدونة</a>
      </nav>
    </div>
  </header>
  <main class="container">
    ${opts.bodyHtml}
  </main>
  <footer>
    <div class="footer-links">
      <a href="/">الرئيسية</a>
      <a href="/clash-of-clans">حسابات كلاش أوف كلانس</a>
      <a href="/clash-royale">حسابات كلاش رويال</a>
      <a href="/blog">مدونة كلاش ماركت</a>
    </div>
    <div>© ${new Date().getFullYear()} ${escapeHtml(SITE_NAME)} — المنصة الموثوقة لبيع وشراء حسابات سوبر سيل في السعودية والخليج العربي</div>
  </footer>
</body>
</html>`;
}