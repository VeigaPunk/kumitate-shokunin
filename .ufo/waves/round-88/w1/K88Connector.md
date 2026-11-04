# K88Connector — round 88 connector report (sibling overlap + cross-round recurrence)

Seat: K88Connector (connector, leaf). Lane HEAD at measurement `8e4ea5f6503e4dccced9ffcfbf95c6882b7cc29b`;
integrated instrument `scripts/receipt-bind.mjs` sha256 `098a6713e663cbb9444ea6ec1da503cbf4bba5690c492b5ec9e73f9ee6cace4d`
(the same bytes as `git cat-file blob 0ff3562f…:scripts/receipt-bind.mjs`, recorded in `receipt-adjacency.txt`).
Frozen plan and probe read before any work. Nothing committed; nothing outside my build dir and this report written.
Tools installed: none.

## Headline (read this first)

**The frozen kill rule fires.** A control I built reaches `C88_C1: HELD held=20/20`, exit 0.
`build/K88Connector/ctl-abs-disk.mjs` (sha256 `ef999ccf34ce2302a1c04a42c559f083befcfe59785e38045fc804303678cf3b`) is
`git cat-file blob 0ff3562f…:scripts/receipt-bind.mjs` with **one** change (lines 304-305):
an ABSOLUTE `cmd=` token that resolves inside the lane is hashed from the **worktree** (`readFileSync(abs)`),
not through `blobAt(lane, rev, rel)`. So it skips revision binding for absolute in-lane tokens, by construction —
the plan's definition of a seat-constructed control (`plan.md:33-34`, "skips a claimed behaviour (revision
binding, …) by construction").

| evidence | receipt (beneath `.ufo/waves/round-88/build/K88Connector/`) | reading |
|---|---|---|
| control vs frozen probe | `probe-ctl-abs-disk.txt` | 20 `ARM … PASS` lines (A2 `RECEIPT_BIND_SELFTEST: PASS held=39/39`), `C88_C1: HELD held=20/20`, `exit=0` |
| the same one-line change on the L1's uncommitted worktree `scripts/receipt-bind.mjs` (+65 selftest lines, bind logic unchanged, mtime 19:11:08) | `probe-ctl-abs-disk-wip-selftest.txt` (control `ctl-abs-disk-wip-selftest.mjs`) | also `HELD held=20/20` exit 0 |
| the control really binds the worktree | `adjacency-ctl-abs-disk.txt` case X2b | dirty worktree, absolute in-lane token, digest of the worktree bytes → `CLEAN matched=1 … external=0` |
| the integrated instrument on the same input | `receipt-adjacency.txt` case X2b | `DRIFT matched=0 mismatched=1` exit 1 |
| integrated instrument vs frozen probe (sanity) | `probe-integrated.txt` | `HELD held=20/20` exit 0 |
| integrated worktree twin | `probe-integrated-worktree.txt` | `UNMET held=11/20` exit 1 |

Provenance note: `probe-integrated.txt` (19:10:17) and `cand-instrument-parity.mjs` (copied 19:09:57) predate
the worktree edit to `scripts/receipt-bind.mjs` at 19:11:08 (`git -C <lane> diff --stat` → 65 insertions in the
selftest only); they measured the committed `0ff3562f` bytes (`receipt-adjacency.txt` records equal sha256 for the
worktree file and the committed blob). `integrated-worktree.mjs` was also generated before 19:11:08.

Why no arm sees it: every fixture whose worktree differs from the judged revision (`probe88-c1.mjs:224-258`, arms
A11-A15) names the instrument through the RELATIVE token `TOOL_CMD = 'node scripts/tool.mjs --run'`
(`probe88-c1.mjs:152`). Absolute in-lane tokens appear only in the A5 `clean-r87` copies (the round-86/87 probe
paths), where the lane worktree equals the revision, so worktree and revision bytes agree. The worktree-twin
generator (`controls/make-worktree-variant.mjs`) rewrites only `function blobAt`; a control that bypasses
`blobAt` at the call site is outside what it can generate. Under the frozen rule C1 is UNMET
(rejected-honest-stop). I report this, not a ruling: the L1 (KumitateR88, messaged) and the critic own the call.
Contradiction stated rather than averaged: the integrated instrument does the right thing on X2b, and the frozen
predicate cannot tell it from a tool that does not.

