# kumitate — round 64

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, base `6825a51425e91908f019ed65aa2f4209acbd7087`, plan frozen at `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`, wave-1 landing `d92cf1fff3026087a0e21a3183b97de169c6f22c`, integrated tree measured at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`, final lane tip UNMEASURED.

## Work performed

**Declared claims (2, distinct axes, each frozen in the plan with a do-nothing control committed before data).** The plan predates the first `.ready` marker: `bash scripts/plan-before-ready.sh --round 64` → `PLAN_BEFORE_READY: PASS rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 round=64 dir=.ufo/waves/round-64 plan=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef plan_ct=1792967888 marker=d92cf1fff3026087a0e21a3183b97de169c6f22c marker_kind=ready marker_ct=1792970647 marker_path=.ufo/waves/round-64/w1.ready map=SKIP reason=MAP_PRE_EPOCH_ROUND`, exit 0.

- **C1 — operability, capability acquisition `report-receipt-diff`** (frozen predicate `RECEIPT64_HELD`, rule R64, checks P1..P5, `.ufo/waves/round-64/plan.md`). Surface moved: `scripts/report-receipt-diff.mjs` (contract `kumitate-report-receipt-diff-v2`; v1 committed at the freeze, v2 at `d92cf1fff3026087a0e21a3183b97de169c6f22c`). **Counting command, commit `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`:** `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 --report .ufo/reports/round-64/kumitate.md`.
- **C2 — coverage, frontier ground: jj workspaces as seat containment** (frozen predicate `JJ64_HELD`, rule J64, checks J1..J8, same plan). Surface moved: `corpus/knowledge/jj-workspace-seat-containment.md` (three `source:` rows S198/S199/S200, 13 located-quote bullets, 21 demo-outcome bullets) and `scripts/jj-seat-demo.sh` (21 distinct outcome keys emitted by 23 `kv` calls). **Counting command, commit `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`:** `node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`.

**Work items (evidence pointers):**
- Freeze `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`: plan, both counters, both control generators, 16 receipt controls, nine base receipts, counter pins.
- Wave 1: tool v1 → v2 (selftest 20 → 52 cases), `controls/receipt/` 16 → 37 cases, `jj-seat-demo.sh` 15 → 21 keys, `plan-before-ready.sh` readme-map arm (`PBR_MAP_FROM` default 65), rows S198-S200 with captures, the entry, the `Amendment 2026-10-25` section of `agent-isolation-substrates.md`, the lesson, Q60/Q61/Q51-C1.
- Wave 2: the tree above is falsified by the wave-2 seats; the findings that survive are appended here by the L1.
- Gate ratchet: `.ufo/waves/round-64/controls/CHANGES-AFTER-FREEZE.md` discloses the 21 post-freeze ratchet cases; no frozen counter, probe check, threshold or pin changed (`node scripts/counter-pins.mjs` → UNMEASURED).
- Maintenance repairs (not claims): `readme-map` DRIFT → CLEAN; `proxy-check` DRIFT → still DRIFT at the integrated tree (both measured below).
- Assimilation: one theme (jj seat containment), one entry admitted; the lesson `## Gate` records 1 ADMIT and 8 REJECT, two of the rejects carried from round 63; the collision guard found 3 collisions (S195/S196/S197, none appended).
- Mistake mined: the readme-map reference-drift class recurred (tenth occurrence); fix Q60 with a red-before receipt.
- Routed R63 defects D1-D6: answers UNMEASURED (each lands as a LOG/SCORECARD row installed by the L1).

### UNMEASURED — what fills each
- Wave-1 and wave-2 seat counts, role mix and answerer mix: `.ufo/waves/round-64/w1-results.json` and, once the wave settles, `.ufo/waves/round-64/w2-results.json` (count `seats` per role).
- `node scripts/counter-pins.mjs` verdict: run it in the archive at the measured revision and paste the line.
- R63 defect answers D1-D6: `LOG.md` entry and `SCORECARD.md` §Round 64 once installed.

## Landed changes

Every change is in `LOG.md` (entry "2026-10-25 — round 64") and `SCORECARD.md` §Round 64 — both UNMEASURED at this draft (the L1 installs them). Lane commits known at this draft:
- `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` — freeze: plan, counters R64/J64, control generators, 16 receipt controls, base receipts, `report-receipt-diff.mjs` v1, `jj-seat-demo.sh` v1, counter pins.
- `d92cf1fff3026087a0e21a3183b97de169c6f22c` — wave 1 landed: tool v2, demo v2, 21 ratchet controls, `plan-before-ready.sh` map arm, wave-1 reports and build artifacts.
- `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` — C2 build: entry, rows S198-S200, captures, amendment, `PROVINCE.md:21` frontier line, lesson, Q60/Q61.
- Wave-2 landing commit, the report commit and the final tip: UNMEASURED.
- Operator-visible removals (mutant copies, mirror trees) before the final commit: UNMEASURED.

