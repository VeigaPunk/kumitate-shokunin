import hashlib
import pathlib
import re

ROOT = pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
BUILD = ROOT / '.ufo/waves/round-69/build/K69ScribeLed63'
SPOT = ROOT / 'corpus/lessons/round-63-verifier-spotcheck.md'


def norm(s):
    s = re.sub(r'\*\*|__|`', '', s)
    s = s.translate(str.maketrans({'—': '-', '–': '-', '“': '"', '”': '"', '‘': "'", '’': "'"}))
    return ' '.join(s.split())


def hits(q, text):
    return len(re.findall(r'(?<![A-Za-z0-9])' + re.escape(norm(q)) + r'(?![A-Za-z0-9])', norm(text)))


def parse(text):
    # Independent fence-aware parser: only column-zero list starts yield items.
    # Indented bullets/continuations attach to their parent. Tables skip headers/separators.
    lines = text.splitlines()
    visible = []
    fence = None
    for no, line in enumerate(lines, 1):
        m = re.match(r'^ {0,3}(`{3,}|~{3,})', line)
        if m:
            token = m.group(1)
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence):
                fence = None
            continue
        if fence is None:
            visible.append((no, line))
    sections, items = [], []
    active = False
    level = 0
    current = None
    sep = lambda s: bool(re.fullmatch(r'\|[\s:|\-]+\|\s*', s))
    for i, (no, line) in enumerate(visible):
        heading = re.match(r'^(#{1,6})\s+(.*)', line)
        if heading:
            new = bool(re.search(r'\brouted\s+(?:defects?|items?)\b', heading[2], re.I))
            if active and (len(heading[1]) <= level or new):
                active = False
                current = None
            if new:
                active = True
                level = len(heading[1])
                sections.append([])
            continue
        if not active:
            continue
        sections[-1].append(line)
        bullet = re.match(r'^(?:[-*+]|\d+[.)])\s+\S', line)
        table = line.startswith('|') and not sep(line)
        if table and i + 1 < len(visible) and sep(visible[i + 1][1]):
            table = False
        if bullet or table:
            current = {'line': no, 'text': line}
            items.append(current)
        elif current is not None and line[:1].isspace():
            current['text'] += '\n' + line
    return sections, items


sections, items = parse(SPOT.read_text())
print('SOURCE', str(SPOT.relative_to(ROOT)), 'sha256=' + hashlib.sha256(SPOT.read_bytes()).hexdigest())
print(f'FENCE_AWARE_COUNT sections={len(sections)} items={len(items)} expected=6')
assert len(sections) == 1 and len(items) == 6
rows = BUILD.joinpath('rows.md').read_text().splitlines()
assert len(rows) == len(items)
closed = 0
for ordinal, row in enumerate(rows, 1):
    cells = [c.strip() for c in row.strip('|').split('|')]
    assert len(cells) == 7
    ident, rnd, idx, quoted, cls, status, answer = cells
    quote = quoted[1:-1]
    assert ident == f'R63-D{ordinal}' and rnd == '63' and idx == str(ordinal)
    assert re.search(r'\*\*D' + str(ordinal) + r'\b', items[ordinal - 1]['text'])
    count = len(norm(quote).split())
    own = hits(quote, items[ordinal - 1]['text'])
    section = hits(quote, '\n'.join(sections[0]))
    matched = sum(bool(hits(quote, it['text'])) for it in items)
    assert 3 <= count <= 25 and own == section == matched == 1
    print(f'{ident} source_line={items[ordinal - 1]["line"]} words={count} item_hits={own} section_hits={section} matched_items={matched} quote="{quote}" PASS')
    if status == 'open':
        assert answer == '-'
        print(f'{ident} status=open answer=- (no closure claimed)')
        continue
    assert status == 'closed'
    m = re.fullmatch(r'([^\s]+):(\d+) — "(.+)"', answer)
    assert m
    relative, number, aq = m.groups()
    p = ROOT / relative
    assert not p.is_symlink() and p.is_file() and p.resolve().is_relative_to(ROOT)
    assert relative != 'corpus/routed-ledger.md' and 'spotcheck' not in relative
    line = p.read_text().splitlines()[int(number) - 1]
    assert hits(aq, line) == 1 and len(norm(aq).split()) <= 25
    print(f'{ident} ANSWER {relative}:{number} quote="{aq}" exact_line=PASS')
    print('EXACT_LINE ' + line)
    closed += 1
print(f'LED63_VERIFY: PASS rows={len(rows)} closed={closed} open={len(rows)-closed}')
