import { Router, type Request, type Response } from "express";
import { db, whatsappClickEventsTable, accountsTable } from "@workspace/db";
import { eq, and, gte, lte, desc, sql, or, ilike } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";
import { logger } from "../lib/logger";

const router = Router();

// Helper to compute date range filter
function parseDateFilter(query: Request["query"]): { start: Date; end: Date } {
  const range = (query["range"] as string) || "7d";
  const now = new Date();
  let end = new Date(now);
  let start = new Date(now);

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (range === "yesterday") {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
  } else if (range === "7d") {
    start.setDate(start.getDate() - 7);
  } else if (range === "30d") {
    start.setDate(start.getDate() - 30);
  } else if (range === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (range === "last_month") {
    start.setMonth(start.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(0); // Last day of previous month
    end.setHours(23, 59, 59, 999);
  } else if (range === "all") {
    start = new Date(2020, 0, 1);
  } else if (range === "custom" && query["startDate"]) {
    start = new Date(query["startDate"] as string);
    start.setHours(0, 0, 0, 0);
    if (query["endDate"]) {
      end = new Date(query["endDate"] as string);
      end.setHours(23, 59, 59, 999);
    }
  } else {
    start.setDate(start.getDate() - 7);
  }

  return { start, end };
}

// 1. Overview KPIs
router.get("/admin/whatsapp/overview", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = parseDateFilter(req.query);

    const conditions = and(
      gte(whatsappClickEventsTable.createdAt, start),
      lte(whatsappClickEventsTable.createdAt, end)
    );

    const [stats] = await db
      .select({
        totalClicks: sql<number>`count(*)::int`,
        uniqueVisitors: sql<number>`count(distinct ${whatsappClickEventsTable.visitorId})::int`,
        uniqueSessions: sql<number>`count(distinct ${whatsappClickEventsTable.sessionId})::int`,
        uniqueClicks: sql<number>`count(case when ${whatsappClickEventsTable.isUniqueClick} then 1 end)::int`,
        humanClicks: sql<number>`count(case when ${whatsappClickEventsTable.trafficType} = 'human' then 1 end)::int`,
        botClicks: sql<number>`count(case when ${whatsappClickEventsTable.trafficType} = 'bot' then 1 end)::int`,
        suspiciousClicks: sql<number>`count(case when ${whatsappClickEventsTable.trafficType} = 'suspicious' then 1 end)::int`,
      })
      .from(whatsappClickEventsTable)
      .where(conditions);

    // Top product
    const topProducts = await db
      .select({
        productId: whatsappClickEventsTable.accountId,
        title: whatsappClickEventsTable.accountTitle,
        count: sql<number>`count(*)::int`,
      })
      .from(whatsappClickEventsTable)
      .where(and(conditions, sql`${whatsappClickEventsTable.accountId} IS NOT NULL`))
      .groupBy(whatsappClickEventsTable.accountId, whatsappClickEventsTable.accountTitle)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    // Top source
    const topSources = await db
      .select({
        source: sql<string>`COALESCE(${whatsappClickEventsTable.utmSource}, 'Direct')`,
        count: sql<number>`count(*)::int`,
      })
      .from(whatsappClickEventsTable)
      .where(conditions)
      .groupBy(sql`COALESCE(${whatsappClickEventsTable.utmSource}, 'Direct')`)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    // Top CTA
    const topCtas = await db
      .select({
        ctaId: whatsappClickEventsTable.ctaId,
        count: sql<number>`count(*)::int`,
      })
      .from(whatsappClickEventsTable)
      .where(conditions)
      .groupBy(whatsappClickEventsTable.ctaId)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    res.json({
      totalClicks: stats?.totalClicks || 0,
      uniqueVisitors: stats?.uniqueVisitors || 0,
      uniqueSessions: stats?.uniqueSessions || 0,
      uniqueClicks: stats?.uniqueClicks || 0,
      humanClicks: stats?.humanClicks || 0,
      botClicks: stats?.botClicks || 0,
      suspiciousClicks: stats?.suspiciousClicks || 0,
      topProduct: topProducts[0] ? { id: topProducts[0].productId, title: topProducts[0].title, clicks: topProducts[0].count } : null,
      topSource: topSources[0] ? { source: topSources[0].source, clicks: topSources[0].count } : null,
      topCta: topCtas[0] ? { ctaId: topCtas[0].ctaId, clicks: topCtas[0].count } : null,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch WhatsApp overview");
    res.status(500).json({ error: "Failed to load overview data" });
  }
});

// 2. Timeseries (Clicks over time)
router.get("/admin/whatsapp/timeseries", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = parseDateFilter(req.query);
    const range = (req.query["range"] as string) || "7d";
    const isHourly = range === "today" || range === "yesterday";

    const dateTrunc = isHourly ? "hour" : "day";

    const rows = await db
      .select({
        bucket: sql<string>`to_char(date_trunc(${dateTrunc}, ${whatsappClickEventsTable.createdAt}), 'YYYY-MM-DD"T"HH24:MI:SS')`,
        displayLabel: sql<string>`to_char(date_trunc(${dateTrunc}, ${whatsappClickEventsTable.createdAt}), ${isHourly ? sql`'HH24:00'` : sql`'YYYY-MM-DD'`})`,
        clicks: sql<number>`count(*)::int`,
        uniqueVisitors: sql<number>`count(distinct ${whatsappClickEventsTable.visitorId})::int`,
        uniqueSessions: sql<number>`count(distinct ${whatsappClickEventsTable.sessionId})::int`,
      })
      .from(whatsappClickEventsTable)
      .where(and(gte(whatsappClickEventsTable.createdAt, start), lte(whatsappClickEventsTable.createdAt, end)))
      .groupBy(sql`date_trunc(${dateTrunc}, ${whatsappClickEventsTable.createdAt})`)
      .orderBy(sql`date_trunc(${dateTrunc}, ${whatsappClickEventsTable.createdAt})`);

    res.json({ points: rows });
  } catch (err) {
    logger.error({ err }, "Failed to fetch WhatsApp timeseries");
    res.status(500).json({ error: "Failed to load timeseries data" });
  }
});

