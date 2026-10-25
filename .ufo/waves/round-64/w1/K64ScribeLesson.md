VERDICT: Drafted the round-64 lesson body (two `## Mistakes` rows, five commands under `## What round 64 changes`, five carried items) with every figure reproduced from a committed receipt or a command I ran in `git archive`; the drafting turned up one new calibration defect (the freeze commit itself adds two unreceipted `proxy-check` arms) and one confirmation of the C1 stated limit.

## Evidence

Base/freeze facts (lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, `HEAD` = `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`, "round-64: freeze plan, counters R64/J64, controls, base receipts, report-receipt-diff v1, jj-seat-demo"):

```
$ cat .ufo/waves/round-64/base/readme-map-before.txt
README_MAP: note unpinned:lessons/round-63-verifier-spotcheck.md
README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md
exit=1
$ cd /tmp/kumitate-r64/K64ScribeLesson/arch-dd1a3e6f && node scripts/readme-map.mjs   # git archive dd1a3e6f | tar -x
README_MAP: note unpinned:lessons/round-63-verifier-spotcheck.md
README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md
map_exit=1
```

```
$ node scripts/report-receipt-diff.mjs --selftest      # in the same archive
REPORT_RECEIPT_SELFTEST: PASS (20/20)
selftest_exit=0
$ ls .ufo/waves/round-64/controls/receipt/ | wc -l
16
```

```
$ node scripts/proxy-check.mjs                          # archive of base 6825a514
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=153 computed=154 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)
proxy_exit=1
$ node scripts/proxy-check.mjs                          # archive of freeze dd1a3e6f
PROXY: DRIFT (A_DRIFT term=A declared=257 computed=263 delta=+6; C2_TOTAL_DRIFT term=C2_total declared=153 computed=154 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/report-receipt-diff.mjs; src-rev=31c465f15669)
proxy_exit=1
$ git diff --name-only 6825a514 dd1a3e6f | grep -cE '\.(mjs|js|sh|py)$'
6            # report-receipt-diff.mjs, jj-seat-demo.sh, probe/{jj64-probe,receipt64-probe,make-receipt-controls}.mjs, probe/jj-donothing-control.sh
```

```
$ bash scripts/jj-seat-demo.sh                          # 15 JJ_SEAT keys
JJ_SEAT: abandon_seat_head_seat_state=stale … JJ_SEAT: seat_dir_after_forget=present
JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
demo_exit=0                                             # equals base/jj-seat-demo-freeze.txt key for key
```

```
$ node scripts/inline-dispatch-evidence.mjs --selftest   # in the archive of dd1a3e6f
INLINE_DISPATCH_SELFTEST: PASS (69/69)
exit=0
$ grep -rln "SELFTEST: PASS" .ufo/waves/round-63/close/          # → no files
$ grep -o "INLINE_DISPATCH_SELFTEST: PASS ([0-9]*/[0-9]*)" .ufo/waves/round-63/build/K63SimplifyTool/selftest-original.txt
PASS (25/25)                                            # the only committed round-63 selftest transcript
$ grep -o "PASS (69/69)" SCORECARD.md SKILL.md
SCORECARD.md:PASS (69/69)
SKILL.md:PASS (69/69)
$ git -C /home/vgpnk/Projects/shokunin show 8fd46e61:.ufo/reports/round-63/kumitate.md | sed -n '76p'   # "(69/69)" in prose
```

D3 (host-record only):
```
$ find /home/vgpnk/.omp/agent/sessions -maxdepth 3 -name 'K63R2*-2.jsonl' | sed 's#.*/##' | sort
K63R2ConnRoutedDefects-2.jsonl
K63R2ScoutHostRecords-2.jsonl
K63R2ScoutLeftovers-2.jsonl
$ ls .ufo/waves/round-63/w2 | grep -c -- '-2'      → 0
$ grep -o '"\(name\|seat\)": *"[^"]*"' .ufo/waves/round-63/w2-results.json | grep -- '-2'   → no match
```

