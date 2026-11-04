<!-- DRAFT (K88ScribeEntry, round 88 w1). Append below the existing `## Limits` section of
corpus/knowledge/receipt-subject-binding.md. Every `scripts/receipt-bind.mjs:<n>` anchor is at
0ff3562f15c18d0ca01dc6a76c9f827d30c26950 (blob 6061484d); every `v1:<n>` anchor is the round-87
instrument at base 7ac24afa477a44304a3b125e320ef86929218189. Paths without a leading `/` resolve
beneath the lane root; `round-NN/…` resolves beneath `.ufo/waves/`. `S###` placeholders are named
by URL; the L1 binds the ids after the collision check (note: CWE-59's URL is already row S218). -->

## v2 — revision, not worktree; four fail-closed boundaries (round 88)

Contract `kumitate-receipt-bind-v2` (`scripts/receipt-bind.mjs:67`). v1's binding rule is
unchanged: the instrument is token 2 of `cmd=` (`:279–281`), the digest is `tool_sha256=`, and the
revision is the receipt's own `rev=` when it carries one, else `--rev` (`:255–261`). Two things
changed: the round can now *prove* the binding is revision-bound, and four boundaries that v1
accepted are refused.

### What round 87 could not see

Round 87's frozen 12-arm scorer could not tell revision binding from worktree binding. K87Critic's
`cand-a-worktree.mjs` is honest in every respect but one — it hashes `<lane>/<rel>` from disk
instead of the blob at the judged revision — and it scored `C87_C1: HELD held=12/12`
(`round-87/build/K87Critic/transcript-cand-a-worktree.txt:1–15`; `SCORES.md:12`). The frozen kill
rule fired and C1 was taken as a rejected-honest-stop (`corpus/lessons/round-87.md:24`, `:69`).

The lesson is about the *fixture*, not the tool: the probe ran on a clean lane, where the
worktree and the judged revision hold the same bytes, so the two byte sources gave the same
answer. On a clone whose worktree was one commit past the judged revision the same candidate fell
to 11/12 (`round-87/build/K87Critic/SCORES.md:26–27`). A binding predicate that never makes the two
sources differ cannot detect the substitution it exists to forbid. That is Q81.

Round 88's frozen 20-arm scorer (`round-88/probe/probe88-c1.mjs`, sha256 `5ccd01ec…`) builds a
fixture repository whose commit A, commit B and dirty worktree carry three different instrument
bodies (`probe88-c1.mjs:119–150`), then scores five arms against it: `rev-receipt-wins`,
`worktree-forgery`, `default-rev`, `rev-receipt-negative`, `untracked-instrument`. The worktree
twin (`round-88/controls/make-worktree-variant.mjs`, which rewrites only `blobAt`) is the
mechanical form of `cand-a-worktree` for any candidate.

### How v2 reads instrument bytes

- `blobAt(lane, rev, rel)` is the single revision read: `git cat-file blob <rev>:<rel>`
  (`:196–199`), bounded by `maxBuffer: 64 << 20` and a 120 s timeout (`:116–117`). Inherited
  `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE`/… are dropped (`:73–76`, `:105–110`).
- Every lane-relative or lane-absolute instrument goes through it at the receipt's revision
  (`:304`); an absent path at that revision is `FAIL-CLOSED UNRESOLVED` (`:305`), so a file that
  exists only in the worktree cannot bind (probe arm `untracked-instrument`).
- The default `--rev` is resolved as a commit before any receipt is read (`:222–223`); a receipt's
  own `rev=` must be 40 lowercase hex and a commit (`:258`, `:260`), and it overrides the default
  (`:259`).
- `<rev>:<path>` is git's own syntax for "the blob at the given path in the tree-ish object"
  (S### — https://git-scm.com/docs/gitrevisions; quote line-checked in
  `round-88/build/K88ScribeSources/quote-check.receipt.txt`).

### The four v2 boundaries

| token | refuses | v2 anchor | why v1 was fail-open (sentinel row) | v1 anchor |
|---|---|---|---|---|
| `ESCAPES_LANE` | a **relative** `cmd=` token that resolves outside `--lane` | `:291–296` (`:295` throws) | 1e: the relative branch fell through to the disk read reserved for absolute external instruments, so `cmd=node ../../../../../etc/hostname` read `CLEAN … external=1` | `v1:280` `if (lr.inside) rel = lr.rel; else fromDisk = true;` |
| `SYMLINK_DIR` | `--dir` that is itself a symlink | `:227–228` (lstat before `readdirSync` at `:229`) | 2a/2d: `readdirSync` followed the link, so another directory's receipts — even round 86's close dir — were judged under this path | `v1:216` (no `lstat` on `--dir`) |
| `RECEIPT_TOO_LARGE` | a receipt larger than `MAX_RECEIPT_BYTES` = 1048576 | `:68`, `:245` (size from `lstat`, checked before the read at `:248`) | 4: the receipt was read whole; a 64 MiB receipt read `CLEAN` at 185 048 kB peak RSS | `v1:234` (`st.size` never consulted) |
| `AMBIGUOUS_FIELD` | more than one `cmd=`, `tool_sha256=` or `rev=` line, equal values included | `:249–253` (`matchAll` with `g`, `:251` throws) | 3c/3d/3e: non-global `match` was first-wins, so an appended second line changed nothing visible to the verdict | `v1:236` |

Source rows for two of the classes (bound by the L1): link resolution — "does not properly prevent
that filename from identifying a link or shortcut that resolves to an unintended resource"
(S### — https://cwe.mitre.org/data/definitions/59.html, already in SOURCES as S218); path escape —
"special elements within the pathname that can cause the pathname to resolve to a location that is
outside of the restricted directory" (S### — https://cwe.mitre.org/data/definitions/22.html). Both
quotes are line-checked in `round-88/build/K88ScribeSources/quote-check.receipt.txt`
(`QUOTE_CHECK: CLEAN`).

Honest classification. The round-87 sentinel rated rows 1e, 2a, 2b and 2d FAIL-OPEN and row 4
UNBOUNDED, but rows 3c/3d/3e "SAFE (first-wins)", with the duplicate field routed as R87-S6
DOC-GAP (`round-87/w1/K87Sentinel.md:48`, `:52–55`, `:58–60`, `:61`, `:429`). v2 goes past the
sentinel's documentation remedy and fails closed. The reason is in the header (`:40–41`): under
first-wins, a receipt shows two commands and binds one of them.

Each refusal has a positive twin in the frozen probe, so blanket refusal cannot pass: the same
outside file named by an **absolute** path still binds `CLEAN matched=1 external=1` (`:286–290`,
`:300–302`); the real target of the symlinked directory binds; a 512 KiB receipt binds; a
single-field receipt binds. The do-nothing control `base-v1` scores 16/20 and fails exactly these
four arms; `refuse-all` scores 2/20 (`round-88/controls/base-v1.txt`, `refuse-all.txt`).

### Evidence (pre-M, candidate-level per Q79)

At `--rev 0ff3562f…` with the lane worktree's `scripts/receipt-bind.mjs` equal to that commit's blob
(both `098a6713…`), the frozen probe read `C88_C1: HELD held=20/20`, exit 0
(`round-88/build/K88ScribeEntry/q81-integrated.txt`). The worktree twin generated from the same
bytes read `C88_C1: UNMET held=11/20`, exit 1. It failed `selftest`, `clean-r87`, the four worktree
arms (`worktree-forgery` read `CLEAN` — the forgery bound), and the positive sub-runs of
`symlink-dir`, `oversize` and `duplicate-field` (`round-88/build/K88ScribeEntry/q81-twin.txt`).
Neither run is the measured revision M; the close battery at M is the evidence of record.

### v2 limits (measured unless marked)

From `round-88/build/K88ScribeEntry/limits.txt` (exit 0) at `0ff3562f…`:

- **`SYMLINK_DIR` checks only the last path component.** `lstat` (`:227`) does not resolve a
  symlinked *parent*: `--dir <link-to-parent>/sub` read `CLEAN matched=1` (L1). A trailing slash
  does not bypass the check, because `resolve(args.dir)` (`:548`) strips it: `SYMLINK_DIR` (L2).
  There is still no containment of `--dir` under the lane.
- **The size limit is inclusive.** A 1048576-byte receipt binds and a 1048577-byte one is
  refused (L3/L4; `:245` uses `>`).
- **Duplicates are line-anchored.** Only lines matching `^key=` count, so an indented
  ` cmd=` line is neither a duplicate nor parsed, and the receipt reads `CLEAN` (L5). A duplicate
  with an equal value is refused (L6).
- **Text after the instrument token is still not inspected.** `cmd=node scripts/receipt-bind.mjs
  --selftest | tee /dev/null; rm -rf x` reads `CLEAN` (L7). This is the other half of R87-S6,
  declared in the header (`:55`) and not closed.
- **The external read is unbounded** `[from code, not executed]`. The absolute-external branch
  reads `readFileSync(abs)` with no size or `isFile` guard (`:301`). The sentinel's `/dev/zero`
  case (`K87Sentinel.md:177–179`) stays an inference. `readdirSync` has no entry cap (`:229`).
- **Check-then-use** `[from code, not executed]`. `lstat` → `readdirSync` (`:227–229`) and
  `lstat` → `readFileSync` (`:242–248`) are separate system calls, so a path swapped between them
  is the TOCTOU class (S219 — https://cwe.mitre.org/data/definitions/367.html). Nothing here is
  descriptor-pinned.
- **The selftest does not cover v2.** The hermetic `--selftest` still runs 39 arms
  (`RECEIPT_BIND_SELFTEST: PASS held=39/39`). None of `:417–518` names `ESCAPES_LANE`,
  `SYMLINK_DIR`, `RECEIPT_TOO_LARGE` or `AMBIGUOUS_FIELD` (grep count 0, `anchors.txt`), so the four
  boundaries are held only by the frozen probe. The selftest's dirty-worktree arms (`:513–518`) are
  what make the worktree twin fail `selftest` (36/39).
- v1's limits stand: identity, not correctness; external instruments are not revision-bound
  (`:21–22`); historical `no_cmd` receipts stay unbound.
