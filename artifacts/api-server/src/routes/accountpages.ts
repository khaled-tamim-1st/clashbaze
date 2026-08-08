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

function accountCardHtml(a: typeof accountsTable.$inferSelect): string {
  const image = a.images?.[0] || "";
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

      const title = `حسابات ${label} للبيع - أفضل الحسابات - ${SITE_NAME}`;
      const description = `تصفح أحدث حسابات ${label} المعروضة للبيع، أسعار وتفاصيل واضحة، وشراء آمن وسريع عبر الواتساب من ${SITE_NAME}.`;

      const breadcrumbItems = [
        { name: SITE_NAME, path: "/" },
        { name: label, path: `/${game}` },
      ];

      const itemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: title,
        itemListElement: rows.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: SITE_URL ? `${SITE_URL}/account/${a.slug}` : `/account/${a.slug}`,
          name: a.title,
        })),
      };

      const html = pageShell({
        title,
        description,
        canonicalPath: req.path,
        bodyHtml: `${breadcrumbHtml(breadcrumbItems)}<h1>حسابات ${escapeHtml(label)}</h1>${listHtml}`,
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
          description: "لم يتم العثور على هذا الحساب.",
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

    const galleryHtml = (account.images || [])
      .map((img) => `<img src="${escapeHtml(img)}" alt="${escapeHtml(account.title)}" loading="lazy" />`)
      .join("\n");

    const description = account.description
      ? account.description.slice(0, 160)
      : `${account.title} - ${gameLabel}، السعر ${formatPrice(account.price)} ر.س. تفاصيل الحساب وشراء آمن عبر الواتساب من ${SITE_NAME}.`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: account.title,
      description,
      image: account.images || undefined,
      offers: {
        "@type": "Offer",
        price: account.price,
        priceCurrency: "SAR",
        availability:
          account.status === "available"
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: SITE_URL ? `${SITE_URL}/account/${account.slug}` : `/account/${account.slug}`,
      },
    };

    const breadcrumbItems = [
      { name: SITE_NAME, path: "/" },
      { name: gameLabel, path: `/${account.game}` },
      { name: account.title, path: `/account/${account.slug}` },
    ];

    const relatedHtml = relatedFiltered.length
      ? `<section style="margin-top:48px; padding-top:32px; border-top:1px solid #e7e2f5;">
          <h2 style="font-size:1.4rem; font-weight:700; margin-bottom:16px;">حسابات مشابهة</h2>
          <div class="grid-list">${relatedFiltered.map(accountCardHtml).join("\n")}</div>
        </section>`
      : "";

    const bodyHtml = `
      ${breadcrumbHtml(breadcrumbItems)}
      <a class="back-link" href="/${account.game === "clash-of-clans" ? "clash-of-clans" : "clash-royale"}" style="margin-top:0; margin-bottom:16px;">→ رجوع لكل حسابات ${escapeHtml(gameLabel)}</a>
      <span class="badge ${account.game === "clash-of-clans" ? "coc" : "royale"}">${escapeHtml(gameLabel)}</span>
      <h1>${escapeHtml(account.title)}</h1>
      <div class="meta">
        الحالة: <span class="status ${escapeHtml(account.status)}">${escapeHtml(statusLabel)}</span>
      </div>
      ${account.images?.length ? `<div class="gallery">${galleryHtml}</div>` : ""}
      <div class="price-row">
        <span class="price">${formatPrice(account.price)} ر.س</span>
        ${account.oldPrice ? `<span class="old-price">${formatPrice(account.oldPrice)} ر.س</span>` : ""}
      </div>
      ${specsHtml ? `<div class="specs">${specsHtml}</div>` : ""}
      ${account.description ? `<div class="content" style="margin-bottom:24px;">${escapeHtml(account.description)}</div>` : ""}
      <a class="cta" href="${escapeHtml(whatsappLink(account.title, account.whatsappMessage))}" target="_blank" rel="noopener noreferrer">شراء الآن عبر الواتساب</a>
      ${relatedHtml}
    `;

    const html = pageShell({
      title: `حساب ${account.title} - ${SITE_NAME}`,
      description,
      canonicalPath: `/account/${account.slug}`,
      ogImage: account.images?.[0] || null,
      ogType: "product",
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