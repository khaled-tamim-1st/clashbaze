# Original User Request

## 2026-09-16T12:14:25Z

Re-architect the Information Architecture, Technical SEO, SSR engine, and React frontend of https://www.clashmarket.online/ to establish distinct indexable landing pages for Town Hall categories (TH18, TH17, TH16), fully isolate Clash of Clans from Clash Royale across featured listings and data queries, embed responsive banners, clean up structured data, implement 301 redirects for legacy filter query URLs, and rigorously verify crawlability and rendering consistency.

Working directory: c:/Users/Dell/Desktop/New folder/clashbaze
Integrity mode: development

## Requirements

### R1. Technical SEO & SSR Architecture
- Build server-side rendered (SSR) endpoints in the Express server for:
  - `/clash-of-clans`
  - `/clash-of-clans/town-hall-18`
  - `/clash-of-clans/town-hall-17`
  - `/clash-of-clans/town-hall-16`
  - `/clash-royale`
  - `/account/:slug`
- Ensure each page emits a unique Title, unique Meta Description, single H1, canonical URL (`https://www.clashmarket.online/...`), breadcrumbs HTML & JSON-LD, educational copy, and category-specific FAQ schema.
- Implement 301 permanent redirects for legacy query URLs like `/clash-of-clans?townHall=18` to their canonical landing pages.
- Dynamic `sitemap.xml` must include all canonical category and subcategory URLs.

### R2. Strict Game & Category Data Isolation
- Backend API (`GET /api/accounts`) and client query hooks must support `game`, `townHall`, and `featured` filtering directly in SQL/Drizzle queries without CSS-based hiding.
- Featured sections must never mix games:
  - `/clash-of-clans` shows only featured Clash of Clans accounts.
  - `/clash-royale` shows only featured Clash Royale accounts.
  - Subcategory landing pages (`/clash-of-clans/town-hall-18`, etc.) show only accounts matching that exact Town Hall and game.
- Homepage featured accounts must be clearly partitioned with distinct CTAs leading to each game's hub.

### R3. React SPA Routing & UI Components
- Register `/clash-of-clans/town-hall-18`, `/town-hall-17`, and `/town-hall-16` in `App.tsx` using a reusable, configuration-driven `TownHallCategory.tsx` component.
- Integrate the 3 newly provided Town Hall banners (`th18-banner.png`, `th17-banner.png`, `th16-banner.png` already placed in `artifacts/clash-base-market/public/banners/`) inside the Clash of Clans section as fast, accessible visual navigation cards with proper dimensions, lazy-loading, and descriptive alt text.
- Maintain responsive layout and typography across mobile and desktop.

### R4. Structured Data & Product Compliance
- Clean up `AccountDetail.tsx` and SSR account renderer: use authentic `Product` + `Offer` schema derived strictly from existing account data (name, image, description, price, currency, availability, seller, URL).
- Forbid any hardcoded or fabricated `AggregateRating`, `Review`, `ratingCount`, or fake review bodies.

### R5. Comprehensive Automated QA & SEO Verification
- Create an automated Node.js verification script (`scripts/seo-audit.mjs` or similar) that crawls and audits the primary routes, verifying HTTP status, uniqueness of title/description/H1, canonical tags, JSON-LD syntax, absence of duplicate titles, game isolation, and sitemap presence.
- Output a comprehensive verification matrix in markdown:
  `Route | Status | HTTP | SSR | Indexable | Canonical | H1 | Title | Description | Schema | Internal Links | Game Isolation`

## Acceptance Criteria

### Functional & Data Isolation
- [ ] Direct navigation, page refresh, and deep links work seamlessly for all new routes on production without broken states.
- [ ] Clash of Clans featured listings contain zero Clash Royale items.
- [ ] Clash Royale featured listings contain zero Clash of Clans items.
- [ ] TH18, TH17, and TH16 pages display only accounts with the exact matching Town Hall level.
- [ ] The 3 visual Town Hall banners appear cleanly in the Clash of Clans section and link directly to their corresponding landing pages.

### Technical SEO & Schema
- [ ] All 6 key routes return HTTP 200 with complete initial SSR HTML containing H1, intro text, breadcrumbs, and schema.
- [ ] Zero duplicate titles or meta descriptions across all category and landing pages.
- [ ] Legacy filter URLs (e.g. `/clash-of-clans?townHall=18`) redirect with 301 to `/clash-of-clans/town-hall-18`.
- [ ] Product schema on account pages contains only genuine Product + Offer data without fake ratings or reviews.
- [ ] `sitemap.xml` dynamically includes `/clash-of-clans/town-hall-18`, `/town-hall-17`, and `/town-hall-16`.

### Automated Verification Matrix
- [ ] Verification script runs successfully and proves all guardrails pass without regressions.
