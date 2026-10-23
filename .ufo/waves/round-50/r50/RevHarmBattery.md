# RevHarmBattery — seat report (r50, reviewer)

Seat: RevHarmBattery (reviewer) · Item: run the full harm battery at the freeze revision; pin the H1–H5 baseline the close must match or beat.
Date: 2026-10-23. Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin (read-only).
Freeze revision: `5b0de268e5a6bdd744fe47c6ee2ee58404693ac3` ("round-50: freeze guard and closure audit", 2026-10-23 17:29:00 -0300).
Lane HEAD at battery time: `6927903f99bbc26e397aa47387aa76950f42b3a5` ("round-50: record wave seat assignments", 17:45:32 -0300); `5b0de268` is an ancestor (merge-base check: ANCESTOR=yes).
Node: v24.21.0 (reported by round-gate selftest). No tools installed; nothing to record on the tooling channel (all six commands are existing lane scripts, node-only).

## Baseline matrix at freeze 5b0de268

| # | Command | Verdict line | Exit |
|---|---------|--------------|------|
| H1 | `node scripts/surface-probe.mjs --checklists` | `CHECKLIST: 20/22 pass` / `VERDICT: FAIL` | 1 |
| H2 | `node scripts/cap-run.mjs --selftest` | `CAP_RUN_SELFTEST: 12/12 pass` / `VERDICT: PASS` | 0 |
| H3 | `node scripts/bind-oracle.mjs --selftest` | `BIND_ORACLE_SELFTEST: 7/7 pass` / `VERDICT: PASS` | 0 |
| H4 | `node scripts/counter-rerun.mjs --selftest` | `COUNTER_RERUN_SELFTEST: PASS` | 0 |
| H5 | `node scripts/round-gate.mjs --selftest` | `ROUND_GATE_SELFTEST: 61/61 pass` / `VERDICT: PASS` | 0 |
| — | `node scripts/proxy-check.mjs --strict` | `PROXY: DRIFT (A_DRIFT …, C2_DRIFT …, C2_TOTAL_DRIFT …, AXES_DRIFT …, PIN_UNPINNED …)` | 1 |

H1's two failures are exactly the two H1-freeze known items, reproduced with identical detail:

- checklist 693 (Proxy recompute): `PROXY error A_DRIFT A: declared=38 computed=43 delta=+5`; `C2_DRIFT C2: declared=108 computed=110 delta=+2`; `C2_TOTAL_DRIFT C2_total: declared=108 computed=112 delta=+4`; `AXES_DRIFT coverage: ## Axes row=10 derived=9`; `PROXY warn PIN_UNPINNED scripts/bind-oracle.mjs has no pin.<name> key` (R50-9).
- checklist 697 (Sources-registry gate): `SOURCES error ENTRY_HEADER_REQUIRED corpus/knowledge/counter-amendment-discipline.md:1 non-legacy knowledge file lacks source: header` (R50-10).

## Evidence

### H1 — surface-probe --checklists
First lane run (in the lane checkout, at HEAD) reproduced the frozen receipt byte-for-byte including wall/load timings (wall=4.017/load1=6.50 for checklist 686, wall=45.195 for checklist 703), `CHECKLIST: 20/22 pass`, `VERDICT: FAIL`, exit=1, `CHECKLIST_SKIPPED: 0`. This run is byte-identical to `.ufo/waves/round-50/controls/H1-freeze-5b0de268.txt` (16/16 verdict-relevant lines match; only per-run wall/load timing fields vary on later runs).

Independent corroboration at the exact freeze rev: fresh clone (`git clone --no-hardlinks` into `/tmp/r50-harmbattery-rev-K9PWfG`, `git checkout --detach 5b0de268`; lane untouched, read-only):
- checklist 693 and 697 fail with byte-identical PROXY/SOURCESCES lines (declared=38/computed=43 … ENTRY_HEADER_REQUIRED).
- `node scripts/proxy-check.mjs --strict` there exits 1 `PROXY: DRIFT (… PIN_UNPINNED term=scripts/bind-oracle.mjs; src-rev=31c465f15669)` identical to the checklist-693 block.
- Clone artifact (documented, NOT a freeze regression): in the fresh clone, checklists 691 (Round-close artifact audit) and 692 (Filed-report tracking) fail `REPORTS_DIR_MISSING --reports-dir /tmp/.ufo/reports is absent` → 18/22 in the clone. The real lane passes 691/692 at freeze (per the receipt and the lane run). Root cause: the probe's round-gate invocation anchors the reports dir at a /tmp temp root that a bare archive/clone does not populate the way the live lane does (`.ufo/reports` exists on disk, tracked, contains `round-33`). Do not read 18/22 as the freeze baseline; 20/22 is the lane baseline.

