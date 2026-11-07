#!/usr/bin/env python3
"""h99analyze.py — turn the K99CriticC differential results into the H99 evidence table.

Reads manifest + results.json, then reports
  1. pad-class coverage (every class x cell pair actually drawn),
  2. expected/observed occurrences of each mapped code,
  3. the BASE-control null test: every BASE disagreement must sit on a cell whose padded
     boundary has a wider ECMAScript-`trim` run than the census `blank` run,
  4. census-model agreement (rows/tier/status counters),
  5. the excluded-fixture observations with their observed contrast.
Usage: h99analyze.py --manifest M --results R.json --out analysis.json [--base-label L]
"""
import argparse, json, re
from pathlib import Path

CELL_INDEX = {'id': 0, 'source': 1, 'kind': 2, 'tier': 3, 'scope': 4, 'anchor': 5,
              'teaches': 6, 'status': 7, 'opened': 8, 'recheck': 9, 'usedby': 10}
SEM = {'id', 'kind', 'tier', 'status', 'opened', 'recheck'}
PAD_NAMES = ['THREEPEREM', 'FOURPEREM', 'SIXPEREM', 'PUNCSP', 'HAIRSP2', 'SPNBSP', 'NBSPSP', 'NBSPTAB',
             'TABVT', 'VTFF', 'CRFF', 'NELSP', 'BOMSP', 'ZWSPNBSP', 'ENQUAD', 'EMQUAD', 'THICKSP',
             'FIGSP', 'THINSP', 'HAIRSP', 'OGHAM', 'NNBSP', 'MMSP', 'IDSP', 'ENSP', 'EMSP',
             'SP', 'TAB', 'VT', 'FF', 'CR', 'NEL', 'NBSP', 'LS', 'PS', 'SHY', 'ALM', 'MVS', 'ZWSP',
             'ZWNJ', 'ZWJ', 'LRM', 'RLM', 'WJ', 'CF2061', 'CF2062', 'CF2063', 'CF2064', 'BOM',
             'C0_01', 'C0_02', 'C0_03', 'C0_04', 'C0_05', 'C0_06', 'C0_07', 'C0_08', 'C0_0E', 'C0_0F',
             'C0_10', 'C0_11', 'C0_12', 'C0_13', 'C0_14', 'C0_15', 'C0_16', 'C0_17', 'C0_18', 'C0_19',
             'C0_1A', 'C0_1B', 'C0_1C', 'C0_1D', 'C0_1E', 'C0_1F']
PAD_NAMES += [f'C1_{i:02X}' for i in range(0x7f, 0xa0) if i != 0x85]
UNIT = {}
for i in range(0x01, 0x09):
    UNIT[f'C0_{i:02X}'] = chr(i)
for i in range(0x0e, 0x20):
    UNIT[f'C0_{i:02X}'] = chr(i)
for i in range(0x7f, 0xa0):
    if i != 0x85:
        UNIT[f'C1_{i:02X}'] = chr(i)
UNIT.update({'SP': ' ', 'TAB': '\t', 'VT': '\v', 'FF': '\f', 'CR': '\r', 'NEL': '\u0085',
             'NBSP': '\u00a0', 'OGHAM': '\u1680', 'ENQUAD': '\u2000', 'EMQUAD': '\u2001',
             'ENSP': '\u2002', 'EMSP': '\u2003', 'THICKSP': '\u2004', 'SIXPEREM': '\u2005',
             'FIGSP': '\u2006', 'PUNCSP': '\u2007', 'THINSP': '\u2008', 'HAIRSP': '\u2009',
             'HAIRSP2': '\u200a', 'LS': '\u2028', 'PS': '\u2029', 'NNBSP': '\u202f',
             'MMSP': '\u205f', 'IDSP': '\u3000', 'SHY': '\u00ad', 'ALM': '\u061c',
             'MVS': '\u180e', 'ZWSP': '\u200b', 'ZWNJ': '\u200c', 'ZWJ': '\u200d',
             'LRM': '\u200e', 'RLM': '\u200f', 'WJ': '\u2060', 'CF2061': '\u2061',
             'CF2062': '\u2062', 'CF2063': '\u2063', 'CF2064': '\u2064', 'BOM': '\ufeff',
             'SPNBSP': ' \u00a0', 'NBSPSP': '\u00a0 ', 'NBSPTAB': '\u00a0\t',
             'TABVT': '\t\v', 'VTFF': '\v\f', 'CRFF': '\r\f', 'NELSP': '\u0085 ',
             'BOMSP': '\ufeff ', 'ZWSPNBSP': '\u200b\u00a0'})
JS_WS = set('\t\n\v\f\r \u00a0\u1680' + ''.join(chr(c) for c in range(0x2000, 0x200b))
            + '\u2028\u2029\u202f\u205f\u3000\ufeff')
BLANK = {' ', '\t'}


def run_len(value, chars, from_end=False):
    n = 0
    seq = reversed(value) if from_end else value
    for ch in seq:
        if ch in chars:
            n += 1
        else:
            break
    return n


