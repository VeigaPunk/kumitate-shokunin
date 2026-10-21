PLANWALK R_members=92 R_added=0 R_deleted=0 R5=4 R7=5

# ScoutPlannerWalk — R layer at 31c465f1 (independent re-derivation)

Read-only. No writes outside this report. No tool installs. No REA calls.
Pin `/fast/scratch/kumitate-r35/src` verified: `git rev-parse HEAD` =
`31c465f15669f744848bd9f5d56191c5085670f7`, `status --porcelain` empty;
base `964f443e` resolves in the same clone.

## 1. R_members derivation — 92, unchanged

Rule: `SCORECARD.md:230-232` (count from the origin tree) and lane
`scripts/proxy-check.mjs:317-320` (`LAYER_PATTERNS.R` = direct children
`crates/ufo-core-runtime/src/*.rs` + `crates/ufo-cli/src/*.rs`).

```
$ git -C … ls-tree -r --name-only {964f443e,31c465f1} -- crates/ufo-core-runtime/src crates/ufo-cli/src \
  | grep -c '\.rs$'                      -> 92   (both revisions)
$ … -- crates/ufo-core-runtime/src     | grep -c '\.rs$'  -> 88   (both)
$ … -- crates/ufo-cli/src              | grep -c '\.rs$'  ->  4
  # main.rs, main_tests.rs, titanium.rs, titanium_tests.rs
$ nested .rs under those src dirs (pattern excludes) -> none; non-.rs -> none
```

Matches the admitted stanza `SCORECARD.md:286` `R_members=92` and the frozen
baseline `.ufo/waves/round-35/baseline/proxy-json.txt:25` `"R_members": 92`.

## 2. Added / deleted — 0 / 0; 28 modified

```
$ git -C … diff --name-status 964f443e 31c465f1 -- crates/ufo-core-runtime/src crates/ufo-cli/src \
  | awk '{print $1}' | sort | uniq -c
     28 M                       # no A, no D, no R
$ git -C … diff --shortstat 964f443e 31c465f1 -- <same paths>
 28 files changed, 1573 insertions(+), 1010 deletions(-)
```

Cross-check: the 28 paths equal, row for row, the `crates/` rows of
`baseline/upstream-changed-964f443e..31c465f1.tsv` (97 repo rows = 89 M + 2 A +
6 D; `diff` of both sorted lists printed nothing).

## 3. The 28 modified R members (family per `SCORECARD.md:126-136`)

- **R1 (5)**: `native.rs`, `native_contract.rs`, `native_header.rs`,
  `native_plan_digest.rs`, `native_scores.rs`
- **R2 (5)**: `loop_driver.rs`, `loop_driver_dry.rs`, `loop_driver_judge.rs`,
  `loop_driver_tests.rs`, `state.rs`
- **R3 (4)**: `cost_ledger.rs`, `cost_ledger_validation_tests.rs`,
  `execution_profile_tests.rs`, `native_profile.rs`
- **R4 (0)** · **R5 (0)** · **R6 (2)**: `distill.rs`, `distill_tests.rs`
- **R7 (2)**: `local_ship.rs`, `local_ship_tests.rs`
- **R8 (1)**: `native_transcript.rs` · **R9 (1)**: `native_tests.rs` · **R10 (0)**
- **R11 remainder (8)**: `lib.rs`, `native_route.rs`,
  `profile_shape_refusal_tests.rs`, `round_digest.rs`, `round.rs`
  (all `crates/ufo-core-runtime/src/`), plus `crates/ufo-cli/src/main.rs`,
  `titanium.rs`, `titanium_tests.rs`

Sum 5+5+4+0+0+2+2+1+1+0+8 = 28. **R5 has zero pin-caused churn; R7 has two
changed members.**

## 4. R5 and R7 member lists at 31c465f1 (round-36 candidates)

Resolved with `ls-tree` + `git show` at the pin; L = `wc -l` at pin.

**R5 — seats & admission, exactly 4 members (all SAME as 964f443e):**

| member (`crates/ufo-core-runtime/src/`) | L |
|---|---|
| `native_seats.rs` | 229 |
| `native_admission_text.rs` | 330 |
| `native_admission_rules.rs` | 243 |
| `native_text.rs` | 184 |

**R7 — local ship + fs layer, exactly 5 members:**

| member (`crates/ufo-core-runtime/src/`) | L | status |
|---|---|---|
| `local_ship.rs` | 2389 | **CHANGED** 2281→2389 (+180/−72) |
| `local_ship_tests.rs` | 2969 | **CHANGED** 2737→2969 (+232) |
| `bounded_fs.rs` | 149 | SAME |
| `bounded_fs_tests.rs` | 107 | SAME |
| `fs_durability.rs` | 198 | SAME |