// 3. CTA Performance
router.get("/admin/whatsapp/ctas", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = parseDateFilter(req.query);

    const rows = await db
      .select({
        ctaId: whatsappClickEventsTable.ctaId,
        clicks: sql<number>`count(*)::int`,
        uniqueSessions: sql<number>`count(distinct ${whatsappClickEventsTable.sessionId})::int`,
        uniqueVisitors: sql<number>`count(distinct ${whatsappClickEventsTable.visitorId})::int`,
      })
      .from(whatsappClickEventsTable)
      .where(and(gte(whatsappClickEventsTable.createdAt, start), lte(whatsappClickEventsTable.createdAt, end)))
      .groupBy(whatsappClickEventsTable.ctaId)
      .orderBy(desc(sql`count(*)`));

    const totalClicks = rows.reduce((sum, r) => sum + r.clicks, 0);

    const ctaLabels: Record<string, string> = {
      product_card: "بطاقة المنتج (القائمة)",
      product_detail: "صفحة المنتج (التفاصيل)",
      product_detail_ssr: "صفحة المنتج (SSR)",
      footer_contact: "تذييل الموقع (Footer)",
      header_contact: "رأس الموقع (Header)",
      about_contact: "صفحة من نحن (About)",
      how_it_works_contact: "صفحة طريقة الشراء",
      coc_hub_contact: "قسم كلاش أوف كلانس",
      cr_hub_contact: "قسم كلاش رويال",
      floating_button: "الزر العائم",
      support: "الدعم الفني",
      custom: "مخصص",
    };

    const result = rows.map((r) => ({
      ctaId: r.ctaId,
      label: ctaLabels[r.ctaId] || r.ctaId,
      clicks: r.clicks,
      uniqueSessions: r.uniqueSessions,
      uniqueVisitors: r.uniqueVisitors,
      share: totalClicks > 0 ? Math.round((r.clicks / totalClicks) * 100) : 0,
    }));

    res.json({ ctas: result, totalClicks });
  } catch (err) {
    logger.error({ err }, "Failed to fetch WhatsApp CTAs");
    res.status(500).json({ error: "Failed to load CTA performance" });
  }
});

