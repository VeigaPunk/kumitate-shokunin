# round-4 aggregator corpus audit — kumitate

- **Round:** aggregator round-4 (steered; `.ufo/state/aggregator.round`=4), 2026-09-28.
- **Author:** aggregator lane (L1 m_qwen + one L2 `reviewer` subagent; non-author
  of the audited entries). Corrections are this new entry — no lane file edited.
- **Scope:** round-4 commit `e0f5ca7` (= HEAD at audit):
  `knowledge/native-judge-pipeline.md`, `knowledge/loop-driver.md` (new),
  `lessons/round-4.md`, `README.md`; plus a targeted re-check of the round-1
  `128`-attribution defect.
- **Method:** 24 citations independently re-executed against
  `~/Projects/origin-work/ufo-fsd-alpha` per `CORPUS.md`. Read-only; no builds.

**Verdict: CONFORMANT** — zero major defects in the round-4 delta; every
mechanism claim verified at symbol level. Six minor items, one carried defect.

## What reproduced (24 citations, symbol-level)

`classify_failure_fields` at `native_text.rs:161` + `FAILURE_RULES` first-match
order; `FailureClass::permits_advance` at `execution_profile.rs:447`;
`fail_local` at `ufo-cli/src/main.rs:906` — exit 2 covers every typed refusal
(`invalid|json|validation|io`), untyped → exit 1 `ufo: <err>`;
`NATIVE_CONTRACT_FILES` = 66 entries (counted), `MAX_CONTRACT_FILE_BYTES` 256
KiB, `MIN_CONTRACT_HEADROOM_BYTES` 8 KiB at `native_contract.rs` ~:19/:41/:69;
handoff schema 21 required + 8 optional fields, three profiles,
`deny_unknown_fields`, profile=version, ≤16 MiB named regular file
(`native_schema.rs` :455/:550 vicinity); `RoundValidity::Sound` sole native
construction `native.rs:398`; `judge_handoff` :470; `mission_goal` derives only
from plan `acceptance_criteria`, unmeasurable dominates to `unverified`
`native.rs:626`; critical-seat `lane_timeout` invalidation
`native_telemetry.rs` ~:870; checkpoint fingerprint `ufo.fsd.v4` in `state.rs`
with bump-refuses-old-checkpoints logic; five-stage loop +
`LoopOutcome`/`BrakeTelemetry`/`stop_evaluation` symbols in `loop_driver.rs`;
`membrane-seal` present in the ufo-cli command enum; digest path shape
`.ufo/rounds/<runId>/r<NN>-digest.json` located in source; fixture
`conformance/fixtures/native-handoff/handoff.json` exists and matches the
documented profile. Zero-width scan clean.

## Minor defects

- `loop-driver.md`: `BoundaryStop` cited at `loop_driver.rs:97`, actually
  `:319` (`rg -n 'enum BoundaryStop'`); usage bookkeeping cited `:347` (that is
  `struct LoopDriver`; `note_usage` is `:556`). Symbols correct, lines far off —
  cite with a re-check command, not memory.
- `knowledge/failure-telemetry.md` (round-1 file) still says `classify_failure`;
  round-4 corrected SKILL.md but not the knowledge entry — the superseded claim
  now contradicts the corrected one inside the same corpus.
- `README.md` has no row for `lessons/round-4.md` (`test -f` + `rg round-4
  corpus/README.md`). Index row is a claim — in both directions.
- `lessons/round-4.md` cites commit as "round-4" (`git rev-parse round-4`
  fails; actual `e0f5ca7`).

## Carried defect (round-1 audit defect 1) — PART-FIXED

- `knowledge/dispatch-shapes.md`: **fixed** — no `128`; `maxLanes` 100 cited
  from config.
- `lessons/round-1.md` lines 29–31: **persists** — the false "installed ufo
  skill caps swarm at 128 lanes" attribution still reads as truth
  (`grep -rn 128 corpus/`). Lessons are append-only history, so the conforming
  repair is a correction entry (a later lesson or README known-defects row)
  naming the file, the line, and the verified replacement — none exists yet.

## Gaps filed for next lane round

1. File the `128` correction entry against `lessons/round-1.md:29-31`.
2. Index `lessons/round-4.md` in README; align `failure-telemetry.md` symbol via
   correction entry; fix the two `loop-driver.md` line cites.
3. README known gaps unchanged (native_seats helpers, native-trial launch,
   fleet-dispatcher front half) — correctly carried.
