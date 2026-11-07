#!/usr/bin/env python3
"""gen100.py — K100CriticC independent differential generator (kumitate r100 / H100).

MY OWN generator: it shares no code or table with
  * .ufo/waves/round-100/probe/probe100-c1.mjs (frozen counter battery), or
  * .ufo/waves/round-100/probe/make-controls100.py (controls).

Usage: gen100.py <seed16> <outdir>

For each fixture it writes:
  case-NNNN/SOURCES.md        (registry, anchor row + test rows, invalid tier -> E06)
  case-NNNN/meta.json         (rows, model, attrs; lines unicode-escaped)
  case-NNNN/README-<key>.md   (cites the row's ASCII probe id)
  case-NNNN/cap.txt, reg.json (source-capture registry binding every probe)
  index.json                  (all cases)

Census semantics modeled here (sources-census.sh row_pass, lines 574-695):
  one LF-delimited record; gate = 0-3 ASCII SP then '|'; fields split on '|';
  exactly 12 pipes (NF=13); row inside ## Registry; id cell = field 2 trimmed of
  ASCII SP/TAB only; id = S + 3+ ASCII digits. E06 is emitted for any read row
  whose tier is not A/B/C, so each read row is attributable by its tier cell.

Model divergence is expected ONLY for U+0000 in the trimmed id cell (bash command
substitution drops NUL from gawk stdout before the census prints it) — those cases
are scope=report / oracle_deg, never counted as candidate agreement.
"""
import hashlib
import json
import os
import random
import re
import sys

TODAY = '2026-11-07'

# ------------------------------------------------------------------ char pools
CATS = {}


def add(cp, cat):
    CATS.setdefault(cp, set()).add(cat)


# Unicode White_Space (PropList), LF excluded here: LF is the census record separator,
# so it cannot pad/indent a single record (record framing is exercised by the CRLF family).
WS = [0x09, 0x0B, 0x0C, 0x0D, 0x20, 0x85, 0xA0, 0x1680] + list(range(0x2000, 0x200B)) + \
     [0x2028, 0x2029, 0x202F, 0x205F, 0x3000]
# General Category Zs
ZS = [0x20, 0xA0, 0x1680] + list(range(0x2000, 0x200B)) + [0x202F, 0x205F, 0x3000]
# Cf drawn by the seat spec (U+00AD, U+061C, U+180E, U+200B-U+200F, U+2060-U+2064, U+FEFF)
CF = [0xAD, 0x61C, 0x180E] + list(range(0x200B, 0x2010)) + list(range(0x2060, 0x2065)) + [0xFEFF]
# C0 + DEL + C1 controls, LF excluded
CTRL = [c for c in range(0x00, 0x20) if c != 0x0A] + list(range(0x7F, 0xA0))
for cp in WS:
    add(cp, 'WS')
for cp in ZS:
    add(cp, 'Zs')
for cp in CF:
    add(cp, 'Cf')
for cp in CTRL:
    add(cp, 'C0C1')

assert len(WS) == 24 and len(ZS) == 17 and len(CF) == 14 and len(CTRL) == 64

# Main pool: everything above except NUL and LF. SP is handled separately in the
# indent family (systematic lengths); it is still exercised through pad/prefix pools.
POOL = sorted(cp for cp in CATS if cp not in (0x00, 0x0A))
PRIMARY = [cp for cp in POOL if cp != 0x20]
JS_LINE_TERM = [0x0D, 0x2028, 0x2029]           # ECMAScript LineTerminator (ex LF)
JS_WS_ONLY = [0x09, 0x0B, 0x0C, 0xA0, 0x1680, 0x2000, 0x2003, 0x2009, 0x202F,
              0x205F, 0x3000, 0xFEFF]            # ECMAScript WhiteSpace members (ex SP)

# ------------------------------------------------------------------ helpers
ROW_TAIL = '| fixture | docs | {tier} | scope | line 1 | teaches | queued | 2026-01-01 | 90d | — |'


def id_cell(probe):
    return ' ' + probe + ' '


def cat_name(cp):
    return '+'.join(sorted(CATS.get(cp, {'?'})))


def esc(s):
    return s.encode('unicode_escape').decode('ascii')


def digits(rng, n):
    return str(rng.randint(1, 9)) + ''.join(rng.choice('0123456789') for _ in range(n - 1))


def fullwidth(s):
    return ''.join(chr(0xFF10 + int(c)) for c in s)


def arabic_indic(s):
    return ''.join(chr(0x0660 + int(c)) for c in s)


def ext_arabic(s):
    return ''.join(chr(0x06F0 + int(c)) for c in s)


