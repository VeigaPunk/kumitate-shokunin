source: S250 — in-toto attestation Statement layer specification, https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md (capture `.ufo/waves/round-87/open/intoto-statement.md`, sha256 `cbe684a1…`); S252 — CWE-22 path traversal, https://cwe.mitre.org/data/definitions/22.html; S253 — gitrevisions(7), https://git-scm.com/docs/gitrevisions; S218 — CWE-59 link following, https://cwe.mitre.org/data/definitions/59.html
verified-at: 2026-11-04
recheck: on-release

# Receipt-subject binding — a receipt must name the instrument it measured

A close receipt carries two kinds of claim: what it observed, and *what it observed it with*.
This lane's receipts carry the first as `cmd=` + stdout + `exit=` and, since round 86, the second
as `tool_sha256=`. Round 87 found the second half unbound.

## What went wrong (measured)

Round 86's close runner computed one digest — `sha256(scripts/counter-receipt.mjs)` — inside its
per-case loop and wrote it into every case's receipt (`.ufo/waves/round-86/run-close.mjs:24`;
the `plan` case entry that line 20 of the frozen round-87 plan cites is the case table, not the
digest). Ten receipts landed; nine named a subject they never invoked:

```
$ node .ufo/waves/round-87/open/census-toolbind.mjs round-74 … round-86
receipts=239 bound=1 mismatch=9 unresolved=0 no_cmd=229
```

- **239** committed close receipts in rounds 74–86 (`ls .ufo/waves/round-74..86/close/*.txt`).
- **225** carry neither `cmd=` nor `tool_sha256=`, and **4** (all round 85: `c1-probe.txt`,
  `content-variation.txt`, `history-v2.txt`, `selftest.txt`) carry `cmd=` with no digest; the
  census bucket `no_cmd=229` is 225 + 4. The digest field was introduced in round 86, so those
  subjects are unrecoverable by any deterministic rule (see the revenger seat of round 87).
- of the **10** that carry both, **1** binds (`selftest.txt`, whose command really is
  `scripts/counter-receipt.mjs`) and **9** name `scripts/counter-receipt.mjs` while invoking
  `proxy-check.mjs`, `readme-map.mjs`, `ready-handoff.mjs`, `spotcheck-adopt.mjs`,
  `plan-before-ready.sh`, the round-86 probe, or the fleet's `sources-census.sh`.

The receipts were not false about what they ran — their `cmd=` lines are right. They were false
about *what the digest named*, and no gate in this lane could see it: `report-receipt-diff.mjs`
(v4) checks tallies, pointers and hashes, never the instrument a receipt names.

## Why the subject must be digest-bound

The in-toto Statement layer states the general rule this lane was violating:

> The Statement is the middle layer of the attestation, binding it to a particular subject and
> unambiguously identifying the types of the Predicate. — S250, spec/v1/statement.md

and its `subject` entry requires `digest`: *"Each element MUST have `digest` set."* A name is not
a binding; the digest is. Applied to a verification receipt, the subject is the instrument binary,
and the digest must be of *that* binary at *that* revision — a receipt whose digest names a
sibling tool is an attestation about the wrong artifact.

The Sigstore CLI reference is the near-miss this lane rejected (S251): `cosign verify` does bind
a signature payload to the image digest it was attached to, but that is artifact-to-signature
binding, not a statement about the verifier's own identity, and the page is a CLI reference rather
than a normative requirement on receipts.

## What this lane does now (contract `kumitate-receipt-bind-v1`)

`scripts/receipt-bind.mjs` re-derives the binding from the receipt's own bytes:

