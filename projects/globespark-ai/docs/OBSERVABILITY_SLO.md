# GlobeSpark Observability & SLO Contract

## Service indicators
- Main country workflow availability: successful country selection produces at least one usable layer (source-backed or clearly degraded) without a fatal UI error.
- World Bank provider success rate.
- UNESCO provider success rate.
- Grounded synthesis success rate.
- Grounded citation-resolution rate.
- Unsupported-claim rate from the evaluation harness.
- Last-good fallback rate by layer.
- Grounded cache hit rate.
- p50/p95 backend latency for country, heritage, facts and grounded brief routes.
- Frontend/network runtime errors from deployment QA.

## Initial objectives
- App-owned route availability: >= 99.5% monthly, excluding upstream provider outages while a labeled fallback remains usable.
- Citation resolution for claims marked `supported`: 100% by deterministic post-validation.
- Invalid citation rate at client boundary: 0%.
- Fatal cross-layer failure: < 0.5% of country-selection sessions.
- Grounded p95 target: <= 8 seconds on uncached synthesis and <= 1.5 seconds on cache hit, measured before treating these numbers as achieved.

## Error-budget policy
SLOs are targets, not claimed measurements. When the monthly error budget is consumed, feature expansion pauses and reliability work takes priority.

## Auto-healing boundary
Allowed automatically: bounded retry with timeout, cache fallback, last-good client fallback, graceful partial-data rendering, reversible deployment rollback. Not allowed automatically: production source-code mutation, permission expansion, private-data publication, secret rotation, legal-policy changes, or destructive database changes.

## Logging
Provider degradation and grounded completion emit structured JSON through backend logging. Do not log private prospecting rows, personal contact data, prompts containing private datasets, or secrets.