# GlobeSpark Country Pages Canary — current status

## Public canary

- URL: `https://globespark-country-pages-canary-gknkkx.v2.appdeploy.ai/`
- AppDeploy app: `globespark-country-pages-canary-gknkkx`
- Applied snapshot: `1789570541700`
- Deployment status: `ready`
- QA: 0 reported frontend errors, 0 reported network errors
- AppDeploy E2E: not reported (`e2e_tests = null`)

## Current scope

The canary contains six countries across English, Arabic and Turkish static routes. It remains intentionally `noindex,follow` and is not an indexed production SEO surface.

## Hardening now applied

- World Bank country profile refresh at static build time.
- World Bank `SP.POP.TOTL` population refresh at static build time.
- Visible source state: `live` build-time retrieval or clearly labeled bundled seed fallback.
- Visible retrieval timestamp for live data.
- Population year displayed when available.
- Absolute canonical URL per locale/country page.
- Absolute `hreflang` alternates for `en`, `ar`, and `tr`.
- `x-default` alternate pointing to the English route.
- JSON-LD `WebPage` metadata with `url`, `inLanguage`, `dateModified`, country entity and World Bank citation.
- Source fallback never receives a fake retrieval timestamp.
- Private prospecting/research data remains excluded.

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

The canary is technically healthier but remains a validation surface. `noindex,follow` stays in place.
