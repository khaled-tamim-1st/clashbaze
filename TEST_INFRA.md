# E2E Test Infra: ClashBaze Re-architecture & Technical SEO

## Test Philosophy
- Opaque-box, requirement-driven, independently verifiable crawl & audit tests.
- Derives verification directly from `ORIGINAL_REQUEST.md` (R1 to R5) and acceptance criteria.
- Validates HTTP response codes, SSR HTML generation, metadata tags, canonical URLs, JSON-LD schemas, game isolation, 301 redirects, and sitemap presence.

## Feature Inventory & Test Mapping
| # | Feature | Requirement | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (E2E Scenarios) |
|---|---------|-------------|:-----------------:|:-----------------:|:-----------------:|:----------------------:|
| 1 | SSR Landing Pages | R1 | 5 routes checked | 404 on invalid subcategory | CoC vs CR routing | Bot crawler rendering |
| 2 | SEO & Schema Tags | R1 | Title, Meta, H1, Canonical | Multiple H1 check, duplicate titles | Schema JSON-LD validity | Googlebot rich snippet audit |
| 3 | 301 Legacy Redirects | R1 | `?townHall=18`, `17`, `16` | Unknown `?townHall=99`, missing params | Query string preserving | Redirect equity test |
| 4 | Dynamic Sitemap | R1 | `/sitemap.xml` presence | XML validity, lastmod date format | CoC & CR & TH URLs | Google Search Console format |
| 5 | Strict Game Isolation | R2 | `/api/accounts?game=...` | Featured CoC contains 0 CR | Featured CR contains 0 CoC | Multi-game catalog browse |
| 6 | Exact Town Hall Isolation | R2 | `/api/accounts?townHall=18` | TH17 empty state handling | TH16 contains 0 TH18 | Deep-link to Town Hall browse |
| 7 | Homepage Partitioning | R2 | Separate CoC & CR sections | Empty CR section handling | Distinct CTAs per section | First-time visitor home journey |
| 8 | TownHallCategory SPA | R3 | `/clash-of-clans/town-hall-*` | Non-existent TH route (404) | Navigation between TH levels | Client-side tab navigation |
| 9 | Town Hall Visual Banners | R3 | 3 banners rendered | Aspect ratio 1024x393, alt text | Lazy loading attributes | Visual CTA click journey |
| 10 | Authentic Product Schema | R4 | `Product` + `Offer` emitted | Zero `aggregateRating` | Zero fake reviews / author | Merchant compliance validation |

## Test Architecture
- Test Runner: Node.js audit script executed via `node scripts/seo-audit.mjs` (or `tsx scripts/src/seo-audit.ts`).
- Verification Output: Markdown matrix table written to stdout and recorded in `AUDIT_MATRIX.md`.
- Criteria: HTTP 200/301, HTML contains single H1, non-empty unique title, non-empty unique description, valid canonical URL, zero duplicate titles, valid JSON-LD without fake ratings/reviews, zero cross-game contamination in listings.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Bot crawls Town Hall 18 landing page | SSR, H1, Meta, Canonical, Schema, Breadcrumbs, CoC accounts | High |
| 2 | Legacy bookmark visits `/clash-of-clans?townHall=18` | 301 Redirect to `/clash-of-clans/town-hall-18` | Medium |
| 3 | User navigates from Home to CoC Hub, clicks TH17 banner | Homepage partitioning, Banner navigation, Empty state handling | Medium |
| 4 | Search engine scrapes `/sitemap.xml` | Dynamic sitemap, subcategory URLs, priority/lastmod | Low |
| 5 | Buyer views account detail page | AccountDetail SPA + SSR, authentic Product/Offer schema | High |

## Coverage Thresholds
- All 6 target routes return HTTP 200 with SSR HTML.
- Zero duplicate titles or meta descriptions across all category pages.
- Zero fake reviews or fabricated AggregateRating across all schemas.
- 100% test pass on automated verification matrix.
