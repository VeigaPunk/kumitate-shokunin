#!/usr/bin/env python3
"""reparse.py — recompute a compare.py run from its saved census receipts and
harness outputs with the corrected TSV parser (no census process is re-run).

usage: python3 reparse.py <compare-run.json> <out.json>

Each record of a compare.py run carries `census_receipt`; the tool harness
outputs live at <work>/harness-out/<label>.jsonl where <work> is the receipt's
grandparent directory. Expected values are recomputed with compare.expected()
(the census row_pass re-implementation, which compare.py already checked against
the live census's E12 output on every file) and the census receipt is re-parsed
with the corrected split('\t', 2) parser.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compare import expected, parse_census, VALID_ID  # noqa: E402

src, outp = sys.argv[1:3]
d = json.load(open(src))
labels = sorted(d['summary']['tools'])
records = []
summary = {'tools': {l: {'agree': 0, 'disagree': 0, 'declared_disagree': 0,
                         'outside_disagree': 0, 'malformed_disagree': 0} for l in labels},
           'files': 0, 'setup_errors': 0, 'census_impl_decl_mismatch': 0}
for r in d['records']:
    if 'setup_error' in r or 'census_receipt' not in r:
        summary['setup_errors'] += 1
        continue
    if not os.path.exists(r['file']):
        summary['setup_errors'] += 1
        records.append({'file': r['file'], 'setup_error': 'file gone'})
        continue
    work = os.path.dirname(os.path.dirname(r['census_receipt']))
    exp_decl, exp_out, exp_malf, stats = expected(open(r['file'], 'rb').read())
    c_out, c_malf = parse_census(r['census_receipt'])
    out_rec = {'file': r['file'], 'expected': {'declared_count': len(exp_decl),
                                               'outside': c_out, 'malformed': c_malf,
                                               'stats': stats}}
    if c_out != exp_out:
        summary['census_impl_decl_mismatch'] += 1
    for label in labels:
        hp = os.path.join(work, 'harness-out', f'{label}.jsonl')
        row = None
        if os.path.exists(hp):
            for line in open(hp, encoding='utf-8'):
                j = json.loads(line)
                if os.path.abspath(j['file']) == os.path.abspath(r['file']):
                    row = j
                    break
        if row is None:
            summary['setup_errors'] += 1
            continue
        got = {'declared': sorted(set(row['declared'])), 'outside': row['outside'],
               'malformed': row['malformed']}
        exp = {'declared': sorted(exp_decl), 'outside': c_out, 'malformed': c_malf}
        ok = {k: got[k] == exp[k] for k in got}
        rec = {'agree': all(ok.values()), 'declared_agree': ok['declared'],
               'outside_agree': ok['outside'], 'malformed_agree': ok['malformed'],
               'declared_count': len(got['declared']), 'outside_count': len(got['outside']),
               'malformed_count': len(got['malformed'])}
        if not ok['declared']:
            rec['declared_extra'] = sorted(set(got['declared']) - set(exp['declared']))[:5]
            rec['declared_missing'] = sorted(set(exp['declared']) - set(got['declared']))[:5]
        if not ok['outside']:
            rec['outside_got'] = got['outside'][:5]
            rec['outside_exp'] = c_out[:5]
        if not ok['malformed']:
            rec['malformed_got'] = got['malformed'][:5]
            rec['malformed_exp'] = c_malf[:5]
        out_rec[label] = rec
        t = summary['tools'][label]
        if rec['agree']:
            t['agree'] += 1
        else:
            t['disagree'] += 1
            for k in ('declared', 'outside', 'malformed'):
                if not rec[f'{k}_agree']:
                    t[f'{k}_disagree'] += 1
    summary['files'] += 1
    records.append(out_rec)
json.dump({'summary': summary, 'records': records}, open(outp, 'w'), indent=1)
print(json.dumps(summary, indent=1))
