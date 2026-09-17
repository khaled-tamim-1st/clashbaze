import { Router } from "express";
import { db, accountsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { escapeHtml, pageShell, breadcrumbHtml, breadcrumbJsonLd, SITE_NAME, SITE_URL } from "../lib/pageshell";

const router = Router();

function accountCardHtml(a: {
  slug: string;
  title: string;
  price: string | number;
  images: string[] | null;
  featured?: boolean | null;
}) {
  const img = a.images && a.images.length > 0 ? a.images[0] : "";
  return `
    <a class="card" href="/account/${escapeHtml(a.slug)}">
      ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(a.title)}" loading="lazy" />` : ""}
      <div class="card-body">
        ${a.featured ? `<span class="featured-badge">⭐ حساب مميز</span>` : ""}
        <div class="card-title">${escapeHtml(a.title)}</div>
        <div class="card-price">${Number(a.price).toLocaleString("ar-SA")} ر.س</div>
      </div>
    </a>`;
}

// Visual banners helper for Town Hall categories
function townHallBannersHtml() {
  return `
    <div style="margin:24px 0 36px; display:flex; flex-direction:column; gap:20px;">
      <div style="border:1px solid #334155; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.2);">
        <a href="/clash-of-clans/town-hall-18" style="display:block;">
          <img src="/banners/th18-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 18 للبيع" width="1024" height="393" style="width:100%; height:auto; display:block; aspect-ratio:1024/393; object-fit:cover;" loading="eager" />
        </a>
      </div>
      <div style="border:1px solid #334155; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.2);">
        <a href="/clash-of-clans/town-hall-17" style="display:block;">
          <img src="/banners/th17-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 17 للبيع" width="1024" height="393" style="width:100%; height:auto; display:block; aspect-ratio:1024/393; object-fit:cover;" loading="eager" />
        </a>
      </div>
      <div style="border:1px solid #334155; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.2);">
        <a href="/clash-of-clans/town-hall-16" style="display:block;">
          <img src="/banners/th16-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 16 للبيع" width="1024" height="393" style="width:100%; height:auto; display:block; aspect-ratio:1024/393; object-fit:cover;" loading="lazy" />
        </a>
      </div>
      <div style="border:1px solid #334155; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.2);">
        <a href="/clash-of-clans/town-hall-15" style="display:block;">
          <img src="/banners/th15-banner.png" alt="حسابات كلاش أوف كلانس تاون هول 15 للبيع" width="1024" height="393" style="width:100%; height:auto; display:block; aspect-ratio:1024/393; object-fit:cover;" loading="lazy" />
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
            <h2 style="margin:0; font-size:1.4rem; color:#f8fafc; display:flex; align-items:center; gap:10px;"><img src="/images/barbarian-king.png" alt="الملك البربري" width="36" height="36" style="width:36px; height:36px; object-fit:contain; vertical-align:middle;" /> حسابات كلاش أوف كلانس المميزة</h2>
            <span style="color:#f59e0b; font-size:0.9rem; font-weight:600;">مختارة بعناية ومضمونة</span>
          </div>
          <div class="grid-list" style="margin:0;">${featuredAccounts.map(accountCardHtml).join("")}</div>
        </div>
      `
      : "";

    const accountsHtml = allAccounts.length
      ? `<div class="grid-list">${allAccounts.map(accountCardHtml).join("")}</div>`
      : `<p>لا توجد حسابات كلاش أوف كلانس متاحة حالياً.</p>`;

    const title = "متجر كلاش أوف كلانس | بيع وشراء حسابات كلاش أوف كلانس في السعودية والخليج";
    const description = "اشترِ حسابات وقرى كلاش أوف كلانس (تاون هول 14 إلى 18) بتسليم يدوي مباشر وضمان وفق سياسة المتجر. كلاش ماركت — متجر حسابات كلاش في السعودية والخليج.";

    const breadcrumbItems = [
      { name: SITE_NAME, path: "/" },
      { name: "حسابات كلاش أوف كلانس", path: "/clash-of-clans" },
    ];

    const faqItems = [
      { q: "كيف أشتري حساب كلاش أوف كلانس من كلاش ماركت؟", a: "اختر القرية المناسبة من القائمة، اضغط على زر الواتساب، ونتواصل معك مباشرة لإتمام نقل ملكية Supercell ID وتغيير البريد الإلكتروني وتأمين الحساب برقمك خلال دقائق." },
      { q: "ما الذي يضمنه المتجر عند شراء حساب كلاش؟", a: "وفق سياسة المتجر، جميع الحسابات تخضع لفحص يدوي قبل البيع، ويتم تسليم الإيميل الأساسي مع تغيير كلمة السر وتفعيل حماية الحساب (Account Protection) على رقم المشتري." },
      { q: "هل تتوفر حسابات بأسعار مختلفة تناسب الميزانيات المتوسطة؟", a: "نعم، تتراوح الحسابات بين تاون هول 14 وحتى تاون 18 بأسعار مختلفة." },
      { q: "كم يستغرق تسليم الحساب بعد الدفع؟", a: "عادة يتم التسليم خلال دقائق من إتمام الدفع، حيث يتم نقل الإيميل وتأمين الحساب في جلسة واتساب واحدة مباشرة." },
      { q: "هل يمكن دفع ثمن الحساب بالتقسيط؟", a: "نعم، يمكن ترتيب الدفع عبر تابي أو تمارا بالتنسيق المباشر مع إدارة المتجر عبر الواتساب." },
      { q: "ما الفرق بين حساب ماكس وحساب شبه ماكس؟", a: "الحساب الماكس يكون فيه جميع المباني والقوات والأبطال والمعدات على أعلى مستوى متاح لتاون هوله. الحساب شبه الماكس قد تنقصه بعض التطويرات الأخيرة، لكنه يظل تنافسياً وبسعر أقل." },
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
      <h1>حسابات كلاش أوف كلانس للبيع</h1>
      ${townHallBannersHtml()}

      <h2>حسابات كلاش أوف كلانس المميزة</h2>
      ${featuredAccounts.length ? featuredHtml : accountsHtml}

      <h2>ما الذي يحدد قيمة حساب كلاش أوف كلانس؟</h2>
      <ul style="line-height:2;">
        <li><strong>مستوى التاون هول</strong> — أعلى تاون حالياً هو TH18 الذي يضم أحدث الدفاعات والأبطال.</li>
        <li><strong>مستوى الأبطال</strong> — اللعبة تحتوي على أبطال متعددي المهام: الملك، الملكة، الحكيم الكبير، والبطلة الملكية.</li>
        <li><strong>معدات الأبطال (Hero Equipment)</strong> — تتراوح بين معدات عادية ومعدات ملحمية مطورة.</li>
        <li><strong>التقدم التنافسي</strong> — الجواهر، السكنات، دوري الأساطير، وعاصمة الكلان.</li>
      </ul>
      <p>للتفاصيل: <a href="/blog/clash-of-clans-town-hall-levels-buying-guide" style="color:#f59e0b;">دليل مستويات التاون هول وأفضل قرية للشراء</a>.</p>

      <h2>قريات كلاش أوف كلانس — تصفح حسب تاون هول</h2>
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin:16px 0 28px;">
        <a class="cta" href="/clash-of-clans/town-hall-18" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">قريات تاون هول 18</a>
        <a class="cta" href="/clash-of-clans/town-hall-17" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">قريات تاون هول 17</a>
        <a class="cta" href="/clash-of-clans/town-hall-16" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">قريات تاون هول 16</a>
        <a class="cta" href="/clash-of-clans/town-hall-15" style="background:#1e293b; color:#f8fafc; border:1px solid #334155; font-size:0.95rem; padding:10px 20px;">قريات تاون هول 15</a>
      </div>

      <h2>الفحص والتسليم وإجراءات الأمان</h2>
      <ol style="line-height:2;">
        <li>تختار القرية وتتواصل عبر الواتساب.</li>
        <li>الاتفاق على طريقة الدفع (تحويل بنكي أو ترتيب التقسيط عبر تابي/تمارا).</li>
        <li>نقل بريد Supercell ID إلى بريدك الشخصي.</li>
        <li>تغيير كلمة السر وتفعيل حماية الحساب (Account Protection) برقمك.</li>
        <li>تسلّم رموز الاسترداد (Recovery Codes).</li>
      </ol>
      <p>راجع <a href="/blog/how-to-change-supercell-id-email-guide" style="color:#f59e0b;">دليل تغيير إيميل Supercell ID</a> و<a href="/blog/clash-of-clans-account-ban-reasons-protection-guide" style="color:#f59e0b;">دليل حماية القرية وتجنب المخالفات</a>. اطلع على <a href="/guarantee" style="color:#f59e0b;">سياسة الضمان</a> و<a href="/how-it-works" style="color:#f59e0b;">طريقة الشراء والتسليم</a>.</p>

      <h2>أسئلة شائعة حول شراء حسابات كلاش أوف كلانس</h2>
      ${faqHtml}

      <div style="text-align:center; margin-top:40px;">
        <a class="cta" href="/clash-royale" style="background:#2563eb; color:#fff; margin-left:12px;">تصفح حسابات كلاش رويال</a>
      </div>
      <p><a class="back-link" href="/">← العودة للصفحة الرئيسية</a></p>
    `;

    const html = pageShell({
      title,
      description,
      canonicalPath: "/clash-of-clans",
      bodyHtml,
      jsonLd: [breadcrumbJsonLd(breadcrumbItems), faqJsonLd, accountItemListJsonLd(title, allAccounts)].filter(Boolean) as object[],
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