#!/usr/bin/env python3
"""Fail CI when private/research artifacts or obvious secrets enter public GlobeSpark.

This is a narrow deterministic guard. It does not replace secret scanning, SAST,
or legal/privacy review. It enforces project-specific repository boundaries.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FORBIDDEN_SUFFIXES = {
    ".xlsx", ".xls", ".xlsm", ".ods", ".sqlite", ".sqlite3", ".db",
    ".pem", ".key", ".p12", ".pfx",
}

FORBIDDEN_PATH_TOKENS = {
    "prospect", "prospecting", "outreach", "contacts", "contact-list",
    "leads", "lead-list", "validation_queue", "validation-queue",
    "high_priority", "high-priority", "all_accounts", "all-accounts",
}

FORBIDDEN_CONTENT_MARKERS = {
    "Recommended_Roles",
    "Outreach_Angle",
    "First_Message_Type",
    "Why_Relevant",
    "Validation Queue",
    "Fit Score",
    "Source_Task_ID",
}

SECRET_PATTERNS = {
    "OpenAI-style secret": re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b"),
    "Google API key": re.compile(r"\bAIza[0-9A-Za-z_-]{30,}\b"),
    "Private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
}

TEXT_SUFFIXES = {
    ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".txt", ".html",
    ".css", ".xml", ".yml", ".yaml", ".py", ".d.ts",
}


def fail(message: str, findings: list[str]) -> int:
    print(message, file=sys.stderr)
    for finding in findings:
        print(f" - {finding}", file=sys.stderr)
    return 1


def main() -> int:
    findings: list[str] = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT).as_posix()
        rel_lower = rel.lower()

        if path.suffix.lower() in FORBIDDEN_SUFFIXES:
            findings.append(f"forbidden file type: {rel}")
            continue

        parts = {part.lower() for part in path.parts}
        if any(token in rel_lower or token in parts for token in FORBIDDEN_PATH_TOKENS):
            # Policy documents are allowed to discuss these concepts explicitly.
            if not rel.startswith("docs/"):
                findings.append(f"private/research path marker: {rel}")

        if path.name.startswith(".env") and path.name not in {".env.example", ".env.sample"}:
            findings.append(f"environment file is not allowed: {rel}")
            continue

        if path.suffix.lower() not in TEXT_SUFFIXES and path.name not in {"Dockerfile"}:
            continue

        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            findings.append(f"unexpected non-UTF8 text-like file: {rel}")
            continue

        if not rel.startswith("docs/"):
            for marker in FORBIDDEN_CONTENT_MARKERS:
                if marker in text:
                    findings.append(f"private workbook marker {marker!r} in {rel}")

        for label, pattern in SECRET_PATTERNS.items():
            if pattern.search(text):
                findings.append(f"{label} pattern in {rel}")

    if findings:
        return fail("Public-data boundary guard failed.", findings)

    print("Public-data boundary guard passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
