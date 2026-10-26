VERDICT: All four wave-1 `K64ScribeScorecard`/`K64ScribeLogSkill` drafts are stale against integrated commit `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` (v1 contracts, 20/20 selftest, 16 controls/6 ids, 15 demo keys, false `A=867` freeze attribution, pre-claimed `RECEIPT64_HELD held=5/5` in the capabilities row, and 4 new `cite-check` `UNRESOLVED` errors in `SKILL.md`), and `K64ScribeErratum/erratum.md` Part A introduces 6 `UNRESOLVED` errors + 2 `ORPHAN_REF` warnings in `cite-check.mjs` from bare filenames.

## Evidence

Commands run from `/home/vgpnk/Projects/shokunin/kumitate-shokunin` at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`:

```
$ wc -l SCORECARD.md SKILL.md LOG.md PROVINCE.md corpus/lessons/round-63.md corpus/QUALITY.md
  2971 SCORECARD.md   923 SKILL.md   2304 LOG.md   29 PROVINCE.md   61 corpus/lessons/round-63.md   1064 corpus/QUALITY.md
$ node scripts/report-receipt-diff.mjs --selftest | tail -n 1
REPORT_RECEIPT_SELFTEST: PASS (52/52)
$ bash scripts/jj-seat-demo.sh | grep -c '^JJ_SEAT: '; bash scripts/jj-seat-demo.sh | tail -n 1
21
JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
$ ls -d .ufo/waves/round-64/controls/receipt/*/ | wc -l
37
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8; echo "exit=$?"
RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=R64 | P5 MISS report-not-given
exit=1
$ node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8; echo "exit=$?"
JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64
exit=0
$ bash scripts/plan-before-ready.sh --round 64 | head -n 1; PBR_MAP_FROM=0 bash scripts/plan-before-ready.sh --round 64 | head -n 1
PLAN_BEFORE_READY: PASS rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 round=64 dir=.ufo/waves/round-64 plan=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef plan_ct=1792967888 marker=d92cf1fff3026087a0e21a3183b97de169c6f22c marker_kind=ready marker_ct=1792970647 marker_path=.ufo/waves/round-64/w1.ready map=SKIP reason=MAP_PRE_EPOCH_ROUND
PLAN_BEFORE_READY: FAIL rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 round=64 dir=.ufo/waves/round-64 reason=MAP_DRIFT plan=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef plan_ct=1792967888 marker=d92cf1fff3026087a0e21a3183b97de169c6f22c marker_kind=ready marker_ct=1792970647 marker_path=.ufo/waves/round-64/w1.ready map=DRIFT map_exit=1 map_first=uncovered:lessons/round-63-verifier-spotcheck.md
$ T=$(mktemp -d) && git archive dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef | tar -x -C "$T" && node "$T/scripts/proxy-check.mjs" --self "$T" | head -n 1 && rm -rf "$T"
PROXY  error  A_DRIFT  A: declared=257 computed=263 delta=+6
$ node scripts/sources-check.mjs | tail -n 1
SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19 entries_with_source=21 legacy=38)
```

## Findings

1. **K64R2ReviewDrafts-1 (high — attacks `scorecard-r64.md`, `log-entry.md`, `skill-rows.md`, `checklist-item.md` contract/count accuracy).** All four files describe the freeze-time v1 surfaces instead of integrated `2ed8a5f8`:
   - `scripts/report-receipt-diff.mjs` is now contract `kumitate-report-receipt-diff-v2` (not `v1`), defines **9** finding ids (`PLACEHOLDER`, `TALLY_UNRECEIPTED`, `TALLY_CHECKS_MISMATCH`, `RECEIPT_MISSING`, `RECEIPT_EMPTY`, `HASH_DEAD`, `HASH_ORPHAN`, `SECTION_MISSING`, `SHONEN_COUNT` — `add(` sites at `:74-166`, not `:10-23,50-94` cited in `scorecard-r64.md:39`), passes `REPORT_RECEIPT_SELFTEST: PASS (52/52)` (not `20/20`), and `.ufo/waves/round-64/controls/receipt/` holds **37** cases (3 `CLEAN`, 34 `DRIFT`, 8 distinct ids exercised, resolving P2's `>= 8` floor so `receipt64-probe.mjs` at `2ed8a5f8` reads `held=4/5`, missing only P5 `--report`).
   - `scripts/jj-seat-demo.sh` is now contract `kumitate-jj-seat-demo-v2` (not `v1`), prints **21** `JJ_SEAT:` keys (not 15), changes `seat_snapshot_in_shared_op_log` from `2` to `1` (`:71`, seat-attributed delta), adds 6 keys (`ignore_working_copy_hides_pending=yes`, `rewrite_treechange_seat_state=stale`, `abandon_empty_seat_state=fresh`, `update_stale_abandoned_seat_file=deleted-no-recovery-commit`, `cross_abandon_both_fresh_after_status=yes`, `forget_seat_commit_in_all=yes`), and proves staleness follows tree identity (`rewrite_treechange_seat_state=stale` refutes `scorecard-r64.md:72`'s unqualified "rewriting it leaves the seat `fresh`").
   - `PROVINCE.md:21` was already updated at `d92cf1ff`, so `scorecard-r64.md:94-95`'s claim that `PROVINCE.md:21` "currently ends '...jj workspaces are not demonstrated'" is stale.
   - `scripts/plan-before-ready.sh` gained the Q60 `readme-map` arm (`PBR_MAP_FROM` default 65, selftest `18/18`, not `10/10` in `SKILL.md:628`), and `.ufo/waves/round-64/w1.ready` is committed, so `--round 64` at `2ed8a5f8` reads `PASS ... map=SKIP reason=MAP_PRE_EPOCH_ROUND` exit 0 (not `NA ... NO_MARKER` exit 2 as `scorecard-r64.md:132-134` states) and `FAIL ... reason=MAP_DRIFT` exit 1 under `PBR_MAP_FROM=0`. Repro: commands in Evidence.

2. **K64R2ReviewDrafts-2 (high — attacks `scorecard-r64.md:112-117` false freeze attribution and `GATE_PINS` omission).** `scorecard-r64.md:113-116` claims `node scripts/proxy-check.mjs` "At the freeze rev" (`dd1a3e6`) printed `A_DRIFT A: declared=257 computed=867 delta=+610` and `616 of the 875 are round-64 wave files`. That was the live dirty worktree mid-wave-1, **not** commit `dd1a3e6`: in `git archive dd1a3e6f`, `proxy-check.mjs` prints `A: declared=257 computed=263 delta=+6` (the 6 scripts added at freeze). And at `2ed8a5f8`, `proxy-check.mjs` prints `A: declared=257 computed=514 delta=+257` in archive (`515` in worktree), `C2_DRIFT`/`C2_TOTAL_DRIFT` (`153` vs `156`), `GATE_PIN_DRIFT pin.plan-before-ready`, and `PIN_UNPINNED scripts/report-receipt-diff.mjs` (`AXES_DRIFT` is gone). Worse, `scripts/proxy-check.mjs:461-482` (`GATE_PINS`) does not register `'pin.report-receipt-diff'`: adding that pin to `SCORECARD.md` without adding the key to `GATE_PINS` in `scripts/proxy-check.mjs` fails closed (`GATE_PIN_KEY_UNKNOWN`, exit 2). Repro: `T=$(mktemp -d) && git archive dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef | tar -x -C "$T" && node "$T/scripts/proxy-check.mjs" --self "$T"`.

3. **K64R2ReviewDrafts-3 (high — attacks `scorecard-r64.md:147,168` and `log-entry.md:47,63-65` pre-claimed verdicts, `round-gate` `## Planned` check, and wrong census command).**
   - `scorecard-r64.md:147` pre-writes `` → `RECEIPT64_HELD held=5/5 checks=5 rule=R64` (`@@C1_AFTER@@`) `` inside the `report-receipt-diff` capabilities row before P5 is measured; `log-entry.md:63-64` similarly hardcodes `RECEIPT64_HELD held=5/5` and `JJ64_HELD held=8/8` in its token shape column.
   - `scorecard-r64.md:17,168` inserts row **D** (`| 65 (planned) | ... @@R65_PLAN_FREEZE@@ ...`) into `## Move log` (`SCORECARD.md:444`), outside `## Planned` (`SCORECARD.md:523-1163`, where the highest round named is 58), and never spells `round 65` / `round-65`. `scripts/round-gate.mjs:419-430` (`plannedSection`) scans only `## Planned` for `/round[- ]?(\d+)/gi` with `n > round`, so `--round 64 --strict` fails on `SCORECARD_PLAN_MISSING`.
   - `log-entry.md:47-48` falsely cites `base/census-before.txt` for `rows=136` (that line is only in `base/sources-check-before.txt`), and `:65` names `bash scripts/sources-census.sh` to produce `the rows=… summary line` (`sources-census.sh` lives in the fleet root and prints no `rows=` line; `node scripts/sources-check.mjs` prints `rows=139 tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19`). Repro: `node scripts/round-gate.mjs --round 63 --strict`.

4. **K64R2ReviewDrafts-4 (high — attacks `skill-rows.md` and `erratum.md` under `cite-check.mjs`, plus `SKILL.md` parser analysis).**
   - **Parser analysis:** Neither `scripts/claims-check.mjs` (`:386,496-510`, which reads only `SCORECARD.md` `| S<n> |`/`| R<n> |` rows) nor `scripts/proxy-check.mjs` (`:441,506,946`, which reads `SKILL.md` only via `RE_CHECKLIST = /^\s*- \[/` for term `C`) parses `SKILL.md`'s `## Gate registry` rows. However, `scripts/cite-check.mjs` (`:313,1212`) scans `SKILL.md` and `corpus/**/*.md` for backticked tokens and grades any bare filename without a `.ufo/` prefix as a `source` citation under `--src` (`UNRESOLVED`, error).
   - **What breaks in `skill-rows.md`:** `skill-rows.md:13,14,63` backticks bare `report.md`, `jj64-probe.mjs` (twice), and `receipt64-probe.mjs`, causing **4 new `ERROR UNRESOLVED`** findings in `cite-check.mjs` (plus 2 more if draft meta-lines `:5` `checklist-item.md` and `checklist-item.md:65` `skill-rows.md` are pasted). Also, `skill-rows.md:14` puts a 21-word sentence in `jj-seat-demo`'s `kind` cell where all 25 existing rows (`SKILL.md:601-628`) use a single word (`gate`/`probe`/`runner`/`helper`).
   - **What breaks in `erratum.md`:** Appending `erratum.md` Part A (`:15-49`) to `corpus/lessons/round-63.md` causes **6 new `ERROR UNRESOLVED`** findings (`w2-results.json` ×2, `w1-dispatch.json`, `w2-dispatch.json`, `plan.md`, `w2-spec.json`) and **2 new `WARN ORPHAN_REF`** findings (`.ufo/prompts/kumitate-round-63.md:160` and `plan.md:137`) in `cite-check.mjs`. Also, `erratum.md:34,69,140-141` states `543` prompt files using lane-relative `.ufo/prompts/` (which fails with `ENOENT` in the lane); `/home/vgpnk/Projects/shokunin/.ufo/prompts/*.md` now has **548** files (0 matching `run-7`). Repro: `node scripts/cite-check.mjs --self <scratch-with-drafts> --json`.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64R2ReviewDrafts/drafts-audit.md` — full anchor table, corrected v2 text/numbers, and `cite-check`-clean replacements for all 5 drafts.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/w2/K64R2ReviewDrafts.md` — this report.

## Limits

- Did not edit `SCORECARD.md`, `SKILL.md`, `LOG.md`, `corpus/lessons/round-63.md`, or `scripts/proxy-check.mjs` (L1 integration scope).
- Did not run `surface-probe.mjs --checklists` end-to-end over all 32 items; verified checklist grammar and `cite-check.mjs` directly.
- Tool installs/updates: none.
