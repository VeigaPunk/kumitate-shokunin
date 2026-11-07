#!/usr/bin/env python3
"""h99gen.py — K99CriticC independent differential generator for round 99 claim C1.

Builds >= 400 small lane fixtures (one row each unless a family says otherwise) whose cells are
padded with code points drawn from the Unicode White_Space set, Zs, Cf, C0/C1 (except LF) and
mixed pad units, at random lengths 0-10, on any of the 11 Registry cells; plus 12/13/14-field
rows, CRLF files and duplicate ids.

Usage: h99gen.py --seed <16hex> --out <fixture root> [--manifest <path>]
Prints the seed and the fixture-family counts.  Deterministic per seed.

Row semantics are drawn to keep the *unmapped* census codes quiet (E04/W01/W02/W03/E10/E11);
the comparison set is only the nine mapped codes (E01/E02/E03/E05/E06/E07/E08/E09/E12).
"""
import argparse, json, os, random, re, sys
from pathlib import Path

SECTIONS = ['Registry', 'Paths', 'Search log', 'Leads (unopened)']
KINDS = ['spec', 'docs', 'paper', 'code', 'tool', 'dataset', 'talk', 'book', 'community', 'own-work']

# ---------------------------------------------------------------- pad classes
# Full Unicode White_Space (PropList 17.0.0) minus LF; JS-trimmed != blank-trimmed.
WS = [('SP', ' '), ('TAB', '\t'), ('VT', '\v'), ('FF', '\f'), ('CR', '\r'),
      ('NEL', '\u0085'), ('NBSP', '\u00a0'), ('OGHAM', '\u1680'),
      ('ENQUAD', '\u2000'), ('EMQUAD', '\u2001'), ('ENSP', '\u2002'), ('EMSP', '\u2003'),
      ('THICKSP', '\u2004'), ('SIXPEREM', '\u2005'), ('FIGSP', '\u2006'), ('PUNCSP', '\u2007'),
      ('THINSP', '\u2008'), ('HAIRSP', '\u2009'), ('HAIRSP2', '\u200a'),
      ('LS', '\u2028'), ('PS', '\u2029'), ('NNBSP', '\u202f'), ('MMSP', '\u205f'), ('IDSP', '\u3000')]
CF = [('SHY', '\u00ad'), ('ALM', '\u061c'), ('MVS', '\u180e'), ('ZWSP', '\u200b'),
      ('ZWNJ', '\u200c'), ('ZWJ', '\u200d'), ('LRM', '\u200e'), ('RLM', '\u200f'),
      ('WJ', '\u2060'), ('CF2061', '\u2061'), ('CF2062', '\u2062'), ('CF2063', '\u2063'),
      ('CF2064', '\u2064'), ('BOM', '\ufeff')]
C0 = [(f'C0_{i:02X}', chr(i)) for i in list(range(0x01, 0x09)) + list(range(0x0e, 0x20))]
C1 = [(f'C1_{i:02X}', chr(i)) for i in list(range(0x7f, 0xa0)) if i != 0x85]
MIX = [('SPNBSP', ' \u00a0'), ('NBSPSP', '\u00a0 '), ('NBSPTAB', '\u00a0\t'),
       ('TABVT', '\t\v'), ('VTFF', '\v\f'), ('CRFF', '\r\f'),
       ('NELSP', '\u0085 '), ('BOMSP', '\ufeff '), ('ZWSPNBSP', '\u200b\u00a0')]
PAD_UNITS = WS + CF + C0 + C1 + MIX
SEM_CELLS = ['id', 'kind', 'tier', 'status', 'opened', 'recheck']
OTHER_CELLS = ['source', 'scope', 'anchor', 'teaches', 'usedby']
CELL_INDEX = {'id': 0, 'source': 1, 'kind': 2, 'tier': 3, 'scope': 4, 'anchor': 5,
              'teaches': 6, 'status': 7, 'opened': 8, 'recheck': 9, 'usedby': 10}
REP_CLASSES = ['SP', 'TAB', 'VT', 'CR', 'NBSP', 'NEL', 'EMSP', 'ZWSP', 'BOM', 'SHY',
               'MVS', 'C0_01', 'C0_1F', 'C1_80', 'C1_9F', 'SPNBSP']