def pad_plan(name):
    """-> [(row_index_or_None, cell, class, how)] from a fixture family name."""
    if name.startswith('A-'):
        for cell in ('opened', 'recheck', 'status', 'kind', 'tier', 'id'):
            pre = f'A-{cell}-'
            if name.startswith(pre):
                cls = name[len(pre):]
                if cls in UNIT:
                    return [(None, cell, cls, 'pad')]
    if name.startswith('B-'):
        for cell in ('source', 'scope', 'anchor', 'teaches', 'usedby'):
            pre = f'B-{cell}-'
            if name.startswith(pre):
                cls = name[len(pre):]
                if cls in UNIT:
                    return [(None, cell, cls, 'pad')]
    if name.startswith('C-len-'):
        rest = name[len('C-len-'):]
        cls, n = rest.rsplit('-', 1)
        if cls in UNIT:
            return [(None, 'id', cls, 'pad')]
    if name.startswith('D-w'):
        tag = name.rsplit('-', 1)[1]
        m = {'spid': (0, 'SP'), 'nbspid': (0, 'NBSP'), 'zwspid': (0, 'ZWSP'),
             'nbspkind': (2, 'NBSP')}
        if tag in m:
            return [(None, {0: 'id', 2: 'kind'}[m[tag][0]], m[tag][1], 'pad')]
    if name.startswith('E-dup-'):
        # the generator pads row `1 - which` (which=0 -> second copy, which=1 -> first copy)
        rest = name[len('E-dup-'):]
        cls, which = rest.rsplit('-first', 1)
        if cls in UNIT:
            return [(1 - int(which), 'id', cls, 'pad')]
    if name.startswith('F-crlf-'):
        tag = name[len('F-crlf-'):]
        m = {'spid': (0, 0, 'SP'), 'nbspid': (0, 0, 'NBSP'), 'zwspid': (0, 0, 'ZWSP'),
             'nbspkind': (0, 2, 'NBSP'), 'vtkind': (0, 2, 'VT'), 'dup-nbsp': (1, 0, 'NBSP'),
             'mixed-nbspkind': (0, 2, 'NBSP')}
        if tag in m:
            r, ci, cls = m[tag]
            return [(r, {0: 'id', 2: 'kind'}[ci], cls, 'pad')]
    if name.startswith('G-outside-'):
        tag = name[len('G-outside-'):]
        m = {'spid': 'SP', 'nbspid': 'NBSP', 'zwspid': 'ZWSP', 'thinsid': 'THINSP'}
        if tag in m:
            return [(None, 'id', m[tag], 'pad')]
    if name.startswith('H-'):
        parts = name.split('-')
        field = parts[1]
        cls = name.rsplit('-', 1)[1]
        if field in CELL_INDEX and cls in UNIT:
            return [(None, field, cls, 'pad')]
    if name.startswith('I-padonly-'):
        rest = name[len('I-padonly-'):]
        cell, cls = rest.rsplit('-', 1)
        if cell in CELL_INDEX and cls in UNIT:
            return [(None, cell, cls, 'padonly')]
    if name.startswith('L-long-'):
        rest = name[len('L-long-'):]
        cell, cls, n = rest.rsplit('-', 2)
        if cell in CELL_INDEX and cls in UNIT:
            return [(None, cell, cls, 'pad')]
    if name.startswith('K-two-'):
        parts = name.split('-')
        out = []
        for cell, cls in ((parts[2], parts[3]), (parts[4], parts[5])):
            if cell in CELL_INDEX and cls in UNIT:
                out.append((None, cell, cls, 'pad'))
        return out
    return []


def cell_value(row, cell):
    idx = CELL_INDEX[cell]
    return row['cells'][idx] if idx < len(row['cells']) else None


