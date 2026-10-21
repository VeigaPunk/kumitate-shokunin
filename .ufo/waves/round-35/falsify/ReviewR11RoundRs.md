ATTACK R11 round.rs re-anchor verdict=holds defects=0

Target: `corpus/knowledge/runtime-remainder-census.md:331-349` (section
`crates/ufo-core-runtime/src/round.rs`, re-anchored at `31c465f1`).
Lane working tree read-only; all mutation ran on a scratch `--self` copy under
`/fast/scratch/kumitate-r35/w/ReviewR11RoundRs/`. No installs or upgrades.

## Target claims — all verified (observed, not inferred)

Source: `/fast/scratch/kumitate-r35/src`, shallow clone (41 commits, origin
`/home/vgpnk/Projects/ufo-fsd-alpha`), detached at `31c465f1`.

| claim (census line) | command | observed |
|---|---|---|
| 32 L @ `964f443e` → 11 L @ `31c465f1` (331) | `git show REV:crates/ufo-core-runtime/src/round.rs \| wc -l` | 32 and 11 |
| doc-only, no items (333-335) | `git show 31c465f1:…/round.rs \| grep -vnE '^//!'` | exit 1, no non-doc line; all 11 lines `//!` |
| `pub(crate) mod round;` at `lib.rs:62` (336-337) | `git show 31c465f1:…/lib.rs \| nl -ba \| sed -n 58,66p` | line 62 exactly `pub(crate) mod round;` (lib.rs 1207 L) |
| bool lives at `loop_driver_dry.rs:512` (339-340) | `nl -ba` on the pinned file | `512: let saturated = matches!(outcome, LoopOutcome::Saturated);` in `ldi_dry_round_map_loop_outcome` (:427), returned :522, threaded :893→:931, consumed :703 `saturated: bool` → :717 `!saturated` (fn `persist_state`, `loop_driver_resume.rs:127`) |
| old probe 17-20 of `964f443e` (341-342) | `nl -ba` at 964f443e | 17 `#[derive(Debug, Default)]`, 18 `pub(crate) struct RoundState {`, 19 `pub saturated: bool,`, 20 `}` |
| struct + `new_state_starts_unsaturated` deleted at pin (338-341) | `git grep -n RoundState 31c465f1 -- crates/`; `git grep -c new_state_starts_unsaturated` | only `round.rs:8` (the doc's deletion record); test name absent tree-wide |
| "the bool now lives" is the *same* bool (340) | 964f443e vs pin | 964f443e has the identical binding at :495, `state.saturated = saturated` :875, `!state.saturated` :697 — continuity is exact |
| 964f443e is ancestor; only 6ac94ff touched the file | `git merge-base --is-ancestor`; `git log --format=… 31c465f1 -- …/round.rs` | YES; `6ac94ff 2026-10-19` (964f443e `2026-10-12`) |

Integrated text is byte-identical to the wave-1 seat's replacement block
(`.ufo/waves/round-35/build/ScoutR11RoundRs.md`) plus the attribution sentence
`(round-35 correction, seat ScoutR11RoundRs).` — accurate: that seat exists in
`build-spec.json:685` and its report is the source of the block.

## Required gate — MATCH, exit 0

```
$ node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row R11
ROW R11  form=section   notes=1 sections=41 adv=0
SUMMARY: errors=0 warnings=0
CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=41 adv=0)      # exit 0
```

Full gate for context: `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175
adv=6)` — matches the round-end claim string.

## Mutations — the section's pointers are load-bearing

Scratch self = copy of `SCORECARD.md` + `corpus/`; same `--src`.

| mutation | claims-check | cite-check |
|---|---|---|
| none (base) | MATCH, 41 sections, exit 0 | all refs OK |
| anchor `:1-11`→`:1-12` | `SECTION_DEAD_ANCHOR`, exit 1 | `LINE_OOR` at note:347 |
| heading path → `round_state.rs` | `SECTION_FILE_UNRESOLVED` | — |
| section deleted | `MEMBER_COUNT_DRIFT declared 41, found 40` | — |
| `loop_driver_dry.rs:512`→`:9999` | unaffected (inert) | `LINE_OOR` note:342 (980 L) |
| `lib.rs:62`→`:9999` | unaffected | `LINE_OOR` note:337 (1207 L) |
| probe symbol → absent identifier | **MATCH** (survives) | — |

The last row is the contract, not a defect: `scripts/claims-check.mjs:385-387`
accepts *any* backticked symbol verbatim in the file, and `RoundState`/
`saturated` both occur at `round.rs:8`. The note's own "What the probe cannot
show" says exactly this. The chosen probe `saturated` is the strongest
available (the only surviving semantic; `RoundState` appears only in the
deletion record).

## Adjacent defects (pre-existing at master; NOT counted against this target)

Round-35's diff of this note is one hunk (round.rs only, 16+/9−), so neither
item below was introduced by this round. Both were flagged by the wave-1 seat;
I re-derived them independently.

A1. **The note's 47-member arithmetic is stale and its Arm-1 transcript is
false.** Lines 1, 5-6, 8, 14-17, 39, 45, 482-485, 491, 501, 505, 516-517, 528,
534 still assert 47 members / 93 runtime + 5 CLI files / SECTIONS: 47.
Observed at BOTH verifiable revisions (`964f443e` and `31c465f1`): 88 runtime
+ 4 CLI = 92 `.rs`, R1–R10 union 51 (8+12+5+6+4+4+5+4+1+2, per-row match),
remainder 41; the 41 headings equal that remainder exactly both ways
(`remainder NOT sectioned: []`, `sections NOT remainder: []`). Live gate prints
`sections=41`, so line 491's "`47 members` equals the distinct section count"
is false. The declared base `93798be12` is absent from the shallow clone
(`git cat-file -t` → fatal), so the 47 reading is unverifiable; cite-check
reports `REV_UNKNOWN` (line 6), `UNRESOLVED admission.rs` (line 17, deleted
upstream before 964f443e), `UNRESOLVED replay_falsification_probes.rs`
(line 38). `SCORECARD.md:148` repeats it: "47 of 47 named … sections=47 adv=0"
and "93 − 51 = 42 … the written 47" against its own leading "41 members".
Minimal fix: restate as 41 = 37 runtime + 4 CLI at `31c465f1` (88 − 51 = 37),
keep 47 as a dated `93798be12` historical reading; transcript → `SECTIONS: 41`
/ `sections=41 adv=0`; drop `admission.rs` from the member list; SCORECARD
free text → "41 of 41 … sections=41 adv=0". (The gate stays green either way —
`MEMBER_COUNT_DRIFT` reads the cell's first `41 members`.)

A2. **Four other R11 sections carry dead probes at the pin**, yet claims-check
is green because a second own-file anchor survives. cite-check LINE_OOR:
note:76 `axes.rs:611-617` (520 L), note:84 `axes_tests.rs:244-267` (260 L),
note:136 `build_json.rs:350-352` (305 L), note:156 `config_tests.rs:709-712`
(503 L). Pre-existing at master; outside my item; unfinished sibling of the
same re-anchor class.

A3. **Class table contradicts itself**: line 38 declares 4 fixture files but
lists 5 names, and its own prose counts `bounded_fixture*` (2) + `fixture_spawn`
as fixtures (2+1), plus `test_env`, `profile_shape_refusal_tests` = 5.
`replay_falsification_probes.rs` exists at neither revision nor in
`master-tree`, `q11`, or the lane tree.

## Remaining unknowns

- Whether 47 was ever true: unobservable — `93798be12` is not an object in the
  sealed shallow clone. [INFERENCE] Yes at round 15, which is why the prose
  predates the round-32 remeasure; nothing suggests fabrication.
- A1/A2/A3 owners: pre-existing; no round-35 hunk touches them beyond the
  round.rs section.

Artifacts: `/fast/scratch/kumitate-r35/w/ReviewR11RoundRs/` (`self/`,
`recompute.mjs`, `recompute-any.mjs`, `*.bak` restored).
