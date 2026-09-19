import { Router } from "express";
import { db, reviewsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { SITE_NAME, SITE_URL, escapeHtml, pageShell, breadcrumbHtml, breadcrumbJsonLd } from "../lib/pageshell";

const router = Router();

function generateStars(rating: number) {
  const fullStar = `<svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
  const emptyStar = `<svg class="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
  
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= rating ? fullStar : emptyStar;
  }
  return stars;
}

const verifiedBadge = `<span class="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> مشتري معتمد</span>`;

router.get("/reviews", async (req, res) => {
  try {
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.status, "approved"))
      .orderBy(desc(reviewsTable.createdAt));

    const totalReviews = reviews.length;
    let averageRating = 0;
    
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = sum / totalReviews;
    }

    const breadcrumbItems = [
      { name: "كلاش ماركت", path: "/" },
      { name: "آراء العملاء", path: "/reviews" }
    ];

    let contentHtml = "";

    if (totalReviews === 0) {
      contentHtml = `
        <div class="text-center py-16 px-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <svg class="w-16 h-16 mx-auto text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          <h2 class="text-xl font-bold text-slate-200 mb-2">لا توجد تقييمات بعد</h2>
          <p class="text-slate-400">كن أول من يشارك تجربته مع كلاش ماركت.</p>
        </div>
      `;
    } else {
      let cardsHtml = reviews.map(review => {
        const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString("ar-SA") : "";
        return `
          <div class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm transition-transform hover:-translate-y-1 hover:border-slate-600">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="font-bold text-slate-100 text-lg mb-1">${escapeHtml(review.customerName)}</h3>
                <div class="flex items-center gap-2 mb-2">
                  <div class="flex">${generateStars(review.rating)}</div>
                  <span class="text-xs text-slate-400">${date}</span>
                </div>
                ${verifiedBadge}
              </div>
            </div>
            <p class="text-slate-300 leading-relaxed">${escapeHtml(review.comment)}</p>
          </div>
        `;
      }).join("");

      contentHtml = `
        <div class="mb-10 text-center">
          <div class="inline-flex flex-col items-center justify-center bg-slate-800/50 p-6 rounded-2xl border border-amber-500/20 mb-8">
            <div class="text-5xl font-black text-amber-500 mb-2">${averageRating.toFixed(1)}</div>
            <div class="flex mb-2">${generateStars(Math.round(averageRating))}</div>
            <div class="text-slate-400 text-sm">بناءً على ${totalReviews} تقييم من عملائنا</div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${cardsHtml}
        </div>
      `;
    }

    const storeSchema = {
      "@context": "https://schema.org",
      "@type": "Store",
      name: "كلاش ماركت",
      url: SITE_URL,
      image: `${SITE_URL}/thumbnail.png`,
      ...(totalReviews > 0 ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: averageRating.toFixed(1),
          bestRating: "5",
          worstRating: "1",
          ratingCount: totalReviews,
        },
      } : {}),
    };

    const jsonLdData = [
      breadcrumbJsonLd(breadcrumbItems),
      storeSchema
    ];

    const bodyHtml = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        ${breadcrumbHtml(breadcrumbItems)}
        
        <div class="text-center mb-12">
          <h1 class="text-3xl md:text-4xl font-black text-slate-100 mb-4 tracking-tight">آراء عملاء كلاش ماركت</h1>
          <p class="text-slate-400 max-w-2xl mx-auto text-lg">
            نفخر بثقة عملائنا ونسعى دائماً لتقديم أفضل تجربة شراء لحسابات كلاش أوف كلانس وكلاش رويال.
          </p>
        </div>

        ${contentHtml}
      </div>
    `;

    const html = pageShell({
      title: "آراء العملاء وتقييماتهم | متجر كلاش ماركت",
      description: "اقرأ تقييمات وآراء عملاء متجر كلاش ماركت الحقيقية. تجارب مشترين موثقة لحسابات كلاش أوف كلانس وكلاش رويال مع تقييمات بالنجوم وشارة مشتري معتمد.",
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
