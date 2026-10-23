# ReviewC2Agree — C2 verification

## Findings

- **P2 — The assigned AGREE invocation duplicates the probe's positional lane/revision arguments.** The requested command passes the lane and revision after `--`, while `scripts/counter-rerun.mjs` already launches the probe as `node <probe> <o.lane> <o.rev> ...rest` (clone lines 197–199). The frozen F48 probe removes `--set` and requires exactly two remaining arguments (probe lines 100–106). Thus this invocation supplies four positional arguments; both probe runs print `CAPROUTE48: ERROR usage: caproute48-probe.mjs <lane-repo> <rev> [--set r48|r47]` and exit 2, and the wrapper fail-closes with exit 2. It prints neither AGREE nor DISAGREE. Exact output is preserved in `ReviewC2Agree-agree.txt`. To use this instrument's documented calling convention, the tail must be `-- --set r48` (without another lane/rev pair).

## Results

- **Selftest: PASS.** At clone revision `ce9aee5daf71004a5890134f9526cc6fe424b206`, all 14 selftest cases passed, including the flake-injection and the verdict-/path-stub mutation controls; `COUNTER_RERUN_SELFTEST: PASS`, exit 0. Receipt: `ReviewC2Agree-selftest.txt`. The script's SHA-256 is `c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b`.
- **Assigned real-probe command: FAIL-CLOSED, not a score.** Both attempts stopped at probe usage validation, before any F48 gate run. Probe SHA-256: `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59`.
- **Separate existing positive evidence (not this seat's run):** `../r48/L1-c2-binding-ce9aee5d.txt:29–33` records the corrected tail `-- --set r48`, two exit-0 F48 probe runs with the identical summary `CAPROUTE48 rev=ce9aee5daf71004a5890134f9526cc6fe424b206 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48+A48`, and `COUNTER_RERUN: AGREE (runs=2)`. That receipt used the lane working-tree path as `--lane`, not this seat's clone; I did not independently reproduce the corrected invocation.

## Residual risk and verification gaps

- I did not run the corrected command: the frozen probe hardcodes scratch writes to `/fast/scratch/hyaku/kumitate-r48/probe-runs` (`caproute48-probe.mjs:51, 333–356`), outside this assignment's write bounds. The probe was not edited or redirected. The existing L1 receipt is the available positive AGREE evidence; its commit/landing status was not checked here.
- The LSP device is not mounted (`xd://lsp` returned “No such tool”; mounted devices are `ast_edit`, `debug`), so no LSP status/references/definition/diagnostics were available. Source conclusions above come from direct reads of the instrument and probe; fallback text search was used only to locate literal references, not as semantic proof.
- Before-state check: `scripts/counter-rerun.mjs` is absent at `fe3d45bf` and present at the target revision. No source changes were made.