## Axes named

(a) C1 claim truth (does "never the worktree" hold for every token form); (b) kill-rule discrimination (can the
frozen probe separate the claim from a tool that skips it); (c) stability of the one fixed attack target;
(d) close gates and census, which I leave alone.

## (1) Sibling overlap table (READ ONLY; adjacency evidence, nothing edited)

Scope searched: `/home/vgpnk/Projects/shokunin/{kake,tabi}-shokunin/scripts/` (the only sibling lanes with a
`scripts/` dir; `ls -d /home/vgpnk/Projects/shokunin/*-shokunin/scripts` → kake, kumitate, tabi) and fleet
`/home/vgpnk/Projects/shokunin/scripts/` (+ `hyaku/`). Grep `tool_sha256|instrument_sha|receipt.*sha256`, then
read the hits that bind a receipt to bytes at a revision. The `*-loopback-round*.mjs` / `webview2-*` hits only
*write* their own `driverSha256` into a receipt (no binder), so they are excluded.

Column key: **E** = relative escape (ESCAPES_LANE analogue), **SD** = symlinked receipt dir, **TL** = unbounded
receipt read, **AF** = duplicate field/key resolves silently, **SB** = 5th class found this round: the revision
read does not check the tree mode, so a mode-120000 symlink blob is hashed as its link text.

