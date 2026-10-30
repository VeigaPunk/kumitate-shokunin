from pathlib import Path
import re, shutil
ROOT = Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
OUT = ROOT / '.ufo/waves/round-69/build/K69ScribeLed58'
SCRATCH = Path('/fast/scratch/hyaku/kumitate-r69/K69ScribeLed58')
source = ROOT / 'corpus/lessons/round-58-verifier-spotcheck.md'
# Normalize Markdown punctuation without merging words.
def norm(s):
    return ' '.join(re.findall(r'\w+', s.casefold()))
def hits(text, quote):
    return len(re.findall(r'(?<!\w)' + re.escape(norm(quote)) + r'(?!\w)', norm(text)))
quotes = [
    'the C2 base counter is misreported',
    'overstates the dispatch',
    'for the new entry',
    'the tier counts are wrong',
    'while its own registry table carries',
    'the SCORECARD capabilities table gained no',
    'this non-author file lands without a README row',
    'soften the wording',
]
classes = ['base-counter-misreport', 'dispatch-overclaim', 'ghost-source', 'tier-count-drift', 'gate-count-drift', 'capability-registry-drift', 'readme-map-drift', 'duplicate-wording']
answers = {
    1: (31, 'the D58 base receipt and a re-run both read held=2/5'),
    3: (33, 'README rows for the r58 entry and lesson cite S112, not S121'),
    5: (35, 'SKILL prose integer equals'),
    6: (36, 'capabilities table gained `receipt-evidence` and `cite-sources`'),
    7: (37, 'has its README row and covered pin in the same change'),
    8: (38, 'A shared page is not automatically a duplicate'),
}
try:
    lines = source.read_text().splitlines()
    section, items, current, fence = [], [], None, None
    active = False
    for line in lines:
        marker = re.match(r'^\s{0,3}(`{3,}|~{3,})', line)
        if marker:
            token = marker.group(1)
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence):
                fence = None
            continue
        if fence is not None:
            continue
        if re.match(r'^## 8\. Routed defects', line):
            active = True
            continue
        if not active:
            continue
        if re.match(r'^#{1,2}\s', line):
            break
        section.append(line)
        # Root list markers only; nested bullets remain in their parent.
        root = re.match(r'^(?:\d+[.)]|[-+*])\s+(.+)', line)
        cells = line.strip().split('|')[1:-1] if line.strip().startswith('|') else []
        table_item = cells and not all(re.fullmatch(r'\s*:?-+:?\s*', c) for c in cells)
        if root or table_item:
            if table_item and not items and not current:
                continue  # table heading is not a data item
            current = root.group(1) if root else line
            items.append(current)
        elif current is not None and (line.startswith(' ') or line.startswith('\t')):
            items[-1] += ' ' + line.strip()
    assert len(items) == 8, len(items)
    section_text = '\n'.join(section)
    answer_path = 'corpus/lessons/round-59.md'
    answer_lines = (ROOT / answer_path).read_text().splitlines()
    rows, receipt = [], [f'SOURCE: {source}', 'AXIS: operability; frozen L69 quote/binding compatibility', 'PARSER: fences excluded; nested bullets attach to parent; table separators excluded', f'ITEM_COUNT: {len(items)}']
    for i, (item, quote, cls) in enumerate(zip(items, quotes, classes), 1):
        ident = f'R58-V{i}'
        assert ident in item
        words = len(quote.split())
        own, unique = hits(item, quote), hits(section_text, quote)
        assert 3 <= words <= 25 and own == unique == 1, (ident, words, own, unique)
        receipt.append(f'{ident}: words={words} item_hits={own} section_hits={unique} quote="{quote}"')
        status, binding = 'open', '-'
        if i in answers:
            line, aq = answers[i]
            actual = answer_lines[line-1]
            assert aq in actual, (ident, actual)
            status = 'closed'
            binding = f'{answer_path}:{line} — "{aq}"'
            receipt.append(f'ANSWER: {answer_path}:{line}: {actual}')
        else:
            receipt.append('ANSWER: unbound; later prose does not supply the requested historical correction in full')
        rows.append(f'| {ident} | 58 | {i} | "{quote}" | {cls} | {status} | {binding} |')
    receipt.append('ROW_VERIFICATION: PASS items=8 unique_quotes=8 closed=6 open=2')
    (OUT / 'rows.md').write_text('\n'.join(rows) + '\n')
    (OUT / 'verification.txt').write_text('\n'.join(receipt) + '\n')
    print('\n'.join(receipt))
finally:
    shutil.rmtree(SCRATCH, ignore_errors=True)
