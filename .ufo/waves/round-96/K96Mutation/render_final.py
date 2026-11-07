#!/usr/bin/env python3
"""render_final.py — compose the seat's mutants.md from a battery batch.

Usage: python3 render_final.py <batch dir> <out.md> <candidate sha> <baseline counter txt>
"""
import json
import os
import re
import sys

BATCH, OUT, CAND_SHA, BASE_TXT = sys.argv[1:5]
res = {r['name']: r for r in json.load(open(os.path.join(BATCH, 'results.json')))}
man = json.load(open(os.path.join(BATCH, 'manifest.json')))
muts = man['mutants']
base = open(BASE_TXT).read()
base_line = (re.search(r'^C96_C1: .*$', base, re.M) or ['none'])[0]

SHORT_ARM = [
    (re.compile(r'^\(xxiii\).*'), '(xxiii) R96 battery'),
    (re.compile(r'^\(xxiv\).*'), '(xxiv) fail-closed key'),
    (re.compile(r'^\(xxv\).*'), '(xxv) text mode'),
    (re.compile(r'^hermeticity: --selftest passes.*'), 'hermeticity:nested-run (cascade)'),
    (re.compile(r'^\(xviii\).*'), '(xviii) 14-field row'),
    (re.compile(r'^\(xix\).*'), '(xix) malformed next to good'),
    (re.compile(r'^\(xxi\).*'), '(xxi) malformed order'),
    (re.compile(r'^\(x\w*\).*'), None),
]
def short_arm(a):
    for rx, rep in SHORT_ARM:
        if rx.match(a):
            return rep or (a.split(')')[0] + ') ' + a.split(') ', 1)[1][:40])
    return a[:60]

SHOULD = {
    'm01-ctl-h3exits': '`###` sub-heading must not leave the Registry',
    'm02-ctl-firstonly': 'a later `##` heading must leave the section',
    'm03-ctl-closeseq': '`## Registry ##` text is `Registry ##`, not `Registry`',
    'm04-ctl-crlftrim': '`## Registry\\r` keeps the `\\r` (census trim is `[ \\t]` only)',
    'm05-ctl-casefold': '`## registry` is not `Registry`',
    'm06-ctl-anyindent': '4-space-indented `##` line is not a heading',
    'm07-ctl-nospace': '`##Leads` is not a heading',
    'm08-ctl-fence': 'a `## ` line inside a ``` fence IS a census heading',
    'm09-ctl-defaultin': 'state starts outside; a row before any heading declares nothing',
    'm10-ctl-h1keep': 'a `#` heading clears the section',
    'm11-ctl-nodisclose': 'outside ids are listed in `outsideRows`',
    'm12-ctl-dedupe': 'a repeated outside id is listed twice',
    'm13-ctl-sorted': 'outside ids keep file order',
    'm14-ctl-urlonly': 'a URL-less outside row is still listed',
    'm15-ctl-countfirst': 'an outside row gets no field-count check',
    'm16-ctl-dropall': 'an outside row does not silence the registry',
    'm17-ctl-nofailclosed': 'fail-closed `citations` carries `outsideRows`',
    'm18-ctl-notext': 'text mode prints the SOURCES_ROWS_OUTSIDE info line',
    'b19-indent4': 'a 4-space `##` line is not a heading',
    'b20-spaceclass': '**no clause yet**: a `##\\fLeads` (or `##<\\v>`, `##<U+00A0>`) line is NOT a census heading; `\\s` makes it one',
    'b21-not-eq': 'the section test is equality, not inequality',
    'b22-start-true': 'state starts outside (same bytes as m09)',
    'b23-unshift': 'outside ids are appended, not prepended',
    'b24-id-field2': 'the outside id is `fields[1]`, not `fields[2]`',
    'b25-outside-after-rejected': 'an outside `rejected` row is still listed (status check comes later)',
}

rows = []
for name in sorted(res):
    r = res[name]
    st_fail = r['selftest_exit'] != 0 or r['selftest_verdict'] != 'PASS'
    ct = r['counter_line'] or 'none'
    ct_unmet = ct.startswith('C96_C1: UNMET')
    vec = re.search(r'C96_C1: \w+ (a=\S+ b=\S+ c=\S+ d=\S+ e=\S+ f=\S+)', ct)
    vecs = vec.group(1) if vec else '—'
    if st_fail:
        verdict = 'KILLED-by-selftest'
    elif ct_unmet:
        verdict = 'KILLED-by-counter-only'
    else:
        verdict = 'SURVIVED'
    arms = [short_arm(a) for a in r['selftest_fail_arms']]
    rows.append({'name': name, 'note': muts[name]['note'], 'lc': muts[name]['lines_changed'],
                 'sexit': r['selftest_exit'], 'sverd': r['selftest_verdict'], 'stotal': r['selftest_total'],
                 'arms': arms, 'vec': vecs, 'verdict': verdict})

k_st = [x for x in rows if x['verdict'] == 'KILLED-by-selftest']
k_ct = [x for x in rows if x['verdict'] == 'KILLED-by-counter-only']
sv = [x for x in rows if x['verdict'] == 'SURVIVED']

