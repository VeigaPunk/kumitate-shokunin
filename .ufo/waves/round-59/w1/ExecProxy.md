# ExecProxy — kumitate round 59

Axes: operability + coverage. Named item: `node scripts/proxy-check.mjs --strict` on the live lane. Expected `PROXY: MATCH` with `A=96`, `C=29`, `C2=141/141`. Score revision named by the wave: `5469c0a58d7986ff8a5f203938ae1c8785a92213`. This report is not a round verdict.

## Scoped findings

1. **The exact item command printed MATCH, and the three expected tokens are in that line.** Exit 0. Stderr was empty (0 bytes). Stdout was one line (209 bytes), captured at `2026-10-24T21:30:29-03:00`:

   ```text
   PROXY: MATCH (A=96 C=29 operability=9; C1=19/19 C2=141/141 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=52/52 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
   ```

   No mismatch on `MATCH`, `A=96`, `C=29`, or `C2=141/141`. No other `PROXY` finding line was printed.

2. **An independent recount of those three terms agrees, and the scorecard stanza declares the same integers.** A walk that skips any directory named `.git` and counts `*.mjs|*.js|*.sh|*.py` printed `A=96`. `SKILL.md` lines matching `^\s*- \[` printed `C=29`. `corpus/README.md` lines matching `^\| \`(knowledge|lessons)/` printed `C2=141`, and `*.md` under `corpus/knowledge` plus `corpus/lessons` printed `C2_total=141`. The `kumitate-proxy-v1` stanza in `SCORECARD.md` declares `A=96`, `C=29`, `C1=19`, `C1_total=19`, `C2=141`, `C2_total=141`. `floor(10 × (96+29)/(96+29+3))` is 9, which is the operability integer on the printed line. S, R, K, C1, pins, and coverage were not independently re-counted; they are quoted from the command.

3. **The printed `src-rev` is the pinned origin HEAD, and the lane HEAD at the paired read was the score revision.** Read-only `git rev-parse HEAD` issued with the proxy run printed `5469c0a58d7986ff8a5f203938ae1c8785a92213` (`HEAD_EQ_REV=yes`, subject `round-59: put the frozen A59 literals on one line`). Porcelain at that call was 14 untracked paths, all under `.ufo/waves/round-59/`, and no tracked modification. A later capture (`2026-10-24T21:31:00-03:00`) printed the same HEAD. `.ufo/pins/origin.json` is `kumitate-origin-pin-v1` revision `31c465f15669f744848bd9f5d56191c5085670f7`, clone `/fast/scratch/hyaku/kumitate-pin/src`; `git -C` that clone `rev-parse HEAD` exited 0 and printed the same full revision. The verdict's `src-rev=31c465f15669` is that prefix.

## Evidence

Commands, stdout, stderr, and exit codes are under `.ufo/waves/round-59/build/ExecProxy/`:

- `command.txt`, `started-at.txt`, `finished-at.txt`, `proxy-strict.stdout.txt`, `proxy-strict.stderr.txt`, `proxy-strict.exit.txt`, `proxy-strict.shape.txt` — exact item run.
- `independent-recount.txt` — A, C, C2, C2_total recounted outside the proxy.
- `stanza-declared.txt` — declared stanza integers.
- `operability-arithmetic.txt` — floor arithmetic on the recounted A and C.
- `pin-src-rev.txt` — pin revision versus clone HEAD.
- `git-head.txt` — later read-only HEAD capture, same hash as the paired run.

No production file, another seat's directory, Git/JJ state, or index was modified. No commit, push, install, or subagent spawn occurred.

Report: .ufo/waves/round-59/w1/ExecProxy.md
