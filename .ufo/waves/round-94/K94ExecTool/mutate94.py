#!/usr/bin/env python3
"""mutate94.py — arm-teeth table for the round-94 declared-pin rule.

Usage: python3 mutate94.py <candidate round-gate.mjs> <scratch dir> <seat dir>

Each mutant is the candidate with ONE text patch (asserted to apply exactly
once) that forges one shape of the rule:
  m-declared-removed  the declared step is deleted (control: the rule never fires)
  m-blanket           every token that resolves nowhere is declared
  m-substring         token occurring anywhere in SOURCES.md is declared
  m-anyline           every line counts (no registry-row filter)
  m-contains          segment.contains(token) instead of startsWith
  m-norejfilter       `rejected` rows count
  m-slashonly         URLs split on `/` only (a `#fragment` hides the pin)

It runs each mutant's `--selftest` and records which arms FAIL, so every new
arm can be shown to have teeth (a rule-shape forgery it detects).
"""
import os
import re
import shutil
import subprocess
import sys

cand_path, scratch, seat = sys.argv[1], sys.argv[2], sys.argv[3]
base = open(cand_path, encoding='utf-8').read()

DECL_BRANCH = ("      } else if (isDeclaredPin(t, declaredPinsNow())) {\n"
               "        citations.declared.push(t);\n")
ROW_FILTER = "    if (!SOURCES_ROW_RE.test(line)) continue;\n"
STATUS_FILTER = ("    const status = (line.split('|')[8] ?? '').trim();\n"
                 "    if (status.toLowerCase() === 'rejected') continue;\n")


def sub(old, new):
    def patch(s):
        assert s.count(old) == 1, f'anchor not unique: {old[:70]!r} (count={s.count(old)})'
        return s.replace(old, new)
    return patch


MUTANTS = {
    'm-declared-removed': sub(DECL_BRANCH, ''),
    'm-blanket': sub('isDeclaredPin(t, declaredPinsNow())', 'true'),
    'm-substring': sub('isDeclaredPin(t, declaredPinsNow())',
                       "String(readText(join(repo, 'corpus', 'SOURCES.md')) ?? '').includes(t)"),
    'm-anyline': sub(ROW_FILTER, ''),
    'm-contains': sub('if (p.startsWith(tok)) return true;', 'if (p.includes(tok)) return true;'),
    'm-norejfilter': sub(STATUS_FILTER, ''),
    'm-slashonly': sub('const SOURCES_SEGMENT_RE = /[/?#]/;', r'const SOURCES_SEGMENT_RE = /\//;'),
}

ARM_RE = re.compile(r'^FAIL\s+\[\s*(\d+)/(\d+)\]\s+(.*?) — ')
rows = []
for name, patch in MUTANTS.items():
    text = patch(base)
    d = os.path.join(scratch, 'mut', name)
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(os.path.join(d, 'tmp'), exist_ok=True)
    open(os.path.join(d, 'round-gate.mjs'), 'w', encoding='utf-8').write(text)
    for aid in ('cap-spawn.mjs', 'cap-run.mjs'):
        shutil.copyfile(os.path.join(seat, aid), os.path.join(d, aid))
    env = dict(os.environ, TMPDIR=os.path.join(d, 'tmp'))
    r = subprocess.run(['node', os.path.join(d, 'round-gate.mjs'), '--selftest'],
                       capture_output=True, text=True, env=env, timeout=900, cwd=d)
    out = r.stdout
    summary = re.search(r'^ROUND_GATE_SELFTEST: .*$', out, re.M)
    fails = [m.group(3) for m in (ARM_RE.match(l) for l in out.splitlines()) if m]
    rows.append((name, r.returncode, summary.group(0) if summary else 'none', fails))
    print(f'{name}: exit={r.returncode} {summary.group(0) if summary else "none"} fails={len(fails)}')
    for f in fails:
        print(f'    FAILARM {f}')

with open(os.path.join(seat, 'arm-teeth.txt'), 'w', encoding='utf-8') as fh:
    fh.write('arm-teeth — each rule-shape forgery applied to the round-94 candidate, selftest run per mutant\n')
    fh.write(f'candidate: {cand_path}\n\n')
    for name, code, summary, fails in rows:
        fh.write(f'{name}\texit={code}\t{summary}\n')
        for f in fails:
            fh.write(f'\tFAILS\t{f}\n')
        if not fails:
            fh.write('\tFAILS\t(none)\n')
        fh.write('\n')
    fh.write('targets: (i) url8 (ii) full (iii) commitfrag (iv) digest (v) prose (vi) rejected '
             '(vii) mid (viii) no-SOURCES (ix) declared-array (x) text detail\n')
    coverage = {f.split(')')[0] + ')' if f.startswith('(') else f for _, _, _, fs in rows for f in fs}
    fh.write(f'distinct failing arms across mutants: {len(coverage)}\n')
    for c in sorted(coverage):
        fh.write(f'  {c}\n')
print('arm-teeth.txt written')
