# ExecProxy — kumitate round 58

Axes: operability + coverage. Measured integration revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1).

## Scoped findings

1. **The exact item command on the live lane did not read MATCH.** It exited 1 with `A_DRIFT` as the only reported mismatch: declared `A=93`, computed `A=188`, delta `+95` on the first run. Stderr was empty.

   ```text
   PROXY  error  A_DRIFT  A: declared=93 computed=188 delta=+95
   PROXY: DRIFT (A_DRIFT term=A declared=93 computed=188 delta=+95; src-rev=31c465f15669)
   ```

2. **The drift is from auxiliary round-58 build files, not R1's committed A term.** A later paired census and exact rerun observed `liveRunnable=291`, `r1Runnable=93`, and `delta=198`; the census partitioned the 291 into 93 outside `.ufo/waves/round-58/build/` and 198 inside it. The immediately following strict rerun independently printed `A_DRIFT ... declared=93 computed=291 delta=+198`, exit 1. Live A changed while seats created and removed sandbox copies, so the first and later numeric deltas are separate observations, not a stable production count.

3. **All other requested terms matched in the JSON follow-up.** `node .../proxy-check.mjs --strict --json` exited 1 with exactly one finding, `A_DRIFT` (A was 375 at that observation). Its computed terms included `C=28`, `C1=19/19`, `C2=138/138`, `K=52/52`, `operability=9`, `coverage=10`, and six of six parent pins matched. No C, C2, K, axis, pin, or warning mismatch was observed.

4. **R1 independently corroborates the expected clean proxy result.** An existing sandbox clone was used read-only; its HEAD was R1 before and after the run and `git diff --no-ext-diff --quiet 6affb9ebde37b7d663658f1959d64f0f0b68f480 --` exited 0. Its strict proxy exited 0 with empty stderr:

   ```text
   PROXY: MATCH (A=93 C=28 operability=9; C1=19/19 C2=138/138 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=52/52 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
   ```

   Thus the expected H3 terms hold on the verified R1 tree, while the prescribed live-lane invocation is sensitive to runnable files in seat build directories.

## Evidence

Full commands, stdout, stderr, and exit codes are under `.ufo/waves/round-58/build/ExecProxy/`:

- `proxy-strict.*.txt` — exact first item run.
- `proxy-strict-json.*.txt` — full computed/declared terms and sole finding.
- `live-a-census.*.txt` plus `proxy-strict-rerun.*.txt` — paired auxiliary-file census and exact rerun.
- `r1-clone-head-before.*.txt`, `r1-clone-diff.*.txt`, `r1-clone-proxy-strict.*.txt`, `r1-clone-head-after.*.txt` — clean R1 corroboration.
- `head.*.txt`, `r1.*.txt`, `r1-worktree-diff.*.txt` — live lane HEAD was R1 and its tracked worktree diff against R1 was empty.
- `r1-ls-tree.*.txt` — committed R1 path census used by the runnable-file count.

No production file, another seat's directory, Git/JJ state, or index was modified. No commit, push, install, dispatch, or subagent spawn occurred.

Report: .ufo/waves/round-58/w1/ExecProxy.md
