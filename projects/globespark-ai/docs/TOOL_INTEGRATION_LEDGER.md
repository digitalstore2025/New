# Connected Tool Integration Ledger

Updated: 2026-09-15

This ledger records only tools actually invoked during the GlobeSpark hardening cycle. A connector being available is not treated as evidence that it was used successfully.

## Context7
- Status: invoked successfully.
- Purpose: verify current Next.js App Router patterns for crawlable multilingual country pages.
- Result: current official-library documentation supports `generateStaticParams` for prerendered dynamic routes, ISR/revalidation, locale route generation, route-specific JSON-LD, and typed sitemap metadata.
- Decision: use a future Next.js country-page canary rather than a risky big-bang migration from the current React/Vite application.

## Build Web Data Visualization
- Status: visualization skills read and applied.
- Purpose: operational visualization and failure-state design.
- Applied principles: distinguish live/stale/partial/offline states, keep last-good evidence visible, show last-updated times, preserve mobile hierarchy, and avoid decorative 3D that carries no analytical meaning.
- Product effect: the public Evidence Status surface separates source-backed data from generated explanation and exposes operational state.

## DataCamp
- Status: catalog search invoked successfully.
- Purpose: team capability roadmap.
- Relevant learning areas found: Generative-AI MLOps/model evaluation, RAG architecture/evaluation, LLM-as-a-judge, agent evaluations, Graph RAG and hybrid retrieval.
- Boundary: training inputs only; DataCamp content is not a production dependency or verification source.

## Consensus
- Status: literature search invoked; search results were directional only.
- Limitation: the surfaced result did not expose a usable fetch identifier required by the connector for citation-grade verification in this run.
- Decision: no Consensus paper is promoted to verified product evidence. The public methodology therefore describes evaluation dimensions generically rather than claiming a specific academic framework was validated by this run.

## Sprouts Data Intelligence
- Status: connector reachable, but enrichment credentials are not configured.
- Account enrichment attempts for a small institutional-domain sample returned 404.
- Useful result: the connector recommended a company-research field set for institutional research; this is preferable to contact-heavy sales-outreach fields for the private dataset.
- Safety decision: no person-level enrichment, phone/email retrieval, CRM move or credits were used.

## Data247
- Status: account-related access was attempted; the rate-card path later required user approval/login and was declined.
- Safety decision: no paid lookup, email validation, phone validation, DNC check, reverse lookup or consumer profiling was performed. The declined path is not retried.

## Datasite
- Status: connected; project listing returned no active projects.
- Safety decision: no VDR was created because a project/deal context and data-center decision were not established. Existing GlobeSpark audit artifacts remain outside Datasite.

## Midpage Legal Research
- Status: attempted for current US commercial-email primary law; connector required re-authentication and could not be relied on.
- Safety decision: no legal conclusion was inferred. The private dataset keeps the conservative operational rule: official institutional channels only, verify first, no personal-email harvesting, and no automated outreach until a separate legal/operational review is completed.

## Opera Browser Connector
- Status: attempted; no authenticated Opera session was connected.
- Safety decision: no claim of Opera-based visual QA. AppDeploy QA remains the verified runtime signal for this release.

## AppDeploy
- Status: used for production source inspection, versioned deployment, rollback capability and QA.
- Role: current production source of truth for GlobeSpark.

## GitHub
- Status: invoked successfully for public map-source inspection and source-mirror bootstrap.
- Result: verified the current globe dataset path, created an isolated review branch, and mirrored the applied AppDeploy snapshot without private workbook data.
- Boundary: GitHub is a review/CI surface in this phase; AppDeploy remains production source of truth until a deliberate migration is approved.

## SEO static canary
- Status: deployed separately and successfully as `GlobeSpark Country Pages Canary`.
- Boundary: page-level `noindex,follow` remains active until source-refresh, canonical-host and crawl-quality promotion gates pass.

## Spreadsheet / Python analysis
- Status: the uploaded XLSX was inspected through the environment-approved spreadsheet tooling; Python was used for analysis only under those constraints.
- Additional Python work: generated the ISO numeric-to-alpha2 map and an executable deterministic Grounded RAG structural evaluator; the evaluator was test-run on a synthetic valid response before deployment.
- Dataset boundary: private prospecting fields are not copied into public country pages, public SEO surfaces or public AI context.

## Tool-honesty rule
Every future execution report must classify each connector as one of: available, invoked-successfully, invoked-blocked, invoked-failed, paid-action-not-approved, or not-used. No connector may be cited as evidence merely because it is installed.