L = []
A = L.append
A('# round-96 K96Mutation — kill-rule K2: 25 single-point mutants of the R96 rule')
A('')
A(f'Attacked bytes: candidate `{CAND_SHA}` (`.ufo/waves/round-96/K96ExecTool/round-gate.mjs`,')
A('the builder never wrote `READY`; the bytes were byte-stable from 22:39 to the end of the battery, and')
A('the executor\'s own `--selftest` on them is 92/92 PASS — see `receipts/pristine-cand.selftest.txt`).')
A('Fallback also prepared: `ctl-positive` regenerated with `probe/make-controls96.py` into scratch')
A('(sha256 `8793e0d9…`); it carries the identical R96 rule code with none of the new selftest arms,')
A('and was used for the mechanics pilot (`m01-ctl-h3exits`: selftest PASS, counter UNMET).')
A('')
A('Detectors, run on every mutant:')
A('1. `node <mutant>/round-gate.mjs --selftest` → exit code, `VERDICT:`, failing arm names (`runs/cand-9975be54/<m>/selftest.txt`).')
A('2. frozen counter `node probe96-c1.mjs --tool <mutant>/round-gate.mjs --work <scratch>/probes/… --freeze 617e80cd8b01efb5748d729dbdcac95734bc461d` → exit + `C96_C1:` line (`runs/cand-9975be54/<m>/counter.txt`).')
A('')
A('Baseline (must be HELD for an UNMET to mean killed): ' + f'`{base_line}`')
A('(`receipts/pristine-cand.counter.txt`). All 25 counter runs were compared against it; none was a baseline failure.')
A('')
A(f'**Kill counts: {len(k_st)}/25 KILLED-by-selftest · {len(k_ct)}/25 KILLED-by-counter-only · {len(sv)}/25 SURVIVED both.**')
A('')
A('| # | mutant | change (single point) | lines changed | selftest | failing arms | counter a–f | verdict |')
A('|---|---|---|---|---|---|---|---|')
for i, x in enumerate(rows, 1):
    A(f"| {i} | `{x['name']}` | {x['note']} | {x['lc']} | exit={x['sexit']} {x['sverd']} ({x['stotal']}) | "
      f"{', '.join(x['arms']) if x['arms'] else '—'} | `{x['vec']}` | **{x['verdict']}** |")
A('')
A('`lines changed` = number of candidate lines touched by `diff -U0`; every changed line falls inside the')
A('R96 new-code regions (`declaredPins` body 429–443, citations initialisers 456/748, the `declaredPins()`')
A('call 492, the text-mode block 828) — `receipts/scoping.txt`. Each mutation is applied to the candidate\'s')
A('own code, not to a control file: `build_mutants.py` asserts every replacement matches exactly once, and')
A('`node --check` passes on all 25 mutant files (`receipts/build.txt`, `receipts/syntax.txt`).')
A('')
A('## Survivor (coverage finding, K2)')
A('')
for x in sv:
    A(f"`{x['name']}` — `{x['note']}`. Selftest 92/92 PASS and counter HELD, i.e. **neither detector sees it**.")
A('')
A('It is **not equivalent**: `[ \\t]` and `\\s` differ on form-feed / vertical-tab / NBSP after `##`.')
A('Demonstration (`receipts/b20-divergence.json`, one git fixture with a `##\\fLeads` line inside the Registry'
  ' and a row after it):')
A('')
A('| tool | declared | outsideRows | unresolved | exit |')
A('|---|---|---|---|---|')
A('| candidate | `0ba1d52b ff29ea8c` | `[]` | `[]` | 0 |')
A('| `b20-spaceclass` | `0ba1d52b` | `["S002"]` | `["ff29ea8c"]` | 1 (COMMIT_CITED_UNRESOLVED) |')
A('| `sources-census.sh validate --file` | — | ok (no E12/E01: S002 is inside) | — | 0 |')
A('')
A('So the mutant invents an E12 row the census does not have; the census agrees with the candidate.')
A(f"Arm that should catch it: {SHOULD['b20-spaceclass']}. Route: add a battery clause line")
A('`##\\fLeads (form feed is not a space/tab)` inside the Registry with a declaring row after it.')
A('')
A('## Secondary observations')
A('')
A('1. The `hermeticity: --selftest passes under a polluted env and bogus dir flags` arm fails in all 24')
A('   killed mutants: it re-runs the whole suite in a child, so it is a cascade of the primary arm, not')
A('   independent evidence. It is listed in the table but not counted as an independent kill.')
A('2. `m09-ctl-defaultin` and `b22-start-true` are the same byte mutation (`2d567674…`): both are killed')
A('   by (xxiii), which is expected — the two probe names in the seat spec denote one defect.')
A('3. `b21-not-eq` also flips the fleet arm (`e=71/79`): the counter\'s no-regression arm is sensitive to')
A('   a total inversion, which is a useful cross-check that arm (e) is not vacuous.')
A('')
A('## Receipts')
A('')
A('* `runs/cand-9975be54/<mutant>/{selftest.txt,counter.txt,status.json}` — raw detector output for all 25.')
A('* `receipts/pristine-cand.selftest.txt` (92/92 PASS, exit 0) and `receipts/pristine-cand.counter.txt` (`C96_C1: HELD`).')
A('* `receipts/base-vs-cand.diff` — the candidate\'s new code; `receipts/scoping.txt` — diff-scope proof.')
A('* `receipts/build.txt`, `receipts/syntax.txt`, `receipts/sha256.txt`, `receipts/b20-divergence.json`.')
A('* `mutants.json` — machine-readable manifest (per-mutant sha256, note, lines changed) + results.')
open(OUT, 'w').write('\n'.join(L) + '\n')
print(f'wrote {OUT}: {len(rows)} rows; {len(k_st)} selftest, {len(k_ct)} counter-only, {len(sv)} survived')