| tool (file:line) | what it binds | E | SD | TL | AF | SB |
|---|---|---|---|---|---|---|
| kumitate `scripts/receipt-bind.mjs:196-199` (`blobAt`), `:286-290` (absolute token, lexical `laneRel`), `:300-302` (external read) | dir of text receipts → instrument named by `cmd=` token 2, at `rev=`/`--rev` | closed `:295` | closed `:228` | closed `:245` (receipt); **open** for the external instrument read `:301`: FIFO hangs (X4, killed at 5 s) | closed `:249-253` | **open**: X1 `CLEAN matched=1 external=0` on a symlink blob; plus X2: an absolute alias path into the lane binds worktree bytes `CLEAN external=1` |
| kake `scripts/instrument_receipts.py:57-69, :369-399` | one committed JSON receipt at `--revision` → population blobs at the receipt's declared revision (which must be an ancestor, `:428-445`) | relies on git: `PATH_RE` `:118` allows `..` segments; [INFERENCE, unrun] `git ls-tree` refuses an out-of-repo pathspec → `Unevaluable` | n/a (receipt read via `cat-file`) | n/a for the verdict; the worktree copy read at `:381-383` follows symlinks with no size bound (diagnostic `worktree_state` only) | **open**: `json.loads` at `:397` with no `object_pairs_hook`; duplicate `"revision"` keys resolve last-wins [INFERENCE from Python json semantics, unrun]; duplicate *entries* are caught `:469-486` | **closed**: `REGULAR_MODES` `:121`, finding `symlink` at `:507-510`, refusal at `:613-614` |
| kake `scripts/receipt_replay.py:13-24, :108-123, :236-240` | round-23 receipt sets replayed at REV | n/a | n/a (git at REV) | n/a | **closed**: `_unique_members` hook rejects duplicate member names `:108-109, :123` | not inspected |
| tabi `scripts/check-bidi-runtime.mjs:465-469, :775-791` | receipt's `driver` path → `git show <rev>:<path>`, `driverSha256` compared | **closed**: `..` or a leading `/` → `null` → "driver absent" | n/a | n/a | open in kind: receipt `JSON.parse` resolves duplicate keys last-wins [INFERENCE, unrun] | **open in kind**: `git show` of a symlink blob prints the link text; no mode check [INFERENCE, unrun] |
| tabi `scripts/check-s106-evidence.mjs:69-73, :109-121` | receipt at rev → `bytes_path` at the receipt's `measured_rev` (the analogue of kumitate's `rev=` precedence) and at rev | relies on git; no lexical guard [INFERENCE] | n/a | n/a (`maxBuffer` 64 MiB `:62`) | open in kind (`JSON.parse` `:91`) [INFERENCE] | open in kind (`git show`, no mode check) [INFERENCE] |
| tabi `scripts/round-evidence-audit.mjs:97-123, :989-1006, :1040-1084` | lane bytes at `--rev`; the fleet `--report`/`--policy` read from disk and digest-disclosed | n/a | n/a | the `--report`/`--policy` `readFileSync` follows symlinks with no size bound, but the inputs are digest-disclosed (the same shape as kumitate's `external=`) | not inspected | partly: verifies the object type and re-hashes the oid with sha1 (`:113-121`); a symlink blob is still type `blob`, so the mode is unchecked |
| tabi `scripts/check-cited-receipts-v2.mjs:256-286` | cited relative paths → `cat-file -e <rev>:<roundDir><token>` | **closed**: `isTraversal` plus a `startsWith(roundDir)` second check | n/a | n/a | n/a | n/a (`-e` existence only) |
| fleet `scripts/sources-census.sh:88, :500-523` | not a binder; lane dirs canonicalised with `realpath` | — | — | — | — | the positive pattern X2 lacks |
| fleet `scripts/hyaku/disk-guard.sh:475-494` | not a binder; `[[ -L ]]` → `symlink-not-followed`, then `realpath -e` containment | — | the pattern SYMLINK_DIR uses | — | — | the positive pattern for X2 |
| fleet `scripts/hyaku/jj-lane.sh:638` | not a binder; refuses a named file over 10 MiB | — | — | the pattern for an external-read size bound | — | — |
| fleet `scripts/shokunin-watchdog.sh:153-156` | report digest (`sha256sum < "$f"`, after `[ -f ]`, which follows symlinks) | — | — | unbounded, digest only | — | — |

Answer to "same four fail-open classes in a sibling?": **no sibling binds a directory of free-form text receipts
through a `cmd=` token**, so SD and TL have no direct counterpart. The sibling receipts are single committed blobs,
read through git and immune by construction. AF recurs in kind: kake `instrument_receipts.py:397`, tabi
s106/bidi JSON last-wins. kake `receipt_replay.py:108-123` is the in-fleet fix. E is closed lexically in tabi
bidi/cited-v2; kake and tabi s106 rely on git refusing the path. The class that transfers is **SB**: kumitate,
tabi bidi, tabi s106 and round-evidence-audit all hash a revision blob without checking its tree mode.
kake `instrument_receipts.py:121/:507/:613` already does the check, and that is the pattern to borrow.

### Adjacency cases measured on the integrated instrument (`receipt-adjacency.txt`, driver `adjacency-probe.mjs`)

| case | input | integrated reading | expected by the claim |
|---|---|---|---|
| X1 symlink-blob | `scripts/link.mjs` is mode 120000 at rev; digest = sha256 of the link text `tool.mjs` | `CLEAN matched=1 … external=0` exit 0 | not an instrument → fail closed |
| X2 alias-abs | absolute token through a symlinked alias of the lane; digest = worktree bytes ≠ rev | `CLEAN matched=1 … external=1` exit 0 | "never the worktree": revision read → DRIFT |
| X2b real-path abs | the same with the real lane path | `DRIFT mismatched=1` exit 1 | correct |
| X3 alias-lane | `--lane` is a symlink | `FAIL-CLOSED LANE_UNREADABLE … is not a directory` exit 2 | fails closed (the token text is misleading, not fail-open) |
| X4 FIFO external | absolute token naming a FIFO outside the lane | no verdict; the runner killed it with SIGTERM at 5 s | fail closed |

## (2) Recurrence of "the predicate cannot see the claimed property" (kumitate lessons r70-r87)

| round | what the predicate could not see | lesson anchor | the check that would have caught it before freeze |
|---|---|---|---|
| r79 (dual: arm cannot be satisfied) | the C2 arm required ≥10 `POINTER_DEAD` lines that its own no-re-report contract forbids | `corpus/lessons/round-79.md:59-68` → Q73 `corpus/QUALITY.md:1232-1235` | derive every arm's expectation from the contract plus a measured control (Q73), done before freeze |
| r80 | the frozen counter could not see the delta-rule refusal branches (mutants m04/m05/m06/m12 survive) | `corpus/lessons/round-80-verifier-spotcheck.md:103-106` | pre-freeze mutation of the reference: deleting each claimed refusal branch must drop ≥1 named arm |
| r81 → r82 | no arm fed a symlink, so the realpath guard's deletion was invisible; r82 found the guard unreachable behind `lstat` | `corpus/lessons/round-81.md:136-139`; `round-82.md:48` | reachability: every claimed guard has an arm whose input reaches *that* guard (accounting for guard order) |
| r82 | fixture-shaped blindness: 50 selftest cases never met the real rendered `Report:` line | `corpus/lessons/round-82.md:49` | run the predicate on the round's own real artifact before freeze |
| **r84 honest stop** | a label-keyed no-reader printed 16 labels → 16/16 without opening a receipt | `corpus/lessons/round-84.md:10-13, :82`; spot-check `round-84-verifier-spotcheck.md:58-60` | Q29's full control list (absent/constant/junk/no-reader/label-keyed) actually scored before freeze; only two were run (`round-84.md:82`) → became Q78 `QUALITY.md:1309-1312` |
| **r85 honest stop** | path-keyed and content-keyed post-data controls reached 20/20 (three independent constructions) | `corpus/lessons/round-85-verifier-spotcheck.md:56-61`; `round-85.md:53` (predicate-strength survivors) | key-ablation controls before freeze: a path-keyed and a content-keyed shortcut of the reference, each scored < N |
| **r87 honest stop** | 12 arms could not tell worktree hashing from `git show <rev>:<path>` (`cand-a-worktree` 12/12) | `corpus/lessons/round-87.md:24-29, :69`; spot-check `round-87-verifier-spotcheck.md:44-49` | a byte-source twin of the reference (r88's `make-worktree-variant.mjs`), scored before freeze |
| **r88 (this round)** | 20 arms cannot tell revision binding from worktree binding **for absolute in-lane tokens**: `ctl-abs-disk` 20/20. They also cannot see X1/X2/X4: the integrated tool and a parity candidate that closes all three both read 20/20 | this report; `probe88-c1.mjs:152, :224-258` | see below: the r87 fix was applied to one function (`blobAt`), not to every byte-source × token-form pair |

**Pattern.** Each round's pre-freeze control set is the previous round's killer: r84's no-reader → Q78; r85's
path/content keys → r86-r87 controls; r87's worktree twin → r88's generator. Each round then dies on the next
axis of the same property. The property is never enumerated before the freeze, so the control set trails it.

**Concrete pre-freeze check (one, mechanical): a byte-source × token-form ablation matrix.**
1. Enumerate every place the reference instrument reads the bytes it judges (here: `blobAt` `:196-199`, the
   external `readFileSync` `:301`, the receipt `readFileSync` `:248`), and every token form it accepts (relative,
   absolute in-lane, absolute through an alias, absolute outside, symlink blob at rev, special file).
2. For each (byte-source, token-form) pair the claim covers, generate the ablation that swaps the revision read
   for a worktree/disk read **at that call site** (not only inside one named function). Then require a fixture
   with worktree ≠ rev that uses that token form.
3. Freeze only when every ablation scores < N and names the arm that flipped. Commit the matrix next to the
   controls (Q29 ordering).

r88 would have failed step 2 on the row (absolute in-lane, `blobAt` bypass) before any data: no fixture pairs an
absolute in-lane token with a dirty worktree.

## Proposed move (one, bounded)

**Take C1 as rejected-honest-stop under the frozen rule on `ctl-abs-disk`. Do not repair the probe (it is
frozen) and do not swap the attack target mid-wave. Carry two artifacts into round 89:**
- the ablation matrix above, as a pre-freeze criterion (it extends Q78 and generalises Q73's reachability);
- `build/K88Connector/cand-instrument-parity.mjs` (sha256 `b0142f86…db2`), which brings the instrument side up to
  the receipt side's checks:
  - `blobAt` reads the tree entry through `ls-tree` and refuses a mode other than 100644/100755 as
    `FAIL-CLOSED SYMLINK_INSTRUMENT` (kake's `REGULAR_MODES` pattern);
  - an absolute token is canonicalised by its parent's `realpath`, compared against `realpath(lane)` (the
    disk-guard / sources-census pattern), so an alias into the lane binds at the revision;
  - an external read requires a regular file of at most 64 MiB.

  Measured on the frozen probe: candidate `HELD 20/20` (`probe-cand-parity.txt`); its worktree twin `UNMET
  11/20` (`probe-cand-parity-worktree.txt`); X1 → `SYMLINK_INSTRUMENT`, X2 → `DRIFT`, X4 → `FAIL-CLOSED
  UNRESOLVED … not a regular file` (`adjacency-cand-parity.txt`).

  It does **not** rescue r88: the frozen probe scores it the same as the integrated tool, which is the point.

Axis effect: (a) truthfully reported, with the r89 instrument ready; (b) r89 discrimination improves through the
matrix; (c) no change to the fixed target this wave; (d) untouched. No axis harmed.

## Risks

- The kill ruling is contestable on one reading: an L1 could argue that absolute in-lane tokens are outside the
  "claimed behaviour". The plan's claim says "binds … AT A JUDGED REVISION (never the worktree)" with no carve-out
  for absolute tokens, and the integrated tool does revision-bind them (X2b DRIFT). I report the contradiction;
  the critic or L1 rules on it.
- Candidate side effects (unmeasured beyond the probe and the adjacency driver): an external absolute token that
  is itself a symlink (for example a `node` shim path) now fails closed; parsing `ls-tree` output assumes
  `rel` has no pathspec magic; the 64 MiB external bound is arbitrary. The candidate's own `--selftest` passes
  inside probe arm A2, but no new selftest cases were added.
- The AF/SB entries for kake and tabi marked [INFERENCE] were not executed.

## Verification for Main / L1 (commands; all measured by me unless marked)

- `node .ufo/waves/round-88/probe/probe88-c1.mjs --lane <LANE> --work <S> --rev 8e4ea5f6… --tool .ufo/waves/round-88/build/K88Connector/ctl-abs-disk.mjs` → `HELD held=20/20` exit 0 (`probe-ctl-abs-disk.txt`).
- `node .ufo/waves/round-88/build/K88Connector/adjacency-probe.mjs <tool> <S>` against the integrated tool, the
  candidate and the control → `receipt-adjacency.txt`, `adjacency-cand-parity.txt`, `adjacency-ctl-abs-disk.txt`.
- Integrated: `probe-integrated.txt` 20/20 exit 0; integrated twin `probe-integrated-worktree.txt` 11/20 exit 1.
- Not run by me: census, close battery.

## Artifacts (`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88Connector/`)

`adjacency-probe.mjs` (51d852d0…), `ctl-abs-disk.mjs` (ef999ccf…), `ctl-abs-disk-wip-selftest.mjs` (with
`probe-ctl-abs-disk-wip-selftest.txt`, `adjacency-ctl-abs-disk-wip-selftest.txt`), `cand-instrument-parity.mjs` (b0142f86…),
`cand-instrument-parity-worktree.mjs` (c4770d21…), `integrated-worktree.mjs` (bbe4a196…); receipts
`receipt-adjacency.txt`, `probe-integrated.txt`, `probe-integrated-worktree.txt`, `probe-cand-parity.txt`,
`probe-cand-parity-worktree.txt`, `adjacency-cand-parity.txt`, `probe-ctl-abs-disk.txt`,
`adjacency-ctl-abs-disk.txt`. Each receipt has `rev=`, `tool_sha256=` (of cmd token 2), `cmd=`, the output,
`exit=`, `signal=none`. Scratch `/fast/scratch/hyaku/kumitate-r88/K88Connector` removed before yield.
