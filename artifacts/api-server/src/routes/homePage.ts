import { Router } from "express";
import { db, accountsTable, blogTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { escapeHtml, pageShell, SITE_NAME, SITE_URL } from "../lib/pageshell";

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

router.get("/", async (req, res) => {
  try {
    // 1. جلب البيانات باستخدام قيم enum الصحيحة في قاعدة البيانات ("clash-of-clans" و "clash-royale")
    const [cocAccounts, royaleAccounts, latestPosts] = await Promise.all([
      db
        .select()
        .from(accountsTable)
        .where(and(eq(accountsTable.game, "clash-of-clans"), eq(accountsTable.status, "available")))
        .orderBy(desc(accountsTable.featured), desc(accountsTable.id))
        .limit(6),
      db
        .select()
        .from(accountsTable)
        .where(and(eq(accountsTable.game, "clash-royale"), eq(accountsTable.status, "available")))
        .orderBy(desc(accountsTable.featured), desc(accountsTable.id))
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

    const title = `كلاش ماركت | حسابات كلاش للبيع - قريات كلاش أوف كلانس وكلاش رويال`;
    const description =
      "حسابات كلاش للبيع وقريات كلاش أوف كلانس تاون 16 و17 و18 ماكس وحسابات كلاش رويال كروت ماكس. متجر كلاش ماركت الموثوق في السعودية والخليج - أسعار رخيصة وتسليم فوري وضمان كامل.";

    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        alternateName: ["Clash Market", "كلاش ماركت أونلاين", "clashmarket.online"],
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
              text: "بعد اختيار الحساب المناسب، تضغط على زر شراء عبر الواتساب، يتواصل معك الوسيط المعتمد ويتم نقل ملكية السوبر سيل آيدي (Supercell ID) وتغيير البريد الإلكتروني وتفعيل الحماية بخطوتين برقمك فوراً وبأمان 100%."
            }
          },
          {
            "@type": "Question",
            name: "ما هي طرق الدفع المتاحة في السعودية ودول الخليج؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "نوفر كافة طرق الدفع المحلية المعتمدة: مدى (Mada)، تابي (Tabby)، تمارا (Tamara) للتقسيط، Apple Pay، تحويل بنكي سعودي وخليجي مباشر، والبطاقات الائتمانية (Visa / MasterCard)."
            }
          },
          {
            "@type": "Question",
            name: "هل الحسابات المعروضة في كلاش ماركت مضمونة؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "نعم، جميع الحسابات مفحوصة وموثقة مع ضمان كامل ضد السحب أو الاسترجاع، ووساطة رسمية تضمن حقوق المشتري والبائع."
            }
          },
          {
            "@type": "Question",
            name: "كم يستغرق تسليم الحساب بعد إتمام الدفع؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "التسليم فوري ومباشر، عادةً يستغرق من 5 إلى 15 دقيقة لإتمام نقل الحساب وتأكيده معك خطوة بخطوة."
            }
          },
          {
            "@type": "Question",
            name: "هل يمكنني بيع حسابي عبر متجر كلاش ماركت؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "نعم، يمكنك التواصل معنا عبر الواتساب لعرض مواصفات حسابك وتقييمه وعرضه للمشترين بعمولة وساطة رمزية وأمان تام."
            }
          }
        ]
      }
    ];

    const bodyHtml = `
      <h1>${escapeHtml(SITE_NAME)} | حسابات كلاش للبيع في السعودية والخليج</h1>
      <p>${description}</p>

      <section style="margin: 32px 0;">
        <h2>قريات وحسابات كلاش أوف كلانس للبيع (تاون 16 و17 و18 ماكس)</h2>
        <p>تصفح أقوى قريات كلاش تاون هول 15، 16، 17، و18 ماكس ليفل، أبطال ماكس، ودفاعات قوية جاهزة للحروب والدوريات في السعودية والخليج.</p>
        ${cocHtml}
        <p><a href="/clash-of-clans" class="cta">استعراض كافة حسابات كلاش أوف كلانس ←</a></p>
      </section>

      <section style="margin: 48px 0;">
        <h2>حسابات كلاش رويال للبيع (كروت ماكس وتطورات بطاقات)</h2>
        <p>تشكيلات ماكس، ساحات دوري الأبطال، إيموتات نادرة، وتطويرات بطاقات كاملة (Evolutions) مع تسليم فوري وضمان كامل.</p>
        ${royaleHtml}
        <p><a href="/clash-royale" class="cta">استعراض كافة حسابات كلاش رويال ←</a></p>
      </section>

      <section style="margin: 48px 0; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
        <h2>لماذا تختار كلاش ماركت في السعودية ودول الخليج؟</h2>
        <ul style="color: #cbd5e1; padding-right: 20px; line-height: 2;">
          <li><strong>أمان وضمان 100%:</strong> فحص دقيق لكل حساب والتأكد من ربط السوبر سيل آيدي وتغيير الإيميل بسلاسة.</li>
          <li><strong>طرق دفع مرنة ومحلية:</strong> دعم مدى، تابي، تمارا، Apple Pay، التحويل البنكي، والبطاقات الائتمانية.</li>
          <li><strong>دعم مباشر وسريع:</strong> إتمام المعاملات فورياً والتواصل المباشر عبر الواتساب دون تعقيد.</li>
          <li><strong>أسعار تنافسية:</strong> تقييم عادل للقرى والحسابات بناءً على السوق الخليجي والعربي.</li>
        </ul>
      </section>

      <section style="margin: 48px 0; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
        <h2>الأسئلة الشائعة حول بيع وشراء حسابات كلاش</h2>
        
        <div style="margin-top: 16px; border-bottom: 1px solid #334155; padding-bottom: 16px;">
          <h3 style="font-size: 1.15rem; color: #f59e0b; margin-bottom: 8px;">س: كيف تتم عملية شراء ونقل حساب كلاش أوف كلانس أو كلاش رويال؟</h3>
          <p style="color: #cbd5e1; margin: 0;">بعد اختيار الحساب المناسب، تضغط على زر شراء عبر الواتساب، يتواصل معك الوسيط المعتمد ويتم نقل ملكية السوبر سيل آيدي وتغيير البريد الإلكتروني وتفعيل الحماية برقمك فوراً وبأمان 100%.</p>
        </div>

        <div style="margin-top: 16px; border-bottom: 1px solid #334155; padding-bottom: 16px;">
          <h3 style="font-size: 1.15rem; color: #f59e0b; margin-bottom: 8px;">س: ما هي طرق الدفع المتاحة في السعودية ودول الخليج؟</h3>
          <p style="color: #cbd5e1; margin: 0;">نوفر كافة طرق الدفع المحلية المعتمدة: مدى، تابي، تمارا للتقسيط، Apple Pay، تحويل بنكي سعودي وخليجي مباشر، والبطاقات الائتمانية (Visa / MasterCard).</p>
        </div>

        <div style="margin-top: 16px; border-bottom: 1px solid #334155; padding-bottom: 16px;">
          <h3 style="font-size: 1.15rem; color: #f59e0b; margin-bottom: 8px;">س: هل الحسابات المعروضة في كلاش ماركت مضمونة؟</h3>
          <p style="color: #cbd5e1; margin: 0;">نعم، جميع الحسابات مفحوصة وموثقة مع ضمان كامل ضد السحب أو الاسترجاع، ووساطة رسمية تضمن حقوق المشتري والبائع.</p>
        </div>

        <div style="margin-top: 16px; border-bottom: 1px solid #334155; padding-bottom: 16px;">
          <h3 style="font-size: 1.15rem; color: #f59e0b; margin-bottom: 8px;">س: كم يستغرق تسليم الحساب بعد إتمام الدفع؟</h3>
          <p style="color: #cbd5e1; margin: 0;">التسليم فوري ومباشر، عادةً يستغرق من 5 إلى 15 دقيقة لإتمام نقل الحساب وتأكيده معك خطوة بخطوة.</p>
        </div>

        <div style="margin-top: 16px;">
          <h3 style="font-size: 1.15rem; color: #f59e0b; margin-bottom: 8px;">س: هل يمكنني بيع حسابي عبر متجر كلاش ماركت؟</h3>
          <p style="color: #cbd5e1; margin: 0;">نعم، يمكنك التواصل معنا عبر الواتساب لعرض مواصفات حسابك وتقييمه وعرضه للمشترين بعمولة وساطة رمزية وأمان تام.</p>
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

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err: any) {
    req.log.error({ err }, "Failed to render home page");
    res.status(500).send("Internal server error");
  }
});

export default router;