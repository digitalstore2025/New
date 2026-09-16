#!/usr/bin/env python3
"""Evidence-to-claim review gate for GlobeSpark Grounded RAG.

This tool is intentionally conservative. Its built-in lexical heuristic never
claims semantic entailment. It identifies obviously risky supported claims and
queues paraphrastic/ambiguous claims for semantic review.

Optional judge integration:
  python evals/semantic_review.py response.json --judge-command 'python my_judge.py'

The judge command receives one JSON object on stdin and must return:
  {"entailed": true|false, "confidence": 0..1, "rationale": "..."}

No API keys or provider credentials are stored in this repository.
"""

from __future__ import annotations

import argparse
import json
import re
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


def tokens(text: str) -> set[str]:
    return {
        token
        for token in TOKEN_RE.findall(normalize(text))
        if len(token) >= 3 and token not in STOP
    }


def flatten(value: Any) -> Iterable[str]:
    if value is None:
        return
    if isinstance(value, bool):
        yield "true" if value else "false"
        return
    if isinstance(value, (str, int, float)):
        yield str(value)
        return
    if isinstance(value, list):
        for item in value:
            yield from flatten(item)
        return
    if isinstance(value, dict):
        for key, item in value.items():
            yield str(key)
            yield from flatten(item)


def iter_statements(payload: dict[str, Any]) -> Iterable[dict[str, Any]]:
    summary = payload.get("summary")
    if isinstance(summary, dict):
        yield {"kind": "summary", **summary}
    claims = payload.get("claims")
    if isinstance(claims, list):
        for claim in claims:
            if isinstance(claim, dict):
                yield {"kind": "claim", **claim}


def evidence_for(payload: dict[str, Any], source_ids: list[str]) -> tuple[str, list[str]]:
    sources = payload.get("sources")
    source_map = {
        item.get("id"): item
        for item in sources
        if isinstance(item, dict) and isinstance(item.get("id"), str)
    } if isinstance(sources, list) else {}
    chunks: list[str] = []
    resolved: list[str] = []
    for source_id in source_ids:
        source = source_map.get(source_id)
        if not isinstance(source, dict):
            continue
        resolved.append(source_id)
        chunks.extend(flatten(source.get("evidence")))
    return " ".join(chunks), resolved


def lexical_review(statement: str, evidence: str) -> dict[str, Any]:
    statement_tokens = tokens(statement)
    evidence_tokens = tokens(evidence)
    overlap = statement_tokens & evidence_tokens
    coverage = len(overlap) / len(statement_tokens) if statement_tokens else 0.0
    claim_numbers = set(NUMBER_RE.findall(normalize(statement)))
    evidence_numbers = set(NUMBER_RE.findall(normalize(evidence)))
    unmatched_numbers = sorted(claim_numbers - evidence_numbers)

    if unmatched_numbers:
        disposition = "fail"
        reason = "claim contains numeric values absent from cited evidence"
    elif coverage >= 0.72:
        disposition = "likely_supported"
        reason = "high lexical overlap; semantic entailment still not proven"
    elif coverage >= 0.35:
        disposition = "needs_review"
        reason = "partial overlap may reflect paraphrase or unsupported detail"
    else:
        disposition = "needs_review"
        reason = "low lexical overlap; semantic review required"

    return {
        "disposition": disposition,
        "tokenCoverage": round(coverage, 6),
        "unmatchedNumbers": unmatched_numbers,
        "reason": reason,
        "semanticEntailmentEvaluated": False,
    }


def run_judge(command: str, payload: dict[str, Any]) -> dict[str, Any]:
    completed = subprocess.run(
        command,
        input=json.dumps(payload, ensure_ascii=False),
        text=True,
        shell=True,
        capture_output=True,
        timeout=45,
        check=False,
    )
    if completed.returncode != 0:
        return {
            "status": "judge_error",
            "returnCode": completed.returncode,
            "stderr": completed.stderr[-1200:],
        }
    try:
        value = json.loads(completed.stdout)
    except json.JSONDecodeError:
        return {"status": "judge_error", "stderr": "judge returned non-JSON output"}
    if not isinstance(value, dict) or not isinstance(value.get("entailed"), bool):
        return {"status": "judge_error", "stderr": "judge response schema invalid"}
    confidence = value.get("confidence")
    if not isinstance(confidence, (int, float)):
        confidence = 0.0
    return {
        "status": "evaluated",
        "entailed": value["entailed"],
        "confidence": max(0.0, min(1.0, float(confidence))),
        "rationale": str(value.get("rationale", ""))[:1000],
    }


def evaluate(payload: dict[str, Any], judge_command: str | None) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    for statement in iter_statements(payload):
        if statement.get("status") != "supported":
            continue
        text = statement.get("text") if isinstance(statement.get("text"), str) else ""
        ids = statement.get("sourceIds")
        ids = [item for item in ids if isinstance(item, str)] if isinstance(ids, list) else []
        evidence, resolved = evidence_for(payload, ids)
        lexical = lexical_review(text, evidence)
        row: dict[str, Any] = {
            "kind": statement.get("kind"),
            "theme": statement.get("theme"),
            "text": text,
            "sourceIds": ids,
            "resolvedSourceIds": resolved,
            "lexical": lexical,
        }
        if judge_command:
            row["judge"] = run_judge(
                judge_command,
                {"claim": text, "evidence": evidence, "sourceIds": resolved},
            )
        rows.append(row)

    hard_failures = sum(row["lexical"]["disposition"] == "fail" for row in rows)
    judge_failures = sum(
        row.get("judge", {}).get("status") == "evaluated"
        and not row.get("judge", {}).get("entailed", False)
        and float(row.get("judge", {}).get("confidence", 0.0)) >= 0.75
        for row in rows
    )
    review_queue = sum(row["lexical"]["disposition"] == "needs_review" for row in rows)
    return {
        "supportedStatements": len(rows),
        "hardFailures": hard_failures,
        "judgeHighConfidenceFailures": judge_failures,
        "needsReview": review_queue,
        "semanticJudgeConfigured": bool(judge_command),
        "rows": rows,
    }


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("response", type=Path)
    parser.add_argument("--judge-command")
    parser.add_argument(
        "--fail-on-review",
        action="store_true",
        help="Treat heuristic needs_review results as CI failures.",
    )
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
