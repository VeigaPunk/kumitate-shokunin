# Seat K70ScribeWaveCensus — round-70 final result/report reconciliation: field design (v2) and the dead/unknown distinction

## Axes

- **Primary (judged): operability.** The round-70 plan claims one predicate only — C1 `REPLAY70_HELD` 10/10 on the ten bounded replay obligations, integer held at terminal 9. This seat does **not** score, re-run, or amend that predicate and claims no coverage score. It designs the close-time artifact that L1 needs to reconcile the 64-seat wave against that claim.
- **Process axis 1 — census completeness:** every one of the 64 declared seats must end the wave classified, with no seat silently dropped.
- **Process axis 2 — dead vs unknown derivability:** the round-69 close file could not derive dead seats (verbatim: `"dead_seats": "not derivable: handoff has no status/error/session fields"`). v2 must make that derivation possible from persisted evidence, and must distinguish *dead* from *unknown*.
- **Process axis 3 — evidence auditability:** every field in the reconciliation must trace to a byte on disk or a dispatch record; nothing may be an unobserved inference.
- **Process axis 4 — freeze compliance:** frozen bytes (plan, counter, r69 controls) are read-only; the ticket's frozen plan id is the freeze **commit**, and the working tree must stay byte-identical to it.

## What this seat did (behavior)

1. Read the frozen round-70 plan, the round-70 dispatch/registry, the wave ready markers, and the **round-69 close schema** (`w1-results.json`, `close/wave-reconciliation.json`) as the schema baseline.
2. Designed the v2 close-time file: JSON Schema, a 64-seat template, a pure state-derivation module (incl. the dead/unknown rule), and a checker with template/derive/close modes.
3. Self-tested the derivation (10 hand-written cases) and the checker (one positive fixture, two negative controls, one template-rejection control). Two defects in my own draft were found by my own checker and fixed before this report.
4. Wrote nothing outside this seat's build dir, this report, and its own scratch (scratch removed before yield).

## The draft — `ufo-wave-reconciliation-v2`

Target path (L1 owns it; this seat does not create it): `.ufo/waves/round-70/close/wave-reconciliation.json`.
Schema: `.ufo/waves/round-70/build/K70ScribeWaveCensus/reconciliation-schema-v2.json`.

### Top-level fields

