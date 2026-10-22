RESULT SimplifyGateMutants rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b verdict=proposed proposals=12

## Scope

Read `scripts/gate-mutants.mjs` at plan commit `0f4108bf` (sha256 `e24749e4…`, byte-identical to the lane file at `e5ffcbe`). Nothing in the lane was edited except this report. Eight deletions were applied in a scratch clone only, to measure them; four further candidates are named but unapplied. The eight are delivered as `SimplifyGateMutants.patch` (sha256 `3597a775…`) with the clone restored to the base bytes.

## Preserved contract

The eight applied proposals keep all 28 selftest cases byte-identical (same ids, same detail strings, `28/28 pass`, exit 0) and leave the K43 decision functions returning the same values for the same inputs: `evaluable`, `killedOnce`, `classifyMutant`, `confirmKill`, `controlPass`, `evaluatedDrift`, `gateExitCode`. State names, exit classes (0/1/2/64) and the `GATE_MUTANTS:` summary text are unchanged. `failLines` is kept (see the declines). The four unapplied candidates are unmeasured by construction, which is why they rank below the applied ones.

## Proposals, lowest risk first

| # | Deletion | Base lines | Risk | Applied in scratch |
|---|---|---|---|---|
| 1 | `reportText` prints rows only when `rowsPrinted` is false, and the only call site passes `true`; delete that branch and the unused `header`, `verdict`, `rowsPrinted` parameters | 751-758, 1128 | lowest | yes, verified |
| 2 | `mutantText` repeats `countText`'s ternary verbatim; call `countText(result.cases)` | 743 | lowest | yes, verified |
| 3 | The eight-state array literal appears twice (text and JSON reports); hoist `STATES` plus one `stateCounts(results)` used by both | 757, 771 | lowest | yes, verified |
| 4 | The four-conjunct evaluable shape is written out three times and decomposed once; hoist `wellFormed(run)` and use it in `evaluable`, `classifyMutant`, `evaluatedDrift`, `controlPass` | 442-444, 454, 466-468, 472-474 | low | yes, verified |
| 5 | `countFailLines` and `failNames` each split and filter for `FAIL ` lines; hoist `failLines(text)` and derive both | 423-432 | low | yes, verified |
| 6 | `controlPass` and `evaluatedDrift` share six conjuncts and differ only in the case-total comparison; hoist `passingRun(run, cases)` | 466-477 | low | yes, selftest (control and drift cases) |
| 7 | `scriptFiles` stores `size` in every entry; no reader uses it (`st.size` is used locally) | 556 | lowest | yes, verified |
| 8 | `/41` is hard-coded in the summary and three ERROR strings while `FROZEN_IDS.length` is the authority; use the length (same text today) | 758, 1042, 1059, 1135 | lowest | yes, verified |
| 9 | One MUTANT line prints `fail_lines=` twice (`detail` and the outer line); drop one | 439, 744 | medium (recorded output text changes) | no |
| 10 | `writeSafeFile` re-reads the whole target whose bytes it discards, and returns `original` that its only caller ignores | 511, 528, 619 | medium (safety path; keep unless the isolation cases are re-run) | no |
| 11 | `main` builds `manifestIssues()` and then calls `manifestExitCode()`, which rebuilds the same issues | 1034, 1038 | low, low value | no |
| 12 | `readSafeFile`'s `maxBytes` parameter is never passed (all thirteen call sites are two-argument) | 495 | cosmetic | no |

## Deletions examined and declined

- `FROZEN_IDS` repeats `MANIFEST`'s ids, but that duplication is the falsifier: `missing-frozen-manifest-exits-2` becomes vacuous if the list is derived from the manifest. Keep.
- `TARGETS` likewise; deriving it from `MIN_CONTROL_CASES` would hide a missing floor (`?? 0` already defaults silently).
- `failLines` is not informational-only after K43: `evaluatedDrift` and `controlPass` require it to be zero, and two selftest cases assert `failLines > 0` on mutant results. Only its duplicated scan is deletable (proposal 5). The zero-guards are uncovered by any case; a red-before case, not a deletion, is the honest next step.
- The fixture constants `UNUSED`, `TRIPWIRE`, `MODE`, `CASE_TOTAL` look dead but are mutation anchors named by the selftest's own mutants. Keep.
- `reportText`'s `MISSING_FROZEN` branch is unreachable today because `main` returns 2 before it whenever the manifest is incomplete; it is contract-shaped and cheap. Keep.
- `evaluable` has one caller, but its name is how K43 clause (a) maps onto code. Keep the name; do not inline.

## Tradeoffs

