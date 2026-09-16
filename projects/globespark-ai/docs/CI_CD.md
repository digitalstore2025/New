# CI/CD release policy

## Implemented PR gates
1. Deterministic dependency install with committed `package-lock.json` and `npm ci`.
2. Production Vite build.
3. Project-specific public/private data-boundary guard.
4. Python evaluator/guard compilation.
5. Deterministic Grounded-RAG structural fixture.
6. Conservative evidence-to-claim review fixture.
7. Critical npm dependency audit.
8. Gitleaks 8.30.1 project-scoped secret scan with release checksum verification.
9. Semgrep 1.177.0 OWASP-oriented SAST.
10. Trivy v0.36.0 HIGH/CRITICAL vulnerability, secret and misconfiguration scan pinned to a verified commit.
11. CycloneDX SBOM generation and short-lived CI artifact retention.
12. Existing repository Lint and Validate Data workflows.

## Promotion gates not yet automated
1. Browser E2E critical workflow tests from repository source.
2. Accessibility and visual-regression checks tied to a repository-derived preview.
3. Repository-derived AppDeploy preview/canary deployment.
4. Observability/error-budget comparison against production.
5. Explicit rollback proof from repository-derived release to a known AppDeploy version.

## Source-of-truth rule
AppDeploy remains production source of truth until a dedicated GlobeSpark repository exists and repository-derived preview/deployment parity is proven. A green PR is necessary but not sufficient for source-of-truth promotion.

## Security versioning rule
Security tools and third-party actions must use verified current release versions or verified commit SHAs. Do not pin to invented or unverified identifiers. Update versions deliberately and rerun all gates before promotion.
