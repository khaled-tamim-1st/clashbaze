# Automated SEO & QA Audit Matrix
*Execution Date: 2026-09-16T14:02:21.609Z*

| Route | Status | HTTP | SSR | Indexable | Canonical | H1 | Title | Description | Schema | Internal Links | Game Isolation |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `/` | ✅ PASS | 200 OK | PASS | PASS | PASS (Exact Match) | PASS (Single H1) | PASS (Unique) | PASS (Unique) | PASS (WebSite+Org+FAQ+ItemList) | PASS | PASS (Partitioned) |
| `/clash-of-clans` | ✅ PASS | 200 OK | PASS | PASS | PASS (Exact Match) | PASS (Single H1) | PASS (Unique) | PASS (Unique) | PASS (Breadcrumb+FAQ+ItemList) | PASS | PASS (100% CoC) |
| `/clash-of-clans/town-hall-18` | ✅ PASS | 200 OK | PASS | PASS | PASS (Exact Match) | PASS (Single H1) | PASS (Unique) | PASS (Unique) | PASS (Breadcrumb+FAQ+ItemList) | PASS | PASS (100% CoC TH18) |
| `/clash-of-clans/town-hall-17` | ✅ PASS | 200 OK | PASS | PASS | PASS (Exact Match) | PASS (Single H1) | PASS (Unique) | PASS (Unique) | PASS (Breadcrumb+FAQ+ItemList) | PASS | PASS (100% CoC TH17) |
| `/clash-of-clans/town-hall-16` | ✅ PASS | 200 OK | PASS | PASS | PASS (Exact Match) | PASS (Single H1) | PASS (Unique) | PASS (Unique) | PASS (Breadcrumb+FAQ+ItemList) | PASS | PASS (100% CoC TH16) |
| `/clash-royale` | ✅ PASS | 200 OK | PASS | PASS | PASS (Exact Match) | PASS (Single H1) | PASS (Unique) | PASS (Unique) | PASS (Breadcrumb+FAQ+ItemList) | PASS | PASS (100% CR) |
| `/account/:slug` | ✅ PASS | 200 OK | PASS | PASS | PASS (Exact Match) | PASS (Single H1) | PASS (Unique) | PASS (Unique) | PASS (Product+Offer) | PASS | PASS (Isolated) |
| `/clash-of-clans?townHall=18` | ✅ PASS | 301 Redirect | N/A (Redirect) | N/A | /clash-of-clans/town-hall-18 | N/A | N/A | N/A | N/A | PASS | PASS |
| `/clash-of-clans?townHall=17` | ✅ PASS | 301 Redirect | N/A (Redirect) | N/A | /clash-of-clans/town-hall-17 | N/A | N/A | N/A | N/A | PASS | PASS |
| `/clash-of-clans?townHall=16` | ✅ PASS | 301 Redirect | N/A (Redirect) | N/A | /clash-of-clans/town-hall-16 | N/A | N/A | N/A | N/A | PASS | PASS |
| `/town-hall-18` | ✅ PASS | 301 Redirect | N/A (Redirect) | N/A | /clash-of-clans/town-hall-18 | N/A | N/A | N/A | N/A | PASS | PASS |
| `/sitemap.xml` | ✅ PASS | 200 OK | XML Valid | PASS | https://www.clashmarket.online/sitemap.xml | N/A (XML) | N/A (XML) | N/A (XML) | XML Schema | PASS | PASS |


### Summary of Guardrails Validated:
1. **HTTP Status**: All canonical routes return 200 OK; legacy filter queries return 301 Permanent Redirect.
2. **SSR Completeness & SPA Parity**: Initial SSR HTML and SPA DOM contain identical semantics, meta tags, breadcrumbs, and schema.
3. **Single H1 Tag**: Exactly one H1 per page matching the page topic across SSR and React SPA.
4. **Unique Titles**: 0 duplicate titles across all landing pages without duplicate branding.
5. **Unique Meta Descriptions**: 0 duplicate descriptions across all landing pages.
6. **Canonical Tags**: Absolute URLs with exact path matches.
7. **Indexability**: All canonical landing pages allow indexing without inadvertent noindex tags.
8. **Authentic Schema**: BreadcrumbList, FAQPage, ItemList, Product + Offer. ZERO fake ratings or reviews.
9. **301 Legacy Redirects**: `?townHall=18|17|16` and `/town-hall-18|17|16` redirect permanently to `/clash-of-clans/town-hall-*` in both SSR and SPA.
10. **Data & Game Isolation**: Strict SQL filtering separates Clash of Clans from Clash Royale and isolates Town Hall levels.