C1 tally-arm blindness (`/tmp/kumitate-r64/K64ScribeLesson/tally-blind.mjs`, imports the tool's `diffReport`):
```
[]                                                       # body carrying "PASS (69/69)"
[{"id":"TALLY_UNRECEIPTED","detail":"INLINE63_HELD held=69/69"}]   # same body, labelled tally
```

Carried items re-verified: `git -C <lane> cat-file -t 9237a72` → `fatal: Not a valid object name 9237a72` exit 128; fleet `git -C /home/vgpnk/Projects/shokunin cat-file -t 9237a72` → same, exit 128; `base/census-before.txt` → six W04 (S034/S068/S084/S095/S123/S126) then `ok … EXIT=0`; `grep -c Audit19 .ufo/waves/round-64/w1-spec.json` → 1 (this seat's own prompt); `grep -c 'dispatch61\|doctrine61' .ufo/waves/round-64/plan.md` → 0; `grep -oE '^\- \*\*Q[0-9]+' corpus/QUALITY.md | tail -1` → `Q59`; `grep -c readme-map scripts/plan-before-ready.sh` → 0.

Seat artifacts read (not re-executed): `build/K64ExecReadmeGuard/receipts/{01,03,07}-*.txt` (01 base exit 1; 03 patched gate `FAIL … reason=MAP_DRIFT`, unpatched `NA … reason=NO_MARKER` exit 2; 07 lane at `dd1a3e6f`: round 64 `FAIL MAP_DRIFT map_first=uncovered:lessons/round-63-verifier-spotcheck.md`, round 63 `FAIL MAP_DRIFT map_first=uncovered:lessons/round-62-verifier-spotcheck.md`, lane gate round 63 `PASS`); `build/K64ExecSelftestTranscripts/transcripts[-frozen]/inline-dispatch-evidence.mjs.txt` (26 each, both end `PASS (69/69)`), `observed.tsv:13,38`, `calibration.tsv:12,26` (`MATCH`).

## Findings

1. **K64ScribeLesson-1 — medium — the plan's maintenance list undercounts the freeze's own drift.** `base/proxy-before.txt` was measured at `6825a514` and records two errors; the freeze commit `dd1a3e6f` adds six runnable files, so the same gate reads four errors there (`A_DRIFT declared=257 computed=263 delta=+6`, `PIN_UNPINNED scripts/report-receipt-diff.mjs`). A tip repair that only fixes `C2_TOTAL_DRIFT`/`AXES_DRIFT` leaves `proxy-check` red. Repro: `git -C <lane> archive dd1a3e6f | tar -x -C $T && cd $T && node scripts/proxy-check.mjs` → the four-error line above, exit 1. Attacks: the plan §Census/maintenance claim that the base state's live defects are exactly the two receipted ones.
2. **K64ScribeLesson-2 — low — D3's collision count is receipted nowhere the tool can read.** The round-63 report says one `-2` stem (`8fd46e61:28`); the host session store holds exactly three; committed lane bytes hold zero. So neither count is checkable from `git archive`, and `report-receipt-diff` (which reads `.ufo/waves/round-N/{base,close}/*` only) structurally cannot catch this class. Repro: the three commands under "D3 (host-record only)" above. The lesson carries this as a note, not a third row, and the row-2 limit names it.
3. **K64ScribeLesson-3 — info, confirms the declared limit — the tally arm cannot see an unlabelled tally.** `PASS (69/69)` produces no finding; `INLINE63_HELD held=69/69` produces `TALLY_UNRECEIPTED`; the arm's regex is `\b([A-Z][A-Z0-9]*_(?:HELD|UNMET))\s+held=(\d+)/(\d+)` (`scripts/report-receipt-diff.mjs:22`). Consequence for the lesson: D2's fix must be a transcript, never a tool change. Repro: `node /tmp/kumitate-r64/K64ScribeLesson/tally-blind.mjs`.
4. **K64ScribeLesson-4 — info for the L1 — Q60 would have refused round 63's plan.** Guard receipt `07-lane-round64-round63.txt` shows the patched gate failing round 63 with `map_first=uncovered:lessons/round-62-verifier-spotcheck.md` at plan commit `b38a2065`, while the committed lane gate reads that round `PASS`. The tenth recurrence was visible at plan time, not only at close — worth one sentence in the L1's Q60 text.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ScribeLesson/round-64.md` — the lesson body draft (31 lines; no `## Gate`).
- `/tmp/kumitate-r64/K64ScribeLesson/tally-blind.mjs` — the tally-blindness experiment.
- `/tmp/kumitate-r64/K64ScribeLesson/arch-base`, `arch-dd1a3e6f`, `arch-nodiff` — scratch `git archive` trees used for the clean measurements.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/w1/K64ScribeLesson.md` — this report.

## Limits

- I did not run either frozen counter (`receipt64-probe.mjs`, `jj64-probe.mjs`) at any revision; their `held=` lines in the draft are the plan's predicates and the committed base receipts, labelled as such, never my measurements.
- I did not re-execute the guard, transcript or proxy-repair seat artifacts; I read their receipt text only. The draft marks them "read by me, not re-executed" and leaves integration to the L1.
- "Tenth recurrence" is the round-63 spot-check's own ordinal (`corpus/lessons/round-63-verifier-spotcheck.md:87`); I did not re-derive the series.
- No integration: `scripts/`, `corpus/`, `SCORECARD.md`, `QUALITY.md`, `PROVINCE.md` untouched by me; no lane git/jj mutation; no tool installed or upgraded.
- Not checked: whether `report-receipt-diff`'s `HASH_DEAD` arm would flag the round-64 report's own hashes, and whether the round-64 report will satisfy P5 — both are post-integration facts.
