import { Router } from "express";
import { db, reviewsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { SITE_NAME, SITE_URL, escapeHtml, pageShell, breadcrumbHtml, breadcrumbJsonLd } from "../lib/pageshell";

const router = Router();

function generateStars(rating: number, size = 18) {
  const fullStar = `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="width:${size}px;height:${size}px;min-width:${size}px;display:inline-block;vertical-align:middle;color:#f59e0b;fill:#f59e0b;" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
  const emptyStar = `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="width:${size}px;height:${size}px;min-width:${size}px;display:inline-block;vertical-align:middle;color:#475569;fill:#475569;" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
  
  let stars = `<span style="display:inline-flex;gap:3px;align-items:center;">`;
  for (let i = 1; i <= 5; i++) {
    stars += i <= rating ? fullStar : emptyStar;
  }
  stars += `</span>`;
  return stars;
}

const verifiedBadge = `
  <span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#34d399;background:rgba(52,211,153,0.12);padding:2px 8px;border-radius:9999px;border:1px solid rgba(52,211,153,0.25);">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;display:inline-block;"><path d="M20 6L9 17l-5-5"></path></svg>
    <span>مشتري معتمد</span>
  </span>
`;

router.get("/reviews", async (req, res) => {
  try {
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.status, "approved"))
      .orderBy(desc(reviewsTable.createdAt));

    const totalReviews = reviews.length;
    let averageRating = 5.0;
    
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = sum / totalReviews;
    }

    const breadcrumbItems = [
      { name: "كلاش ماركت", path: "/" },
      { name: "آراء وتقييمات العملاء", path: "/reviews" }
    ];

    let cardsHtml = "";

    if (totalReviews === 0) {
      cardsHtml = `
        <div style="text-align:center;padding:48px 20px;background:#1e293b;border-radius:20px;border:1px solid #334155;">
          <h2 style="font-size:1.25rem;font-weight:700;color:#f1f5f9;margin-bottom:8px;">لا توجد تقييمات منشورة بعد</h2>
          <p style="color:#94a3b8;font-size:0.95rem;">كن أول من يشارك تجربته مع متجر كلاش ماركت.</p>
        </div>
      `;
    } else {
      const itemsHtml = reviews.map(review => {
        const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : "";
        const gameName = review.game === "clash-royale" ? "كلاش رويال" : "كلاش أوف كلانس";
        const initial = review.customerName ? review.customerName.trim().charAt(0) : "ع";
        
        return `
          <article class="review-card" style="background:#1e293b;border:1px solid #334155;border-radius:18px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;">
                ${generateStars(review.rating, 18)}
                ${verifiedBadge}
              </div>
              <p style="color:#e2e8f0;font-size:0.95rem;line-height:1.75;margin:0 0 16px;white-space:pre-line;">
                "${escapeHtml(review.comment)}"
              </p>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid rgba(148,163,184,0.15);">
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;border-radius:50%;background:rgba(245,158,11,0.15);color:#f59e0b;font-weight:700;font-size:15px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(245,158,11,0.3);flex-shrink:0;">
                  ${escapeHtml(initial)}
                </div>
                <div>
                  <div style="font-weight:700;color:#f8fafc;font-size:0.9rem;">${escapeHtml(review.customerName)}</div>
                  <div style="color:#94a3b8;font-size:0.75rem;">${escapeHtml(gameName)}</div>
                </div>
              </div>
              <time style="color:#64748b;font-size:0.75rem;" datetime="${review.createdAt ? new Date(review.createdAt).toISOString() : ''}">
                ${date}
              </time>
            </div>
          </article>
        `;
      }).join("");

      cardsHtml = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(310px, 1fr));gap:20px;margin-bottom:48px;">
          ${itemsHtml}
        </div>
      `;
    }

    // SEO Rich Structured Data
    const storeSchema = {
      "@context": "https://schema.org",
      "@type": "Store",
      name: "كلاش ماركت",
      url: SITE_URL,
      image: `${SITE_URL}/thumbnail.png`,
      description: "متجر كلاش ماركت الموثوق في السعودية والخليج لبيع وشراء حسابات كلاش أوف كلانس وكلاش رويال بأمان وضمان شامل وتسليم فوري.",
      ...(totalReviews > 0 ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: averageRating.toFixed(1),
          bestRating: "5",
          worstRating: "1",
          ratingCount: totalReviews,
        },
        review: reviews.slice(0, 15).map(r => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.customerName },
          datePublished: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          reviewBody: r.comment,
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: "5",
            worstRating: "1"
          }
        }))
      } : {}),
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "هل متجر كلاش ماركت موثوق وآمن لشراء الحسابات؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، يعتبر متجر كلاش ماركت متجراً موثوقاً في المملكة العربية السعودية ودول الخليج. تتم كافة عمليات النقل والبيع يدوياً وبإشراف مباشر مع العميل عبر الواتساب، وتخضع الحسابات لفحص أمني شامل قبل عرضها لضمان خلوها من أي ارتباطات سابقة."
          }
        },
        {
          "@type": "Question",
          name: "ما هي شروط وسياسة الضمان الذهبي في كلاش ماركت؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نوفر وثيقة الضمان الذهبي الشامل التي تحمي المشتري بنسبة 100% ضد السحب أو الاسترجاع مدى الحياة. يتم تسليم الحساب بإيميل أساسي نظيف مع نقل ملكية السوبر سيل آيدي وتفعيل التحقق بخطوتين برقم المشتري الخاص."
          }
        },
        {
          "@type": "Question",
          name: "كيف يضمن المتجر عدم استرجاع أو سحب الحساب بعد البيع؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "يقوم فريق المتجر بتسليم المشتري البريد الأساسي للحساب، تغيير كافة معلومات الأمان والبريد البديل، حذف كافة الأجهزة المسجلة مسبقاً، وتوليد أكواد استرداد أمان جديدة مخصصة للمشتري فقط."
          }
        },
        {
          "@type": "Question",
          name: "كم يستغرق تسليم الحساب وما هي طرق الدفع المتاحة؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "التسليم يدوي وفوري ويستغرق من 5 إلى 15 دقيقة فقط عبر الواتساب. نقبل التحويل البنكي لحسابات سعودية وخليجية، بالإضافة إلى خيارات التقسيط عبر تابي وتمارا بالاتفاق المباشر."
          }
        },
        {
          "@type": "Question",
          name: "كيف أشارك تقييمي وتجربتي بعد شراء حساب؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "يمكنك الدخول إلى صفحة آراء العملاء والضغط على زر أضف تقييمك الآن، وإدخال اسمك الكريم ورأيك وتقييمك بالنجوم؛ حيث تتم مراجعة التقييم واعتماده ليظهر في قائمة آراء العملاء."
          }
        }
      ]
    };

    const jsonLdData = [
      breadcrumbJsonLd(breadcrumbItems),
      storeSchema,
      faqSchema
    ];

    const bodyHtml = `
      <div style="max-width:1100px;margin:0 auto;padding:24px 16px 80px;">
        ${breadcrumbHtml(breadcrumbItems)}
        
        <!-- Header & Stats Summary -->
        <header style="text-align:center;margin-bottom:36px;background:none;border:none;padding:0;">
          <h1 style="font-size:2rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.3;">
            آراء وتقييمات عملاء متجر كلاش ماركت
          </h1>
          <p style="color:#94a3b8;font-size:1.05rem;max-width:680px;margin:0 auto 24px;line-height:1.7;">
            تجارب حقيقية موثقة من لاعبين ومحبين لكلاش أوف كلانس وكلاش رويال وثقوا في متجر كلاش ماركت لتسليم ونقل حساباتهم بأمان وضمان رسمي.
          </p>

          <div style="display:inline-flex;align-items:center;gap:16px;background:linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95));padding:16px 28px;border-radius:20px;border:1px solid rgba(245,158,11,0.3);box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);">
            <div style="font-size:2.5rem;font-weight:900;color:#f59e0b;line-height:1;">
              ${averageRating.toFixed(1)}
            </div>
            <div style="text-align:right;">
              <div style="margin-bottom:4px;">
                ${generateStars(Math.round(averageRating), 20)}
              </div>
              <div style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">
                بناءً على ${totalReviews} تقييم موثق من المشترين
              </div>
            </div>
          </div>
        </header>

        <!-- Reviews Cards Grid -->
        <section aria-label="تقييمات المشترين">
          ${cardsHtml}
        </section>

        <!-- Trust, Safety & Golden Guarantee Detailed Editorial Section (High SEO Impact) -->
        <section style="background:#1e293b;border:1px solid #334155;border-radius:24px;padding:36px 28px;margin-bottom:40px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="text-align:center;max-width:700px;margin:0 auto 32px;">
            <span style="display:inline-block;font-size:12px;font-weight:700;color:#f59e0b;background:rgba(245,158,11,0.15);padding:4px 14px;border-radius:9999px;border:1px solid rgba(245,158,11,0.3);margin-bottom:12px;">
              معايير الثقة والأمان في كلاش ماركت
            </span>
            <h2 style="font-size:1.6rem;font-weight:800;color:#f8fafc;margin:0 0 10px;">
              هل متجر كلاش ماركت موثوق؟ ما هي ضمانات الشراء؟
            </h2>
            <p style="color:#94a3b8;font-size:0.95rem;line-height:1.7;margin:0;">
              يدرك فريق متجر كلاش ماركت أن قرار شراء أو بيع حساب لعبة يتطلب ثقة مطلقة وحماية كاملة؛ ولهذا السبب تم تصميم نظامنا ليكون الأكثر أماناً وموثوقية في السوق الخليجي والعربي.
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:20px;margin-bottom:32px;">
            <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:22px;">
              <h3 style="color:#f59e0b;font-size:1.1rem;font-weight:700;margin:0 0 8px;">1. وثيقة الضمان الذهبي الشامل</h3>
              <p style="color:#94a3b8;font-size:0.9rem;line-height:1.7;margin:0;">
                جميع الحسابات المعروضة في المتجر تخضع لوثيقة الضمان الذهبي ضد السحب أو الاسترجاع مدى الحياة. في حال حدوث أي خلل يخالف شروط الاتفاق، نلتزم بالتعويض المباشر أو توفير بديل يطابق مواصفات طلبك.
              </p>
            </div>

            <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:22px;">
              <h3 style="color:#38bdf8;font-size:1.1rem;font-weight:700;margin:0 0 8px;">2. فحص أمني وتطهير الحسابات</h3>
              <p style="color:#94a3b8;font-size:0.9rem;line-height:1.7;margin:0;">
                لا يتم عرض أي حساب للبيع إلا بعد مراجعة شاملة لتقدم القرية، مستويات الأبطال، الدفاعات، ومعدات السوبر سيل، والتأكد بنسبة 100% من جاهزية البريد ونظافة الحساب قبل تسليمه للعميل.
              </p>
            </div>

            <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:22px;">
              <h3 style="color:#34d399;font-size:1.1rem;font-weight:700;margin:0 0 8px;">3. نقل ملكية يدوية وتأمين فوري</h3>
              <p style="color:#94a3b8;font-size:0.9rem;line-height:1.7;margin:0;">
                يتم التواصل معك بشكل شخصي ومباشر عبر الواتساب من إدارة المتجر خطوة بخطوة، حتى يتم ربط بريدك الشخصي وتأمين الحساب برقمك الخاص وتفعيل التحقق بخطوتين خلال دقائق معدودة.
              </p>
            </div>
          </div>
        </section>

        <!-- FAQ Section for Search Intent -->
        <section style="background:#1e293b;border:1px solid #334155;border-radius:24px;padding:36px 28px;">
          <h2 style="font-size:1.5rem;font-weight:800;color:#f8fafc;margin:0 0 20px;text-align:center;">
            الأسئلة الشائعة حول موثوقية وضمان متجر كلاش ماركت
          </h2>

          <div style="display:flex;flex-direction:column;gap:14px;">
            <details style="background:#0f172a;border:1px solid #334155;border-radius:14px;padding:16px 20px;cursor:pointer;">
              <summary style="font-weight:700;color:#f1f5f9;font-size:1rem;">س: هل متجر كلاش ماركت موثوق وآمن للتعامل؟</summary>
              <p style="color:#94a3b8;font-size:0.95rem;line-height:1.7;margin:12px 0 0;">
                نعم، متجر كلاش ماركت هو متجر موثوق في السعودية والخليج لبيع وشراء حسابات الألعاب. جميع التعاملات تتم بإشراف يدوي وتوثيق رسمي عبر الواتساب، مع تقديم إثباتات الشراء وضمانات عدم السحب.
              </p>
            </details>

            <details style="background:#0f172a;border:1px solid #334155;border-radius:14px;padding:16px 20px;cursor:pointer;">
              <summary style="font-weight:700;color:#f1f5f9;font-size:1rem;">س: ما هو الضمان الذهبي لحسابات كلاش؟ وماذا يغطي؟</summary>
              <p style="color:#94a3b8;font-size:0.95rem;line-height:1.7;margin:12px 0 0;">
                الضمان الذهبي هو التزام رسمي ومطلق يضمن الحساب مدى الحياة ضد أي محاولة سحب أو استرجاع. يتم تسليم الحساب ببريد نظيف وخالٍ تماماً من أي ارتباطات سابقة مع تفعيل أرقام الأمان الخاصة بك.
              </p>
            </details>

            <details style="background:#0f172a;border:1px solid #334155;border-radius:14px;padding:16px 20px;cursor:pointer;">
              <summary style="font-weight:700;color:#f1f5f9;font-size:1rem;">س: كيف أضمن عدم استرجاع الحساب بعد الشراء؟</summary>
              <p style="color:#94a3b8;font-size:0.95rem;line-height:1.7;margin:12px 0 0;">
                يقوم فريقنا بنقل الحساب إلى بريدك الإلكتروني الشخصي، وتغيير كافة معلومات الأمان، وتوليد أكواد استرداد أمان جديدة مخصصة لك وحدك، وحذف كافة الأجهزة التي دخلت الحساب مسبقاً، مما يمنحك السيطرة الحصرية والآمنة.
              </p>
            </details>

            <details style="background:#0f172a;border:1px solid #334155;border-radius:14px;padding:16px 20px;cursor:pointer;">
              <summary style="font-weight:700;color:#f1f5f9;font-size:1rem;">س: ما هي طرق الدفع المتاحة وكيف يتم التسليم؟</summary>
              <p style="color:#94a3b8;font-size:0.95rem;line-height:1.7;margin:12px 0 0;">
                نقبل التحويل البنكي المباشر لحسابات سعودية وخليجية، بالإضافة إلى إمكانية التقسيط المريح عبر تابي وتمارا بالاتفاق المباشر. يتم التسليم يدوياً وبشكل فوري عبر الواتساب في غضون 5 إلى 15 دقيقة فقط.
              </p>
            </details>
          </div>
        </section>
      </div>
    `;

    const html = pageShell({
      title: "آراء وتقييمات متجر كلاش | هل متجر كلاش موثوق؟ ضمان وأمان الحسابات",
      description: "اقرأ تقييمات وآراء مشتري متجر كلاش ماركت الحقيقية. هل متجر كلاش ماركت موثوق؟ تعرف على سياسة الضمان الذهبي ضد السحب، سرعة التسليم الفوري، ومصداقية المتجر في السعودية والخليج.",
      canonicalPath: "/reviews",
      bodyHtml,
      jsonLd: jsonLdData,
    });

    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err: any) {
    req.log.error({ err }, "Failed to render reviews page");
    res.status(500).send("Internal server error");
  }
});

export default router;
