from pathlib import Path
import re

root = Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
source = root / 'corpus/lessons/round-61-verifier-spotcheck.md'
rows = root / '.ufo/waves/round-69/build/K69ScribeLed61/rows.md'
items = []
fence = None
active = False
header = None
for lineno, line in enumerate(source.read_text().splitlines(), 1):
    marker = re.match(r'^\s{0,3}(`{3,}|~{3,})', line)
    if marker:
        token = marker.group(1)
        if fence is None:
            fence = token
        elif token[0] == fence[0] and len(token) >= len(fence):
            fence = None
        continue
    if fence:
        continue
    heading = re.match(r'^(#{1,6})\s+(.+)', line)
    if heading:
        if active and len(heading.group(1)) <= header:
            break
        if 'Routed defects' in heading.group(2):
            active = True
            header = len(heading.group(1))
        continue
    if not active:
        continue
    bullet = re.match(r'^(?:[-+*]|\d+[.)])\s+', line)
    if bullet:
        items.append([lineno, line])
    elif line.startswith('|'):
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if cells and all(re.fullmatch(r':?-+:?', c) for c in cells):
            continue
        # A table header is followed immediately by the separator.
        following = source.read_text().splitlines()[lineno:lineno + 1]
        if following:
            next_cells = [c.strip() for c in following[0].strip().strip('|').split('|')]
            if next_cells and all(re.fullmatch(r':?-+:?', c) for c in next_cells):
                continue
        items.append([lineno, line])
    elif items:
        items[-1][1] += '\n' + line
assert len(items) == 6, len(items)
print('AXIS: operability; draft coverage and binding honesty, no product changes')
print('FENCE_AWARE_ITEMS: 6; nested bullets remain within parent; table delimiters excluded')
section = '\n'.join(text for _, text in items)
count = 0
for row in rows.read_text().splitlines():
    cells = [c.strip() for c in row.strip('|').split('|')]
    ident, round_, ordinal, quoted, cls, status, answer = cells
    index = int(ordinal) - 1
    quote = quoted[1:-1]
    pattern = r'(?<!\w)' + re.escape(quote) + r'(?!\w)'
    words = len(quote.split())
    item_hits = len(re.findall(pattern, items[index][1]))
    section_hits = len(re.findall(pattern, section))
    assert 3 <= words <= 25 and item_hits == section_hits == 1
    assert ident in items[index][1] and round_ == '61'
    print(f'{ident}: item={ordinal} source-line={items[index][0]} words={words} item-hits={item_hits} section-hits={section_hits} quote="{quote}"')
    if status == 'closed':
        match = re.fullmatch(r'(.+):(\d+) — "(.+)"', answer)
        assert match
        path, line, answer_quote = match.groups()
        assert 'spotcheck' not in path and 'spot-check' not in path and 'routed-ledger' not in path
        actual = (root / path).read_text().splitlines()[int(line) - 1]
        assert answer_quote in actual
        print(f'  ANSWER_EXACT_LINE: {path}:{line} — "{answer_quote}"')
    else:
        assert status == 'open' and answer == '-'
        print('  OPEN: no closure asserted')
    count += 1
assert count == 6
print('QUOTE_BINDINGS: PASS rows=6 closed=3 open=3')
print('EXIT=0')
