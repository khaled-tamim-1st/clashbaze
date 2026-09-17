import { Router } from "express";
import { db, accountsTable, blogTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { escapeHtml, pageShell, SITE_NAME, SITE_URL } from "../lib/pageshell";

const router = Router();

const statusPriorityOrder = sql`CASE 
  WHEN ${accountsTable.status} = 'available' THEN 1 
  WHEN ${accountsTable.status} = 'reserved' THEN 2 
  WHEN ${accountsTable.status} = 'sold' THEN 3 
  ELSE 4 
END ASC`;

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
  images: string[] | null;
  status?: string | null;
}) {
  const rawImg = a.images && a.images.length > 0 ? a.images[0] : "";
  const img = formatCloudinaryUrl(rawImg);
  const isSold = a.status === "sold";
  const isReserved = a.status === "reserved";
  const badgeHtml = isSold
    ? `<span style="position:absolute; top:8px; right:8px; background:#dc2626; color:#fff; font-size:0.75rem; font-weight:800; padding:2px 8px; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.4); z-index:2;">تم البيع</span>`
    : isReserved
    ? `<span style="position:absolute; top:8px; right:8px; background:#d97706; color:#fff; font-size:0.75rem; font-weight:800; padding:2px 8px; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.4); z-index:2;">محجوز</span>`
    : "";
  return `
    <a class="card" href="/account/${escapeHtml(a.slug)}" style="${isSold ? "opacity:0.88;" : ""} position:relative;">
      ${badgeHtml}
      <div style="position:relative; width:100%; height:180px; overflow:hidden; background:#0f172a;">
        ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(a.title)}" loading="lazy" style="width:100%; height:180px; object-fit:cover; display:block;" />` : ""}
        ${isSold ? `<div style="position:absolute; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center;"><span style="background:#dc2626; color:#ffffff; font-weight:800; font-size:0.85rem; padding:4px 12px; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.5); transform:rotate(-4deg); border:1px solid #ef4444;">تم البيع</span></div>` : ""}
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(a.title)}</div>
        <div class="card-price">${Number(a.price).toLocaleString("ar-SA")} ر.س</div>
      </div>
    </a>`;
}

// In-memory HTML cache for homepage (60s TTL) to reduce TTFB to under 10ms
let cachedHomeHtml: string | null = null;
let cachedHomeTime = 0;
const HOME_CACHE_TTL_MS = 60 * 1000;

router.get("/", async (req, res) => {
  try {
    const now = Date.now();
    if (cachedHomeHtml && now - cachedHomeTime < HOME_CACHE_TTL_MS) {
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("X-Cache", "HIT");
      res.send(cachedHomeHtml);
      return;
    }
    // 1. جلب البيانات باستخدام قيم enum الصحيحة في قاعدة البيانات ("clash-of-clans" و "clash-royale")
    const [cocAccounts, royaleAccounts, latestPosts] = await Promise.all([
      db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.game, "clash-of-clans"))
        .orderBy(statusPriorityOrder, desc(accountsTable.featured), desc(accountsTable.id))
        .limit(6),
      db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.game, "clash-royale"))
        .orderBy(statusPriorityOrder, desc(accountsTable.featured), desc(accountsTable.id))
        .limit(6),
      db.select().from(blogTable).orderBy(desc(blogTable.createdAt)).limit(3),
    ]);

    const cocHtml = cocAccounts.length
      ? `<div class="grid-list">${cocAccounts.map(accountCardHtml).join("")}</div>`
      : `<p>لا توجد حسابات كلاش أوف كلانس متاحة حاليًا.</p>`;

    const royaleHtml = royaleAccounts.length
      ? `<div class="grid-list">${royaleAccounts.map(accountCardHtml).join("")}</div>`
      : `<p>لا توجد حسابات كلاش رويال متاحة حاليًا.</p>`;

    const blogHtml = latestPosts.length
      ? `<ul class="post-list">${latestPosts
          .map(
            (p) => `<li>
              <a class="post-title" href="/blog/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>
              <div class="meta">${new Date(p.createdAt).toLocaleDateString("ar-EG")}</div>
            </li>`,
          )
          .join("")}</ul>`
      : "";

    const allAccounts = [...cocAccounts, ...royaleAccounts];

    const title = `متجر كلاش | بيع وشراء حسابات كلاش في السعودية والخليج`;
    const description =
      "متجر كلاش ماركت الأول لبيع وشراء حسابات كلاش اوف كلانس وحسابات كلاش رويال في السعودية والخليج. متجر كلاش موثوق بتسليم فوري وضمان شامل.";

    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        alternateName: ["Clash Market", "متجر كلاش", "clashmarket.online"],
        url: SITE_URL || "https://www.clashmarket.online/",
        inLanguage: "ar-SA",
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL || "https://www.clashmarket.online/",
        logo: `${SITE_URL}/thumbnail.png`,
        description,
        areaServed: [
          { "@type": "Country", "name": "Saudi Arabia" },
          { "@type": "Country", "name": "United Arab Emirates" },
          { "@type": "Country", "name": "Kuwait" },
          { "@type": "Country", "name": "Qatar" },
          { "@type": "Country", "name": "Bahrain" },
          { "@type": "Country", "name": "Oman" }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "أحدث حسابات كلاش للبيع في السعودية والخليج",
        itemListElement: allAccounts.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/account/${a.slug}`,
          name: a.title,
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "كيف تتم عملية شراء ونقل حساب كلاش أوف كلانس أو كلاش رويال؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "بعد اختيار الحساب المناسب، تضغط على زر شراء عبر الواتساب، نتواصل معك مباشرة من إدارة المتجر ويتم نقل ملكية السوبر سيل آيدي (Supercell ID) وتغيير البريد الإلكتروني وتفعيل الحماية بخطوتين برقمك فوراً وبأمان 100%."
            }
          },
          {
            "@type": "Question",
            name: "ما هي طرق الدفع المتاحة في السعودية ودول الخليج؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "نقبل التحويل البنكي المباشر للحسابات السعودية والخليجية، بالإضافة إلى إمكانية الدفع والتقسيط عبر تابي (Tabby) وتمارا (Tamara)؛ حيث يتم الاتفاق على الطريقة المناسبة والتسليم يدوياً ومباشرة عبر الواتساب بكل سهولة وأمان."
            }
          },
          {
            "@type": "Question",
            name: "هل الحسابات المعروضة في كلاش ماركت مضمونة؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "نعم، جميع الحسابات مملوكة ومفحوصة يدوياً ومشمولة بوثيقة الضمان الذهبي ضد السحب أو الاسترجاع مدى الحياة، مع تسليم الإيميل الأساسي النظيف."
            }
          },
          {
            "@type": "Question",
            name: "كم يستغرق تسليم الحساب بعد إتمام الدفع؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "التسليم يدوي وفوري عبر الواتساب فور إتمام الاتفاق، حيث يستغرق عادةً من 5 إلى 15 دقيقة لإتمام نقل البريد وتأمين الحساب على جهازك خطوة بخطوة."
            }
          },
          {
            "@type": "Question",
            name: "هل يمكنني بيع حسابي لمتجر كلاش ماركت؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "نعم، نحن نشتري الحسابات القوية والمميزة كاش ومباشرة! يمكنك التواصل معنا عبر الواتساب لعرض مواصفات حسابك وسنقوم بفحصه وتقييمه وشرائه منك بأفضل سعر مع تحويل مالي سريع."
            }
          }
        ]
      }
    ];

    const bodyHtml = `
      <h1>متجر كلاش</h1>
      <p>${description}</p>

      <h2>حسابات كلاش للبيع</h2>

      <section style="margin: 32px 0;">
        <h2>حسابات كلاش أوف كلانس للبيع</h2>
        <p>تصفح أقوى قريات كلاش تاون هول 15، 16، 17، و18 ماكس ليفل، أبطال ماكس، ودفاعات قوية جاهزة للحروب والدوريات في السعودية والخليج.</p>
        ${cocHtml}
        <p><a href="/clash-of-clans" class="cta">استعراض كافة حسابات كلاش أوف كلانس ←</a></p>
      </section>

      <section style="margin: 48px 0;">
        <h2>حسابات كلاش رويال للبيع</h2>
        <p>تشكيلات ماكس، ساحات دوري الأبطال، إيموتات نادرة، وتطويرات بطاقات كاملة (Evolutions) مع تسليم فوري وضمان كامل.</p>
        ${royaleHtml}
        <p><a href="/clash-royale" class="cta">استعراض كافة حسابات كلاش رويال ←</a></p>
      </section>

      <section style="margin: 48px 0; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
        <h2>لماذا تختار كلاش ماركت في السعودية ودول الخليج؟</h2>
        <ul style="color: #cbd5e1; padding-right: 20px; line-height: 2;">
          <li><strong>أمان وضمان ذهبي:</strong> فحص يدوي لكل حساب والتأكد من ربط السوبر سيل آيدي وتغيير الإيميل الأساسي بسلاسة.</li>
          <li><strong>طرق دفع متعددة:</strong> تحويل بنكي مباشر لحسابات سعودية وخليجية، مع إمكانية الدفع والتقسيط عبر تابي وتمارا بالاتفاق المباشر.</li>
          <li><strong>تسليم يدوي مباشر:</strong> إتمام المعاملات خطوة بخطوة والتواصل المباشر عبر الواتساب مع إدارة المتجر.</li>
          <li><strong>أسعار تنافسية:</strong> تقييم عادل للقرى والحسابات بناءً على السوق الخليجي والعربي.</li>
        </ul>
      </section>

      <section style="margin: 48px 0; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
        <h2>الأسئلة الشائعة حول بيع وشراء حسابات كلاش</h2>
        
        <div style="margin-top: 16px; border-bottom: 1px solid #334155; padding-bottom: 16px;">
          <h3 style="font-size: 1.15rem; color: #f59e0b; margin-bottom: 8px;">س: كيف تتم عملية شراء ونقل حساب كلاش أوف كلانس أو كلاش رويال؟</h3>
          <p style="color: #cbd5e1; margin: 0;">بعد اختيار الحساب المناسب، تضغط على زر شراء عبر الواتساب، نتواصل معك مباشرة من إدارة المتجر ويتم نقل ملكية السوبر سيل آيدي وتغيير البريد الإلكتروني وتفعيل الحماية برقمك فوراً وبأمان 100%.</p>
        </div>

        <div style="margin-top: 16px; border-bottom: 1px solid #334155; padding-bottom: 16px;">
          <h3 style="font-size: 1.15rem; color: #f59e0b; margin-bottom: 8px;">س: ما هي طرق الدفع المتاحة في السعودية ودول الخليج؟</h3>
          <p style="color: #cbd5e1; margin: 0;">نقبل التحويل البنكي المباشر للحسابات السعودية والخليجية، بالإضافة إلى إمكانية الدفع والتقسيط عبر تابي (Tabby) وتمارا (Tamara)؛ حيث يتم الاتفاق على الطريقة المناسبة والتسليم يدوياً ومباشرة عبر الواتساب بكل سهولة وأمان.</p>
        </div>

        <div style="margin-top: 16px; border-bottom: 1px solid #334155; padding-bottom: 16px;">
          <h3 style="font-size: 1.15rem; color: #f59e0b; margin-bottom: 8px;">س: هل الحسابات المعروضة في كلاش ماركت مضمونة؟</h3>
          <p style="color: #cbd5e1; margin: 0;">نعم، جميع الحسابات مملوكة ومفحوصة يدوياً ومشمولة بوثيقة الضمان الذهبي ضد السحب أو الاسترجاع مدى الحياة، مع تسليم الإيميل الأساسي النظيف.</p>
        </div>

        <div style="margin-top: 16px; border-bottom: 1px solid #334155; padding-bottom: 16px;">
          <h3 style="font-size: 1.15rem; color: #f59e0b; margin-bottom: 8px;">س: كم يستغرق تسليم الحساب بعد إتمام الدفع؟</h3>
          <p style="color: #cbd5e1; margin: 0;">التسليم يدوي وفوري عبر الواتساب فور إتمام الاتفاق، حيث يستغرق عادةً من 5 إلى 15 دقيقة لإتمام نقل البريد وتأمين الحساب على جهازك خطوة بخطوة.</p>
        </div>

        <div style="margin-top: 16px;">
          <h3 style="font-size: 1.15rem; color: #f59e0b; margin-bottom: 8px;">س: هل يمكنني بيع حسابي لمتجر كلاش ماركت؟</h3>
          <p style="color: #cbd5e1; margin: 0;">نعم، نحن نشتري الحسابات القوية والمميزة كاش ومباشرة! يمكنك التواصل معنا عبر الواتساب لعرض مواصفات حسابك وسنقوم بفحصه وتقييمه وشرائه منك بأفضل سعر مع تحويل مالي سريع.</p>
        </div>
      </section>

      ${latestPosts.length ? `
      <section style="margin: 48px 0;">
        <h2>أحدث مقالات ونصائح ألعاب سوبر سيل</h2>
        <p>شروحات استراتيجيات الهجوم، تصاميم القرى، وتحديثات كلاش أولاً بأول.</p>
        ${blogHtml}
        <p><a href="/blog" class="back-link">زيارة مدونة كلاش ماركت للمزيد من الشروحات ←</a></p>
      </section>` : ""}
    `;

    const html = pageShell({
      title,
      description,
      canonicalPath: "/",
      ogImage: `${SITE_URL}/thumbnail.png`,
      bodyHtml,
      jsonLd,
    });

    cachedHomeHtml = html;
    cachedHomeTime = Date.now();

    res.set("Content-Type", "text/html; charset=utf-8");
    res.set("X-Cache", "MISS");
    res.send(html);
  } catch (err: any) {
    req.log.error({ err }, "Failed to render home page");
    res.status(500).send("Internal server error");
  }
});

export default router;