- the instrument is the **second whitespace token of `cmd=`**;
- a lane-relative or lane-absolute instrument is hashed from `git show <rev>:<path>` (the
  receipt's own `rev=`, else `--rev`), so the binding is *revision-bound*, not worktree-bound;
- an absolute instrument outside the lane is hashed from disk and counted `external=` — an
  external tool cannot be revision-bound, and the output says so instead of hiding it;
- a receipt with no `cmd=`/`tool_sha256=` counts `unchecked`, and CLEAN requires
  `mismatched==0 AND unchecked==0`: silence is never a pass;
- a symlinked receipt, a missing directory, an unresolvable revision and an unresolvable
  instrument are all `FAIL-CLOSED` (exit 2), never a quiet zero.

Frozen 12-arm scorer: `.ufo/waves/round-87/probe/probe87-c1.mjs`. It scores the round-86 bytes
(which must read `DRIFT matched=1 mismatched=9 unchecked=0`), the round-87 receipts (which must
bind), four same-directory fixtures that keep their filenames while changing `cmd=` or the digest,
and a receipt generated at run time from lane bytes — so a canned table, a path key or a filename
key cannot pass it. Pre-data controls: base 0/12, constant-CLEAN 0/12, constant-DRIFT 1/12,
path-keyed 3/12 (`.ufo/waves/round-87/controls/*.txt`).

## Limits

- **Historical receipts stay unbound.** The 229 receipts in the `no_cmd` bucket (225 with no
  field, 4 with `cmd=` only) are history; this instrument does not retroactively bind them and no
  round may claim it does.
- **External instruments are not revision-bound.** `sources-census.sh` lives outside the lane, so
  its receipt can only bind today's bytes; a change to that script after the fact is invisible to
  the binding (it will show as `mismatched`, which is the honest reading).
- **The binding is about identity, not correctness.** A digest match says the receipt measured
  *that* instrument; it says nothing about whether the instrument's verdict is right.
- **One writer per receipt directory.** The instrument reads; it never writes or repairs receipts.
- **The census is a field census.** `no_cmd=229` counts receipts that declare no `cmd=` field; a
  transcript line (`$ node …`) is not a declared field and is not read as one. The revenger seat
  counted 45 receipts in the same range whose text carries a command in another syntax (37 of them
  resolve at their own `rev=`), which is a different question: those receipts *name* a subject but
  declare no digest for it, so no rule can check them.

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
  (S253 — https://git-scm.com/docs/gitrevisions; quote line-checked in
  `round-88/build/K88ScribeSources/quote-check.receipt.txt`).

### The four v2 boundaries

| token | refuses | v2 anchor | why v1 was fail-open (sentinel row) | v1 anchor |
|---|---|---|---|---|
| `ESCAPES_LANE` | a **relative** `cmd=` token that resolves outside `--lane` | `:291–296` (`:295` throws) | 1e: the relative branch fell through to the disk read reserved for absolute external instruments, so `cmd=node ../../../../../etc/hostname` read `CLEAN … external=1` | `v1:280` `if (lr.inside) rel = lr.rel; else fromDisk = true;` |
| `SYMLINK_DIR` | `--dir` that is itself a symlink | `:227–228` (lstat before `readdirSync` at `:229`) | 2a/2d: `readdirSync` followed the link, so another directory's receipts — even round 86's close dir — were judged under this path | `v1:216` (no `lstat` on `--dir`) |
| `RECEIPT_TOO_LARGE` | a receipt larger than `MAX_RECEIPT_BYTES` = 1048576 | `:68`, `:245` (size from `lstat`, checked before the read at `:248`) | 4: the receipt was read whole; a 64 MiB receipt read `CLEAN` at 185 048 kB peak RSS | `v1:234` (`st.size` never consulted) |
| `AMBIGUOUS_FIELD` | more than one `cmd=`, `tool_sha256=` or `rev=` line, equal values included | `:249–253` (`matchAll` with `g`, `:251` throws) | 3c/3d/3e: non-global `match` was first-wins, so an appended second line changed nothing visible to the verdict | `v1:236` |

Source rows for two of the classes: link resolution — "does not properly prevent
that filename from identifying a link or shortcut that resolves to an unintended resource"
(S218 — https://cwe.mitre.org/data/definitions/59.html); path escape —
"special elements within the pathname that can cause the pathname to resolve to a location that is
outside of the restricted directory" (S252 — https://cwe.mitre.org/data/definitions/22.html). Both
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
- **The selftest covered v2 only after integration.** At `0ff3562f` the hermetic `--selftest` ran
  39 arms and none named a v2 token, so the four boundaries were held only by the frozen probe. The
  K88ExecSelftest extension (integrated at M) adds 20 cases with positive twins, including the exact
  1048576/1048577-byte edge (`RECEIPT_BIND_SELFTEST: PASS held=59/59`); each boundary reverted to its
  v1 line fails it (`round-88/build/K88ExecSelftest/selftest-mutant-*.txt`: 56, 57, 57, 51 of 59).
- v1's limits stand: identity, not correctness; external instruments are not revision-bound
  (`:21–22`); historical `no_cmd` receipts stay unbound.

### Round 88 verdict — the twenty arms are still not the property

The instrument passes the frozen 20-arm scorer, and its mechanical worktree twin fails it (11/20).
That did not make the claim hold. Under the frozen kill rule any seat-constructed control at 20/20
makes C1 UNMET, and nine distinct constructions reached it, each shown to skip a claimed behaviour
on a fixture outside the probe's path (`round-88/build/K88Critic/SCORES.md`,
`round-88/build/K88Connector/probe-ctl-abs-disk.txt`, `round-88/build/K88Review2/ctl-nogit-overfit.txt`):

- **The judged revision was also HEAD.** Every worktree arm passes `--rev B` and B is the fixture's
  HEAD and index, so a tool that reads `HEAD:<rel>` or `:<rel>` for receipts without `rev=` passes
  (`c2-head-default`, `e2-index-default`).
- **Only relative tokens met a dirty worktree.** An absolute in-lane token is read through `blobAt`
  by the instrument, but no arm names one while the worktree differs, so a tool that hashes absolute
  in-lane tokens from disk passes (`ctl-abs-disk`).
- **The boundaries were tested at one point each, far from the edge.** A 2 MiB and a 512 KiB receipt
  cannot tell a 1048576 limit from 2000000, nor size-before-read from size-after-read; a `../`-prefixed
  token cannot tell resolution from a textual prefix check; a differing duplicate cannot tell
  "more than one line" from "more than one value" (`f1`, `f4`, `f5`, `f6`; mutants M16, M18, M23, M24).
- **The fixture was public.** Bodies, commit order and the `probe88` path are constants in the probe;
  a tool that recognises them can gate every boundary on the fixture (`d-fixture-gated-boundaries`) or
  infer A/B from `.git/logs/HEAD` with no git call at all (`nogit-overfit`).

The lesson the next scorer must carry: a predicate for a binding property scores the instrument on
inputs whose byte sources disagree along *every* path the instrument can take (relative and absolute
tokens; judged revision, HEAD, index and worktree all distinct), tests each limit at the edge from
both sides, and draws its fixture bytes and names at run time so that no constant in the scorer can
be copied into a candidate (Q81).
