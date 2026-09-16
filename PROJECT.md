# Project: ClashBaze Re-architecture & Technical SEO

## Architecture
- **Monorepo / Package Structure**:
  - `artifacts/api-server`: Express.js backend and SSR engine. Serves API endpoints under `/api`, renders direct semantic HTML for crawlers and bots, handles 301 redirects, and generates dynamic `sitemap.xml`.
  - `artifacts/clash-base-market`: Vite + React SPA. Handles client-side navigation, interactive filtering, Town Hall category pages, visual banner cards, and account details.
  - `artifacts/worker`: Cloudflare Worker edge reverse proxy. Inspects user agents: proxies bots and crawlers to Express VPS origin; proxies human browsers to static frontend.
  - `lib/db`: Database schema definition using Drizzle ORM and PostgreSQL connection pooler (Supabase).
  - `lib/api-spec`: OpenAPI 3.0 specification (`openapi.yaml`).
  - `lib/api-client-react`: Generated React Query hooks and TypeScript types (`api.schemas.ts`, `api.ts`).
  - `scripts`: Automated QA, SEO verification, and crawl testing scripts.
- **Data Flow**:
  - Client / Crawler -> Edge Worker -> API Server (SSR HTML) or Static Pages.
  - Express SSR & API Server -> Drizzle ORM -> PostgreSQL database.
  - Drizzle queries enforce strict data isolation (`game`, `townHall`, `featured`, `status = 'available'`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | API Query Filtering | `GET /api/accounts` Drizzle SQL filtering on `game`, `townHall`, `featured`, `status` without CSS hiding | M1 | ORIGINAL_REQUEST §R2 |
| 2 | Featured Endpoint Isolation | `GET /api/accounts/featured` accepts `game` parameter and strictly filters accounts by game in SQL | M1 | ORIGINAL_REQUEST §R2 |
| 3 | Schema & Client Types Sync | Update `openapi.yaml` and `api.schemas.ts` (`ListAccountsParams`) to support `townHall` and `game` filtering | M1 | ORIGINAL_REQUEST §R2 |
| 4 | SSR Category & Subcategory Endpoints | Express SSR handlers for `/clash-of-clans`, `/town-hall-18`, `/town-hall-17`, `/town-hall-16`, `/clash-royale`, `/account/:slug` | M2 | ORIGINAL_REQUEST §R1 |
| 5 | SEO Metadata & Schema Emission | Unique title, meta description, single H1, canonical URL, breadcrumbs HTML & JSON-LD, educational copy, FAQ schema per page | M2 | ORIGINAL_REQUEST §R1 |
| 6 | Legacy URL 301 Redirects | Permanent 301 redirects for `/clash-of-clans?townHall=18|17|16` to canonical subcategory landing pages | M2 | ORIGINAL_REQUEST §R1 |
| 7 | Dynamic Sitemap Generation | `sitemap.xml` dynamically includes canonical category and subcategory URLs with proper lastmod and priorities | M2 | ORIGINAL_REQUEST §R1 |
| 8 | TownHallCategory Component | Reusable, configuration-driven `TownHallCategory.tsx` component with dynamic SEO, educational text, FAQ, and accounts list | M3 | ORIGINAL_REQUEST §R3 |
| 9 | React SPA Route Registration | Register `/clash-of-clans/town-hall-18`, `/town-hall-17`, `/town-hall-16` in `App.tsx` | M3 | ORIGINAL_REQUEST §R3 |
| 10 | Town Hall Visual Banner Cards | Embed `th18-banner.png`, `th17-banner.png`, `th16-banner.png` in `ClashOfClans.tsx` as responsive cards with explicit dimensions (1024x393), lazy-loading, alt text | M3 | ORIGINAL_REQUEST §R3 |
| 11 | Homepage Featured Partitioning | Refactor `Home.tsx` to separate Clash of Clans and Clash Royale featured listings into distinct sections with dedicated CTAs | M3 | ORIGINAL_REQUEST §R2 |
| 12 | AccountDetail Structured Data Cleanup | Purge fake `AggregateRating`, `Review`, `ratingCount`, fake reviews from `AccountDetail.tsx` JSON-LD | M4 | ORIGINAL_REQUEST §R4 |
| 13 | SSR Account Structured Data Cleanup | Purge fake `AggregateRating`, `Review`, fake reviews from SSR `accountpages.ts` JSON-LD | M4 | ORIGINAL_REQUEST §R4 |
| 14 | Automated SEO Audit Script | Create `scripts/seo-audit.mjs` verifying HTTP status, SSR completeness, title/desc uniqueness, canonicals, H1s, schema, sitemap, game isolation | M5 | ORIGINAL_REQUEST §R5 |
| 15 | Markdown Verification Matrix | Output comprehensive audit matrix in markdown covering all 12 audited dimensions | M5 | ORIGINAL_REQUEST §R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Data Isolation & API Queries | `artifacts/api-server/src/routes/accounts.ts`, `lib/api-spec/openapi.yaml`, `lib/api-client-react` | None | COMPLETED |
| M2 | SSR Engine, Technical SEO, 301 Redirects & Dynamic Sitemap | `artifacts/api-server/src/routes/gamePages.ts`, `artifacts/api-server/src/routes/sitemap.ts` | M1 | COMPLETED |
| M3 | React SPA Routing, TownHallCategory Component & Banner Cards | `artifacts/clash-base-market/src/App.tsx`, `TownHallCategory.tsx`, `ClashOfClans.tsx`, `Home.tsx` | M1 | COMPLETED |
| M4 | Structured Data & Product Compliance | `artifacts/clash-base-market/src/pages/AccountDetail.tsx`, `artifacts/api-server/src/routes/accountpages.ts` | None | COMPLETED |
| M5 | Automated QA, SEO Audit Script & Full Verification | `scripts/seo-audit.mjs`, verification matrix execution | M1, M2, M3, M4 | COMPLETED |

## Interface Contracts

### API Server ↔ Client / Crawler (`GET /api/accounts`)
- Request Query:
  - `game?: "clash-of-clans" | "clash-royale"`
  - `townHall?: number` (integer 1-18)
  - `featured?: "true" | "false"`
  - `status?: "available" | "reserved" | "sold"`
  - `limit?: number`
  - `offset?: number`
- Response: `Array<Account>` (200 OK)
- Error Handling: Invalid parameters return 400 Bad Request with Zod validation errors.

### API Server ↔ Client / Crawler (`GET /api/accounts/featured`)
- Request Query:
  - `game?: "clash-of-clans" | "clash-royale"`
- Response: `Array<Account>` (200 OK) filtered strictly by `game` (if provided), `featured = true`, and `status = 'available'`.

### Express SSR Engine ↔ Web Crawlers
- Routes:
  - `GET /clash-of-clans`
  - `GET /clash-of-clans/town-hall-18`
  - `GET /clash-of-clans/town-hall-17`
  - `GET /clash-of-clans/town-hall-16`
  - `GET /clash-royale`
  - `GET /account/:slug`
- Redirect:
  - `GET /clash-of-clans?townHall=18` -> HTTP 301 `Location: /clash-of-clans/town-hall-18`
  - `GET /clash-of-clans?townHall=17` -> HTTP 301 `Location: /clash-of-clans/town-hall-17`
  - `GET /clash-of-clans?townHall=16` -> HTTP 301 `Location: /clash-of-clans/town-hall-16`
- Output: Full HTML document containing `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<h1>`, educational content, breadcrumbs, JSON-LD schema (`ItemList`, `Product`, `BreadcrumbList`, `FAQPage`).

## Code Layout
- `artifacts/api-server/src/routes/accounts.ts`: API route handlers for `/api/accounts` and `/api/accounts/featured`.
- `artifacts/api-server/src/routes/gamePages.ts`: SSR routes for game and Town Hall landing pages + 301 redirect logic.
- `artifacts/api-server/src/routes/sitemap.ts`: Dynamic sitemap XML generation.
- `artifacts/api-server/src/routes/accountpages.ts`: SSR route for account detail and authentic Product/Offer schema.
- `artifacts/clash-base-market/src/App.tsx`: Client SPA routing definitions.
- `artifacts/clash-base-market/src/pages/TownHallCategory.tsx`: Configuration-driven Town Hall subcategory page.
- `artifacts/clash-base-market/src/pages/ClashOfClans.tsx`: CoC hub with visual banner navigation cards.
- `artifacts/clash-base-market/src/pages/Home.tsx`: Homepage with partitioned featured sections.
- `artifacts/clash-base-market/src/pages/AccountDetail.tsx`: SPA account detail view with sanitized Product/Offer schema.
- `lib/api-spec/openapi.yaml`: OpenAPI schema definitions.
- `lib/api-client-react/src/generated/api.schemas.ts`: Generated TypeScript parameter types.
- `scripts/seo-audit.mjs`: Standalone automated SEO & QA verification script.
