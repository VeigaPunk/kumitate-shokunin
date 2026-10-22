RESULT CritTradesTip rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=notdeepened warnings=3->0 cite_ms=851->856

Scope: whether the measured commit c9a084bf deepens round 41's three unscored trades, compared with the round-open commit dfabe92b. The three trades are the proxy `--strict` warnings, the cite-check selftest cost and the R41-3 guard weaknesses. This report also records the costs that are new this round.

How I measured:
- Two clean clones, each checked out detached at one revision: `/fast/scratch/hyaku/kumitate-r42/falsify/CritTradesTip/{old,lane}`. `old` is at dfabe92bcec021f5beec457fb50cec484e047e35, and `lane` is at c9a084bf03fb043d3cce5da102fffbc023552a45.
- cite-check.mjs sha256: `896f0720…` in old and `1915e5b9…` in lane.
- Source pin: `/fast/scratch/hyaku/kumitate-pin/src` (31c465f1).
- Every timed run unset `KUMITATE_CITE_SELFTEST_INJECT_FAIL`, `KUMITATE_CITE_SELFTEST_DEPTH` and `KUMITATE_WAVE_CENSUS_SELFTEST_INJECT_FAIL`.
- Tools installed or updated: none.

## Trade 1: proxy `--strict` warnings, 3 → 0 (improved)

Command: `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --strict --json | jq -c '{verdict,errors,warnings}'`

- dfabe92: `{"verdict":"DRIFT","errors":2,"warnings":3}`, exit 1. The three warnings are `PIN_UNPINNED` for anchor-truth, sources-check and wave-census. The two errors are C2_TOTAL_DRIFT and AXES_DRIFT, repaired by A3.
- c9a084bf: `{"verdict":"MATCH","errors":0,"warnings":0}`, exit 0, `pins=6 match`. `scripts/gate-mutants.mjs` raises no warning (counter to CritTrades risk 1, which predicted 3 → 4).
- Open question for the operator: the fix is a lane-owned `kumitate-gate-pins-v1` block next to the parent-frozen v1 stanza, and whether that is acceptable is still unruled (lesson, open limits).

## Trade 2: cite-check `--selftest` wall time, 851 → 856 ms median (not deepened)

Method: runs alternated old and new, 5 pairs, starting 2026-10-22T21:00:24Z. `time-pairs.sh cite-check.mjs 5 --selftest` (in the scratch directory). Load was 2.57 to 2.92 throughout.

- old: 848, 843, 865, 862, 851 ms; median 851. Every run: 75/75 cases, `VERDICT: PASS`, exit 0.
- new: 859, 856, 886, 825, 829 ms; median 856. Every run: 75/75 cases, `VERDICT: PASS`, exit 0.
- Paired deltas: +11, +13, +21, −37, −22 ms. That is noise: the open receipts read 844/857/838 ms.
- Leftover processes: 0.

The round-41 cost (0.17 s → about 0.85 s) is unchanged. It is neither repaired nor deepened.

## Trade 3: guard weaknesses R41-3 (F1 and F2), contained (not deepened; F1 and F2 both closed)

Containment:
- Each mutant ran in a fresh `git archive` copy under `cap.sh`, which runs `setsid -w prlimit --nproc=$(( $(/usr/bin/ps -u $(id -u) -L --no-headers | wc -l) + 64 )) timeout -s KILL 30`.
- It calls `/usr/bin/ps` by path because the agent shell shadows `ps` and `pgrep` with builtins that reject `-L` and see no processes.
- A watcher sampled node process count, nesting depth and RSS every 0.1 s.
- Leftovers after every run: 0.

A note on the containment itself. With node's default 7 threads per process, a +64-thread allowance covers about 9 node processes. In the first pass, the healthy cite-check children starved at the thread cap and hit the 30 s kill (rc=137, no summary), even at the new bytes: `mut-old.txt` and `mut-lane.txt`, plus one transient `DEPTH=1` run, exit 9. Those rows are artifacts of my cap, not results. The counted rows below were run with `NODE_OPTIONS=--v8-pool-size=1` (4 threads per process), serially, starting 2026-10-22T21:10:22Z at load 6.0 to 6.5. They are in `probes.txt`. `gate-mutants` itself gives +256 threads, so its own runs do not starve this way.

| mutant (same literal at both revisions) | dfabe92 | c9a084bf |
|---|---|---|
| F1 `guard-outer-literal-2` (`!== undefined` → `=== '2'`) | **recursed**: killed at 30 s, 16 nested nodes, 1.0 GB RSS | killed: 73/75, `VERDICT: FAIL`, 5 nested, 273 MB, 2.4 s |
| F1 `child-text-env-dropped` | killed 74/75, but only after 10 nested nodes and 639 MB | killed: 74/75, 4 nested, 214 MB |
| F1 `child-json-env-dropped` | **recursed**: killed at 30 s, 31 nested nodes, 2.08 GB RSS | killed: 74/75, 4 nested, 215 MB |
| F2 `guard-outer-ne-1` | **survived**: 73/73 PASS, 2 SKIP | killed: 73/75 FAIL |
| F2 `guard-outer-eq-undefined` | **survived**: 73/73 PASS, 2 SKIP | killed: 73/75 FAIL |

The F2 rows come from the first pass (`mut-*.txt`). They have summaries, so the thread cap did not affect them. The F1 rows come from `probes.txt` with pool size 1.

Tally:
- R41-3 F1 (recursion): unbounded in 2 of 3 at dfabe92 (the third is deep but ends), and 0 of 3 at c9a084bf, where nesting is at most 5.
- R41-3 F2 (skip bypass): 2 of 2 survive at dfabe92, 0 of 2 survive at c9a084bf.
- This agrees with ExecCiteGuard (5/5 killed after) and with the commit's `gate-mutants --rev dfabe92 --target cite-check` reading 2 drift.

