# CritDropOne — kumitate round 59

Axes: operability, coverage.

Scope: C1 operability kill rule K1, one B8 `hold()` dropped from a temp copy of the frozen `repair59-probe.mjs`, run against score revision `5469c0a58d7986ff8a5f203938ae1c8785a92213`. Observation report, not a claim verdict. This seat does not score C2.

## EXPECTED_CHECKS

Confirmed 8 on the lane probe, before the run and after it.

`grep -n EXPECTED_CHECKS` on `.ufo/waves/round-59/probe/repair59-probe.mjs` printed the assignment at line 42 (`expected-checks.source.txt`):

```text
42:const EXPECTED_CHECKS = 8;
```

The same literal is the only assignment. The other hits are the comment at line 33 and the mismatch tail at lines 157, 159, and 160. After the run, `grep -n 'const EXPECTED_CHECKS = 8;'` on that same path still printed line 42 (`post-run-lane-probe.txt`).

`grep -n hold(` on the lane probe printed eight `hold('B…')` calls, B1 through B8, plus the comment `hold()` at line 33 (`hold-calls.source.txt`). The B8 call is line 148:

```text
148:    hold('B8', a && b, `nuance=${a} pin-first=${b}`);
```

## Temp copy only

Captured `2026-10-24T21:36:48-03:00`. Interpreter: `node` `v26.12.0` at `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node` (`00-identity.txt`). `git cat-file -t` of the named rev printed `commit`. `rev-parse --verify 5469c0a58d7986ff8a5f203938ae1c8785a92213^{commit}` and `rev-parse HEAD` both printed that same hash (`rev.type`, `rev.txt`, `head.txt`). HEAD was not moved.

The worktree probe blob and the blob at the score rev are the same object, `401db5623589424a06bb2e19c4ecef8d6f5f28ee` (`probe.worktree.blob`, `probe-at-rev.blob`). The copy that was edited was those frozen bytes, not a drifted worktree file.

The runnable copy lived only at `/tmp/crit-drop-one.xl6gw2/repair59-probe.mjs`. The only deletion was the B8 `hold()` call. `EXPECTED_CHECKS` was left at 8. `expected-checks.mutant.txt` still shows `42:const EXPECTED_CHECKS = 8;`. `hold-calls.mutant.txt` lists B1–B7 and does not list `hold('B8'`. The unified diff is one deletion (`mutant.diff`):

```text
-    hold('B8', a && b, `nuance=${a} pin-first=${b}`);
```

That line is also `deleted-line.txt`. The lane path and the temp path differed (`mutant-not-lane.txt`): lane sha256 `d3fa48ed30b516659e29f484a8305733da9bfec5339ece171e3a790b9586cf37`, temp sha256 `4e06db2f1aaba9d63882504c8c9dfb15feddfc709623f393ab86c92e61a25e67`.

## Assigned command — observed

```sh
node /tmp/crit-drop-one.xl6gw2/repair59-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 5469c0a58d7986ff8a5f203938ae1c8785a92213
```

`command.txt` records that argv with a trailing space from `printf '%q '`. Observed exit code: `1` (`exit-code.txt`). Stderr was empty (0 bytes, sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`). Stdout is 371 bytes, sha256 `987c487a07bd5f1c77c700f5b5cce8e63ef8fd79b33eb78c31fd090b5ba422cf`, two lines, trailing newline (`stdout.meta.txt`, `stdout.repr.txt`).

Checks-mismatch line, byte-identical to stdout line 1:

```text
REPAIR59: REPAIR59_UNMET held=7/7 checks=8 rev=5469c0a58d7986ff8a5f203938ae1c8785a92213 rule=A59 version=v1 checks-mismatch
```

Second line:

```text
 | B1 PASS selftest-8/8 | B2 PASS clean | B3 PASS prose=19 rows=19 cite-sources=true | B4 PASS cite=true receipt=true mapv2=true 16/16=true stale135=false | B5 PASS pinned=true status=0  | B6 PASS literal | B7 PASS TIER59: A=104 B=14 C=8 rows=126
```

`grep -c` on that stdout printed `0` for `REPAIR59_HELD`, `1` for `checks-mismatch`, and `0` for `B8` (`stdout.tokens.txt`).

## Attack

Target: deleting the B8 `hold()` call while leaving `EXPECTED_CHECKS` at 8 still prints `REPAIR59_HELD` or exits 0.

It does not land. Plan K1 says a copy with one `hold()` removed and `EXPECTED_CHECKS` left at 8 prints `checks-mismatch` and does not exit 0. This run printed that token on the headline and exited `1`. The headline is `REPAIR59_UNMET`, not `REPAIR59_HELD`. `checks=8` is the untouched expected count. `held=7/7` is the seven arms on the second line (B1–B7, all `PASS`, no `MISS`, no B8), not a figure copied from the plan. The mismatch is the dropped call, not an arm failure at this rev and not an unreadable rev (exit was `1`, not `2`; stderr was empty).

The frozen headline template appends ` checks-mismatch` and does not append `want=`. K1 in `plan.md` does not require a `want=` field. The observed suffix matches that template.

## Lane probe was not replaced

After the run, sha256 of `.ufo/waves/round-59/probe/repair59-probe.mjs` was still `d3fa48ed30b516659e29f484a8305733da9bfec5339ece171e3a790b9586cf37` (`probe.sha256.before`, `probe.sha256.after`, `probe.unchanged.txt`). `git diff --exit-code` on that path exited `0` and produced an empty diff (`probe.diff.exit.txt`, `probe.diff.txt`, 0 bytes). `git status --porcelain` on that path was empty (`probe.status.txt`, 0 bytes). Post-run grep still printed line 42 `const EXPECTED_CHECKS = 8;` and line 148 `hold('B8'…)` (`post-run-lane-probe.txt`).

The temp directory was removed after the capture (`mutant.removed.txt`, `tmp_state=ABSENT`). No `.mjs` was written under this evidence directory (`mutant_mjs_under_evidence=0`). The diff and the deleted line are the deletion record, not a runnable replacement of the frozen counter.

## Limits

This seat dropped B8 only. It did not drop B1–B7, and it did not run the intact probe, so this report does not itself print `REPAIR59_HELD`. It did not run `doctrine59-probe.mjs` and does not score C2. The B5 detail in the mutant stdout ends at `status=0` with an empty popped last line (two spaces before `| B6`); that arm still printed `PASS`. The runnable temp path no longer exists; a reconstruction is the score-rev blob `401db5623589424a06bb2e19c4ecef8d6f5f28ee` minus the one line in `deleted-line.txt`.

No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. No install, pacman transaction, commit, push, dispatch, or mutating git/jj command was used. Writes were confined to this report and `.ufo/waves/round-59/build/CritDropOne/`.

Report: .ufo/waves/round-59/w1/CritDropOne.md
