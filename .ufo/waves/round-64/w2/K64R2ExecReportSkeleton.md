VERDICT: A round-64 report skeleton exists that reads `REPORT_RECEIPT: CLEAN` exit 0 at `2ed8a5f8` in both `--rev` and worktree mode and makes the frozen counter print `RECEIPT64_HELD held=5/5` — but the same result proves P5 accepts a report whose every measurement is `UNMEASURED`, and `proxy-check` is still DRIFT at the integrated tree.

## Evidence

All commands run from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`; nothing under `scripts/`, `corpus/`, `.ufo/pins/`, `base/`, `close/`, `probe/` or `controls/` was written.

1. Skeleton reads clean, both modes:
```
$ node scripts/report-receipt-diff.mjs --lane . --round 64 --report .ufo/waves/round-64/build/K64R2ExecReportSkeleton/report-skeleton.md --rev 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
REPORT_RECEIPT: CLEAN (round=64 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 bytes=14870)
EXIT=0
$ node scripts/report-receipt-diff.mjs --lane . --round 64 --report .ufo/waves/round-64/build/K64R2ExecReportSkeleton/report-skeleton.md
REPORT_RECEIPT: CLEAN (round=64 rev=worktree bytes=14870)
EXIT=0
```
2. The frozen counter's P5 is satisfied by that skeleton:
```
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 --report .ufo/waves/round-64/build/K64R2ExecReportSkeleton/report-skeleton.md
RECEIPT64_HELD held=5/5 checks=5 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=R64
EXIT=0
```
   Without a report the same counter reads `RECEIPT64_UNMET held=4/5 checks=5 … P5 MISS exit=1` (P5 MISS is the only unmet check; `.ufo/reports/round-64/` does not exist).
3. C2 and the tool at the integrated tree (read by this seat, not receipted): `node .ufo/waves/round-64/probe/jj64-probe.mjs … 2ed8a5f8…` → `JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64` exit 0; `node scripts/report-receipt-diff.mjs --selftest` → `REPORT_RECEIPT_SELFTEST: PASS (52/52)` exit 0.
4. Harm check, base receipt vs `git archive 2ed8a5f8…` (extracted under `/tmp`, since deleted):
```
worktree:  PROXY: DRIFT (A_DRIFT term=A declared=257 computed=1294 delta=+1037; C2_DRIFT …+3; C2_TOTAL_DRIFT …+3; GATE_PIN_DRIFT term=pin.plan-before-ready …; PIN_UNPINNED term=scripts/report-receipt-diff.mjs; src-rev=31c465f15669)
archive:   PROXY: DRIFT (A_DRIFT term=A declared=257 computed=514  delta=+257; C2_DRIFT …+3; C2_TOTAL_DRIFT …+3; GATE_PIN_DRIFT term=pin.plan-before-ready …; PIN_UNPINNED term=scripts/report-receipt-diff.mjs; src-rev=31c465f15669)
archive:   README_MAP: CLEAN files=156 rows=156 covered=156                exit 0
archive:   SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19 entries_with_source=21 legacy=38)  exit 0
base:      README_MAP: DRIFT files=154 rows=153 covered=153 bad=2           (base/readme-map-before.txt)
base:      SOURCES_CHECK: CLEAN (rows=136 tiers=A:113,B:15,C:8 …)           (base/sources-check-before.txt)
```
5. Ten gotcha cases run against copies of the skeleton in `/tmp` (`REPORT_RECEIPT:` verdicts): dead jj build hash → `HASH_DEAD 7c41cdeb…`; verbatim `jj64-donothing` line → `HASH_DEAD 213cfac4…`; `RECEIPT64_UNMET held=4/5 checks=5` → `TALLY_UNRECEIPTED`; `…/close/receipt64-at-tip.txt` → `RECEIPT_MISSING`; `…/close/` → `RECEIPT_MISSING (no receipt under it)`; fenced `RECEIPT64_HELD held=5/5` → `TALLY_UNRECEIPTED`; `### SHONEN notes` → `SHONEN_COUNT headings=2`; plan target `RECEIPT64_HELD held=5/5` → `TALLY_UNRECEIPTED`; `checks=6` against a `checks=5` receipt → `TALLY_CHECKS_MISMATCH`; tally + another receipt on the same line → `TALLY_UNRECEIPTED`. Clean by contrast: 39-hex live abbreviation, `…/base/` directory citation, trailing `;` after a receipt path, `held = 0 / 5` spaced, uncited tally carried by any receipt.
6. `git ls-tree -r 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 -- .ufo/waves/round-64/close` prints nothing: nine base receipts, no close receipt.
7. Misroot sweep `git -C /home/vgpnk/Projects/shokunin status --porcelain`: no round-64 file at the fleet root (modified `.ufo/state/*`, `.scratch/goal-20261025-hyaku-run7.md`, `.ufo/watchdog.log`, untracked `.ufo/waves/round-30/`, `.ufo/waves/round-41/w1/ExecQuarantineSlice.md` — other lanes'/orchestrator-owned, untouched).

## Findings

1. **K64R2ExecReportSkeleton-1 — medium — P5 accepts a report with no measurement in it.** The skeleton's 22 `UNMEASURED` markers are exactly the values the report must state; P5 reads only `REPORT_RECEIPT: CLEAN`, so C1 reaches `held=5/5` without any before/after number being receipted. It attacks C1's P5 as a quality gate, not its truthfulness (the tool's declared limit is "only labelled tallies are checked"). Repro: evidence 2. Phrasing that would close it (an L1 decision, a strengthening): require the report to cite at least one receipt of this round's close directory, e.g. a `RECEIPT_MISSING` arm on a close receipt the report names, or a `--require-close-receipt` flag — **not** landed here, it is a rule change.
2. **K64R2ExecReportSkeleton-2 — medium — `proxy-check` is DRIFT at the integrated tree, and a worktree measurement misreports it by +780.** The plan's maintenance clause ("`proxy-check` DRIFT at base must read clean at the tip") is unmet at `2ed8a5f8`: `A_DRIFT declared=257 computed=514`, `C2`/`C2_TOTAL` `+3`, `GATE_PIN_DRIFT pin.plan-before-ready`, `PIN_UNPINNED scripts/report-receipt-diff.mjs`. `A` counts every runnable file under `--self`, so the dirty worktree adds wave build artifacts (`computed=1294`). Repro: evidence 4 (extract with `git archive 2ed8a5f8… | tar -x -C /tmp/x`, then `node scripts/proxy-check.mjs` inside it). The report must state the archive number, never the worktree one.
3. **K64R2ExecReportSkeleton-3 — low — the honest "after" values cannot be receipted yet, and the obvious citation reads RECEIPT_MISSING.** No close receipt exists at `2ed8a5f8` (evidence 6), so `RECEIPT64_UNMET held=4/5`, `JJ64_HELD held=8/8` and any `.ufo/waves/round-64/close/<file>` path read `TALLY_UNRECEIPTED`/`RECEIPT_MISSING`. The skeleton therefore carries bare counts ("4 of 5 checks", "8 of 8 checks") and names future receipts without the round prefix. Repro: append `The counter reads ` + backticked `RECEIPT64_UNMET held=4/5 checks=5` to a skeleton copy, run evidence 1's command → `TALLY_UNRECEIPTED`. Fill order for the L1: commit the verdict line as a close receipt first, then paste the labelled line with that path on the same line.
4. **K64R2ExecReportSkeleton-4 — low — quoting a receipt verbatim can import a dead hash.** `base/jj-seat-demo-freeze.txt` carries the 40-hex jj build hash and `base/jj64-donothing.txt` a sandbox-clone `rev=`; both read `HASH_DEAD` (the plan declares "HASH_DEAD cannot resolve a hash of an external repository" as a limit). Repro: evidence 5, first two cases. Phrasing that avoids it: quote the tally and the path, never the `jj=`/`rev=` tail.
5. **K64R2ExecReportSkeleton-5 — low — the wave facts say "PROVINCE/README" but `README.md` names neither the entry nor jj.** `grep -n 'jj' README.md` is empty; `PROVINCE.md:21` does name `corpus/knowledge/jj-workspace-seat-containment.md`. J7 asks only for `PROVINCE.md`, so no claim fails; the landed-changes sentence must not claim a README row. Repro: `grep -n 'jj\|round 64' README.md`.
6. **K64R2ExecReportSkeleton-6 — low — the most likely drift while filling: the tally/receipt scope trap.** A line carrying a correct tally but citing a receipt that does not carry it reads `TALLY_UNRECEIPTED` (evidence 5, last case); the same tally with no receipt cited reads CLEAN. Repro: append ``Before: `RECEIPT64_UNMET held=0/5 checks=5` (`.ufo/waves/round-64/base/jj64-base.txt`).`` to a copy. Phrasing: one tally per line, its own receipt on that line.

## Artifacts

- `.ufo/waves/round-64/build/K64R2ExecReportSkeleton/report-skeleton.md` — the deliverable: 97 lines, six required sections in order, declared claims first with a counting command and commit per claim, `UNMEASURED` for every unfilled value (22), a `### UNMEASURED — what fills each` list per section, SOURCES line, Stale-lane + tool-install + misroot-sweep paragraph, four `[~]` SHONEN boxes with pointers. Reads CLEAN in both modes (evidence 1) and satisfies P5 (evidence 2).
- `.ufo/waves/round-64/build/K64R2ExecReportSkeleton/gotchas.md` — nine classes of tool trap with the exact avoiding phrasing and a self-contained reproducing command each.
- `.ufo/waves/round-64/build/K64R2ExecReportSkeleton/census-now.txt` — the worktree census run (six W04 warnings, `kumitate ok`, exit 0).
- No `.mjs/.js/.sh/.py` file was added under the build directory; the `/tmp` archive extraction and all gotcha copies were deleted.

## Limits

- I judged no wave-2 content: every "after" number in the skeleton is `UNMEASURED` or a bare count, and no seat count, role mix or answerer mix is measured.
- J1-J8 and P1-P4 were read only through the frozen counters' own output; I did not re-derive J3 pins, J4 quote locations or J5 live fetches, and did not run `bash scripts/jj-seat-demo.sh` (21-key claim unverified by me).
- I did not run `node scripts/counter-pins.mjs`, `gate-mutants`, `kimi-census`, `anchor-truth`, `cite-check`, `surface-probe` or `omp-census`; the skeleton lists them as fill items.
- Findings 1 and 3 propose phrasing and fill order only; finding 1's rule change is left to the L1 and is not landed.
- No tool was installed or upgraded (node v24.21.0, jj 0.45.1, git 2.56.0 pre-existing; no pacman, uv or npx use).
