import { Router, type Request, type Response } from "express";
import { db, accountsTable } from "@workspace/db";
import { desc, eq, and } from "drizzle-orm";
import { SITE_NAME, SITE_URL, escapeHtml, pageShell, breadcrumbJsonLd, breadcrumbHtml } from "../lib/pageshell";

const router = Router();

const WHATSAPP_NUMBER = process.env["WHATSAPP_NUMBER"] || "";

const GAME_LABEL: Record<string, string> = {
  "clash-of-clans": "كلاش أوف كلانس",
  "clash-royale": "كلاش رويال",
};

const STATUS_LABEL: Record<string, string> = {
  available: "متاح",
  reserved: "محجوز",
  sold: "تم البيع",
};

function formatPrice(value: string): string {
  return Number(value).toLocaleString("ar-SA");
}

function whatsappLink(title: string, whatsappMessage: string | null): string {
  const message = `أريد شراء حساب ${whatsappMessage || title}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

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

function accountCardHtml(a: typeof accountsTable.$inferSelect): string {
  const rawImage = a.images?.[0] || "";
  const image = formatCloudinaryUrl(rawImage);
  return `<a class="card" href="/account/${escapeHtml(a.slug)}">
    ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(a.title)}" loading="lazy" />` : ""}
    <div class="card-body">
      <div class="card-title">${escapeHtml(a.title)}</div>
      <div class="card-price">${formatPrice(a.price)} ر.س</div>
    </div>
  </a>`;
}



// GET /account/:slug — server-rendered account detail page, fully readable with no JS required
router.get("/account/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [account] = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.slug, slug))
      .limit(1);

    if (!account) {
      res.status(404).send(
        pageShell({
          title: `الحساب غير موجود - ${SITE_NAME}`,
          description: "لم يتم العثور على هذا الحساب في كلاش ماركت.",
          canonicalPath: `/account/${slug}`,
          bodyHtml: `<h1>لم يتم العثور على الحساب</h1><a class="back-link" href="/">العودة للرئيسية</a>`,
          noindex: true,
        }),
      );
      return;
    }

    const related = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.game, account.game), eq(accountsTable.status, "available")))
      .orderBy(desc(accountsTable.createdAt))
      .limit(5);
    const relatedFiltered = related.filter((r) => r.slug !== slug).slice(0, 4);

    const gameLabel = GAME_LABEL[account.game] || account.game;
    const isCoc = account.game === "clash-of-clans";
    const statusLabel = STATUS_LABEL[account.status] || account.status;

    const specs: Array<[string, string | number | null]> = [
      ["مستوى القرية (TH)", account.townHall],
      ["الساحة", account.arena],
      ["مستوى الحساب", account.league],
      ["الكؤوس", account.trophies],
      ["الأبطال", account.heroes],
      ["الجواهر", account.gems],
      ["السكنات", account.skins],
      ["التطويرات", account.evolutions],
      ["الإيموتات", account.emotes],
      ["أقصى مستوى كروت", account.maxCards],
    ];
    const specsHtml = specs
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(
        ([label, value]) =>
          `<div><span class="spec-label">${escapeHtml(label)}</span><span class="spec-value">${escapeHtml(String(value))}</span></div>`,
      )
      .join("\n");

    const formattedImages = (account.images || []).map(formatCloudinaryUrl);

    const galleryHtml = formattedImages
      .map((img) => `<img src="${escapeHtml(img)}" alt="${escapeHtml(account.title)}" loading="lazy" />`)
      .join("\n");

    const description = account.description
      ? `شراء ${account.title} بسعر ${formatPrice(account.price)} ر.س من متجر كلاش ماركت. ${account.description.slice(0, 70)}... تسليم فوري وضمان شامل.`
      : `شراء ${account.title} بسعر ${formatPrice(account.price)} ر.س من متجر كلاش ماركت في السعودية والخليج مع تسليم فوري وضمان شامل.`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: account.title,
      description,
      image: formattedImages.length > 0 ? formattedImages : [`${SITE_URL}/thumbnail.png`],
      brand: {
        "@type": "Brand",
        name: "Supercell",
      },
      category: gameLabel,
      offers: {
        "@type": "Offer",
        price: account.price,
        priceCurrency: "SAR",
        priceValidUntil: "2026-12-31",
        itemCondition: "https://schema.org/UsedCondition",
        availability:
          account.status === "available"
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: SITE_URL ? `${SITE_URL}/account/${account.slug}` : `/account/${account.slug}`,
        seller: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL || "https://www.clashmarket.online",
        },
      },
    };

    const breadcrumbItems = [
      { name: SITE_NAME, path: "/" },
      { name: gameLabel, path: `/${account.game}` },
    ];

    if (account.game === "clash-of-clans" && account.townHall && ["16", "17", "18"].includes(String(account.townHall).trim())) {
      breadcrumbItems.push({
        name: `تاون هول ${account.townHall}`,
        path: `/clash-of-clans/town-hall-${account.townHall}`,
      });
    }

    breadcrumbItems.push({ name: account.title, path: `/account/${account.slug}` });

    const relatedHtml = relatedFiltered.length
      ? `<section style="margin-top:48px; padding-top:32px; border-top:1px solid #334155;">
          <h2 style="font-size:1.4rem; font-weight:700; margin-bottom:16px;">حسابات ${escapeHtml(gameLabel)} مشابهة قد تهمك</h2>
          <div class="grid-list">${relatedFiltered.map(accountCardHtml).join("\n")}</div>
        </section>`
      : "";

    const bodyHtml = `
      ${breadcrumbHtml(breadcrumbItems)}
      <a class="back-link" href="/${account.game === "clash-of-clans" ? "clash-of-clans" : "clash-royale"}" style="margin-top:0; margin-bottom:16px;">→ رجوع لكل حسابات ${escapeHtml(gameLabel)}</a>
      <div>
        <span class="badge ${account.game === "clash-of-clans" ? "coc" : "royale"}">${escapeHtml(gameLabel)}</span>
      </div>
      <h1>${escapeHtml(account.title)}</h1>
      <div class="meta" style="margin-bottom: 16px;">
        الحالة: <span class="status ${escapeHtml(account.status)}" style="color: ${account.status === 'available' ? '#10b981' : '#f59e0b'}; font-weight: 700;">${escapeHtml(statusLabel)}</span> | متجر موثوق | تسليم فوري في السعودية ودول الخليج
      </div>
      ${account.images?.length ? `<div class="gallery">${galleryHtml}</div>` : ""}
      <div class="price-row">
        <span class="price">${formatPrice(account.price)} ر.س</span>
        ${account.oldPrice ? `<span class="old-price">${formatPrice(account.oldPrice)} ر.س</span>` : ""}
      </div>
      <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 10px 14px; margin: 12px 0 18px 0; color: #fcd34d; font-size: 0.92rem; font-weight: 600;">
        🛡️ فحص يدوي للحساب + تسليم الإيميل الأساسي + ضمان كامل ضد السحب
      </div>
      ${specsHtml ? `<div class="specs">${specsHtml}</div>` : ""}
      ${account.description ? `<div class="content" style="margin-bottom:24px; color: #cbd5e1; line-height: 1.9;">${escapeHtml(account.description)}</div>` : ""}
      
      <a class="cta" href="${escapeHtml(whatsappLink(account.title, account.whatsappMessage))}" target="_blank" rel="noopener noreferrer">شراء الآن عبر الواتساب (تسليم يدوي وفوري مباشر)</a>
      <div style="text-align: center; margin-top: 10px; font-size: 0.85rem;">
        <a href="/guarantee" style="color: #94a3b8; text-decoration: underline;">🛡️ مشمول بالضمان الذهبي وحماية المشتري (اضغط للتفاصيل)</a>
      </div>

      <section style="margin: 36px 0; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
        <h2 style="font-size: 1.25rem; color: #f59e0b; margin-top: 0; margin-bottom: 12px;">🛡️ ضمان وأمان شراء الحسابات مع ${escapeHtml(SITE_NAME)}</h2>
        <ul style="color: #cbd5e1; padding-right: 20px; line-height: 2; margin: 0;">
          <li><strong>فحص يدوي شامل:</strong> فحص دقيق للقرية وتأكيد سلامة البريد الأساسي وسوبر سيل آيدي بالكامل قبل التسليم.</li>
          <li><strong>تسليم يدوي مباشر:</strong> يتم التواصل معك فوراً عبر الواتساب وتأمين القرية على جهازك خطوة بخطوة.</li>
          <li><strong>طرق دفع متعددة:</strong> تحويل بنكي مباشر لحسابات سعودية وخليجية، مع إمكانية الدفع والتقسيط عبر تابي وتمارا بالاتفاق المباشر عبر الواتساب.</li>
          <li><strong>الضمان الذهبي:</strong> حماية كاملة للمشتري وضمان عدم الاسترجاع مدى الحياة. <a href="/guarantee" style="color:#f59e0b; text-decoration:underline;">تعرف على سياسة الضمان</a></li>
        </ul>
      </section>

      ${relatedHtml}
    `;

    const pageTitle = account.title.includes("متجر كلاش")
      ? account.title
      : `${account.title} | متجر كلاش ماركت`;

    const html = pageShell({
      title: pageTitle,
      description,
      canonicalPath: `/account/${account.slug}`,
      ogImage: formattedImages[0] || null,
      bodyHtml,
      jsonLd: [jsonLd, breadcrumbJsonLd(breadcrumbItems)],
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render account detail page");
    res.status(500).send("Internal server error");
  }
});

export default router;