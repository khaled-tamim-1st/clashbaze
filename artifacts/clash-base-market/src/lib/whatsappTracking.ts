/**
 * WhatsApp Click Tracking Client Utilities
 */

const VISITOR_STORAGE_KEY = "cb_vid";
const SESSION_STORAGE_KEY = "cb_sid";

function getOrGenerateId(storage: Storage, key: string, prefix: string): string {
  try {
    let id = storage.getItem(key);
    if (!id) {
      const randomPart = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      id = `${prefix}_${randomPart}`;
      storage.setItem(key, id);
    }
    return id;
  } catch {
    return `${prefix}_anon`;
  }
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "vis_ssr";
  return getOrGenerateId(window.localStorage, VISITOR_STORAGE_KEY, "vis");
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "sess_ssr";
  return getOrGenerateId(window.sessionStorage, SESSION_STORAGE_KEY, "sess");
}

export interface WhatsAppTrackingOptions {
  cta: string;
  accountId?: number | null;
  productId?: number | null;
  accountSlug?: string | null;
  text?: string | null;
  number?: string | null;
  campaign?: string | null;
  sourcePage?: string | null;
  sourcePath?: string | null;
  referrer?: string | null;
}

/**
 * Builds the tracked redirect URL pointing to /go/whatsapp/:cta
 * Automatically attaches session, visitor, current URL, and UTM attribution parameters.
 */
export function createWhatsAppTrackingUrl(options: WhatsAppTrackingOptions): string {
  const cta = encodeURIComponent(options.cta || "custom");
  const url = new URL(`/go/whatsapp/${cta}`, typeof window !== "undefined" ? window.location.origin : "https://www.clashmarket.online");

  const accountId = options.accountId ?? options.productId;
  if (accountId) {
    url.searchParams.set("accountId", String(accountId));
  }

  if (options.accountSlug) {
    url.searchParams.set("accountSlug", options.accountSlug);
  }

  if (options.text) {
    url.searchParams.set("text", options.text);
  }

  if (options.number) {
    url.searchParams.set("number", options.number);
  }

  if (options.campaign) {
    url.searchParams.set("campaign", options.campaign);
  }

  if (typeof window !== "undefined") {
    url.searchParams.set("sourcePage", options.sourcePage || window.location.href);
    url.searchParams.set("sourcePath", options.sourcePath || window.location.pathname);
    if (document.referrer) {
      url.searchParams.set("referrer", options.referrer || document.referrer);
    }

    url.searchParams.set("sessionId", getSessionId());
    url.searchParams.set("visitorId", getVisitorId());

    // Carry over any incoming UTM parameters from current page URL
    const currentParams = new URLSearchParams(window.location.search);
    for (const utm of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const val = currentParams.get(utm);
      if (val) {
        url.searchParams.set(utm, val);
      }
    }
  }

  return url.pathname + url.search;
}

/**
 * Developer API alias for createWhatsAppTrackingUrl
 */
export const createWhatsAppRedirect = createWhatsAppTrackingUrl;

/**
 * Programmatic helper to trigger WhatsApp tracking and navigation (e.g. in onClick handlers)
 */
export function trackWhatsAppClick(options: WhatsAppTrackingOptions): string {
  const url = createWhatsAppTrackingUrl(options);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return url;
}