UNIT = {n: u for n, u in PAD_UNITS}
INVALID_ID_FORMS = {
    'two': lambda rng: 'S' + str(rng.randint(10, 99)),
    'lower': lambda rng: 's' + str(rng.randint(100000, 999999)),
    'trailalpha': lambda rng: 'S' + str(rng.randint(100000, 999999)) + 'x',
    'arabic': lambda rng: 'S' + ''.join(chr(0x660 + int(d)) for d in str(rng.randint(1000, 9999))),
    'fullwidth': lambda rng: 'S' + ''.join(chr(0xff10 + int(d)) for d in str(rng.randint(1000, 9999))),
}


def pad(value, unit_name, rng, lo=1, hi=10, side=None):
    n = rng.randint(lo, hi)
    p = UNIT[unit_name] * n
    side = side or rng.choice(['lead', 'trail', 'both'])
    if side == 'lead':
        return p + value
    if side == 'trail':
        return value + p
    return p + value + p


class Gen:
    def __init__(self, seed):
        self.rng = random.Random(int(seed, 16))
        self.n = 0
        self.used_ids = set()
        self.fixtures = []
        self.names = set()

    def nonce(self):
        self.n += 1
        return f'{self.n:04d}{self.rng.getrandbits(24):06x}'

    def fresh_id(self):
        r = self.rng
        while True:
            sid = 'S' + str(r.randint(1, 9)) + ''.join(str(r.randint(0, 9)) for _ in range(r.randint(2, 5)))
            if sid not in self.used_ids:
                self.used_ids.add(sid)
                return sid

    def base_cells(self):
        r = self.rng
        sid = self.fresh_id()
        nonce = self.nonce()
        kind = r.choice(KINDS)
        tier = r.choice(['A', 'B', 'C'])
        if kind == 'community' and tier == 'A':
            tier = 'B'
        status = r.choices(['queued', 'mined', 'rejected'], weights=[6, 3, 1])[0]
        teaches = f'teaches {nonce}'
        if status == 'rejected':
            teaches = f'REJECTED: drawn {nonce}; flip: never'
        usedby = 'corpus/lessons/u.md' if status == 'mined' else '—'
        return [sid, f'Title {nonce} — https://example.org/h99/{nonce}', kind, tier,
                f'scope-{nonce}', f'§ {nonce}', teaches, status,
                f'{r.randint(2015, 2025)}-{r.randint(1, 12):02d}-{r.randint(1, 28):02d}',
                r.choice(['on-release', '30d', '180d', '2027-06-01', '2030-01-31']), usedby]

    def add(self, cells, *, family, registry=True, width=13, dup_rows=None, crlf=False,
            mixed_crlf=False, excluded=None, section='Registry', note=''):
        """One fixture.  `cells` is the 11-cell list for the single row; `dup_rows` a list of
        11-cell lists for multi-row fixtures.  `width` is split-field width (13 = 11 cells)."""
        rows = dup_rows if dup_rows is not None else [cells]
        lines = ['# SOURCES — where fixture learns', '']
        if registry:
            lines += ['## Registry', '',
                      '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
                      '|---|---|---|---|---|---|---|---|---|---|---|']
        else:
            lines += [f'## {section}', '',
                      '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
                      '|---|---|---|---|---|---|---|---|---|---|---|']
        row_lines = []
        for rc in rows:
            row_lines.append(len(lines) + 1)
            lines.append('| ' + ' | '.join(rc) + ' |')
        lines += ['', '## Paths', '', 'none', '', '## Search log', '', 'none', '',
                  '## Leads (unopened)', '', '- none']
        nl = '\r\n' if crlf else '\n'
        if mixed_crlf:
            # headings LF, table lines CRLF: exercise the section heading vs row split asymmetry
            text = ''
            for i, ln in enumerate(lines):
                if 4 <= i <= 6 + len(rows) - 1:
                    text += ln + '\r\n'
                else:
                    text += ln + '\n'
        else:
            text = nl.join(lines) + nl
        safe = re.sub(r'[^A-Za-z0-9_.-]+', '_', family)
        while safe in self.names:
            safe = safe + '_x'
        self.names.add(safe)
        self.fixtures.append({
            'name': safe, 'text': text, 'row_lines': row_lines,
            'rows': [{'cells': rc, 'census_id': rc[0].strip(' \t')} for rc in rows],
            'registry': registry, 'width': width, 'crlf': crlf, 'mixed_crlf': mixed_crlf,
            'excluded': excluded, 'note': note,
        })

    # ------------------------------------------------------------- families
    def build(self):
        r = self.rng
        # A: every pad class x six semantic cells: 636
        for cell in SEM_CELLS:
            for pname, _ in PAD_UNITS:
                cells = self.base_cells()
                cells[CELL_INDEX[cell]] = pad(cells[CELL_INDEX[cell]], pname, r)
                self.add(cells, family=f'A-{cell}-{pname}', note=f'grid {cell} {pname}')
        # B: representative classes x five non-semantic cells: 80
        for cell in OTHER_CELLS:
            for pname in REP_CLASSES:
                cells = self.base_cells()
                cells[CELL_INDEX[cell]] = pad(cells[CELL_INDEX[cell]], pname, r)
                self.add(cells, family=f'B-{cell}-{pname}')
        # C: pad length 0-10 on the id cell for three classes: 33
        for pname in ['SP', 'NBSP', 'ZWSP']:
            for n in range(0, 11):
                cells = self.base_cells()
                if n:
                    p = UNIT[pname] * n
                    cells[0] = r.choice([p + cells[0], cells[0] + p, p + cells[0] + p])
                self.add(cells, family=f'C-len-{pname}-{n}')
        # D: 12- and 14-field rows (10 / 12 cells) x six variants: 12
        for width in (12, 14):
            for tag in ['clean', 'spid', 'nbspid', 'zwspid', 'nbspkind', 'invalidid']:
                cells = self.base_cells()
                if tag == 'spid':
                    cells[0] = pad(cells[0], 'SP', r)
                elif tag == 'nbspid':
                    cells[0] = pad(cells[0], 'NBSP', r)
                elif tag == 'zwspid':
                    cells[0] = pad(cells[0], 'ZWSP', r)
                elif tag == 'nbspkind':
                    cells[2] = pad(cells[2], 'NBSP', r)
                elif tag == 'invalidid':
                    cells[0] = INVALID_ID_FORMS['lower'](r)
                if width == 12:
                    cells = cells[:6] + cells[7:]          # drop teaches -> 10 cells
                else:
                    cells = cells + [f'extra-{self.nonce()}']  # -> 12 cells
                self.add(cells, family=f'D-w{width}-{tag}', width=width)
        # E: duplicate ids, second (or first) copy padded: 26
        for pname in ['SP', 'TAB', 'NBSP', 'ZWSP', 'VT', 'CR', 'NEL', 'LS', 'PS', 'BOM', 'SHY', 'SPNBSP', 'EMSP']:
            for which in (0, 1):
                a = self.base_cells()
                b = list(a)
                b[1] = b[1] + '-dup'
                b[4] = b[4] + '-dup'
                target = which
                (a if target == 1 else b)[0] = pad(a[0], pname, r)
                self.add(a, family=f'E-dup-{pname}-first{which}', dup_rows=[a, b])
        # F: CRLF files: 12
        for tag, pname, cell, crlf, mixed, extra in [
            ('clean', None, None, True, False, None),
            ('spid', 'SP', 0, True, False, None),
            ('nbspid', 'NBSP', 0, True, False, None),
            ('zwspid', 'ZWSP', 0, True, False, None),
            ('nbspkind', 'NBSP', 2, True, False, None),
            ('vtkind', 'VT', 2, True, False, None),
            ('invalidid', None, None, True, False, 'lower'),
            ('dup-nbsp', 'NBSP', 0, True, False, 'dup'),
            ('mixed-clean', None, None, False, True, None),
            ('mixed-nbspkind', 'NBSP', 2, False, True, None),
            ('mixed-12field', None, None, False, True, 'w12'),
            ('outside-in-crlf', None, None, True, False, 'outside'),
        ]:
            cells = self.base_cells()
            if pname is not None:
                cells[cell] = pad(cells[cell], pname, r)
            if extra == 'lower':
                cells[0] = INVALID_ID_FORMS['lower'](r)
            dup = None
            if extra == 'dup':
                dup = [cells, list(cells)]
                dup[1][1] = dup[1][1] + '-dup'
            if extra == 'w12':
                cells = cells[:6] + cells[7:]
            self.add(cells, family=f'F-crlf-{tag}', dup_rows=dup, crlf=crlf, mixed_crlf=mixed,
                     registry=(extra != 'outside'), width=(12 if extra == 'w12' else 13))
        # G: source-shaped rows outside Registry: 8
        for tag, pname, width in [('clean', None, 13), ('spid', 'SP', 13), ('nbspid', 'NBSP', 13),
                                  ('zwspid', 'ZWSP', 13), ('invalidid', None, 13),
                                  ('w12', None, 12), ('w14', None, 14), ('thinsid', 'THINSP', 13)]:
            cells = self.base_cells()
            if pname is not None:
                cells[0] = pad(cells[0], pname, r)
            if tag == 'invalidid':
                cells[0] = INVALID_ID_FORMS['two'](r)
            if width == 12:
                cells = cells[:6] + cells[7:]
            elif width == 14:
                cells = cells + ['extra']
            self.add(cells, family=f'G-outside-{tag}', registry=False, width=width, section='Paths')
        # H: invalid semantic values, padded: 65
        for form in INVALID_ID_FORMS:
            for pname in ['SP', 'NBSP', 'ZWSP', 'CR', 'EMSP']:
                cells = self.base_cells()
                cells[0] = pad(INVALID_ID_FORMS[form](r), pname, r)
                self.add(cells, family=f'H-id-{form}-{pname}')
        for bad in ['Docs', 'a']:
            for pname in ['NBSP', 'VT', 'ZWSP', 'EMSP']:
                cells = self.base_cells()
                cells[2] = pad(bad, pname, r)
                self.add(cells, family=f'H-kind-{bad}-{pname}')
        for bad in ['D', 'a']:
            for pname in ['NBSP', 'ZWSP']:
                cells = self.base_cells()
                cells[3] = pad(bad, pname, r)
                self.add(cells, family=f'H-tier-{bad}-{pname}')
        for bad in ['watch', 'Mined']:
            for pname in ['NBSP', 'EMSP']:
                cells = self.base_cells()
                cells[7] = pad(bad, pname, r)
                self.add(cells, family=f'H-status-{bad}-{pname}')
        for bad in ['2025-13-01', '2026-02-30', '2025-1-2', '20250102']:
            for pname in ['NBSP', 'CR', 'ZWSP']:
                cells = self.base_cells()
                cells[8] = pad(bad, pname, r)
                self.add(cells, family=f'H-opened-{bad}-{pname}')
        for bad in ['soon!', '90 days', '2025-13-01', 'd90']:
            for pname in ['NBSP', 'VT', 'ZWSP']:
                cells = self.base_cells()
                cells[9] = pad(bad, pname, r)
                self.add(cells, family=f'H-recheck-{bad}-{pname}')
        # I: pad-only (value replaced by pads) on non-id cells: 30
        for cell in ['kind', 'tier', 'status', 'opened', 'recheck']:
            for pname in ['SP', 'TAB', 'NBSP', 'ZWSP', 'VT', 'EMSP']:
                cells = self.base_cells()
                cells[CELL_INDEX[cell]] = UNIT[pname] * r.randint(1, 10)
                self.add(cells, family=f'I-padonly-{cell}-{pname}')
        # K: two cells padded at once: 8
        for c1, p1, c2, p2 in [('id', 'NBSP', 'kind', 'VT'), ('id', 'SP', 'status', 'EMSP'),
                               ('tier', 'NBSP', 'status', 'CR'), ('opened', 'NBSP', 'recheck', 'EMSP'),
                               ('kind', 'EMSP', 'opened', 'VT'), ('id', 'ZWSP', 'opened', 'NBSP'),
                               ('teaches', 'NBSP', 'usedby', 'TAB'), ('source', 'NBSP', 'anchor', 'EMSP')]:
            cells = self.base_cells()
            cells[CELL_INDEX[c1]] = pad(cells[CELL_INDEX[c1]], p1, r)
            cells[CELL_INDEX[c2]] = pad(cells[CELL_INDEX[c2]], p2, r)
            self.add(cells, family=f'K-two-{c1}-{p1}-{c2}-{p2}')
        # L: long pad runs (R99 uses an unbounded '+'; a hidden cap would show here): 12
        for cell in ['id', 'kind']:
            for pname in ['SP', 'TAB', 'NBSP', 'VT', 'ZWSP', 'EMSP']:
                n = r.choice([11, 16, 64, 256])
                cells = self.base_cells()
                unit = UNIT[pname] * n
                v = cells[CELL_INDEX[cell]]
                cells[CELL_INDEX[cell]] = r.choice([unit + v, v + unit, unit + v + unit])
                self.add(cells, family=f'L-long-{cell}-{pname}-{n}')
        # J: documented exclusions (not scored)
        for k in range(4):
            cells = self.base_cells()
            cells[0] = r.choice([' ', '\t', ' \t ']) * r.randint(1, 3)
            self.add(cells, family=f'J-emptyid-{k}',
                     excluded='empty id cell: sources-check skips enum/date checks, census continues; '
                              'documented non-trim divergence (r99 plan C1 disclosed limit 3)')
        for k in range(3):
            cells = self.base_cells()
            cells[9] = 'on release' if k != 1 else 'once-per-round'
            self.add(cells, family=f'J-symbolic-{k}',
                     excluded='symbolic recheck cadence: census accepts any ^[A-Za-z][A-Za-z0-9 _-]*$, '
                              'sources-check only on-release; documented non-trim divergence')
        for k in range(3):
            cells = self.base_cells()
            cells[8] = r.choice(['0000-01-01', '0000-02-29', '0000-12-31'])
            self.add(cells, family=f'J-year0-{k}',
                     excluded='year 0000: census epoch rejects y==0, JS Date accepts it; '
                              'documented non-trim divergence')
        cells = self.base_cells(); cells[0] = 'ID'
        self.add(cells, family='J-id-spelling-upper',
                 excluded='id/separator spelling: sources-check skips id.toLowerCase()==id, census is case-sensitive')
        for k, dashid in enumerate(['---', ':---:']):
            cells = self.base_cells()
            cells[0] = dashid
            self.add(cells, family=f'J-separator-spelling-{k}',
                     excluded='id/separator spelling: sources-check skips an id cell of /^:?-{3,}:?$, '
                              'the census separator_row needs cell 2 == "id" or every cell a dash run')
        a = self.base_cells(); b = list(a); c = list(a)
        self.add(a, family='J-dup-triple', dup_rows=[a, b, c],
                 excluded='duplicate multiplicity: sources-check emits one ID_DUPLICATE per repeated id, '
                          'census one E03 per extra occurrence; pre-existing, not trim')
        for k in range(2):
            cells = self.base_cells(); cells[2] = 'do\x00cs'
            self.add(cells, family=f'J-nul-{k}',
                     excluded='NUL: census bash command substitution drops null bytes '
                              '(sources-census.sh:717 warning); encoding artifact')
        return self.fixtures


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--seed', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--manifest', default=None)
    a = ap.parse_args()
    if len(a.seed) != 16 or any(c not in '0123456789abcdef' for c in a.seed):
        sys.exit('seed must be 16 lowercase hex digits')
    rng = random.Random(int(a.seed, 16))
    gen = Gen(a.seed)
    fixtures = gen.build()
    root = Path(a.out)
    if root.exists():
        import shutil
        shutil.rmtree(root)
    root.mkdir(parents=True)
    manifest = []
    for fx in fixtures:
        d = root / fx['name']
        (d / 'corpus' / 'knowledge').mkdir(parents=True)
        (d / 'corpus' / 'lessons').mkdir(parents=True)
        (d / 'corpus' / 'lessons' / 'u.md').write_text('lesson\n', encoding='utf-8')
        (d / 'corpus' / 'SOURCES.md').write_bytes(fx['text'].encode('utf-8'))
        manifest.append({
            'name': fx['name'], 'dir': str(d), 'row_lines': fx['row_lines'],
            'rows': [{'cells': rc['cells'], 'census_id': rc['census_id']} for rc in fx['rows']],
            'registry': fx['registry'], 'width': fx['width'], 'crlf': fx['crlf'],
            'mixed_crlf': fx['mixed_crlf'], 'excluded': fx['excluded'], 'note': fx['note'],
        })
    out = Path(a.manifest) if a.manifest else root / 'manifest.json'
    out.write_text(json.dumps({'seed': a.seed, 'fixtures': manifest}, ensure_ascii=False), encoding='utf-8')
    fams = {}
    for m in manifest:
        fams[m['name'].split('-')[0]] = fams.get(m['name'].split('-')[0], 0) + 1
    print(f'seed={a.seed}')
    print(f'fixtures={len(manifest)} excluded={sum(1 for m in manifest if m["excluded"])}')
    print('families=' + ' '.join(f'{k}:{v}' for k, v in sorted(fams.items())))


if __name__ == '__main__':
    main()