// 4. Product Performance
router.get("/admin/whatsapp/products", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = parseDateFilter(req.query);

    const rows = await db
      .select({
        accountId: whatsappClickEventsTable.accountId,
        title: whatsappClickEventsTable.accountTitle,
        game: whatsappClickEventsTable.accountGame,
        townHall: whatsappClickEventsTable.accountTownHall,
        price: whatsappClickEventsTable.accountPrice,
        clicks: sql<number>`count(*)::int`,
        uniqueClickers: sql<number>`count(distinct ${whatsappClickEventsTable.visitorId})::int`,
      })
      .from(whatsappClickEventsTable)
      .where(
        and(
          gte(whatsappClickEventsTable.createdAt, start),
          lte(whatsappClickEventsTable.createdAt, end),
          sql`${whatsappClickEventsTable.accountId} IS NOT NULL`
        )
      )
      .groupBy(
        whatsappClickEventsTable.accountId,
        whatsappClickEventsTable.accountTitle,
        whatsappClickEventsTable.accountGame,
        whatsappClickEventsTable.accountTownHall,
        whatsappClickEventsTable.accountPrice
      )
      .orderBy(desc(sql`count(*)`))
      .limit(50);

    res.json({ products: rows });
  } catch (err) {
    logger.error({ err }, "Failed to fetch WhatsApp products");
    res.status(500).json({ error: "Failed to load product performance" });
  }
});

// 5. Page Performance
router.get("/admin/whatsapp/pages", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = parseDateFilter(req.query);

    const rows = await db
      .select({
        sourcePage: sql<string>`COALESCE(${whatsappClickEventsTable.sourcePath}, ${whatsappClickEventsTable.sourcePage}, 'غير محدد')`,
        clicks: sql<number>`count(*)::int`,
        uniqueClickers: sql<number>`count(distinct ${whatsappClickEventsTable.visitorId})::int`,
      })
      .from(whatsappClickEventsTable)
      .where(and(gte(whatsappClickEventsTable.createdAt, start), lte(whatsappClickEventsTable.createdAt, end)))
      .groupBy(sql`COALESCE(${whatsappClickEventsTable.sourcePath}, ${whatsappClickEventsTable.sourcePage}, 'غير محدد')`)
      .orderBy(desc(sql`count(*)`))
      .limit(50);

    res.json({ pages: rows });
  } catch (err) {
    logger.error({ err }, "Failed to fetch WhatsApp page performance");
    res.status(500).json({ error: "Failed to load page performance" });
  }
});

// 6. Traffic Source Analytics
router.get("/admin/whatsapp/sources", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = parseDateFilter(req.query);

    const rows = await db
      .select({
        source: sql<string>`COALESCE(${whatsappClickEventsTable.utmSource}, ${whatsappClickEventsTable.referrer}, 'Direct / مباشر')`,
        medium: sql<string>`COALESCE(${whatsappClickEventsTable.utmMedium}, '-')`,
        campaign: sql<string>`COALESCE(${whatsappClickEventsTable.utmCampaign}, '-')`,
        clicks: sql<number>`count(*)::int`,
        uniqueVisitors: sql<number>`count(distinct ${whatsappClickEventsTable.visitorId})::int`,
      })
      .from(whatsappClickEventsTable)
      .where(and(gte(whatsappClickEventsTable.createdAt, start), lte(whatsappClickEventsTable.createdAt, end)))
      .groupBy(
        sql`COALESCE(${whatsappClickEventsTable.utmSource}, ${whatsappClickEventsTable.referrer}, 'Direct / مباشر')`,
        sql`COALESCE(${whatsappClickEventsTable.utmMedium}, '-')`,
        sql`COALESCE(${whatsappClickEventsTable.utmCampaign}, '-')`
      )
      .orderBy(desc(sql`count(*)`))
      .limit(50);

    res.json({ sources: rows });
  } catch (err) {
    logger.error({ err }, "Failed to fetch WhatsApp sources");
    res.status(500).json({ error: "Failed to load traffic sources" });
  }
});

