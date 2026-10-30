from pathlib import Path
import re
import hashlib
import shutil

root = Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
build = root / '.ufo/waves/round-69/build/K69ScribeLed62'
scratch = Path('/fast/scratch/hyaku/kumitate-r69/K69ScribeLed62')
source = root / 'corpus/lessons/round-62-verifier-spotcheck.md'
log = []
try:
    active = False
    fence = None
    items = []
    for line_number, line in enumerate(source.read_text().splitlines(), 1):
        marker = re.match(r'^\s{0,3}(`{3,}|~{3,})(.*)$', line)
        if fence:
            if re.match(r'^\s{0,3}' + re.escape(fence[0]) + '{' + str(fence[1]) + r',}\s*$', line):
                fence = None
            continue
        if marker:
            fence = (marker[1][0], len(marker[1]))
            continue
        if re.match(r'^##\s+', line):
            if active:
                break
            active = bool(re.search(r'Routed defects', line, re.I))
            continue
        if not active or not line.strip():
            continue
        bullet = re.match(r'^(\s*)(?:\d+[.)]|[-+*])\s+(.*)$', line)
        if bullet and len(bullet[1]) == 0:
            items.append([line_number, bullet[2]])
        elif line.startswith('|'):
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            if all(re.fullmatch(r':?-+:?', c) for c in cells):
                continue
            # A header immediately followed by a separator is not data.
            next_line = source.read_text().splitlines()[line_number:line_number + 1]
            if next_line and all(re.fullmatch(r':?-+:?', c.strip()) for c in next_line[0].strip().strip('|').split('|')):
                continue
            items.append([line_number, line])
        elif items:
            items[-1][1] += ' ' + line.strip()
    assert len(items) == 5, len(items)
    log.append('AXES: operability; quote accuracy; complete item coverage; honest answer binding; no product changes')
    log.append('SOURCE_SHA256: ' + hashlib.sha256(source.read_bytes()).hexdigest())
    log.append('FENCE_AWARE_ITEMS: 5 (source lines ' + ','.join(str(i[0]) for i in items) + ')')
    rows = build.joinpath('rows.md').read_text().splitlines()
    assert len(rows) == len(items)
    section = '\n'.join(i[1] for i in items)
    for ordinal, row in enumerate(rows, 1):
        cells = [c.strip() for c in row.strip('|').split('|')]
        rid, round_number, item_number, quoted, cls, status, answer = cells
        assert rid == f'R62-V{ordinal}' and round_number == '62' and item_number == str(ordinal)
        quote = quoted[1:-1]
        words = len(quote.split())
        assert 3 <= words <= 25
        pattern = r'(?<!\w)' + re.escape(quote) + r'(?!\w)'
        item_hits = len(re.findall(pattern, items[ordinal - 1][1]))
        section_hits = len(re.findall(pattern, section))
        assert item_hits == section_hits == 1, (rid, item_hits, section_hits)
        log.append(f'{rid}: words={words} item_hits={item_hits} section_hits={section_hits} status={status}')
        if status == 'closed':
            match = re.fullmatch(r'([^:]+):(\d+) — "(.+)"', answer)
            assert match
            relpath, number, answer_quote = match.groups()
            assert relpath != 'corpus/routed-ledger.md' and 'spotcheck' not in relpath
            path = root / relpath
            assert path.resolve().is_relative_to(root.resolve())
            exact_line = path.read_text().splitlines()[int(number) - 1]
            assert answer_quote in exact_line
            log.append(f'ANSWER_EXACT: {relpath}:{number} — "{answer_quote}"')
            log.append('ANSWER_LINE: ' + exact_line)
        else:
            assert status == 'open' and answer == '-'
    log.append('VERDICT: PASS rows=5 closed=2 open=3')
    log.append('EXIT=0')
finally:
    shutil.rmtree(scratch)
    build.joinpath('verification.txt').write_text('\n'.join(log) + '\n')
print('\n'.join(log))