Residual weaknesses, named but not trades this round. Each is either unchanged from round 41 or confined to the new depth-stop lines.

1. **The depth stop is itself a single point.** At c9a084bf:
   - `D-depth-increment-dropped` (`String(selftestDepth41 + 1)` → `String(selftestDepth41)`) recurses: killed at 30 s, 10 nested, 593 MB.
   - `D-depth-parse-inverted` (`>= 0 ?` → `< 0 ?`) recurses: killed at 30 s, 13 nested, 852 MB.
   - `D-depth-read-const` is killed (73/75).
   - So the recursing single-literal mutants in the guard go from 2 to 2, on different lines. Before, the outer marker test was the weak point; now the depth bookkeeping is. The class is not widened, but it is not gone. A depth-stop mutant can still exhaust the host if a runner lacks a group cap. `gate-mutants`' manifest carries none of these.
2. **`S-skip-both-always` survives at both revisions** (73/73 `VERDICT: PASS`, 2 SKIP). This is the round-41 "still open" limit, unchanged. `gate-mutants` would read it as `drift`, because it passes with fewer cases than its control.
3. **`D-hard-stop-3` survives at c9a084bf** (`>= 2` → `>= 3`, 75/75 PASS). The bound still holds at depth 3, so this is a bound weakness, not a bypass.
4. **`X-guard-outer-truthy` survives at both revisions.** It differs only for an empty-string value, so it is near-equivalent.
5. **Environment dependence moved from one variable to another; the count is unchanged.** These runs inherit the variable from the calling shell, with 75 cases in the clean control:
   - `INJECT_FAIL=2`: old 73/73 PASS with skips, new 75/75 (fixed).
   - `DEPTH=2`: old 75/75, new 73/73 PASS with skips (new).
   - `DEPTH=1` plus `INJECT_FAIL=0`: 73/73 PASS with skips at both.
   - The round-41 goal of "a marker the caller cannot inherit" is not met. `gate-mutants` is immune because `sandboxEnv` passes only PATH, HOME, TMPDIR, LANG and TZ. The SKILL checklist item `node scripts/cite-check.mjs --selftest` is not immune.

## New costs (recorded, not scored)

Selftests, alternated old and new, 5 pairs each, starting 2026-10-22T21:00:38Z:

| selftest | old median | new median | paired deltas | load |
|---|---|---|---|---|
| wave-census `--selftest` | 1537 ms (1502–1568) | 1947 ms (1930–1961) | +412, +443, +379, +393, +428 | 2.66–2.86 |
| anchor-truth `--selftest` | 3136 ms (2944–3271) | 3328 ms (3095–3586) | +151, +272, +193, +328, +57 | 2.86→5.35, rising during the run |

- The wave-census rise is about +27% and appears in every pair; WC27–WC31 added 5 cases (26 → 31). It is multiplied inside the battery, which runs 25 wave-census mutants plus a control.
- The anchor-truth rise is about +6%, but partly confounded by the rising load.
- Leftovers: 0 for both.

Checklist: `time-checklist.sh` (in the scratch directory) runs each SKILL item serially via `bash -c` in the clone root, as `surface-probe --checklists` does. Two pairs, starting 2026-10-22T21:13:16Z:

| revision | items | run 1 | run 2 | load |
|---|---|---|---|---|
| dfabe92 | 17 | 18573 ms | 19145 ms | 7.47→7.03 and 8.35→8.61 |
| c9a084bf | 19 | 43521 ms | 45538 ms | 7.03→8.35 and 8.61→13.69 |
| c9a084bf, first 17 items only | 17 | 20403 ms | 20882 ms | same runs |

- Item 18 (`node scripts/gate-mutants.mjs`) took 22728 and 24186 ms, both exit 0. Item 19 (`--selftest`) took 367 and 445 ms.
- Net effect: the checklist is about 2.3× slower (+25 s). Item 18 accounts for about 23 s of that, and the shared 17 items for +1.8 s (mainly wave-census and anchor-truth).
- This is consistent with the lesson's "~21 s item" and with CritTrades risk 6. It is below the serial 61 s that CritTrades projected, because the battery runs with `--jobs 4`.
- Some items exit non-zero in my clone, and these are not regressions:
  - Items 6–7 (`round-gate`) exit 2 at both revisions: no fleet reports directory in a clone.
  - Item 1 (`cite-check`) exits 1 at both revisions. Its contract allows exit 0 or 1.
  - Old also has non-zero exits on proxy DRIFT and kimi-census DRIFT (UNLISTED locks).

## Verdict

No round-41 trade is deepened at c9a084bf:
- warnings went 3 → 0;
- the cite-check selftest is flat (+5 ms median, inside the pair noise);
- R41-3 F1 is 3/3 bounded and killed, and F2 is 2/2 killed.

The operator ruling on the round-41 trades can rest on these numbers. The new costs above are ordinary costs of this round, not deepenings of the round-41 trades:
- the checklist grew from about 19 s to about 44 s;
- the wave-census selftest grew by about 410 ms;
- two depth-stop mutants recurse;
- the inheritable skip moved from `INJECT_FAIL` to `DEPTH`.

Artifacts (scratch directory): `cite-pairs.txt`, `wave-pairs.txt`, `anchor-pairs.txt`, `mut-old.txt`, `mut-lane.txt`, `probes.txt`, `cl-lane-{1,2}.txt`, `mutants.tsv`, plus the runner scripts.
