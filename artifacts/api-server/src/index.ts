import app from "./app";
import { logger } from "./lib/logger";
import { initWhatsAppTables, initReviewsTable } from "@workspace/db";

// Safely ensure WhatsApp tables are initialized on startup
initWhatsAppTables().catch((err) => {
  logger.warn({ err }, "WhatsApp tracking tables check/initialization deferred");
});

// Safely ensure Reviews table is initialized and seeded on startup
initReviewsTable().catch((err) => {
  logger.warn({ err }, "Reviews table check/initialization deferred");
});

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
