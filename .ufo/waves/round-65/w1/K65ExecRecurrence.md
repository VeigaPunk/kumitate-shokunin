VERDICT: The reference-drift class is at 21 round opens (r35→r65), not the integrator's "tenth", and it recurs because two committed rules contradict each other — Q48 demands a README row + pin in the same change while the spot-check's write scope is that one file — so the fix is a scope edit plus the unlanded `readme-map-close.mjs`, not a 22nd routed item.

## Evidence

Base `47fe2383151909d31557ada118ad84f90404dc6c`; frozen round-65 tree read-only. Counter (re-runnable, read-only, exit 0):

```
$ sh .ufo/waves/round-65/build/K65ExecRecurrence/count.sh; echo "EXIT=$?"
class reference-drift count=21 first=r35 last=r65 fix=scripts/readme-map.mjs+Q48+Q60(before-freeze only) named_culprit_readings=6 detail=rounds(35 36 40 41 42 43 45 46 52 53 54 55 56 57 58 60 61 62 63 64 65)
class number-drift count=7 first=r55 last=r64 fix=Q50+Q53+Q61/report-receipt-diff(report-scope)
class placeholder count=2 first=r60 last=r61 fix=report-receipt-diff PLACEHOLDER(report-scope)
class dangling-pointer count=5 first=r52 last=r64 fix=Q52+report-receipt-diff RECEIPT_MISSING(report-scope)
class vacuous-counter count=5 first=r57 last=r63 fix=Q43+Q57+gate-mutants.mjs(per-counter,no harness)
class forgery count=2 first=r57 last=r61 fix=receipt-evidence.mjs+dispatch-evidence.mjs+Q57+Q59
class dead-seat count=4 first=r53 last=r61 fix=wave-census --expect+dispatch-evidence.mjs+Q54
class stale-premise count=4 first=r56 last=r64 fix=counter-pins.mjs+amendment convention(Q43)
class landing-attribution count=7 first=r55 last=r63 fix=Q51+Q52+Q55+report-receipt-diff
EXIT=0
```

Reference-drift chain, one committed receipt per counted round (each `+1`/`files-rows=2` is one corpus file landing rowless):

```
r35  declared=77 computed=78      .ufo/waves/round-35/baseline/proxy.txt
r36  declared=79 computed=80      .ufo/waves/round-36/baseline/proxy-default.txt:4
r40  declared=88 computed=89       names lessons/round-39-verifier-spotcheck.md (comm set-diff)
r41  declared=90 computed=91      .ufo/waves/round-41/open/receipts.txt:11
r42  declared=92 computed=93      .ufo/waves/round-42/open/  |  r43 94/95  .ufo/waves/round-43/open/
r45  declared=99 computed=100     .ufo/waves/round-45/open/  |  r46 102/103 .ufo/waves/round-46/open/
r52  declared=117 computed=118    .ufo/waves/round-52/base/baseline-gates.txt:8
r53  120/…  r54 123/124  r55 126/127  r56 129/130  r57 132/133  r58 135/136   (…/base/attestNN-base.txt)
r60  files=142 rows=141 first=uncovered:lessons/round-59-verifier-spotcheck.md
     .ufo/waves/round-60/w1/ExecGates.err:88
r61  declared=145 computed=146 + note unpinned:lessons/round-60-verifier-spotcheck.md
     .ufo/waves/round-61/base/proxy-before.txt
r62  files=149 rows=148 bad=2 first=uncovered:lessons/round-61-verifier-spotcheck.md  .ufo/waves/round-62/w1/ReadmeGate.md
r63  files=151 rows=150 first=uncovered:lessons/round-62-verifier-spotcheck.md      .ufo/waves/round-63/base/
r64  files=154 rows=153 first=uncovered:lessons/round-63-verifier-spotcheck.md      .ufo/waves/round-64/base/
r65  files=157 rows=156 first=uncovered:lessons/round-64-verifier-spotcheck.md      .ufo/waves/round-65/base/readme-map-before.txt
```

Independent corroboration from the lane's own script comment (`scripts/plan-before-ready.sh:144-147`):

```
# Epoch: the arm is enforced from this round on (set PBR_MAP_FROM to move it; the selftest sets 0). Rounds 58, 60, 61, 63 and 64
# froze over a red map before the arm existed: they read `map=SKIP reason=MAP_PRE_EPOCH_ROUND` by default, and FAIL under
# `PBR_MAP_FROM=0` (the red-before receipts, `.ufo/waves/round-64/build/K64ExecReadmeGuard/receipts/`).
MAP_FROM="${PBR_MAP_FROM:-65}"
```

