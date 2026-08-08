// Fallback يحمي من أن يصبح SITE_URL فارغًا لو متغيّر البيئة FRONTEND_URL
// غير مضبوط في الإنتاج — لأن SITE_URL فارغ يعني أن og:image/canonical/og:url
// ستصبح روابط نسبية، وهو ما يمنع WhatsApp/Facebook من عرض صورة المعاينة
// (تظهر بطاقة فيها عنوان ورابط بدون صورة). الدومين الافتراضي هنا مطابق
// للدومين المكتوب في artifacts/worker/index.ts (FRONTEND_ORIGIN).
const FALLBACK_SITE_URL = "https://clashmarket.online";
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

  const robotsContent = opts.noindex ? "noindex, follow" : "index, follow";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta
      property="og:image"
      content="https://clashmarket.online/favicon.ico"
    />
  <link rel="rel" href="https://clashmarket.online/favicon.ico" />
<link rel="shortcut icon" href="https://clashmarket.online/favicon.ico" type="image/x-icon" />
<link rel="icon" href="https://clashmarket.online/favicon.ico" type="image/x-icon" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${escapeHtml(opts.title)}</title>

  <meta
    name="description"
    content="${escapeHtml(opts.description)}"
  />

  <meta name="robots" content="${robotsContent}" />

  <!-- Canonical -->
  <link
    rel="canonical"
    href="${escapeHtml(canonicalUrl)}"
  />

  <!-- Open Graph -->
  <meta
    property="og:title"
    content="${escapeHtml(opts.title)}"
  />

  <meta
    property="og:description"
    content="${escapeHtml(opts.description)}"
  />

  <meta
    property="og:type"
    content="${escapeHtml(opts.ogType || "website")}"
  />

  <meta
    property="og:url"
    content="${escapeHtml(canonicalUrl)}"
  />

  <meta
    property="og:image"
    content="${escapeHtml(ogImage)}"
  />

  <meta
    property="og:image:width"
    content="1200"
  />

  <meta
    property="og:image:height"
    content="630"
  />

  <meta
    property="og:site_name"
    content="${escapeHtml(SITE_NAME)}"
  />

  <meta
    property="og:locale"
    content="ar_AR"
  />

  <!-- Twitter -->
  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="${escapeHtml(opts.title)}"
  />

  <meta
    name="twitter:description"
    content="${escapeHtml(opts.description)}"
  />

  <meta
    name="twitter:image"
    content="${escapeHtml(ogImage)}"
  />

  ${jsonLd}

  <style>
    /* CSS بتاعك هنا */
  </style>
</head>

<body>
  <main class="container">
    ${opts.bodyHtml}
  </main>
</body>
</html>`;
}