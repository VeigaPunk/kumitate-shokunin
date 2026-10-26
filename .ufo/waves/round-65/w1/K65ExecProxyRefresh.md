VERDICT: The proxy stanza refresh is fully specified and dry-run-verified — A must be measured (not predicted: it already reads 357 in `git archive 2ca91a0c` and 745→749 in the live tree), C 33→35, C2/C2_total 156/157→160/160, plus four new gate pins and a re-pin of `pin.proxy-check`; a simulated close reads `PROXY: MATCH` exit 0.

## Evidence

Base replay (fresh `git clone --no-hardlinks` of the lane, `checkout 47fe2383…`, cwd = clone):
```
$ node scripts/proxy-check.mjs --strict
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=156 computed=157 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=156 computed=157 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)
EXIT=1                      # reproduces base/proxy-before.txt exactly
```

The freeze commit already drifts — `git archive 2ca91a0c | tar -x`, then the tool in the archive:
```
PROXY  error  A_DRIFT  A: declared=351 computed=357 delta=+6
PROXY  error  C2_DRIFT  C2: declared=156 computed=157 delta=+1
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=156 computed=157 delta=+1
PROXY  warn  PIN_UNPINNED  scripts/harm-matrix.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
PROXY: DRIFT (A_DRIFT …; C2_DRIFT …; C2_TOTAL_DRIFT …; PIN_UNPINNED …; src-rev=31c465f15669)
EXIT=1
```
`git -C lane diff --name-status 47fe2383 HEAD | grep -E '\.(mjs|js|sh|py)$'` → 6 additions: `scripts/harm-matrix.mjs`,
`scripts/omp-binary-probe.sh`, `.ufo/waves/round-65/probe/{gen-harm-cases.mjs,harm65-probe.mjs,omp65-probe.mjs,omp-donothing-control.sh}`.
The live lane already reads `README_MAP: CLEAN files=157 rows=157 covered=157` exit 0 (D2 landed at the freeze).

