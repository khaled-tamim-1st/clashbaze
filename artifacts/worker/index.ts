/**
 * Cloudflare Worker: Dynamic Routing + Geo-Targeting
 * 
 * المنطق:
 * 1. فرّق بين البوتات والإنسان
 * 2. احسب الموقع الجغرافي للزائر
 * 3. وجّه بناءً على الموقع + نوع الزائر
 * 4. optimized CDN/latency للخليج تحديدًا
 */

const BOT_UA_REGEX =
  /googlebot|google-inspectiontool|bingbot|yandexbot|duckduckbot|baiduspider|applebot|facebookexternalhit|whatsapp|twitterbot|linkedinbot|slackbot|telegrambot|pinterestbot|ahrefs|semrush|mj12bot|dotbot|screaming frog|gptbot|chatgpt-user|claude-web|claudebot|perplexitybot|anthropic-ai|bytespider|curl|wget|lighthouse|pagespeed|gtmetrix/i;

// امتدادات ملفات static (صور/فونتات/سكريبتات) — هذه دائمًا موجودة فقط على
// FRONTEND_ORIGIN (Cloudflare Pages بيقدّم مجلد public/dist)، والـ VPS
// (Express) لا يخدم أي static assets إطلاقًا. لو تُركت هذه الطلبات ضمن
// منطق "بوت → VPS" أدناه، كل طلبات og:image من WhatsApp/Facebook (وأي بوت
// آخر) كانت ترجع 404 من الـ VPS، فتظهر معاينة بدون صورة رغم أن og:image
// tag نفسه صحيح تمامًا في الـ HTML.
const STATIC_ASSET_REGEX = /\.(png|jpe?g|gif|webp|svg|ico|avif|css|js|mjs|woff2?|ttf|eot|json|txt|map)$/i;

// الدول المستهدفة الأساسية (الخليج + الشرق الأوسط)
const TARGET_REGIONS = ["SA", "AE", "KW", "QA", "BH", "OM", "EG", "JO", "LB"];

// Origins (استبدل بـ روابطك الحقيقية)
// Origins
const VPS_ORIGIN = "https://api.clashmarket.online";
const FRONTEND_ORIGIN = "https://clashmarket.kh603333.workers.dev";

interface RequestContext {
  country: string;
  isBot: boolean;
  isTargetRegion: boolean;
  userAgent: string;
  ip: string;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const incomingUrl = new URL(request.url);

    // طبقة حماية وإجبار الـ Canonical Domain:
    // 1. تحويل http:// إلى https://
    // 2. تحويل clashmarket.online (Apex) إلى www.clashmarket.online لمنع تكرار الصفحات (Duplicate Pages)
    const isApexDomain = incomingUrl.hostname === "clashmarket.online";
    if (incomingUrl.protocol === "http:" || isApexDomain) {
      incomingUrl.protocol = "https:";
      incomingUrl.hostname = "www.clashmarket.online";
      return Response.redirect(incomingUrl.toString(), 301);
    }

    const context = analyzeRequest(request);

    // 1. /api/* و /go/* → دايمًا للـ VPS (بغض النظر عن الموقع أو نوع الزائر)
    if (incomingUrl.pathname.startsWith("/api") || incomingUrl.pathname.startsWith("/go")) {
      return proxyTo(VPS_ORIGIN, request, context);
    }

    // 2. /sitemap.xml و /robots.txt → دايمًا للـ VPS (ديناميكي)
    if (["/sitemap.xml", "/robots.txt"].includes(new URL(request.url).pathname)) {
      return proxyTo(VPS_ORIGIN, request, context);
    }

    // 3. ملفات static (صور og:image، فونتات، CSS/JS) → دايمًا FRONTEND_ORIGIN
    // بغض النظر عن كون الزائر بوت أو إنسان. الـ VPS مالوش static file
    // serving إطلاقًا، فلو سابنا البوتات (بما فيهم WhatsApp/Googlebot) توجه
    // لملفات زي opengraph.png هترجع 404 من الـ VPS.
    if (STATIC_ASSET_REGEX.test(new URL(request.url).pathname)) {
      return proxyTo(FRONTEND_ORIGIN, request, context);
    }

    // 4. بوت؟ → VPS (HTML مُجهّز للـ SEO)
    if (context.isBot) {
      return proxyTo(VPS_ORIGIN, request, context);
    }

    // 5. إنسان عادي من منطقة مستهدفة (الخليج) → Cloudflare Pages (أداء محلي أفضل)
    if (context.isTargetRegion) {
      return proxyTo(FRONTEND_ORIGIN, request, context);
    }

    // 6. إنسان عادي من خارج المنطقة المستهدفة
    // قرارين ممكنين:
    // أ) أرسله للفرونت عادي (global CDN يخدمه)
    // ب) أرسله للـ VPS (لأنه مش من الجمهور المقصود — قرار بيزنس)
    
    // الخيار الأول (أفضل لـ UX عام):
    return proxyTo(FRONTEND_ORIGIN, request, context);
  },
};

/**
 * تحليل الطلب: استخرج البيانات المهمة
 */
/**
 * تحليل الطلب: استخرج البيانات المهمة
 */
function analyzeRequest(request: Request): RequestContext {
  const url = new URL(request.url);
  const userAgent = request.headers.get("User-Agent") || "";
  const country = request.headers.get("CF-IPCountry") || "UNKNOWN";
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const isBot = BOT_UA_REGEX.test(userAgent);
  const isTargetRegion = TARGET_REGIONS.includes(country);

  return {
    country,
    isBot,
    isTargetRegion,
    userAgent,
    ip,
  };
}

/**
 * إرسال الطلب إلى الـ Origin المطلوب
 */
