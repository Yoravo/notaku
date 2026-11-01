# NotaKu SEO audit

## Scope and evidence

Public marketing/tool routes, metadata inheritance, sitemap, homepage JSON-LD, internal links, and production-build smoke tests. This is not an authenticated Google Search Console audit, a backlink audit, or a Core Web Vitals assessment. No ranking or traffic improvement has been measured.

Direct public HTTP verification returned 200 for `/`, `/tools`, `/kalkulator-pph23`, `/kalkulator-ppn`, `/buat-invoice`, `/templates`, `/robots.txt`, and `/sitemap.xml`. The production sitemap contains 23 URLs. The inspected production pages already have self-referencing canonicals. Production changes have not been deployed by this task.

## Findings and fixes

| Priority | Finding | Evidence | Change |
| --- | --- | --- | --- |
| Medium | Homepage canonical inherited by unrelated routes | `src/app/layout.tsx` supplied homepage canonical globally | Scope homepage canonical to `src/app/page.tsx`; retain existing explicit canonicals on public tools/templates |
| Medium | Misleading template download promises | Catalog advertised Word/Excel/PDF; detail metadata advertised PDF and Excel; available generator exports PDF | Advertise PDF only in catalog/detail metadata |
| Medium | Homepage FAQ schema differed from actual FAQ | Separate hardcoded schema included PRO custom-domain claims; UI uses translated FAQ messages | Generate FAQ schema from the same localized FAQ messages |
| Medium | Collapsed FAQ answers missing from initial HTML | Answers mounted only while expanded | Keep answers in HTML using native hidden attribute; accordion behavior preserved |
| Low | Unsupported schema search URL | SearchAction targeted `/templates?q=...`, but catalog search only uses local React state | Remove unsupported SearchAction; no fabricated ratings or social profiles |
| Low | Unreliable sitemap modification dates | Every URL received `new Date()` on generation | Omit optional lastModified until reliable content-update dates exist |
| Low | Verbose search titles | Tool titles repeated long phrases and benefits | Shorten homepage and eight public page titles while preserving query intent |

Login/register remain indexable with their own canonicals. They can legitimately serve branded navigation intent; there is no measured crawl-budget issue at this size that warrants noindex. Private financial routes remain excluded from sitemap and robots rules were not weakened.

## Keyword-to-page map

These are intent targets, not measured search volumes or difficulty scores.

| Search intent | Destination |
| --- | --- |
| notaku, aplikasi invoice online | `/` |
| buat invoice online gratis, invoice generator Indonesia | `/buat-invoice` |
| buat kuitansi online gratis | `/buat-kuitansi` |
| buat surat jalan online | `/buat-surat-jalan` |
| kalkulator PPh 23, hitung PPh 23 jasa | `/kalkulator-pph23` |
| kalkulator PPN, hitung DPP PPN | `/kalkulator-ppn` |
| terbilang rupiah, angka ke huruf | `/terbilang-rupiah` |
| template invoice gratis, contoh invoice profesi | `/templates` and relevant existing detail pages |

Homepage tools section and footer already link directly to calculators and document tools. Do not create duplicate keyword pages to force sitelinks.

## Verification

- `npm run typecheck`: passed.
- `npm run build`: passed using installed Next.js 16.2.9 and Node 24.11.0.
- `node --test tests/seo.test.mjs tests/user-tier-dashboard.test.mjs tests/admin-analytics.test.mjs tests/safe-webhook.test.mjs tests/dashboard-render-smoke.mjs tests/payment-release-gaps.test.mjs`: 34 passed, 0 failed. Some existing dashboard checks use synthetic props, not authenticated E2E.
- `node tests/seo-render-smoke.mjs` against local production build on port 3107: all 23 sitemap URLs returned 200 with matching canonical; no duplicate sitemap URLs; no synthetic lastmod. Homepage FAQ schema/content equality and accordion visibility passed in Indonesian and English. Layout overflow checks passed at 320/390/1280px in light/dark CSS states, with zero page errors. This is not a complete accessibility or visual contrast audit.
- `npm run lint`: failed with 134 errors and 80 warnings across repository. ESLint comparison on all 14 changed source files: baseline 0 errors, current 0 errors. Both new SEO test files: 0 errors. Unrelated lint debt was not modified or suppressed.

## Ranking and sitelinks limitations

Sitelinks are selected automatically by Google. There is no markup that forces the PPh calculator beneath the branded homepage result. Concise titles and existing descriptive internal links support Google's understanding but do not guarantee sitelinks or first position.

A public `site:` query is not an exhaustive index report. No exact indexed-page count, current ranking baseline, search volume, CTR, Core Web Vitals score, or percentage traffic uplift is asserted here. An earlier secondary audit's emoji-title claim was not reproduced in direct production HTTP verification and is not treated as a defect.

## Next actions after deployment

1. Verify ownership of the `notaku.store` domain property in Search Console. Submit `https://notaku.store/sitemap.xml` and inspect homepage, invoice generator, and PPh/PPN calculators. Check selected canonical and exclusion reasons before requesting indexing.
2. Export a pre-deployment 28-day baseline: query, page, country, device, impressions, clicks, CTR, average position. Separate branded (`notaku` variants) and non-branded queries. Compare subsequent 28-day periods, allowing for recrawl and seasonality; annotate deployment date.
3. Measure mobile field Core Web Vitals: LCP, INP, CLS. No performance boost is claimed until real measurements exist.
4. Review tax-tool guidance against current DJP rules. Add attributable official sources, scope/disclaimers and genuine review dates; avoid calling the app an official government tool or treating every freelancer payment as PPh 23. This requires tax-content validation, not invented authority.
5. Provide owner-approved privacy/terms and business/about information if not already published. Do not generate legal promises or company credentials as SEO filler.
6. Build legitimate relevant mentions and links, and improve pages based on actual query data rather than adding bulk thin pages.

## Official references

- https://developers.google.com/search/docs/appearance/sitelinks
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

## Release status

Local patch verified as above. No commit, push, deployment, Search Console submission, or ranking change is claimed. Global lint and the external evidence gaps mean this is a technical SEO improvement, not certification that all SEO work is finished.