- Any applied deletion changes the file hash, so `pin.gate-mutants=e24749e4…` (SCORECARD.md:316) must be re-pinned in the same commit. This round the counter bytes are frozen, so none of this belongs in C1.
- The verified eight: 57330 → 56798 bytes, 1142 → 1149 lines. Bytes fall and each duplicated authority becomes single, but four named helpers replace inline duplicates, so the line count rises by seven.
- LSP was unavailable (`xd://lsp` answered `No such tool`), so caller evidence is literal search on the exact base bytes plus executed checks; this is a recorded fallback, not semantic proof.
- A jobs=8 run classified `cite-check:resolved-kind-gate` as UNSTABLE on identical mutated bytes under host load (`cases=73/75` versus `74/75`, `confirm=differs`). K43 clause (d) is doing its job; gate text is not reproducible at high parallelism on a loaded host.

## Evidence

`$S` is `/fast/scratch/hyaku/kumitate-r43/seats/SimplifyGateMutants`; `$LANE` is `/home/vgpnk/Projects/shokunin/kumitate-shokunin`; every run passed through `systemd-run --user --scope --quiet` with at most `-p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600` (stub-repo runs used 300 s; the two gate runs used 6G/256/900, the bounds the frozen counter allows).

```
$ env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C $LANE show 0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82:scripts/gate-mutants.mjs | sha256sum
e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a
$ git -C $S/lane checkout -q --detach e5ffcbe7f155b89cb1870f9da7b0d671d092948b && sha256sum $S/lane/scripts/gate-mutants.mjs
e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a
$ cd $S/lane && KUMITATE_GATE_MUTANTS_TMP=$S/gm-tmp node scripts/gate-mutants.mjs --selftest
GATE_MUTANTS_SELFTEST: 28/28 pass leftovers=0
VERDICT: PASS   exit=0
$ same command with candidates 1-8 applied to the clone
diff -q base-selftest-clone.txt variant2-selftest.txt → identical; 28/28 pass; exit=0
$ node $S/gm-0f4108b.mjs --repo $S/lane --rev e5ffcbe7f155b89cb1870f9da7b0d671d092948b --target cite-check --jobs 8
GATE_MUTANTS: SURVIVED (mutants=18 killed=15 frozen=13/41 drift=0 targets=1 rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b manifest=8486506f… leftovers=0)  exit=1
$ node $S/lane/scripts/gate-mutants.mjs --repo $S/lane --rev e5ffcbe7f155b89cb1870f9da7b0d671d092948b --target cite-check --jobs 8   # candidates 1-5,7,8 applied
diff <(sort gate-base.txt) <(sort gate-variant.txt) → empty (identical line set and summary); exit=1
$ same run with candidate 6 added: selftest output identical; one gate run classified resolved-kind-gate UNSTABLE under load (quoted above), which is the target suite flaking, not the report layer.
$ node $S/gm-0f4108b.mjs --repo $S/stubrepo --target cite-check / node $S/lane/scripts/gate-mutants.mjs --repo $S/stubrepo --target cite-check
base:    GATE_MUTANTS: ERROR (… drift=0 … leftovers=0) drift=0 nomatch=0 crash=0 unstable=0 timeout=0 overflow=0 control-fail=1
variant: GATE_MUTANTS: ERROR (… drift=0 … leftovers=0) nomatch=0 crash=0 unstable=0 timeout=0 overflow=0 control-fail=1
exit=2 both; the same pair with --json produced byte-identical output (diff -u empty).
$ grep -c '!run.timedOut && !run.overflow && run.groupClean && !run.spawnError' gm-0f4108b.mjs / variant
3 → 1;  eight-state literal 2 → 1;  startsWith('FAIL ') 2 → 1
$ wc -c and wc -l, base then variant
57330 → 56798 bytes; 1142 → 1149 lines
$ git -C $S/lane diff e5ffcbe7f155b89cb1870f9da7b0d671d092948b -- scripts/gate-mutants.mjs > $S/SimplifyGateMutants.patch; sha256sum $S/SimplifyGateMutants.patch
3597a775dd795b0ef45a135a61f3c2c1d2169f9fbce06d808bfb2874dec0774d  (166 lines, applies to e5ffcbe)
$ git -C $S/lane checkout -- scripts/gate-mutants.mjs && git -C $S/lane status --porcelain | wc -l
0; sha256 back to e24749e4…
$ pgrep -af $S after each run: none; ls -A $S/gm-tmp before removal: empty
```

Note: `node $S/gm-0f4108b.mjs --selftest` on an extracted counter copy fails 23/24 with `FAIL selftest-harness-exception ENOENT: … SimplifyGateMutants/cite-check.mjs`, because the selftest reads its siblings from `SCRIPT_DIR`; run it from a clone at the commit. Gate mode with `--repo` is unaffected. No tools were installed or upgraded.
