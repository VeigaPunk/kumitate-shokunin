# K93Mutation — mutation test of the seat-route v2 candidate

Candidate: `.ufo/waves/round-93/K93ExecTool/seat-route.mjs`, sha256 `98a5a3a341b2b41540206caa5378d2ff5dacf02015f8aedf160b9d0f72b6efe9`
(= READY, one line). Copied byte-identical to scratch as `pristine.mjs` (same sha256); lane bytes unchanged
before/after all runs (`hashes.txt`). Baseline detectors on pristine: `--selftest` PASS held=54/54;
seat-form counter HELD agree=221/221, RUNTIME CLEAN (`baseline-pristine.txt`).

17 single-point mutants, each one contiguous hunk in v2-new/changed code (exact diffs `mutants-diff.txt`,
sources `mut/<id>.mjs`, per-mutant counter receipts `mut/<id>.txt`). Detectors: (a) `node <mutant> --selftest`;
(b) frozen seat-form counter `probe93-c1.py --after 2026-11-06T18:47:06.000Z --waves r91,r92` (runtime on).

ROWS=17 KILLED=16 SURVIVED=1 KILL_RATIO=16/17 = 0.9412 (94.1%) — rows in `mutants.txt`.

- 15 killed-by-selftest (also UNMET on the counter): M03 `?`-rule empty model, M04 served-only upstream,
  M05 empty-string upstream, M06 first `session_init`, M07 chain-list test, M08 non-string filter,
  M09 flag `=== true`, M10 revert role, M11 `error_attempts` key, M12 upstream dedupe, M13 recovered loose,
  M14 resolved string-only, M15 chain default null, M16 superseded dedupe, M17 served-turn `retryRecovery`.
- 1 killed-by-counter only: M01 recovered-status equality (`'recovered'`→`'Recovered'`): selftest PASS 54/54,
  counter UNMET 160/221 (A=29/61 F=14/16 H=101/120 W=16/24) — the selftest does not distinguish the exact status.
- 1 SURVIVED: M02 supersededBy object test (`isPlainObject(rr.supersededBy)` → `rr.supersededBy !== undefined`).
  Violates plan §frozen `superseded_by` ("… its `supersededBy` is an object"): it accepts strings/arrays/null.
  Output-invisible on the frozen sets because F93Supersede's string row ("q/two") maps to `?` and the same file
  already yields `?` from the `{provider:"q"}` row, so distinct-dedupe collapses it; no scored `null` case.
  Arms that kill it: (a) a lone-string-supersededBy member (error turn, `retryRecovery
  {status:"failed",supersededBy:"q/two"}`, no other error row) → oracle `[]` vs mutant `["?"]`
  (`probe/str-superseded.jsonl`, `probe/M02-survivor-output.txt`); (b) `supersededBy:null` → mutant
  fail-closes rc=2 vs oracle `[]` (`probe/null-superseded.jsonl`). COUNTER finding (not a kill event): the
  frozen counter can reach HELD with the object test removed because F93Supersede masks it; a lone-string
  fixture would close it. The shipped candidate itself agrees with the oracle; no kill event for C1.

Survivor M02 is the only coverage gap; all other v2 definitions (rename, recovered, upstream served/empty,
first-init, chain list/filter/default, flag strictness, revert role, dedupe) are discriminated by the frozen
detectors. Scratch `/fast/scratch/hyaku/kumitate-r93/K93Mutation/` removed at yield; receipts are in this seat dir.