### UNMEASURED — what fills each
- Wave-2 landing commit, report commit, final tip: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --oneline 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8..HEAD`.
- `LOG.md` / `SCORECARD.md` sections: `grep -n 'round 64' LOG.md SCORECARD.md`.
- Build-tree size before the final commit: `git ls-tree -r -l <tip> -- .ufo/waves/round-64/build | awk '{s+=$4} END {print s}'`.

## Before → after measurements

Counting commands re-run by a non-author need `git archive`/`--rev`. Every labelled verdict line below must be carried by a receipt committed under this round's close directory **before** it is pasted here: a labelled tally that no committed receipt carries reads `TALLY_UNRECEIPTED` (see `gotchas.md`).

- **C1** `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 --report .ufo/reports/round-64/kumitate.md`
  - before at base `6825a51425e91908f019ed65aa2f4209acbd7087`: `RECEIPT64_UNMET held=0/5 checks=5` exit 1 (`.ufo/waves/round-64/base/receipt64-base.txt`).
  - after at the measured revision: UNMEASURED. Read now by this seat at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`, not yet receipted: 4 of 5 checks with P5 MISS, exit 1, because `.ufo/reports/round-64/` does not exist yet — P5 is satisfied only by the filed report. Fill: commit the counter's output for the final report as a close receipt, then paste the full verdict line here.
- **C2** `node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`
  - before at base: `JJ64_UNMET held=0/8 checks=8` exit 1 (`.ufo/waves/round-64/base/jj64-base.txt`).
  - do-nothing control, committed before data: `JJ64_UNMET held=1/8 checks=8` (`.ufo/waves/round-64/base/jj64-donothing.txt`; only J8 passes, as the plan declares).
  - after at the measured revision: UNMEASURED as a receipt. Read now by this seat at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`: 8 of 8 checks, exit 0. Fill: commit the verdict line as a close receipt, then paste it here.
- **Tool selftest:** freeze `REPORT_RECEIPT_SELFTEST: PASS (20/20)` (`.ufo/waves/round-64/base/report-receipt-diff-selftest-freeze.txt`); at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` over `git archive`: `REPORT_RECEIPT_SELFTEST: PASS (52/52)`, exit 0.
- **jj demo:** freeze receipt carries 15 `JJ_SEAT:` keys then `JJ_SEAT_DEMO: DONE` with the host jj build pinned (`.ufo/waves/round-64/base/jj-seat-demo-freeze.txt`); at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`: UNMEASURED — re-run `bash scripts/jj-seat-demo.sh` in the archive, paste the 21-key set and `JJ_SEAT_DEMO: DONE`.
- **Harm check, base → integrated tree** (measured on `git archive`, never on the dirty worktree — the worktree adds untracked build artifacts to the `A` term):
  - `proxy-check` before: `PROXY: DRIFT (C2_TOTAL_DRIFT …; AXES_DRIFT …)` exit 1 (`.ufo/waves/round-64/base/proxy-before.txt`); at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`: still DRIFT — `A_DRIFT term=A declared=257 computed=514 delta=+257; C2_DRIFT delta=+3; C2_TOTAL_DRIFT delta=+3; GATE_PIN_DRIFT term=pin.plan-before-ready; PIN_UNPINNED term=scripts/report-receipt-diff.mjs`, exit 1. **Not repaired at this tree**; the plan requires a clean read at the tip. Fill: refresh the stanza (archive `A`, `C2`, the `plan-before-ready` pin, a pin key for the new tool) and re-run.
  - `readme-map` before: `README_MAP: DRIFT files=154 rows=153 covered=153 bad=2` exit 1 (`.ufo/waves/round-64/base/readme-map-before.txt`); at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`: `README_MAP: CLEAN files=156 rows=156 covered=156` exit 0 (repair).
  - `sources-check` before: `SOURCES_CHECK: CLEAN (rows=136 tiers=A:113,B:15,C:8 status=queued:13,mined:104,rejected:19 entries_with_source=20 legacy=38)` exit 0 (`.ufo/waves/round-64/base/sources-check-before.txt`); at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`: `SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19 entries_with_source=21 legacy=38)` exit 0.

### UNMEASURED — what fills each
- C1 and C2 after-verdict lines: run the counting command with `--report .ufo/reports/round-64/kumitate.md` at the measured revision, commit the stdout as a close receipt, paste the line.
- jj demo key set at the measured revision: `bash scripts/jj-seat-demo.sh` inside a `git archive` extraction.
- `proxy-check` after-repair verdict: re-run it on the archive once the stanza is refreshed.
- Base-receipt gates not re-run by this seat (`kimi-census`, `anchor-truth`, `cite-check`, `surface-probe`, `omp-census`, `gate-mutants`): each tool at the archive revision, base value in `.ufo/waves/round-64/base/` only where a receipt exists.

## Sources & frontier

