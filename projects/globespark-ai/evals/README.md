# GlobeSpark evaluation harness

The golden set is deliberately small and adversarial first. It covers a large country, a heritage-rich country, a small island state, all supported locales, a politically sensitive boundary context, provider degradation and explicit abstention.

## Deterministic checks
For every grounded response:
1. Build the set of returned `sources[].id` values.
2. For every statement with `status=supported`, assert `sourceIds.length > 0`.
3. Assert every cited ID exists in the returned source set.
4. Assert `insufficient_evidence` statements have no citations.
5. Assert exactly one claim exists for each required theme.
6. Assert response locale matches the request at the schema/content QA layer.

## Semantic checks
A separate evaluator or human review must determine whether each supported statement is actually entailed by the cited evidence. Do not substitute citation presence for factual entailment.

## Metrics
- citation coverage
- invalid citation rate
- unsupported claim rate
- abstention rate
- source resolution rate
- multilingual schema pass
- latency p50/p95
- cache hit rate

No metric is reported as achieved until collected from real runs.