# GlobeSpark Country Pages Canary — current status

## Public canary

- URL: `https://globespark-country-pages-canary-gknkkx.v2.appdeploy.ai/`
- AppDeploy app: `globespark-country-pages-canary-gknkkx`
- Applied snapshot: `1789589847093`
- Deployment status: `ready`
- QA: 0 reported frontend errors, 0 reported network errors
- AppDeploy E2E: not reported (`e2e_tests = null`)

## Current scope

The canary contains six countries across English, Arabic and Turkish static routes. It remains intentionally `noindex,follow` and is not an indexed production SEO surface.

## Data/content refresh now applied

- World Bank country profile refresh at static build time.
- World Bank `SP.POP.TOTL` latest available population refresh at static build time.
- UNESCO DataHub World Heritage refresh at static build time, with two approved host attempts.
- Visible World Bank and UNESCO provider rows with independent source states.
- Visible retrieval timestamps only when a provider was actually retrieved live.
- World Bank fallback remains clearly labeled bundled seed data; it never receives a fake retrieval timestamp.
- UNESCO failure degrades independently to `unavailable`; it does not fabricate a count or timestamp.
- Population year displayed when available.
- UNESCO World Heritage count displayed when available.
- Up to three recent UNESCO World Heritage records are surfaced with links to UNESCO property pages where an ID exists.
- EN/AR/TR page summaries and provenance copy updated to describe the real build-time source behavior.
- Absolute canonical URL per locale/country page.
- Absolute `hreflang` alternates for `en`, `ar`, and `tr`.
- `x-default` alternate pointing to the English route.
- JSON-LD `WebPage` metadata now cites both World Bank and UNESCO and retains `url`, `inLanguage`, `dateModified`, and Country entity data.
- Private prospecting/research data remains excluded.

## Production data note

The interactive production app already fetches World Bank country/population fields and UNESCO World Heritage records at request time. Its Grounded RAG evidence pack stores provider retrieval timestamps and validates returned source IDs before marking claims supported. Therefore this refresh does not replace source-backed production data with manually copied values.

## Promotion gate

Do not remove `noindex` until all of the following are proven on the final hostname:

1. canonical and hreflang targets use the final production hostname;
2. automated source refresh/freshness is operational for the intended release cadence;
3. crawl/render inspection passes for representative EN/AR/TR pages;
4. pages demonstrate durable unique value beyond templated fields;
5. structured data matches visible page content;
6. Search Console and Bing Webmaster ownership/monitoring are connected where available;
7. rollback and release ownership are explicit.

## Current decision

The canary now has live build-time World Bank + UNESCO refresh with explicit provider degradation, but remains a validation surface. `noindex,follow` stays in place.
