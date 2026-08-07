export const SITE_NAME = "كلاش ماركت";
export const SITE_URL = (process.env["FRONTEND_URL"] || "").replace(/\/$/, "");

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
  jsonLd?: object;
}) {
  const canonicalUrl = SITE_URL
    ? `${SITE_URL}${opts.canonicalPath}`
    : opts.canonicalPath;

  // لو لم يتم تمرير صورة، استخدم صورة الموقع الافتراضية
  const ogImage = opts.ogImage || `${SITE_URL}/opengraph.jpg`;

  const jsonLd = opts.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(opts.jsonLd)}</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${escapeHtml(opts.title)}</title>

  <meta
    name="description"
    content="${escapeHtml(opts.description)}"
  />

  <meta name="robots" content="index, follow" />

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
    content="website"
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
    content="${SITE_NAME}"
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