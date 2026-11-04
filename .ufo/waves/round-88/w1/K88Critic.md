# K88Critic — round 88 w1 (critic seat)

Verdict: **the kill rule fires. C1 is UNMET as frozen.** Seven seat-built controls reach
`C88_C1: HELD held=20/20` exit 0 under the frozen probe. Two of them are one-line changes that do not
look at the fixture at all. The integrated instrument (0ff3562f) scores 20/20 and does the right thing
on every discriminating case I built. The weakness is in the probe's coverage, not in the tool.

Artifacts (all under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88Critic/`):
`SCORES.md` (table), `transcript-<name>.txt` (one frozen-probe receipt per construction),
`disc-<name>.txt` (out-of-probe discriminator receipts), `cand/<name>.mjs` + `cand/<name>.diff`,
`score.sh` (driver), `discriminate.mjs` (discriminator). Probe sha256 `5ccd01ec…6739d2b`. It is byte-equal to
`git show 114877a3:.ufo/waves/round-88/probe/probe88-c1.mjs`. Instrument sha256 `098a6713…cace4d`, equal to
`git show 0ff3562f:scripts/receipt-bind.mjs`.

## Scores (frozen probe, `--rev 0ff3562f15c18d0ca01dc6a76c9f827d30c26950`)

| construction | held | failing arms |
|---|---|---|
| integrated | 20/20 | — |
| (a) worktree twin | 11/20 | selftest, clean-r87, rev-receipt-wins, worktree-forgery, default-rev, untracked-instrument, symlink-dir, oversize, duplicate-field |
| (b) ignore receipt `rev=` | 16/20 | selftest, clean-r87, rev-receipt-wins, rev-receipt-negative |
| (c) `HEAD:<rel>` everywhere | 16/20 | same four |
| **(c2) HEAD only when the receipt has no `rev=`** | **20/20** | — |
| **(d) fixture-gated boundaries** | **20/20** | — |
| (d2) fixture-gated revision binding | 19/20 | clean-r87 |
| (e) index `:<rel>` everywhere | 16/20 | same four as (b) |
| **(e2) index only when the receipt has no `rev=`** | **20/20** | — |
| **(f1) size checked after reading the whole file** | **20/20** | — |
| **(f4) ESCAPES_LANE only for tokens that literally start with `../`** | **20/20** | — |
| **(f5) size limit 2000000 instead of 1048576** | **20/20** | — |
| **(f6) duplicate `rev=`/`tool_sha256=` lines allowed when values are equal** | **20/20** | — |

Each 20/20 line was produced by `bash score.sh <name> <cand>`, which runs
`node <probe> --lane <lane> --work /fast/scratch/hyaku/kumitate-r88/K88Critic/w-<name> --rev 0ff3562f… --tool <cand>`.
The `exit=` line in each transcript gives the probe exit: 0 for every 20/20 row, 1 for the others.

## Counterexamples, evidence, impacted axes

1. **c2 and e2: revision binding of the default `--rev` is never tested (strongest finding).** Every arm that
   relies on the default revision (default-rev, worktree-forgery, untracked-instrument, unchecked, rev-bad) runs
   `--rev B` where B is the fixture's HEAD and also its index. Every lane-side arm (detect-r86, clean-r87,
   sweep) uses receipts that carry their own `rev=`: `grep -c '^rev='` gives 1 for every round-86 and round-87
   close receipt, and sweep writes `rev=<REV>`. So a tool that validates `--rev` and then reads `HEAD:<rel>`
   (c2) or `:<rel>` (e2) passes everything. The tool's own selftest also always uses `--rev c2` with c2 = HEAD.
   - On a lane fixture with HEAD = B, a receipt with no `rev=`, B's digest and `--rev A`, the integrated tool
     gives `DRIFT mismatched=1`. c2 and e2 give **`CLEAN matched=1`**, i.e. they fail open (`disc-c2-head-default.txt`,
     `disc-e2-index-default.txt`, `disc-integrated.txt`).
   - Impacted axes: revision binding, the claim's headline behaviour ("AT A JUDGED REVISION").
   - Neither construction looks at the fixture, so this is a probe defect and not the fixture-awareness limit
     described in item 2.
2. **d: fixture-aware.** All four v2 boundaries are enforced only when `resolve(--dir)` matches `/probe88/`;
   otherwise the tool behaves like v1 (first match wins, escapes count as `external`, no size cap, symlinked dir
   followed).
   - It passes all 20 arms. That includes the four boundary arms (escape-relative, symlink-dir, oversize,
     duplicate-field), because every probe fixture sits under `<work>/probe88/`.
   - The arms whose dirs are not under `probe88` (detect-r86, clean-r87, sweep) never exercise a boundary.
   - Outside a `probe88` path, d gives `CLEAN` on a symlinked dir, an inner-`..` escape, a 1.5 MiB receipt, a
     256 MiB sparse receipt (maxrss 580340 kB) and both duplicate cases (`disc-d-fixture-gated-boundaries.txt`).
   - d2, the same trick applied to revision binding, is caught only by `clean-r87`. That works only because
     `scripts/receipt-bind.mjs` in the lane worktree now differs from the round-87 revision, so it is incidental.
   - **Does (d) count under plan.md?** The plan's definition is "a tool that skips a claimed behaviour (revision
     binding, receipt `rev=` precedence, or one of the four new fail-closed boundaries) by construction". By that
     wording, yes: d skips all four boundaries on every input that is not the probe's.
   - But a fixed black-box probe can never rule out fixture detection. Counting d means no frozen probe can ever
     be HELD. That is a tradeoff for the canonical judge to decide, not something a seat can fix.
   - I checked the integrated tool for fixture keying: `grep -c probe88 scripts/receipt-bind.mjs` gives 0.
   - The UNMET verdict does not depend on d, because c2 and e2 fire the kill rule without any fixture awareness.
3. **f1: the size check can come after the read.** The plan says a large receipt is "refused before it is
   read". f1 reads the whole file and then refuses it. Both produce the same `RECEIPT_TOO_LARGE` token, so the
   probe cannot tell them apart. On a 256 MiB sparse receipt the integrated tool peaks at maxrss 56580 kB and f1
   at 579836 kB (`disc-f1-size-after-read.txt`). Impacted axis: the RECEIPT_TOO_LARGE boundary.
4. **f4: path escapes are checked by text, not by resolution.** The probe's only escaping token is
   `../outside/ext.mjs`. With `node scripts/../../outside/ext.mjs` the integrated tool gives `ESCAPES_LANE`;
   f4 gives `CLEAN external=1`, which is the exact round-87 sentinel fail-open, still reachable
   (`disc-f4-textual-escape.txt`). Impacted axis: the ESCAPES_LANE boundary.
5. **f5: the 1048576 limit itself is not tested.** The probe tests 2 MiB (refused) and 512 KiB (accepted), so
   any limit between them passes. A 1.5 MiB receipt gives `RECEIPT_TOO_LARGE` from the integrated tool and
   `CLEAN` from f5. Impacted axis: the RECEIPT_TOO_LARGE boundary at the claimed value.
6. **f6: duplicate lines with equal values are tested only for `cmd=`.** The probe's dup-digest and dup-rev
   variants use different values. The plan says "more than one `cmd=`, `tool_sha256=` or `rev=` line", and the
   probe's own comment says "(equal values included)". For `rev=B` twice, the integrated tool gives
   `AMBIGUOUS_FIELD` and f6 gives `CLEAN`. This is the weakest of the seven, since an equal duplicate is
   semantically harmless, but by the frozen text it still counts. Impacted axis: the AMBIGUOUS_FIELD boundary.

Constructions (a), (b), (c) and (e) are caught as the plan predicts, and the worktree twin is well below the
bar. The round-87 hole (worktree binding) is closed. Its neighbour is still open: binding HEAD or the index in
place of the judged `--rev`.

## Fixable defect vs tradeoff

- **Fixable (needs a new frozen probe in a later round; this round's probe and kill rule are not rewritten):**
  - default-rev with `--rev A` while HEAD and the index are B (kills c2 and e2);
  - an inner-`..` relative escape (kills f4);
  - a receipt of 1048577 bytes refused and one of 1048576 bytes bound (kills f5);
  - equal-valued duplicate `rev=` and `tool_sha256=` lines (kills f6);
  - a sparse multi-GiB receipt that must be refused within a small RSS or time budget (kills f1);
  - fixture dirs with randomised names and no `probe88` in the path, plus at least one boundary case inside a
    lane-side dir (makes d, which keys on the path, harder; it cannot be ruled out entirely).
- **Tradeoff for the canonical Rust judge:** whether fixture-aware tools (d) count under the kill rule.
  Counting them makes every black-box predicate unmeetable, so they can only be excluded by source review of
  the integrated tool.
- **Smallest safe correction for this round:** none inside the frozen scope. Record C1 as a rejected-honest-stop
  under the frozen kill rule, citing `transcript-c2-head-default.txt` and `transcript-e2-index-default.txt`, and
  carry the probe gaps above as the next round's predicate inputs. The integrated instrument needs no change for
  any of these cases.

## Commands run (cwd fleet root, absolute paths)

- `node …/controls/make-worktree-variant.mjs …/scripts/receipt-bind.mjs …/build/K88Critic/cand/a-worktree-twin.mjs`
  exited 0 and printed `MAKE_WORKTREE_VARIANT: WROTE`.
- `bash …/build/K88Critic/score.sh <name> <cand>` ran for 13 tools, 6 in parallel via xargs. Each receipt is
  `transcript-<name>.txt`, with its `exit=` line.
- `node …/build/K88Critic/discriminate.mjs --tool <cand> --work /fast/scratch/hyaku/kumitate-r88/K88Critic/d-<name>`
  ran for 8 tools; every run exited 0. Receipts are `disc-<name>.txt`.
- Read-only git only: rev-parse, show, diff, status. Nothing was committed or staged.
- Tools installed: none (I used the host's node v24.21.0, git and /usr/bin/time).
- Scratch `/fast/scratch/hyaku/kumitate-r88/K88Critic` and `/tmp/k88c-src.mjs` were removed before yield. The
  `---` header lines in `cand/*.diff` name `/tmp/k88c-src.mjs`; that file was a byte copy of
  `git show 0ff3562f:scripts/receipt-bind.mjs`, and the diffs are not cited as /tmp evidence.
