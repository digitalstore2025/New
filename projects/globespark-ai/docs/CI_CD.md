# CI/CD release policy

## Required gates
1. Dependency install from lockfile.
2. Production build.
3. Unit/integration tests.
4. E2E critical workflow tests.
5. Accessibility and visual-regression checks.
6. Secret scan, SAST and dependency/SBOM scan using organization-approved pinned scanner versions.
7. AI evaluation suite: factuality, schema, multilingual quality and prompt-injection cases.
8. Preview deployment.
9. Canary/staged release when supported.
10. Error-budget observation and rollback decision.

Do not pin security actions to invented or unverified commit SHAs. When a GitHub repository is connected, resolve current approved Semgrep/Gitleaks/Trivy/CodeQL versions and pin them through the organization dependency policy before enabling the workflow.
