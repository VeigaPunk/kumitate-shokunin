# Kumitate round 88 — plan (frozen before data)

Lane `kumitate-shokunin`, hyaku run 15, round 88 attempt 1, Linux host.
Base `7ac24afa477a44304a3b125e320ef86929218189` (lane branch tip at round open, `ahead=0 behind=0`,
clean). Round-start census `open/census-start.txt` (exit 0, 7 pinned `W04`).

## Claims

### C1 — operability (lowest non-retired axis), capability acquisition `receipt-bind` (v2)

One claim. Every coverage row is a saturated sub-axis at 10 and operability sits at its terminal
integer 9 under `f_O`; a second operability claim would be one claim under `AXES.md`. The round
re-claims the capability round 87 took as a rejected-honest-stop, under a predicate that can see
what round 87's could not.

**Motivating evidence.** (1) Round 87's kill rule fired: K87Critic's `cand-a-worktree` (hashes the
worktree instead of `git cat-file blob <rev>:<path>`) reached 12/12 because no arm made the worktree
differ from the judged revision (`.ufo/waves/round-87/build/K87Critic/transcript-cand-a-worktree.txt`).
(2) The round-87 sentinel found four fail-open boundaries in the integrated instrument
(`.ufo/waves/round-87/w1/K87Sentinel.md` rows 1e, 2a/2d, 3c/3d, 4): a RELATIVE `cmd=` token that
resolves outside the lane binds CLEAN as `external`; a receipt *directory* that is a symlink is
followed; duplicate `cmd=`/`tool_sha256=`/`rev=` lines resolve first-wins silently; a receipt of any
size is read whole. (3) K87-V4: round 87's `random-fixture` arm was time-seeded, so two runs at one
revision scored differently.

**Predicate (frozen; same sentence in the probe label, the receipt label and this line).**
`node .ufo/waves/round-88/probe/probe88-c1.mjs --lane <LANE> --work <SCRATCH> --rev <REV>` prints
`C88_C1: HELD held=20/20` and exits 0 at REV.

**Kill rule (frozen).** Any control — the committed controls below, the worktree twin of the
integrated instrument (`controls/make-worktree-variant.mjs` applied to `scripts/receipt-bind.mjs` at
M), or any seat-constructed control — that reaches 20/20 makes C1 UNMET (rejected-honest-stop).
A seat-constructed control is a tool that skips a claimed behaviour (revision binding, receipt
`rev=` precedence, or one of the four new fail-closed boundaries) by construction.

**The twenty arms** (byte-frozen in `probe/probe88-c1.mjs`):

| arm | asserts |
|---|---|
| `usage` | bare invocation exits 64 and prints `USAGE` |
| `selftest` | `--selftest --work` prints `RECEIPT_BIND_SELFTEST: PASS` exit 0 |
| `detect-r86` | committed round-86 close dir → `DRIFT matched=1 mismatched=9 unchecked=0` exit 1 |
| `detect-r86-renamed` | the same ten receipts under new names in a scratch dir → same tallies |
| `clean-r87` | the 11 lane-instrument round-87 close receipts (copy, `census.txt` excluded) → `CLEAN matched=11 … external=0` |
| `unchecked` | no `cmd=` → `DRIFT matched=0 mismatched=0 unchecked=1` |
| `unresolved` | instrument absent at rev → `FAIL-CLOSED UNRESOLVED` |
| `dir-missing` | missing dir → `FAIL-CLOSED DIR_UNREADABLE` |
| `rev-bad` | unresolvable default `--rev` → `FAIL-CLOSED REV_UNRESOLVED` |
| `symlink-receipt` | symlinked receipt file → `FAIL-CLOSED SYMLINK_RECEIPT` |
| `rev-receipt-wins` | fixture repo: `rev=A` + digest of A's bytes, `--rev B`, dirty worktree → `CLEAN matched=1` |
| `worktree-forgery` | digest of the dirty worktree bytes, `--rev B` → `DRIFT mismatched=1` |
| `default-rev` | no `rev=`, digest of B's bytes, dirty worktree → `CLEAN matched=1` |
| `rev-receipt-negative` | `rev=A` + digest of B's bytes → `DRIFT mismatched=1` |
| `untracked-instrument` | instrument only in the worktree → `FAIL-CLOSED UNRESOLVED` |
| `escape-relative` | relative token resolving outside the lane → `FAIL-CLOSED ESCAPES_LANE`; the same file by absolute path → `CLEAN matched=1 external=1` |
| `symlink-dir` | `--dir` is a symlink → `FAIL-CLOSED SYMLINK_DIR`; its real target → `CLEAN matched=1` |
| `oversize` | a 2 MiB receipt → `FAIL-CLOSED RECEIPT_TOO_LARGE`; a 512 KiB receipt → `CLEAN matched=1` |
| `duplicate-field` | duplicated `cmd=` (differing or equal), `tool_sha256=` or `rev=` → `FAIL-CLOSED AMBIGUOUS_FIELD` each; the single-field receipt → `CLEAN` |
| `sweep` | one receipt per `scripts/*.mjs` at REV (sorted) → `CLEAN matched=N`; digest at index N mod 7 flipped → `DRIFT matched=N-1 mismatched=1 first=<that receipt>` |

