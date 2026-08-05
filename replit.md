# كلاش ماركت — Clash Market

Arabic gaming marketplace for buying and selling Clash of Clans and Clash Royale accounts, targeting Saudi Arabia and the Gulf region.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/clash-base-market run dev` — run the frontend (port 24059)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Tajawal Arabic font, Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: Firebase Authentication (Email/Password)
- Image upload: Cloudinary
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- DB schema: `lib/db/src/schema/` (accounts.ts, blog.ts)
- API spec: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- API routes: `artifacts/api-server/src/routes/` (accounts.ts, blog.ts, admin.ts)
- Frontend pages: `artifacts/clash-base-market/src/pages/`
- Firebase config: `artifacts/clash-base-market/src/lib/firebase.ts`
- Auth context: `artifacts/clash-base-market/src/contexts/AuthContext.tsx`

## Architecture decisions

- Firebase is used only for admin authentication (frontend-side); no Firebase SDK on the server.
- All marketplace data (accounts, blog posts) lives in Replit PostgreSQL via Drizzle ORM.
- Cloudinary upload goes through the `/api/upload/image` backend endpoint to keep credentials server-side.
- The entire site is Arabic RTL using the Tajawal Google Font.
- No shopping cart — every purchase goes through a dynamic WhatsApp link.

## Product

- Public marketplace with Clash of Clans and Clash Royale account listings
- Account detail pages with image gallery, full stats, WhatsApp purchase button
- Blog system for Arabic SEO content targeting Saudi/Gulf gamers
- Full admin dashboard (protected by Firebase auth) for managing accounts and blog posts

## User preferences

- Arabic RTL throughout — all visible text must be in Arabic
- Dark navy + gold color scheme
- WhatsApp-only purchase flow (no cart/checkout)
- Firebase Authentication for admin, PostgreSQL for all data
- Admin email: `owner@clashbaze.com` — only this account gets access to the admin panel

## Gotchas

- Google Font import (`@import url(...)`) must be the VERY FIRST line of `index.css`
- Firebase package must be in `artifacts/clash-base-market/package.json` (not workspace root)
- API routes for accounts must be registered BEFORE `:slug` param routes in Express to avoid conflicts
- `VITE_*` prefix required for all frontend-accessible env vars

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