No extra match for either pattern at the pin (no `native_seats_tests.rs`, no
other `local_ship*`/`bounded_fs*`/`fs_durability*`); registry rows and live tree
agree 1:1.

**Round-36 arithmetic confirmed:** baseline `R_sections=83`, `R_members=92`
(`baseline/proxy-json.txt:25-28`); R5/R7 are topic-form with 0 sections
(`baseline/claims.txt:16,18`), 4+5 = 9. 83+9 = 92 ⇒
`floor(10 × 11/11 × 92/92)` = **10**.

## 5. Anchor risk carried into R5/R7 sections

Today's prose anchors are unscored (`ROW_NO_SECTIONS`, `baseline/claims.txt:29-30`),
but a new per-member section is scored against the mechanical test
(`corpus/knowledge/member-claims-gate.md:64-78`: `1 ≤ a ≤ b ≤ line count`, both
endpoints non-blank) plus semantic honesty.

- **R7's note line numbers are pre-pin.** `recover_apply_journal` moved
  1098→**1185**, `run_verifier` 2247→**2355**, `atomic_write` now 2269, and
  private `validate_bounds` became `pub fn validate_request_bounds` at **1847**.
  The heading `## Verifier grammar (:2061-2291)` at the pin points into
  `strip_trailing_version_suffix`/`atomic_write`; it only became mechanically
  LIVE because the file grew past 2291 — false liveness under the lax test.
  Measured flips: 4 LIVE→DEAD (`:1827-1832`, `:1208-1226`, `:2080-2181`,
  `:2064-2078`), 8 DEAD→LIVE for the same growth reason; 10 DEAD at pin
  (`:29`, `:20-25`, `:1208-1226`, `:1827-1832`, `:2064-2078`, `:2080-2181`,
  `:2356-2434`, `:2411-2432`, `:2455-2485`, `:2464-2483`).
- **R7 test census drifted**: `local_ship_tests.rs` 77 `#[test]` at base →
  **81 at pin**; `corpus/knowledge/test-inventories.md:115` claims 85/8 groups
  (already stale at base — pre-existing, not pin-caused).
- **R5 note has two dead own-file anchors** despite unchanged members:
  `native_text.rs:96-198` (file 184 L) and `native_seats.rs:218-230` (file
  229 L), identical at 964f443e — do not copy into new sections.
- **R7 note `main.rs:1841-1860` / `:1849` dead** (`crates/ufo-cli/src/main.rs`
  is 1512 L at pin, 1527 at base; modified +23/−38) — pre-existing at both revs.
- **Live anchors verified at the pin** (start is the named declaration, end
  non-blank; all re-checked `LIVE`):
  - R5: `native_seats.rs:95-102` (`role_by_name`), `native_seats.rs:145-152`
    (`SUFFIX`), `native_admission_text.rs:18-25` (`detail_contains_credential`),
    `native_admission_rules.rs:136-143` (`validate_attempt_ledger_shape`),
    `native_text.rs:25-32` (`cached_json_lower`).
  - R7: `local_ship.rs:26-33` (`HARD_MAX_REPLACEMENT_BYTES`),
    `local_ship_tests.rs:46-53` (first `#[test]`), `bounded_fs.rs:40-47`,
    `bounded_fs_tests.rs:8-15` (`read_bounded_accepts_exact_ceiling`),
    `fs_durability.rs:32-39` (`TmpGuard`).

## 6. Pin-caused R-layer anchor death outside R5/R7

`round.rs` shrank **32 L → 11 L**; `RoundState` is gone (doc-comment-only
placeholder). R11's note `corpus/knowledge/runtime-remainder-census.md:331`
still heads "`round.rs` (32 L)" and `:342` probes `round.rs:17-20`. Baseline
already fails it: `baseline/claims.txt:35`
`SECTION_DEAD_ANCHOR row=R11 … round.rs — own-file anchors 17-20 are dead`.
Clearing that R11 section to the corrected 11-L probe is required for a CLEAN
strict gate at the pin, independent of the R5/R7 score move.

## 7. Confidence / unknowns

- Observed: counts, path lists, line numbers, symbol positions, 28-row identity
  with the baseline TSV, and every anchor quoted in §5 (commands above).
- [INFERENCE] Family attribution in §3 follows the registry rows' written
  patterns; I did not execute `scripts/claims-check.mjs` (baseline artifacts are
  quoted, not re-run). R5/R7 = 0 sections is the baseline's own record.
- Unresolved: R5-vs-R7 ordering only. Both are needed for 92/92; R7 costs more
  (2 changed members, +232 test lines, pre-pin numbering throughout its note).
  No other R-layer unknown blocks the planner.
