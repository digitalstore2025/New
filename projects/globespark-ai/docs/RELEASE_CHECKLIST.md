# GlobeSpark release checklist

Use this checklist for every production-affecting change.

## Code and data
- [ ] Change is scoped to the intended feature and contains no unrelated files.
- [ ] No private prospecting workbook, contact list, outreach data or person-level enrichment is present.
- [ ] No credentials, tokens, private keys or environment files are committed.
- [ ] Source-backed, grounded-generation and generated-explanation classes remain visually and structurally distinct.
- [ ] Any new public factual source has provenance, retrieval date and an explicit trust/verification policy.

## AI / RAG
- [ ] Supported grounded statements have at least one resolving source ID.
- [ ] Invalid/missing citations are downgraded before reaching the client.
- [ ] Insufficient evidence produces abstention, not parametric-memory completion.
- [ ] Retrieved/provider strings are treated as untrusted data, not instructions.
- [ ] Golden multilingual/adversarial cases pass.
- [ ] Semantic factual support is reviewed separately from citation presence when claims are promoted as grounded.

## Frontend and accessibility
- [ ] EN, AR and TR critical flows work.
- [ ] RTL rendering remains usable.
- [ ] ISO-based country selection/highlight works across locale switches.
- [ ] Keyboard-accessible country search remains available if the globe renderer fails.
- [ ] Reduced-motion behavior remains respected.
- [ ] Mobile layout is checked for source/evidence visibility.

## Reliability
- [ ] World Bank, UNESCO, grounded synthesis and broader AI layers can fail independently.
- [ ] Last-good/fallback states are labeled and cannot masquerade as live data.
- [ ] External requests keep bounded timeout/retry behavior.
- [ ] Map geometry retains a non-network fallback path.
- [ ] Rollback target is known before promotion.

## SEO / AI Search
- [ ] Canonical and sitemap changes match the actual public hostname/routes.
- [ ] Structured data matches visible content.
- [ ] No mass low-value generated pages are introduced.
- [ ] Canary pages stay `noindex` until crawl/content-quality promotion gates pass.

## CI / security
- [ ] GlobeSpark CI passes.
- [ ] Public-data boundary guard passes.
- [ ] Frontend production build passes.
- [ ] Python evaluator compiles and deterministic fixture passes.
- [ ] Dependency audit has no unreviewed critical finding.
- [ ] Secret/SAST/SBOM tooling is enabled with organization-approved pinned versions before GitHub becomes production source of truth.

## Promotion
- [ ] Preview/canary is reviewed.
- [ ] Error/latency baseline is available for the change.
- [ ] Production promotion is explicit and reversible.
- [ ] Post-release observation confirms no critical privacy, citation-integrity or availability regression.
