# GlobeSpark Release Checklist

Use this checklist for every production-affecting change. Checked items below describe the current 2026-09-16 baseline; new changes must re-run the applicable gates.

## Source and reproducibility
- [x] Production source mirrored from AppDeploy snapshot `1789506930492`.
- [x] `package-lock.json` committed.
- [x] GitHub CI installs frontend dependencies with `npm ci`.
- [x] Public/private data boundary guard enabled.
- [ ] Dedicated `digitalstore2025/globespark-ai` repository available.

## Code and data
- [x] Private prospecting workbook, contact lists, outreach/scoring data and person-level enrichment are excluded.
- [x] No credentials, tokens, private keys or environment files are intentionally committed.
- [x] Source-backed, grounded-generation and generated-explanation classes remain visually and structurally distinct.
- [x] Current public factual providers have provenance and explicit source labels.

## AI / RAG
- [x] Supported grounded statements require resolving source IDs.
- [x] Invalid/missing citations are downgraded before reaching the client.
- [x] Insufficient evidence produces abstention instead of parametric-memory completion.
- [x] Retrieved/provider strings are treated as untrusted data, not instructions.
- [x] Structural Grounded-RAG fixture passes.
- [x] Conservative evidence-to-claim review fixture passes without equating lexical overlap with semantic entailment.
- [ ] Automated production-scale semantic entailment benchmark is connected to an approved judge/human review process.

## Frontend and accessibility
- [x] EN/AR/TR product paths exist and ISO country selection remains locale-stable.
- [x] Keyboard-accessible search remains an alternative to globe interaction.
- [x] Reduced-motion behavior remains respected.
- [x] Current production globe includes inertia, smooth zoom, mobile pinch, fly-to, hover feedback, small-country hit tolerance and quick World Bank data.
- [ ] Repository-derived browser E2E and accessibility regression suite is automated.

## Reliability
- [x] World Bank, UNESCO, grounded synthesis and broader AI layers fail independently.
- [x] Last-good/fallback states are labeled.
- [x] External provider requests retain bounded timeout/retry behavior.
- [x] Map geometry keeps browser-cache and bundled fallback paths.
- [x] Known production rollback reference: AppDeploy snapshot `1789506930492`.
- [ ] Repository-derived preview -> production -> rollback path is proven end to end.

## SEO / AI Search
- [x] Separate multilingual static country-pages canary exists.
- [x] Canary pages remain `noindex,follow` until promotion gates pass.
- [x] Structured data/provenance policy is documented.
- [ ] Final canonical hostname selected and applied.
- [ ] Source refresh + retrieval timestamps automated for indexable pages.
- [ ] Crawl/render/content-quality checks pass.
- [ ] Search Console/Bing Webmaster measurement is connected before index promotion.

## CI / security
- [x] GlobeSpark CI passes.
- [x] Existing repository Lint and Validate Data workflows pass.
- [x] Public-data boundary guard passes.
- [x] Frontend production build passes with deterministic `npm ci` install.
- [x] Python guards/evaluators compile and fixtures pass.
- [x] Critical npm dependency audit passes.
- [x] Gitleaks 8.30.1 secret scan passes.
- [x] Semgrep 1.177.0 OWASP-oriented SAST passes.
- [x] Trivy HIGH/CRITICAL vulnerability, secret and misconfiguration scan passes.
- [x] CycloneDX SBOM is generated as a CI artifact.

## Observability
- [x] Structured provider/grounded backend logging exists.
- [x] SLO contract is documented.
- [ ] External telemetry collector/dashboard is connected.
- [ ] Baseline p50/p95, fallback rate, provider success and error-budget measurements are collected before GitHub source-of-truth cutover.

## Promotion
- [ ] Dedicated repository placement is resolved.
- [ ] Repository-derived AppDeploy preview is reviewed.
- [ ] EN/AR/TR, map interaction/fallback, evidence layers and Grounded RAG parity are confirmed from repository source.
- [ ] Error/latency baseline is available for the candidate release.
- [ ] Production promotion and rollback are explicitly exercised.

A green PR is necessary but not sufficient to promote GitHub to production source of truth or remove the Canary `noindex` gate.