def devanagari(s):
    return ''.join(chr(0x0966 + int(c)) for c in s)


def bengali(s):
    return ''.join(chr(0x09E6 + int(c)) for c in s)


def thai(s):
    return ''.join(chr(0x0E50 + int(c)) for c in s)


def model_line(line):
    """Return (read, trimmed_id_or_None) for one LF record body, per row_pass."""
    if re.match(r'^ {0,3}\|', line) is None:
        return False, None
    if line.count('|') != 12:            # gawk NF != 13 -> E01, no E06
        return False, None
    parts = line.split('|')
    if len(parts) != 13:
        return False, None
    cell = parts[1]                      # $2
    trimmed = cell.strip(' \t')          # gsub(/^[ \t]+|[ \t]+$/)
    if trimmed == 'id':                  # separator_row
        return False, None
    if all(re.fullmatch(r':?-+:?', p.strip(' \t')) for p in parts[1:12]):
        return False, None
    return True, trimmed


def main():
    if len(sys.argv) != 3:
        sys.stderr.write('usage: gen100.py <seed16> <outdir>\n')
        return 64
    seed, out = sys.argv[1], os.path.abspath(sys.argv[2])
    if not re.fullmatch(r'[0-9a-f]{16}', seed):
        sys.stderr.write('seed must be 16 lowercase hex digits\n')
        return 64
    os.makedirs(out, exist_ok=True)
    rng = random.Random(int(seed, 16))
    cases = []
    used_digits = set()

    def fresh_digits(n=None):
        for _ in range(10000):
            d = digits(rng, n or rng.randint(3, 6))
            if d not in used_digits:
                used_digits.add(d)
                return d
        raise SystemExit('digits exhausted')

    def add_case(family, tests, scope='in', reason='', attrs=None):
        idx = len(cases)
        base = 'Z%04d' % idx
        anchor_probe = 'S9' + digits(rng, 4)
        while any(t['probe'] == anchor_probe for t in tests):
            anchor_probe = 'S9' + digits(rng, 4)
        rows = [{'key': 'a', 'probe': anchor_probe, 'role': 'anchor', 'cell': id_cell(anchor_probe),
                 'indent': '', 'prefix': '', 'suffix': '', 'term': '\n'}] + tests
        built = []
        for r in rows:
            tier = base + r['key'].upper()
            line = r['prefix'] + r['indent'] + ('|' + r['cell'] + ROW_TAIL).format(tier=tier) + r['suffix']
            read, trimmed = model_line(line)
            built.append({
                'key': r['key'], 'probe': r['probe'], 'role': r['role'], 'tier': tier, 'term': r['term'],
                'line': line, 'model_read': read, 'model_trimmed': trimmed,
                'model_valid': bool(read and trimmed == r['probe'] and re.fullmatch(r'S[0-9]{3,}', r['probe'])),
                'attrs': r.get('attrs', {}),
            })
        d = os.path.join(out, 'case-%04d' % idx)
        os.makedirs(d)
        head = ('# Sources fixture (K100CriticC independent H100)\n\n## Registry\n\n'
                '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
                '|---|---|---|---|---|---|---|---|---|---|---|\n')
        body = ''.join(r['line'] + r['term'] for r in built)
        tail = '\n## Search log\n\n- fixture %s\n' % family
        text = head + body + tail
        if attrs and attrs.get('whole_crlf'):
            text = text.replace('\n', '\r\n')
        if attrs and attrs.get('bom'):
            text = '\ufeff' + text
        with open(os.path.join(d, 'SOURCES.md'), 'w', encoding='utf-8', newline='') as fh:
            fh.write(text)
        cap = ('fixture %04d\n' % idx).encode()
        with open(os.path.join(d, 'cap.txt'), 'wb') as fh:
            fh.write(cap)
        reg = {
            'version': 1,
            'captures': [{'sourceId': anchor_probe, 'path': 'cap.txt',
                          'sha256': hashlib.sha256(cap).hexdigest(), 'bytes': len(cap), 'captured': TODAY}],
            'exemptions': ([{'ids': [t['probe'] for t in tests], 'reason': 'K100CriticC H100 differential'}]
                           if tests else []),
        }
        with open(os.path.join(d, 'reg.json'), 'w', encoding='utf-8') as fh:
            json.dump(reg, fh)
        for t in tests:
            with open(os.path.join(d, 'README-%s.md' % t['key']), 'w', encoding='utf-8') as fh:
                fh.write('| `knowledge/x.md` | cites %s |\n' % t['probe'])
        meta = {
            'idx': idx, 'dir': d, 'family': family, 'scope': scope, 'reason': reason,
            'attrs': attrs or {}, 'seed': seed,
            'rows': [{'key': r['key'], 'probe': r['probe'], 'role': r['role'], 'tier': r['tier'],
                      'term': r['term'], 'line': esc(r['line']), 'line_utf8': r['line'],
                      'model_read': r['model_read'], 'model_trimmed': None if r['model_trimmed'] is None else esc(r['model_trimmed']),
                      'model_valid': r['model_valid']} for r in built],
            'model_valid': [r['probe'] for r in built if r['model_valid'] and r['role'] == 'test'],
            'model_valid_any': [r['probe'] for r in built if r['model_valid']],
        }
        with open(os.path.join(d, 'meta.json'), 'w', encoding='utf-8') as fh:
            json.dump(meta, fh, ensure_ascii=True)
        cases.append(meta)
        return idx

    def test(key, probe, cell=None, indent='', prefix='', suffix='', term='\n', attrs=None):
        return {'key': key, 'probe': probe, 'role': 'test',
                'cell': cell if cell is not None else id_cell(probe),
                'indent': indent, 'prefix': prefix, 'suffix': suffix, 'term': term, 'attrs': attrs or {}}

    # ---------------------------------------------------------------- families
    def fresh_probe(n=None):
        return 'S' + fresh_digits(n)

    # 1. indent: every pool char, drawn length 1-10; max-length repeats for every 3rd char
    for i, cp in enumerate(POOL):
        ch = chr(cp)
        L = rng.randint(1, 10)
        pr = fresh_probe()
        add_case('indent-char-U+%04X' % cp, [test('t0', pr, indent=ch * L)],
                 attrs={'cp': 'U+%04X' % cp, 'cats': cat_name(cp), 'indent_len': L})
        if i % 3 == 2:
            pr = fresh_probe()
            add_case('indent-max-U+%04X' % cp, [test('t0', pr, indent=ch * 10)],
                     attrs={'cp': 'U+%04X' % cp, 'cats': cat_name(cp), 'indent_len': 10})

    # 2. indent: systematic ASCII SP run lengths 0-10 (0 = canonical row)
    for L in range(0, 11):
        pr = fresh_probe()
        add_case('indent-sp-%02d' % L, [test('t0', pr, indent=' ' * L)],
                 attrs={'indent_len': L, 'cats': 'SP'})

    # 3. indent: mixed runs of 1-10 pool/blank chars
    mixpool = POOL + [0x20, 0x09]
    for k in range(20):
        L = rng.randint(1, 10)
        ind = ''.join(chr(rng.choice(mixpool)) for _ in range(L))
        add_case('indent-mix-%02d' % k, [test('t0', fresh_probe(), indent=ind)],
                 attrs={'indent_len': L, 'mixed': True})

    # 4. pad: every pool char, lead and trail (plus both for every 3rd char), lengths 1-10
    for i, cp in enumerate(POOL):
        ch = chr(cp)
        ll, tl = rng.randint(1, 10), rng.randint(1, 10)
        p0, p1 = fresh_probe(), fresh_probe()
        tests = [test('t0', p0, cell=ch * ll + p0 + ' '),
                 test('t1', p1, cell=' ' + p1 + ch * tl)]
        attrs = {'cp': 'U+%04X' % cp, 'cats': cat_name(cp), 'lead_len': ll, 'trail_len': tl}
        if i % 3 == 0:
            p2 = fresh_probe()
            bl = rng.randint(1, 10)
            tests.append(test('t2', p2, cell=ch * bl + p2 + ch * bl))
            attrs['both_len'] = bl
        add_case('pad-char-U+%04X' % cp, tests, attrs=attrs)

    # 5. pad: mixed-pool pads of length 0-10, one or two rows
    for k in range(20):
        tests = []
        for j in range(1 + (k % 2)):
            L = rng.randint(0, 10)
            lead = ''.join(chr(rng.choice(mixpool)) for _ in range(L))
            T = rng.randint(0, 10)
            trail = ''.join(chr(rng.choice(mixpool)) for _ in range(T))
            pr = fresh_probe()
            tests.append(test('t%d' % j, pr, cell=lead + pr + trail))
        add_case('pad-mix-%02d' % k, tests, attrs={'mixed': True})

    # 6. pad: zero-length pad both sides (canonical 13-field row)
    add_case('pad-zero', [test('t0', fresh_probe())], attrs={'pad_len': 0})

    # 7. prefix: every pool char at line start after optional text, before a canonical row
    for cp in PRIMARY:                  # SP excluded: a SP prefix would be an indent
        ch = chr(cp)
        ctx = rng.choice(['', 'x', 'note: '])
        sp_after = rng.choice(['', ' '])
        add_case('prefix-char-U+%04X' % cp, [test('t0', fresh_probe(), prefix=ctx + ch + sp_after)],
                 attrs={'cp': 'U+%04X' % cp, 'cats': cat_name(cp), 'ctx': ctx, 'space_after': sp_after})

    # 8. prefix: same-record break members with every text context
    for cp in JS_LINE_TERM + JS_WS_ONLY:
        for ctx in ['', 'x', 'note: ']:
            add_case('prefix-break-U+%04X-%s' % (cp, 'bare' if ctx == '' else ctx.strip(': ')),
                     [test('t0', fresh_probe(), prefix=ctx + chr(cp) + rng.choice(['', ' ']))],
                     attrs={'cp': 'U+%04X' % cp, 'cats': cat_name(cp), 'ctx': ctx})

    # 9. CRLF: rows terminated \r\n inside an LF-framed registry (census: trailing CR in $NF)
    crlf_variants = ['canonical', 'indent-2sp', 'indent-4sp', 'pad-tab', 'pad-space', 'pad-nbsp',
                     'pad-vt', 'pad-feFF', 'pad-ls', 'pad-ps', 'pad-cr', 'pad-2003', 'pad-nel',
                     'pad-shy', 'pad-zwsp', 'pad-del']
    pad_over = {
        'pad-tab': ('\t', '\t'), 'pad-space': ('   ', '   '), 'pad-nbsp': ('\u00a0', '\u00a0'),
        'pad-vt': ('\u000b', '\u000b'), 'pad-feFF': ('\ufeff', '\ufeff'),
        'pad-ls': ('\u2028', '\u2028'), 'pad-ps': ('\u2029', '\u2029'),
        'pad-cr': ('\r', '\r'), 'pad-2003': ('\u2003', '\u2003'),
        'pad-nel': ('\u0085', '\u0085'), 'pad-shy': ('\u00ad', '\u00ad'),
        'pad-zwsp': ('\u200b', '\u200b'), 'pad-del': ('\x7f', '\x7f'),
    }
    for name in crlf_variants:
        pr = fresh_probe()
        ind = '  ' if name == 'indent-2sp' else ('    ' if name == 'indent-4sp' else '')
        if name in pad_over:
            lead, trail = pad_over[name]
            cell = lead + pr + trail
        else:
            cell = ' ' + pr + ' '
        add_case('crlf-%s' % name, [test('t0', pr, cell=cell, indent=ind, term='\r\n')],
                 attrs={'crlf': True, 'variant': name})

    # 10. digit forms (id cell) — ASCII vs fullwidth vs other Nd, and malformed forms
    digit_forms = []
    d = fresh_digits()
    digit_forms.append(('ascii-control', 'S' + d, ' S%s ' % d))
    for name, conv in [('fullwidth', fullwidth), ('arabic-indic', arabic_indic),
                       ('ext-arabic', ext_arabic), ('devanagari', devanagari),
                       ('bengali', bengali), ('thai', thai)]:
        d = fresh_digits()
        digit_forms.append((name, 'S' + d, ' S%s ' % conv(d)))
    d = fresh_digits()
    digit_forms.append(('mixed-ascii-fullwidth', 'S' + d, ' S' + d[0] + fullwidth(d[1:]) + ' '))
    d = fresh_digits(3)
    digit_forms.append(('ascii-3digit-min', 'S' + d, ' S%s ' % d))
    d = fresh_digits(10)
    digit_forms.append(('ascii-10digit', 'S' + d, ' S%s ' % d))
    d2d = fresh_digits(2)
    digit_forms.append(('two-digits', fresh_probe(), ' S%s ' % d2d))
    d = fresh_digits()
    digit_forms.append(('trailing-letter', 'S' + d, ' S%sx ' % d))
    digit_forms.append(('leading-letter', 'S' + d, ' xS%s ' % d))
    digit_forms.append(('dash', 'S' + d, ' S-%s ' % d))
    digit_forms.append(('inner-space', 'S' + d, ' S %s ' % d))
    digit_forms.append(('double-S', 'S' + d, ' SS%s ' % d))
    d2 = fresh_digits()
    digit_forms.append(('two-ids', 'S' + d, ' S%s S%s ' % (d, d2)))
    for name, probe, cell in digit_forms:
        add_case('digits-%s' % name, [test('t0', probe, cell=cell)],
                 attrs={'form': name, 'cell': esc(cell)})

    # 11. random mixes (indent, pads, term, id form), 1-3 test rows
    for k in range(40):
        tests = []
        n = 1 + (k % 3)
        for j in range(n):
            pr = fresh_probe()
            if rng.random() < 0.55:
                cell = ''.join(chr(rng.choice(mixpool)) for _ in range(rng.randint(0, 4))) + pr + \
                       ''.join(chr(rng.choice(mixpool)) for _ in range(rng.randint(0, 4)))
            else:
                cell = ' ' + pr + ' '
            ind = '' if rng.random() < 0.5 else ''.join(chr(rng.choice(mixpool)) for _ in range(rng.randint(1, 6)))
            term = '\r\n' if rng.random() < 0.25 else '\n'
            tests.append(test('t%d' % j, pr, cell=cell, indent=ind, term=term))
        add_case('rand-mix-%02d' % k, tests, attrs={'mixed': True})

    # 12. in-scope: canonical row followed by non-pipe text on the same record (NF stays 13)
    for k in range(4):
        add_case('suffix-text-%d' % k, [test('t0', fresh_probe(), suffix=rng.choice([' tail', '  note', '\t extra']))],
                 attrs={'suffix': 'text'})

    # 13. NUL: indent and prefix positions (no NUL reaches gawk stdout -> oracle faithful)
    add_case('nul-indent', [test('t0', fresh_probe(), indent='\x00')], attrs={'cp': 'U+0000'})
    add_case('nul-prefix', [test('t0', fresh_probe(), prefix='x\x00')], attrs={'cp': 'U+0000'})

    # 14. NUL in the id pad: bash command substitution strips NUL from gawk stdout ->
    #     the census --file oracle prints a valid-looking E06 id. REPORT-ONLY artifact.
    for name, cell_fn in [
        ('nul-pad-lead', lambda p: '\x00' + p + ' '),
        ('nul-pad-trail', lambda p: ' ' + p + '\x00'),
        ('nul-pad-both', lambda p: '\x00' + p + '\x00'),
    ]:
        pr = fresh_probe()
        add_case(name, [test('t0', pr, cell=cell_fn(pr))], scope='report',
                 reason='bash command substitution drops NUL from census stdout (oracle degenerate)',
                 attrs={'oracle_deg': 'nul-in-id-cell'})

    # 15. same-record SUFFIX (second row / extra pipe): census E01 (NF!=13) -> no E06.
    #     REPORT-ONLY: malformed (non-13-field) line, disclosed out of R100's scope.
    for name, sep in [('suffix-break-cr', '\r'), ('suffix-break-ls', '\u2028'), ('suffix-break-ps', '\u2029')]:
        pr, qr = fresh_probe(), fresh_probe()
        add_case(name, [test('t0', pr, suffix=sep + '| ' + qr + ' | fixture | docs | Z9 | s | a | t | queued | 2026-01-01 | 90d | — |')],
                 scope='report', reason='same-record second row: census E01 (NF!=13), no E06',
                 attrs={'suffix': 'row'})
    for name, suffix in [('suffix-pipe', ' | junk'), ('suffix-cell', ' S999999 |')]:
        add_case(name, [test('t0', fresh_probe(), suffix=suffix)], scope='report',
                 reason='extra pipe on the record: census E01 (NF!=13), no E06', attrs={'suffix': suffix})

    # 16. whole-file CRLF and file-start BOM: census section framing differs (out of claim)
    for k in range(3):
        add_case('whole-crlf-%d' % k, [test('t0', fresh_probe())], scope='report',
                 reason='whole-file CRLF: "## Registry\\r" fails the census heading test (section scope, disclosed out of claim)',
                 attrs={'whole_crlf': True})
    add_case('bom-file-start', [test('t0', fresh_probe())], scope='report',
             reason='file-start BOM: census heading fails (section scope, disclosed out of claim)',
             attrs={'bom': True})

    with open(os.path.join(out, 'index.json'), 'w', encoding='utf-8') as fh:
        json.dump({'seed': seed, 'cases': cases}, fh, ensure_ascii=True)
    nrows = sum(len(c['rows']) for c in cases)
    ntest = sum(1 for c in cases for r in c['rows'] if r['role'] == 'test')
    nscope = sum(1 for c in cases if c['scope'] == 'in')
    print('seed=%s out=%s fixtures=%d rows=%d test_rows=%d in_scope=%d report=%d'
          % (seed, out, len(cases), nrows, ntest, nscope, len(cases) - nscope))
    return 0


if __name__ == '__main__':
    sys.exit(main())
