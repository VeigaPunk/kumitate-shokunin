# K88Review — round 88 w1 reviewer: integrated `receipt-bind` v2 at 0ff3562f vs the frozen plan

Seat K88Review (reviewer, leaf). Artifacts: `.ufo/waves/round-88/build/K88Review/` (lane-relative).
Scratch `/fast/scratch/hyaku/kumitate-r88/K88Review` was removed before yield. Nothing committed; no lane
file outside my build dir and this report was written. No tools installed or upgraded.

Pins: freeze F=`114877a308ffc0bcd63e354bcef03e6b9fe538d4`, controls C=`8735f70f545c9a0355816d5ce86b30791ae7e6be`,
instrument M=`0ff3562f15c18d0ca01dc6a76c9f827d30c26950`, lane HEAD at review `8e4ea5f6503e4dccced9ffcfbf95c6882b7cc29b`.
`scripts/receipt-bind.mjs` worktree = blob at M = `098a6713…6cace4d` (sha256 of both); probe worktree = blob at F = blob at M
= `5ccd01ec…6739d2b`; plan/probe/`make-worktree-variant.mjs` have no diff F→M or F→HEAD (`r/ordering.log`).

## Verdict

**The integrated instrument scores 20/20, but C1 should be UNMET under the frozen kill rule.** Five seat-built
controls reach `C88_C1: HELD held=20/20`. Each one skips a claimed behaviour by construction, and a fixture
shows that it does (table A). The strongest is `ctl-head-default`. For a receipt with no `rev=`, it binds lane
**HEAD** in place of `--rev`, so it skips revision binding entirely. The frozen probe cannot see this. Every fixture
arm passes `--rev B` where B is the fixture HEAD. Every lane arm uses receipts that carry their own `rev=`. My
scan of committed close/open receipts found 0 of the lane's receipts without `rev=` among the r86/r87 close dirs
(`grep -L '^rev='` empty). Plan §Kill rule: "any seat-constructed control … that reaches 20/20 makes C1 UNMET
(rejected-honest-stop)". This verdict is a recommendation; the L1 judges.

The predicate is not sound as a capability claim. Twenty arms under-determine (a) default-`--rev` binding vs HEAD
binding, (b) the numeric 1048576 limit (any limit in (≈524 KiB, 2 MiB) passes), (c) non-adjacent duplicate fields,
(d) relative escapes not spelled `../…`, and (e) "refused before it is read". The instrument at M does implement
(a)–(e) correctly (table A, integrated column). The weakness is in the scorer, not in the target.

## A. Kill-rule controls (frozen probe, `--lane <LANE> --rev M --tool <control>`)

| control (build/K88Review/) | what it skips | probe receipt | probe result | differentiating fixture (integrated → control) |
|---|---|---|---|---|
| `ctl-head-default.mjs` | revision binding: default rev = `git rev-parse HEAD`, never `--rev` | `r/seat-ctl-head-default.txt` | **HELD 20/20 exit 0** | `d/head-default--*.txt`: `--rev A`, no `rev=`, A's digest → CLEAN exit 0 → **DRIFT mismatched=1 exit 1** |
| `ctl-limit-2mb.mjs` | RECEIPT_TOO_LARGE at 1048576 (uses 2000000) | `r/seat-ctl-limit-2mb.txt` | **HELD 20/20 exit 0** | `d/limit-1p5mib--*.txt`: 1573038-byte receipt → FAIL-CLOSED RECEIPT_TOO_LARGE → **CLEAN exit 0** |
| `ctl-adjacent-dup.mjs` | AMBIGUOUS_FIELD for non-adjacent duplicates (an appended `cmd=` stays first-wins) | `r/seat-ctl-adjacent-dup.txt` | **HELD 20/20 exit 0** | `d/appended-cmd--*.txt`: `cmd=` appended after `signal=none` → AMBIGUOUS_FIELD → **CLEAN exit 0** |
| `ctl-dotdot-prefix.mjs` | ESCAPES_LANE unless the token starts with `../` | `r/seat-ctl-dotdot-prefix.txt` | **HELD 20/20 exit 0** | `d/interior-dotdot--*.txt`: `scripts/../../dm/ext.mjs` → ESCAPES_LANE → **CLEAN external=1 exit 0** |
| `ctl-size-after-read.mjs` | "refused before it is read" (reads whole, then measures) | `r/seat-ctl-size-after-read.txt` | **HELD 20/20 exit 0** | `d/sparse-600mib--*.txt`: 600 MiB sparse → RECEIPT_TOO_LARGE (0.10 s, 58 MB RSS) → **RECEIPT_UNREADABLE ERR_STRING_TOO_LONG** (0.48 s, 670 MB RSS) |
| `ctl-worktree-when-clean.mjs` | reads the worktree when the path is tracked and clean | `r/seat-ctl-worktree-when-clean.txt` | UNMET 18/20 | (fails selftest, clean-r87) |
| worktree twin of M (`integrated-worktree.mjs`, `make-worktree-variant.mjs` at M) | blobAt → worktree | `r/worktree-twin-M.txt` | UNMET 11/20 exit 1 | — |

