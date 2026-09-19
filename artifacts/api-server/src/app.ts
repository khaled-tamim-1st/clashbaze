import express, { type Express } from "express";
import path from "node:path";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import homePageRouter from "./routes/homePage";
import blogPagesRouter from "./routes/blogpages";
import gamePagesRouter from "./routes/gamePages";
import accountPagesRouter from "./routes/accountpages";
import policyPagesRouter from "./routes/policyPages";
import reviewPagesRouter from "./routes/reviewPages";

import whatsappTrackingRouter from "./routes/whatsappTracking";
import sitemapRouter from "./routes/sitemap";
import { logger } from "./lib/logger";

const app: Express = express();

// 1. تسجيل الـ Logger
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// 2. إعدادات الـ CORS والـ Body Parser
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = [
  process.env["FRONTEND_URL"],
  ...(isProduction ? [] : ["http://localhost:5173", "http://127.0.0.1:5173"]),
].filter((origin): origin is string => Boolean(origin));

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. مسارات الـ API - تعطيل التخزين المؤقت لضمان المزامنة الفورية للبيانات
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  res.set("CDN-Cache-Control", "no-store");
  res.set("Cloudflare-CDN-Cache-Control", "no-store");
  next();
});
app.use("/api", router);

// مسار التتبع المباشر لروابط الواتساب
app.use(whatsappTrackingRouter);

// تقديم الملفات الثابتة والصور (banners, images, favicon) لضمان عدم حدوث خطأ 404 للصور على الـ VPS
const publicDistDir = path.resolve(process.cwd(), "artifacts/clash-base-market/dist/public");
const publicSrcDir = path.resolve(process.cwd(), "artifacts/clash-base-market/public");
app.use(express.static(publicDistDir, { index: false }));
app.use(express.static(publicSrcDir, { index: false }));

// 3.5. تسريع الاستجابة وتحسين الـ TTFB عبر Edge Caching لمحركات البحث والزوار
app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD") {
    if (!req.path.startsWith("/api") && !req.path.startsWith("/admin") && !req.path.startsWith("/go")) {
      res.set("Cache-Control", "public, max-age=120, s-maxage=3600, stale-while-revalidate=86400");
    }
  }
  next();
});

// 4. تقديم صفحات الـ HTML المباشرة فوراً
app.use(homePageRouter);
app.use(gamePagesRouter);
app.use(blogPagesRouter);
app.use(accountPagesRouter);
app.use(policyPagesRouter);
app.use(reviewPagesRouter);

app.use(sitemapRouter);

// 5. مسار حماية للمسارات غير المجهولة (404)
app.use((_req, res) => {
  res.status(404).send("الصفحة غير موجودة");
});

export default app;