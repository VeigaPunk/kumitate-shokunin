# Lessons — round 17

## Axis move: runtime member coverage 6 → 7

The lowest-axis selector started tied: `coverage:script-layer` and
`coverage:runtime-layer` both read **6**; operability read 8. The round took the
pre-registered runtime option because it was a re-form of notes whose internals
were already present, while the script option needs new analysis for four
S2-library files no note names.

The frozen runtime formula is:

`floor(10 × C1r/C1r_total × R_sections/R_members)`.

Before any note edit:

- `C1r/C1r_total = 11/11`;
- `R_members = 98` (93 runtime `src/*.rs` + 5 CLI `src/*.rs`);
- `R_sections = 60` member-only sections;
- `floor(10 × 11/11 × 60/98) = 6`.

The threshold for 7 is `ceil(7 × 98 / 10) = 69`, so the move needed **nine**
additional member sections. `R1` alone supplies eight and reaches only 68/98,
which still floors to 6. The ninth came from the one missing R8 member:
`native_dispatch_topology.rs`.

After the edit:

- `corpus/knowledge/native-judge-pipeline.md` carries one section for each of
  R1's eight declared members: `native.rs`, `native_header.rs`,
  `native_schema.rs`, `native_contract.rs`, `native_scores.rs`,
  `native_plan_digest.rs`, `native_launch.rs`, `native_telemetry.rs`;
- `corpus/knowledge/native-transcript-ledger-seats.md` carries the fourth R8
  section, `native_dispatch_topology.rs`;
- `R_sections = 69`;
- `floor(10 × 11/11 × 69/98) = floor(7.0408…) = 7`.

The row-local gate is stronger evidence than the aggregate:

```text
ROWS: 2  YES: 2  NOTES: 2  SECTIONS: 12
ROW R1   form=section   notes=1 sections=8 adv=0
ROW R8   form=section   notes=1 sections=4 adv=0
SUMMARY: errors=0 warnings=0
CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=12 adv=0)
```

Command: `node scripts/claims-check.mjs --row R1 --row R8 --strict`, exit 0.
An independent in-process census also reported occurrences=distinct for both
rows: R1 **8=8**, R8 **4=4**. That equality matters because the aggregate has a
duplicate-section hole described below.

The repo-wide gate moved from `sections=137 adv=16` to
`sections=146 adv=14`: nine new sections; R1's `ROW_NO_SECTIONS` and R8's
`MEMBER_COUNT_SUSPECT` both cleared. The three R9 out-of-family sections remain,
so in-family arithmetic reconciles as `S_sections 74 + R_sections 69 = 143`,
while the gate reports 146 total sections: exactly 143 + 3.

## What the re-form added

The eight R1 sections turn an already detailed topic note into a mechanically
checkable member census. Each section starts with a member-resolving heading,
has a live own-file anchor, and quotes a symbol verbatim from that file. The
claims gate resolves all eight to distinct origin files under
`crates/ufo-core-runtime/src/` at origin HEAD `51b814c2b`.

The R8 addition records the transcript-side topology proof rather than
repeating seat-coverage sets: FIFO task-call/result pairing, spawn evidence,
wave-token double-dispatch refusal, exact four-field dispatch matching, the
three-call Main shape, `probe_parent` → labrat, and the no-nested-dispatch tail
in `validate_dispatch_topology` (`native_dispatch_topology.rs:410-465`).

## Falsifications and defects found

### 1. Duplicate sections can inflate the layer numerator

The round's critic reproduced a real disagreement between the two tools:

- `claims-check.mjs` checks a row's declared count with a distinct set over
  `s.file ?? s.heading` (`scripts/claims-check.mjs:378`);
- `proxy-check.mjs` increments `R_sections` for every in-family section
  occurrence (`scripts/proxy-check.mjs:412`).

A duplicated section plus a missing member can therefore keep the row's
occurrence count at the threshold while verifying fewer distinct files. For an
`N files` row such as R8, that mismatch is warning-only; the proxy would still
count every occurrence. This round did not exploit the hole: strict row checks
were advisory-free and the explicit census proved R1 8 occurrences / 8
distinct files and R8 4/4. The durable hardening is queued for an operability
round: derive layer numerators from distinct resolved in-family files, with a
mutation case that duplicates one section while dropping another.

