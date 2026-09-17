import { pgTable, serial, text, numeric, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { accountsTable } from "./accounts";

export const whatsappClickEventsTable = pgTable(
  "whatsapp_click_events",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sessionId: text("session_id").notNull(),
    visitorId: text("visitor_id").notNull(),
    sourcePage: text("source_page"),
    sourcePath: text("source_path"),
    referrer: text("referrer"),
    accountId: integer("account_id").references(() => accountsTable.id, { onDelete: "set null" }),
    accountTitle: text("account_title"),
    accountGame: text("account_game"),
    accountTownHall: integer("account_town_hall"),
    accountPrice: numeric("account_price", { precision: 10, scale: 2 }),
    ctaId: text("cta_id").notNull(),
    buttonLocation: text("button_location"),
    buttonType: text("button_type"),
    destinationType: text("destination_type").notNull().default("whatsapp"),
    targetNumber: text("target_number"),
    campaign: text("campaign"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),
    deviceType: text("device_type").notNull().default("desktop"), // mobile | tablet | desktop
    browser: text("browser"),
    os: text("os"),
    country: text("country"),
    language: text("language"),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    trafficType: text("traffic_type").notNull().default("human"), // human | bot | suspicious
    isUniqueClick: boolean("is_unique_click").notNull().default(true),
    metadata: text("metadata"),
  },
  (table) => [
    index("idx_wa_events_created_at").on(table.createdAt),
    index("idx_wa_events_account_id").on(table.accountId),
    index("idx_wa_events_cta_id").on(table.ctaId),
    index("idx_wa_events_session_id").on(table.sessionId),
    index("idx_wa_events_visitor_id").on(table.visitorId),
    index("idx_wa_events_utm_source").on(table.utmSource),
    index("idx_wa_events_utm_campaign").on(table.utmCampaign),
    index("idx_wa_events_device_type").on(table.deviceType),
    index("idx_wa_events_traffic_type").on(table.trafficType),
  ]
);

export const whatsappClickDailyAggregatesTable = pgTable(
  "whatsapp_click_daily_aggregates",
  {
    id: serial("id").primaryKey(),
    date: text("date").notNull(), // YYYY-MM-DD
    ctaId: text("cta_id").notNull(),
    accountId: integer("account_id"),
    source: text("source").notNull().default("direct"),
    deviceType: text("device_type").notNull().default("desktop"),
    clicks: integer("clicks").notNull().default(0),
    uniqueSessions: integer("unique_sessions").notNull().default(0),
    uniqueVisitors: integer("unique_visitors").notNull().default(0),
  },
  (table) => [
    index("idx_wa_agg_date").on(table.date),
    index("idx_wa_agg_cta_id").on(table.ctaId),
    index("idx_wa_agg_account_id").on(table.accountId),
    index("idx_wa_agg_source").on(table.source),
  ]
);

export const insertWhatsAppClickEventSchema = createInsertSchema(whatsappClickEventsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertWhatsAppClickEvent = z.infer<typeof insertWhatsAppClickEventSchema>;
export type WhatsAppClickEvent = typeof whatsappClickEventsTable.$inferSelect;

export const insertWhatsAppClickDailyAggregateSchema = createInsertSchema(whatsappClickDailyAggregatesTable).omit({
  id: true,
});
export type InsertWhatsAppClickDailyAggregate = z.infer<typeof insertWhatsAppClickDailyAggregateSchema>;
export type WhatsAppClickDailyAggregate = typeof whatsappClickDailyAggregatesTable.$inferSelect;
