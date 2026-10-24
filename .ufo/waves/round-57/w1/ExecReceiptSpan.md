# ExecReceiptSpan — round 57 w1 (C1 operability evidence seat)

Item: extract `wall_start` and `nonce` from the three receipts; confirm pairwise-distinct
nonces (also vs the round-48..56 corpora via `git grep`) and a span ≥ 300 s.

Measured revision: lane HEAD **`8c6f5b017d149b18134917378cdbed3b492d8e89`**
(`round-57: idempotence at bookkeeping tip c42afe1c — A57 10/10, D57 5/5`), working tree
byte-identical to HEAD for `.ufo/waves/round-57/receipts/` (`git diff --stat HEAD` empty).
Plan base was `7178bfd`; HEAD was not moved, nothing was checked out, no git/jj mutation ran
in the lane. Counter read: `.ufo/waves/round-57/probe/attest57-probe.mjs` rule `A57` v1,
arm B8 (lines 333–363).

## Verdict

**CORROBORATED** on all three asked facts, measured from committed bytes:

| # | receipt | argv (body) | exit | wall_start | wall_end | wall dur | nonce |
|---|---|---|---|---|---|---|---|
| 1 | `attest-run-1.txt` | `node scripts/readme-map.mjs --selftest` | 0 | `2026-10-24T12:41:22.462Z` | `2026-10-24T12:41:22.685Z` | 223 ms | `89182e386fd9d9a57b2a894a2a86387d` |
| 2 | `attest-run-2.txt` | `node scripts/bind-oracle.mjs --selftest` | 0 | `2026-10-24T12:43:19.632Z` | `2026-10-24T12:43:19.945Z` | 313 ms | `e9f14ab41bb2b52adb4a1cd5a4cd8bb8` |
| 3 | `attest-run-3.txt` | `node scripts/round-gate.mjs --selftest` | 0 | `2026-10-24T12:46:48.675Z` | `2026-10-24T12:46:56.768Z` | 8093 ms | `9a065643099d3095b3db2bbbc0cb1287` |

- `wall_start` span = **326 213 ms (326.213 s) ≥ 300 000 ms**, margin **26 213 ms**.
  Independent recomputation: node `Date.parse` → 326213; coreutils `date -u +%s%N`
  → 326213. `wall_end` span 334 083 ms. `mono_span_ms` fields are 222/312/8093 (per-run
  durations; they do not contribute to the span).
- Ordering is strictly increasing: 12:41:22.462 < 12:43:19.632 < 12:46:48.675.
- Nonces are **pairwise distinct** (3/3), each 32 lowercase hex; each receipt carries exactly
  one `"nonce":` field.
- **No collision with round-48..56**, by three independent scans (below).

## Cross-round nonce scan — and a defect in B8's spelling of it

Three scans at HEAD, all negative:

1. **Attested receipt files** rounds 48–56 (`*/receipts/*.txt`; only 51–56 exist):
   24 files, **18 distinct nonces** — none equals any of the three round-57 nonces
   (`r51 3fd22d21…/f95078d0…×2/176f623b…`, `r52 15948511…/036d7c4b…×2/b10ba99f…`,
   `r53 77b14832…/e1891075…×2/352d684c…`, `r54 19788936…/70e353e6…×2/2ac54d21…`,
   `r55 9bf0b622…/b3646564…×2/fef351f8…`, `r56 ef3a591d…/474c5246…×2/c8134ebf…`).
   The per-round "replayed" control duplicating its run-2 nonce is the established convention
   in 51–56, matching round 57.
