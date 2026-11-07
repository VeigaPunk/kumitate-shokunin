#!/usr/bin/env python3
"""report.py — renders mutants.md from the panel/counter/fingerprint receipts in this seat dir."""
import json

CAND = json.load(open('cand-e887b982/mutants.json'))
BASE = json.load(open('baseline-ctlpositive/mutants.json'))
CTRS = {}
for line in open('cand-counters/counter-results.tsv').read().strip().split('\n')[1:]:
    mid, side, exit_, verdict = line.split('\t')
    CTRS[(mid, side)] = (exit_, verdict)

SHAPES = {
    'M01-nothing': 'ctl-nothing', 'M02-k99': 'ctl-k99', 'M03-citeonly': 'ctl-citeonly',
    'M04-captureonly': 'ctl-captureonly', 'M05-indent-blank': 'ctl-indent-blank',
    'M06-indent4': 'ctl-indent4', 'M07-spaceonly': 'ctl-spaceonly', 'M08-nbsp': 'ctl-nbsp',
    'M09-leadjs': 'ctl-leadjs', 'M10-trailjs': 'ctl-trailjs', 'M11-padcap3': 'ctl-padcap3',
    'M12-noanchor': 'ctl-noanchor', 'M13-unicode-digits': 'ctl-unicode-digits',
    'M14-ci': 'ctl-ci', 'M15-splitany': 'ctl-splitany',
}
CLASS = {
    'M13-unicode-digits': 'cite side observational-equivalent (ID_RE cites ASCII only; capture side of the same pair is KILLED by r100-fullwidth-not-row)',
    'M14-ci': 'cite side observational-equivalent (ID_RE cites uppercase ASCII only; capture side of the same pair is KILLED by r100-lowercase-not-row)',
    'M19-split-crlf': 'equivalent: split(/\\r?\\n/) strips only a record-final CR; the row match is a prefix match and is not end-anchored, so the recognition function is identical (0 diffs on the 28-row battery; counter HELD)',
    'M29-cite-digits2': 'cite observational-equivalent: citedIds extracts only /\\bS[0-9]{3,}\\b/, so 1-2 digit registry ids can never be cited; no cite input can flip a verdict (counter HELD)',
    'M30-cap-digits2': 'NOT equivalent: capture binds registry ids directly, so a \\| S99 \\| row becomes recognisable and is reported uncaptured (battery diff S99); missed by the selftest AND by the frozen counter (its battery draws no 1-2 digit ids)',
    'M31-cite-digitsplus': 'cite observational-equivalent: S + 1+ digits only adds uncitable 1-2 digit ids (ID_RE gates 3+); 0 diffs on the battery; counter HELD',
    'M32-cite-splitany': 'NOT equivalent: cite reads a row after U+2028 on the same LF record (battery diff S124); missed by the selftest; the frozen counter CATCHES it (UNMET a=0 a_miss=6)',
}
SHOULD = {
    'M13-unicode-digits': 'none can exist for cite (ID_RE); the pair is killed on capture',
    'M14-ci': 'none can exist for cite (ID_RE); the pair is killed on capture',
    'M19-split-crlf': 'none: equivalent mutant',
    'M29-cite-digits2': 'none can exist (ID_RE); a direct registryIds unit case would be needed to observe it',
    'M30-cap-digits2': 'a capture r100 case with a \\| S99 \\| row bound/exempted, or \\| S99 \\| in SOURCES with no binding -> S99:uncaptured',
    'M31-cite-digitsplus': 'none can exist (ID_RE)',
    'M32-cite-splitany': 'a cite r100 case mirroring r100-samerecord-cr-not-row / r100-samerecord-u2028-not-row (row after CR/LS on the same LF record is not a row)',
}


def firstfail(r):
    fs = r['cite_fails'] if r['cite_changed'] and r['cite_class'] == 'fail' else []
    fs = fs or (r['capture_fails'] if r['capture_changed'] and r['capture_class'] == 'fail' else [])
    return fs[0] if fs else ''


