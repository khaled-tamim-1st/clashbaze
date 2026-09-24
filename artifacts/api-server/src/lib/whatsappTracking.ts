import crypto from "node:crypto";
import type { Request } from "express";
import { db, whatsappClickEventsTable, whatsappClickDailyAggregatesTable, accountsTable } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { logger } from "./logger";

export const ALLOWED_CTA_IDS = new Set([
  "product_card",
  "product_detail",
  "product_detail_ssr",
  "footer_contact",
  "header_contact",
  "about_contact",
  "how_it_works_contact",
  "coc_hub_contact",
  "cr_hub_contact",
  "floating_button",
  "checkout",
  "support",
  "custom",
]);

// Sliding window rate limiter for tracking requests (per IP hash)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40; // 40 clicks per minute per hashed IP

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (record.resetTime <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export function checkRateLimit(ipHash: string): { allowed: boolean; count: number } {
  const now = Date.now();
  let record = rateLimitMap.get(ipHash);
  if (!record || record.resetTime <= now) {
    record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ipHash, record);
    return { allowed: true, count: 1 };
  }
  record.count += 1;
  return { allowed: record.count <= MAX_REQUESTS_PER_WINDOW, count: record.count };
}

export function hashIp(ip: string): string {
  const secret = process.env["TRACKING_HASH_SECRET"] || "clashbaze-wa-click-tracking-salt-2026";
  return crypto.createHmac("sha256", secret).update(ip || "unknown").digest("hex");
}

export function classifyDevice(userAgent: string): "mobile" | "tablet" | "desktop" {
  const ua = (userAgent || "").toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))|playbook|silk/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

export function extractBrowser(userAgent: string): string {
  const ua = userAgent || "";
  if (/WhatsApp/i.test(ua)) return "WhatsApp In-App";
  if (/Edg([ea])?\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Chrome\/[.0-9]+/i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Firefox\/[.0-9]+/i.test(ua)) return "Firefox";
  if (/Safari\/[.0-9]+/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/Instagram/i.test(ua)) return "Instagram In-App";
  if (/FBAN|FBAV/i.test(ua)) return "Facebook In-App";
  if (/TikTok/i.test(ua)) return "TikTok In-App";
  return "Other";
}

export function extractOs(userAgent: string): string {
  const ua = userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  if (/CrOS/i.test(ua)) return "Chrome OS";
  return "Other";
}

export function classifyTraffic(userAgent: string, rateLimitExceeded: boolean): "human" | "bot" | "suspicious" {
  if (rateLimitExceeded) return "suspicious";
  const ua = (userAgent || "").toLowerCase();
  const botPattern = /googlebot|bingbot|yandex|duckduckbot|baiduspider|applebot|facebookexternalhit|whatsapp|twitterbot|linkedinbot|slackbot|telegrambot|pinterestbot|ahrefs|semrush|mj12bot|dotbot|screaming frog|gptbot|chatgpt|claude|perplexity|bytespider|curl|wget|python|postman|insomnia|crawl|spider/i;
  if (botPattern.test(ua)) {
    return "bot";
  }
  return "human";
}

export interface WhatsAppTrackingParams {
  cta: string;
  accountId?: number | null;
  accountSlug?: string | null;
  sourcePage?: string | null;
  sourcePath?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  campaign?: string | null;
  sessionId?: string | null;
  visitorId?: string | null;
  text?: string | null;
  number?: string | null;
}

export function isTrustedWhatsAppNumber(num: string): boolean {
  if (!num) return false;
  const digits = num.replace(/[^\d]/g, "");
  const defaultNumber = (process.env["WHATSAPP_NUMBER"] || "966576742294").replace(/[^\d]/g, "");
  const extraAllowed = (process.env["ALLOWED_WHATSAPP_NUMBERS"] || "")
    .split(",")
    .map((n) => n.replace(/[^\d]/g, ""))
    .filter(Boolean);
  const whitelist = new Set([defaultNumber, "966576742294", ...extraAllowed]);
  return whitelist.has(digits);
}

export function buildSafeWhatsAppDestination(number?: string | null, text?: string | null): string {
  const defaultNumber = (process.env["WHATSAPP_NUMBER"] || "966576742294").replace(/[^\d]/g, "");
  const sanitizedNumber = (number || "").replace(/[^\d]/g, "");
  const targetNumber = isTrustedWhatsAppNumber(sanitizedNumber) ? sanitizedNumber : defaultNumber;
  const baseUrl = `https://wa.me/${targetNumber}`;
  if (text && text.trim().length > 0) {
    return `${baseUrl}?text=${encodeURIComponent(text.trim())}`;
  }
  return baseUrl;
}