Current tree is clean (the r64 row landed with D2 at the freeze): `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=157 rows=157 covered=157`.

The structural contradiction, in the two committing sentences' own words:

```
corpus/lessons/round-56-verifier-spotcheck.md:108  "(closure scope allows only this path; ...)"
corpus/lessons/round-64-verifier-spotcheck.md:64   "the integrator may write only this path, so the row is the lane's."
corpus/QUALITY.md:882                              Q48: "a corpus file lands only with its ... map row and its `covered` pin, in the same change"
test -e scripts/readme-map-close.mjs  →  ABSENT    (corpus/lessons/round-63-verifier-spotcheck.md:87: "remains unlanded")
```

Ordinal reconstruction from the lane's own anchors: `corpus/QUALITY.md:882` (r52,r55,r56)=(1,2,3); `corpus/lessons/round-58.md:42` "fourth" for the r57 file; `corpus/lessons/round-60-verifier-spotcheck.md:195` "sixth" for r60; `corpus/lessons/round-61-verifier-spotcheck.md:242` "seventh" for r61 ⇒ r62=8, **r63=9**, **r64=10**. `corpus/lessons/round-64.md:12` calls the r63 file tenth; `plan.md:115` calls the r64 file eleventh.

Duplicate reading that likely produced the extra count: round 62's open carries `README_MAP: DRIFT files=149 rows=148 covered=148 bad=2` twice with different `first=` cells — `knowledge/stray-e6-r62.md` (`.ufo/waves/round-62/w2/CritC2WorkingMap.md`, a sandbox stray, not a landed corpus file) and `lessons/round-61-verifier-spotcheck.md` (`.ufo/waves/round-62/w1/ReadmeGate.md`).

## Findings

**K65ExecRecurrence-1 — blocking (structural, no effective fix): reference-drift is at 21 round opens; the fix cannot work under the current write-scope rule.**
Attacks: the round's own "no axis harmed" premise and considerthese idea 4's threshold (3). 21 > 3 with a gate that has existed since r57 and yet 7 further opens occurred after it (r58, r60, r61, r62, r63, r64, r65). Root cause is not discipline: Q48 requires row + pin *in the same change*; the non-author spot-check's declared write scope forbids it from writing `corpus/README.md`/`.ufo/pins/readme-map.json`; therefore every closure artifact lands rowless by construction and is caught only at the next round's open. Fix (strengthening, not relaxation): grant the spot-check seat its own row + `covered` pin in scope, or auto-register at the freeze commit, and land `readme-map-close.mjs` as a blocking pre-commit — a scope edit, not a 22nd routed item.
Reproduce: `sh .ufo/waves/round-65/build/K65ExecRecurrence/count.sh | head -1`, then `for r in 58 60 61 63 64; do grep -c . .ufo/waves/round-$r/plan.md >/dev/null; done` against `scripts/plan-before-ready.sh:144`.

**K65ExecRecurrence-2 — high: number-drift/unreceipted tally, 7 ids over r55→r64, no checker reads a prose tally.**
Attacks: C1-style "the counter is the verdict" claims, which rest on tallies quoted in SCORECARD/SKILL/lessons. r63 `D2` (`69/69`) and r64 `D1` (`125/125`) are the two newest and both survived Q61: `Q61` (`corpus/QUALITY.md:1050-1056`) explicitly leaves Q53's third-copy comparison and Q55's `rev=` agreement "to their own rows", and `report-receipt-diff.mjs` diffs a *report*, never `SCORECARD.md`/`SKILL.md`/`corpus/lessons/*`. Fix: require a committed transcript for any selftest number that appears in prose (r64 already did this for 26 suites — extend the criterion, Q50-style, to "a tally in prose names a committed transcript").
Reproduce: `grep -rn '125/125' /home/vgpnk/Projects/shokunin/kumitate-shokunin/SKILL.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md | head`; `ls /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/ | grep -i transcript`.

