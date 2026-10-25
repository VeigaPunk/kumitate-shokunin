#!/usr/bin/env python3
"""Tag-strip ScoutMcpArch/body.html and locate quote-s125.txt.

Primary text is HTMLParser data nodes in document order (convert_charrefs
on). Tags are not emitted. Whitespace runs are then collapsed to one ASCII
space. A second text drops script/style/noscript data. A third inserts one
space at each tag boundary before collapsing, so a match that exists only
because a tag was turned into a space is visible.

Exit 0 when the quote sentence is a substring of the primary normalized
text and its whitespace word count is <= 25. Exit 1 when either conjunct
fails. Exit 2 on usage or I/O.
"""

from __future__ import annotations

import hashlib
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

QUOTE = Path(
    "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/receipts/quote-s125.txt"
)
BODY = Path(
    "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/build/ScoutMcpArch/body.html"
)
OUT = Path(
    "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/build/RevS125Quote"
)
HIDDEN = {"script", "style", "noscript"}
WS = re.compile(r"\s+")


class Collector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[str] = []
        self.hidden = 0
        self.nodes: list[tuple[str, str, str]] = []

    def _push_boundary(self, tag: str) -> None:
        self.nodes.append(("boundary", " ", tag))

    def handle_starttag(self, tag: str, attrs) -> None:
        low = tag.lower()
        self.stack.append(low)
        if low in HIDDEN:
            self.hidden += 1
        self._push_boundary(low)

    def handle_startendtag(self, tag: str, attrs) -> None:
        self._push_boundary(tag.lower())

    def handle_endtag(self, tag: str) -> None:
        low = tag.lower()
        if low in HIDDEN and self.hidden:
            self.hidden -= 1
        self._push_boundary(low)
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i] == low:
                del self.stack[i]
                break

    def handle_data(self, data: str) -> None:
        path = "/".join(self.stack[-8:])
        kind = "hidden" if self.hidden else "visible"
        self.nodes.append((kind, data, path))

    def handle_comment(self, data: str) -> None:
        return


def normalize(parts: list[str]) -> str:
    return WS.sub(" ", "".join(parts)).strip()


def locate(text: str, sentence: str) -> list[int]:
    offsets: list[int] = []
    start = 0
    while True:
        i = text.find(sentence, start)
        if i < 0:
            return offsets
        offsets.append(i)
        start = i + 1


def window(text: str, offset: int, n: int, radius: int = 180) -> str:
    a = max(0, offset - radius)
    b = min(len(text), offset + n + radius)
    return text[a:b]


def main() -> int:
    if not QUOTE.is_file() or not BODY.is_file():
        print("missing input", file=sys.stderr)
        return 2
    raw_quote = QUOTE.read_bytes()
    raw_body = BODY.read_bytes()
    quote_text = raw_quote.decode("utf-8")
    body_text = raw_body.decode("utf-8")
    sentence = quote_text.rstrip("\n")
    if "\n" in sentence or sentence == "" or sentence != sentence.strip():
        print(f"QUOTE_SHAPE multiline_or_padded={sentence!r}")
    words = sentence.split()
    word_count = len(words)
    print(f"QUOTE_REPR {sentence!r}")
    print(f"QUOTE_BYTES {len(raw_quote)}")
    print(f"QUOTE_SHA256 {hashlib.sha256(raw_quote).hexdigest()}")
    print(f"QUOTE_WORDS {word_count}")
    print(f"QUOTE_WORDS_LE_25 {word_count <= 25}")
    print(f"BODY_BYTES {len(raw_body)}")
    print(f"BODY_SHA256 {hashlib.sha256(raw_body).hexdigest()}")

    parser = Collector()
    parser.feed(body_text)
    parser.close()

    primary = normalize([data for kind, data, _ in parser.nodes if kind in {"visible", "hidden"}])
    visible = normalize([data for kind, data, _ in parser.nodes if kind == "visible"])
    bounded = normalize([data for kind, data, _ in parser.nodes])
    (OUT / "stripped-primary.txt").write_text(primary + "\n", encoding="utf-8")
    (OUT / "stripped-visible.txt").write_text(visible + "\n", encoding="utf-8")
    (OUT / "stripped-boundary-spaced.txt").write_text(bounded + "\n", encoding="utf-8")

    raw_hits = body_text.count(sentence)
    print(f"RAW_HTML_COUNT {raw_hits}")
    print(f"PRIMARY_CHARS {len(primary)}")
    print(f"VISIBLE_CHARS {len(visible)}")
    print(f"BOUNDARY_CHARS {len(bounded)}")

    for label, text in (
        ("PRIMARY", primary),
        ("VISIBLE", visible),
        ("BOUNDARY", bounded),
    ):
        hits = locate(text, sentence)
        print(f"{label}_COUNT {len(hits)}")
        print(f"{label}_OFFSETS {' '.join(str(i) for i in hits) if hits else '-'}")
        for n, off in enumerate(hits[:3], 1):
            after = text[off + len(sentence) : off + len(sentence) + 1]
            print(f"{label}_HIT{n}_NEXT {after!r}")
            print(f"{label}_HIT{n}_WINDOW {window(text, off, len(sentence))}")

    # Data nodes that contain any whitespace-token of the sentence, for the
    # first primary hit's neighborhood. Printed only as paths, not page dumps.
    primary_hits = locate(primary, sentence)
    if primary_hits:
        off = primary_hits[0]
        # Rebuild primary while remembering which visible/hidden node contributed
        # each normalized span, so the hit can be tied to element paths.
        cursor = 0
        spans: list[tuple[int, int, str, str]] = []
        buf: list[str] = []
        for kind, data, path in parser.nodes:
            if kind not in {"visible", "hidden"}:
                continue
            buf.append(data)
        joined = "".join(buf)
        # Map normalized offset back through the same collapse.
        norm_i = 0
        raw_i = 0
        # Walk joined and normalized together.
        norm = primary
        mapping: list[int] = []
        j = 0
        i = 0
        while i < len(joined) and j < len(norm):
            if joined[i].isspace():
                if j < len(norm) and norm[j] == " " and (i == 0 or not joined[i - 1].isspace()):
                    mapping.append(i)
                    j += 1
                i += 1
                continue
            if joined[i] == norm[j]:
                mapping.append(i)
                i += 1
                j += 1
                continue
            break
        print(f"PRIMARY_MAP_COVERED {j} of {len(norm)} joined_len={len(joined)}")
        if j == len(norm) and off + len(sentence) <= len(mapping):
            raw_a = mapping[off]
            raw_b = mapping[off + len(sentence) - 1] + 1
            pos = 0
            print("PRIMARY_HIT1_NODES")
            for kind, data, path in parser.nodes:
                if kind not in {"visible", "hidden"}:
                    continue
                a, b = pos, pos + len(data)
                if b > raw_a and a < raw_b:
                    snippet = data.replace("\n", "\\n")
                    if len(snippet) > 160:
                        snippet = snippet[:160] + "…"
                    print(f"  kind={kind} path={path or '(root)'} text={snippet!r}")
                pos = b

    occurs = bool(primary_hits)
    short = word_count <= 25
    print(f"OCCURS_IN_PRIMARY {occurs}")
    print(f"AT_MOST_25 {short}")
    print(f"ITEM {'HOLD' if occurs and short else 'MISS'}")
    return 0 if occurs and short else 1


if __name__ == "__main__":
    sys.exit(main())
