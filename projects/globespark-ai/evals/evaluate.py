#!/usr/bin/env python3
"""Deterministic structural evaluator for GlobeSpark grounded responses.

Usage:
  python evals/evaluate.py response.json [response2.json ...]
  python evals/evaluate.py responses.jsonl

This evaluator checks citation resolution and schema-level abstention rules.
It does NOT claim semantic entailment; supported claims still require a
semantic evaluator or human review against the cited evidence.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Iterable

THEMES = {"culture", "food", "history", "language", "nature"}


def iter_payloads(path: Path) -> Iterable[dict[str, Any]]:
    text = path.read_text(encoding="utf-8").strip()
    if not text:
        return
    if path.suffix.lower() == ".jsonl":
        for line_no, line in enumerate(text.splitlines(), 1):
            if not line.strip():
                continue
            value = json.loads(line)
            if not isinstance(value, dict):
                raise ValueError(f"{path}:{line_no}: expected JSON object")
            yield value
        return
    value = json.loads(text)
    if isinstance(value, list):
        for index, item in enumerate(value):
            if not isinstance(item, dict):
                raise ValueError(f"{path}[{index}]: expected JSON object")
            yield item
    elif isinstance(value, dict):
        yield value
    else:
        raise ValueError(f"{path}: expected object or list of objects")


def statements(payload: dict[str, Any]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    summary = payload.get("summary")
    if isinstance(summary, dict):
        result.append({"kind": "summary", **summary})
    claims = payload.get("claims")
    if isinstance(claims, list):
        for claim in claims:
            if isinstance(claim, dict):
                result.append({"kind": "claim", **claim})
    return result


def evaluate(payload: dict[str, Any]) -> dict[str, Any]:
    sources = payload.get("sources")
    source_ids = {
        source.get("id")
        for source in sources
        if isinstance(source, dict) and isinstance(source.get("id"), str)
    } if isinstance(sources, list) else set()

    rows = statements(payload)
    supported = [row for row in rows if row.get("status") == "supported"]
    abstained = [row for row in rows if row.get("status") == "insufficient_evidence"]
    cited_ids: list[str] = []
    supported_without_citation = 0
    abstention_with_citation = 0
    invalid_citations: list[str] = []

    for row in rows:
        ids = row.get("sourceIds")
        ids = ids if isinstance(ids, list) else []
        valid_strings = [item for item in ids if isinstance(item, str)]
        cited_ids.extend(valid_strings)
        if row.get("status") == "supported" and not valid_strings:
            supported_without_citation += 1
        if row.get("status") == "insufficient_evidence" and valid_strings:
            abstention_with_citation += 1
        invalid_citations.extend(item for item in valid_strings if item not in source_ids)

    claim_themes = {
        row.get("theme")
        for row in rows
        if row.get("kind") == "claim" and isinstance(row.get("theme"), str)
    }
    missing_themes = sorted(THEMES - claim_themes)
    extra_themes = sorted(claim_themes - THEMES)
    citation_coverage = (
        (len(supported) - supported_without_citation) / len(supported)
        if supported else 1.0
    )
    source_resolution = (
        (len(cited_ids) - len(invalid_citations)) / len(cited_ids)
        if cited_ids else 1.0
    )
    abstention_rate = len(abstained) / len(rows) if rows else 0.0
    structural_pass = (
        supported_without_citation == 0
        and abstention_with_citation == 0
        and not invalid_citations
        and not missing_themes
        and not extra_themes
        and len([row for row in rows if row.get("kind") == "claim"]) == 5
    )

    return {
        "structuralPass": structural_pass,
        "statementCount": len(rows),
        "supportedCount": len(supported),
        "abstainedCount": len(abstained),
        "citationCoverage": round(citation_coverage, 6),
        "sourceResolutionRate": round(source_resolution, 6),
        "invalidCitationCount": len(invalid_citations),
        "invalidCitationIds": sorted(set(invalid_citations)),
        "supportedWithoutCitation": supported_without_citation,
        "abstentionWithCitation": abstention_with_citation,
        "abstentionRate": round(abstention_rate, 6),
        "missingThemes": missing_themes,
        "extraThemes": extra_themes,
        "semanticEntailmentEvaluated": False,
    }


def aggregate(results: list[dict[str, Any]]) -> dict[str, Any]:
    count = len(results)
    if not count:
        return {"responses": 0, "structuralPassRate": 0.0}
    return {
        "responses": count,
        "structuralPassRate": round(sum(bool(r["structuralPass"]) for r in results) / count, 6),
        "meanCitationCoverage": round(sum(float(r["citationCoverage"]) for r in results) / count, 6),
        "meanSourceResolutionRate": round(sum(float(r["sourceResolutionRate"]) for r in results) / count, 6),
        "totalInvalidCitations": sum(int(r["invalidCitationCount"]) for r in results),
        "totalSupportedWithoutCitation": sum(int(r["supportedWithoutCitation"]) for r in results),
        "semanticEntailmentEvaluated": False,
    }


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    outputs: list[dict[str, Any]] = []
    for raw in argv[1:]:
        path = Path(raw)
        for index, payload in enumerate(iter_payloads(path), 1):
            outputs.append({"file": str(path), "record": index, **evaluate(payload)})
    report = {"records": outputs, "aggregate": aggregate(outputs)}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if all(item["structuralPass"] for item in outputs) else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