Generator: `make-seat-controls.mjs` (each rewrite asserts its anchor occurs exactly once). Run with
`node build/K88Review/make-seat-controls.mjs build/K88Review/integrated-0ff3562.mjs build/K88Review`. Demo driver:
`demo-controls.sh <scratch>`. (A first `ctl-adjacent-dup` build was syntactically broken because of the `$\``
replacement pattern in `String.replace`. It scored 0/20 and is discarded. The generator now uses a function
replacer, and the receipt above comes from the fixed build: `node --check` is clean on all six.)

## B. Findings on the integrated instrument (`scripts/receipt-bind.mjs` at M)

Every repro is in `findings.sh <scratch>`, which builds a fixture repo with commit A (v1), commit B (v2) and a
dirty worktree (v3). Receipts are in `f/`.

| sev | file:line | repro (receipt) | observed | note |
|---|---|---|---|---|
| **MED** | scripts/receipt-bind.mjs:286-290 | `f/i-proc-alias-worktree.txt`: `cmd=node /proc/self/root<repo>/scripts/tool.mjs`, digest of the **dirty worktree** v3, `--rev B` | `CLEAN matched=1 … external=1` exit 0 | Lane membership is lexical (`path.relative`, no realpath). Any alias of an in-lane path is treated as external, so its worktree bytes are bound. This contradicts header l.19 "Bytes come from the judged revision, never from the worktree". Same result with a symlinked alias of the lane (`f/i2-symlink-alias-worktree.txt`). The canonical path gives DRIFT (`f/i3-…`). Disclosed only as `external=1`, and the close predicate requires mismatched=0 unchecked=0, not external=0. |
| LOW-MED | scripts/receipt-bind.mjs:249-256 | `f/d-bom-rev-ignored.txt`: UTF-8 BOM + `rev=A`, B's digest, `--rev B` | `CLEAN matched=1` exit 0 (should be DRIFT) | With a BOM before it, `^rev=` misses line 1, so the receipt's own `rev=` is silently dropped. `f/e-bom-duplicate-rev.txt`: BOM+`rev=A` then `rev=B` gives **CLEAN**, not AMBIGUOUS_FIELD, so the BOM bypasses AMBIGUOUS_FIELD. |
| LOW | scripts/receipt-bind.mjs:227-228 | `f/b-symlink-parent.txt`: `--dir <symlink-to-parent>/close` | `CLEAN matched=1` exit 0 | Only the last component is checked. This is within the contract's letter ("--dir is itself a symlink") but leaves the same route open one level up. |
| LOW | scripts/receipt-bind.mjs:242-248 | [INFERENCE, not run] | — | Size is checked on `lstat`, then the file is read by path with no cap. A file that grows between the two calls (TOCTOU) is read whole. An fd + `fstat` + bounded read would close the gap. |
| LOW | scripts/receipt-bind.mjs:339-528 | `r/integrated-run1.txt` ARM selftest | `held=39/39`, identical to base-v1 (`r/base-v1-run1.txt`) | The hermetic selftest was not extended: none of the four v2 tokens is exercised in-tool. Only the external probe covers them. |
| INFO | :250 | `f/g-key-in-output.txt` (output line starting `rev=`) | FAIL-CLOSED AMBIGUOUS_FIELD | Keys inside output lines do fire AMBIGUOUS_FIELD. This fails closed, not open. Exposure: 0 of 723 committed `.ufo/waves/*/{close,open}/*.txt` carry a repeated `rev=`/`cmd=`/`tool_sha256=` line. |
| INFO | :250 | `f/h-lone-cr-dup.txt` (`OK\rcmd=…`) | AMBIGUOUS_FIELD | A lone CR is a JS `/m` line break, which is conservative. |
| OK | :227-228 | `f/c-dangling-symlink-dir.txt` | SYMLINK_DIR exit 2 | `lstat` comes first, so a dangling symlink gives SYMLINK_DIR, not DIR_UNREADABLE. |
| OK | :548 | `f/a-symlink-dir-trailing-slash.txt`, `f/a-symlink-dir-dot.txt` | SYMLINK_DIR | `resolve(args.dir)` strips `/` and `/.` before `lstat`. |
| OK | :250 | `f/f-crlf.txt` | CLEAN | `.` stops before `\r`, then trim. |
| OK | :245 | `f/k-exact-1048576.txt` / `f/k-1048577.txt` | CLEAN / RECEIPT_TOO_LARGE | Exact boundary is correct, and the check runs before the read. |
| OK | :295 | `f/n-interior-dotdot.txt` | ESCAPES_LANE | Interior `..` is caught. |
| OK | :250 | `f/o-appended-dup-cmd.txt` | AMBIGUOUS_FIELD | Non-adjacent duplicate is caught. |
| OK | header l.5,31-41; USAGE l.97-98 | read | — | Contract string, token list and v2 boundary block are consistent with plan l.61-67. `blobAt` (l.196) is unchanged, so the frozen twin interface holds. |

