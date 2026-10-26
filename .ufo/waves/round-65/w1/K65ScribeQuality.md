VERDICT: Q62 and Q63 are drafted in house style with runnable commands and receipts that fail on purpose; Q64 is drafted only for the pointer half because the "plan sentences ↔ counter" half has no failing arm I could produce on committed bytes.

## Evidence

Lane tip read for every measurement: `2ca91a0c81542cad5f731049aa55dd2f99ade98d` (base `47fe2383`).
No lane file edited, no git/jj mutation, no tool installed.

Q62 counting command (draft `build/K65ScribeQuality/class-recurrences.sh`, sha256 `da0cfba2…c29458`):

```
$ bash class-recurrences.sh --emit --lane <lane> --lessons <lane>/corpus/lessons
CLASS landing 3 …/corpus/lessons/round-54.md,…/round-55.md,…/round-61.md
CLASS reference-drift 3 …/corpus/lessons/round-54.md,…/round-61.md,…/round-64.md
CLASS contract-misread 1 … (six more classes at 1)
EXIT=0
$ bash class-recurrences.sh --check lesson-live-routed.md --lane <lane> --lessons <lane>/corpus/lessons
CLASS_RECUR: FAIL reason=CLASS_ROUTED class=landing count=3 fix="routed to round 66"
EXIT=1
$ bash class-recurrences.sh --check lesson-live-fixed.md --lane <lane> --lessons <lane>/corpus/lessons
CLASS_RECUR: CLEAN classes=2 at3=reference-drift,landing
EXIT=0
$ bash class-recurrences.sh --selftest
CLASS_RECUR_SELFTEST: PASS (9/9)   EXIT=0
```

Q63 arms, quoted from frozen receipts (`.ufo/waves/round-65/base/`):

```
harm-pairA-freeze.txt: HARM_MATRIX: HARM gates=19 held=15 repaired=0 carried=2 moved=0 new=0 gone=0 harm=2 harm_absent=0 new_red=0 base=a004902d77d1 tip=47fe23831519   EXIT=1
harm-pairB-freeze.txt: HARM_MATRIX: CLEAN gates=19 held=14 repaired=2 carried=2 moved=0 new=1 gone=0 harm=0 harm_absent=0 new_red=0 base=6825a51425e9 tip=a004902d77d1   EXIT=0
harm-matrix-selftest-freeze.txt: HARM_MATRIX_SELFTEST: PASS (26/26)   EXIT=0
case-03-harm-verdict: {"exit":1,"rows":["g1 HARM"],"summary":"HARM_MATRIX: HARM gates=1"}
case-04-harm-exit-code-with-clean-line: {"exit":1,"rows":["g1 HARM"]}
case-14-last-verdict-wins: {"exit":1,"rows":["g1 HARM"]}
```

Pair A's two HARM rows are exactly `readme-map` and `proxy-check` (HARM_ROW lines in the same receipt).
Q63's quoting arm on committed bytes: `grep -c "HARM_MATRIX:" .ufo/reports/round-64/kumitate.md` → `0`, `grep_exit=1`.

Q64 pointer arm at tip `2ca91a0c`:

```
$ git cat-file -e 2ca91a0c:.ufo/waves/round-64/close/supplementary-c2.txt
fatal: path '.ufo/waves/round-64/close/supplementary-c2.txt' does not exist in '2ca91a0c…'   exit=128
sweep of .ufo/waves/round-64/controls/CHANGES-AFTER-FREEZE.md: DANGLING close/supplementary-c2.txt
sweep of .ufo/reports/round-64/kumitate.md: RESOLVES base/census-before.txt … RESOLVES close/receipt64-measured-noreport.txt (6/6)
```

## Findings

**K65ScribeQuality-1 — MEDIUM — `landing` reaches three records and has no structural gate; Q62 cannot pass round 65's own lesson without one.**
What it attacks: the new criterion's first live application. The three `landing` records are distinct shapes (round-54 M2 missing README row → `readme-map`; round-55 M1 rejection against uncommitted bytes → `source-capture`; round-61 after-values before measurement → `report-receipt-diff`), so a single fix path is not honest; the lesson table must name the mapping, else `CLASS_ROUTED`/`FIX_ABSENT` fires on the round that adds Q62.
Repro: `bash .ufo/waves/round-65/build/K65ScribeQuality/class-recurrences.sh --emit --lane <lane>` then `--check` on any lesson table that defers `landing` (`receipts/q62-check-routed.txt`).

**K65ScribeQuality-2 — MEDIUM — Q63's quoted `HARM_MATRIX:` line has no tool behind it.**
What it attacks: the new criterion's enforceability. `report-receipt-diff` matches only `<LABEL>_HELD|UNMET held=x/y` (`scripts/report-receipt-diff.mjs:55`), so `HARM_MATRIX: CLEAN …` is outside its `TALLY` schema and a report may quote a wrong or absent harm line and still read `REPORT_RECEIPT: CLEAN`. As drafted, Q63's comparison is a reviewer `grep` + `cmp`. A wave-2 strengthening is a `HARM_LINE` finding id in that tool; it strengthens and does not change the row.
Repro: `grep -n 'const TALLY' scripts/report-receipt-diff.mjs`; `grep -c 'HARM_MATRIX:' .ufo/reports/round-64/kumitate.md` → `0` (exit 1).

