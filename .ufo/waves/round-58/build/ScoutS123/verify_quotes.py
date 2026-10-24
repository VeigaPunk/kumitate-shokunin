#!/usr/bin/env python3
# ScoutS123 evidence verifier: checks three frozen R1 LangGraph quotes in two HTML captures.
# Contract: stdout records hashes, byte counts, and per-quote results; exit 0 all found, 1 any miss, 2 usage/I/O.

import hashlib
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

QUOTES = [
    "The state of a thread at a particular point in time is called a checkpoint.",
    "A checkpoint is a snapshot of the graph state saved at each super-step and is represented by a StateSnapshot object",
    "you can only resume execution from a checkpoint",
]


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.suppressed = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.suppressed += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.suppressed:
            self.suppressed -= 1

    def handle_data(self, data):
        if not self.suppressed:
            self.parts.append(data)


def inspect(path):
    raw = path.read_bytes()
    parser = VisibleText()
    parser.feed(raw.decode("utf-8"))
    parser.close()
    text = re.sub(r"\s+", " ", "".join(parser.parts)).strip()
    return raw, text


def main():
    if len(sys.argv) != 3:
        print(f"usage: {sys.argv[0]} <fresh-body.html> <prior-body.html>", file=sys.stderr)
        return 2
    try:
        captures = {name: inspect(Path(arg)) for name, arg in zip(("fresh", "prior"), sys.argv[1:])}
    except (OSError, UnicodeError) as exc:
        print(f"READ_ERROR {exc}", file=sys.stderr)
        return 2

    for name, (raw, text) in captures.items():
        digest = hashlib.sha256(raw).hexdigest()
        print(f"capture={name} path={sys.argv[1 if name == 'fresh' else 2]} bytes={len(raw)} sha256={digest} normalized_chars={len(text)}")

    failures = 0
    for index, quote in enumerate(QUOTES, 1):
        print(f"quote=Q{index} words={len(quote.split())} text={quote}")
        for name, (raw, text) in captures.items():
            count = text.count(quote)
            raw_count = raw.count(quote.encode("utf-8"))
            position = text.find(quote)
            context = text[max(0, position - 60):position + len(quote) + 60] if position >= 0 else ""
            print(f"check=Q{index} capture={name} normalized={'PASS' if count else 'MISS'} normalized_count={count} raw_contiguous_count={raw_count} context={context}")
            if not count:
                failures += 1
    print(f"RESULT: {'PASS' if not failures else 'FAIL'} quotes=3 captures=2 misses={failures}")
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
