import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import homePageRouter from "./routes/homePage";
import blogPagesRouter from "./routes/blogpages";
import accountPagesRouter from "./routes/accountpages";

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

// 3. مسارات الـ API
app.use("/api", router);

// 4. تقديم صفحات الـ HTML المباشرة فوراً
app.use(homePageRouter);
app.use(blogPagesRouter);
app.use(accountPagesRouter);

app.use(sitemapRouter);

// 5. مسار حماية للمسارات غير المجهولة (404)
app.use((_req, res) => {
  res.status(404).send("الصفحة غير موجودة");
});

export default app;