async function proxyTo(
  origin: string,
  request: Request,
  _context: RequestContext
): Promise<Response> {
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(origin);

  // الحفاظ على المسار والـ query parameters
  targetUrl.pathname = incomingUrl.pathname;
  targetUrl.search = incomingUrl.search;

  // نسخ الـ headers
  const headers = new Headers(request.headers);

  // تعيين الـ Host header بدقة ليطابق الدومين الهدف حتى يتعرف عليه Cloudflare
  headers.set("Host", targetUrl.host);

  const init: RequestInit & { cf?: any } = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  const pathname = incomingUrl.pathname;
  const isDynamicOrBypass =
    pathname.startsWith("/api") ||
    pathname.startsWith("/go") ||
    pathname.startsWith("/admin");

  if (isDynamicOrBypass) {
    targetUrl.searchParams.set("_cf_bypass", Date.now().toString());
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");
  }

  // GET و HEAD لا يحتاجان body مع تفعيل الـ Cloudflare Edge Cache للـ Static و SSR فقط
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  } else if (!isDynamicOrBypass) {
    init.cf = {
      cacheEverything: true,
      cacheTtl: 3600,
      cacheTtlByStatus: { "200-299": 3600, "400-599": 0 },
    };
  } else {
    init.cf = {
      cacheEverything: false,
      cacheTtl: -1,
      cacheMode: "no-store",
    };
  }

  try {
    const response = await fetch(targetUrl.toString(), init);
    
    // إذا كانت الاستجابة 404 وقادمة من الـ VPS، نتأكد أنها ليست كاش قديم عن طريق استعلام حي مباشر
    if (response.status === 404 && origin === VPS_ORIGIN) {
      const freshTargetUrl = new URL(targetUrl.toString());
      freshTargetUrl.searchParams.set("_cf_fresh", Date.now().toString());
      const freshResponse = await fetch(freshTargetUrl.toString(), {
        method: request.method,
        headers: init.headers,
        redirect: "manual",
        cf: { cacheMode: "no-store", cacheEverything: false },
      });
      if (freshResponse.ok) {
        return freshResponse;
      }
    }

    // إذا أرجع الـ Frontend Worker خطأ 404 أو فشل وكان الطلب لصفحة عادية (وليس ملف static)، نحوّل تلقائياً للـ VPS
    if (
      (!response.ok || response.status === 404) &&
      origin === FRONTEND_ORIGIN &&
      !STATIC_ASSET_REGEX.test(incomingUrl.pathname)
    ) {
      const vpsUrl = new URL(VPS_ORIGIN);
      vpsUrl.pathname = incomingUrl.pathname;
      vpsUrl.search = incomingUrl.search;
      const vpsHeaders = new Headers(request.headers);
      vpsHeaders.set("Host", vpsUrl.host);
      return fetch(vpsUrl.toString(), {
        method: request.method,
        headers: vpsHeaders,
        redirect: "manual",
      });
    }

    if (isDynamicOrBypass) {
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      responseHeaders.set("Pragma", "no-cache");
      responseHeaders.set("Expires", "0");
      responseHeaders.set("Surrogate-Control", "no-store");
      responseHeaders.set("CDN-Cache-Control", "no-store");
      responseHeaders.set("Cloudflare-CDN-Cache-Control", "no-store");
      responseHeaders.delete("Age");
      responseHeaders.delete("CF-Cache-Status");
      responseHeaders.delete("cf-cache-status");
      const hasNoBody = [101, 204, 205, 304].includes(response.status);
      const customResponse = new Response(hasNoBody ? null : response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
      return ensureCanonicalHost(customResponse);
    }
    
    return ensureCanonicalHost(response);
  } catch (_err) {
    // في حال حدوث أي خطأ في الاتصال بالفرونت، الـ VPS يعمل كـ Fallback فوري
    if (origin === FRONTEND_ORIGIN && !STATIC_ASSET_REGEX.test(incomingUrl.pathname)) {
      const vpsUrl = new URL(VPS_ORIGIN);
      vpsUrl.pathname = incomingUrl.pathname;
      vpsUrl.search = incomingUrl.search;
      const vpsHeaders = new Headers(request.headers);
      vpsHeaders.set("Host", vpsUrl.host);
      return fetch(vpsUrl.toString(), {
        method: request.method,
        headers: vpsHeaders,
        redirect: "manual",
      });
    }
    throw _err;
  }
}

/**
 * يضمن تحويل أي رابط canonical أو og:url أو twitter:url يشير إلى نطاق api.clashmarket.online
 * إلى النطاق الرئيسي الرسمي https://www.clashmarket.online لحماية الـ SEO ومنع مشاكل الفهرسة في Bing/Google.
 */
function ensureCanonicalHost(res: Response): Response {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return res;
  }

  // @ts-ignore
  return new HTMLRewriter()
    .on('link[rel="canonical"]', {
      element(el: any) {
        const href = el.getAttribute("href");
        if (href && href.includes("api.clashmarket.online")) {
          el.setAttribute("href", href.replace("https://api.clashmarket.online", "https://www.clashmarket.online"));
        }
      },
    })
    .on('meta[property="og:url"]', {
      element(el: any) {
        const content = el.getAttribute("content");
        if (content && content.includes("api.clashmarket.online")) {
          el.setAttribute("content", content.replace("https://api.clashmarket.online", "https://www.clashmarket.online"));
        }
      },
    })
    .on('meta[name="twitter:url"]', {
      element(el: any) {
        const content = el.getAttribute("content");
        if (content && content.includes("api.clashmarket.online")) {
          el.setAttribute("content", content.replace("https://api.clashmarket.online", "https://www.clashmarket.online"));
        }
      },
    })
    .transform(res);
}