Registry census, before (`.ufo/waves/round-64/base/census-before.txt`, exit 0) and after (this seat, exit 0): the same six W04 duplicate-url warnings (S034 S068 S084 S095 S123 S126) then `kumitate ok /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md`.
- Rows: **136 → 139** (`grep -cE '^\| S[0-9]{3} \|' corpus/SOURCES.md`); tier histogram A 113 → 116, B 15 → 15, C 8 → 8, so all three added rows are tier A: S198 (jj concurrency / operation log), S199 (Firefox Source Docs, jj), S200 (jj working copy), each `status=mined`, `opened=2026-10-25`, each carrying a URL and a `used-by` naming `corpus/knowledge/jj-workspace-seat-containment.md`.
- Sourced claim: the entry's three `source:` lines name S198/S199/S200; the captures are pinned in `.ufo/pins/source-captures.json` (J3 read: UNMEASURED by this seat).
- Frontier: `PROVINCE.md:21` names `corpus/knowledge/jj-workspace-seat-containment.md` on the isolation-substrates frontier line. `README.md` carries no row naming the entry (verified: `grep -n 'jj' README.md` is empty) — J7 asks only for `PROVINCE.md`, so this is a documentation gap, not a claim failure.
- Assimilation: one theme (jj seat containment) from `merge/kumitate/`, one entry admitted; collision guard 3 collisions (S195/S196/S197), none appended, the guard shown able to fail on an indented fixture; gate record 1 ADMIT / 8 REJECT (two carried).
- considerthese: idea 2 ("diff reports against receipts") is C1; idea 1 ("try to forge each new gate") is the wave-2 forge seats.
- SOURCES line: `SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19 entries_with_source=21 legacy=38)`, exit 0 (pasted in full above).

### UNMEASURED — what fills each
- Census after, as a receipt: run `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` at the measured revision and commit the stdout.
- J3 pin agreement, J4 quote locations, J5 live refetch: the counting command's own output (checks J3-J5).
- Which sibling lanes hold S198-S200: `grep -l 'docs.jj-vcs.dev' /home/vgpnk/Projects/shokunin/*/corpus/SOURCES.md`.
- Quarantine slice re-derivation: `assimilation/quarantine-slice` and the seat report that re-derived it.

## Trend verdicts

- **Expansion — UNMEASURED.** Decided by: one frontier band gained demonstrated jj-workspace ground (`PROVINCE.md:21`, the entry, three tier-A rows) — a band the lane did not hold before. Pointer: `git diff 6825a51425e91908f019ed65aa2f4209acbd7087..2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 -- PROVINCE.md corpus/SOURCES.md`.
- **Quality — UNMEASURED.** Decided by: the tool's ratchet (20 → 52 selftest cases, 16 → 37 controls, two new finding ids), the demo's hardening (15 → 21 keys), and whether the wave-2 forgeries found lies the tool still accepts. Pointer: `.ufo/waves/round-64/controls/CHANGES-AFTER-FREEZE.md` and the wave-2 seat reports that name a surviving forgery.
- **Discernment — UNMEASURED.** Decided by: whether the report states its counters' declared holes and its unrepaired gates (`proxy-check` above) beside the HELD verdicts, and whether a non-author judged it. Pointer: the `## Limits` material of the plan and the seat reports.

### UNMEASURED — what fills each
- Each verdict word: the L1 after reading the wave-2 attack reports; the deciding evidence is the pointer on each line.

## SHONEN

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources — pointer: `SKILL.md` rows for `report-receipt-diff` and `jj-seat-demo` (installed by the L1: UNMEASURED); no non-author promotion verifier.
- [~] At least one end-to-end domain task executed and logged — pointer: the two waves and their reports under `.ufo/waves/round-64/w1/` and `w2/`, plus the `LOG.md` round-64 entry (UNMEASURED).
- [~] Instructions executable without oral context — pointer: the two counting commands above, `bash scripts/plan-before-ready.sh --round 64`, and `node scripts/report-receipt-diff.mjs --selftest` (52/52) as recorded in `corpus/lessons/round-64.md`.
- [~] No cross-domain bleed; PROVINCE still accurate — pointer: `PROVINCE.md:21` frames the new band as isolation substrates with kengaku adjacent; the sibling-overlap check is UNMEASURED.

Stale-lane: respawn-per-round driver; no other mission of this lane is open. Tool installs/updates: none (node v24.21.0, jj 0.45.1 and git 2.56.0 pre-existing; no pacman, uv or npx use). Misroot sweep (`git -C /home/vgpnk/Projects/shokunin status --porcelain`): no round-64 file at the fleet root; the modified `.ufo/state/*`, `.scratch/goal-20261025-hyaku-run7.md`, `.ufo/watchdog.log` and the untracked `.ufo/waves/round-30/` are other lanes'/orchestrator-owned and untouched; the lane's own untracked paths are wave-2 build and dispatch files only. Open L0 questions: UNMEASURED (the post-freeze control changes and the `proxy-check` drift are the two candidates). Open items carried: the R56-V3 readme-map recurrence mechanism (`readme-map-close.mjs`) not landed, the Q51 grounding hash `9237a72` that resolves nowhere (corrected append-only by Q51-C1), Audit19 residuals, and the counters' declared holes.