def possible_divergence(fx):
    """True iff a padded *mapped* cell has a wider JS-trim run than blank-trim run at its boundary."""
    plan = pad_plan(fx['name'])
    if not plan:
        return None
    for row_idx, cell, cls, how in plan:
        if cell not in SEM:
            continue
        if how == 'padonly':
            continue  # the trimmed cell is empty under both readers: presence is the same
        ri = row_idx if row_idx is not None else 0
        if ri >= len(fx['rows']):
            continue
        val = cell_value(fx['rows'][ri], cell)
        if val is None:
            continue
        unit = UNIT[cls]
        lead = val.startswith(unit[0]) or val.startswith(unit)
        trail = val.endswith(unit[-1]) or val.endswith(unit)
        # boundary characters actually adjacent to the value
        for from_end in ((False,) if lead and not trail else ((True,) if trail and not lead else (False, True))):
            js = run_len(val, JS_WS, from_end)
            bl = run_len(val, BLANK, from_end)
            if js != bl:
                return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--manifest', required=True)
    ap.add_argument('--results', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--base-label', default='BASE-f9cd1bff')
    a = ap.parse_args()
    man = json.loads(Path(a.manifest).read_text())
    res = json.loads(Path(a.results).read_text())
    fx = {f['name']: f for f in man['fixtures']}
    results = {r['name']: r for r in res['results']}
    out = {'seed': man['seed'], 'fixtures': len(fx),
           'excluded': sum(1 for f in man['fixtures'] if f['excluded']),
           'tools': res['tools']}
    # 1. coverage
    cov = {}
    for f in man['fixtures']:
        if f['excluded']:
            continue
        for row_idx, cell, cls, how in pad_plan(f['name']):
            cov.setdefault(cell, set()).add(cls)
    out['coverage'] = {cell: {'classes': len(v), 'names': sorted(v)} for cell, v in sorted(cov.items())}
    out['distinct_pad_classes'] = len({u for u in UNIT.values()})
    out['pad_class_count_seen'] = len({c for v in cov.values() for c in v})
    # 2. expected/observed code counts
    codes = {'E01': 0, 'E02': 0, 'E03': 0, 'E05': 0, 'E06': 0, 'E07': 0, 'E08': 0, 'E09': 0, 'E12': 0}
    got = {label: {k: 0 for k in ('ID_FORM', 'ID_DUPLICATE', 'ROW_MALFORMED', 'KIND_ENUM',
                                  'TIER_ENUM', 'STATUS_ENUM', 'OPENED_INVALID',
                                  'RECHECK_INVALID', 'ROW_OUTSIDE_REGISTRY')}
           for label in res['tools']}
    for r in res['results']:
        if r['excluded']:
            continue
        for c in r['tools'][out['tools'][0]]['cmp']['rows']:
            ce = c['census']
            if ce['E01']:
                codes['E01'] += 1
            if ce['E02']:
                codes['E02'] += 1
            if ce['E03']:
                codes['E03'] += 1
            for k in ('E05', 'E06', 'E07', 'E08', 'E09'):
                if ce[k]:
                    codes[k] += 1
            if ce['E12']:
                codes['E12'] += 1
            for label in res['tools']:
                tg = c['tool']
                for k, v in tg.items():
                    got[label][k] += 1 if (v if isinstance(v, int) else len(v)) else 0
    out['census_code_rows'] = codes
    out['tool_kind_rows'] = got
    # 3. BASE null test
    base = a.base_label
    viol, base_disagree, base_possible, base_agree_no_possible = [], [], 0, 0
    for r in res['results']:
        if r['excluded']:
            continue
        pos = possible_divergence(fx[r['name']])
        if pos:
            base_possible += 1
        rows = r['tools'][base]['cmp']['rows']
        bad = [c for c in rows if not c['ok']]
        if bad:
            base_disagree.append({'fixture': r['name'], 'possible': pos,
                                  'failed': [k for k, v in bad[0]['checks'].items() if not v]})
            if not pos:
                viol.append(r['name'])
        elif pos is False:
            base_agree_no_possible += 1
    out['base_control'] = {'fixtures_possible_divergence': base_possible,
                           'disagreements': len(base_disagree),
                           'unexplained_disagreements': viol,
                           'agreements_on_nonpossible': base_agree_no_possible,
                           'sample_disagreements': base_disagree[:40]}
    # per-class breakdown of BASE disagreements
    cls_counts = {}
    for d in base_disagree:
        for _, cell, cls, _how in pad_plan(d['fixture']):
            key = f'{cell}:{cls}'
            cls_counts[key] = cls_counts.get(key, 0) + 1
    out['base_disagreement_classes'] = dict(sorted(cls_counts.items()))
    # 4. census model
    model_bad = []
    for r in res['results']:
        if r['excluded']:
            continue
        for label in res['tools']:
            cc = r['tools'][label]['cmp']['counts']
            for k in ('census_rows', 'census_tiers', 'census_status'):
                if not cc[k]:
                    model_bad.append({'fixture': r['name'], 'tool': label, 'check': k})
    out['census_model_bad'] = model_bad[:50]
    out['census_model_bad_count'] = len(model_bad)
    # 5. excluded observations
    out['excluded'] = []
    for f in man['fixtures']:
        if not f['excluded']:
            continue
        r = results[f['name']]
        obs = {'fixture': f['name'], 'reason': f['excluded'],
               'census_codes': [(c['code'], c['id']) for c in r['census_codes']],
               'tools': {}}
        for label in res['tools']:
            rows = r['tools'][label]['cmp']['rows']
            kinds = {}
            for c in rows:
                for k, v in c['tool'].items():
                    n = v if isinstance(v, int) else len(v)
                    if n:
                        kinds[k] = kinds.get(k, 0) + n
            obs['tools'][label] = kinds
        out['excluded'].append(obs)
    Path(a.out).write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print('coverage:', {k: v['classes'] for k, v in out['coverage'].items()})
    print('pad classes:', out['pad_class_count_seen'], 'of', len(UNIT))
    print('census code rows:', out['census_code_rows'])
    print('tool kind rows:', json.dumps(out['tool_kind_rows']))
    print('base control:', {k: v for k, v in out['base_control'].items()
                            if k != 'sample_disagreements'})
    print('census model bad:', out['census_model_bad_count'])
    print('excluded observations:', len(out['excluded']))


if __name__ == '__main__':
    main()
