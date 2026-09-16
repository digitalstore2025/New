#!/usr/bin/env python3
"""Conservative evidence-to-claim review for GlobeSpark Grounded RAG.

The built-in heuristic is a triage layer, not a semantic-entailment claim.
An optional local judge command can be supplied as an argv string. The command
receives JSON on stdin and must return JSON containing an `entailed` boolean.
No shell is invoked and no credentials are stored by this tool.
"""

from __future__ import annotations

import argparse
import json
import re
import shlex
import subprocess
import sys
import unicodedata
from pathlib import Path
from typing import Any, Iterable

TOKEN_RE = re.compile(r"[\w\u0600-\u06ff]+", re.UNICODE)
NUMBER_RE = re.compile(r"\b\d+(?:[.,]\d+)?\b")
STOP = {
    "the", "and", "for", "with", "from", "that", "this", "into", "has", "have",
    "bir", "ve", "ile", "için", "bu", "olan", "olarak",
    "في", "من", "على", "إلى", "الى", "عن", "مع", "هذا", "هذه", "التي", "الذي",
}


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKC", text).casefold()
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return re.sub(r"\s+", " ", text).strip()


def token_set(text: str) -> set[str]:
    return {
        token for token in TOKEN_RE.findall(normalize(text))
        if len(token) >= 3 and token not in STOP
    }


def flatten(value: Any) -> Iterable[str]:
    if value is None:
        return
    if isinstance(value, bool):
        yield "true" if value else "false"
    elif isinstance(value, (str, int, float)):
        yield str(value)
    elif isinstance(value, list):
        for item in value:
            yield from flatten(item)
    elif isinstance(value, dict):
        for key, item in value.items():
            yield str(key)
            yield from flatten(item)


def statements(payload: dict[str, Any]) -> Iterable[dict[str, Any]]:
    summary = payload.get("summary")
    if isinstance(summary, dict):
        yield {"kind": "summary", **summary}
    claims = payload.get("claims")
    if isinstance(claims, list):
        for claim in claims:
            if isinstance(claim, dict):
                yield {"kind": "claim", **claim}


def cited_evidence(payload: dict[str, Any], source_ids: list[str]) -> tuple[str, list[str]]:
    sources = payload.get("sources")
    source_map = {
        item.get("id"): item for item in sources
        if isinstance(item, dict) and isinstance(item.get("id"), str)
    } if isinstance(sources, list) else {}
    chunks: list[str] = []
    resolved: list[str] = []
    for source_id in source_ids:
        source = source_map.get(source_id)
        if isinstance(source, dict):
            resolved.append(source_id)
            chunks.extend(flatten(source.get("evidence")))
    return " ".join(chunks), resolved


def heuristic(claim: str, evidence: str) -> dict[str, Any]:
    claim_tokens = token_set(claim)
    evidence_tokens = token_set(evidence)
    coverage = len(claim_tokens & evidence_tokens) / len(claim_tokens) if claim_tokens else 0.0
    unmatched_numbers = sorted(
        set(NUMBER_RE.findall(normalize(claim))) - set(NUMBER_RE.findall(normalize(evidence)))
    )
    if unmatched_numbers:
        disposition = "fail"
        reason = "numeric claim is absent from cited evidence"
    elif coverage >= 0.72:
        disposition = "likely_supported"
        reason = "high lexical overlap; semantic entailment is not proven"
    else:
        disposition = "needs_review"
        reason = "semantic review required for paraphrase or unsupported detail"
    return {
        "disposition": disposition,
        "tokenCoverage": round(coverage, 6),
        "unmatchedNumbers": unmatched_numbers,
        "reason": reason,
        "semanticEntailmentEvaluated": False,
    }


def run_judge(command: str, claim: str, evidence: str, source_ids: list[str]) -> dict[str, Any]:
    argv = shlex.split(command)
    if not argv:
        return {"status": "judge_error", "error": "empty judge command"}
    completed = subprocess.run(
        argv,
        input=json.dumps({"claim": claim, "evidence": evidence, "sourceIds": source_ids}, ensure_ascii=False),
        text=True,
        capture_output=True,
        timeout=45,
        check=False,
    )
    if completed.returncode != 0:
        return {"status": "judge_error", "returnCode": completed.returncode, "stderr": completed.stderr[-1000:]}
    try:
        value = json.loads(completed.stdout)
    except json.JSONDecodeError:
        return {"status": "judge_error", "error": "judge returned non-JSON output"}
    if not isinstance(value, dict) or not isinstance(value.get("entailed"), bool):
        return {"status": "judge_error", "error": "judge response schema invalid"}
    confidence = value.get("confidence", 0.0)
    confidence = float(confidence) if isinstance(confidence, (int, float)) else 0.0
    return {
        "status": "evaluated",
        "entailed": value["entailed"],
        "confidence": max(0.0, min(1.0, confidence)),
        "rationale": str(value.get("rationale", ""))[:1000],
    }


def evaluate(payload: dict[str, Any], judge_command: str | None) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    for item in statements(payload):
        if item.get("status") != "supported":
            continue
        claim = item.get("text") if isinstance(item.get("text"), str) else ""
        raw_ids = item.get("sourceIds")
        source_ids = [value for value in raw_ids if isinstance(value, str)] if isinstance(raw_ids, list) else []
        evidence, resolved = cited_evidence(payload, source_ids)
        row: dict[str, Any] = {
            "kind": item.get("kind"),
            "theme": item.get("theme"),
            "text": claim,
            "sourceIds": source_ids,
            "resolvedSourceIds": resolved,
            "heuristic": heuristic(claim, evidence),
        }
        if judge_command:
            row["judge"] = run_judge(judge_command, claim, evidence, resolved)
        rows.append(row)

    hard_failures = sum(row["heuristic"]["disposition"] == "fail" for row in rows)
    high_confidence_judge_failures = sum(
        row.get("judge", {}).get("status") == "evaluated"
        and not row.get("judge", {}).get("entailed", False)
        and float(row.get("judge", {}).get("confidence", 0.0)) >= 0.75
        for row in rows
    )
    return {
        "supportedStatements": len(rows),
        "hardFailures": hard_failures,
        "judgeHighConfidenceFailures": high_confidence_judge_failures,
        "needsReview": sum(row["heuristic"]["disposition"] == "needs_review" for row in rows),
        "semanticJudgeConfigured": bool(judge_command),
        "rows": rows,
    }


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("response", type=Path)
    parser.add_argument("--judge-command")
    parser.add_argument("--fail-on-review", action="store_true")
    args = parser.parse_args(argv[1:])
    payload = json.loads(args.response.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise SystemExit("response must be a JSON object")
    report = evaluate(payload, args.judge_command)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    failed = report["hardFailures"] > 0 or report["judgeHighConfidenceFailures"] > 0
    if args.fail_on_review and report["needsReview"] > 0:
        failed = True
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
