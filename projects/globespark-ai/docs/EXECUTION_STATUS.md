# GlobeSpark AI — Execution Status

Updated: 2026-09-16

## Public production
- URL: https://globespark-ai-v11dlz.v2.appdeploy.ai/
- AppDeploy app: `globespark-ai-v11dlz`
- Current mirrored production snapshot: `1789506930492`
- Production QA for this snapshot: no reported frontend or network errors.
- AppDeploy did not return an automated E2E run for this release (`e2e_tests = null`), so no E2E-pass claim is made.

## Implemented product capabilities
- React/Vite multilingual EN/AR/TR application.
- Canvas2D orthographic globe with inertial drag, smooth zoom, wheel/double-click controls, mobile pinch-to-zoom and animated country fly-to.
- ISO alpha-2 stable selection/highlight, localized hover labels, small-country hit tolerance and selected-country marker.
- Responsive quick-data card backed by World Bank country metadata.
- World Bank and UNESCO source-backed data with independent provider degradation.
- Broader AI educational brief separated from verified/source-backed evidence.
- Grounded RAG route constrained to returned evidence, source IDs, deterministic citation validation and explicit abstention.
- Current map data resilience: external GeoJSON -> browser last-good cache -> bundled `world-atlas` fallback.

## Evaluation gates
- `evals/evaluate.py`: deterministic schema, citation-resolution and abstention validation.
- `evals/semantic_review.py`: conservative evidence-to-claim triage; numeric mismatches hard-fail; ambiguous paraphrases remain `needs_review`; lexical overlap never claims semantic entailment.
- Optional semantic judge adapter executes argv directly without a shell.
- Multilingual/adversarial cases are tracked in `evals/golden-set.json`.

## Reproducibility and CI
- `package-lock.json` is generated from the current `package.json` on Node 22 / npm 10 and committed.
- GlobeSpark CI installs with `npm ci`, builds the production frontend, compiles Python guards/evaluators, runs structural/evidence-review fixtures and performs a critical npm audit.
- CI is scoped to GlobeSpark paths inside the temporary monorepo location.

## DevSecOps
- Project-specific public/private data boundary guard.
- Gitleaks 8.30.1 secret scan with release checksum verification.
- Semgrep 1.177.0 OWASP-oriented SAST.
- Trivy v0.36.0 action pinned to verified commit for HIGH/CRITICAL vulnerability, secret and misconfiguration scanning.
- CycloneDX SBOM generated as a CI artifact with 30-day retention.

## Privacy boundary
The private organizations/prospecting workbook and outreach/scoring/contact fields are excluded from public source, public SEO pages and public AI/RAG context. Future organization intelligence remains a separately authenticated design, not a public GlobeSpark feature.

## SEO / AI Search
A separate Next.js static country-pages canary exists for multilingual crawlability experiments. It remains `noindex,follow` until canonical-host, source-refresh, render/crawl and content-quality promotion gates are proven. It is not treated as production SEO traffic today.

## Source-of-truth boundary
AppDeploy remains production source of truth. GitHub is currently the review/reproducibility/CI mirror. Promotion of GitHub to source of truth requires:
1. a dedicated GlobeSpark repository;
2. repository-derived AppDeploy deployment parity;
3. preview/canary parity for EN/AR/TR, map interaction/fallback and Grounded RAG;
4. rollback proof to a known AppDeploy version;
5. release observability/error-budget review.

## External-permission blockers
- Creating `digitalstore2025/globespark-ai` is not exposed by the current GitHub connector. A separate authenticated CLI path was not authorized and is not retried automatically.
- Search Console, Bing Webmaster/IndexNow and an external OpenTelemetry collector/dashboard are not connected in this execution environment.

## Deliberately not introduced
- Java/JVM services: no current throughput, isolation or ecosystem requirement justifies a second backend stack.
- Cesium/WebGL renderer: no current terrain/3D Tiles/high-volume GIS requirement justifies replacing the deployment-proven Canvas renderer.
- Autonomous production source mutation: prohibited; changes remain branch -> tests -> PR -> preview/canary -> promote/rollback.
