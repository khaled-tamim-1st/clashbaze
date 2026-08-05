/**
 * Cloudflare Worker: Dynamic Routing + Geo-Targeting
 * 
 * المنطق:
 * 1. فرّق بين البوتات والإنسان
 * 2. احسب الموقع الجغرافي للزائر
 * 3. وجّه بناءً على الموقع + نوع الزائر
 * 4. optimized CDN/latency للخليج تحديدًا
 */

const BOT_UA_REGEX = /googlebot|bingbot|yandex|duckduckbot|baiduspider|applebot|facebookexternalhit|whatsapp|twitterbot|linkedinbot|slackbot|telegrambot|msnbot|pinterestbot|scrapingbot|curl|wget/i;

// الدول المستهدفة الأساسية (الخليج + الشرق الأوسط)
const TARGET_REGIONS = ["SA", "AE", "KW", "QA", "BH", "OM", "EG", "JO", "LB"];

// Origins (استبدل بـ روابطك الحقيقية)
const VPS_ORIGIN = "https://api.clashbaze.com"; // يفضل يكون في السعودية أو الإمارات
const FRONTEND_ORIGIN = "https://clashbaze.pages.dev"; // Cloudflare Pages = CDN عالمي ذكي

interface RequestContext {
  country: string;
  isBot: boolean;
  isTargetRegion: boolean;
  userAgent: string;
  ip: string;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const context = analyzeRequest(request);

    // 1. /api/* → دايمًا للـ VPS (بغض النظر عن الموقع أو نوع الزائر)
    if (new URL(request.url).pathname.startsWith("/api/")) {
      return proxyTo(VPS_ORIGIN, request, context);
    }

    // 2. /sitemap.xml و /robots.txt → دايمًا للـ VPS (ديناميكي)
    if (["/sitemap.xml", "/robots.txt"].includes(new URL(request.url).pathname)) {
      return proxyTo(VPS_ORIGIN, request, context);
    }

    // 3. بوت؟ → VPS (HTML مُجهّز للـ SEO)
    if (context.isBot) {
      return proxyTo(VPS_ORIGIN, request, context);
    }

    // 4. إنسان عادي من منطقة مستهدفة (الخليج) → Cloudflare Pages (أداء محلي أفضل)
    if (context.isTargetRegion) {
      return proxyTo(FRONTEND_ORIGIN, request, context);
    }

    // 5. إنسان عادي من خارج المنطقة المستهدفة
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

  // Host سيتم تحديده بواسطة fetch للـ Origin الجديد
  headers.delete("Host");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  // GET و HEAD لا يحتاجان body
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  return fetch(targetUrl.toString(), init);
}