## C. Reruns (frozen probe, `--work` under my scratch)

| run | receipt | result |
|---|---|---|
| integrated, default tool, `--rev M`, run 1 / run 2 | `r/integrated-run1.txt`, `r/integrated-run2.txt` | `C88_C1: HELD held=20/20` exit 0 both. Byte-identical modulo scratch paths (sweep flip `s-cite-sources.mjs.txt` both times; K87-V4 determinism holds). |
| base-v1 (`base-v1.mjs` = blob at F, sha `b640ff31…` = committed receipt's `tool_file_sha256`), `--rev F`, run 1 / run 2 | `r/base-v1-run1.txt`, `r/base-v1-run2.txt` | UNMET 16/20 exit 1 both. Arms are identical to `controls/base-v1.txt` apart from the fixture commit id. Fails exactly escape-relative, symlink-dir, oversize, duplicate-field. |
| control `refuse-all` (cmd from `controls/refuse-all.txt`, own `--work`) | `r/control-refuse-all-rerun.txt` | UNMET 2/20 exit 1, matching the committed result. |
| control `r87-cand-a-worktree` (cmd from receipt, own `--work`) | `r/control-r87-cand-a-worktree-rerun.txt` | UNMET **10/20**, vs **12/20** committed. clean-r87 and sweep now fail because the lane worktree's `receipt-bind.mjs` changed after F (v1→v2). Worktree-reading controls' committed scores depend on worktree state and do not reproduce byte-for-byte. Both are below 20. |

## D. Ordering and plan-before-ready

- `git log`: F 19:01:53 (ct 1793829713) < C 19:02:49 (1793829769) < M 19:03:36 (1793829816) < marker commit 8e4ea5f
  19:05:22 (1793829922). `merge-base --is-ancestor` returned rc=0 for F→C, C→M and F→M (`r/ordering.log`). The only
  commit that adds `plan.md` is F. The controls are pre-instrument, as the plan requires.
- `plan-before-ready.sh --repo <LANE> --rev M --round 88` gave **NA reason=NO_MARKER exit 2**, `map=CLEAN files=223`
  (`r/plan-before-ready-r88-at-M.txt`). This is expected: no marker exists at M.
- `plan-before-ready.sh --repo <LANE> --round 88` (HEAD 8e4ea5f) gave **PASS exit 0**, plan=F, `marker_kind=dispatch`
  (`w1-dispatch.json`), `map=CLEAN` (`r/plan-before-ready-r88-at-HEAD.txt`). `w1.ready` is still untracked, so the
  marker is the dispatch fallback. Once a `.ready` is committed it becomes MARKER under the `.ready`-first rule. It
  still comes after F.

## Residual risk / verification gaps

- `sources-census.sh validate kumitate` was not run, so it is unverified.
- The round's own close receipts do not exist yet, so the CLEAN mismatched=0 unchecked=0 condition is unverified.
- The TOCTOU row is inference only.
- Applying the kill rule to the partial-skip controls (limit, adjacent, dotdot, size-after-read) involves
  interpretation. `ctl-head-default` is a full skip of default-`--rev` binding, and on its own it is enough to
  meet the frozen kill-rule wording.