// 7. Device Breakdown
router.get("/admin/whatsapp/devices", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = parseDateFilter(req.query);

    const deviceRows = await db
      .select({
        deviceType: whatsappClickEventsTable.deviceType,
        clicks: sql<number>`count(*)::int`,
      })
      .from(whatsappClickEventsTable)
      .where(and(gte(whatsappClickEventsTable.createdAt, start), lte(whatsappClickEventsTable.createdAt, end)))
      .groupBy(whatsappClickEventsTable.deviceType);

    const total = deviceRows.reduce((sum, r) => sum + r.clicks, 0);

    const devices = {
      mobile: { clicks: 0, percentage: 0 },
      tablet: { clicks: 0, percentage: 0 },
      desktop: { clicks: 0, percentage: 0 },
    };

    for (const r of deviceRows) {
      if (r.deviceType in devices) {
        devices[r.deviceType as keyof typeof devices].clicks = r.clicks;
        devices[r.deviceType as keyof typeof devices].percentage =
          total > 0 ? Math.round((r.clicks / total) * 100) : 0;
      }
    }

    const browserRows = await db
      .select({
        browser: sql<string>`COALESCE(${whatsappClickEventsTable.browser}, 'Other')`,
        clicks: sql<number>`count(*)::int`,
      })
      .from(whatsappClickEventsTable)
      .where(and(gte(whatsappClickEventsTable.createdAt, start), lte(whatsappClickEventsTable.createdAt, end)))
      .groupBy(sql`COALESCE(${whatsappClickEventsTable.browser}, 'Other')`)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const osRows = await db
      .select({
        os: sql<string>`COALESCE(${whatsappClickEventsTable.os}, 'Other')`,
        clicks: sql<number>`count(*)::int`,
      })
      .from(whatsappClickEventsTable)
      .where(and(gte(whatsappClickEventsTable.createdAt, start), lte(whatsappClickEventsTable.createdAt, end)))
      .groupBy(sql`COALESCE(${whatsappClickEventsTable.os}, 'Other')`)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    res.json({ devices, browsers: browserRows, operatingSystems: osRows, total });
  } catch (err) {
    logger.error({ err }, "Failed to fetch WhatsApp devices");
    res.status(500).json({ error: "Failed to load device breakdown" });
  }
});

