EXEC r5-sections done sections=4 anchors=38 row-adv=0

## Scope

Added four internals-level `## ` member sections to `corpus/knowledge/native-admission-detail.md`
(scratch clone `/fast/scratch/kumitate-r36/w/ExecR5Sections/lane`, branch `r36-execcr5sections`,
base `0614092e0804aaca06642cb3a263a05c1cacc98e`). Patch: `/fast/scratch/kumitate-r36/w/ExecR5Sections.patch`
(54 lines, single modified file, `git status --porcelain` = ` M corpus/knowledge/native-admission-detail.md`).

Sections (source lines in the patched note; each heading's first backticked token is the full
repo-relative member path, so the registry resolver matches exactly one origin file):

- `corpus/knowledge/native-admission-detail.md:71` — `crates/ufo-core-runtime/src/native_admission_rules.rs` (8 body lines)
  three-arm `validate_profile` dispatch, v1 presence-policed field list and refusal template,
  v2 refusal literals, resilient delegation order, `validate_attempt_ledger_shape` ordering.
- `corpus/knowledge/native-admission-detail.md:82` — `crates/ufo-core-runtime/src/native_admission_text.rs` (10 body lines)
  ordered sensitive-shape scan, `clean_field_value` chain, `js_string_simple`/`js_string_f64` bands,
  `bounded_route_field` UTF-16 cut, `lane_timeout_detail` composition, detail-tail parse order,
  two-variant error enum, `seat_id_matches`, `sha256_prefixed_matches_bare`.
- `corpus/knowledge/native-admission-detail.md:95` — `crates/ufo-core-runtime/src/native_seats.rs` (8 body lines)
  label/id twins, `singleton_key`, `role_by_name`, `seat_label_matches`, run-tag/dispatch-name,
  `seat_key_from_parts`, `parse_logical_lane_id` vs `logical_lane_id_recomputes`,
  `dispatch_attempt_id_recomputes`, roster lookup cost classes and single refusal text,
  correlation material string.
- `corpus/knowledge/native-admission-detail.md:106` — `crates/ufo-core-runtime/src/native_text.rs` (8 body lines)
  `classify_failure_fields` short-circuit + exact-match-before-substring order, cache helpers,
  `FAILURE_RULES` eight rows in contract order, code-column boundary rule, `contains_bounded` twins,
  `ToolFailure`/`process` arm, `json_lower`, message wrapper, `significant_digits`/`is_exact_midpoint`.

Anchor/symbol discipline: every anchor is `path:N` with the section's own full path and a single cited
line; the adjacent backticked symbol on the same note line is the symbol declared on that line. 38
anchors, 38 `ok`, 0 `elsewhere`, 0 `absent`, 0 `dead`, 0 `noid`, `nonok=0`. 12 distinct verbatim
backticked symbols per note minimum far exceeded (e.g. `validate_profile`, `frozen_profile_field`,
`validate_attempt_ledger_shape`, `contains_sensitive_shape`, `clean_field_value`, `js_string_f64`,
`dispatch_lane_failure_detail_tail`, `seat_label`, `seat_id`, `seat_key_from_parts`,
`logical_lane_id_recomputes`, `proposal_row`, `correlation_group_for`, `classify_failure_fields`,
`FAILURE_RULES`, `contains_bounded`, `classify_failure`, `significant_digits`, `is_exact_midpoint`).

## Gate (existing registry arm; no `--fidelity` in the lane at run time — `grep -c fidelity scripts/claims-check.mjs` = 0)

Command (cwd = scratch clone):

    node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R5 --strict

Output:

    ROWS: 1  YES: 1  NOTES: 1  SECTIONS: 4
    ROW R5   form=section   notes=1 sections=4 adv=0
    SUMMARY: errors=0 warnings=0
    CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=4 adv=0)
    exit=0

Before the edit, the same command read:
`ROW R5 form=topic notes=1 sections=0 adv=1` / `ROW_NO_SECTIONS` / `CLAIMS: DRIFT` / `exit=1`.

## FIDELITY v1 pre-check (contract reimplementation, scratch-only, not lane code)

Harness: `/fast/scratch/kumitate-r36/w/ExecR5Sections/fidelity-check.mjs` (outside the lane; implements
the frozen FIDELITY v1 anchor/adjacent-symbol pairing, 14-character window, right-first, and the
ok/elsewhere/absent/dead/noid classes; gates nonok = elsewhere + absent only).

    node fidelity-check.mjs lane/corpus/knowledge/native-admission-detail.md /fast/scratch/kumitate-r36/src
    FIDELITY note=lane/.../native-admission-detail.md anchors=4  ok=4  elsewhere=0 absent=0 dead=0 noid=0 nonok=0
    FIDELITY note=lane/.../native-admission-detail.md anchors=11 ok=11 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
    FIDELITY note=lane/.../native-admission-detail.md anchors=12 ok=12 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
    FIDELITY note=lane/.../native-admission-detail.md anchors=11 ok=11 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
    FIDELITY_TOTAL anchors=38 ok=38 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
    exit=0

Anchors per section: 4 / 11 / 12 / 11 (item floor: 2). [INFERENCE] The L1's integrated `--fidelity`
arm should reproduce nonok=0 for these four sections; it was not present in the lane when this ran, so
the authoritative instrumented run is the L1's.

## Pin integrity

    git -C /fast/scratch/kumitate-r36/src rev-parse HEAD
    31c465f15669f744848bd9f5d56191c5085670f7
    git --no-optional-locks -C /fast/scratch/kumitate-r36/src status --porcelain   # empty
    stat -c '%A' /fast/scratch/kumitate-r36/src
    dr-xr-xr-x

Only reads were issued against the pin (read/grep/sed); no chmod, no writes, no `--src` pointing at
`/home/vgpnk/Projects/ufo-fsd-alpha`.

## Risks / notes

- [observed, not changed] `corpus/knowledge/native-admission-detail.md:40-42` still claims the
  `correlation_group_for` hash material order is `(role, lineage, resolved_model)`. Pinned truth at
  `crates/ufo-core-runtime/src/native_seats.rs:217-229` is
  `omp-native-correlation-v1\0{resolved_model}\0{role.name()}\0{assignment_lineage}` — resolved_model
  first. The new section states the pin truth; the stale "Rules worth carrying" bullet is outside this
  item's add-only scope and needs a scribe/L1 decision (the note header also still cites `ee907f1cf`).
- [observed] `agent://KumitateR36.ScoutR5Members` had no published output when consulted (only a
  progress line); all internals were read directly from the pin, so no scout map was relied on.
- No package/tool installs or upgrades were performed. No production lane files, Git/jj state, or
  external state were written; the only lane write is this report.
- The gate was run with `--src <pin>`; the joined pin/`src-rev=` behavior belongs to ExecClaimsFidelity
  and was not exercised here.

## Commands run (all read-only except the clone edit)

    mkdir -p /fast/scratch/kumitate-r36/w/ExecR5Sections
    git clone --no-hardlinks -q /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/kumitate-r36/w/ExecR5Sections/lane
    git -C /fast/scratch/kumitate-r36/w/ExecR5Sections/lane checkout -q -b r36-execcr5sections 0614092e0804aaca06642cb3a263a05c1cacc98e
    node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R5 --strict   # before + after
    node fidelity-check.mjs lane/corpus/knowledge/native-admission-detail.md /fast/scratch/kumitate-r36/src
    git -C .../lane diff > /fast/scratch/kumitate-r36/w/ExecR5Sections.patch
    git --no-optional-locks -C /fast/scratch/kumitate-r36/src rev-parse HEAD