2. **Whole round dirs 48–56** (probe's intended scope, explicit paths): 100 `"nonce":` lines,
   **54 distinct tokens** (includes mutant/fixture tokens `ab`, `ffff…`, hex-of-hex
   `3838…`); no intersection.
3. **Whole tree at HEAD** (106 lines, 59 distinct): the three tokens occur **only** in
   `.ufo/waves/round-57/receipts/{attest-run-1,attest-run-2,attest-run-3}.txt`; `e9f14ab4…`
   additionally appears in `attest-run-2-replayed.txt`, the doctored control that is a copy
   of run-2 (expected; excluded from the evidence set by name — see below).

**Defect D1 (counter, operability): the probe's own cross-round conjunct is vacuous.**
B8 executes
`git grep -ohE '"nonce":\s*"[0-9a-f]+"' <rev> -- '.ufo/waves/round-4[89]' '.ufo/waves/round-5[0-6]'`
and only inspects the output `if (older.status === 0)`. On this host `git 2.56.0`
(Arch, `/usr/bin/git`) those two pathspecs match nothing. Cause (corrected after
L1-kumitate-r57's challenge and re-measured, `31-whole-path-wildcard-correction.txt`,
`32-fresh-repo-wholepath.txt`): bracket classes and `?` **are** expanded, but a pathspec must
cover the whole path, so a bare directory-name wildcard with no trailing component does not
descend into that directory; only `*` spans `/` and reaches the files directly:

```
'.ufo/waves/round-56'        -> 5 matching files    (literal dir: works)
'.ufo/waves/round-5[6]'      -> 0                   (bare directory wildcard: no descent)
'.ufo/waves/round-5[0-6]/*'  -> 100 nonce lines     (wildcard + trailing component: works)
'.ufo/waves/round-5[0-6]/**' -> 100 nonce lines     (recursive suffix: same)
'.ufo/waves/round-5?'        -> 0                   (bare: no descent)
'.ufo/waves/round-5?/*'      -> 104 nonce lines     (works, but round-57 is included)
'.ufo/waves/round-5*'        -> 104 nonce lines     (star spans the path; round-57 included)
':(glob)…round-5[0-6]'       -> 0                   (glob magic does not add descent)
':(glob)…round-5[0-6]/**'    -> 100 nonce lines     (works)
```

The `?` and `*` forms are unusable for this check: they also match round-57, so the scan would
compare the receipts against their own nonces (104 vs 100 lines; the extra 4 are round-57's
four receipts).

Cross-check of that working form (`29-glob-magic-working-form.txt`, `30-glob-4x89-sentinel.txt`):
`:(glob).ufo/waves/round-5[0-6]/**` yields the same **100** nonce lines as the explicit-dir list;
`:(glob).ufo/waves/round-4[89]/**` resolves round-48's 348 files (1 bare `nonce` line in
`round-48/r48/SentinelReceipt.md`) but yields **0 JSON nonces** — rounds 48–49 carry no
`"nonce":` fields at all, so a correct B8 could only ever compare against 50–56.

Why the two spellings behave differently (`33-glob-magic-variant-retest.txt`): under plain
(default) pathspec magic, `*` crosses `/`, which is why `round-5*` reaches nested files *and*
why it over-collects round-57; under `:(glob)`, `WM_PATHNAME` applies — `*` no longer crosses
`/`, so `:(glob)…round-5*` → 0 and `:(glob)…[0-6]/*` → 0 (one level only), while
`:(glob)…[0-6]/**` → 100. Either `:(glob)…[0-6]/**` or plain `…[0-6]/*` is correct; the bare
`…[0-6]` form used by B8 is not.

Reproduced in a fresh throwaway repo (git 2.56.0) with `round-48/`, `round-50/`, `round-56/`
and `round-57/` each holding one `a.txt` (`32-fresh-repo-wholepath.txt`): `round-5[0-6]` → 0,
`round-5[0-6]/*` → 50+56, `round-5?` → 0, `round-5?/*` → 50+56+57, `round-5*` → 50+56+57,
`round-4[89]/**` → 48. No `GIT_*PATHSPECS` env is set here
(`env | grep GIT` → only `GIT_EDITOR`, `GIT_PAGER`, `GIT_TERMINAL_PROMPT`).