| Field | Type | Meaning / why it exists |
| --- | --- | --- |
| `schema` | const `ufo-wave-reconciliation-v2` | file self-identification; r69 had no version marker |
| `wave` / `round` | const | r69 compat (`wave`) |
| `observed_at` | date-time | the census instant; the wave is live, so a snapshot must be timestamped |
| `notes` | string[] | free-text disclosure lines (e.g. "template", "network-dependent arm") |
| `evidence_sources` | object | `{dispatch, ready_partial, results, report_dir, build_root, observed_rev}` — every input file the file was derived from, so the census is replayable |
| `declared_seats` | int (64) | from `w1-dispatch.json` registry |
| `seats` | array of 64 seat rows | **the census itself** (new; r69 had no per-seat row) |
| `state_counts` | map | count per seat state; keys must cover the whole enum, values sum to 64 |
| `role_counts` | map | r69 compat (roles: connector 2, critic 16, executor 13, mutation-tester 5, reviewer 16, scout 6, scribe 6 — observed in this wave's dispatch) |
| `settled` | int | **r69 compat**: seats with a collected results entry (r69 counted collected entries, 64/64, while 7 had empty output — the semantics are preserved and named) |
| `settled_nonempty` | int | **new**: entries that are both `settled` and non-empty — separates "collected" from "produced content" |
| `reports_present` | int | r69 compat |
| `missing_reports` | string[] | r69 compat |
| `empty_outputs` | string[] | r69 compat (may overlap `missing_reports`, as in r69) |
| `dead_seats` | array of objects | **changed type**: r69 held a prose string; v2 holds `{name, instance, settle_status, subreason}` |
| `unknown_seats` | array of objects | **new**: `{name, reason}` |
| `handoff` | string | r69 compat (`"Main WAVE-DONE: all 64 seats settled"`) |

### Per-seat row (`seats[]`, 64 rows)

| Group | Fields | Meaning |
| --- | --- | --- |
| identity | `name`, `role`, `milestone`, `axes` | from the dispatch registry; `name` must be a declared member (else mismatch `UNDECLARED_SEAT`) |
| dispatch | `declared` (bool), `instance` (string\|null), `source` (`w1.ready.partial`\|`none`) | `instance` is the spawned agent id (e.g. `K70ExecRunner-4`); **this is the start evidence** that makes dead vs unknown decidable |
| settle | `status` (`settled`\|`error`\|`timeout`\|`unsettled`\|`unknown`), `session` (id\|null), `settled_at` (ISO\|null), `error` (verbatim text\|null) | **the field set round-69 lacked**; the collector records it when the wave settles, per seat |
| result | `present` (bool), `output_bytes` (int\|null), `output_sha256` (hex\|null), `duplicate_of` (name\|null) | content facts of the collected entry; sha makes a rewrite detectable (r69 lesson: replays overwrote frozen receipts) |
| report | `present` (bool), `path` (lane-relative), `bytes` (int\|null), `sha256` (hex\|null) | the seat's report file under `w1/` |
| build | `present` (bool), `file_count` (int\|null) | the seat's private build dir |
| trailer | `declared` (path\|null), `parse` (`not_applicable`\|`ok`\|`missing`\|`ambiguous_multiple`), `resolves` (bool\|null), `matches_seat` (bool\|null) | the report's `Report:` trailer, parsed leniently (see Finding 4) |
| verdict | `state` (enum below), `mismatches` (code[]) | per-seat classification and its integrity findings |

Mismatch codes: `UNDECLARED_SEAT`, `DUPLICATE_RESULT`, `TRAILER_MISSING`, `TRAILER_AMBIGUOUS`, `TRAILER_UNRESOLVED`, `TRAILER_SEAT_MISMATCH`, `ARTIFACT_PATH_ABSENT`, `RESULT_NEVER_SETTLED`, `OUTPUT_REPORT_DRIFT`.

### Seat-state enum (priority order, first match wins)

`pending-collection` (template only) → `reconciled` → `error` → `partial_result_only` → `empty_output` → `partial_report_only` → `dead` → `unknown`.

| State | Derivation (all from recorded signals) |
| --- | --- |
| `reconciled` | `settle.status=settled` ∧ non-empty result ∧ report present ∧ (no trailer, or trailer resolves to this seat's own report) |
| `error` | `settle.status` is `error`/`timeout` (an observed failure — distinct from "unknown") |
| `partial_result_only` | settled, non-empty result, **no** report file |
| `empty_output` | result entry present with `output_bytes = 0` (report may or may not exist) |
| `partial_report_only` | no result entry, but a report file exists (proves the seat ran; the final result never settled) |
| `dead` | **no result entry, no report file, and positive start evidence** (dispatch instance id or settle session id) |
| `unknown` | **no result entry, no report file, and no start evidence** — nothing proves the seat ever ran |

## The dead/unknown distinction (the requested part)

Round-69 could not answer this. v2 answers it from persisted evidence only, because at close time no live process survives:

> **dead** ⇔ started ∧ produced nothing recorded
> **unknown** ⇔ neither start nor output is evidenced
> **partial_report_only** ⇔ started and produced a report but never settled a result (not dead — output exists)
> **error** ⇔ a settle record exists with an error/timeout (not unknown — the failure is observed)

Two design consequences that follow from the evidence rather than from preference:

1. **Start evidence must be captured, not inferred.** `w1.ready.partial` (seat → spawned instance id) and the collector's `settle.session` are the only start evidence. Without a per-seat settle record, the r69 string stays the honest answer. The v2 collector therefore must write `status`/`session`/`settled_at`/`error` per seat; the r69 handoff line ("all 64 seats settled") is not a substitute — it carries no per-seat status.
2. **`unknown` is not a synonym for "dead", and neither is a synonym for "missing report".** A seat that has a report but no settled result is neither dead nor unknown; it is *partial*. Conflating the two would overstate failure in one direction and hide a never-started seat in the other.

Derivation is a pure function (`build/K70ScribeWaveCensus/lib/derive-state.mjs`), unit-tested on 10 hand-written cases including the explicit discriminator pair: identical rows except for the dispatch instance id yield `dead` with it and `unknown` without it (observed: `DERIVE70: PASS cases=10 failures=0`, receipt `receipts/selftest-derive.out`).

### r69 → r2 mapping (compatibility, no silent semantic drift)

| r69 key/field | v2 | Note |
| --- | --- | --- |
| `w1-results.json` entry `{name, agent, output, note}` | results collection entry `{name, agent, output, note, status, session, settled_at, error}` | the four r69 fields are kept verbatim; the four settle fields are the addition that makes dead/unknown derivable |
| `settled: 64` | `settled` (entries collected) + `settled_nonempty` (entries with content) | r69's single number hid the 7 empty outputs; v2 splits them |
| `reports_present`, `missing_reports`, `empty_outputs`, `role_counts`, `handoff` | same names, same meaning | unchanged |
| `dead_seats: "not derivable: …"` | `dead_seats: [{name, instance, settle_status, subreason}]` + `unknown_seats: [{name, reason}]` | type change from prose to records |
| — (absent) | `seats[]` (64 per-seat rows), `state_counts`, `evidence_sources` | new; this is what makes the census auditable |

## Gates (commands + observed outputs)

All commands read-only, absolute paths, run from the fleet root; no git/jj mutation, no installs, no background jobs. Receipts under `build/K70ScribeWaveCensus/receipts/`.

| # | Command | Observed output | Exit |
| --- | --- | --- | --- |
| G1 | `sha1sum $LANE/.ufo/waves/round-70/plan.md` | `56ba28076fb3de255d34a354c9855a248ea97945` | 0 |
| G2 | `git -C $LANE hash-object .ufo/waves/round-70/plan.md` | `65332006bea147e8750ed76d0f771633608a4f4e` | 0 |
| G3 | `git -C $LANE log --format='%H %s' -1 -- .ufo/waves/round-70/plan.md` | `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a round-70: freeze replay isolation claim and negative baseline` | 0 |
| G4 | `git -C $LANE cat-file -p HEAD:.ufo/waves/round-70/plan.md \| sha1sum` | `56ba28076fb3de255d34a354c9855a248ea97945  -` (identical to G1 → working tree == frozen blob) | 0 |
| G5 | `jq '.results\|length' r69/w1-results.json` | `64` | 0 |
| G6 | `jq '[.results[]\|select(.note!=null)]\|length'` (r69) | `0` — the r69 collector recorded **no** note/status/error field at all (the root of the "not derivable" gap) | 0 |
| G7 | `jq '[.results[]\|select(.output=="")]\|.[].name'` (r69) | 7 names (K69ScribeAmend, K69ReviewL4Blind, K69CriticC1Thesis, K69CriticC2Thesis, K69SentScope, K69RevengerL4, K69SimplifyCounters) | 0 |
| G8 | `jq '.counts, role_counts' r70 w1-dispatch.json` | `spawn 64 / resume 0 / total 64`; roles: connector 2, critic 16, executor 13, mutation-tester 5, reviewer 16, scout 6, scribe 6 (= 64) | 0 |
| G9 | `node $B/selftest-derive.mjs` | `DERIVE70: PASS cases=10 failures=0` (9 states + 1 discriminator case) | 0 |
| G10 | `node $B/make-template.mjs $L $B/wave-reconciliation.template.json` | `wrote … seats=64 with_instance=61` | 0 |
| G11 | `node $B/validate-reconciliation.mjs --lane $L --file $B/wave-reconciliation.template.json --mode template` | `RECONCILE70: PASS mode=template seats=64 anomalies=0` | 0 |
| G12 | `node $B/validate-reconciliation.mjs … --mode derive` (on template) | 64 rows printed; placeholder-derived tally `61 dead / 3 unknown` — **placeholder arithmetic on empty rows, not a seat outcome claim** | 0 |
| G13 | `node $B/make-selftest-fixture.mjs $L $B/selftest/midwave-close-fixture.json` | synthetic fixture written; `state_counts` snapshot at that instant; `reports_present=29 settled=29 missing_reports=35` | 0 |
| G14 | `node $B/validate-reconciliation.mjs --lane $L --file $B/selftest/midwave-close-fixture.json --mode close` | `RECONCILE70: PASS mode=close seats=64 anomalies=0` | 0 |
| G15 | negative control A: same file with one seat's `report.present` flipped to true (mutation done in scratch only) | `RECONCILE70: FAIL mode=close seats=64 anomalies=4` → `REPORT_PRESENCE_DRIFT`, `STATE_DERIVATION_MISMATCH`, `MISSING_REPORTS_DRIFT`, `REPORTS_PRESENT_DRIFT` | 1 |
| G16 | negative control B: one seat's `state` flipped dead→unknown (mutation in scratch only) | `RECONCILE70: FAIL mode=close seats=64 anomalies=4` → `STATE_DERIVATION_MISMATCH`, `UNKNOWN_RULE` ("unknown requires no start evidence and no result entry"), `DEAD_LIST_DRIFT`, `UNKNOWN_LIST_DRIFT` | 1 |
| G17 | `node $B/validate-reconciliation.mjs --lane $L --file $B/wave-reconciliation.template.json --mode close` | `RECONCILE70: FAIL mode=close seats=64 anomalies=200` — a template can never be mistaken for a reconciliation | 1 |
| G18 | `rm -rf /fast/scratch/hyaku/kumitate-r70/K70ScribeWaveCensus` | scratch removed: YES (verified `[ -d … ]` → absent) | 0 |

Tooling (no installs performed): `node v24.21.0`, `jq` → `jaq 3.1.1`, `git 2.56.0` — pre-installed system binaries; no pacman transaction, no `uv`/`npx` install, no PATH mutation, no host service restart. (`RULES.md` channel order observed: nothing needed installing.)

## Findings

1. **The r69 "dead_seats" gap is a collector gap, not a filesystem gap.** r69's results collection carries exactly four fields per seat (`name`, `agent`, `output`, `note`) and 0/64 non-null notes (G5, G6), so no per-seat status/error/session existed to derive from — hence the honest r69 string "not derivable". Fix belongs in the collector (add `status`, `session`, `settled_at`, `error`), not in the reporting layer.
2. **"Settled" conflated "collected" with "produced content".** r69 reported `settled: 64` while 7 entries had empty output and 8 seats had no report (r69 `close/wave-reconciliation.json`). v2 splits `settled` (entry collected) from `settled_nonempty` (entry with content) and adds `empty_outputs`/`missing_reports` overlap semantics unchanged.
3. **A "results vs reports count difference" is the cheapest integrity signal and it is per-seat in v2.** Known class from r68/r69 (`K68ReviewC1Predicate`, r69's 8 missing reports). r69 could only report the *set difference*; v2's per-seat row locates the difference on the seat and classifies it (`partial_result_only` vs `partial_report_only` vs `dead`).
4. **The `Report:` trailer convention is not uniformly honoured, so trailer absence must not be a state downgrade.** Observation on this wave's report dir: of 27 present reports, only `K70AttackSourceDrift.md` carried a line-start `Report:` trailer; the rest carry the word in prose or use other decorations, and one report file (`K70ScoutRegistry.md`) was present in a `grep -c` sweep and absent minutes later — the wave is live, so the census must be a close-time snapshot, not a mid-wave reading. Design consequence: `trailer.parse` is a first-class field; a missing trailer is recorded as mismatch `TRAILER_MISSING` (disclosed gap) and does **not** downgrade `reconciled`; only a trailer that resolves to a *different* seat's report is an integrity failure (`TRAILER_SEAT_MISMATCH` → `partial_result_only`).
5. **`w1.ready.partial` is written incrementally, so it is start evidence and not a settlement record.** Observed instance counts for the same seat set across the seat's own runs: 59 → 61 (G10 run) of 64, with the 5 → 3 remainder being late-wave seats (K70ScribeReport, K70ConnectOverlap, K70ConnectPatterns, K70ReviewSourcePin, K70AttackPrivateOutput). A census taken mid-wave would have labelled not-yet-dispatched seats `unknown` — correct by the rule, and exactly why the census must be taken after WAVE-DONE.
6. **Two defects in my own draft were caught by my own checker and fixed before this report:** (a) the first template emitted only one `state_counts` key, so `--mode template` failed with `STATE_COUNTS_KEY missing key error/dead/unknown` — the template now emits all eight enum keys; (b) my first trailer rule required a resolving, self-matching trailer for `reconciled`, which would have demoted 26 of 27 observed reports for a *missing* trailer; the rule now demotes only foreign trailers. Both fixes are in the artifacts, and both were re-run (G9–G17).
7. **The checker bites in the direction that matters.** Negative control B shows the dead/unknown rule is enforced, not merely documented: flipping one seat's state produces `UNKNOWN_RULE` plus dead/unknown list drift, exit 1 (G16).

## Touched surfaces

- Report: `.ufo/waves/round-70/w1/K70ScribeWaveCensus.md` (this file).
- Private artifacts (this seat only): `.ufo/waves/round-70/build/K70ScribeWaveCensus/`
  - `reconciliation-schema-v2.json`, `wave-reconciliation.template.json`
  - `lib/derive-state.mjs`, `validate-reconciliation.mjs`, `selftest-derive.mjs`
  - `make-template.mjs`, `make-selftest-fixture.mjs`, `selftest/midwave-close-fixture.json`
  - `receipts/` (12 captured command outputs), `README.md`
- Scratch (created explicitly, now removed): `/fast/scratch/hyaku/kumitate-r70/K70ScribeWaveCensus/`.
- No production file, no frozen file (plan/counter/r69 controls), no other seat's report or build dir, no fleet-root tracked file (LOG.md / SCORECARD.md / MANIFEST.json) was created, modified, or deleted. No git/jj mutation, no commit, no push, no delegation, no background job.

## Out of scope / limits (honest)

- **No seat outcome is asserted anywhere in this report.** The state tallies shown in G12–G14 are mechanical derivations over placeholder or synthetic rows and are labelled as such in place; they are not findings about any seat.
- The design has **not** been exercised against a settled wave: there is no `close/` directory and no results collection for round-70 yet, and by plan no report precedes WAVE-DONE and reconciliation. The positive close-mode run (G14) uses a synthetic fixture mechanically mirrored from a live mid-wave filesystem, so it exercises the checker's cross-file plumbing (report presence/bytes/sha, build presence/count, dispatch-instance match, derived-state agreement, list/count agreement) — it does not validate the schema against real settle records.
- The checker implements a structural subset of `reconciliation-schema-v2.json`; it is **not** a JSON-Schema validator and does not claim to be.
- The v2 file itself must be written by L1 at close. This seat supplies the schema, template, derivation rule and checker only, and leaves the production path untouched by design.
- `settle.status`/`session`/`settled_at`/`error` can only be populated by whoever collects the wave's results. If that collector keeps the r69 shape, `dead` and `unknown` will legitimately collapse to "not derivable" again — the schema cannot manufacture start evidence.
- Network-dependent and frozen-arm caveats of the wave itself (e.g. the live c2 forge-capture arm) are untouched by this seat; no predicate, counter, receipt, or score was read as an outcome.

Report: .ufo/waves/round-70/w1/K70ScribeWaveCensus.md
