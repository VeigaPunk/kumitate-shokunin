#!/usr/bin/env python3
"""ScoutS112 quote checker; exit 0 when all checks hold, 1 on mismatch, 2 on input error."""

from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re
import sys

BUILD = Path("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/ScoutS112")
PINNED = Path("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/ScoutTemporalReplay/body.html")
QUOTES = [
    "A Replay is the method by which a Workflow Execution resumes making progress.",
    "During a Replay the Commands that are generated are checked against an existing Event History.",
    "Replays are necessary and often happen to give the effect that Workflow Executions are resumable, reliable, and durable.",
    "If a failure occurs, the Workflow Execution picks up where the last recorded event occurred in the Event History.",
]


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skipped = 0

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "noscript"}:
            self.skipped += 1

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript"} and self.skipped:
            self.skipped -= 1

    def handle_data(self, data):
        if not self.skipped:
            self.parts.append(data)


def inspect(path):
    data = path.read_bytes()
    raw = data.decode("utf-8")
    parser = TextExtractor()
    parser.feed(raw)
    parser.close()
    normalized = re.sub(r"\s+", " ", " ".join(parser.parts)).strip()
    start = raw.find("id=replay")
    end = raw.find("<h3", start + 1) if start >= 0 else -1
    quotes = []
    for quote in QUOTES:
        raw_offset = raw.find(quote)
        normalized_offset = normalized.find(quote)
        context = ""
        if normalized_offset >= 0:
            left = max(0, normalized_offset - 60)
            right = min(len(normalized), normalized_offset + len(quote) + 60)
            context = normalized[left:right]
        quotes.append({
            "quote": quote,
            "words": len(quote.split()),
            "raw_count": raw.count(quote),
            "normalized_count": normalized.count(quote),
            "raw_offset": raw_offset,
            "normalized_offset": normalized_offset,
            "in_replays_section": start >= 0 and end > start and start < raw_offset < end,
            "context": context,
        })
    return {
        "path": str(path),
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "replays_heading_offset": start,
        "next_section_offset": end,
        "quotes": quotes,
    }, normalized


def main():
    try:
        live, live_text = inspect(BUILD / "live-body.html")
        pinned, pinned_text = inspect(PINNED)
        r1, _ = inspect(BUILD / "pinned-body-r1.html")
    except (OSError, UnicodeError) as exc:
        print(json.dumps({"error": str(exc)}, indent=2))
        return 2
    (BUILD / "live-normalized.txt").write_text(live_text + "\n", encoding="utf-8")
    (BUILD / "pinned-normalized.txt").write_text(pinned_text + "\n", encoding="utf-8")
    all_quotes = all(
        item["raw_count"] >= 1 and item["normalized_count"] >= 1 and item["in_replays_section"]
        for document in (live, pinned)
        for item in document["quotes"]
    )
    byte_identity = live["sha256"] == pinned["sha256"] == r1["sha256"]
    result = {
        "url": "https://docs.temporal.io/workflow-execution",
        "revision": "6affb9ebde37b7d663658f1959d64f0f0b68f480",
        "normalization": "UTF-8; HTMLParser data excluding script/style/noscript; entity decoding; whitespace collapsed",
        "live": live,
        "pinned": pinned,
        "r1_capture": {key: r1[key] for key in ("path", "bytes", "sha256")},
        "live_pinned_r1_byte_identical": byte_identity,
        "all_four_raw_normalized_and_located_in_both": all_quotes,
        "verdict": "PASS" if all_quotes and byte_identity else "FAIL",
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if all_quotes and byte_identity else 1


if __name__ == "__main__":
    sys.exit(main())
