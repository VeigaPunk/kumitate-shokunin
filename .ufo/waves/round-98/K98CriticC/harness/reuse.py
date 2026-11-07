#!/usr/bin/env python3
"""reuse.py — compare a tool's extracted declaredPins() against expected values
recomputed from each file, reusing the census validation already recorded by
compare.py (no new census process per file).

usage: python3 reuse.py <tool.mjs> <label> <files.list> <out.jsonl>

The expected-value function is compare.py's `expected()` (the census row_pass
re-implementation). compare.py already demonstrated on every file that this
implementation reproduces the live census's E12/E01 output
(`census_outside_impl_disagree` in the chunk receipts); this script records that
dependency so the shortcut is auditable.
"""
import json, os, subprocess, sys, shutil

here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
from compare import expected, VALID_ID  # noqa: E402

tool, label, listpath, out = sys.argv[1:5]
files = [l.rstrip('\n') for l in open(listpath) if l.strip()]
hl = out + '.harness.jsonl'
node = shutil.which('node')
subprocess.run([node, os.path.join(here, 'run-harness.mjs'), tool, hl] + files, check=True)
rows = {os.path.abspath(r['file']): r for r in map(json.loads, open(hl))}
agree = disagree = 0
records = []
for f in files:
    exp_decl, _exp_out, exp_malf, stats = expected(open(f, 'rb').read())
    h = rows[os.path.abspath(f)]
    # inside rows: expected MALF ids; outside: expected outside ids (recomputed)
    exp = {'declared': sorted(exp_decl), 'outside': _exp_out, 'malformed': exp_malf}
    got = {'declared': sorted(set(h['declared'])), 'outside': h['outside'], 'malformed': h['malformed']}
    ok = got == exp
    agree += ok
    disagree += (not ok)
    rec = {'file': f, 'agree': ok, 'stats': stats,
           'declared_count': len(got['declared']), 'outside_count': len(got['outside']),
           'malformed_count': len(got['malformed'])}
    if not ok:
        rec['declared_extra'] = sorted(set(got['declared']) - set(exp['declared']))[:5]
        rec['declared_missing'] = sorted(set(exp['declared']) - set(got['declared']))[:5]
        rec['outside_got'] = got['outside'][:5]
        rec['outside_exp'] = exp['outside'][:5]
        rec['malformed_got'] = got['malformed'][:5]
        rec['malformed_exp'] = exp['malformed'][:5]
    records.append(rec)
summary = {'tool': tool, 'label': label, 'files': len(files), 'agree': agree, 'disagree': disagree,
           'records': records}
json.dump(summary, open(out, 'w'), indent=1)
print(json.dumps({k: v for k, v in summary.items() if k != 'records'}, indent=1))
