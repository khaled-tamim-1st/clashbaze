/**
 * Cloudflare Worker: Dynamic Routing + Geo-Targeting
 * 
 * المنطق:
 * 1. فرّق بين البوتات والإنسان
 * 2. احسب الموقع الجغرافي للزائر
 * 3. وجّه بناءً على الموقع + نوع الزائر
 * 4. optimized CDN/latency للخليج تحديدًا
 */

const BOT_UA_REGEX = /googlebot|google-inspectiontool|googlebot-image|bingbot|yandex|duckduckbot|baiduspider|applebot|facebookexternalhit|whatsapp|twitterbot|linkedinbot|slackbot|telegrambot|msnbot|pinterestbot|scrapingbot|ahrefsbot|semrushbot|mj12bot|dotbot|screaming frog|gptbot|chatgpt-user|claude-web|claudebot|perplexitybot|anthropic-ai|bytespider|curl|wget/i;

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

    // طبقة حماية إضافية: أجبر HTTPS دائمًا حتى لو كان "Always Use HTTPS" في
    // Cloudflare (SSL/TLS → Edge Certificates) متوقف أو تغيّر لاحقًا.
    // بدون هذا، أي طلب http:// كان يوصل للـ Worker ويُخدَم بـ 200 عادي
    // (نفس المحتوى على بروتوكولين)، وهو بالضبط ما تُبلغ عنه Google بتحذير
    // "بروتوكول HTTPS غير صالح" في Search Console.
    if (incomingUrl.protocol === "http:") {
      incomingUrl.protocol = "https:";
      return Response.redirect(incomingUrl.toString(), 301);
    }

    const context = analyzeRequest(request);

    // 1. /api/* → دايمًا للـ VPS (بغض النظر عن الموقع أو نوع الزائر)
    if (new URL(request.url).pathname.startsWith("/api/")) {
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

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  // GET و HEAD لا يحتاجان body
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  try {
    const response = await fetch(targetUrl.toString(), init);
    
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
    
    return response;
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