lines = []
A = lines.append
A('# K100Mutation — K2: do the shipped selftests pin R100?')
A('')
A('Seat K100Mutation (mutation tester). Attack surface: the two R100 candidates as published by')
A('K100ExecTool at `READY`. Read-only on the lane; every write is under this seat dir or')
A('`/fast/scratch/hyaku/kumitate-r100/K100Mutation/` (removed before yield).')
A('')
A('## Bytes attacked')
A('')
A('| file | sha256 |')
A('|---|---|')
A('| `K100ExecTool/cite-sources.mjs` | `e887b982eff4bcfe5d15e47b2c105ebabf4b4dd9cae7ec4fdf8599fccdab9ace` |')
A('| `K100ExecTool/source-capture.mjs` | `ad3227d6571838ccefa10aa3778c9777730f5e1ad9a89f03f528d6f2d7104355` |')
A('')
A('`READY` (captured verbatim in `READY.captured`, hashes re-checked with `sha256sum` in')
A('`candidates.sha256`): both lines match the bytes attacked — the panel ran against the final')
A('candidates, not a mid-build snapshot. The lane commit `7c3bca09` carries exactly these two')
A('hashes; at read time the lane working tree showed further uncommitted `scripts/` edits by')
A('another seat (sha `da16e32b…` / `c9f22275…`), which are not mine and not the bytes measured')
A('here.')
A('')
A('## Method')
A('')
A('`mutate.py --cite <c> --capture <p>` rewrites exactly one reader line per mutant (the cite')
A('`const m = line.match(...)` line, the capture `for (const m of raw.…)` loop line, or the cite')
A('record loop for M32) and runs BOTH tools\' unchanged `--selftest`. A mutant is KILLED on a side')
A('when the selftest of the tool whose line changed exits non-zero. `counter.py` then re-runs the')
A('FROZEN counter on each per-tool survivor, pairing the mutant with the reference bytes of the')
A('other tool, so (a)/(b) — not the sibling selftest — decide whether the counter catches it.')
A('`equivalence.mjs` fingerprints each pair on a fixed 28-row battery (clean, blank pads 1/4/8,')
A('TAB pad, NBSP/VT/FF/LS/CR/U+3000/U+FEFF pads, 4-SP/TAB/NBSP/U+3000 indents, CR/LS/PS breaks,')
A('CRLF row, S123x, lowercase, fullwidth, no closing pipe, two ids, mid-line row, 1-2 digit ids)')
A('for equivalence classification only. Command lines are in `COMMANDS.txt`.')
A('')
A('## Reference (unmutated) selftest PASS lines')
A('')
A('```')
cite_tail = open('selftest-ref-cite.txt').read().strip().split('\n')[-2:]
cap_tail = open('selftest-ref-capture.txt').read().strip().split('\n')[-2:]
A(cite_tail[0])
A(cite_tail[1])
A(cap_tail[0])
A(cap_tail[1])
A('```')
A('')
A('(full output: `selftest-ref-cite.txt`, `selftest-ref-capture.txt`; both exit 0)')
A('')
A('## Mutation table — R100 candidates (32 mutants)')
A('')
A('| # | mutant | shape | cite selftest | capture selftest | verdict | first killing case |')
A('|---|---|---|---|---|---|---|')
for i, r in enumerate(CAND, 1):
    shape = SHAPES.get(r['id'], 'own')
    cv = r['cite_class'] + ('' if r['cite_changed'] else ' (n/a)')
    pv = r['capture_class'] + ('' if r['capture_changed'] else ' (n/a)')
    verdict = 'KILLED' if r['killed'] else '**SURVIVED**'
    A(f"| {i} | `{r['id']}` | {shape} | {cv} | {pv} | {verdict} | {firstfail(r)} |")
A('')
kc = sum(1 for r in CAND if r['killed'])
cite_ch = [r for r in CAND if r['cite_changed']]
cap_ch = [r for r in CAND if r['capture_changed']]
A(f'**Selftest kill count (pair level): {kc}/{len(CAND)}.** '
  f'cite line changed in {len(cite_ch)}, killed {sum(1 for r in cite_ch if r["cite_class"] != "pass")}; '
  f'capture line changed in {len(cap_ch)}, killed {sum(1 for r in cap_ch if r["capture_class"] != "pass")}.')
A('')
A('All 15 violating control shapes (M01–M15) are killed at pair level. M13 and M14 are killed')
A('only by the capture arms; their cite sides cannot be killed by any input (see classification')
A('below), which independently reproduces K100ExecTool\'s arm-teeth waiver.')
A('')
A('## Survivors (5 pair-level; 7 changed sides passing their own selftest)')
A('')
A('| mutant | side(s) that survived | class | case that should catch it | frozen counter |')
A('|---|---|---|---|---|')
for mid in ['M13-unicode-digits', 'M14-ci', 'M19-split-crlf', 'M29-cite-digits2',
            'M30-cap-digits2', 'M31-cite-digitsplus', 'M32-cite-splitany']:
    r = next(x for x in CAND if x['id'] == mid)
    sides = []
    if r['cite_changed'] and r['cite_class'] == 'pass':
        sides.append('cite')
    if r['capture_changed'] and r['capture_class'] == 'pass':
        sides.append('capture')
    ctr = []
    for side in sides:
        e = CTRS.get((mid, side))
        ctr.append(f'{side}: {e[1].split(" rows=")[0].replace("C100_C1: ", "") if e else "not run"}')
    A(f"| `{mid}` | {'+'.join(sides)} | {CLASS[mid]} | {SHOULD[mid]} | {'; '.join(ctr)} |")