### 2. The R1 cell leaked its obsolete glob back into membership

R1 already enumerated eight members, but its historical explanation still put
``native*.rs`` in backticks. `familyPatterns()` consumes every path-like
backtick token from the whole members cell, so the old glob silently admitted
*all* `native*.rs` files as R1 members. A mutation arm proved that a
`native_dispatch_topology.rs` section inside the R1 note read `inFamily=true`.
The explanation now uses plain text for the historical glob; the eight named
backticked basenames are the only patterns. This moves no score term but makes
the family boundary match the registry claim.

### 3. Two existing citations were wrong

- The R8 note paired its three title-order names with ordinals 55/56/60, but the
  contract registry is seat_coverage 55th (`native_contract.rs:124`), ledger
  56th (`:125`), dispatch_topology 57th (`:126`), transcript 60th (`:129`). The
  title and opening now name all four and bind each ordinal explicitly.
- `native-judge-pipeline.md` cited `native_launch.rs:130` for the agent-XOR-
  dispatch-attempt rule. That line is the duplicate effective-launch record
  refusal. The XOR refusal is in `native_seat_coverage.rs:291-296` and is now
  cited there.

### 4. Existing prose headings are inert

The critic and executor both tested headings such as
`## Contract-hash mechanism (`native_contract.rs`)`. `RE_CHUNK_HEAD` is
anchored at the beginning of the heading chunk, so a backtick appearing later
in prose does not make the heading a member section. A scratch merge of all
eight R1 drafts returned 8 sections, zero findings, and `MATCH`; no existing
heading needed renaming.

### 5. The moved main repo broke the bare round gate

The fleet moved from `/home/vgpnk/projects/shokunin` to
`/home/vgpnk/Projects/shokunin`, but `scripts/round-gate.mjs` still hardcoded
the old lowercase path. Before repair, the executable checklist read 8/10:
both round-gate items failed closed with `REPORTS_DIR_MISSING`. The default now
derives the main repo as `resolve(HERE, '..', '..')` and reports as
`<main-repo>/.ufo/reports`; explicit flags and environment precedence are
unchanged. Direct smoke evidence after repair:

- `node scripts/round-gate.mjs` → `ROUND_GATE: CLEAN (round=16 lane=kumitate checks=10 errors=0 warnings=0)`;
- `node scripts/round-gate.mjs --tracked` → `ROUND_GATE: CLEAN (mode=tracked checked=14 errors=0 warnings=0)`;
- `node scripts/round-gate.mjs --selftest` → `ROUND_GATE_SELFTEST: 57/57 pass`, `VERDICT: PASS`.

This is an uncounted repair inside the coverage round: A remains 5, C remains
10, and the operability score remains 8. The script pin is re-derived in the
scorecard so the edit cannot hide.

## L2 cross-checks

Nine L2 lanes ran in one batch: planner, four scoped executors, R8 scout,
critic, mutation-tester, connector. The mutation lane confirmed the planned
section behavior on throwaway copies: partial R1 is `MEMBER_COUNT_DRIFT`, the
fourth R8 section clears its suspect warning, prose-first headings stay topic
prose, and a blank anchor endpoint is `SECTION_DEAD_ANCHOR`. The connector found
no literal hit for any of the nine target basenames in six sibling corpus trees;
Kagi/Kama use “runtime” for adjacent handler/endpoint surfaces, not this judged
Rust pipeline. No scope contest was absorbed.

## What remains

`coverage:script-layer` stays the lane floor at 6. The next admissible move is
the pre-measured S2 completion: eight member sections move 74/114 to 82/114 and
therefore 6 → 7. Four collector-library members require fresh source analysis;
they must not be generated from the two existing topic notes by analogy.

The duplicate-occurrence numerator hole, the cite-check fenced-backtick defect,
the empty-existing-`--src` boundary, and the two surviving round-16 proxy
mutants remain queued operability work. None was folded into this coverage move.