export const SITE_NAME = "كلاش ماركت";
export const SITE_URL = (process.env["VITE_FRONTEND_URL"] || "").replace(/\/$/, "");

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
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

export function breadcrumbHtml(items: { name: string; path: string }[]): string {
  return `<nav class="breadcrumbs" aria-label="breadcrumb">${items
    .map((item, i) =>
      i === items.length - 1
        ? `<span aria-current="page">${escapeHtml(item.name)}</span>`
        : `<a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a>`,
    )
    .join(' <span class="sep">/</span> ')}</nav>`;
}

export function pageShell(opts: {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string | null;
  bodyHtml: string;
  jsonLd?: object;
}) {
  const canonicalUrl = SITE_URL ? `${SITE_URL}${opts.canonicalPath}` : opts.canonicalPath;
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(opts.title)}</title>
  <meta name="description" content="${escapeHtml(opts.description)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(opts.title)}" />
  <meta property="og:description" content="${escapeHtml(opts.description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
  ${opts.ogImage ? `<meta property="og:image" content="${escapeHtml(opts.ogImage)}" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
  ${opts.jsonLd ? `<script type="application/ld+json">${JSON.stringify(opts.jsonLd)}</script>` : ""}
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
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 20px 80px;
    }
    .cover { width: 100%; height: auto; border-radius: 12px; margin-bottom: 24px; }
    h1 { font-size: 1.9rem; font-weight: 800; margin-bottom: 12px; }
    .meta { color: #6b6480; font-size: 0.9rem; margin-bottom: 24px; }
    .content { font-size: 1.05rem; }
    .content img { max-width: 100%; border-radius: 8px; }
    .content h2 { font-size: 1.4rem; font-weight: 700; margin-top: 32px; }
    .content h3 { font-size: 1.2rem; font-weight: 700; margin-top: 24px; }
    .back-link { display: inline-block; margin-top: 40px; font-weight: 500; }
    footer { text-align: center; color: #6b6480; font-size: 0.85rem; padding: 24px; }
    ul.post-list { list-style: none; padding: 0; margin: 0; }
    ul.post-list li { border-bottom: 1px solid #e7e2f5; padding: 20px 0; }
    ul.post-list a.post-title { font-size: 1.2rem; font-weight: 700; color: #241d3a; text-decoration: none; }
    ul.post-list a.post-title:hover { color: #3d2f8c; }

    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 12px; }
    .badge.coc { background: #2563eb; }
    .badge.royale { background: #dc2626; }
    .price-row { display: flex; align-items: baseline; gap: 12px; margin: 16px 0 24px; }
    .price { font-size: 1.9rem; font-weight: 800; color: #3d2f8c; }
    .old-price { font-size: 1.1rem; color: #6b6480; text-decoration: line-through; }
    .status { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 700; margin-inline-start: 8px; }
    .status.available { background: #dcfce7; color: #166534; }
    .status.reserved { background: #fef3c7; color: #92400e; }
    .status.sold { background: #fee2e2; color: #991b1b; }
    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin-bottom: 24px; }
    .gallery img { width: 100%; height: 140px; object-fit: cover; border-radius: 10px; }
    .specs { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; background: #fff; border: 1px solid #e7e2f5; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .specs .spec-label { display: block; font-size: 0.85rem; color: #6b6480; }
    .specs .spec-value { font-weight: 700; font-size: 1.1rem; }
    .cta { display: inline-block; background: #22c55e; color: #fff !important; font-weight: 800; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 1.1rem; }
    .grid-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
    .card { display: block; text-decoration: none; color: inherit; background: #fff; border: 1px solid #e7e2f5; border-radius: 12px; overflow: hidden; }
    .card img { width: 100%; height: 160px; object-fit: cover; }
    .card .card-body { padding: 14px; }
    .card .card-title { font-weight: 700; font-size: 1.05rem; margin-bottom: 6px; }
    .card .card-price { color: #3d2f8c; font-weight: 800; }
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