### H2 — cap-run selftest (exit 0)
```
PASS  usage arms exit 64 with CAP_RUN: USAGE
PASS  exit code and stdout pass through (EXIT code=7)
PASS  runner cwd is writable to the child
PASS  --verdict-file: child stderr byte-exact, verdict line in the file (EXIT code=3, decimal budget)
PASS  --bind: a host directory outside the cwd is read-write only when bound
PASS  explicit env: --env pair arrives, GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE and marker dropped
PASS  own PID namespace: /proc/1/environ readable, planted marker and GIT_DIR absent
PASS  512 MiB Buffer child under --mem 256 dies non-zero with OOM (allocs=15, exit=143)
PASS  32 MiB Buffer child under --mem 256 finishes (liveness)
PASS  budget 2 s on a 300 s child: BUDGET, exit 124, no leftover (wall=2.045s)
PASS  SIGTERM 1.5 s into a 300 s child: SIGNAL, exit 143, no leftover (0.019s)
PASS  detached new-session grandchild is gone after the runner returns
CAP_RUN_SELFTEST: 12/12 pass
VERDICT: PASS
```

### H3 — bind-oracle selftest (exit 0)
```
  PASS A1 live 3 binds
  PASS A2 live 0 binds
  PASS A3 drop-mutant
  PASS A4 extra-mutant
  PASS A5 no-tmpfs mutant
  PASS A6 missing runner
  PASS A7 usage arm
BIND_ORACLE_SELFTEST: 7/7 pass
VERDICT: PASS
```

### H4 — counter-rerun selftest (exit 0)
14 arms all PASS (fixture lane; usage 64s; fail-closed exit 2; AGREE over 3 runs; DISAGREE on flake; DISAGREE on non-zero; byte-exact comparison; calling convention; mutation control). `COUNTER_RERUN_SELFTEST: PASS`.

### H5 — round-gate selftest (exit 0)
`ROUND_GATE_SELFTEST: 61/61 pass` / `VERDICT: PASS` (all 61 arms PASS; hermetic under polluted env; GIT_DIR canary clean; 14 finding kinds observed).

### proxy-check --strict at freeze
Exit 1, `PROXY: DRIFT` with all five findings (A_DRIFT, C2_DRIFT, C2_TOTAL_DRIFT, AXES_DRIFT, PIN_UNPINNED), `src-rev=31c465f15669`.

## Live-tree delta (post-freeze, same day)

- Second lane surface-probe run (bg job, ~90 s wall, ~15 min after run 1): `CHECKLIST: 22/22 pass`, `VERDICT: PASS`, `EXIT=0`. Checklist 693 now passes and checklist 697 now passes.
- `node scripts/proxy-check.mjs --strict` at HEAD: `PROXY: MATCH (A=43 C=22 operability=9; C1=19/19 C2=112/112 coverage=10; S=88/88 …; R=92/92 …; K=53/53 …; pins=6 match; src-rev=31c465f15669)`, exit 0.
- `git diff --stat` (work tree vs HEAD) is empty → the repaired SCORECARD rows/pins and the knowledge-file source header are present in the committed tree at HEAD, not merely uncommitted edits. The two H1 failures are therefore already closed in the live tree; the close must hold 22/22 and the five selftest suites green on the final committed tree.

## Findings (by severity)

1. **Baseline pinned (Info).** H1 = 20/22 at freeze with exactly the two recorded failures (693 proxy strict → R50-9; 697 sources header → R50-10), byte-reproduced in two independent runs (lane + freeze-rev clone). H2 12/12, H3 7/7, H4 PASS, H5 61/61, proxy strict exit 1 at freeze. These are the numbers the close must match or beat.
2. **Close already met in live tree (Info).** 22/22 + proxy MATCH (pins=6) at HEAD; R50-9/R50-10 repair state is committed. The close gate should re-run this battery on the final tree and require ≥22/22 (work 22/22) plus identical green selftest suites.
3. **Documented artifact, not a defect (Note).** Clone/archive runs of surface-probe fail 691/692 with `REPORTS_DIR_MISSING` because the probe anchors round-gate's reports dir at `/tmp/.ufo/reports`, which only the live lane satisfies; 18/22 in a fresh clone must not be quoted as freeze state. Run the battery in the real lane checkout (or a clone that replicates `.ufo/reports`).
4. **Timing interleaving (Info/residual).** Two live-tree surface-probe runs straddled the arrival of the repair state (first: 20/22 matching freeze; second: 22/22). Both are truthful for their instant; the baseline is the freeze one, and the close target is the 22/22 state.

## Residual risk / verification gaps

- The 22/22 run exercised the committed HEAD tree; I did not re-run after the L1's final integration (no final tree exists yet). Re-run the six commands at close on the actual closing commit — the receipt format in `.ufo/waves/round-50/controls/H1-freeze-5b0de268.txt` is the template to match (add a run-at/freeze line per the round's receipt discipline).
- I did not inspect surface-probe internals to explain the `/tmp/.ufo/reports` anchoring (out of seat scope); the behavior is observed and recorded so the close can avoid the clone artifact.
- `src-rev=31c465f15669` appears in proxy-check output at both freeze and HEAD; I did not verify which revision that pointer resolves to (left to the pin seats / R50-9).
