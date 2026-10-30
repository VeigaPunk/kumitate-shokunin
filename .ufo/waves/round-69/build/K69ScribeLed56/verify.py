"""Pure verifier: verify(source_text, rows_text, answer_lines); no runtime or I/O spawn."""
import re


def norm(text):
    return re.sub(r'\s+', ' ', re.sub(r'\*\*|__|`', '', text).replace('—', '-').replace('–', '-')).strip()


def located(quote, text):
    return bool(re.search(r'(?<![A-Za-z0-9])' + re.escape(norm(quote)) + r'(?![A-Za-z0-9])', norm(text)))


def verify(source, rows, answer_lines):
    items, active, fence, body = [], False, None, None
    for line in source.splitlines():
        marker = re.match(r'^ {0,3}(`{3,}|~{3,})', line)
        if marker:
            token = marker[1]
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence):
                fence = None
            continue
        if fence:
            continue
        if re.match(r'^## ', line):
            active = bool(re.search(r'\brouted\s+(?:items?|defects?)\b', line, re.I))
            body = None
            continue
        if not active:
            continue
        if re.match(r'^(?:[-*+]|\d+[.)])\s+\S', line):
            items.append(line)
            body = len(items) - 1
        elif line.startswith('|'):
            cells = [c.strip() for c in line.strip('|').split('|')]
            if all(re.fullmatch(r':?-+:?', c) for c in cells):
                if items and items[-1].startswith('|'):
                    items.pop()
                body = None
            else:
                items.append(line)
                body = len(items) - 1
        elif body is not None:
            items[body] += '\n' + line
    print('ROUTED_ITEMS: 4' if len(items) == 4 else f'ROUTED_ITEMS: unexpected={len(items)}')
    assert len(items) == 4
    parsed = [line.strip().strip('|').split('|') for line in rows.splitlines() if line.startswith('|')]
    assert len(parsed) == len(items)
    for cells, item in zip(parsed, items):
        ident, rnd, ordinal, quote, cls, status, answer = [c.strip() for c in cells]
        quote = quote.strip('"')
        assert int(rnd) == 56 and int(ordinal) == items.index(item) + 1
        words = len(quote.split())
        matches = sum(len(list(re.finditer(r'(?<![A-Za-z0-9])' + re.escape(norm(quote)) + r'(?![A-Za-z0-9])', norm(other)))) for other in items)
        assert 3 <= words <= 25 and located(quote, item) and matches == 1
        print(f'{ident}: item={ordinal} words={words} located=yes section_occurrences={matches} status={status}')
        if status == 'closed':
            m = re.fullmatch(r'([^:]+):(\d+) — "(.+)"', answer)
            assert m and 'spotcheck' not in m[1] and m[1] != 'corpus/routed-ledger.md'
            assert located(m[3], answer_lines[(m[1], int(m[2]))])
            print(f'ANSWER: {m[1]}:{m[2]} exact_line_quote=yes quote="{m[3]}"')
        else:
            assert status == 'open' and answer == '-'
    print('QUOTE_BINDINGS: PASS rows=4 closed=2 open=2')