A('')
A('Counter receipts: `cand-counters/counter-results.tsv` (one line per genuine changed side; this')
A('rerun dropped the no-op probes the first pass produced when a mutant supplied the reference line')
A('verbatim) and `cand-counters/counters.log` (full stdout, fresh seed each run).')
A('')
A('## Shipped (BASE / ctl-positive) selftests — the K2 answer for the pre-R100 bytes')
A('')
A('Same 32 mutants applied to `ctl-positive` (BASE tools + the L1 reference reader lines;')
A('regenerated into scratch with `make-controls100.py`, 16/16 controls):')
A('')
bk = sum(1 for r in BASE if r['killed'])
A(f'- pair-level killed **{bk}/{len(BASE)}**; the surviving {len(BASE) - bk} include **all 15 violating control shapes**.')
A('- the only 4 kills (M18-indent-min1, M20-digits4, M22-cite-gflag, M25-cap-split-crlf-only) are')
A('  pre-existing happy-path cases (`clean-known-ids`, `clean`), not R100 cases: the shipped')
A('  selftests pin the row grammar only well enough to parse a clean fixture.')
A('- independent run of the 16 generated controls: every one exits 0 on both shipped selftests')
A('  (`base-controls-selftest.txt`) — identical to the frozen `controls/OBSERVED.txt` d=1 column.')
A('')
A('| # | mutant | cite | capture | kept? |')
A('|---|---|---|---|---|')
for i, r in enumerate(BASE, 1):
    A(f"| {i} | `{r['id']}` | {r['cite_class']} | {r['capture_class']} | {'killed' if r['killed'] else '**survived**'} |")
A('')
A('## Findings (scoped to K2)')
A('')
A('1. **K2 verdict for the candidates: the R100 selftest arms do pin R100 on 27/32 mutants**,')
A('   including every one of the 15 frozen violating shapes at pair level. Of the 5 pair-level')
A('   survivors, 3 are equivalent/observationally equivalent (M19, M29, M31) and 2 are real gaps:')
A('   M32 is caught by the frozen counter, M30 is caught by neither (findings 2-4).')
A('2. **Real selftest gap (routed): capture `{2,}` (M30) survives the capture selftest** — the new')
A('   arms assert 3+-digit ids are rows and 3+-digit malformed ids are not, but no case draws a')
A('   1-2 digit id cell. Behaviour differs (`| S99 |` -> `S99:uncaptured`), so it is not equivalent.')
A('3. **The frozen counter also misses M30** (HELD, a=1 b=1): its battery draws ids of 3-8 digits')
A('   only. Per the plan this is a coverage observation, not a verdict change — HELD stays a')
A('   refutation budget over the drawn classes. Reported, not acted on (K1/K4 untouched).')
A('4. **Selftest gap caught by the counter (M32): cite record model.** Cite keeps `text.split(\'\\n\')`;')
A('   the capture arms carry same-record CR/LS cases but the cite arms do not. The counter catches')
A('   it (UNMET a=0 a_miss=6, twice on fresh seeds).')
A('5. **Cite-side unkillability of M13/M14 is structural, not a missing case**: `citedIds` reads')
A('   citations with `ID_RE = /\\bS[0-9]{3,}\\b/g`, so lowercase/`\\p{Nd}` registry ids can never be')
A('   cited; the fingerprint shows zero cite diffs. The same argument covers M29/M31 (digit count).')
A('6. **M19 is equivalent**: `split(/\\r?\\n/)` only removes a record-final CR and the row regex is a')
A('   prefix match (not end-anchored), so no LF record changes recognition. Fingerprint 0 diffs.')
A('')
A('## Receipts in this seat dir')
A('')
A('- `mutate.py`, `counter.py`, `equivalence.mjs`, `report.py` — harness (cited above).')
A('- `cand-e887b982/{mutants.json,selftest.tsv}` — candidate panel; per-mutant sources + selftest')
A('  stdout were written under scratch `mut-candidate/<mutant>/` (scratch is removed at yield; the')
A('  panel receipts carry the killing case names, so the evidence stands).')
A('- `selftest-ref-cite.txt`, `selftest-ref-capture.txt` — reference PASS lines.')
A('- `cand-counters/{counter-results.tsv,counters.log}` — frozen counter on every genuine survivor.')
A('- `baseline-ctlpositive/{mutants.json,selftest.tsv}` — shipped-selftest panel.')
A('- `base-controls-selftest.txt` — the 16 controls (regenerated under scratch `gen/`) exit 0 on both')
A('  shipped selftests; `m30-2digit-check.txt` — the M30 observable difference on a minimal fixture.')
A('- `behavior-cand-ref.json`, `behavior-cand-M*.json` — 28-row behaviour fingerprints.')
A('- `READY.captured`, `candidates.sha256`, `COMMANDS.txt` — bytes attacked and exact commands.')
open('mutants.md', 'w').write('\n'.join(lines) + '\n')
print('wrote mutants.md', len(lines), 'lines')
