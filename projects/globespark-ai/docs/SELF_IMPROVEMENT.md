# Controlled self-improvement loop

GlobeSpark must not self-modify production code. The allowed loop is:

1. Observe: latency, provider errors, cache hit rate, search success, AI failure rate, Core Web Vitals and citation visibility.
2. Evaluate: run golden multilingual cases and security regression suites.
3. Hypothesize: produce an explicit change proposal with expected metric movement.
4. Sandbox: implement in an isolated branch/preview.
5. Gate: build, unit/integration/E2E/accessibility/security/data-quality checks.
6. Canary: limited deployment when supported.
7. Monitor: compare against baseline and error budget.
8. Promote or rollback.

Automatic remediation is restricted to bounded retries, fallback to last-good data, circuit-breaking/feature flags where implemented, and rollback of a known-bad deployment. Privacy, authorization, source policy, data publication and irreversible changes require human approval.