**Target instrument.** `scripts/receipt-bind.mjs`, contract `kumitate-receipt-bind-v2`: v1 plus four
fail-closed tokens — `ESCAPES_LANE` (a relative instrument token that resolves outside `--lane`;
absolute tokens outside the lane stay `external=`), `SYMLINK_DIR` (`--dir` is itself a symlink),
`RECEIPT_TOO_LARGE` (a receipt larger than 1048576 bytes, refused before it is read), and
`AMBIGUOUS_FIELD` (a receipt with more than one `cmd=`, `tool_sha256=` or `rev=` line). The function
`blobAt(lane, rev, rel)` stays the single revision read (frozen interface: the worktree-twin
generator rewrites exactly that function).

**Pre-data controls** (scored with the frozen probe at the freeze commit F, receipts committed under
`controls/` before any wave marker): the do-nothing control `base-v1` (the instrument as committed at
F — measured 16/20 in the dry run), its worktree twin `base-v1-worktree`, `absent`, `refuse-all`,
the round-87 controls (`stub-clean`, `constant-drift`, `path-keyed`), the round-87 seat controls
(`L1Reference`, `dirkey`, `orderflip`, critic candidates a, a2, b, c, d, e, f). Each must score
below 20/20, or the counter is wrong and is fixed before data.

**After-state, one value.** At the measured revision M the frozen probe reads
`C88_C1: HELD held=20/20` exit 0 against the integrated instrument, and its worktree twin generated
at M scores below 20/20.

**Why a do-nothing control cannot reach it.** The do-nothing control is the instrument already
committed (`base-v1`): it fails `escape-relative`, `symlink-dir`, `oversize` and `duplicate-field`
(dry run 16/20). A worktree-binding tool fails `rev-receipt-wins`, `worktree-forgery`, `default-rev`
and `untracked-instrument`; a tool that ignores a receipt's `rev=` fails `rev-receipt-negative`;
blanket refusal fails every positive sub-run (dry run `refuse-all` 2/20).

**Sourced claim.** C1's knowledge entry (`corpus/knowledge/receipt-subject-binding.md`, v2 section)
cites the SOURCES rows opened this round for the link-following (symlink directory) and
path-escape boundaries; row ids are assigned at integration after the collision check.

## Non-claim work (inside the cap, no claim slot)

- **K87-V1** — commit a post-battery `receipt-bind` receipt over `.ufo/waves/round-87/close/` at
  round-87 M `d3f64dc43027a9754700e70129b6ba91deaada19` (`open/k87v1-bind-r87.txt`).
- **K87-V2** — plan-before-ready ordering: the round-87 spot-check is adopted (`open/spotcheck-adopt.txt`,
  `README_MAP: CLEAN files=223`) in the freeze commit itself, so `plan-before-ready` reads at this plan.
- **K87-V3** — R86-D3 carry: re-measure `SOURCE_CAPTURE`, `SOURCE_DUPES`, `SOURCES_CHECK` at the
  tip with committed receipts (R86-D2 stays open: its transcript was never produced; disclosed).
- **K87-V4** — the seeded/enumerated `sweep` arm above.
- **Frontier step** — SOURCES rows opened this round (≥1 admit, ≥1 reject), one mined mistake,
  the round lesson, the sourced-claim binding.

## Wave shape

ONE v1 wave, 12 seats (policy band 8–16), attack seats 5/12 (reviewer, critic, mutation-tester,
labrat, sentinel), connector 1, no residual call. Roles: 3 executors, 2 scribes, 1 scout,
1 connector, 1 reviewer, 1 critic, 1 mutation-tester, 1 labrat, 1 sentinel. The L1 holds the §3
planner seat; a bounded planning data-walk rides the scout item. The L1 integrates the v2 instrument
after the controls commit and before the wave marker, so attack seats have one fixed target.

## Evidence pointers

All beneath `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/`: `probe/` (frozen
scorer), `controls/` (generators and receipts), `open/` (round-start receipts), `close/` (close
battery), `w1/` (seat reports), `build/<seat>/` (seat artifacts).
