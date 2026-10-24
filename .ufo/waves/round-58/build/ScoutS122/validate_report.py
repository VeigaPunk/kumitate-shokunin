#!/usr/bin/env python3
"""Validate the ScoutS122 report against its local evidence bundle.

Checks required report fields, the three located-quote word limits, verifier
status, and completeness/exit status of the command transcripts. Exit 0 means
valid, 1 means invalid evidence, and 64 means usage.
"""

import argparse
import json
import re
import sys
from pathlib import Path

URL = "https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html"
REV = "6affb9ebde37b7d663658f1959d64f0f0b68f480"
DIGEST = "ed0068fabe16e861a4be746dbd91db68c7fdef5742f08f6a51d3d26d209e9d41"
COMMANDS = [
    "00-access-date",
    "01-fetch",
    "02-r1-registry",
    "03-r1-entry",
    "04-r1-capture",
    "05-sha256",
    "06-byte-count",
    "07-cmp-fresh-r1",
    "08-cmp-fresh-live",
    "09-cmp-live-r1",
    "10-verify",
]


class Parser(argparse.ArgumentParser):
    def error(self, message):
        self.print_usage(sys.stderr)
        self.exit(64, f"{self.prog}: error: {message}\n")


def main():
    parser = Parser()
    parser.add_argument("--build", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()

    report = args.report.read_text(encoding="utf-8")
    required = [URL, REV, DIGEST, "2026-10-24", "Tier judgment: **A**", "Q49 result: PASS"]
    missing = [value for value in required if value not in report]
    quotes = re.findall(r"“([^”]+)”", report)
    word_counts = [len(quote.split()) for quote in quotes]
    verification = json.loads((args.build / "10-verify.stdout.txt").read_text(encoding="utf-8"))

    failures = []
    if missing:
        failures.append(f"missing-report-fields={missing}")
    if len(quotes) != 3:
        failures.append(f"located-quotes={len(quotes)}")
    if len(word_counts) != 3 or any(count > 25 for count in word_counts):
        failures.append(f"quote-word-counts={word_counts}")
    if verification.get("verdict") != "PASS" or verification.get("failed_checks") != []:
        failures.append("source-verifier-not-pass")
    for name in COMMANDS:
        for kind in ("command", "stdout", "stderr", "exit"):
            path = args.build / f"{name}.{kind}.txt"
            if not path.is_file():
                failures.append(f"missing={path.name}")
        exit_path = args.build / f"{name}.exit.txt"
        command_path = args.build / f"{name}.command.txt"
        if exit_path.is_file() and exit_path.read_text().strip() != "0":
            failures.append(f"nonzero={name}")
        if command_path.is_file() and not command_path.read_text().strip():
            failures.append(f"empty-command={name}")

    if failures:
        print("SCOUTS122_REPORT: FAIL " + "; ".join(failures))
        return 1
    print(
        "SCOUTS122_REPORT: PASS "
        f"quotes={len(quotes)} word_counts={','.join(map(str, word_counts))} "
        f"evidence_commands={len(COMMANDS)} all_exit=0"
    )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"SCOUTS122_REPORT: FAIL {type(exc).__name__}: {exc}", file=sys.stderr)
        sys.exit(1)
