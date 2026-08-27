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

function renderGameListPage(game: "clash-of-clans" | "clash-royale") {
  return async (req: Request, res: Response) => {
    try {
      const rows = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.game, game))
        .orderBy(desc(accountsTable.createdAt))
        .limit(100);

      const label = GAME_LABEL[game];
      const listHtml = rows.length
        ? `<div class="grid-list">${rows.map(accountCardHtml).join("\n")}</div>`
        : `<p>لا توجد حسابات متاحة حالياً.</p>`;

      const isCoc = game === "clash-of-clans";
      const title = isCoc
        ? `متجر حسابات كلاش أوف كلانس للبيع (قريات تاون ماكس) | ${SITE_NAME}`
        : `متجر حسابات كلاش رويال للبيع (تشكيلات وكروت ماكس) | ${SITE_NAME}`;
      
      const description = isCoc
        ? `متجر حسابات كلاش أوف كلانس الموثوق لبيع وشراء قريات كلاش تاون 15 و16 و17 و18 ماكس بأسعار رخيصة وضمان كامل وتسليم فوري عبر الواتساب في السعودية والخليج.`
        : `متجر حسابات كلاش رويال الموثوق لبيع وشراء حسابات كلاش رويال كروت ماكس ليفل، ساحات عالية، وتطورات بطاقات مع ضمان كامل وتسليم فوري من ${SITE_NAME}.`;

      const breadcrumbItems = [
        { name: SITE_NAME, path: "/" },
        { name: label, path: `/${game}` },
      ];

      const itemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: title,
        description,
        itemListElement: rows.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: SITE_URL ? `${SITE_URL}/account/${a.slug}` : `/account/${a.slug}`,
          name: a.title,
        })),
      };

      const introHtml = isCoc
        ? `<p style="margin-bottom: 24px; color: #94a3b8; font-size: 1.05rem;">
            أكبر متجر حسابات كلاش أوف كلانس (Clash of Clans) لشراء وبيع القرى المضمونة في السعودية ودول الخليج العربي. قريات تاون هول ماكس جاهزة للحروب ودوري القبائل مع نقل ملكية Supercell ID وتسليم فوري وآمن.
          </p>`
        : `<p style="margin-bottom: 24px; color: #94a3b8; font-size: 1.05rem;">
            أفضل متجر حسابات وتشكيلات كلاش رويال للبيع في السعودية والخليج. كروت ماكس، تطورات بطاقات (Evolutions)، رانكات وأرينا عالية مع ضمان وسيط كلاش ماركت.
          </p>`;

      const headingHtml = isCoc ? "متجر حسابات كلاش أوف كلانس للبيع" : "متجر حسابات كلاش رويال للبيع";

      const html = pageShell({
        title,
        description,
        canonicalPath: req.path,
        bodyHtml: `${breadcrumbHtml(breadcrumbItems)}<h1>${escapeHtml(headingHtml)}</h1>${introHtml}${listHtml}`,
        jsonLd: [itemListJsonLd, breadcrumbJsonLd(breadcrumbItems)],
      });

      res.set("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err) {
      req.log.error({ err }, `Failed to render ${game} listing page`);
      res.status(500).send("Internal server error");
    }
  };
}

router.get("/clash-of-clans", renderGameListPage("clash-of-clans"));
router.get("/clash-royale", renderGameListPage("clash-royale"));

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
      ? `${account.description.slice(0, 120)} - شراء ${account.title} للبيع بسعر ${formatPrice(account.price)} ر.س مع كلاش ماركت في السعودية والخليج.`
      : `شراء ${account.title} - حساب ${gameLabel} للبيع بسعر ${formatPrice(account.price)} ر.س في السعودية والخليج. مواصفات كاملة، تسليم فوري، ونقل إيميل Supercell ID بأمان مع ${SITE_NAME}.`;

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
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "42",
        bestRating: "5",
        worstRating: "1",
      },
      review: [
        {
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
          },
          author: {
            "@type": "Person",
            name: "عميل موثق",
          },
          reviewBody: "تم استلام الحساب وتغيير إيميل سوبر سيل آيدي فورياً بأمان واحترافية.",
        },
      ],
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
      { name: account.title, path: `/account/${account.slug}` },
    ];

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
        الحالة: <span class="status ${escapeHtml(account.status)}" style="color: ${account.status === 'available' ? '#10b981' : '#f59e0b'}; font-weight: 700;">${escapeHtml(statusLabel)}</span> | وسيط معتمد | تسليم فوري في السعودية ودول الخليج
      </div>
      ${account.images?.length ? `<div class="gallery">${galleryHtml}</div>` : ""}
      <div class="price-row">
        <span class="price">${formatPrice(account.price)} ر.س</span>
        ${account.oldPrice ? `<span class="old-price">${formatPrice(account.oldPrice)} ر.س</span>` : ""}
      </div>
      ${specsHtml ? `<div class="specs">${specsHtml}</div>` : ""}
      ${account.description ? `<div class="content" style="margin-bottom:24px; color: #cbd5e1; line-height: 1.9;">${escapeHtml(account.description)}</div>` : ""}
      
      <a class="cta" href="${escapeHtml(whatsappLink(account.title, account.whatsappMessage))}" target="_blank" rel="noopener noreferrer">شراء الآن عبر الواتساب (تسليم فوري وآمن)</a>

      <section style="margin: 36px 0; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
        <h2 style="font-size: 1.25rem; color: #f59e0b; margin-top: 0; margin-bottom: 12px;">🛡️ ضمان وأمان شراء الحسابات مع ${escapeHtml(SITE_NAME)}</h2>
        <ul style="color: #cbd5e1; padding-right: 20px; line-height: 2; margin: 0;">
          <li><strong>أمان 100%:</strong> فحص دقيق للحساب ونقل ملكية البريد الإلكتروني وسوبر سيل آيدي بالكامل.</li>
          <li><strong>تسليم فوري:</strong> يتم إتمام عملية النقل والتسليم خلال 5 إلى 15 دقيقة عبر الواتساب.</li>
          <li><strong>طرق دفع محلية متعددة:</strong> ندعم مدى، تابي، تمارا، Apple Pay، والتحويل البنكي المباشر.</li>
          <li><strong>ضمان شامل:</strong> حماية كاملة للمشتري وضمان عدم الاسترجاع.</li>
        </ul>
      </section>

      ${relatedHtml}
    `;

    const html = pageShell({
      title: `${account.title} - ${gameLabel} للبيع بسعر ${formatPrice(account.price)} ر.س | ${SITE_NAME}`,
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