-- Migration: WhatsApp Click Tracking & Aggregates
CREATE TABLE IF NOT EXISTS "whatsapp_click_events" (
  "id" SERIAL PRIMARY KEY,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "session_id" TEXT NOT NULL,
  "visitor_id" TEXT NOT NULL,
  "source_page" TEXT,
  "source_path" TEXT,
  "referrer" TEXT,
  "account_id" INTEGER REFERENCES "accounts"("id") ON DELETE SET NULL,
  "account_title" TEXT,
  "account_game" TEXT,
  "account_town_hall" INTEGER,
  "account_price" NUMERIC(10, 2),
  "cta_id" TEXT NOT NULL,
  "button_location" TEXT,
  "button_type" TEXT,
  "destination_type" TEXT NOT NULL DEFAULT 'whatsapp',
  "target_number" TEXT,
  "campaign" TEXT,
  "utm_source" TEXT,
  "utm_medium" TEXT,
  "utm_campaign" TEXT,
  "utm_content" TEXT,
  "utm_term" TEXT,
  "device_type" TEXT NOT NULL DEFAULT 'desktop',
  "browser" TEXT,
  "os" TEXT,
  "country" TEXT,
  "language" TEXT,
  "ip_hash" TEXT,
  "user_agent" TEXT,
  "traffic_type" TEXT NOT NULL DEFAULT 'human',
  "is_unique_click" BOOLEAN NOT NULL DEFAULT TRUE,
  "metadata" TEXT
);

CREATE INDEX IF NOT EXISTS "idx_wa_events_created_at" ON "whatsapp_click_events" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_wa_events_account_id" ON "whatsapp_click_events" ("account_id");
CREATE INDEX IF NOT EXISTS "idx_wa_events_cta_id" ON "whatsapp_click_events" ("cta_id");
CREATE INDEX IF NOT EXISTS "idx_wa_events_session_id" ON "whatsapp_click_events" ("session_id");
CREATE INDEX IF NOT EXISTS "idx_wa_events_visitor_id" ON "whatsapp_click_events" ("visitor_id");
CREATE INDEX IF NOT EXISTS "idx_wa_events_utm_source" ON "whatsapp_click_events" ("utm_source");
CREATE INDEX IF NOT EXISTS "idx_wa_events_utm_campaign" ON "whatsapp_click_events" ("utm_campaign");
CREATE INDEX IF NOT EXISTS "idx_wa_events_device_type" ON "whatsapp_click_events" ("device_type");
CREATE INDEX IF NOT EXISTS "idx_wa_events_traffic_type" ON "whatsapp_click_events" ("traffic_type");

CREATE TABLE IF NOT EXISTS "whatsapp_click_daily_aggregates" (
  "id" SERIAL PRIMARY KEY,
  "date" TEXT NOT NULL,
  "cta_id" TEXT NOT NULL,
  "account_id" INTEGER,
  "source" TEXT NOT NULL DEFAULT 'direct',
  "device_type" TEXT NOT NULL DEFAULT 'desktop',
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "unique_sessions" INTEGER NOT NULL DEFAULT 0,
  "unique_visitors" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "idx_wa_agg_date" ON "whatsapp_click_daily_aggregates" ("date");
CREATE INDEX IF NOT EXISTS "idx_wa_agg_cta_id" ON "whatsapp_click_daily_aggregates" ("cta_id");
CREATE INDEX IF NOT EXISTS "idx_wa_agg_account_id" ON "whatsapp_click_daily_aggregates" ("account_id");
CREATE INDEX IF NOT EXISTS "idx_wa_agg_source" ON "whatsapp_click_daily_aggregates" ("source");