**K65ScribeQuality-3 — MEDIUM — Q62 is unenforced until the L1 integrates the draft gate.**
What it attacks: the row names `scripts/class-recurrences.sh`, which does not exist at `2ca91a0c`; the draft lives only in this seat's build dir. Appending Q62 without integrating the file, or without the round-65 lesson's `## Recurrence classes` section, produces a row whose command cannot run (`TABLE_ABSENT` at best).
Repro: `test -e scripts/class-recurrences.sh; echo $?` → non-zero; `test -e corpus/lessons/round-65.md` → non-zero.

**K65ScribeQuality-4 — LOW — a naive "plan path resolves" arm is mostly false positives; Q64 had to be narrowed to `<base|close>/<file>.txt`.**
What it attacks: the audit rule's scope, before anyone builds it. A first, unrefined sweep of every backticked path in rounds 63/64's plans reported 15 and 12 `DANGLING` tokens at tip `47fe2383` (5 and 6 after directory resolution), and none of the survivors is a defect: bare script names resolve under `scripts/` (`dispatch-evidence.mjs`, round-63 plan line 23), `merge/kumitate/` and `multi-agent-coordinator-topologies.md` are the shokuknow merge package (`/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/multi-agent-coordinator-topologies.md`), `ufo-wave-policy.json` is the fleet's (`/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`), so all three are out of lane, `.ufo/state/` and `.scratch/` are untracked by rule, `close/dispatch60-tip.txt` is round-60's path resolved against round 64, and `corpus/knowledge/omp-installed-release-mcp-runtime.md` is this round's prospective target. Q64 therefore binds only receipt-shaped pointers.
Repro: `/tmp/kumitate-r65/K65ScribeQuality/plan-paths2.mjs <lane> 47fe2383 63|64` (round 64 prints `PLAN_PATHS round=64 … dangling=5`; every token listed above is one of them).

**K65ScribeQuality-5 — LOW (decision) — no placeholder command was needed for Q62, and Q64's semantic half is deliberately undrafted.**
What it attacks: over-claiming. Q62's command does not read the `K65ExecRecurrence` table (absent on disk at `2ca91a0c`), so the row carries a real command today; the table is a *field* the row validates, and the dependency is stated in `criteria.md` outside the row text. For Q64, the sentence↔counter arm has no failing instance on committed bytes: `RECEIPT64_HELD` and `JJ64_HELD` each occur once in the probe source they name, and the five K63 instances (`.ufo/waves/round-63/w1/K63CriticFreezeIntegrity.md:56`) are semantic (one prospective, one equivalent-formulation nit). Filing a row whose arm cannot fail would be an assertion, so it is not filed.
Repro: `grep -c RECEIPT64_HELD .ufo/waves/round-64/probe/receipt64-probe.mjs` → 1; `grep -c JJ64_HELD .ufo/waves/round-64/probe/jj64-probe.mjs` → 1.

## Artifacts

- `.ufo/waves/round-65/build/K65ScribeQuality/criteria.md` — exact Q62/Q63/Q64 row text, apply-to-round-65 notes, receipts index
- `.ufo/waves/round-65/build/K65ScribeQuality/class-recurrences.sh` — Q62 draft gate (`--emit/--check/--selftest`, contract `kumitate-class-recurrences-v1`)
- `.ufo/waves/round-65/build/K65ScribeQuality/receipts/{q62-emit-live,q62-check-routed,q62-check-fixed,q62-selftest,q63-arms,q64-dangling-pointer}.txt`
- this report; scratch fixtures `/tmp/kumitate-r65/K65ScribeQuality/` (not citable lane bytes)

## Limits

- Q63 was not re-run: every harm number is quoted from the frozen `base/` receipts (they are committed at `2ca91a0c`), except the quoting-arm `grep`, which I ran on the filed round-64 report. I did not run `scripts/harm-matrix.mjs` (host load, and the frozen receipts already carry both pairs).
- Q62's class identity is token-based; a class the lane records only in prose is invisible (round-63 mentions `reference-drift` inside a quarantine list; `R56-V3` appears on nine lines across eight files). The `landing`/`reference-drift` counts are file counts, not incident counts.
- Q64 checks pointer resolution, not whether the resolved file says what the sentence claims; and it never ran over round-65's own files, which this round commits.
- The draft gate's `--check` treats any path-looking token in the fix cell as a path; a fix cell whose prose contains a slash would be tested and could read `FIX_ABSENT` spuriously (no such cell exists in the receipts).
