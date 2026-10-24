#!/usr/bin/env python3
"""ScoutS122 read-only Kafka source and capture verifier.

Checks the three R1 entry quotations in fresh, live-pinned, and R1-pinned HTML;
checks S122's R1 capture binding and fresh/pinned byte identity. Exit 0 means
all checks passed, 1 means a mismatch or malformed evidence, and 64 means usage.
"""

import argparse
import hashlib
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

URL = "https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html"
CAPTURE_PATH = ".ufo/waves/round-58/build/ScoutKafkaOffsets/body.html"
QUOTES = {
    "committed-position": "The committed position is the last offset that has been stored securely.",
    "next-message-commit-invariant": "Note: The committed offset should always be the offset of the next message that your application will read.",
    "at-least-once-replay-example": "In this case the process that took over consumption would consume from last committed offset and would repeat the insert of the last batch of data.",
}


class Parser(argparse.ArgumentParser):
    def error(self, message):
        self.print_usage(sys.stderr)
        self.exit(64, f"{self.prog}: error: {message}\n")


class TextParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def normalized_html(data):
    parser = TextParser()
    parser.feed(data.decode("utf-8"))
    parser.close()
    return re.sub(r"\s+", " ", " ".join(parser.parts)).strip()


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = Parser()
    parser.add_argument("--fresh", type=Path, required=True)
    parser.add_argument("--pinned", type=Path, required=True)
    parser.add_argument("--r1-capture", type=Path, required=True)
    parser.add_argument("--registry-json", type=Path, required=True)
    parser.add_argument("--entry", type=Path, required=True)
    parser.add_argument("--fetch-metadata", type=Path, required=True)
    args = parser.parse_args()

    bodies = {
        "fresh": args.fresh.read_bytes(),
        "pinned_live": args.pinned.read_bytes(),
        "pinned_r1": args.r1_capture.read_bytes(),
    }
    texts = {name: normalized_html(data) for name, data in bodies.items()}
    entry = args.entry.read_text(encoding="utf-8")
    registry = json.loads(args.registry_json.read_text(encoding="utf-8"))
    metadata = dict(
        line.split("=", 1)
        for line in args.fetch_metadata.read_text(encoding="utf-8").splitlines()
        if "=" in line
    )
    captures = [row for row in registry["captures"] if row.get("sourceId") == "S122"]

    result = {
        "url": URL,
        "http": metadata,
        "bytes": {name: len(data) for name, data in bodies.items()},
        "sha256": {name: sha256(data) for name, data in bodies.items()},
        "quotes": {},
        "registry": {},
        "page": {},
    }
    checks = []

    def check(name, ok):
        checks.append((name, bool(ok)))
        return bool(ok)

    check("fetch-http-200", metadata.get("http_code") == "200")
    check("fetch-effective-url", metadata.get("url_effective") == URL)
    check("r1-entry-url", URL in entry)
    check("page-title", all("KafkaConsumer (kafka 4.3.1 API)" in text for text in texts.values()))
    for heading in ("Offsets and Consumer Position", "Manual Offset Control"):
        ok = all(heading in text for text in texts.values())
        result["page"][heading] = ok
        check(f"heading:{heading}", ok)

    for quote_id, quote in QUOTES.items():
        row = {
            "quote": quote,
            "words": len(quote.split()),
            "in_r1_entry": quote in entry,
            "normalized_text": {name: quote in text for name, text in texts.items()},
            "contiguous_raw_bytes": {name: quote.encode() in data for name, data in bodies.items()},
        }
        result["quotes"][quote_id] = row
        check(f"{quote_id}:r1-entry", row["in_r1_entry"])
        for name, ok in row["normalized_text"].items():
            check(f"{quote_id}:{name}:normalized-text", ok)

    check("one-s122-registry-row", len(captures) == 1)
    if len(captures) == 1:
        capture = captures[0]
        result["registry"] = capture
        check("registry-capture-path", capture.get("path") == CAPTURE_PATH)
        check("registry-r1-sha256", capture.get("sha256") == sha256(bodies["pinned_r1"]))
        check("registry-r1-bytes", capture.get("bytes") == len(bodies["pinned_r1"]))
    check("live-equals-r1", bodies["pinned_live"] == bodies["pinned_r1"])
    check("fresh-equals-r1", bodies["fresh"] == bodies["pinned_r1"])
    check("fresh-equals-live", bodies["fresh"] == bodies["pinned_live"])

    result["checks"] = {name: ok for name, ok in checks}
    result["failed_checks"] = [name for name, ok in checks if not ok]
    result["verdict"] = "PASS" if all(ok for _, ok in checks) else "FAIL"
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["verdict"] == "PASS" else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f"SCOUTS122: FAIL-CLOSED {type(exc).__name__}: {exc}", file=sys.stderr)
        sys.exit(1)
