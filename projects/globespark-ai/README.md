# GlobeSpark AI

GitHub review/CI mirror for the production GlobeSpark AI application.

- Production app: https://globespark-ai-v11dlz.v2.appdeploy.ai/
- AppDeploy app ID: `globespark-ai-v11dlz`
- Current mirrored production snapshot: `1789506930492`
- Production sync date: 2026-09-16
- Stack: React 19 + Vite + TypeScript + AppDeploy backend + Python evaluation/security tooling

## Current production interaction
The Canvas2D globe supports inertial drag, smooth zoom, mobile pinch-to-zoom, animated fly-to after country selection, localized hover labels, small-country hit tolerance, ISO-stable selection/highlight, a selected-country marker, and a responsive World Bank quick-data card.

## Evidence architecture
GlobeSpark separates three content classes:

1. **Verified/source-backed** — structured fields returned by named providers such as World Bank and UNESCO DataHub.
2. **Grounded generation** — model synthesis constrained to a server-side evidence pack, with source IDs and deterministic citation validation.
3. **Generated explanation** — broader educational AI content, explicitly labeled and never presented as verified source data.

## Reliability
The interactive globe uses the current external world-scale GeoJSON source, browser Cache API last-good data, and a pinned `world-atlas` TopoJSON build-time fallback. Country data providers degrade independently. AI and grounded layers use separate caches and failure states.

## Evaluation
- `evals/evaluate.py` performs deterministic structure, citation-resolution and abstention checks.
- `evals/semantic_review.py` performs conservative evidence-to-claim triage and never equates citation presence or lexical overlap with proven semantic entailment. An optional local judge adapter can be supplied without opening a shell.
- `evals/golden-set.json` defines multilingual/adversarial evaluation cases.

## DevSecOps gates
GitHub workflows are scoped to GlobeSpark paths and currently cover:

- deterministic `npm ci` installation from `package-lock.json`
- production frontend build
- public/private data-boundary guard
- structural and evidence-to-claim evaluation fixtures
- critical npm dependency audit
- Gitleaks secret scanning
- Semgrep OWASP-oriented SAST
- Trivy vulnerability, secret and misconfiguration scanning
- CycloneDX SBOM generation as a CI artifact

## Privacy boundary
Private institutional prospecting/research data is deliberately excluded from public country pages, public SEO surfaces and public AI context. See `docs/DATA_INTEGRATION_BOUNDARY.md` and `docs/ORGANIZATIONS_INTELLIGENCE.md`.

## Development policy
Production must not self-modify. Changes follow branch → tests → PR → preview/canary → observe → promote or rollback. High-risk privacy, authorization, legal-policy and destructive data changes require explicit approval.

## Source-of-truth note
GitHub is a review, reproducibility and CI surface in this phase. AppDeploy remains the production source of truth until a dedicated GlobeSpark repository exists and repository-derived deployment/rollback parity is proven. The current production rollback reference is AppDeploy snapshot `1789506930492`.