/**
 * Main tracking & attribution handler.
 * Records the click event safely in DB and generates the whitelisted WhatsApp redirect URL.
 * NEVER throws; if DB or parsing fails, always returns a valid WhatsApp destination.
 */
export async function trackAndBuildRedirect(
  req: Request,
  params: WhatsAppTrackingParams
): Promise<{ redirectUrl: string; eventId?: number }> {
  // Always determine verified destination first via strict whitelist
  const defaultNumber = (process.env["WHATSAPP_NUMBER"] || "966576742294").replace(/[^\d]/g, "");
  const requestedNumber = (params.number || "").replace(/[^\d]/g, "");
  const targetNumber = isTrustedWhatsAppNumber(requestedNumber) ? requestedNumber : defaultNumber;
  let messageText = params.text || null;

  // Validate CTA ID
  const rawCta = (params.cta || "custom").toLowerCase().trim();
  const ctaId = ALLOWED_CTA_IDS.has(rawCta) || /^[a-z0-9_-]{2,64}$/.test(rawCta) ? rawCta : "custom";

  // Request metadata
  const userAgent = req.headers["user-agent"] || "";
  const ip = (req.headers["cf-connecting-ip"] as string) ||
             (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
             req.socket?.remoteAddress ||
             "127.0.0.1";
  const ipHash = hashIp(ip);
  const country = (req.headers["cf-ipcountry"] as string) || (req.headers["x-country"] as string) || null;
  const language = (req.headers["accept-language"] as string)?.split(",")[0]?.split(";")[0]?.trim() || null;

  const deviceType = classifyDevice(userAgent);
  const browser = extractBrowser(userAgent);
  const os = extractOs(userAgent);

  const rateCheck = checkRateLimit(ipHash);
  const trafficType = classifyTraffic(userAgent, !rateCheck.allowed);

  // Session & visitor identification
  const sessionId = params.sessionId || (req.headers["x-session-id"] as string) || `sess_${ipHash.slice(0, 16)}`;
  const visitorId = params.visitorId || (req.headers["x-visitor-id"] as string) || `vis_${ipHash.slice(16, 32)}`;

  let accountData: {
    id: number;
    title: string;
    game: string;
    townHall: number | null;
    price: string;
    whatsappMessage: string | null;
  } | null = null;

  try {
    // If accountId or slug is provided, load account attribution snapshot
    if (params.accountId) {
      const rows = await db
        .select({
          id: accountsTable.id,
          title: accountsTable.title,
          game: accountsTable.game,
          townHall: accountsTable.townHall,
          price: accountsTable.price,
          whatsappMessage: accountsTable.whatsappMessage,
        })
        .from(accountsTable)
        .where(eq(accountsTable.id, params.accountId))
        .limit(1);
      if (rows.length > 0 && rows[0]) {
        accountData = rows[0];
      }
    } else if (params.accountSlug) {
      const rows = await db
        .select({
          id: accountsTable.id,
          title: accountsTable.title,
          game: accountsTable.game,
          townHall: accountsTable.townHall,
          price: accountsTable.price,
          whatsappMessage: accountsTable.whatsappMessage,
        })
        .from(accountsTable)
        .where(eq(accountsTable.slug, params.accountSlug))
        .limit(1);
      if (rows.length > 0 && rows[0]) {
        accountData = rows[0];
      }
    }

    // Default message formulation if product was referenced and no custom text given
    if (!messageText && accountData) {
      const formattedPrice = Number(accountData.price).toLocaleString("ar-SA");
      messageText = `أريد شراء حساب ${accountData.whatsappMessage || accountData.title} (${formattedPrice} ر.س)`;
    }

    // Deduplication check: Has this session clicked the same CTA and account in the last 5 seconds?
    let isUniqueClick = true;
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const recentClicks = await db
      .select({ id: whatsappClickEventsTable.id })
      .from(whatsappClickEventsTable)
      .where(
        and(
          eq(whatsappClickEventsTable.sessionId, sessionId),
          eq(whatsappClickEventsTable.ctaId, ctaId),
          accountData?.id ? eq(whatsappClickEventsTable.accountId, accountData.id) : sql`TRUE`,
          gte(whatsappClickEventsTable.createdAt, fiveSecondsAgo)
        )
      )
      .limit(1);

    if (recentClicks.length > 0) {
      isUniqueClick = false;
    }

    // Insert tracking event
    const inserted = await db
      .insert(whatsappClickEventsTable)
      .values({
        sessionId,
        visitorId,
        sourcePage: params.sourcePage || null,
        sourcePath: params.sourcePath || (params.sourcePage ? new URL(params.sourcePage, "https://www.clashmarket.online").pathname : null),
        referrer: params.referrer || (req.headers["referer"] as string) || null,
        accountId: accountData?.id || null,
        accountTitle: accountData?.title || null,
        accountGame: accountData?.game || null,
        accountTownHall: accountData?.townHall || null,
        accountPrice: accountData?.price || null,
        ctaId,
        buttonLocation: ctaId,
        buttonType: "link",
        destinationType: "whatsapp",
        targetNumber,
        campaign: params.campaign || params.utmCampaign || null,
        utmSource: params.utmSource || null,
        utmMedium: params.utmMedium || null,
        utmCampaign: params.utmCampaign || null,
        utmContent: params.utmContent || null,
        utmTerm: params.utmTerm || null,
        deviceType,
        browser,
        os,
        country,
        language,
        ipHash,
        userAgent: userAgent ? userAgent.slice(0, 500) : null,
        trafficType,
        isUniqueClick,
        metadata: JSON.stringify({
          query: req.query,
          headers: {
            host: req.headers["host"],
            referer: req.headers["referer"],
          },
        }),
      })
      .returning({ id: whatsappClickEventsTable.id });

    // Update or insert daily aggregate asynchronously without blocking redirect latency
    const todayStr = new Date().toISOString().slice(0, 10);
    updateDailyAggregate(todayStr, ctaId, accountData?.id || null, params.utmSource || "direct", deviceType, isUniqueClick).catch((err) => {
      logger.warn({ err }, "Failed to update daily aggregate");
    });

    // Send instant Telegram alert to store owner (only for humans, non-blocking)
    sendTelegramNotification({
      trafficType,
      isUniqueClick,
      ctaId,
      accountTitle: accountData?.title,
      accountPrice: accountData?.price,
      accountGame: accountData?.game,
      accountTownHall: accountData?.townHall,
      sourcePath: params.sourcePath || (params.sourcePage ? new URL(params.sourcePage, "https://www.clashmarket.online").pathname : null),
      sourcePage: params.sourcePage,
      referrer: params.referrer || (req.headers["referer"] as string) || null,
      utmSource: params.utmSource,
      utmCampaign: params.utmCampaign,
      deviceType,
      browser,
      os,
      country,
    }).catch((err) => {
      logger.warn({ err }, "Failed to dispatch Telegram notification");
    });

    const redirectUrl = buildSafeWhatsAppDestination(targetNumber, messageText);
    return { redirectUrl, eventId: inserted[0]?.id };
  } catch (err) {
    logger.error({ err }, "WhatsApp tracking failed in trackAndBuildRedirect; executing fallback redirect");
    // Send fallback Telegram notification even if database failed
    sendTelegramNotification({
      trafficType: "human",
      isUniqueClick: true,
      ctaId,
      accountTitle: params.text || accountData?.title,
      sourcePath: params.sourcePath,
      deviceType: "mobile",
    }).catch(() => {});
    // CRITICAL FALLBACK: Ensure the user still gets redirected to WhatsApp safely!
    const fallbackUrl = buildSafeWhatsAppDestination(targetNumber, messageText);
    return { redirectUrl: fallbackUrl };
  }
}

interface TelegramAlertData {
  trafficType: string;
  isUniqueClick: boolean;
  ctaId: string;
  accountTitle?: string | null;
  accountPrice?: string | null;
  accountGame?: string | null;
  accountTownHall?: number | null;
  sourcePath?: string | null;
  sourcePage?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  deviceType: string;
  browser?: string | null;
  os?: string | null;
  country?: string | null;
}

function escapeTelegramHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function sendTelegramNotification(data: TelegramAlertData): Promise<void> {
  // Never notify for bot crawlers (Google, Ahrefs, Semrush, etc.)
  if (data.trafficType === "bot") {
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || "8749591269:AAHje4y08V_upNGA4vC1H-CjXXc1Mgvo9Po";
  const rawChatIds = process.env.TELEGRAM_CHAT_ID || "8200825798";
  const chatIds = rawChatIds.split(",").map((id) => id.trim()).filter(Boolean);

  if (!token || chatIds.length === 0) {
    return;
  }

  const ctaLabels: Record<string, string> = {
    product_card: "بطاقة المنتج (القائمة)",
    product_detail: "صفحة المنتج (التفاصيل)",
    product_detail_ssr: "صفحة المنتج (SSR)",
    footer_contact: "تواصل الفوتر",
    about_contact: "صفحة من نحن",
    how_it_works_contact: "صفحة طريقة الشراء",
    coc_hub_contact: "مركز كلاش أوف كلانس",
    cr_hub_contact: "مركز كلاش رويال",
    floating_button: "الزر العائم",
    header_contact: "تواصل الهيدر",
  };

  const ctaName = ctaLabels[data.ctaId] || data.ctaId;
  const timeStr = new Date().toLocaleTimeString("ar-SA", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit" });

  let text = `🚨 <b>نقرة واتساب جديدة من عميل محتمل!</b>\n\n`;

  if (data.accountTitle) {
    const formattedPrice = data.accountPrice ? `${Number(data.accountPrice).toLocaleString("ar-SA")} ر.س` : "";
    text += `📦 <b>المنتج:</b> ${escapeTelegramHtml(data.accountTitle)}\n`;
    if (formattedPrice) {
      text += `💰 <b>السعر:</b> ${formattedPrice}\n`;
    }
    if (data.accountTownHall) {
      text += `🏰 <b>التاون هول:</b> تاون ${data.accountTownHall}\n`;
    }
  } else {
    text += `💬 <b>نوع التواصل:</b> استفسار عام للمتجر\n`;
  }

  text += `🎯 <b>موضع الزر:</b> ${escapeTelegramHtml(ctaName)}\n`;
  if (data.sourcePath) {
    text += `📄 <b>الصفحة:</b> <code>${escapeTelegramHtml(data.sourcePath)}</code>\n`;
  }

  const trafficSource = data.utmSource
    ? `${data.utmSource} (${data.utmCampaign || "حملة"})`
    : (data.referrer ? "موقع مرجعي" : "زيارة مباشرة (Direct)");
  text += `🌐 <b>المصدر:</b> ${escapeTelegramHtml(trafficSource)}\n`;

  const deviceIcon = data.deviceType === "mobile" ? "📱 جوال" : (data.deviceType === "tablet" ? "📟 تابلت" : "💻 كمبيوتر");
  const deviceDetail = [data.os, data.browser].filter(Boolean).join(" / ");
  text += `📱 <b>الجهاز:</b> ${deviceIcon}${deviceDetail ? ` (${escapeTelegramHtml(deviceDetail)})` : ""}\n`;

  if (data.country) {
    text += `🌍 <b>الدولة:</b> ${escapeTelegramHtml(data.country)}\n`;
  }

  text += `⏰ <b>الوقت:</b> ${timeStr}\n`;
  if (!data.isUniqueClick) {
    text += `⚠️ <i>(تكرار سريع للنقر خلال 5 ثوانٍ)</i>\n`;
  }

  await Promise.allSettled(
    chatIds.map(async (targetChatId) => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: targetChatId,
            text,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          logger.warn({ chatId: targetChatId, errText }, "Telegram notification API responded with error");
        }
      } catch (err) {
        logger.warn({ chatId: targetChatId, err }, "Failed to send Telegram notification");
      }
    })
  );
}

