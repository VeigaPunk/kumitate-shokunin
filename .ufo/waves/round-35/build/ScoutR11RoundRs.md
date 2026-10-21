R11_ROUNDRS old=crates/ufo-core-runtime/src/round.rs:17-20 new=crates/ufo-core-runtime/src/round.rs:1-11 symbol=saturated

# R11 round.rs dead anchor — exact corrected section

## Observed at both revisions (sealed clone /fast/scratch/kumitate-r35/src)

- `964f443e`: `round.rs` is **32 L**; `#[derive(Debug, Default)]` + `pub(crate) struct RoundState { pub saturated: bool }` occupy **17-20**, and the only test is `new_state_starts_unsaturated` (`git show 964f443e:crates/ufo-core-runtime/src/round.rs`).
- `31c465f1`: `round.rs` is **11 L**, module documentation only — **zero items**. Its own doc says "The former `RoundState { saturated }` scope object … so the struct and its test were deleted; this module stays as the declared parity surface" (`crates/ufo-core-runtime/src/round.rs:8-11`).
- Diff `964f443e 31c465f1 -- round.rs`: `1 file changed, 10 insertions(+), 31 deletions(-)`. The only commit touching it in the range is `6ac94ff` ("rust-judge: one evidence authority…").
- The module is still declared: `pub(crate) mod round;` at `crates/ufo-core-runtime/src/lib.rs:62`.
- The survivor the doc names is the round-local binding `let saturated = matches!(outcome, LoopOutcome::Saturated);` at `crates/ufo-core-runtime/src/loop_driver_dry.rs:512` (file 980 L).

## Exact replacement — `corpus/knowledge/runtime-remainder-census.md` lines 331-342

```markdown
## `crates/ufo-core-runtime/src/round.rs` (32 L @ `964f443e` → 11 L @ `31c465f1`) — the doc-only paper-parity placeholder for the tip's round module

The tip `lib.rs` declares this module but upstream has not published the `.rs`
(SRC-PARTIAL), so the contract binds the module's EXISTENCE rather than an
invented field shape — and since `31c465f1` that surface is doc-only: 11 lines
of module documentation, no items. The module is still declared
`pub(crate) mod round;` at `crates/ufo-core-runtime/src/lib.rs:62`. The r14
shrink had deleted the write-only `round`, `phase`, `admitted` and `rejected`
fields plus the `RoundPhase` enum, leaving `RoundState { saturated }`; at
`31c465f1` that struct and its `new_state_starts_unsaturated` test were deleted
too, and the bool now lives as the round-local `saturated` binding in
`loop_driver_dry` (`loop_driver_dry.rs:512`). The old probe (the derive plus
one-field struct at lines 17-20 of the `964f443e` file) is dead at
`31c465f1`; the prior text is kept here as prose so the audit is not rewritten.

Probe: `saturated` (`crates/ufo-core-runtime/src/round.rs:1-11`) — re-anchored
at `31c465f1` to the whole surviving surface, the module doc that binds the
module's existence and records where the saturation flag moved.
```

Old revision label handling: the section carried only the size label `(32 L)`;
it is kept, attributed `@ 964f443e` (verified 32 L there), with `11 L @ 31c465f1`
added. The note-level `93798be12` label (lines 6, 527) is untouched; that commit
is **absent** from the sealed clone (`git cat-file -t 93798be12` → fatal), so it
cannot be re-verified — `964f443e` is the verifiable base.

## Why this anchor and symbol

- claims-check liveness: a section passes when ≥1 own-file anchor has
  `1 ≤ a ≤ b ≤ line count` and non-blank endpoints (`scripts/claims-check.mjs:378`).
  At 11 L the old `:17-20` is dead; `:1-11` is live (all 11 lines are `//!`, non-blank).
- Symbol rule (`scripts/claims-check.mjs:385-387`): any backticked token ≥3 chars
  with no `/ \ : . whitespace`, appearing verbatim in the file. `saturated` is
  verbatim at lines 8 and 10. `RoundState` also still occurs, but only inside the
  deletion record; naming the deleted struct as the probe would claim a symbol
  that no longer exists. `saturated` is the one surviving semantic, and it is
  independently verifiable at `loop_driver_dry.rs:512`.

## Critical constraint discovered — do NOT keep the dead pointer as `path:line`

The round-30 "keep the falsified pointer as prose" instinct fails **cite-check**:
every line ref outside fences is live, so a literal
`crates/ufo-core-runtime/src/round.rs:17-20` becomes `LINE_OOR` (error), because
the file has 11 lines (`scripts/cite-check.mjs:698-717`). Measured on an isolated
copy of the note: base `LINE_OOR=5, errors=13` → patched `LINE_OOR=4, errors=12`,
and the one removed finding is exactly round.rs:17-20. Therefore the history is
written as "at lines 17-20 of the `964f443e` file" — no ref token (the grammar
needs `:N` or uppercase `L<N>`; "lines 17-20" matches neither), same audit content.

