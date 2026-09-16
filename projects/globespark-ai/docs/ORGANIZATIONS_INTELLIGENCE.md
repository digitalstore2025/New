# Private Organizations Intelligence Boundary

## Scope
An optional private research module may use verified institutional records for organization discovery, verification and outreach planning. It is not part of public GlobeSpark country content, public SEO pages or public RAG context.

## Access model
- Authentication is mandatory before ingesting private institutional research data.
- Role-based access should separate viewer, analyst and administrator capabilities.
- Export, enrichment and outbound actions require explicit policy checks and audit events.
- Public routes must never query private organization tables.

## Data model
Recommended entity fields: stable organization ID, canonical name, official domain, official website, jurisdiction, sector, organization type, verification status, verification source, source URL, source retrieval date, data freshness, risk flags, provenance and analyst notes.

Person-level contact data is excluded by default. If a future workflow needs it, data minimization, legal basis, retention and access policies must be approved first.

## Verification workflow
`discovered -> needs_verification -> verified | contradictory | stale | unsupported -> reviewed`

A prospecting score or priority label is never equivalent to verification or approval to contact. Discovery providers and social profiles are leads for verification, not final evidence.

## Connector policy
- Sprouts: organization/account research only unless enrichment credentials and an explicit paid-action approval exist.
- Data247: no paid validation, reverse lookup or profiling without explicit approval and a defined lawful operational purpose.
- Datasite: use only after a real private project, fileroom scope and data-center decision exist.
- Midpage: legal conclusions require a successfully authenticated primary-law research session.
- No connector output becomes public country evidence merely because the connector returned it.

## Promotion gate
Do not build or populate the private portal inside the public GlobeSpark app. The next implementation step is a separately authenticated surface with its own data store, audit trail, retention policy and release review.