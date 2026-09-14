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
}) {
  const img = a.images && a.images.length > 0 ? a.images[0] : "";
  return `
    <a class="card" href="/account/${escapeHtml(a.slug)}">
      ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(a.title)}" loading="lazy" />` : ""}
      <div class="card-body">
        <div class="card-title">${escapeHtml(a.title)}</div>
        <div class="card-price">${Number(a.price).toLocaleString("ar-SA")} ر.س</div>
      </div>
    </a>`;
}

// 1. صفحة قسم كلاش أوف كلانس
router.get("/clash-of-clans", async (req, res) => {
  try {
    const accounts = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.game, "clash-of-clans"), eq(accountsTable.status, "available")))
      .orderBy(desc(accountsTable.id));

    const accountsHtml = accounts.length
      ? `<div class="grid-list">${accounts.map(accountCardHtml).join("")}</div>`
      : `<p>لا توجد حسابات كلاش أوف كلانس متاحة حالياً.</p>`;

    const title = `حسابات كلاش أوف كلانس للبيع | متجر كلاش ماركت`;
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
      <p>يوفر كلاش ماركت قريات وحسابات كلاش أوف كلانس جاهزة للمنافسة، بمستويات تاون هول تبدأ من 14 وحتى 18. جميع الحسابات تم فحصها يدوياً قبل طرحها، ويتم التسليم بشكل مباشر عبر الواتساب مع نقل ملكية Supercell ID وتأمين الحساب على جهاز المشتري.</p>

      <h2>قريات وحسابات كلاش المتاحة الآن</h2>
      ${accountsHtml}

      <h2>ما الذي يحدد قيمة حساب كلاش أوف كلانس؟</h2>
      <p>ليس كل حساب بنفس تاون هول يحمل نفس القيمة. هناك عدة عوامل:</p>
      <ul style="line-height:2;">
        <li><strong>مستوى التاون هول</strong> — أعلى تاون حالياً هو TH18 الذي صدر في نوفمبر 2025.</li>
        <li><strong>مستوى الأبطال</strong> — اللعبة تحتوي على 6 أبطال: الملك، الملكة، الحكيم الكبير، البطلة الملكية، أمير المينيون، ودوق التنين.</li>
        <li><strong>معدات الأبطال (Hero Equipment)</strong> — تتراوح بين معدات عادية (حتى لفل 18) ومعدات ملحمية (حتى لفل 27).</li>
        <li><strong>التقدم التنافسي</strong> — الجواهر، السكنات، دوري الأساطير، عاصمة الكلان.</li>
      </ul>
      <p>للتفاصيل: <a href="/blog/clash-of-clans-town-hall-levels-buying-guide" style="color:#f59e0b;">دليل مستويات التاون هول وأفضل قرية للشراء</a>.</p>

      <h2>كيف تختار التاون هول المناسب؟</h2>
      <ul style="line-height:2;">
        <li><strong>TH14 أو TH15</strong> — خيار اقتصادي جيد لدخول حروب القبائل بتكلفة معقولة.</li>
        <li><strong>TH16 أو TH17</strong> — يناسب اللاعب الذي يريد المراحل المتقدمة من CWL ودوري الأساطير.</li>
        <li><strong>TH18 ماكس</strong> — الخيار الأعلى حالياً للاعب المحترف.</li>
      </ul>

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
      jsonLd: [breadcrumbJsonLd(breadcrumbItems), faqJsonLd],
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render Clash of Clans page");
    res.status(500).send("Internal server error");
  }
});

// 2. صفحة قسم كلاش رويال
router.get("/clash-royale", async (req, res) => {
  try {
    const accounts = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.game, "clash-royale"), eq(accountsTable.status, "available")))
      .orderBy(desc(accountsTable.id));

    const accountsHtml = accounts.length
      ? `<div class="grid-list">${accounts.map(accountCardHtml).join("")}</div>`
      : `<p>لا توجد حسابات كلاش رويال متاحة حالياً.</p>`;

    const title = `حسابات كلاش رويال للبيع | كروت ماكس وإيفو — كلاش ماركت`;
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

      <h2>حسابات كلاش رويال المتاحة الآن</h2>
      ${accountsHtml}

      <h2>ما الذي يميز حساب كلاش رويال المتقدم؟</h2>
      <ul style="line-height:2;">
        <li><strong>مستوى البطاقات</strong> — أقصى مستوى حالياً هو Level 16 (صدر في نوفمبر 2025). الحساب بعدد كبير من البطاقات Level 16 يعطي مرونة أكبر في بناء التشكيلات.</li>
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

      <h2>الاستلام والأمان</h2>
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
      jsonLd: [breadcrumbJsonLd(crBreadcrumbItems), crFaqJsonLd],
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to render Clash Royale page");
    res.status(500).send("Internal server error");
  }
});

export default router;