`A` is a live working-tree count (three consecutive reads, same tree, this seat's own runs):
```
run1 proxy A=748 find=749
run2 proxy A=749 find=749
run3 proxy A=749 find=749      # minutes earlier: 745
```

Simulated close, in a sandbox copy of the base clone (stub scripts + stub notes/rows/covered pins):
```
PROXY: MATCH (A=353 C=35 operability=9; C1=19/19 C2=160/160 coverage=10; S=88/88 coverage:script-layer=10;
              R=92/92 coverage:runtime-layer=10; K=49/49 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
EXIT=0
README_MAP: CLEAN files=160 rows=160 covered=160     EXIT=0
node scripts/proxy-check.mjs --selftest             PROXY_SELFTEST: 122/122 pass / VERDICT: PASS  EXIT=0
```
Per-addition findings: `.mjs` +1 → `A_DRIFT` + `warn PIN_UNPINNED`; `.sh` +1 → `A_DRIFT` only; both `.json` → **no change**;
one note without a row → `C2_TOTAL_DRIFT` + `AXES_DRIFT`; row catching up (159/159) → `AXES_DRIFT` gone; 158/159 → back.

`refresh.mjs` (dry run) against the same tree: exit 0 and its two printed blocks `diff`-identical to the blocks the
simulation applied (`diff` empty, both blocks); base clone → exit 1 (`NOTE C2=156 C2_total=157 … coverage floors to 9`);
absent pinned file → exit 2; unknown flag/`--set` key/non-integer → exit 64.

## Findings

1. **K65ExecProxyRefresh-1 — high — the `A` term is not a lane contract; it is a working-tree file count.**
   It moves while the wave is in flight (745→748→749 inside one minute), it counts every `*.mjs|js|sh|py` under
   `.ufo/waves/**/build` (323 of the base 351 were already `.ufo` artifacts), and two stray drafts moved it
   `353→355` with no `PIN_UNPINNED` while their deletion restored `MATCH`. Any stanza `A` declared before the tree
   is final drifts at the close, and a fresh clone of the close commit counts only committed bytes (357 today).
   Repro: `find <lane> -path <lane>/.git -prune -o -type f \( -name '*.mjs' -o -name '*.sh' -o -name '*.js' -o -name '*.py' \) -print | wc -l`
   vs `node scripts/proxy-check.mjs --json | grep '"A"'`; or, in a sandbox clone,
   `mkdir -p .ufo/waves/round-65/build/P && printf '#!/usr/bin/env node\n' > .ufo/waves/round-65/build/P/p.mjs &&
   node scripts/proxy-check.mjs --strict` → `A_DRIFT` +1 (2 for a `.mjs` and a `.sh`) and no `PIN_UNPINNED`.
2. **K65ExecProxyRefresh-2 — medium — `.json` claim artifacts are invisible to both counting and pinning.**
   `A` ignores `.json` (measured: +2 JSON files, `A` unchanged) and `--strict` warns `PIN_UNPINNED` only for
   `scripts/*.mjs`, so `scripts/harm-cases.json` / `scripts/harm-matrix-gates.json` can be edited with no finding
   anywhere unless they are registered as gate pins. Repro: the step-3 run above (`A=353` before and after the JSON),
   and `grep -n "isFile() && e.name.endsWith('.mjs')" scripts/proxy-check.mjs` (the warn's whole filter).
3. **K65ExecProxyRefresh-3 — medium — one note without a README row costs the whole coverage integer.**
   `coverage = floor(10·(C1/C1_total)·(C2/C2_total))`; 158 rows against 159 notes reads `coverage=9`, i.e. an
   `AXES_DRIFT` against the frozen `coverage` row 10. Three notes are landing this round, so the row/covered-pin
   count must be exact. Repro: sandbox clone, add a note without a row, `node scripts/proxy-check.mjs --strict`.
4. **K65ExecProxyRefresh-4 — medium — the round's own frozen counters are a drift source, not just the claim scripts.**
   The freeze commit adds six runnables (`A` 351→357) and a README row (`C2` 156→157) with the declaration still at
   the base values, so even a perfectly landed round reads `A_DRIFT`/`C2_DRIFT` until the close refresh includes all
   six files. Repro: the `git archive 2ca91a0c` run quoted above.
5. **K65ExecProxyRefresh-5 — low — registering the new gate keys re-pins `proxy-check.mjs` itself.**
   `GATE_PINS` lives in the tool, and `pin.proxy-check` (v1 block) tracks its bytes: the edit alone produced
   `PIN_DRIFT pin.proxy-check d6f8dce9b4a36a958960f6361aca66aa6f09a15f0626beac579353f96b33371f → <new sha>`.
   Re-pin as the last edit to that file. Repro: add one key to `GATE_PINS` in a sandbox clone,
   `node scripts/proxy-check.mjs --strict`.
6. **K65ExecProxyRefresh-6 — low — the `## Axes` operability narrative and the stanza count different universes.**
   The row says `A=10`/`C=19` (gate artifacts / checklist items) while the stanza declares `A=351`/`C=33`
   (working-tree runnables / checklist lines). After this round they read 12/21 and ≥357/35 and the integer stays 9
   (`floor(10·(A+C)/(A+C+3))` is 9 for every `A ≥ 0` at `C=35`). Nothing machine-checks the prose; keep it in step
   or say the two counts differ. Repro: `sed -n '/^## Axes/,/^## /p' SCORECARD.md | head -3`.

## Artifacts

- `.ufo/waves/round-65/build/K65ExecProxyRefresh/refresh-procedure.md` — final replacement values, pin-registration
  syntax, the ordered edit list with one proof command per step, the measured simulation trace, six traps.
- `.ufo/waves/round-65/build/K65ExecProxyRefresh/refresh.mjs` — the dry run (`--self`, `--from-check`, `--set K=V`,
  `--gate-extra K=P`, `--json`; exit 0 would-MATCH / 1 would-DRIFT / 2 fail-closed / 64 usage; never writes). It reads
  the pin key set from `scripts/proxy-check.mjs` rather than keeping a second copy, and its output was diffed against
  blocks applied by hand (identical).
- Scratch (outside the lane): `/tmp/kumitate-r65/K65ExecProxyRefresh/{clone,sim,stage,archive.*,lane-dryrun.txt}`.
- No lane file outside the two artifacts above and this report was written; no install/update was needed.

## Limits

- Stub scripts/notes were used for the simulation, so no pin hash printed here is a real lane pin — the L1 must hash
  the final bytes (the dry run does it).
- `A` at close is unknown: it depends on which wave artifacts are committed (357 committed today) and on leftover
  drafts; only the post-cleanup measurement is authoritative.
- The real `harm-matrix.mjs` / `omp-binary-probe.sh` bytes, the corpus entry content, the SOURCES rows and the C1/C2
  counters were not exercised (other seats own them); `K_members=49`/`K_sections=49`/`C1k=5` were read live twice and
  matched, but host state can still move them before the close.
- The gate-pin additions are a strengthening proposal; whether the two `.json` pins are adopted is the L1's call.
