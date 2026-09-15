# Source-of-truth migration: AppDeploy → GitHub

## Current phase
GitHub is the review, audit and CI surface. AppDeploy remains the production source of truth.

Current production reference:
- AppDeploy app: `globespark-ai-v11dlz`
- Imported applied snapshot: `1789447100589`
- Production URL: `https://globespark-ai-v11dlz.v2.appdeploy.ai/`

## Why the migration is staged
The current AppDeploy project contains platform-managed SDK/runtime behavior that is not fully represented by a conventional repository checkout. A direct source-of-truth flip without parity checks would create unnecessary deployment and rollback risk.

## Promotion gates
GitHub may become the primary source of truth only after all gates below pass:

1. **Repository placement** — GlobeSpark has a dedicated repository or an explicitly approved monorepo ownership boundary.
2. **Reproducible dependency install** — a reviewed lockfile exists and CI uses the deterministic install mode supported by that package manager.
3. **Frontend parity** — GitHub build output matches the production interactive workflow, including EN/AR/TR, ISO-based selection, map fallback, Evidence Status and Grounded RAG UI.
4. **Backend parity** — AppDeploy SDK routes are reproducible from repository source with documented deployment instructions and no hidden production-only edits.
5. **Evaluation parity** — deterministic citation/schema evaluation passes; semantic factual-support evaluation has an explicit release gate.
6. **Security gates** — public-data boundary guard, secret scanning, SAST and dependency/SBOM policy are enabled with approved versions.
7. **Preview deployment** — a GitHub-derived preview/canary can be deployed independently of production.
8. **Rollback proof** — the previous known-good AppDeploy version and rollback procedure are documented and tested.
9. **Observability** — production release has a measurable error/latency baseline and a post-release observation window.
10. **Human approval** — privacy, authorization, data-publication and legal-policy boundaries remain human-gated.

## Migration sequence
1. Mirror production snapshot into an isolated Git branch.
2. Run build/evaluation/security checks.
3. Deploy repository-derived preview/canary.
4. Compare critical workflows against current AppDeploy production.
5. Freeze direct production-only edits during the cutover window.
6. Promote repository-derived build.
7. Observe SLOs/error budget.
8. Roll back immediately if critical workflow, citation integrity, privacy boundary or availability regressions exceed the agreed gate.

## Rollback
Until GitHub is promoted, rollback uses AppDeploy deployment history. After promotion, keep the final pre-cutover AppDeploy snapshot as the known-good rollback reference until repository-driven deployment has completed a stable observation period.

## Explicit non-goals
- No automatic production code mutation.
- No automatic publication of private institutional research.
- No silent change to map boundary policy.
- No migration merely to satisfy tooling aesthetics; the cutover must improve reproducibility, reviewability and rollback safety.
