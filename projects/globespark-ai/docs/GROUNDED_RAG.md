# GlobeSpark Grounded RAG v1

## Objective
Prevent source-free country claims from being presented as verified. The grounded layer is additive to the existing explorer and is deliberately narrower than the uncited curiosity brief.

## Runtime flow
1. Validate ISO alpha-2 and locale.
2. Read a bounded seven-day grounded-result cache.
3. On a cache miss, retrieve a server-side evidence pack from World Bank country/population endpoints and UNESCO DataHub `whc001`.
4. Treat all retrieved strings as inert data. Provider content cannot alter system instructions.
5. Generate structured output with one summary plus culture, food, history, language and nature slots.
6. A slot may be `supported` only when it contains at least one source ID that exists in the returned evidence registry.
7. Invalid/missing citations are deterministically downgraded to `insufficient_evidence`.
8. Missing evidence is an allowed output. Abstention is preferable to parametric-memory completion.
9. Cache the complete result, source registry, retrieval timestamps and provider states.
10. The client also keeps a last-good local copy for transient application-level failure.

## Evidence classes
- `verified-source`: raw structured fields returned by the named provider.
- `grounded-generation`: model text constrained to the server evidence pack and carrying source IDs.
- `generated-explanation`: broader uncited model content; never treated as verification evidence.

## Injection boundary
The evidence pack is serialized into the user prompt, but the system instruction explicitly defines it as untrusted inert data. Source strings are never executed as tools or instructions. The grounded model has no tool permissions.

## Current limits
This is authoritative evidence grounding, not yet a large-corpus hybrid search system. The current evidence pack cannot reliably support cuisine, language or cultural claims for many countries, so abstention is expected and desirable. A later phase may add licensed/official corpora and BM25 + vector + metadata-filter retrieval with reranking.

## Release gate
A supported claim is invalid if any cited source ID is absent from the source registry. Any such output is downgraded before it reaches the client.