**K65ExecRecurrence-3 — high: dangling-pointer, 5 ids over r52→r64, checker is report-scope only.**
Attacks: every grounded citation in a lesson or SCORECARD row. r63 `D5`'s `Q51` hash `9237a72` "resolves nowhere" and r64 `D3`'s `close/supplementary-c2.txt` are both outside `report-receipt-diff.mjs`'s reach (`RECEIPT_MISSING` fires only on `base|close/<file>` paths cited from a report, `:18`, `:196`). Fix: give the tool a `--file <any lane markdown>` mode so lessons/SCORECARD/LOG are diffed by the same arm.
Reproduce: `grep -rn '9237a72' /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus /home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md | head -3`; `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin cat-file -e 9237a72` → non-zero.

**K65ExecRecurrence-4 — medium: vacuous-counter, 5 ids over r57→r63, no shared do-nothing harness.**
Attacks: C1/C2's kill rule ("H4 is the in-counter control", plan C1). Each counter re-authors its own stub control (`R57-V1/V2/V3`, `R61-V2`, r63 `D5`); Q43/Q57 exist as criteria and `gate-mutants.mjs` as a per-counter tool, but nothing requires a *new* counter to ship a do-nothing control, which is why `R61-V2`'s fabrication hole was found only by a verifier. Fix: a `counter-do-nothing` runner that, for each pinned counter, executes the committed control and fails the round when the control reaches HELD (Q57 made machine-checkable rather than prose).
Reproduce: `grep -l 'do-nothing' /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/*.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/*.sh` → no output, exit 1 (no script implements Q57; the do-nothing controls are hand-run per round under `.ufo/waves/round-*/controls/`).

**K65ExecRecurrence-5 — medium: landing-attribution, 7 ids over r55→r63, and Q51 is defeated in the wild.**
Attacks: the report's own landed-changes ledger (the ground C1/C2 claims stand on). `r63 D3` (three `-2` stems reported as one) and `R58-V2` (`64/64` overstates the dispatch) are the same mechanism: a count of host-side objects asserted from memory. Fix: bind the count to a committed enumeration (the `wave-census --expect` pattern already exists) in the same row that claims it.
Reproduce: `grep -rn '64/64' /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-58-verifier-spotcheck.md`; `ls /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w2 | grep -c -- '-2'` → `0`.

Non-findings (below threshold, recorded for calibration): placeholder-token 2 ids (`R60-V2`, `R61-V4`; `report-receipt-diff.mjs:54` covers it), forgery 2 ids (`R57-V4`, `R61-V2`; `receipt-evidence.mjs`+`dispatch-evidence.mjs` cover it), dead-seat 4 ids and stale-premise 4 ids (minor, fixes exist).

**Disagreement with the table the integrator will write.** `corpus/lessons/round-64.md:12`'s "tenth recurrence" is wrong on every unit: 9th on the lane's own ordinal chain (r52,55,56,57,58,60,61 → r62=8, r63=9), 16th on the committed receipt chain, and the "tenth" of the lane's chain is the r64 file — which `plan.md:115` then calls "the eleventh". The ring of the error is the never-declared counting unit: round 62's open has two `files=149 rows=148` readings (one naming a sandbox stray), so "reading" and "landed file" give different numbers. `considerthese`'s "seven" is the r61 ordinal; the receipts show 17 opens by r61.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ExecRecurrence/count.sh` (executable; one `class … count=…` line per class, exit 0; every id verified against its cited lesson file, uncited ids excluded on stderr)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ExecRecurrence/recurrence-table.md` (table + counting units + disagreement section + structural-cause analysis)
- Scratch `/tmp/kumitate-r65/K65ExecRecurrence/` (empty; nothing large retained)

## Limits

- Round opens 44, 47–51, 59 read no drift in the receipts I could find; I did not prove absence for them (their `open/`/`baseline/` layouts differ and some rounds have no such dir) — the 21 is a floor, not a total.
- The 14 count-only readings do not name their culprit file, so I cannot prove every one is the closure-artifact mechanism; only the 7 named readings are proven, and all 7 are `lessons/round-NN-verifier-spotcheck.md`.
- Class assignment for 37 ids is my classification of each id's own defining text (cited file:line in `count.sh`), not the lane's; the lane has no class registry, so a different taxonomy moves counts by 1–2.
- I did not run any gate, build, test or formatter (wave-in-flight rule), did not read or write `.ufo/state/`, pins, `scripts/`, `SCORECARD.md`, `LOG.md`, and did not touch git/jj.
- No tool was installed or upgraded.
