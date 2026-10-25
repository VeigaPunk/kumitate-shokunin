#!/usr/bin/env python3
"""numbers-check.py — prose-number closure for the C2 coordinator-topology entry.

Fails when any number token in the entry's PROSE is absent from the captures
bound (in .ufo/pins/source-captures.json) to the rows the entry cites on its
`source:` lines.

Prose = the entry minus (a) the header metadata lines (`source:`, `verified-at:`,
`recheck:`, `coverage-map:` — pinned/verified fields, not prose), (b) the
`## Located quotes` section (quotes are capture text by construction; their
integrity is T4/T5's job), (c) `S###` row references (identifiers, not numbers),
(d) ISO dates `YYYY-MM-DD` (verification metadata), and (e) numbers directly
preceded by `§` (section pointers, not measurements).

A token keeps an optional leading sign (unicode minus normalised to ASCII) and
an optional `vNN` version suffix, so `2512.08296v3` is one token and a sign flip
changes the token. Trailing `,`/`.` punctuation is stripped from tokens.

Usage:
  python3 numbers-check.py <repo-root> [--entry <entry-path>] [--pins <pins-json>]

Exit 0 = PASS, 1 = FAIL (missing numbers), 2 = environment/cannot-verify (fail-closed).
"""
import argparse
import html
import json
import re
import sys
from pathlib import Path

TOKEN = re.compile(r'[-+]?\d[\d,]*(?:\.\d+)?(?:v\d+)?')
SECTION_REF = re.compile(r'(?<=§)\d[\d.,]*')
S_ID = re.compile(r'\bS\d{3,}\b')
ISO_DATE = re.compile(r'\b\d{4}-\d{2}-\d{2}\b')
HEADER_KEY = re.compile(r'^(source:|verified-at:|recheck:|coverage-map:)')


def norm(s: str) -> str:
    s = re.sub(r'(?is)<script.*?</script>|<style.*?</style>', ' ', s)
    s = re.sub(r'<[^>]+>', ' ', s)
    s = s.replace('&nbsp;', ' ').replace('&#160;', ' ')
    s = html.unescape(s)
    s = s.replace('\u2018', "'").replace('\u2019', "'")
    s = s.replace('\u201c', '"').replace('\u201d', '"')
    s = s.replace('\u2013', '-').replace('\u2014', '-').replace('\u2212', '-')
    s = re.sub(r'\*\*|__|`', '', s)
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r'(^|[\s(=])-\s+(?=\d)', r'\1-', s)
    return s.strip()


def prose_lines(entry: str):
    """Yield (lineno, prose-line) with header/quotes/S-ids/dates/§refs removed."""
    cited = set()
    in_quotes = False
    for lineno, line in enumerate(entry.splitlines(), 1):
        if line.startswith('source:'):
            cited.update(re.findall(r'\bS\d{3,}\b', line))
            continue
        if HEADER_KEY.match(line):
            continue
        if re.match(r'^##\s+Located quotes\s*$', line):
            in_quotes = True
            continue
        if in_quotes:
            if re.match(r'^##\s', line):
                in_quotes = False
            else:
                continue
        line = S_ID.sub(' ', line)
        line = ISO_DATE.sub(' ', line)
        line = SECTION_REF.sub('', line)
        line = line.replace('\u2013', '-').replace('\u2014', '-').replace('\u2212', '-')
        line = re.sub(r'(^|[\s(=])-\s+(?=\d)', r'\1-', line)
        yield lineno, line
    return cited


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('root')
    ap.add_argument('--entry', default='corpus/knowledge/multi-agent-coordinator-topologies.md')
    ap.add_argument('--pins', default='.ufo/pins/source-captures.json')
    a = ap.parse_args()
    root = Path(a.root)
    entry_path = root / a.entry
    pins_path = root / a.pins
    if not entry_path.is_file():
        print(f'NUMBERS_CHECK: FAIL-CLOSED entry absent: {entry_path}')
        return 2
    if not pins_path.is_file():
        print(f'NUMBERS_CHECK: FAIL-CLOSED pins absent: {pins_path}')
        return 2
    entry = entry_path.read_text(encoding='utf-8')
    try:
        pins = json.loads(pins_path.read_text(encoding='utf-8'))['captures']
    except Exception as e:
        print(f'NUMBERS_CHECK: FAIL-CLOSED pins unreadable: {e}')
        return 2

    prose = list(prose_lines(entry))
    cited = sorted({sid for line in entry.splitlines() if line.startswith('source:')
                    for sid in re.findall(r'\bS\d{3,}\b', line)})
    if not cited:
        print('NUMBERS_CHECK: FAIL-CLOSED no cited S-ids on source: lines')
        return 2
    pin_by_id = {c.get('sourceId'): c for c in pins}
    cap_tokens = set()
    for sid in cited:
        c = pin_by_id.get(sid)
        if c is None:
            print(f'NUMBERS_CHECK: FAIL-CLOSED {sid}: no pin in {a.pins}')
            return 2
        cap = root / c['path']
        if not cap.is_file():
            print(f'NUMBERS_CHECK: FAIL-CLOSED {sid}: capture absent: {cap}')
            return 2
        for tok in TOKEN.findall(norm(cap.read_bytes().decode('utf-8', 'replace'))):
            cap_tokens.add(tok.rstrip(',.'))

    missing = []
    seen = set()
    total = 0
    for lineno, line in prose:
        for tok in TOKEN.findall(line):
            tok = tok.rstrip(',.')
            total += 1
            if tok not in cap_tokens and tok not in seen:
                seen.add(tok)
                missing.append((lineno, tok))
    ids = ','.join(cited)
    if missing:
        detail = ' '.join(f'{t}@L{n}' for n, t in missing)
        print(f'NUMBERS_CHECK: FAIL missing={len(missing)}/{total} tokens not in captures[{ids}]: {detail}')
        return 1
    print(f'NUMBERS_CHECK: PASS prose-numbers={total} all in captures[{ids}]')
    return 0


if __name__ == '__main__':
    sys.exit(main())
