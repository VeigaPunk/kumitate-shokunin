VERDICT: The round-64 report body is drafted with wave-1 facts measured and every wave-2/close-dependent cell the literal word UNMEASURED; it reads `REPORT_RECEIPT: CLEAN` (exit 0) in worktree mode against the committed base receipts plus nine verbatim close receipts I generated, and DRIFT in `--rev` mode only because those close receipts are not committed yet — while writing it I found that the v2 tool never binds a *relative* receipt citation, so a report can cite a nonexistent `close/<file>` and still read CLEAN.

## Evidence

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, tip `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`, base `6825a514`, freeze `dd1a3e6f`.
Read-only in the lane: no file outside `build/K64R2ScribeReportDraft/` and this report was written; no git/jj mutation; no subagent, no job.

(1) The draft reads CLEAN, and the only rev-mode gap is the uncommitted close receipts:
```
$ C=/tmp/kumitate-r64/K64R2ScribeReportDraft/cl64; git clone -q --shared <lane> "$C"; git -C "$C" rev-parse HEAD
2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
$ cp build/K64R2ScribeReportDraft/close-drafts/*.txt "$C/.ufo/waves/round-64/close/"
$ node "$C/scripts/report-receipt-diff.mjs" --lane "$C" --round 64 --report …/report-draft.md --fleet /home/vgpnk/Projects/shokunin
REPORT_RECEIPT: CLEAN (round=64 rev=worktree bytes=20820)                                        EXIT=0
$ node "$C/scripts/report-receipt-diff.mjs" --lane "$C" --round 64 --rev 2ed8a5f8… --report …/report-draft.md --fleet …
REPORT_RECEIPT: DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED (round=64 rev=2ed8a5f8… bytes=20820)     EXIT=1
RECEIPT_MISSING .ufo/waves/round-64/close/{plan-before-ready-after,readme-map-after,receipt64-probe-at-2ed8a5f8,p3-real-reports,tool-and-controls,jj64-probe-at-2ed8a5f8,demo-after,census-after,proxy-after}.txt + close/ + close/*.txt
TALLY_UNRECEIPTED RECEIPT64_UNMET held=4/5 | TALLY_UNRECEIPTED JJ64_HELD held=8/8
```
(2) Wave-1 facts I re-measured myself (each receipt in `close-drafts/`, first line = the command):
```
receipt64-probe <lane> 2ed8a5f8… → RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f8… rule=R64 | P5 MISS report-not-given   exit=1
jj64-probe      <lane> 2ed8a5f8… → JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8… rule=J64                                      exit=0
report-receipt-diff --selftest   → REPORT_RECEIPT_SELFTEST: PASS (52/52)                                                  exit=0
controls/receipt cases=37, distinct finding ids=8 (PLACEHOLDER, TALLY_UNRECEIPTED, TALLY_CHECKS_MISMATCH, RECEIPT_MISSING, RECEIPT_EMPTY, HASH_DEAD, SECTION_MISSING, SHONEN_COUNT)
counter-pins                     → COUNTER_PINS: CLEAN pins=25                                                             exit=0
r60 as filed (fleet 7b0581ed)    → DRIFT PLACEHOLDER,TALLY_UNRECEIPTED; 6 PLACEHOLDER lines = `grep -o '__[A-Z][A-Z0-9_]*__' | wc -l` 6   exit=1
r63 as filed (fleet 8fd46e61)    → REPORT_RECEIPT: CLEAN (bytes=17479)                                                     exit=0
jj-seat-demo                     → 21 JJ_SEAT keys + JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb…                              exit=0
sources-census validate          → six W04 (S034 S068 S084 S095 S123 S126) then "kumitate ok …"                            EXIT=0
readme-map                       → README_MAP: CLEAN files=156 rows=156 covered=156                                       exit=0
plan-before-ready --round 64     → PLAN_BEFORE_READY: PASS rev=2ed8a5f8… plan=dd1a3e6f… marker=d92cf1ff… map=SKIP MAP_PRE_EPOCH_ROUND  exit=0
PBR_MAP_FROM=64 … --rev dd1a3e6f → PLAN_BEFORE_READY: FAIL … reason=MAP_DRIFT map_first=uncovered:lessons/round-63-verifier-spotcheck.md  exit=1
proxy-check on `git archive 2ed8a5f8` → PROXY: DRIFT (A_DRIFT declared=257 computed=514 delta=+257; C2_DRIFT 153→156; C2_TOTAL_DRIFT 153→156; GATE_PIN_DRIFT pin.plan-before-ready; PIN_UNPINNED scripts/report-receipt-diff.mjs)  exit=1
A: archive bb184a90=257, archive 2ed8a5f8=514; of the 257 new runnable files, 255 are under .ufo/waves/ and 2 are scripts/{report-receipt-diff.mjs,jj-seat-demo.sh}
```
(3) Round-shape inputs read from the dispatch/result files (no re-derivation of a seat's work):
```
w1: 41 seats = executor 13, scribe 8, scout 6, reviewer 5, connector 4, critic 2, sentinel 1, mutation-tester 1, simplifier 1
w2: 39 seats = executor 12, reviewer 9, scribe 5, scout 4, critic 3, mutation-tester 3, connector 2, simplifier 1
attack (reviewer+critic+mutation-tester) w1 8/41=19.5%  w2 15/39=38.5%  round 23/80=28.8%
m_flash strict (executor+scribe+simplifier) w1 22/41=53.7%  w2 18/39=46.2%  round 40/80=50.0%
w1-results.json: seats=41, 41/41 entries `output: null` + "orchestrator kernel restarted mid-wave", no status field; 41/41 report files exist
w2: 5/39 reports on disk at draft time (K64R2ConnCrossClaim, K64R2ScoutQuotesS198/S199/S200, K64R2ScoutRejects)
```
(4) The relative-citation hole, proven with a fixture in the committed control shape:
```
$ node scripts/report-receipt-diff.mjs --lane build/…/control-k21/lane --round 9 --report build/…/control-k21/report.md
REPORT_RECEIPT: CLEAN (round=9 rev=worktree bytes=296)                                        EXIT=0     # receipt cited as close/absent-tip.txt does not exist
$ node build/…/tool-relfix.mjs --lane build/…/control-k21/lane --round 9 --report build/…/control-k21/report.md
REPORT_RECEIPT: DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED (…)                                   EXIT=1
RECEIPT_MISSING .ufo/waves/round-9/close/absent-tip.txt | TALLY_UNRECEIPTED X9_UNMET held=0/3
$ node build/…/tool-relfix.mjs --selftest → PASS (52/52) exit 0; 37/37 committed controls pass under BOTH tools (identical verdicts);
  r63 CLEAN exit 0; r60 same two ids exit 1; the draft CLEAN exit 0 under the patched tool
```
(5) Sources/frontier numbers: rows 136 → 139 (`grep -cE '^\| S[0-9]{3} \|'`; base via `git show 6825a514:corpus/SOURCES.md`), tier docs 80 → 83
with community 12 / spec 9 / paper 9 / tool 3 / code 14 / own-work 9 unchanged, diff = three insertions, no row touched; entry has 21 demo keys
and 13 located quotes; `PROVINCE.md:21`, `corpus/README.md:189,287`, amendment `agent-isolation-substrates.md:301`, QUALITY `:999/:1050/:1058`.

## Findings

**K64R2ScribeReportDraft-1 — HIGH — the plan's maintenance obligation is unmet at the integrated tree, and the report cannot say otherwise.**
Attacks plan §C1/§C2 "Maintenance repairs (not claims): readme-map DRIFT and proxy-check DRIFT at base must read clean at the tip". At
`2ed8a5f8` `readme-map` is CLEAN but `proxy-check` on the archive is DRIFT with four errors, exit 1. Root cause measured: the `A` term counts
committed runnable files, and 255 of the 257 files added since the round-63 tip are wave build copies under `.ufo/waves/` (the worktree reads
A=1292 because live wave-2 seats are copying into `build/` right now). Repro:
`git archive 2ed8a5f8 | tar -x -C $T && (cd $T && node scripts/proxy-check.mjs)`; `git diff --name-only bb184a90 2ed8a5f8 | grep -E '\.(mjs|js|sh|py)$' | awk -F/ '{print $1"/"$2}' | sort | uniq -c`.

**K64R2ScribeReportDraft-2 — MEDIUM — C1's P5 is satisfiable only after a step the plan does not state, so `RECEIPT64_HELD` cannot be read at
the revision the plan measures.** P5 requires the report to read CLEAN with `--rev M`, which requires the round's `close/` receipts to be
committed at M; the counter at `2ed8a5f8` reads `held=4/5 | P5 MISS report-not-given` and the report is the last thing written. The draft names
the ordering (commit the nine close receipts, then re-run with `--report`) in `FILL-LIST.md` §1-2, and marks the final reading UNMEASURED rather
than inventing 5/5. Repro: the two commands in Evidence (1) — worktree CLEAN vs rev-mode `RECEIPT_MISSING` ×10.

**K64R2ScribeReportDraft-3 — MEDIUM — the v2 tool does not bind a relative receipt citation, so a report can cite a receipt that does not
exist and still read CLEAN** (and the same line's tally silently loses its receipt scope). This is a report-lie the tool accepts, i.e. the plan's
declared ratchet class. Fix drafted (`tool-relfix.diff`, 2 hunks) with a control case in the committed shape (`control-k21/`, expect
`1 / RECEIPT_MISSING,TALLY_UNRECEIPTED`); the shipped tool prints CLEAN exit 0 on it, the patched tool prints the expect, all 37 committed
controls and the 52-case selftest are unchanged, and both real reports keep their verdicts. Repro: Evidence (4). Not patched by me — `scripts/`
is the L1's; the case must enter `controls/receipt/` when the fix lands. **Integrated by a sibling after this report's first draft:**
`K64R2ReviewToolV2` carries the same `REL_RECEIPT` (and the same round-dir prefixing inside `cited()`) in
`build/K64R2ReviewToolV2/report-receipt-diff.v2-fixes.patch` as its finding `-7`, verified against this seat's `control-k21`
(`w2/K64R2ReviewToolV2.md:91-92` records the same repro and asks the L1 to adopt `control-k21` as control 38).

**K64R2ScribeReportDraft-4 — MEDIUM — the round cannot report a dead seat from its own wave record.** `w1-results.json` has `seats: 41` but no
`status` field: all 41 entries are `output: null` with the note "orchestrator kernel restarted mid-wave; seat output was delivered to the
orchestrator session but not retained". The draft therefore states death is established only by report existence (41/41 files) and marks wave-2
deaths UNMEASURED. Attacks the report contract's "report every seat that dies" and Q59's class. Repro:
`node -e 'const r=require("./.ufo/waves/round-64/w1-results.json"); console.log(Object.keys(r.results[0]))'` → `name, agent, output, note`.

**K64R2ScribeReportDraft-5 — LOW — the round shape misses two lines of the run-7 directive at wave granularity.** Wave-1 attack share is
19.5% (line: ≥25% per wave is stated for m_flash, attack share for the round — the round meets 28.8%), and wave-2's strict m_flash share is
46.2% against the ≥50% line the addendum states per wave. Both are in the draft's seat-accounting paragraph rather than rounded away. Repro:
the two `node -e` counts over `w1-dispatch.json`/`w2-dispatch.json` in Evidence (3).

**K64R2ScribeReportDraft-6 — LOW — three frozen-plan text defects are carried as limits, not patched.** The do-nothing receipt ends `exit=0`
(the wrapper's status) where the plan says exit 1; the plan's "16 at freeze: one honest" is three CLEAN expects; the plan cites
`base/census-before.txt` for "136 rows" but the count is printed by `base/sources-check-before.txt` (`SOURCES_CHECK: CLEAN (rows=136 …)`).
Repro: `tail -1 .ufo/waves/round-64/base/jj64-donothing.txt`; `cat .ufo/waves/round-64/controls/receipt/*/expect | grep -c CLEAN` → 3;
`tail -3 .ufo/waves/round-64/base/sources-check-before.txt`.

## Artifacts

- `.ufo/waves/round-64/build/K64R2ScribeReportDraft/report-draft.md` — the report body (187 lines, six contract sections, CLEAN).
- `.ufo/waves/round-64/build/K64R2ScribeReportDraft/FILL-LIST.md` — receipts to commit, the one line to replace after P5, the UNMEASURED cells,
  the proxy repair, the CLEAN re-check command, and the tool's authoring rules.
- `.ufo/waves/round-64/build/K64R2ScribeReportDraft/close-drafts/*.txt` (9) — verbatim command transcripts the draft cites.
- `.ufo/waves/round-64/build/K64R2ScribeReportDraft/control-k21/{lane/,report.md,expect}` — the ratchet control case.
- `.ufo/waves/round-64/build/K64R2ScribeReportDraft/tool-relfix.diff`, `tool-relfix.mjs` — the fix (1 script file added under `build/`).

## Limits

- I did not re-run either wave's seats; wave-2 is in flight (5/39 reports) and every wave-2 fact in the draft is UNMEASURED, including the
  corrections those five reports already propose (S198 char count 8602 vs 8572, three wrong S199 cells, S200's understated v0.46.0 delta,
  three wrong Gate cells).
- I did not repair `proxy-check` or re-pin anything (L1 scope); I did not verify the L1's final repair, the LOG/SCORECARD/SKILL install
  commits, the pushes, or the filing revision M.
- The `tool-relfix` proof covers the selftest, the 37 committed controls, both real reports and my draft; it does not cover a hostile relative
  citation inside a fenced block or a citation with a trailing `:` — the lookbehind only excludes path characters.
- Answering models per seat are unrecorded in both result files; I did not read the host session store.
- Tool installs/updates: none (node v24.21.0, jj 0.45.1-7c41cdeb, git 2.56.0 pre-existing; no pacman, uv or npx use).
