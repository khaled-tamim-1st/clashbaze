import { Router, type Request, type Response } from "express";
import { trackAndBuildRedirect, type WhatsAppTrackingParams } from "../lib/whatsappTracking";
import { logger } from "../lib/logger";

const router = Router();

async function handleTracking(req: Request, res: Response): Promise<void> {
  // Prevent any search engine indexing or caching of tracking redirects
  res.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  try {
    const rawAccountId = req.query["accountId"] || req.query["productId"];
    const accountId = rawAccountId ? Number(rawAccountId) : null;

    const params: WhatsAppTrackingParams = {
      cta: (req.params["cta"] || (req.query["cta"] as string) || "custom").toString(),
      accountId: Number.isFinite(accountId) ? accountId : null,
      accountSlug: (req.query["accountSlug"] || req.query["slug"] || null) as string | null,
      sourcePage: (req.query["sourcePage"] || req.query["url"] || null) as string | null,
      sourcePath: (req.query["sourcePath"] || req.query["path"] || null) as string | null,
      referrer: (req.query["referrer"] || req.query["ref"] || null) as string | null,
      utmSource: (req.query["utm_source"] || null) as string | null,
      utmMedium: (req.query["utm_medium"] || null) as string | null,
      utmCampaign: (req.query["utm_campaign"] || null) as string | null,
      utmContent: (req.query["utm_content"] || null) as string | null,
      utmTerm: (req.query["utm_term"] || null) as string | null,
      campaign: (req.query["campaign"] || null) as string | null,
      sessionId: (req.query["sessionId"] || null) as string | null,
      visitorId: (req.query["visitorId"] || null) as string | null,
      text: (req.query["text"] || req.query["message"] || null) as string | null,
      number: (req.query["number"] || null) as string | null,
    };

    const { redirectUrl, eventId } = await trackAndBuildRedirect(req, params);

    // If client requested JSON response (e.g. from beacon or fetch call with ?format=json or POST)
    if (req.query["format"] === "json" || req.method === "POST") {
      res.json({ success: true, redirectUrl, eventId });
      return;
    }

    // Direct redirect to WhatsApp with HTML meta-refresh fallback for mobile WebViews
    const safeUrl = redirectUrl.replace(/"/g, "&quot;");
    res.status(302);
    res.set("Location", redirectUrl);
    res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0;url=${safeUrl}">
  <title>جاري التحويل إلى واتساب...</title>
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</head>
<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0f172a;color:#fff;text-align:center;padding:20px;">
  <div>
    <div style="font-size:18px;margin-bottom:16px;">جاري تحويلك إلى الواتساب...</div>
    <a href="${safeUrl}" style="display:inline-block;padding:12px 24px;background:#25d366;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">اضغط هنا إذا لم يتم التحويل تلقائياً</a>
  </div>
</body>
</html>`);
  } catch (err) {
    logger.error({ err }, "Unhandled error in handleTracking; redirecting to default WhatsApp");
    const fallbackNumber = (process.env["WHATSAPP_NUMBER"] || "966576742294").replace(/[^\d]/g, "");
    const fallbackUrl = `https://wa.me/${fallbackNumber}`;
    res.status(302);
    res.set("Location", fallbackUrl);
    res.send(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${fallbackUrl}"></head><body><a href="${fallbackUrl}">اضغط هنا</a></body></html>`);
  }
}

// Support both path-based CTA (/go/whatsapp/:cta) and query-based CTA (/go/whatsapp?cta=...)
router.get("/go/whatsapp/:cta", handleTracking);
router.get("/go/whatsapp", handleTracking);

// Also mount under /api/track/whatsapp-click for standard API tracking endpoint
router.get("/track/whatsapp-click", handleTracking);
router.post("/track/whatsapp-click", handleTracking);

export default router;
