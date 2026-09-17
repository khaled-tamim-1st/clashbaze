import { Router } from "express";
import { db, accountsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { escapeHtml, pageShell, breadcrumbHtml, breadcrumbJsonLd, SITE_NAME, SITE_URL } from "../lib/pageshell";

const router = Router();

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

function accountCardHtml(a: {
  slug: string;
  title: string;
  price: string | number;
  oldPrice?: string | number | null;
  images: string[] | null;
  featured?: boolean | null;
  townHall?: number | null;
  arena?: string | null;
  game?: string | null;
  status?: string | null;
  league?: string | null;
  heroes?: string | null;
  gems?: number | null;
  description?: string | null;
}) {
  const rawImg = a.images && a.images.length > 0 ? a.images[0] : "";
  const img = formatCloudinaryUrl(rawImg);
  const thText = a.townHall ? `تاون هول ${a.townHall}` : a.arena ? `${a.arena}` : "";
  const statusText = a.status === "available" ? "متاح للشراء" : a.status === "reserved" ? "محجوز" : "تم البيع";

  // Detect Max / Semi-Max status from title and description
  const textToScan = `${a.title || ""} ${a.description || ""}`.toLowerCase();
  let maxTag = "";
  if (textToScan.includes("شبه ماكس") || textToScan.includes("semi")) {
    maxTag = "شبه ماكس";
  } else if (textToScan.includes("ماكس") || textToScan.includes("max")) {
    maxTag = "ماكس";
  }

  // Level / League badge formatting
  let levelText = "";
  if (a.league) {
    const rawLeague = String(a.league).trim();
    levelText = rawLeague.includes("مستوى") ? rawLeague : `مستوى ${rawLeague}`;
  }

  const altText = a.townHall
    ? `قرية كلاش أوف كلانس تاون هول ${a.townHall}${maxTag ? ` ${maxTag}` : ""} - ${escapeHtml(a.title)}`
    : `حساب ${escapeHtml(a.title)}`;

  return `
    <a class="card" href="/account/${escapeHtml(a.slug)}" title="${escapeHtml(a.title)}">
      ${img ? `<img src="${escapeHtml(img)}" alt="${altText}" width="300" height="180" loading="lazy" style="width:100%; height:180px; object-fit:cover; display:block; background:#0f172a;" />` : ""}
      <div class="card-body">
        <div style="display:flex; gap:6px; margin-bottom:8px; flex-wrap:wrap; align-items:center;">
          ${a.featured ? `<span class="featured-badge" style="margin:0;">⭐ مميز</span>` : ""}
          ${thText ? `<span style="display:inline-block; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; background:#1e3a8a; color:#bfdbfe; border:1px solid #2563eb;">${thText}</span>` : ""}
          ${maxTag ? `<span style="display:inline-block; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; background:#78350f; color:#fde68a; border:1px solid #d97706;">${maxTag}</span>` : ""}
          ${levelText ? `<span style="display:inline-block; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; background:#334155; color:#f1f5f9; border:1px solid #475569;">${escapeHtml(levelText)}</span>` : ""}
          <span style="display:inline-block; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; background:#065f46; color:#a7f3d0; border:1px solid #059669;">${statusText}</span>
        </div>
        <div class="card-title">${escapeHtml(a.title)}</div>
        <div class="card-price">${Number(a.price).toLocaleString("ar-SA")} ر.س</div>
        <div style="font-size:0.85rem; color:#f59e0b; margin-top:10px; font-weight:700; display:flex; align-items:center; gap:4px;">
          <span>عرض تفاصيل القرية</span> <span>←</span>
        </div>
      </div>
    </a>`;
}

// Visual banners helper for Town Hall categories
function townHallBannersHtml() {
  return `
    <div style="margin:24px 0 36px; display:flex; flex-direction:column; gap:20px;">
      <div style="border:1px solid #334155; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.2);">
        <a href="/clash-of-clans/town-hall-18" style="display:block;">
          <img src="/banners/th18-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 18 للبيع - قريات تاون 18 ماكس" width="1024" height="393" style="width:100%; height:auto; display:block; aspect-ratio:1024/393; object-fit:cover;" loading="eager" />
        </a>
      </div>
      <div style="border:1px solid #334155; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.2);">
        <a href="/clash-of-clans/town-hall-17" style="display:block;">
          <img src="/banners/th17-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 17 للبيع - قريات تاون 17 ماكس وشبه ماكس" width="1024" height="393" style="width:100%; height:auto; display:block; aspect-ratio:1024/393; object-fit:cover;" loading="lazy" />
        </a>
      </div>
      <div style="border:1px solid #334155; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.2);">
        <a href="/clash-of-clans/town-hall-16" style="display:block;">
          <img src="/banners/th16-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 16 للبيع - قريات تاون 16 بدفاعات مدمجة" width="1024" height="393" style="width:100%; height:auto; display:block; aspect-ratio:1024/393; object-fit:cover;" loading="lazy" />
        </a>
      </div>
      <div style="border:1px solid #334155; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.2);">
        <a href="/clash-of-clans/town-hall-15" style="display:block;">
          <img src="/banners/th15-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 15 للبيع - قريات تاون 15 بأسعار اقتصادية" width="1024" height="393" style="width:100%; height:auto; display:block; aspect-ratio:1024/393; object-fit:cover;" loading="lazy" />
        </a>
      </div>
    </div>
  `;
}

function accountItemListJsonLd(name: string, accounts: Array<{ slug: string; title: string }>) {
  if (!accounts || accounts.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: accounts.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/account/${a.slug}`,
      item: `${SITE_URL}/account/${a.slug}`,
      name: a.title,
    })),
  };
}

// -------------------------------------------------------------
// Subcategory: Town Hall 18 (/clash-of-clans/town-hall-18)
// -------------------------------------------------------------
router.get("/clash-of-clans/town-hall-18", async (req, res) => {
  try {
    const accounts = await db
      .select()
      .from(accountsTable)
      .where(and(
        eq(accountsTable.game, "clash-of-clans"),
        eq(accountsTable.townHall, 18),
        eq(accountsTable.status, "available")
      ))
      .orderBy(desc(accountsTable.id));

    const accountsHtml = accounts.length
      ? `<div class="grid-list">${accounts.map(accountCardHtml).join("")}</div>`
      : `<p style="padding:24px; background:#1e293b; border-radius:12px; border:1px solid #334155; text-align:center;">لا توجد حسابات تاون هول 18 معروضة حالياً. يمكنك التواصل عبر الواتساب للاستفسار عن توفر قريات TH18 جديدة قريباً.</p>`;

    const title = "حسابات كلاش أوف كلانس تاون هول 18 للبيع | قريات ماكس — كلاش ماركت";
    const description = "تصفح واشترِ حسابات وقريات كلاش أوف كلانس تاون هول 18 (TH18) ماكس بأحدث الدفاعات والأبطال الستة والمعدات المطورة بتسليم فوري وضمان كلاش ماركت.";

    const breadcrumbItems = [
      { name: SITE_NAME, path: "/" },
      { name: "حسابات كلاش أوف كلانس", path: "/clash-of-clans" },
      { name: "تاون هول 18", path: "/clash-of-clans/town-hall-18" },
    ];

    const faqItems = [
      { q: "ما هي ميزات شراء حساب تاون هول 18 ماكس من كلاش ماركت؟", a: "تاون هول 18 يمثل قمة التقدم في كلاش أوف كلانس، مع توفر المستويات القصوى للأبطال الستة وأحدث الدفاعات المدمجة والمعدات الملحمية، مما يمنحك أفضلية فورية في دوري الأساطير وحروب CWL." },
      { q: "هل يتم تسليم قرية تاون 18 مع الإيميل الأساسي وتأمين الحساب؟", a: "نعم، يتم نقل بريد Supercell ID بالكامل وتغيير كلمة المرور وتفعيل الحماية بخطوتين وAccount Protection على رقمك الشخصي مع تسليم رموز الاسترداد." },
      { q: "هل تتوفر خيارات تقسيط لشراء قريات TH18؟", a: "نعم، يمكنك التنسيق المباشر عبر الواتساب لتقسيط قيمة الحساب عبر تابي أو تمارا على 4 دفعات ميسرة." },
      { q: "كيف أضمن عدم استرجاع الحساب بعد الشراء؟", a: "نوفر ضماناً كاملاً وفق سياسة المتجر، مع فحص يدوي دقيق لجميع القريات قبل عرضها والتأكد من نظافة سجل الملكية." },
    ];

    const faqHtml = faqItems.map(f => `<details style="border:1px solid #334155; border-radius:8px; margin-bottom:8px;"><summary style="padding:12px; cursor:pointer; font-weight:600; color:#f8fafc;">${escapeHtml(f.q)}</summary><p style="padding:0 12px 12px; color:#94a3b8; line-height:1.8;">${escapeHtml(f.a)}</p></details>`).join("");

    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const bodyHtml = `
      ${breadcrumbHtml(breadcrumbItems)}
      <div style="margin-bottom:24px; border-radius:12px; overflow:hidden; border:1px solid #334155;">
        <img src="/banners/th18-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 18 للبيع" width="1024" height="393" style="width:100%; height:auto; display:block;" />
      </div>
      <h1>حسابات كلاش أوف كلانس تاون هول 18 للبيع (TH18 Max)</h1>
      <p>مرحباً بك في القسم المخصص لقريات وحسابات كلاش أوف كلانس تاون هول 18 (Town Hall 18). يمثل TH18 أعلى مستوى تطوير حالياً في اللعبة، ويوفر للاعبين المحترفين أحدث الأسلحة الدفاعية، وأعلى مستويات الأبطال الستة، والعتاد الملحمي المطور بالكامل للمنافسة في قمة دوري الأساطير (Legend League) وبطولات Clan War Leagues التنافسية.</p>

      <h2>قريات تاون هول 18 المتاحة للشراء الفوري</h2>
      ${accountsHtml}

      <h2>لماذا تختار قرية كلاش أوف كلانس تاون 18 ماكس؟</h2>
      <ul style="line-height:2;">
        <li><strong>أعلى قوة هجومية ودفاعية:</strong> امتلاك TH18 يعفيك من سنوات من التطوير وجمع الموارد، لتلعب مباشرة في أعلى مستوى تنافسي في اللعبة.</li>
        <li><strong>الأبطال والمعدات الملحمية:</strong> تضمن وصول أبطالك لمستوياتهم القصوى مع المعدات الملحمية (Epic Equipment) مثل Gauntlet وFrozen Arrow بأعلى قدرات.</li>
        <li><strong>دفاعات الجيل الأحدث:</strong> تصاميم دفاعية مدمجة تقاوم استراتيجيات الهجوم الأكثر شراسة في الساحة الدولية.</li>
      </ul>

      <h2>قريات كلاش أوف كلانس بمستويات تاون هول أخرى</h2>
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin:20px 0;">
        <a class="cta" href="/clash-of-clans/town-hall-17" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 17</a>
        <a class="cta" href="/clash-of-clans/town-hall-16" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 16</a>
        <a class="cta" href="/clash-of-clans/town-hall-15" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 15</a>
        <a class="cta" href="/clash-of-clans" style="background:#2563eb; color:#fff; font-size:0.95rem; padding:10px 20px;">جميع قريات كلاش أوف كلانس</a>
      </div>

      <h2>أسئلة شائعة حول حسابات تاون هول 18</h2>
      ${faqHtml}

      <p style="margin-top:32px;"><a class="back-link" href="/clash-of-clans">← العودة لقسم كلاش أوف كلانس الرئيسي</a></p>
    `;

    const html = pageShell({
      title,
      description,
      canonicalPath: "/clash-of-clans/town-hall-18",
      ogImage: `${SITE_URL}/banners/th18-banner.png`,
      bodyHtml,
      jsonLd: [breadcrumbJsonLd(breadcrumbItems), faqJsonLd, accountItemListJsonLd(title, accounts)].filter(Boolean) as object[],
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render TH18 page");
    res.status(500).send("Internal server error");
  }
});

// -------------------------------------------------------------
// Subcategory: Town Hall 17 (/clash-of-clans/town-hall-17)
// -------------------------------------------------------------
router.get("/clash-of-clans/town-hall-17", async (req, res) => {
  try {
    const accounts = await db
      .select()
      .from(accountsTable)
      .where(and(
        eq(accountsTable.game, "clash-of-clans"),
        eq(accountsTable.townHall, 17),
        eq(accountsTable.status, "available")
      ))
      .orderBy(desc(accountsTable.id));

    const accountsHtml = accounts.length
      ? `<div class="grid-list">${accounts.map(accountCardHtml).join("")}</div>`
      : `<p style="padding:24px; background:#1e293b; border-radius:12px; border:1px solid #334155; text-align:center;">لا توجد حسابات تاون هول 17 معروضة حالياً. يمكنك التواصل معنا عبر الواتساب للاستفسار عن القريات القادمة قريباً.</p>`;

    const title = "حسابات كلاش أوف كلانس تاون هول 17 للبيع | قريات ماكس وشبه ماكس — كلاش ماركت";
    const description = "اشترِ حسابات وقريات كلاش أوف كلانس تاون هول 17 (TH17) ماكس وشبه ماكس بأسعار منافسة وتسليم فوري مع نقل ملكية Supercell ID وضمان متجر كلاش ماركت.";

    const breadcrumbItems = [
      { name: SITE_NAME, path: "/" },
      { name: "حسابات كلاش أوف كلانس", path: "/clash-of-clans" },
      { name: "تاون هول 17", path: "/clash-of-clans/town-hall-17" },
    ];

    const faqItems = [
      { q: "ما هي ميزات شراء حساب تاون هول 17؟", a: "تاون هول 17 يقدم توازناً مثالياً بين القوة الهجومية المتطورة والتكلفة الممتازة مقارنة بأحدث تاون، مع ترقيات قوية للنسر المدافع وتشكيلات متقدمة للحروب." },
      { q: "هل القريات المعروضة ماكس أم شبه ماكس؟", a: "نوفر قريات تاون هول 17 بمستويات متعددة تشمل قريات ماكس بالكامل وقريات شبه ماكس تناسب مختلف الميزانيات، وتفاصيل كل قرية مدونة بوضوح." },
      { q: "كيف يتم استلام قرية تاون 17 بعد الدفع؟", a: "يتم التواصل فوراً عبر الواتساب لنقل البريد الإلكتروني الخاص بـ Supercell ID وتأكيد الحساب وتغيير كلمات المرور في جلسة مباشرة." },
      { q: "هل يشمل الحساب ضمان ضد السحب؟", a: "نعم، جميع الحسابات مشمولة بضمان كلاش ماركت الذهبي ضد السحب والاسترجاع مع دعم فني مستمر." },
    ];

    const faqHtml = faqItems.map(f => `<details style="border:1px solid #334155; border-radius:8px; margin-bottom:8px;"><summary style="padding:12px; cursor:pointer; font-weight:600; color:#f8fafc;">${escapeHtml(f.q)}</summary><p style="padding:0 12px 12px; color:#94a3b8; line-height:1.8;">${escapeHtml(f.a)}</p></details>`).join("");

    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const bodyHtml = `
      ${breadcrumbHtml(breadcrumbItems)}
      <div style="margin-bottom:24px; border-radius:12px; overflow:hidden; border:1px solid #334155;">
        <img src="/banners/th17-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 17 للبيع" width="1024" height="393" style="width:100%; height:auto; display:block;" />
      </div>
      <h1>حسابات كلاش أوف كلانس تاون هول 17 للبيع (TH17 Max)</h1>
      <p>استكشف أقوى قريات كلاش أوف كلانس تاون هول 17 (Town Hall 17). يعتبر TH17 خياراً استراتيجياً ممتازاً للاعبين الباحثين عن قرية متقدمة للغاية قادرة على التنافس في حروب القبائل الكبرى (CWL) دون دفع التكلفة المرتفعة جداً لأحدث تاون هول، مع مستويات أبطال عالية ومعدات قتالية فعالة.</p>

      <h2>قريات تاون هول 17 المتاحة للشراء الآن</h2>
      ${accountsHtml}

      <h2>مميزات اقتناء قرية تاون هول 17</h2>
      <ul style="line-height:2;">
        <li><strong>أداء ممتاز في حروب CWL:</strong> دفاعات متينة وجيوش مدربة لمسح الخصوم في درجات Champion وMaster.</li>
        <li><strong>أبطال بمستويات متقدمة:</strong> تطويرات قوية للملك والملكة والآمر الكبير والبطلة الملكية.</li>
        <li><strong>قيمة مالية ممتازة:</strong> أسعار مدروسة تمنحك أفضل قيمة مقابل التطويرات المنجزة في القرية.</li>
      </ul>

      <h2>قريات كلاش أوف كلانس بمستويات تاون هول أخرى</h2>
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin:20px 0;">
        <a class="cta" href="/clash-of-clans/town-hall-18" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 18</a>
        <a class="cta" href="/clash-of-clans/town-hall-16" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 16</a>
        <a class="cta" href="/clash-of-clans/town-hall-15" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 15</a>
        <a class="cta" href="/clash-of-clans" style="background:#2563eb; color:#fff; font-size:0.95rem; padding:10px 20px;">جميع قريات كلاش أوف كلانس</a>
      </div>

      <h2>أسئلة شائعة حول حسابات تاون هول 17</h2>
      ${faqHtml}

      <p style="margin-top:32px;"><a class="back-link" href="/clash-of-clans">← العودة لقسم كلاش أوف كلانس الرئيسي</a></p>
    `;

    const html = pageShell({
      title,
      description,
      canonicalPath: "/clash-of-clans/town-hall-17",
      ogImage: `${SITE_URL}/banners/th17-banner.png`,
      bodyHtml,
      jsonLd: [breadcrumbJsonLd(breadcrumbItems), faqJsonLd, accountItemListJsonLd(title, accounts)].filter(Boolean) as object[],
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render TH17 page");
    res.status(500).send("Internal server error");
  }
});

// -------------------------------------------------------------
// Subcategory: Town Hall 16 (/clash-of-clans/town-hall-16)
// -------------------------------------------------------------
router.get("/clash-of-clans/town-hall-16", async (req, res) => {
  try {
    const accounts = await db
      .select()
      .from(accountsTable)
      .where(and(
        eq(accountsTable.game, "clash-of-clans"),
        eq(accountsTable.townHall, 16),
        eq(accountsTable.status, "available")
      ))
      .orderBy(desc(accountsTable.id));

    const accountsHtml = accounts.length
      ? `<div class="grid-list">${accounts.map(accountCardHtml).join("")}</div>`
      : `<p style="padding:24px; background:#1e293b; border-radius:12px; border:1px solid #334155; text-align:center;">لا توجد حسابات تاون هول 16 معروضة حالياً. يمكنك مراسلتنا عبر الواتساب للاستفسار عن القريات القادمة قريباً.</p>`;

    const title = "حسابات كلاش أوف كلانس تاون هول 16 للبيع | قريات مميزة بأسعار منافسة — كلاش ماركت";
    const description = "تسوق حسابات كلاش أوف كلانس تاون هول 16 (TH16) بتصاميم دفاعية قوية وأبطال متقدمين ومعدات ملحمية بتسليم فوري وضمان كلاش ماركت المعتمد.";

    const breadcrumbItems = [
      { name: SITE_NAME, path: "/" },
      { name: "حسابات كلاش أوف كلانس", path: "/clash-of-clans" },
      { name: "تاون هول 16", path: "/clash-of-clans/town-hall-16" },
    ];

    const faqItems = [
      { q: "ما الذي يميز قريات تاون هول 16؟", a: "تاون هول 16 يمثل مرحلة دفاعية ممتازة بفضل الدفاعات المدمجة مثل المدافع المرتدة (Ricochet Cannon) وأبراج رماة السهام المتعددة (Multi-Archer Tower) مع معدات أبطال متنوعة وتكلفة شراء اقتصادية." },
      { q: "هل تاون 16 مناسب للدخول في كلانات قوية؟", a: "نعم بالتأكيد، قريات TH16 مطلوبة بكثرة في كلانات الحروب والـ CWL ولديها قدرة تنافسية عالية." },
      { q: "كيف يتم تأمين القرية بعد الشراء؟", a: "يتم تسليم بريد Supercell ID الرسمي وتفعيله على هاتفك مباشرة مع تفعيل رموز الاسترداد لضمان حماية مطلقة." },
      { q: "هل يمكنني بيع أو استبدال قريتي مع تاون 16؟", a: "يمكنك التواصل مع إدارة المتجر عبر الواتساب لبحث خيارات البيع المباشر أو الترقية وفق سياسة المتجر." },
    ];

    const faqHtml = faqItems.map(f => `<details style="border:1px solid #334155; border-radius:8px; margin-bottom:8px;"><summary style="padding:12px; cursor:pointer; font-weight:600; color:#f8fafc;">${escapeHtml(f.q)}</summary><p style="padding:0 12px 12px; color:#94a3b8; line-height:1.8;">${escapeHtml(f.a)}</p></details>`).join("");

    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const bodyHtml = `
      ${breadcrumbHtml(breadcrumbItems)}
      <div style="margin-bottom:24px; border-radius:12px; overflow:hidden; border:1px solid #334155;">
        <img src="/banners/th16-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 16 للبيع" width="1024" height="393" style="width:100%; height:auto; display:block;" />
      </div>
      <h1>حسابات كلاش أوف كلانس تاون هول 16 للبيع (TH16)</h1>
      <p>تصفح تشكيلة حسابات وقريات كلاش أوف كلانس تاون هول 16 (Town Hall 16). يقدم TH16 نقطة انطلاق مثالية ومتقدمة للاعبين الذين يبحثون عن قوة دفاعية قوية بالدفاعات المدمجة الجديدة ومعدات الأبطال الملحمية، مع الحفاظ على سعر اقتصادي ومناسب في متناول الجميع.</p>

      <h2>قريات تاون هول 16 المتاحة للشراء الآن</h2>
      ${accountsHtml}

      <h2>لماذا يفضل الكثيرون شراء تاون هول 16؟</h2>
      <ul style="line-height:2;">
        <li><strong>أفضل توازن اقتصادي:</strong> الحصول على قرية تنافسية قوية جداً بتكلفة شراء ميسرة.</li>
        <li><strong>دفاعات مدمجة حديثة:</strong> المدافع المرتدة وأبراج السهام المتعددة التي تزيد من صعوبة مسح قريتك.</li>
        <li><strong>نظام المعدات (Hero Equipment):</strong> فتح معظم المعدات الملحمية والعادية وتطويرها.</li>
      </ul>

      <h2>قريات كلاش أوف كلانس بمستويات تاون هول أخرى</h2>
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin:20px 0;">
        <a class="cta" href="/clash-of-clans/town-hall-18" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 18</a>
        <a class="cta" href="/clash-of-clans/town-hall-17" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 17</a>
        <a class="cta" href="/clash-of-clans/town-hall-15" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 15</a>
        <a class="cta" href="/clash-of-clans" style="background:#2563eb; color:#fff; font-size:0.95rem; padding:10px 20px;">جميع قريات كلاش أوف كلانس</a>
      </div>

      <h2>أسئلة شائعة حول حسابات تاون هول 16</h2>
      ${faqHtml}

      <p style="margin-top:32px;"><a class="back-link" href="/clash-of-clans">← العودة لقسم كلاش أوف كلانس الرئيسي</a></p>
    `;

    const html = pageShell({
      title,
      description,
      canonicalPath: "/clash-of-clans/town-hall-16",
      ogImage: `${SITE_URL}/banners/th16-banner.png`,
      bodyHtml,
      jsonLd: [breadcrumbJsonLd(breadcrumbItems), faqJsonLd, accountItemListJsonLd(title, accounts)].filter(Boolean) as object[],
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render TH16 page");
    res.status(500).send("Internal server error");
  }
});

// -------------------------------------------------------------
// Subcategory: Town Hall 15 (/clash-of-clans/town-hall-15)
// -------------------------------------------------------------
router.get("/clash-of-clans/town-hall-15", async (req, res) => {
  try {
    const accounts = await db
      .select()
      .from(accountsTable)
      .where(and(
        eq(accountsTable.game, "clash-of-clans"),
        eq(accountsTable.townHall, 15),
        eq(accountsTable.status, "available")
      ))
      .orderBy(desc(accountsTable.id));

    const accountsHtml = accounts.length
      ? `<div class="grid-list">${accounts.map(accountCardHtml).join("")}</div>`
      : `<p style="padding:24px; background:#1e293b; border-radius:12px; border:1px solid #334155; text-align:center;">لا توجد حسابات تاون هول 15 معروضة حالياً. يمكنك مراسلتنا عبر الواتساب للاستفسار عن القريات القادمة قريباً.</p>`;

    const title = "حسابات كلاش أوف كلانس تاون هول 15 للبيع | قريات مميزة بأسعار اقتصادية — كلاش ماركت";
    const description = "تصفح واشترِ حسابات وقريات كلاش أوف كلانس تاون هول 15 (TH15) ماكس وشبه ماكس بأسعار اقتصادية ممتازة وتسليم فوري مع ضمان كلاش ماركت.";

    const breadcrumbItems = [
      { name: SITE_NAME, path: "/" },
      { name: "حسابات كلاش أوف كلانس", path: "/clash-of-clans" },
      { name: "تاون هول 15", path: "/clash-of-clans/town-hall-15" },
    ];

    const faqItems = [
      { q: "ما الذي يميز قريات تاون هول 15؟", a: "تاون هول 15 يقدم تجربة لعب متقدمة بدفاعات أسطورية مثل المونوليث (Monolith) وبرج التعويذات (Spell Tower) مع سعر اقتصادي ومناسب جداً للمبتدئين في المستويات العليا." },
      { q: "هل الحسابات تسلم بإيميل Supercell ID الأساسي؟", a: "نعم، يتم نقل ملكية Supercell ID وتأمين الحساب برقمك وتسليم كافة رموز الأمان فور إتمام الطلب." },
      { q: "هل تتوفر خيارات دفع بالتقسيط؟", a: "نعم، متاح التقسيط الميسر عبر تابي وتمارا بالتنسيق عبر الواتساب بالإضافة إلى التحويل البنكي المباشر." },
      { q: "ما هو الضمان المقدم على حسابات تاون 15؟", a: "جميع الحسابات مشمولة بالضمان الذهبي الشامل لحماية المشتري ضد السحب أو الاسترجاع." },
    ];

    const faqHtml = faqItems.map(f => `<details style="border:1px solid #334155; border-radius:8px; margin-bottom:8px;"><summary style="padding:12px; cursor:pointer; font-weight:600; color:#f8fafc;">${escapeHtml(f.q)}</summary><p style="padding:0 12px 12px; color:#94a3b8; line-height:1.8;">${escapeHtml(f.a)}</p></details>`).join("");

    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const bodyHtml = `
      ${breadcrumbHtml(breadcrumbItems)}
      <div style="margin-bottom:24px; border-radius:12px; overflow:hidden; border:1px solid #334155;">
        <img src="/banners/th15-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 15 للبيع" width="1024" height="393" style="width:100%; height:auto; display:block;" />
      </div>
      <h1>حسابات كلاش أوف كلانس تاون هول 15 للبيع (TH15)</h1>
      <p>استكشف قريات وحسابات كلاش أوف كلانس تاون هول 15 (Town Hall 15). يمثل TH15 الخيار الاقتصادي الأكثر طلباً للاعبين الراغبين في دخول المستويات المتقدمة والاستمتاع بتطويرات السحر المتجمد وأبراج السم والأبطال الأربعة بأسعار في متناول الجميع.</p>

      <h2>قريات تاون هول 15 المتاحة للشراء الآن</h2>
      ${accountsHtml}

      <h2>لماذا تختار قرية كلاش أوف كلانس تاون 15؟</h2>
      <ul style="line-height:2;">
        <li><strong>أفضل سعر اقتصادي:</strong> الحصول على قرية متقدمة بتكلفة شراء منخفضة ومناسبة لجميع الميزانيات.</li>
        <li><strong>دفاعات سحرية قوية:</strong> برج التعويذات والمونوليث (Monolith) وقوة دفاعية ممتازة في الحروب.</li>
        <li><strong>أبطال وجيوش مطورة:</strong> قوة هجومية كافية للمنافسة بقوة في حروب القبائل وجمع الموارد بسهولة.</li>
      </ul>

      <h2>قريات كلاش أوف كلانس بمستويات تاون هول أخرى</h2>
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin:20px 0;">
        <a class="cta" href="/clash-of-clans/town-hall-18" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 18</a>
        <a class="cta" href="/clash-of-clans/town-hall-17" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 17</a>
        <a class="cta" href="/clash-of-clans/town-hall-16" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">حسابات تاون هول 16</a>
        <a class="cta" href="/clash-of-clans" style="background:#2563eb; color:#fff; font-size:0.95rem; padding:10px 20px;">جميع قريات كلاش أوف كلانس</a>
      </div>

      <h2>أسئلة شائعة حول حسابات تاون هول 15</h2>
      ${faqHtml}

      <p style="margin-top:32px;"><a class="back-link" href="/clash-of-clans">← العودة لقسم كلاش أوف كلانس الرئيسي</a></p>
    `;

    const html = pageShell({
      title,
      description,
      canonicalPath: "/clash-of-clans/town-hall-15",
      ogImage: `${SITE_URL}/banners/th15-banner.png`,
      bodyHtml,
      jsonLd: [breadcrumbJsonLd(breadcrumbItems), faqJsonLd, accountItemListJsonLd(title, accounts)].filter(Boolean) as object[],
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render TH15 page");
    res.status(500).send("Internal server error");
  }
});

// -------------------------------------------------------------
// 1. صفحة قسم كلاش أوف كلانس الرئيسية (/clash-of-clans)
// -------------------------------------------------------------
router.get("/clash-of-clans", async (req, res) => {
  try {
    // 301 Permanent Redirect for legacy query URLs like /clash-of-clans?townHall=18
    const thQuery = req.query.townHall;
    if (typeof thQuery === "string" && ["15", "16", "17", "18"].includes(thQuery.trim())) {
      return res.redirect(301, `/clash-of-clans/town-hall-${thQuery.trim()}`);
    }

    const [featuredAccounts, allAccounts] = await Promise.all([
      db
        .select()
        .from(accountsTable)
        .where(and(
          eq(accountsTable.game, "clash-of-clans"),
          eq(accountsTable.status, "available"),
          eq(accountsTable.featured, true)
        ))
        .orderBy(desc(accountsTable.id)),
      db
        .select()
        .from(accountsTable)
        .where(and(
          eq(accountsTable.game, "clash-of-clans"),
          eq(accountsTable.status, "available")
        ))
        .orderBy(desc(accountsTable.id)),
    ]);

    const featuredHtml = featuredAccounts.length
      ? `
        <div style="margin: 28px 0 40px; padding: 24px; background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 16px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
            <h2 style="margin:0; font-size:1.4rem; color:#f8fafc; display:flex; align-items:center; gap:10px;"><img src="/images/barbarian-king.png" alt="الملك البربري - حسابات كلاش أوف كلانس المميزة" width="36" height="36" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;" /> حسابات كلاش أوف كلانس المميزة</h2>
            <span style="color:#f59e0b; font-size:0.9rem; font-weight:600;">مختارة بعناية ومفحوصة</span>
          </div>
          <div class="grid-list" style="margin:0;">${featuredAccounts.map(accountCardHtml).join("")}</div>
        </div>
      `
      : "";

    const accountsHtml = allAccounts.length
      ? `<div class="grid-list">${allAccounts.map(accountCardHtml).join("")}</div>`
      : `<p style="padding:24px; background:#1e293b; border-radius:12px; border:1px solid #334155; text-align:center;">لا توجد حسابات كلاش أوف كلانس متاحة حالياً. يمكنك التواصل معنا عبر الواتساب للاستفسار عن القريات القادمة قريباً.</p>`;

    const numericPrices = allAccounts.map(a => Number(a.price)).filter(p => !isNaN(p) && p > 0);
    const minPrice = numericPrices.length ? Math.min(...numericPrices) : null;
    const maxPrice = numericPrices.length ? Math.max(...numericPrices) : null;
    const priceSummaryText = minPrice !== null && maxPrice !== null
      ? (minPrice === maxPrice ? `بسعر ${minPrice.toLocaleString("ar-SA")} ريال سعودي` : `بأسعار تبدأ من ${minPrice.toLocaleString("ar-SA")} وتصل إلى ${maxPrice.toLocaleString("ar-SA")} ريال سعودي`)
      : "بأسعار منافسة مدروسة ومحدثة";

    const title = "حسابات كلاش أوف كلانس للبيع والشراء | متجر كلاش ماركت";
    const description = "تصفح أكبر متجر لبيع وشراء حسابات كلاش أوف كلانس في السعودية والخليج. قريات تاون هول 14 إلى 18 ماكس وشبه ماكس بأسعار منافسة وتسليم يدوي فوري وتأمين Supercell ID وضمان موثق.";

    const canonicalPath = "https://api.clashmarket.online/clash-of-clans";

    const breadcrumbItems = [
      { name: "الرئيسية", path: "/" },
      { name: "حسابات كلاش أوف كلانس", path: canonicalPath },
    ];

    const faqItems = [
      {
        q: "كيف أشتري حساب كلاش أوف كلانس من متجر كلاش ماركت؟",
        a: "عملية الشراء في كلاش ماركت مباشرة وميسرة: تصفح الحسابات المعروضة في هذه الصفحة واختر القرية التي تناسب ميزانيتك ومستواك، ثم اضغط على زر التواصل عبر الواتساب. سيتواصل معك فريق خدمة العملاء للاتفاق على وسيلة الدفع (تحويل بنكي مباشر أو تقسيط ميسر عبر تابي وتمارا)، ثم نبدأ جلسة تسليم فورية لنقل ملكية بريد Supercell ID لبريدك الشخصي وتأمين الحساب برقمك وتسليمك رموز الاسترداد."
      },
      {
        q: "أين أجد حسابات كلاش أوف كلانس للبيع موثوقة ومفحوصة؟",
        a: "يقدم متجر كلاش ماركت منصة بيع وشراء متخصصة وموثوقة للاعبين في السعودية ودول الخليج العربي. تخضع كافة القريات والحسابات المعروضة لفحص يدوي دقيق للتأكد من نظافة سجل الحساب، وعدم وجود بلاغات أو نزاعات ملكية سابقة، والتحقق من تطويرات الأبطال والمعدات قبل إدراج الحساب للعرض."
      },
      {
        q: "ما الفرق بين حساب كلاش ماكس وحساب شبه ماكس؟",
        a: "الحساب الماكس (Full Max) يكون فيه كل مبنى دفاعي، وجدران القرية، والأبطال، والحيوانات الأليفة، والعتاد الملحمي، والجنود والتعويذات في المختبر مطورة للحد الأقصى المتاح لمستوى التاون هول. أما الحساب شبه الماكس (Semi Max) فيتميز بوجود التاون هول والأبطال والتشكيلات الهجومية الأساسية عند مستويات متقدمة جداً، بينما تتبقى ترقيات في بعض الجدران أو الدفاعات الثانوية، وهو ما يتيح اقتناء قرية قوية جداً بسعر اقتصادي منخفض."
      },
      {
        q: "ما هي العوامل التي تحدد أسعار حسابات كلاش أوف كلانس؟",
        a: "تتحدد أسعار حسابات وقرى كلاش أوف كلانس بناءً على: 1) مستوى التاون هول (حيث تمثل قريات تاون 18 و17 الفئة الأعلى قيمة). 2) مستويات الأبطال وتطويرات الحيوانات الأليفة. 3) مستويات عتاد الأبطال الملحمي والعادي (Hero Equipment) ورصيد الخامات. 4) التشكيلات المطورة في المختبر. 5) رصيد الجواهر والسكنات الحصرية وتصاميم القرى وثيمات الساحة (Sceneries)."
      },
      {
        q: "ما الفرق بين حسابات تاون هول 18 وحسابات تاون هول 17؟",
        a: "تاون هول 18 (TH18) هو المستوى الأحدث في كلاش أوف كلانس ويضم أعلى سقف لمستويات الأبطال والعتاد الملحمي وأقوى سلاح رئيسي للتاون، وهو الاختيار الأمثل للاعبين الراغبين بالمنافسة في قمة دوري الأساطير (Legend League) وبطولات CWL للمحترفين. أما تاون هول 17 فيقدم قوة نارية قريبة جداً مع دفاعات مدمجة متطورة ولكن بتكلفة شراء أقل تناسب أصحاب الميزانيات المتوسطة."
      },
      {
        q: "كيف أختار حساب كلاش أوف كلانس المناسب لميزانيتي؟",
        a: "حدد أولاً هدفك الأساسي: إذا كنت ترغب بالمنافسة الفورية في أعلى الدوريات فخيارك هو تاون 18 ماكس. أما إذا كنت تبحث عن أعلى كفاءة مقابل السعر، فإن تاون 17 أو تاون 16 شبه ماكس يوفران توازناً استثنائياً. وللمبتدئين أو الراغبين ببدء متوازن، فإن قريات تاون 15 و14 تقدم خياراً اقتصادياً ممتازاً يبدأ من أسعار ميسرة."
      },
      {
        q: "ما هي البيانات التي يجب مراجعتها بدقة قبل شراء أي قرية كلاش؟",
        a: "قبل إتمام الشراء، ننصح بمراجعة: مستوى التاون هول ونظافة القرية، مستويات الأبطال الأربعة الرئيسيين، مستويات المعدات الملحمية مثل القفاز العملاق والسهم المتجمد والكرة النارية، جاهزية جيوش الهجوم المفضلة لديك في المختبر، حالة ربط Supercell ID وإمكانية تغيير البريد، ورصيد الجواهر المتاح."
      },
      {
        q: "هل تتوفر قريات وحسابات كلاش أوف كلانس بمستويات تاون هول مختلفة؟",
        a: "نعم، يوفر متجر كلاش ماركت أقساماً مخصصة لمختلف مستويات التاون هول تشمل تاون هول 18، تاون هول 17، تاون هول 16، وتاون هول 15، مع إمكانية تصفح كل قسم بشكل مستقل واستعراض صور ومواصفات كل قرية بالتفصيل."
      },
      {
        q: "كيف يتم نقل ملكية وتأمين حساب Supercell ID بعد الدفع؟",
        a: "يتم نقل ملكية الحساب عبر جلسة تواصل مباشرة على الواتساب: يتم الدخول وتغيير البريد الإلكتروني المرتبط بـ Supercell ID إلى بريدك الشخصي، ثم يُطلب منك إدخال رمز التحقق لتأكيد الملكية، وتفعيل ميزة حماية الحساب (Account Protection) برقم هاتفك الجوال، وتزويدك برموز الاسترداد الاحتياطية (Recovery Codes) لضمان أمان كامل ومستقل للقرية."
      },
      {
        q: "هل متجر كلاش ماركت جهة تابعة لشركة Supercell أو معتمدة منها؟",
        a: "كلاش ماركت منصة وسيطة مستقلة تماماً وليست تابعة لشركة Supercell Oy ولا معتمدة أو مدعومة منها. شروط خدمة Supercell تحظر تداول ومشاركة الحسابات، ونحن نوضح ذلك بشفافية لكافة عملائنا مع تطبيق أدق إجراءات الفحص والتسليم اليدوي المباشر وتغيير البريد لضمان الشفافية والأمان وحماية حقوق الطرفين."
      }
    ];

    const faqHtml = faqItems.map(f => `
      <details style="border:1px solid #334155; border-radius:10px; margin-bottom:12px; background:rgba(30,41,59,0.5);">
        <summary style="padding:16px; cursor:pointer; font-weight:700; color:#f8fafc; font-size:1.05rem;">${escapeHtml(f.q)}</summary>
        <p style="padding:0 16px 16px; color:#94a3b8; line-height:1.9; margin:0;">${escapeHtml(f.a)}</p>
      </details>
    `).join("");

    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const collectionJsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonicalPath,
      inLanguage: "ar-SA",
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: "https://www.clashmarket.online",
      },
    };

    const storeJsonLd = {
      "@context": "https://schema.org",
      "@type": "Store",
      name: SITE_NAME,
      url: "https://www.clashmarket.online",
      logo: `${SITE_URL}/thumbnail.png`,
      description: "متجر متخصص في بيع وشراء حسابات وقرى كلاش أوف كلانس وكلاش رويال في السعودية والخليج العربي بتسليم يدوي مباشر وضمان موثق.",
      currenciesAccepted: "SAR",
      paymentAccepted: "Bank Transfer, Tabby, Tamara",
      areaServed: [
        { "@type": "Country", "name": "Saudi Arabia" },
        { "@type": "Country", "name": "United Arab Emirates" },
        { "@type": "Country", "name": "Kuwait" },
        { "@type": "Country", "name": "Qatar" },
        { "@type": "Country", "name": "Bahrain" },
        { "@type": "Country", "name": "Oman" },
      ],
    };

    const bodyHtml = `
      ${breadcrumbHtml(breadcrumbItems)}
      
      <h1>حسابات كلاش أوف كلانس للبيع والشراء</h1>

      ${townHallBannersHtml()}

      <!-- المقدمة الشاملة حول القسم والمخزون -->
      <section style="margin: 28px 0 36px; line-height: 1.9;">
        <p style="font-size: 1.1rem; color: #cbd5e1; margin-bottom: 16px;">
          مرحباً بك في القسم الرئيسي لـ <strong>بيع وشراء حسابات كلاش أوف كلانس</strong> داخل <strong>متجر كلاش ماركت</strong> — وجهتك المتخصصة في المملكة العربية السعودية ودول الخليج العربي لاقتناء أقوى القريات الجاهزة والمفحوصة بعناية. سواء كنت تطمح للمنافسة المباشرة في أعلى مراتب دوري الأساطير (Legend League) باقتناء <em>قرية كلاش أوف كلانس تاون هول 18 ماكس</em>، أو ترغب في الحصول على حساب متقدم بسعر اقتصادي ميسر يجنبك سنوات طويلة من أوقات البناء وتكاليف ترقية الأبطال، فإن متجرنا يقدم لك تشكيلة منتقاة تلبي كافة الاحتياجات.
        </p>
        <p style="color: #94a3b8; margin-bottom: 16px;">
          تتميز جميع <strong>حسابات كلاش أوف كلانس المعروضة للبيع</strong> بشفافية كاملة في سرد البيانات والمواصفات: مستوى التاون هول، مستويات الأبطال الستة (الملك البربري، الملكة رامية السهام، الحكيم الكبير، البطلة الملكية، أمير المينيون، ودوق التنين)، العتاد الملحمي والعادي (Hero Equipment)، مستويات ترقية القوات والتعويذات في المختبر، رصيد الجواهر، وسجل الحساب. كما نوفر خيارات سداد مرنة تشمل التحويل البنكي المباشر والتقسيط الميسر على 4 دفعات عبر تابي وتمارا، إلى جانب تسليم يدوي فوري ومباشر عبر الواتساب وفق سياسة المتجر المعتمدة.
        </p>
      </section>

      <!-- حسابات كلاش المميزة -->
      ${featuredAccounts.length ? featuredHtml : ""}

      <!-- جميع الحسابات المتاحة للشراء الفوري -->
      <section style="margin: 36px 0;">
        <h2>جميع حسابات كلاش أوف كلانس المتاحة للشراء الفوري</h2>
        <p style="color: #94a3b8; margin-bottom: 20px;">
          استعرض أدناه قريات كلاش أوف كلانس المتوفرة حالياً في المخزون. تتضمن كل بطاقة تفاصيل المستوى، مستوى التاون هول، السعر بالريال السعودي، وحالة التوفر مع إمكانية الانتقال لصفحة الحساب التفصيلية:
        </p>
        ${accountsHtml}
      </section>

      <!-- حسابات كلاش أوف كلانس حسب تاون هول -->
      <section style="margin: 44px 0;">
        <h2>حسابات كلاش أوف كلانس حسب تاون هول</h2>
        <p style="color: #94a3b8; margin-bottom: 20px;">
          يمثل مستوى التاون هول (Town Hall) المعيار الرئيسي لتحديد القوة الهجومية والدفاعية لأي قرية في كلاش أوف كلانس. فيما يلي استعراض تفصيلي للفئات الرئيسية المتوفرة في المتجر، مع روابط مباشرة لتصفح قريات كل مستوى على حدة:
        </p>

        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin-top:0; color:#f8fafc;">حسابات تاون هول 18 (TH18 Max) — القمة التنافسية للعبة</h3>
          <p style="color:#94a3b8; line-height:1.8;">
            يمثل تاون هول 18 أحدث وأعلى مستوى تطوير في كلاش أوف كلانس (صدر أواخر عام 2025). يتيح هذا المستوى الاستفادة من أحدث الأسلحة الدفاعية المدمجة، وأعلى سقف لتطوير الأبطال والحيوانات الأليفة، بالإضافة إلى القدرة القصوى على دمج العتاد الملحمي المطور بالكامل. تناسب هذه الفئة محترفي بطولات Clan War Leagues التنافسية واللاعبين المتطلعين لتصدر تصنيف دوري الأساطير فوراً دون انتظار شهور من أعمال البناء.
          </p>
          <a class="cta" href="/clash-of-clans/town-hall-18" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:8px 18px; margin-top:8px;">استعراض حسابات تاون هول 18 ←</a>
        </div>

        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin-top:0; color:#f8fafc;">حسابات تاون هول 17 (TH17) — القوة النارية والتوازن التكتيكي</h3>
          <p style="color:#94a3b8; line-height:1.8;">
            تقدم قريات تاون هول 17 توليفة استثنائية تجمع بين الفعالية الحربية الهجومية العالية والدفاعات الصلبة مع تكلفة شراء معتدلة مقارنة بتاون 18. تشمل هذه القريات ترقيات قوية لمدفع النسر المدافع والأبراج المتعددة، وتتيح المشاركة بكفاءة ممتازة في حروب الكلانات الكبرى مع إمكانية الترقية لتاون 18 مستقبلاً بخطوات يسيرة.
          </p>
          <a class="cta" href="/clash-of-clans/town-hall-17" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:8px 18px; margin-top:8px;">استعراض حسابات تاون هول 17 ←</a>
        </div>

        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin-top:0; color:#f8fafc;">حسابات تاون هول 16 (TH16) — الدفاعات المدمجة ونظام المعدات الحديث</h3>
          <p style="color:#94a3b8; line-height:1.8;">
            شكّل تاون هول 16 نقلة محورية في تاريخ اللعبة بإدخال الدفاعات المدمجة مثل المدافع المرتدة (Ricochet Cannons) وأبراج السهام المتعددة (Multi-Archer Towers)، فضلاً عن تدشين نظام عتاد الأبطال (Hero Equipment). تمثل قريات TH16 الخيار الأنسب للاعبين الباحثين عن حساب منافس وبسعر اقتصادي في متناول الجميع.
          </p>
          <a class="cta" href="/clash-of-clans/town-hall-16" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:8px 18px; margin-top:8px;">استعراض حسابات تاون هول 16 ←</a>
        </div>

        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin-top:0; color:#f8fafc;">حسابات تاون هول 15 (TH15) وما قبله — انطلاقة اقتصادية ممتازة للمبتدئين</h3>
          <p style="color:#94a3b8; line-height:1.8;">
            إذا كنت عائداً للعبة كلاش أوف كلانس بعد انقطاع أو تبدأ مسيرتك التنافسية بميزانية محدودة، فإن قريات تاون هول 15 و14 توفر لك دفاعات قوية مثل برج التعويذات والمونوليث (Monolith) والأبطال الأربعة الأساسيين بأسعار اقتصادية تبدأ من مبالغ ميسرة للغاية.
          </p>
          <a class="cta" href="/clash-of-clans/town-hall-15" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:8px 18px; margin-top:8px;">استعراض حسابات تاون هول 15 ←</a>
        </div>

        <div style="display:flex; gap:12px; flex-wrap:wrap; margin:24px 0 12px;">
          <a class="cta" href="/clash-of-clans/town-hall-18" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">قريات تاون هول 18</a>
          <a class="cta" href="/clash-of-clans/town-hall-17" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">قريات تاون هول 17</a>
          <a class="cta" href="/clash-of-clans/town-hall-16" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">قريات تاون هول 16</a>
          <a class="cta" href="/clash-of-clans/town-hall-15" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">قريات تاون هول 15</a>
        </div>
      </section>

      <!-- بيع وشراء حسابات كلاش أوف كلانس: معايير فحص وتقييم الحساب -->
      <section style="margin: 44px 0; line-height: 1.9;">
        <h2>بيع وشراء حسابات كلاش أوف كلانس: معايير فحص وتقييم الحساب</h2>
        <p style="color: #94a3b8;">
          عند الإقبال على <strong>شراء حساب كلاش أوف كلانس</strong>، لا ينبغي الاكتفاء بالنظر إلى شكل القرية العام أو عدد الكؤوس فقط. هناك حزمة من المؤشرات الجوهرية التي تحدد القيمة الحقيقية للقرية وأداءها الفعلي في الحروب:
        </p>

        <ul style="line-height:2; color:#cbd5e1; margin:16px 0;">
          <li>
            <strong>مستوى التاون هول والبنية الدفاعية:</strong> الدفاعات المركزية (مدفع النسر، أبراج النار، أبراج الرميات المتعددة، المونوليث، وأبراج السم) تلعب الدور الحاسم في حماية النجوم ضد الهجمات التنافسية.
          </li>
          <li>
            <strong>مستويات الأبطال (Heroes):</strong> تشكل ترقيات الأبطال — الملك البربري، الملكة رامية السهام، الحكيم الكبير، والبطلة الملكية — أكثر من 60% من قوة الهجوم الحربي. وصول الأبطال للحد الأقصى يوفر مئات الأيام من جرعات البناء وتجميد الأبطال.
          </li>
          <li>
            <strong>معدات الأبطال (Hero Equipment):</strong> أصبح نظام العتاد هو المحرك الأساسي للفوز بالهجمات الثلاث نجوم. تنقسم المعدات إلى عادية (Common Equipment بحد أقصى مستوى 18) وملحمية (Epic Equipment مثل Giant Gauntlet و Frozen Arrow و Fireball و Rocket Boots بحد أقصى مستوى 27). تطلب ترقية العتاد كميات هائلة من الخامات (Ores) النادرة، مما يجعل الحسابات ذات العتاد الماكس ذات قيمة استثمارية ممتازة.
          </li>
          <li>
            <strong>ترقيات المختبر (Laboratory) والحيوانات الأليفة (Pets):</strong> اكتمال ترقيات القوات الميتا مثل راكبي الجذور (Root Riders)، الرماة الخارقين، والتعويذات الأساسية، إلى جانب لفلات حيوانات الدعم كالثعلب الروحي (Spirit Fox) وديغي والفينيق.
          </li>
          <li>
            <strong>رصيد الجواهر والسكنات والمظهر:</strong> توفر الجواهر المرصودة، السكنات الحصرية المكتسبة من تذاكر الذهب، وثيمات القرى النادرة (Sceneries) ميزة جمالية وراحة مستقبلية لتغيير الاسم وتسريع الترقيات.
          </li>
        </ul>

        <p style="color:#94a3b8;">
          للمزيد من الشرح التخصصي، ننصح بالاطلاع على <a href="/blog/clash-of-clans-town-hall-levels-buying-guide" style="color:#f59e0b; font-weight:600;">دليل مستويات التاون هول وأفضل قرية للشراء</a> المتوفر في مدونتنا.
        </p>
      </section>

      <!-- كيف تختار حساب كلاش أوف كلانس المناسب لميزانيتك؟ -->
      <section style="margin: 44px 0; line-height: 1.9;">
        <h2>كيف تختار حساب كلاش أوف كلانس المناسب لميزانيتك؟</h2>
        <p style="color: #94a3b8;">
          اختيار القرية الملائمة يوازن بين متطلباتك الشخصية وميزانيتك المحددة. إليك المنهجية الموصى بها لاختيار الحساب الأمثل:
        </p>

        <ol style="line-height:2; color:#cbd5e1; margin:16px 0;">
          <li><strong>حدد دورك في الكلان والحروب:</strong> إذا كنت تنوي خوض حروب CWL في تصنيفات الماستر والأبطال، فالأولوية تكون لحسابات TH17 أو TH18 لضمان صد الهجمات. أما للمشاركة العادية، فتاون 16 أو 15 يكفي وزيادة.</li>
          <li><strong>قيّم جاهزية الأبطال قبل الجدران:</strong> ترقية الجدران تتطلب موارد فقط، بينما ترقية الأبطال تعطل قدرتك على الهجوم لشهور. احرص دائماً على اختيار قرية بأبطال مطورين حتى لو كانت بعض الجدران لم تكتمل بعد.</li>
          <li><strong>اختر بين الماكس التام وشبه الماكس:</strong> الحساب شبه الماكس يمنحك 90-95% من قوة القرية بتكلفة توفر ما بين 30% إلى 40% من السعر، وهو خيار ذكي لمن يرغب بإكمال ما تبقى بنفسه.</li>
          <li><strong>احسب القيمة مقابل الوقت:</strong> شراء قرية متقدمة (${priceSummaryText}) يوفر عليك ما يعادل سنوات من أوقات البناء والتجميع اليومي المتواصل ومئات آلاف الموارد.</li>
          <li><strong>تحقق من ضمان المتجر ونظافة البريد:</strong> الشراء من جهة موثوقة تطبق نقل ملكية Supercell ID وتفعيل حماية الحساب (Account Protection) يحميك من أي مخاطر استرجاع أو نزاع.</li>
        </ol>
      </section>

      <!-- الفرق بين حساب كلاش ماكس وحساب شبه ماكس -->
      <section style="margin: 44px 0; line-height: 1.9;">
        <h2>الفرق بين حساب كلاش ماكس وحساب شبه ماكس</h2>
        <p style="color: #94a3b8;">
          يتكرر السؤال بين المشترين حول الفرق الجوهري بين قريات الماكس وقريات شبه الماكس. يوضح الجدول والتفاصيل التالية الفروقات العملية:
        </p>

        <div style="overflow-x:auto; margin: 20px 0;">
          <table style="width:100%; border-collapse:collapse; background:#1e293b; border-radius:10px; overflow:hidden; border:1px solid #334155;">
            <thead>
              <tr style="background:#0f172a; border-bottom:1px solid #334155; text-align:right;">
                <th style="padding:14px; color:#f8fafc;">المعيار</th>
                <th style="padding:14px; color:#f59e0b;">حساب كلاش ماكس (Full Max)</th>
                <th style="padding:14px; color:#38bdf8;">حساب كلاش شبه ماكس (Semi Max)</th>
              </tr>
            </thead>
            <tbody style="color:#cbd5e1;">
              <tr style="border-bottom:1px solid #334155;">
                <td style="padding:12px; font-weight:700;">المباني الدفاعية</td>
                <td style="padding:12px;">مكتملة بالكامل للحد الأقصى للتاون</td>
                <td style="padding:12px;">الدفاعات الأساسية مكتملة مع بقاء دفاعات ثانوية</td>
              </tr>
              <tr style="border-bottom:1px solid #334155;">
                <td style="padding:12px; font-weight:700;">الأبطال والعتاد</td>
                <td style="padding:12px;">جميع الأبطال والعتاد الملحمي عند الحد الأقصى</td>
                <td style="padding:12px;">الأبطال عند مستويات عالية مع ترقية العتاد الأساسي</td>
              </tr>
              <tr style="border-bottom:1px solid #334155;">
                <td style="padding:12px; font-weight:700;">الأسوار والجدران</td>
                <td style="padding:12px;">مكتملة ومطورة بالكامل للفل الأخير</td>
                <td style="padding:12px;">جدران متقدمة مع وجود جزء يحتاج موارد إضافية</td>
              </tr>
              <tr style="border-bottom:1px solid #334155;">
                <td style="padding:12px; font-weight:700;">الجهوزية الحربية</td>
                <td style="padding:12px;">جاهزية فورية بنسبة 100% لأقوى البطولات</td>
                <td style="padding:12px;">جاهزية حربية تتجاوز 90% لمعظم تشكيلات الميتا</td>
              </tr>
              <tr>
                <td style="padding:12px; font-weight:700;">مستوى السعر</td>
                <td style="padding:12px;">سعر ممتاز يعكس ندرة واكتمال الحساب</td>
                <td style="padding:12px;">سعر اقتصادي منافس ومناسب لمختلف الميزانيات</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ما الذي يحدد أسعار حسابات كلاش أوف كلانس؟ -->
      <section style="margin: 44px 0; line-height: 1.9;">
        <h2>ما الذي يحدد أسعار حسابات كلاش أوف كلانس؟</h2>
        <p style="color: #94a3b8;">
          تعتمد سياسة التسعير في <strong>متجر كلاش ماركت</strong> على معايير موضوعية مستمدة مباشرة من مواصفات كل قرية كما هي مسجلة في قاعدة بيانات الحسابات:
        </p>

        <ul style="line-height:2; color:#cbd5e1; margin:16px 0;">
          <li><strong>مستوى تاون هول والتقدم الزمني:</strong> الحسابات ذات مستويات التاون هول المتقدمة تتطلب أعلى قدر من الاستثمار الزمني، وتتحدد أسعارها المعروضة في المتجر (${priceSummaryText}) وفق درجة اكتمال الأبطال والدفاعات والعتاد الملحمي.</li>
          <li><strong>مستويات التاون هول الأسبق:</strong> قريات التاون هول الأسبق كتاون 16 و15 تعرض بأسعار اقتصادية تنافسية تتيح دخولاً سريعاً للساحة التنافسية بأقل تكلفة ممكنة.</li>
          <li><strong>العتاد الملحمي وتطويرات الخامات:</strong> المعدات الملحمية مثل Gauntlet و Frozen Arrow تحتاج استثماراً مكثفاً في حروب Clan Wars لتجميع خامات Starry Ores، مما ينعكس مباشرة على قيمة القرية.</li>
          <li><strong>الرصيد المالي المتاح والملحقات:</strong> عدد الجواهر غير المستهلكة، ومستوى القرية الليلية (Builder Base 2.0)، ومظهر القرية وعاصمتها يمثل قيمة مضافة حقيقية للمشتري.</li>
        </ul>

        <p style="color:#94a3b8;">
          جميع الأسعار معلنة بالريال السعودي بكل شفافية على كل بطاقة حساب بدون أي رسوم خفية، مع إمكانية توزيع القيمة على 4 دفعات بدون فوائد عبر خدمتي تابي وتمارا بالتنسيق عبر الواتساب.
        </p>
      </section>

      <!-- سياسات المتجر والشفافية وخطوات التسليم الآمن -->
      <section style="margin: 44px 0; line-height: 1.9;">
        <h2>سياسات المتجر والشفافية وخطوات التسليم الآمن</h2>
        <p style="color: #94a3b8;">
          نعتمد في كلاش ماركت آلية التسليم اليدوي المباشر خطوة بخطوة مع المشتري عبر محادثة واتساب مخصصة لضمان أقصى درجات الطمأنينة والأمان:
        </p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px; margin:24px 0;">
          <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:18px;">
            <div style="display:inline-block; width:32px; height:32px; background:#f59e0b; color:#0f172a; border-radius:50%; text-align:center; line-height:32px; font-weight:800; margin-bottom:12px;">1</div>
            <h3 style="margin:0 0 8px; font-size:1.1rem; color:#f8fafc;">اختيار القرية والتواصل</h3>
            <p style="color:#94a3b8; font-size:0.95rem; margin:0;">اختر الحساب المناسب لك من المتجر واضغط على زر التواصل بالواتساب، وسيقوم فريق الدعم بالرد الفوري وتأكيد توفر الحساب وتفاصيله.</p>
          </div>

          <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:18px;">
            <div style="display:inline-block; width:32px; height:32px; background:#f59e0b; color:#0f172a; border-radius:50%; text-align:center; line-height:32px; font-weight:800; margin-bottom:12px;">2</div>
            <h3 style="margin:0 0 8px; font-size:1.1rem; color:#f8fafc;">الاتفاق وسداد القيمة</h3>
            <p style="color:#94a3b8; font-size:0.95rem; margin:0;">الاتفاق على وسيلة السداد المفضلة عبر التحويل البنكي المباشر أو التقسيط الميسر عبر تابي وتمارا على 4 دفعات.</p>
          </div>

          <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:18px;">
            <div style="display:inline-block; width:32px; height:32px; background:#f59e0b; color:#0f172a; border-radius:50%; text-align:center; line-height:32px; font-weight:800; margin-bottom:12px;">3</div>
            <h3 style="margin:0 0 8px; font-size:1.1rem; color:#f8fafc;">نقل بريد Supercell ID</h3>
            <p style="color:#94a3b8; font-size:0.95rem; margin:0;">نقوم بتغيير البريد الإلكتروني المربوط بـ Supercell ID إلى بريدك الشخصي الخاص مباشرة واستلام رمز التحقق لتوثيق الملكية.</p>
          </div>

          <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:18px;">
            <div style="display:inline-block; width:32px; height:32px; background:#f59e0b; color:#0f172a; border-radius:50%; text-align:center; line-height:32px; font-weight:800; margin-bottom:12px;">4</div>
            <h3 style="margin:0 0 8px; font-size:1.1rem; color:#f8fafc;">تأمين الحساب برقم هاتفك</h3>
            <p style="color:#94a3b8; font-size:0.95rem; margin:0;">تفعيل ميزة حماية الحساب (Account Protection) برقم هاتفك الشخصي وتسليمك رموز الاسترداد الاحتياطية (Recovery Codes).</p>
          </div>
        </div>

        <p style="color:#94a3b8;">
          للاطلاع على تفاصيل سياساتنا، راجع <a href="/guarantee" style="color:#f59e0b; font-weight:600;">وثيقة سياسة الضمان</a> و<a href="/how-it-works" style="color:#f59e0b; font-weight:600;">دليل طريقة الشراء والتسليم</a>، إضافة إلى شروحاتنا المتخصصة: <a href="/blog/how-to-change-supercell-id-email-guide" style="color:#f59e0b; font-weight:600;">دليل تغيير إيميل Supercell ID</a> و<a href="/blog/clash-of-clans-account-ban-reasons-protection-guide" style="color:#f59e0b; font-weight:600;">دليل حماية الحساب وتجنب الحظر</a>.
        </p>
      </section>

      <!-- إشعار الاستقلالية وإخلاء المسؤولية القانونية بخصوص Supercell -->
      <div style="margin: 36px 0; padding: 22px; background: rgba(30, 41, 59, 0.7); border: 1px solid #475569; border-radius: 12px; line-height: 1.8;">
        <h3 style="margin-top:0; color:#f8fafc; font-size:1.15rem; display:flex; align-items:center; gap:8px;">
          ⚖️ إشعار الاستقلالية والشفافية القانونية بخصوص شركة Supercell
        </h3>
        <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:10px;">
          يؤكد متجر <strong>كلاش ماركت (ClashMarket)</strong> أنه جهة ومنصة وسيطة مستقلة تماماً، ولا يتبع لشركة <strong>Supercell Oy</strong> ولا يحظى بأي رعاية أو ترخيص أو اعتماد رسمي منها بأي شكل من الأشكال. كافة العلامات التجارية والأسماء والشعارات والرسومات المتعلقة بلعبة Clash of Clans هي ملكية حصرية لشركة Supercell Oy.
        </p>
        <p style="color:#94a3b8; font-size:0.95rem; margin:0;">
          تنص بنود وشروط خدمة شركة Supercell الحالية على حظر بيع وشراء ومشاركة حسابات الألعاب. نذكر هذه المعلومة بكل أمانة وشفافية لجميع عملائنا دون تضليل؛ ولا يدعي المتجر أن هذه العمليات مسموح بها من قِبل الشركة المطورة. دور كلاش ماركت ينحصر في كونه وسيطاً مستقلاً يقدم خدمات الفحص الفني اليدوي، والمساعدة في نقل ملكية البريد الإلكتروني، وتأمين الحسابات بالتعاون مع المشتري للحد من أي مخاطر تقنية وفق سياسة الضمان المحددة في الموقع.
        </p>
      </div>

      <!-- الأسئلة الشائعة حول حسابات كلاش أوف كلانس -->
      <section style="margin: 44px 0;">
        <h2>أسئلة شائعة حول حسابات كلاش أوف كلانس</h2>
        <p style="color:#94a3b8; margin-bottom:20px;">
          إليك إجابات شاملة ومباشرة على أكثر الاستفسارات والأسئلة الشائعة حول بيع وشراء قريات كلاش أوف كلانس وضماناتها وآلية نقل الملكية:
        </p>
        ${faqHtml}
      </section>

      <!-- دعوة للتنقل وروابط أقسام المتجر -->
      <div style="text-align:center; margin: 44px 0 24px; padding: 28px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;">
        <h3 style="margin-top:0; color:#f8fafc; font-size:1.3rem;">هل تلعب كلاش رويال أيضاً؟</h3>
        <p style="color:#94a3b8; max-width:600px; margin:0 auto 16px;">
          نوفر أيضاً تشكيلة واسعة من حسابات كلاش رويال بكروت وإيفو ماكس وتطورات متقدمة بتسليم فوري وضمان شامل.
        </p>
        <a class="cta" href="/clash-royale" style="background:#2563eb; color:#fff; font-size:1rem; padding:12px 24px;">تصفح حسابات كلاش رويال ←</a>
      </div>

      <p><a class="back-link" href="/">← العودة للصفحة الرئيسية</a></p>
    `;

    const html = pageShell({
      title,
      description,
      canonicalPath,
      bodyHtml,
      jsonLd: [breadcrumbJsonLd(breadcrumbItems), collectionJsonLd, storeJsonLd, faqJsonLd, accountItemListJsonLd(title, allAccounts)].filter(Boolean) as object[],
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render Clash of Clans page");
    res.status(500).send("Internal server error");
  }
});

// -------------------------------------------------------------
// 2. صفحة قسم كلاش رويال الرئيسية (/clash-royale)
// -------------------------------------------------------------
router.get("/clash-royale", async (req, res) => {
  try {
    const [featuredAccounts, allAccounts] = await Promise.all([
      db
        .select()
        .from(accountsTable)
        .where(and(
          eq(accountsTable.game, "clash-royale"),
          eq(accountsTable.status, "available"),
          eq(accountsTable.featured, true)
        ))
        .orderBy(desc(accountsTable.id)),
      db
        .select()
        .from(accountsTable)
        .where(and(
          eq(accountsTable.game, "clash-royale"),
          eq(accountsTable.status, "available")
        ))
        .orderBy(desc(accountsTable.id)),
    ]);

    const featuredHtml = featuredAccounts.length
      ? `
        <div style="margin: 28px 0 40px; padding: 24px; background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 16px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
            <h2 style="margin:0; font-size:1.4rem; color:#f8fafc;">⭐ حسابات كلاش رويال المميزة</h2>
            <span style="color:#ef4444; font-size:0.9rem; font-weight:600;">كروت وإيفو ماكس ومضمونة</span>
          </div>
          <div class="grid-list" style="margin:0;">${featuredAccounts.map(accountCardHtml).join("")}</div>
        </div>
      `
      : "";

    const accountsHtml = allAccounts.length
      ? `<div class="grid-list">${allAccounts.map(accountCardHtml).join("")}</div>`
      : `<p>لا توجد حسابات كلاش رويال متاحة حالياً.</p>`;

    const title = "متجر كلاش رويال | بيع وشراء حسابات كلاش رويال في السعودية والخليج";
    const description = "اشترِ حسابات كلاش رويال بكروت Level 16 وتطورات Evolutions بتسليم يدوي فوري وضمان وفق سياسة المتجر. كلاش ماركت — متجر حسابات كلاش رويال في السعودية والخليج.";

    const crBreadcrumbItems = [
      { name: SITE_NAME, path: "/" },
      { name: "حسابات كلاش رويال", path: "/clash-royale" },
    ];

    const crFaqItems = [
      { q: "كيف أشتري حساب كلاش رويال من كلاش ماركت؟", a: "اختر الحساب المناسب من القائمة، تواصل عبر الواتساب مع إدارة المتجر، ويتم نقل ملكية Supercell ID وتغيير البريد الإلكتروني وتأمين الحساب برقمك خلال دقائق." },
      { q: "ما مستوى البطاقات في حسابات كلاش رويال المعروضة؟", a: "نوفر حسابات تتراوح بين Level 14 و Level 16 (أعلى مستوى حالياً). مستوى البطاقات يؤثر مباشرة على قوتك في السلم التنافسي وRanked Mode." },
      { q: "هل حسابات كلاش رويال تحتوي على تطورات (Evolutions)؟", a: "حسب الحساب — بعض الحسابات تحتوي على عدد كبير من التطورات المفعّلة. تفاصيل كل حساب مذكورة في صفحته." },
      { q: "ما الضمان المتاح عند شراء حساب كلاش رويال؟", a: "وفق سياسة المتجر، يتم تسليم الإيميل الأساسي وتفعيل حماية الحساب (Account Protection) على رقمك، مع متابعة بعد البيع." },
      { q: "هل يمكن ترتيب الدفع بالتقسيط؟", a: "نعم، يمكن التنسيق مع إدارة المتجر عبر الواتساب لترتيب الدفع عبر تابي أو تمارا على 4 دفعات." },
    ];

    const crFaqHtml = crFaqItems.map(f => `<details style="border:1px solid #334155; border-radius:8px; margin-bottom:8px;"><summary style="padding:12px; cursor:pointer; font-weight:600; color:#f8fafc;">${escapeHtml(f.q)}</summary><p style="padding:0 12px 12px; color:#94a3b8; line-height:1.8;">${escapeHtml(f.a)}</p></details>`).join("");

    const crFaqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: crFaqItems.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const bodyHtml = `
      ${breadcrumbHtml(crBreadcrumbItems)}
      <h1>حسابات كلاش رويال للبيع</h1>
      <p>يوفر كلاش ماركت حسابات كلاش رويال جاهزة للمنافسة في السلم التنافسي وRanked Mode. كلاش رويال لعبة مختلفة تماماً عن كلاش أوف كلانس — التقدم فيها يعتمد على مستوى البطاقات والتطورات والأبطال وليس على مباني القرية.</p>

      ${featuredHtml}

      <h2>حسابات كلاش رويال المتاحة الآن</h2>
      ${accountsHtml}

      <h2>ما الذي يميز حساب كلاش رويال المتقدم؟</h2>
      <ul style="line-height:2;">
        <li><strong>مستوى البطاقات</strong> — أقصى مستوى حالياً هو Level 16. الحساب بعدد كبير من البطاقات Level 16 يعطي مرونة أكبر في بناء التشكيلات.</li>
        <li><strong>تطورات البطاقات (Evolutions)</strong> — نسخ محسّنة من البطاقات تضيف قدرات جديدة. يوجد أكثر من 40 تطور حالياً.</li>
        <li><strong>الأبطال والتشامبيونز</strong> — نظام Champions (مثل Archer Queen وGolden Knight وSkeleton King) بالإضافة إلى نظام Heroes الأحدث.</li>
        <li><strong>التقدم التنافسي</strong> — الكؤوس، الأداء في Ranked Mode (المعروف سابقاً بـPath of Legends)، ومستوى King Tower.</li>
      </ul>

      <h2>ما الذي تفحصه قبل شراء حساب رويال؟</h2>
      <ul style="line-height:2;">
        <li><strong>عدد البطاقات في Level 16</strong> — كلما زاد العدد، زادت خياراتك التنافسية.</li>
        <li><strong>التطورات المفعّلة</strong> — التطورات الأساسية ضرورية للمنافسة.</li>
        <li><strong>الكؤوس وأعلى موسم</strong> — يعطيك فكرة عن المستوى الحقيقي للحساب.</li>
        <li><strong>حالة Supercell ID</strong> — تأكد أن الحساب يأتي مع البريد الأساسي.</li>
      </ul>

      <h2>كيف يتم تسليم حساب كلاش رويال؟</h2>
      <p>عملية شراء حساب كلاش رويال تتم بنفس آلية التسليم اليدوي المباشر — تتواصل مع إدارة المتجر عبر الواتساب، ويتم نقل بريد Supercell ID وتأمين الحساب على جهازك.</p>
      <p>للاطلاع على خطوات نقل الإيميل: <a href="/blog/how-to-change-supercell-id-email-guide" style="color:#f59e0b;">دليل تغيير إيميل Supercell ID</a>. ولتفاصيل سياسة المتجر: <a href="/guarantee" style="color:#f59e0b;">سياسة الضمان وحماية المشتري</a>.</p>

      <h2>أسئلة شائعة حول شراء حسابات كلاش رويال</h2>
      ${crFaqHtml}

      <div style="text-align:center; margin-top:40px;">
        <a class="cta" href="/clash-of-clans" style="margin-left:12px;">تصفح قريات كلاش أوف كلانس</a>
      </div>
      <p><a class="back-link" href="/">← العودة للصفحة الرئيسية</a></p>
    `;

    const html = pageShell({
      title,
      description,
      canonicalPath: "/clash-royale",
      bodyHtml,
      jsonLd: [breadcrumbJsonLd(crBreadcrumbItems), crFaqJsonLd, accountItemListJsonLd(title, allAccounts)].filter(Boolean) as object[],
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render Clash Royale page");
    res.status(500).send("Internal server error");
  }
});

// -------------------------------------------------------------
// 3. 301 Redirect for legacy direct subcategory URLs:
// /town-hall-18 -> /clash-of-clans/town-hall-18
// /town-hall-17 -> /clash-of-clans/town-hall-17
// /town-hall-16 -> /clash-of-clans/town-hall-16
// /town-hall-15 -> /clash-of-clans/town-hall-15
// -------------------------------------------------------------
router.get("/town-hall-:level", (req, res) => {
  const level = req.params.level;
  if (["15", "16", "17", "18"].includes(level)) {
    return res.redirect(301, `/clash-of-clans/town-hall-${level}`);
  }
  res.status(404).send("الصفحة غير موجودة");
});

export default router;