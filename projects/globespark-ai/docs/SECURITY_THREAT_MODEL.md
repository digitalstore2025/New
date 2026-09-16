# Security threat model

## Critical controls
- Treat user country strings, retrieved web/data content and future RAG documents as untrusted data, never instructions.
- Do not expose secrets client-side.
- Keep private prospecting datasets out of public RAG/search indexes.
- Tool-using agents require allowlisted tools, scoped arguments and approval for high-impact actions.

## High risks
1. Prompt injection / indirect prompt injection: isolate instructions from retrieved content, validate structured outputs, source-allowlist retrieval.
2. RAG/data poisoning: provenance, immutable source snapshots, trust tiers, quarantine and review.
3. Data exfiltration: least privilege, no private datasets in public context, log redaction.
4. Broken access control in future private modules: deny-by-default authorization and server-side enforcement.

## Medium risks
- External provider outages and stale data: timeouts, bounded retries, visible freshness, graceful degradation.
- Supply chain: lockfiles, dependency review, SBOM/SCA in CI.
- XSS/CSRF/SSRF: output encoding, restrictive CSP, same-origin API patterns, URL allowlists for server fetches.

Reference: OWASP GenAI Prompt Injection and LLM security guidance.