Consequence: the probe's `git grep` exits 1, the `if (older.status === 0)` guard drops the
whole cross-round scan, and B8 still reads PASS. **Mutation proof** (scratch clone under my
build dir, lane untouched; clone rev `59acf323669b2c1490236c626da6b0ae5c96c7b9` built from
HEAD + one forged file `.ufo/waves/round-56/receipts/forged-nonce.txt` carrying
`"nonce":"89182e386fd9d9a57b2a894a2a86387d"`, i.e. a real cross-round reuse of run-1's nonce):

- B8-spelled grep at the mutated rev: **0 hits** (forgery invisible);
- explicit-dir grep at the same rev: **1 hit**; `'.ufo/waves/round-56/receipts/*.txt'`: **1 hit**;
- frozen A57 at that rev: `ATTEST57: ATTEST57_HELD held=10/10 checks=10 rev=59acf32…`,
  **B8 PASS**.

So B8 held=10/10 does **not** establish round-48..56 distinctness; the item's statement of it
is corroborated here only by scans 1–3 above. Advisory (no counter edited by me): the arm
should spell the pathspecs `:(glob).ufo/waves/round-4[89]/**` and
`:(glob).ufo/waves/round-5[0-6]/**` — or the plain `…/round-5[0-6]/*`, measured identical at
100 lines — and must **not** use `?` or `round-5*`, which pull in round-57 and would compare
the receipts against their own nonces. Clone was deleted after capture
(`28-sandbox-clone-rev.txt` keeps its rev).

**Defect D2 (counter, minor): the measured "span" is the prelude, not `wall_start`.**
B8 prefers `run-at:\s*(…)` and falls back to `"wall_start"`. In these three receipts the two
are byte-equal (same instant, to the millisecond), so the number is the same either way.
`receipt-attest.mjs` bounds the prelude inside `[wall_start, wall_end]` (line 358), so the
largest possible deviation here is the first receipt's 223 ms / last receipt's 8093 ms:
admissible prelude-spans lie in **[325 990 ms, 334 083 ms]** — still ≥ 300 000 ms, so this
cannot flip B8 on this data. It does mean B8 measures a value the receipt owner writes twice.

**Defect D3 (plan-vs-counter, observed): the frozen plan says "A57 B8 asserts exactly these"
planned argv; B8 never reads `argv` at all** (lines 333–363 contain no argv comparison). The
three receipts do carry exactly the planned argv, so the receipts meet the plan's stated
contract — the counter just does not check it.

## Routed-defect proposal for round 58 (advisory text — not written outside this report)

My write boundary is this report and my build dir, so nothing below was entered in
`corpus/lessons/`, `LOG.md` or a counter. The round-58 active writer / closure reviewer should
land it (L1-kumitate-r57 attempt 2 is the active writer; attempt 1 has confirmed these findings
at `8c6f5b01`). Proposed entry:

> **R57-V1 — A57 B8's cross-round nonce arm is dead, and its argv arm is absent.**
> `attest57-probe.mjs` B8 scanned older corpora with `git grep … -- '.ufo/waves/round-4[89]'
> '.ufo/waves/round-5[0-6]'`. On git 2.56.0 those pathspecs match no file: brackets and `?`
> are expanded, but a pathspec must cover the whole path, and a bare directory-name wildcard
> does not descend into the directory (measured: `round-5[0-6]` → 0, `round-5[0-6]/*` → 100,
> `round-5?/*` → 104). The grep therefore exited 1, and the arm only compares when
> `older.status === 0`, so a failed scan silently counted as fresh. Demonstrated by a scratch
> clone carrying a round-56 file that reuses round-57 `attest-run-1`'s nonce: A57 still printed
> `held=10/10 … B8 PASS`. The frozen plan also states B8 "asserts exactly these" planned argv;
> B8 reads no `argv`. Cross-round nonce freshness and argv compliance therefore rest on a
> seat's direct check, not on the counter. Fix for round 58: (a) spell the scan
> `:(glob).ufo/waves/round-4[89]/**` + `:(glob).ufo/waves/round-5[0-6]/**` (or plain
> `…/round-5[0-6]/*`; measured: same 100 lines as the explicit-dir list; rounds 48–49 carry no
> `"nonce":` fields, so only 50–56 can match) — and never `?` or `round-5*`, which also match
> round-57 and would collide with the receipts under test; (b) **do not** turn "non-zero exit"
> into failure — `git grep` exits 1 on a genuine no-match and 128 on an unparseable rev; fail on
> exit ≥ 2, and additionally prove coverage (pathspec resolves to ≥ 1 file, and a known-present
> sentinel token is found) so a silent zero cannot pass as clean; (c) assert each receipt's body
> `argv` against the plan's frozen list; (d) prefer the body `wall_start` over the prelude
> `run-at` when measuring the span. A57 stays 10/10 as frozen — a frozen counter is not edited
> after scoring; the fix belongs to the next rule version.

## Doctored control (context for the duplicate-nonce question)

`attest-run-2-replayed.txt` duplicates run-2's `wall_start` (12:43:19.632Z) and nonce
(`e9f14ab4…`) but not its prelude: `run-at: 2026-10-24T13:45:00.000Z`, +3700.368 s outside its
own wall window, and its sidecar still holds run-2's hash. `verify --ledger` on a scratch copy
of the receipts dir:

- `attest-run-{1,2,3}.txt` → **`RECEIPT: VALID` exit 0** each;
- `attest-run-2-replayed.txt` → `sidecar mismatch: sidecar 5bcb7aba…, actual 0354f3e6…` /
  **`RECEIPT: TAMPERED` exit 1**, and the three subjects print
  `ledger skipped attest-run-2-replayed.txt: not an attested receipt (sidecar hash mismatch)`
  — the duplicate nonce cannot taint the evidence set. Plan's requirement
  (REPLAY/TAMPERED, never VALID) is met. Had only the prelude been rewritten with a matching
  sidecar, the prelude-outside-window arm (line 358) would read TAMPERED independently.

## History note: run-3 was re-minted (not a timestamp anomaly)

`git log --diff-filter=A` attributes all four receipt files to `f0dc6d1`, but `f0dc6d1`'s
committer time is `12:45:41Z` — *earlier* than the current run-3's `wall_end` (`12:46:56.768Z`).
`b3bd063` (`12:47:46Z`) replaced both lines of `attest-run-3.txt` (+ sidecar): the R1 copy was
`run-at/wall_start 2026-10-24T12:26:15.254Z`, nonce `3fcdb7ca5393ee4f7d457aef250a9dd8`,
digest `bd2a1ddf…`; the current one is the 12:46:48 mint with digest `1ebb4954…`. So the
contradiction is explained by a **re-run of run-3 after integration** (the round-gate selftest
output changed), not by a backdated commit. Consequences:

- span at R1 `f0dc6d1` = **1 024 378 ms** (run-3 lay *before* run-1); at HEAD = **326 213 ms**.
  Both pass, and `close/FINAL-attest57-R1.txt` (B8 PASS at `f0dc6d1`) is consistent with the
  R1 receipt set — but the close transcript attests a run-3 that is no longer the committed one.
  Only `attest-run-3.txt` (+ sidecar) has changed since `f0dc6d1`; run-1/run-2 are byte-stable.
- The re-mint **cut the span margin from 724 s to 26 s**. The gate is met, but the headroom is
  now a property of the mint spacing (209 s between run-2 and run-3), not of anything guarded.
- Commit timestamps cannot be used to corroborate mint order here (all commits are
  `export from jj`; committer time tracks the jj change, and `f0dc6d1`'s content was amended
  afterwards). File mtimes (`09:41:22.684`, `09:43:19.944`, `09:46:56.767` local, TZ −03) match
  the body clocks, but come from the same writer, so they are not independent evidence.

## Retained evidence (all under `.ufo/waves/round-57/build/ExecReceiptSpan/`)

| file | content |
|---|---|
| `00-rev.txt` | `git rev-parse HEAD` → `8c6f5b01…`, 14 dirty entries (other seats' build/w1 dirs), last 3 commits |
| `01-receipts-at-head.txt` | blob ids/sizes at HEAD; `git diff --stat HEAD -- receipts/` empty; commits touching the dir |
| `02-fields.txt` | `grep -oE` extraction of `wall_start` + `nonce` per file, prelude `run-at` lines, `wc -lc` |
| `03-span-nonce-compute.txt` | full JSON per receipt; span 326213 ms; pairwise-distinct 3/3; 32-hex; exit 0; replay duplication deltas |
| `04-nonce-grep-older.txt` | B8-spelled two-bracket-pathspec grep at HEAD → **0 lines, exit 1**; round dirs 48–57 present |
| `05-nonce-tree-scan.txt`, `06-older-receipt-files.txt`, `07-nonce-paths.txt` | whole-tree token census; older round receipt inventory; nonce-bearing paths by wave dir |
| `08-older-receipt-bodies.txt` | round-56 and round-53 receipt bodies; targeted `git grep -c` on those dirs |
| `09-pathspec-probe.txt`, `11-bracket-matrix.txt`, `13-bracket-and-commit-times.txt`, `14-globpaths-env.txt`, `16-glob-matrix.txt`, `18-fresh-repo-pathspec.txt` | pathspec bracket/`?`/`*` behaviour matrix in the lane and in a fresh repo; `GIT_*` env; `:(glob)` behaviour |
| `10-b8-equivalent.txt` | B8 argv verbatim (bracket, 0 lines) vs explicit 9 dirs (100 lines) |
| `29-glob-magic-working-form.txt` | `:(glob)…round-5[0-6]/**` → 100 lines (the working spelling); bare `:(glob)…[0-6]`, `[0-6]/`, `[0-6]/*` → 0; `git grep` exit 1 (no match) vs 128 (unparseable rev) |
| `30-glob-4x89-sentinel.txt` | `:(glob)…round-4[89]/**` does resolve (348 files, 1 bare `nonce` line) but holds 0 `"nonce":` fields |
| `31-whole-path-wildcard-correction.txt` | lane re-measure of the whole-path rule: `round-5[0-6]`→0, `…[0-6]/*`→100, `…[0-6]/**`→100, `round-5?`→0, `round-5?/*`→104 (round-57 included), `round-5*`→104, `…[0-6]/receipts/*.txt`→24 |
| `32-fresh-repo-wholepath.txt` | same matrix in a fresh repo with rounds 48/50/56/57: `[0-6]`→0, `[0-6]/*`→50+56, `?`→0, `?/*`→50+56+57, `*`→50+56+57, `4[89]/**`→48 |
| `33-glob-magic-variant-retest.txt` | plain `[0-6]/*`→100 vs `:(glob)…[0-6]/*`→0 and `:(glob)…[0-6]/**`→100; `:(glob)…round-5*`→0 (WM_PATHNAME: `*` stops crossing `/`) |
| `12-cross-round-intersection.txt` | 54 distinct older tokens; three round-57 nonces → not in 48–56, appear only in round-57 receipts |
| `15-verify-ledger.txt` | `verify --ledger` on scratch copy: 3× VALID exit 0, replay TAMPERED exit 1, skip notes |
| `17-add-commits-and-mtimes.txt` | introducer commit per receipt, committer time vs wall window, mtimes/TZ |
| `19-span-gnu-date.txt` | coreutils recomputation: 326213 ms, margin 26213 ms, wall_end span 334083 |
| `20-attested-receipt-nonces.txt` | per-file nonce table for rounds 51–56; ABSENT intersection for all three |
| `21-a57-probe-at-head.{out,err}` | frozen A57 at HEAD: `ATTEST57_HELD held=10/10 checks=10 … B8 PASS`, exit 0 |
| `22-mutation-nonce-reuse-grep.txt`, `23-a57-probe-at-mutated-rev.{out,err}`, `28-sandbox-clone-rev.txt` | scratch-clone mutation: forged round-56 reuse invisible to B8's grep, visible to explicit dirs, A57 still 10/10 |
| `24-reflog-and-commit-header.txt` | reflog `export from jj` chain; `b3bd063` diff on run-3; `f0dc6d1` raw header; ancestry |
| `25-run3-remint-history.txt`, `27-span-at-R1.txt` | superseded run-3 body/sidecar, `f0dc6d1..b3bd063` diff, span 1 024 378 ms at R1 |
| `26-close-transcripts.txt` | round-57 `close/` transcripts (R1 `f0dc6d1`, `b3bd063`, idempotence revs, harm battery) |
| `scratch-ledger/` | byte-identical copy of the receipts dir used for the read-only `verify --ledger` runs |

## Scope / limits

- No production, corpus, pin, SKILL, SCORECARD, LOG or jj/git state was written. Lane writes:
  this report + `build/ExecReceiptSpan/`. No commit, push, checkout or HEAD move; the only
  git state written was inside a scratch clone under my build dir, now deleted.
- D57 was not run (out of this item's scope); C1 arms other than B8 were not re-derived.
- All numbers are from committed bytes at HEAD `8c6f5b01…` via `git show`/`git grep`/`git
  archive`; the receipts dir is byte-identical in the working tree.
- No tool was installed or updated for this seat.
- Concurrent lane activity observed, not mine and left untouched: `git status` also shows ` M
  .ufo/waves/round-57/w1/swarm-registry.json` (orchestrator/peer registry write) and 91
  untracked `build/*` + `w1/*` entries from sibling seats; HEAD stayed `8c6f5b01…` throughout.