## Validation (real gates, isolated copy at /tmp, `--src` = sealed clone)

- `node scripts/claims-check.mjs --row R11 --src /fast/scratch/kumitate-r35/src`
  on the lane's **unpatched** note: `CLAIMS  error SECTION_DEAD_ANCHOR row=R11
  crates/ufo-core-runtime/src/round.rs — own-file anchors 17-20 are dead`, exit 1.
- Patched copy: `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=41 adv=0)`, exit 0;
  round.rs section record `{"anchors":1,"live":true,"symbols":14,"symbolHit":true}`.
- Mutation control (anchor rewritten to `:12-13`): `SECTION_DEAD_ANCHOR … own-file
  anchors 17-20,12-13 are dead`, exit 1 — the new `:1-11` is load-bearing.
- cite-check patched: no new finding kind; new `OK` citations for
  `round.rs:1-11` (11 lines), `lib.rs:62` (1207 L), `loop_driver_dry.rs:512` (980 L);
  no `ORPHAN_REF`.
- Full-gate run at the pinned revision: 12 findings total; **R11 is the only row
  with a dead anchor and this is its only error**.

## Adjacent runtime-layer drift at 31c465f1 (outside this item, observed)

`git diff --stat 964f443e 31c465f1` shows **only round.rs changed** among these
five members; the other four were already stale at the round's base and pass
claims-check only because a second own-file anchor is live:

| census | declared | live L | dead citation | surviving symbol |
|---|---|---|---|---|
| `axes.rs` sec. 68 | 647 L | 520 | probe `:611-617` | `apply_subjective_argument_protocol` now `axes.rs:484`; live anchor `:94-214` keeps gate green |
| `axes_tests.rs` sec. 78 | 402 L | 260 | `:244-267` (line 84) | probe `:244-246` live; symbol now `:247` |
| `build_json.rs` sec. 128 | 1213 L | 305 | probe `:350-352` | `mirror_body_digest` **absent tree-wide**; live anchor `:78-305` keeps gate green |
| `config_tests.rs` sec. 148 | 724 L | 503 | probe `:709-712` | `validate_accepts_declared_ceiling_boundaries` **absent tree-wide**; live anchor `:500-503` keeps gate green |

Other stale prose (no gate failure):
- Note claims **47** members/sections while its own headings and the live gate
  count **41**: lines 1, 5, 475-478, 484; `SCORECARD.md:142` declares 41 but
  quotes `sections=47`. Gate passes only because `MEMBER_COUNT_DRIFT` reads the
  scorecard cell's first `41 members`; a latent trap if that phrase moves.
- `corpus/knowledge/loop-driver.md:148` (R2's note) still lists `round.rs`
  `RoundState` — stale at 31c465f1, prose only, no pointer.

## Remaining unknowns

- Whether the four stale sections' prose still matches their current files: not
  verified (outside item).
- [INFERENCE] The build_json mirror half appears to have moved to
  `crates/ufo-core-runtime/build.rs` (`SEAT_ROUTING_SCHEMA`:120,
  `validate_routing_mirror`:289); not traced to a commit.

## Commands run (all read-only on lane + clone; no tool installs; no secrets read)

```
git -C /fast/scratch/kumitate-r35/src show 964f443e:crates/ufo-core-runtime/src/round.rs
git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- crates/ufo-core-runtime/src/round.rs
git -C /fast/scratch/kumitate-r35/src log --oneline 964f443e..31c465f1 -- crates/ufo-core-runtime/src/round.rs
node scripts/claims-check.mjs --row R11 --src /fast/scratch/kumitate-r35/src          # DRIFT, exit 1
node /tmp/r11-dryrun/scripts/claims-check.mjs --self /tmp/r11-dryrun \
  --src /fast/scratch/kumitate-r35/src --row R11                                      # MATCH, exit 0
node /tmp/r11-mutant/scripts/claims-check.mjs --self /tmp/r11-mutant \
  --src /fast/scratch/kumitate-r35/src --row R11                                      # DEAD_ANCHOR, exit 1
node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src                      # enumerate; 509 pre-existing repo errors
```

Regenerate the isolated tree: `mkdir -p /tmp/r11-dryrun/corpus/knowledge /tmp/r11-dryrun/corpus/lessons /tmp/r11-dryrun/scripts; cp SCORECARD.md /tmp/r11-dryrun/; cp corpus/knowledge/runtime-remainder-census.md /tmp/r11-dryrun/corpus/knowledge/; cp scripts/claims-check.mjs scripts/cite-check.mjs /tmp/r11-dryrun/scripts/`, then replace lines 331-342 with the block above.
