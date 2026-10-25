VERDICT: The round-64 LOG entry, both gate-registry rows and the two checklist items are drafted and grammar-tested; three live defects block operability as frozen — SKILL.md's round-60 checklist item is malformed and never runs, C1's P2 requires 8 distinct finding ids while the committed controls exercise 6, and the new suite prints no `VERDICT: FAIL` (so `gate-mutants` would read it unkillable).

## Evidence

(1) Read-only throughout; no lane file outside my build dir and report path was touched. Frozen surfaces are the
bytes I describe (worktree == frozen blob):

```
$ for f in scripts/report-receipt-diff.mjs scripts/jj-seat-demo.sh; do echo -n "$f worktree=$(git hash-object $f) frozen="; git rev-parse dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef:$f; done
scripts/report-receipt-diff.mjs worktree=5ad73c376151b17ab56024a55338b1d0c4b2ca49 frozen=5ad73c376151b17ab56024a55338b1d0c4b2ca49
scripts/jj-seat-demo.sh worktree=5798bf058a3f62114f26ce7ae72cc4fac7f2fc74 frozen=5798bf058a3f62114f26ce7ae72cc4fac7f2fc74
```

(2) Frozen receipts I quote in the LOG draft (not re-run by me — a scribe does not decorate):

```
base/report-receipt-diff-selftest-freeze.txt: REPORT_RECEIPT_SELFTEST: PASS (20/20)
base/jj-seat-demo-freeze.txt: 15 JJ_SEAT lines (rewrite_seat_head_seat_state=fresh, abandon_seat_head_seat_state=stale, abandon_seat_head_files_on_disk=kept, update_stale_recovers=yes) + JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
base/receipt64-base.txt: RECEIPT64_UNMET held=0/5 checks=5 rev=6825a51425e91908f019ed65aa2f4209acbd7087 rule=R64 | P1 MISS tool-absent | P2 MISS tool-absent | P3 MISS tool-absent | P4 MISS tool-absent | P5 MISS report-not-given   / exit=1
base/jj64-base.txt: JJ64_UNMET held=0/8 checks=8 rev=6825a51425e91908f019ed65aa2f4209acbd7087 rule=J64 | J1 MISS entry-absent … / exit=1
base/jj64-donothing.txt: JJ64_UNMET held=1/8 checks=8 rev=213cfac447103250cdb9f1e768357f95c0f0f405 rule=J64 | J1 MISS … | J7 MISS census-exit=0 province-names-entry=true readme-map-clean=false / exit=0
base/proxy-before.txt: PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=153 computed=154 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669) / exit=1
base/readme-map-before.txt: README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md / exit=1
base/census-before.txt: 6 × W04, EXIT=0, rows=136
```

(3) The frozen checklist grammar (`scripts/surface-probe.mjs:278`) applied to the live file:

