# GlobeSpark AI target architecture

## Principle
Use a modular monolith until independent scaling or isolation is proven necessary. Keep the interactive globe, country knowledge APIs, AI generation, provenance and evaluation contracts separable without prematurely introducing microservices.

## Public data flow
Country selection → validated ISO code → World Bank / UNESCO adapters → structured normalized response → provenance label → UI. AI briefs use a separate route and never overwrite source-backed fields.

## Reliability
- External providers: timeout + at most one retry for network/5xx failures.
- Browser: last-good local fallback after a prior successful response.
- Partial failure: World Bank, UNESCO and AI sections fail independently.
- No automatic irreversible remediation.
- Rollback is deployment-version based.

## Private research boundary
Prospecting datasets remain outside the public country knowledge path. A future Organizations Intelligence module must use separate storage/indexing, explicit access policy, sanitization and human verification gates.

## Migration
Phase 1 retains React/Vite for the interactive client. Phase 2 should build a Next.js canary for crawlable country/entity/methodology pages. Switch only after parity, crawl, performance and rollback tests pass.