async function updateDailyAggregate(
  date: string,
  ctaId: string,
  accountId: number | null,
  source: string,
  deviceType: string,
  isUnique: boolean
): Promise<void> {
  try {
    const existing = await db
      .select()
      .from(whatsappClickDailyAggregatesTable)
      .where(
        and(
          eq(whatsappClickDailyAggregatesTable.date, date),
          eq(whatsappClickDailyAggregatesTable.ctaId, ctaId),
          accountId ? eq(whatsappClickDailyAggregatesTable.accountId, accountId) : sql`account_id IS NULL`,
          eq(whatsappClickDailyAggregatesTable.source, source),
          eq(whatsappClickDailyAggregatesTable.deviceType, deviceType)
        )
      )
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      await db
        .update(whatsappClickDailyAggregatesTable)
        .set({
          clicks: sql`${whatsappClickDailyAggregatesTable.clicks} + 1`,
          uniqueSessions: isUnique ? sql`${whatsappClickDailyAggregatesTable.uniqueSessions} + 1` : whatsappClickDailyAggregatesTable.uniqueSessions,
          uniqueVisitors: isUnique ? sql`${whatsappClickDailyAggregatesTable.uniqueVisitors} + 1` : whatsappClickDailyAggregatesTable.uniqueVisitors,
        })
        .where(eq(whatsappClickDailyAggregatesTable.id, existing[0].id));
    } else {
      await db.insert(whatsappClickDailyAggregatesTable).values({
        date,
        ctaId,
        accountId: accountId || null,
        source,
        deviceType,
        clicks: 1,
        uniqueSessions: isUnique ? 1 : 0,
        uniqueVisitors: isUnique ? 1 : 0,
      });
    }
  } catch (err) {
    logger.warn({ err }, "Daily aggregate increment failed");
  }
}