```
$ node -e 'const RE=/^\s*- \[ \] (?<label>.+?) — `(?<cmd>[^`]+)` → exit (?<exits>[0-9]+(?:\|[0-9]+)*) \+ `(?<expect>[^`]+)`$/u; …'
MALFORMED SKILL.md:727 :: - [ ] Round dispatch-evidence gate (round 60; contract `kumitate-dispatch-evidence-v1`) — `node scripts/dispatch-evidenc
task-lines=30 malformed=1
```

(4) My three candidate bullets against the same regex (`/tmp/kumitate-r64/K64ScribeLogSkill/grammar-check.mjs`):

```
MATCH exits=0 expect=DISPATCH_EVIDENCE_SELFTEST: PASS cmd=node scripts/dispatch-evidence.mjs --selftest
MATCH exits=0 expect=REPORT_RECEIPT_SELFTEST: PASS cmd=node scripts/report-receipt-diff.mjs --selftest
MATCH exits=0 expect=JJ_SEAT_DEMO: DONE cmd=bash scripts/jj-seat-demo.sh
```

(5) Distinct finding ids the 16 committed controls exercise (`expect` line 2 of each case):

```
c0,c14,c15 → CLEAN/0 · c1,c2,c3,c13,c12 → PLACEHOLDER · c4,c5,c6,c12 → TALLY_UNRECEIPTED
c7 → RECEIPT_MISSING · c8,c9 → SECTION_MISSING · c9,c10 → SHONEN_COUNT · c11 → HASH_DEAD
distinct = {PLACEHOLDER, TALLY_UNRECEIPTED, RECEIPT_MISSING, SECTION_MISSING, SHONEN_COUNT, HASH_DEAD} = 6
HASH_ORPHAN: no case.   $ ls .ufo/waves/round-64/controls/receipt | wc -l → 16
```

(6) Neither new surface is reachable from the tree yet:

```
$ grep -n 'report-receipt-diff\|jj-seat-demo\|jj-workspace-seat-containment' SKILL.md PROVINCE.md README.md corpus/README.md
(no output, exit 1)
```

## Findings

**K64ScribeLogSkill-1 — HIGH — SKILL.md's round-60 checklist item never runs.** `SKILL.md:727` carries two
backticked commands and a trailing clause; the frozen v1 grammar takes exactly one command per line and nothing
after the `expect` backticks, so `surface-probe.mjs --checklists` prints `CHECKLIST  ERROR  SKILL.md:727 grammar
(…)` plus a `CHECKLIST_GRAMMAR` error finding and round 60's gate was never executed by the checklist the lane
publishes. Every new item inherits the trap: a two-command item silently loses the whole item. Repro: Evidence
block 3 (`task-lines=30 malformed=1`). Fix drafted in `checklist-item.md` §1.

**K64ScribeLogSkill-2 — HIGH — C1's frozen P2 cannot read HELD against its own control set.**
`receipt64-probe.mjs:61` requires `seen.size >= 8` distinct ids; the 16 committed cases exercise 6, and a
`HASH_ORPHAN` case cannot be built in the frozen case shape — every `controls/receipt/*/lane/` is a plain
directory, so `git -C <lane> rev-parse HEAD` fails, the tip is empty and every 40-hex reads `HASH_DEAD`; an orphan
arm needs a real git fixture with a side-branch commit. The claim can still land honestly (the plan's ratchet
permits added controls and keeps P2's floor at 14), but the L1 must add ≥2 id-exercising cases or P2 reads
`P2 MISS ids=6`. Repro: Evidence block 5 + `grep -n 'seen.size < 8' .ufo/waves/round-64/probe/receipt64-probe.mjs`
→ `61`. Not patched (frozen counter).

**K64ScribeLogSkill-3 — MEDIUM — the new suite is invisible to `gate-mutants`.** `report-receipt-diff.mjs:153-154`
prints `REPORT_RECEIPT_SELFTEST: PASS|FAIL (n/m)` and exits 0/1 with no `VERDICT:` line; under K43 a mutant dies
only on a numeric non-zero exit **with** a line exactly `VERDICT: FAIL`, so every mutant of this suite would read
`survived`/`crash` and adding it to the frozen manifest would fail the battery. Either the suite gains the line
(a tool strengthening, allowed) or the row keeps saying it is inadmissible — mine does. Repro: `grep -n
'REPORT_RECEIPT_SELFTEST\|VERDICT' scripts/report-receipt-diff.mjs` → only `112`, `153`.

**K64ScribeLogSkill-4 — MEDIUM — the checklist's count sentence is stale by four items.** `SKILL.md:680-682`
says "Twenty-six items (round 56 …)" while the list carries 30 bullets: items 27–30 landed in rounds 57–60
without touching it. Repro: `awk 'NR>=680 && /^- \[ \]/{n++} END{print n}' SKILL.md` → `30`. Fix drafted in
`checklist-item.md` §4.

**K64ScribeLogSkill-5 — LOW — plan §C2's exit token contradicts its committed receipt.** The plan says the
do-nothing control reads "exit 1 (`base/jj64-donothing.txt`)"; the receipt's last line reads `exit=0` because
`jj-donothing-control.sh:19` runs `node "$PROBE" … || true` and the captured status is the wrapper's. The verdict
line (`held=1/8`, J8 the only pass) matches the plan; only the exit token does not. Frozen — reported, not
patched; the LOG draft quotes the verdict line only. Repro: `tail -1 …/base/jj64-donothing.txt` and `sed -n 19p
…/probe/jj-donothing-control.sh`.

**K64ScribeLogSkill-6 — LOW — the two new surfaces are undocumented in the tree** (Evidence block 6). Until the
L1 integrates `skill-rows.md` an agent cannot discover the diff gate or the demo, and C2's J7 needs the PROVINCE
line plus the README map row. Outside my write scope by design.

## Artifacts

- `.ufo/waves/round-64/build/K64ScribeLogSkill/log-entry.md` — the append-only round-64 LOG bullet (both claims,
  both counters, frozen rev `dd1a3e6f…`, 16 controls, the jj seat-containment assimilation theme, considerthese
  idea 2, the R56-V3 tenth recurrence as the mistake mined, Q60 as its fix, the honest limits) + a 10-row
  `@@TOKEN@@` fill table + a "do not write" list (no unprinted outcome, no seat count read from a payload).
- `.ufo/waves/round-64/build/K64ScribeLogSkill/skill-rows.md` — the two registry rows verbatim (findings, exit
  maps, selftest, controls, pinned values, limits, scope), the two intro-sentence patches (`Twenty-two are gates`
  → twenty-three; the verdict-map sentence; `jj-seat-demo` a demo, not a gate; 27 rows = 23 gates + probe +
  runner + helper + demo), a decision table per tool (report-receipt-diff: before filing every round report,
  after `close/` exists, never on a seat report, after a tool change, on a ratchet lie; jj-seat-demo: on a jj
  release, the entry `diff`, the counter, exit 2 is not a pass), and the control-addition recipe with the
  `HASH_ORPHAN` git-fixture caveat.
- `.ufo/waves/round-64/build/K64ScribeLogSkill/checklist-item.md` — items **31** and **32** (grammar-tested), the
  `SKILL.md:727` repair, the header-count repair, and the two round-scoped real-run commands that cannot be
  bullets.
- `/tmp/kumitate-r64/K64ScribeLogSkill/grammar-check.mjs` — scratch regex harness (evidence 4).

## Limits

- I ran no counter and no demo: every close-dependent number in the LOG draft is a `@@TOKEN@@`; the only measured
  values quoted are the frozen receipts above. The plan's P3/P5 data path (fleet blobs `7b0581ed`/`8fd46e61`) is
  stated as the plan declares it, not re-read.
- `surface-probe.mjs --checklists` was not run (it would execute all 30 items, several needing host state); the
  grammar verdict comes from the regex test, which is the same regex the runner compiles. The repair is a
  proposal, not an applied edit.
- Not checked: whether `PROVINCE.md`/`corpus/README.md` gain their rows for C2's entry, and whether `readme-map`
  needs a new `covered` pin for it (L1 scope). Tool installs/updates: none.