// 8. Hourly & Weekday Insights
router.get("/admin/whatsapp/hourly", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = parseDateFilter(req.query);

    const hourlyRows = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${whatsappClickEventsTable.createdAt})::int`,
        clicks: sql<number>`count(*)::int`,
      })
      .from(whatsappClickEventsTable)
      .where(and(gte(whatsappClickEventsTable.createdAt, start), lte(whatsappClickEventsTable.createdAt, end)))
      .groupBy(sql`EXTRACT(HOUR FROM ${whatsappClickEventsTable.createdAt})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${whatsappClickEventsTable.createdAt})`);

    // Fill all 24 hours
    const hourMap = new Map<number, number>();
    for (let h = 0; h < 24; h++) hourMap.set(h, 0);
    for (const r of hourlyRows) hourMap.set(r.hour, r.clicks);

    const hourly = Array.from(hourMap.entries()).map(([hour, clicks]) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      clicks,
    }));

    // Weekday vs Weekend (Friday/Saturday in Gulf, or standard)
    const dowRows = await db
      .select({
        dow: sql<number>`EXTRACT(DOW FROM ${whatsappClickEventsTable.createdAt})::int`,
        clicks: sql<number>`count(*)::int`,
      })
      .from(whatsappClickEventsTable)
      .where(and(gte(whatsappClickEventsTable.createdAt, start), lte(whatsappClickEventsTable.createdAt, end)))
      .groupBy(sql`EXTRACT(DOW FROM ${whatsappClickEventsTable.createdAt})`);

    let weekdayClicks = 0;
    let weekendClicks = 0;
    for (const r of dowRows) {
      // 5 = Friday, 6 = Saturday (Gulf weekend)
      if (r.dow === 5 || r.dow === 6) {
        weekendClicks += r.clicks;
      } else {
        weekdayClicks += r.clicks;
      }
    }

    res.json({ hourly, weekdayClicks, weekendClicks });
  } catch (err) {
    logger.error({ err }, "Failed to fetch WhatsApp hourly breakdown");
    res.status(500).json({ error: "Failed to load hourly insights" });
  }
});

// 9. Recent Events Table (Paginated with Server-side filtering)
router.get("/admin/whatsapp/events", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = parseDateFilter(req.query);
    const page = Math.max(1, parseInt((req.query["page"] as string) || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt((req.query["limit"] as string) || "25", 10)));
    const offset = (page - 1) * limit;

    const search = (req.query["search"] as string)?.trim();
    const ctaId = (req.query["ctaId"] as string)?.trim();
    const deviceType = (req.query["deviceType"] as string)?.trim();
    const trafficType = (req.query["trafficType"] as string)?.trim();

    const filters = [
      gte(whatsappClickEventsTable.createdAt, start),
      lte(whatsappClickEventsTable.createdAt, end),
    ];

    if (ctaId) filters.push(eq(whatsappClickEventsTable.ctaId, ctaId));
    if (deviceType) filters.push(eq(whatsappClickEventsTable.deviceType, deviceType));
    if (trafficType) filters.push(eq(whatsappClickEventsTable.trafficType, trafficType));
    if (search) {
      filters.push(
        or(
          ilike(whatsappClickEventsTable.accountTitle, `%${search}%`),
          ilike(whatsappClickEventsTable.sourcePage, `%${search}%`),
          ilike(whatsappClickEventsTable.utmSource, `%${search}%`),
          ilike(whatsappClickEventsTable.ctaId, `%${search}%`)
        )!
      );
    }

    const whereClause = and(...filters);

    const [countResult] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(whatsappClickEventsTable)
      .where(whereClause);

    const total = countResult?.total || 0;

    const events = await db
      .select({
        id: whatsappClickEventsTable.id,
        createdAt: whatsappClickEventsTable.createdAt,
        ctaId: whatsappClickEventsTable.ctaId,
        accountId: whatsappClickEventsTable.accountId,
        accountTitle: whatsappClickEventsTable.accountTitle,
        accountGame: whatsappClickEventsTable.accountGame,
        sourcePage: whatsappClickEventsTable.sourcePage,
        sourcePath: whatsappClickEventsTable.sourcePath,
        utmSource: whatsappClickEventsTable.utmSource,
        deviceType: whatsappClickEventsTable.deviceType,
        browser: whatsappClickEventsTable.browser,
        os: whatsappClickEventsTable.os,
        country: whatsappClickEventsTable.country,
        trafficType: whatsappClickEventsTable.trafficType,
        sessionId: sql<string>`substr(${whatsappClickEventsTable.sessionId}, 1, 12)`,
        isUniqueClick: whatsappClickEventsTable.isUniqueClick,
      })
      .from(whatsappClickEventsTable)
      .where(whereClause)
      .orderBy(desc(whatsappClickEventsTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch WhatsApp events");
    res.status(500).json({ error: "Failed to load events" });
  }
});

// 10. CSV Export
router.get("/admin/whatsapp/export", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = parseDateFilter(req.query);

    const events = await db
      .select({
        id: whatsappClickEventsTable.id,
        createdAt: whatsappClickEventsTable.createdAt,
        ctaId: whatsappClickEventsTable.ctaId,
        accountTitle: whatsappClickEventsTable.accountTitle,
        accountGame: whatsappClickEventsTable.accountGame,
        accountPrice: whatsappClickEventsTable.accountPrice,
        sourcePage: whatsappClickEventsTable.sourcePage,
        utmSource: whatsappClickEventsTable.utmSource,
        utmMedium: whatsappClickEventsTable.utmMedium,
        utmCampaign: whatsappClickEventsTable.utmCampaign,
        deviceType: whatsappClickEventsTable.deviceType,
        browser: whatsappClickEventsTable.browser,
        os: whatsappClickEventsTable.os,
        country: whatsappClickEventsTable.country,
        trafficType: whatsappClickEventsTable.trafficType,
        isUniqueClick: whatsappClickEventsTable.isUniqueClick,
      })
      .from(whatsappClickEventsTable)
      .where(and(gte(whatsappClickEventsTable.createdAt, start), lte(whatsappClickEventsTable.createdAt, end)))
      .orderBy(desc(whatsappClickEventsTable.createdAt))
      .limit(5000);

    const header = [
      "ID",
      "Timestamp",
      "CTA",
      "Product",
      "Game",
      "Price",
      "Source Page",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Device",
      "Browser",
      "OS",
      "Country",
      "Traffic Type",
      "Unique Click",
    ].join(",");

    const rows = events.map((e) => {
      const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      return [
        e.id,
        escape(e.createdAt?.toISOString()),
        escape(e.ctaId),
        escape(e.accountTitle),
        escape(e.accountGame),
        escape(e.accountPrice),
        escape(e.sourcePage),
        escape(e.utmSource),
        escape(e.utmMedium),
        escape(e.utmCampaign),
        escape(e.deviceType),
        escape(e.browser),
        escape(e.os),
        escape(e.country),
        escape(e.trafficType),
        e.isUniqueClick ? "Yes" : "No",
      ].join(",");
    });

    const csvContent = "\uFEFF" + [header, ...rows].join("\r\n"); // UTF-8 BOM for Excel Arabic support

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="whatsapp-clicks-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (err) {
    logger.error({ err }, "Failed to export WhatsApp events CSV");
    res.status(500).json({ error: "Failed to export CSV" });
  }
});

export default router;
