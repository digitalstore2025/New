# GlobeSpark AI

GitHub mirror and review surface for the production GlobeSpark AI application.

- Production app: https://globespark-ai-v11dlz.v2.appdeploy.ai/
- AppDeploy app ID: `globespark-ai-v11dlz`
- Imported AppDeploy snapshot: `1789447100589`
- Import date: 2026-09-15
- Stack: React 19 + Vite + TypeScript + AppDeploy backend + Python evaluation harness

## Evidence architecture
GlobeSpark separates three content classes:

1. **Verified/source-backed** — structured fields returned by named providers such as World Bank and UNESCO DataHub.
2. **Grounded generation** — model synthesis constrained to a server-side evidence pack, with source IDs and deterministic citation validation.
3. **Generated explanation** — broader educational AI content, explicitly labeled and never presented as verified source data.

## Reliability
The interactive globe uses the current external world-scale GeoJSON source, browser Cache API last-good data, and a pinned `world-atlas` TopoJSON build-time fallback. Country data providers degrade independently. AI and grounded layers use separate caches and failure states.

## Privacy boundary
Private institutional prospecting/research data is deliberately excluded from public country pages, public SEO surfaces and public AI context. See `docs/DATA_INTEGRATION_BOUNDARY.md` and `docs/ORGANIZATIONS_INTELLIGENCE.md`.

## Evaluation
`evals/evaluate.py` performs deterministic schema/citation checks. It does **not** claim semantic entailment; factual support still requires a semantic evaluator or human review against the cited evidence.

## Development policy
Production must not self-modify. Changes follow branch → tests → PR → preview/canary → observe → promote or rollback. High-risk privacy, authorization, legal-policy and destructive data changes require explicit approval.

## Source-of-truth note
This directory was imported from the applied AppDeploy snapshot above. GitHub is being established as a review/CI surface; production remains AppDeploy until a deliberate source-of-truth migration is completed.
