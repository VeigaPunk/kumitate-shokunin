VERDICT: `scripts/wave-census.mjs` reads the round-63 run-7 inline wave unmodified — it parses the `ufo-swarm-wave-dispatch-v1` `taskCall` the inline handoff consumes, prints per-role seats and per-`Report:`-trailer presence correctly (`CLEAN`, 40 seats, 10 attack, exit 0) — but it is wholly blind to `<wave>-results.json` (and to ready markers, dispatcher log and host transcripts), and two fail-open holes inside its own contract (a zero-seat envelope reads `CLEAN`; `counts.total` is never read) are the only changes it needs.

## Evidence

All commands and outputs are verbatim in `.ufo/waves/round-63/build/K63ExecWaveCensus/receipts.txt` (script sha256 `76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4`, HEAD `b38a2065ab8ac5b198f6569b9013d04411c3d40d`).

Round 61 (committed dispatch evidence, both waves):
```
$ node scripts/wave-census.mjs --root . --round 61          # EXIT=0
WAVE round=61 wave=w1 schema=ufo-swarm-wave-dispatch-v1 seats=32 attack=10 reports=32/32 roles: executor=9 scout=8 reviewer=5 critic=4 scribe=3 connector=1 mutation-tester=1 sentinel=1
WAVE round=61 wave=w2 schema=ufo-swarm-wave-dispatch-v1 seats=40 attack=40 reports=39/40 roles: reviewer=21 critic=19
ROUND round=61 waves=2 seats=72 attack=50 reports=71/72
WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)
```
Round 63 wave w1, live at 2026-10-25T21:03Z:
```
$ node scripts/wave-census.mjs --root . --round 63          # EXIT=0
WAVE round=63 wave=w1 schema=ufo-swarm-wave-dispatch-v1 seats=40 attack=10 reports=5/40 roles: executor=13 scribe=6 scout=5 reviewer=4 connector=3 critic=3 mutation-tester=3 revenger=1 sentinel=1 simplifier=1
ROUND round=63 waves=1 seats=40 attack=10 reports=5/40
WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)
```
Selftest: `WAVE_CENSUS_SELFTEST: 32/32 pass` / `VERDICT: PASS`, EXIT=0. `--expect 61/w1:attack=10 --expect 61/w1:executor=9` → CLEAN EXIT=0; `--expect 61/w1:reviewer=6` → `FINDING EXPECT_MISMATCH round=61 wave=w1 61/w1:reviewer=6 payload=5`, EXIT=1.

The new gate on the same bytes, for contrast:
```
$ node scripts/inline-dispatch-evidence.mjs --root . --round 63 --wave w1                 # EXIT=2
INLINE_DISPATCH: FAIL-CLOSED results-unreadable path=.ufo/waves/round-63/w1-results.json
$ node scripts/inline-dispatch-evidence.mjs --root . --round 63 --wave w1 --rev b38a2065ab8ac5b198f6569b9013d04411c3d40d  # EXIT=2
INLINE_DISPATCH: FAIL-CLOSED wave-absent ready=false dispatched=false wave=.ufo/waves/round-63/w1
```
`w1-dispatch.json` parses as `schema=ufo-swarm-wave-dispatch-v1`, `counts={"spawn":40,"resume":0,"total":40}`, `taskCall.context` 4002 bytes, 40 unique task names, 0 of 40 trailers off the canonical `.ufo/waves/round-63/w1/<Seat>.md` path.

## Answers

**1. Does it accept the validator's v1 `taskCall` shape the inline handoff consumes?** Yes, unmodified. `wave-census.mjs:172-175` takes `d.taskCall.tasks` when `schema === 'ufo-swarm-wave-dispatch-v1'`, and the envelope's extra keys (`policy`, `compaction`, `note`, `registry`) are ignored. It also enforces `counts.spawn`/`counts.resume` (`:200`) and registry-name equality (`:204-215`) on the real round-63 payload: both hold, so no `COUNT_MISMATCH`/`REGISTRY_MISMATCH`. No change is needed to parse a run-7 inline dispatch.

**2. What does it report for seats-per-role and for reports at each `Report:` path?** Round 63 w1: `executor=13 scribe=6 scout=5 reviewer=4 connector=3 critic=3 mutation-tester=3 revenger=1 sentinel=1 simplifier=1`, `attack=10`, `reports=5/40` with the 35 absent names listed. Against the frozen plan's shape claims: executor+scribe+simplifier = 20/40 = 50% (plan: >= 50%), attack roles = 10/40 = 25% (plan: >= 25%), 40 seats inside the 32-64 band — all exactly at the declared floors, which the census confirms arithmetically. Report presence is resolved from the line-anchored final `Report:` trailer (`:57`, `:179`), not from the seat name; for round 63 all 40 trailers name `.ufo/waves/round-63/w1/<Seat>.md`, so census and gate agree on this wave.

**3. Does it need changes for the inline results file?** For its own contract, no — and it must not grow one: results/ready/log/transcript reading is `inline-dispatch-evidence.mjs`'s contract (I63) and duplicating it would fork the gate. For operability, the census is the only instrument that can read a run-7 wave *while it runs* (the gate fails closed `RESULTS_UNREADABLE` until `w1-results.json` exists, and `WAVE_ABSENT` under `--rev` until ready/dispatched are committed). The gap is total blindness, measured in finding -2.

## Gaps vs `scripts/inline-dispatch-evidence.mjs`

| record | inline gate | wave-census |
|---|---|---|
| `<wave>-dispatch.json` | `taskCall.tasks` non-empty **and** `typeof tc.context === 'string'` (`:170`) | tasks only; context unchecked (finding -5) |
| `<wave>.ready`, `<wave>.ready.dispatched` | required, `READY_MISMATCH` (`:158-160,175-178`) | not read |
| `<wave>-results.json` | required; `RESULTS_MISMATCH` on seats/rows/round/wave/name-agent/extra (`:165-166,182-185`) | **not read at all** (-2) |
| dispatcher log | `SPAWN_LOG_*`, `DONE_LOG_*` (`:189-198`) | not read |
| host transcripts | `SESSION_*`, `PARENT_MISMATCH`, `NOT_A_DISPATCH`, dead seats (`:203-234`) | not read |
| report path | hardcoded `${base}/${wave}/${name}.md` (`:241`) | from the `Report:` trailer (`:57,179`) |
| report floor / dupes | `>= 64` bytes, sha256 dup (`:43,244,246-247`) | `size > 0` (`:193`), no dup check (-3) |
| committed bytes | `--rev` → `git show REV:path` (`:77-90`) | worktree only; `--rev` is usage exit 64 (-9) |
| dead seats | named, `DEAD_UNNAMED` (`:251-256`) | none |
| role vocabulary | n/a | `KNOWN_ROLES` admits `planner`/`distiller`, `ATTACK` admits `labrat` (`:55-56`) — round 63's validator refuses all three (-8) |

## Findings

**K63ExecWaveCensus-1 — medium, fail-open inside its own contract.** A v1 envelope with `taskCall: null` and `resumeSends: []` prints `seats=0 … WAVE_CENSUS: CLEAN` exit 0; the inline gate fails closed (`DISPATCH_UNREADABLE`, `:170`, `tasks.length === 0`) on the same bytes. Attack: a do-nothing lane commits an empty dispatch and the census certifies it. Reproduce: copy `.ufo/waves/round-63/w1-dispatch.json` into `<scratch>/.ufo/waves/round-63/`, set `taskCall=null`, `resumeSends=[]`, `counts={spawn:0,resume:0,total:0}`, `registry.members={}`, then `node scripts/wave-census.mjs --root <scratch> --round 63` → `WAVE_CENSUS: CLEAN`, EXIT=0 (built fixture: `/tmp/kumitate-r63/K63ExecWaveCensus/fix/Z1`).

**K63ExecWaveCensus-2 — medium, results blindness.** A `w1-results.json` with `seats: 99`, one seat renamed to `TOTALLY-FORGED-SEAT` and one extra `EXTRA-GHOST` row leaves the census at `CLEAN` EXIT=0 (fixture `fix/B`; the round-dir glob is `/-dispatch\.json$/`, `:145`). Attack: the record I2 binds is invisible to the census, so a lane that fabricates only the results file is uncensused.

**K63ExecWaveCensus-3 — low-medium, report floor and duplicate divergence.** A 1-byte report counts present (`reports=1/40`, fixture `fix/C`) where the gate says `REPORT_TINY` (<64 bytes); two seats with byte-identical report bodies count `2/40` present (fixture `fix/I`) where the gate says `REPORT_DUP`. Reproduce with `--root …/fix/C` and `--root …/fix/I`, both EXIT=0.

**K63ExecWaveCensus-4 — low, unchecked envelope field.** `counts.total` is named in the header (`:30`) and never read: `total: 999` on the real round-63 payload reads `CLEAN` EXIT=0 (fixture `fix/Z2`). `total == spawn + resume` holds in all 334 committed v1 dispatch files across the fleet (measured with a python glob over `*/.ufo/waves/round-*/*-dispatch.json`, 0 violations), so the check is safe to add.

**K63ExecWaveCensus-5 — low, dispatch the gate refuses reads clean.** Deleting `taskCall.context` yields `CLEAN` EXIT=0 (fixture `fix/Z5`); the inline handoff consumes `context` and the gate fails closed without it. Reproduce as above with `--root …/fix/Z5`.

**K63ExecWaveCensus-6 — low, filename/`wave` field not compared.** Setting `"wave": "kumitate-r62-w9"` inside `w1-dispatch.json` reads `CLEAN` EXIT=0 (fixture `fix/Z6`); the wave name is taken from the filename only (`:153`).

**K63ExecWaveCensus-7 — low, registry roles unchecked.** Setting every `registry.members[*].role` to `critic` reads `CLEAN` EXIT=0 (fixture `fix/Z3`); only member *names* are compared (`:204-215`), so a registry that mislabels every seat passes.

**K63ExecWaveCensus-8 — low, vacuous `--expect` on refused roles.** `--expect 63/w1:distiller=0`, `…:planner=0`, `…:labrat=0` each EXIT=0, although the round-63 validator refuses `planner`/`labrat`/`distiller` (`plan.md` "Round shape") and no such seat can exist; `WC25` asserts this as intended behavior.

**K63ExecWaveCensus-9 — info, no committed-bytes mode.** `--rev b38a2065ab8ac5b198f6569b9013d04411c3d40d` → `wave-census: unknown argument: --rev`, EXIT=64, so the census cannot re-derive a wave at a revision the way I2's gate arm does. Related: a trailer pointing at `.ufo/waves/round-62/w1/<Seat>.md` is counted present for round 63 (fixture `fix/Z7`, `reports=1/40`, EXIT=0) — cross-round attribution is not flagged.

**K63ExecWaveCensus-10 — operability note for the L1.** Any non-seat `.md` dropped into `.ufo/waves/round-63/w1/` turns the census `DRIFT` (`STRAY_REPORT`, EXIT=1; fixture `fix/E`). Round-61's dirs comply (only `swarm-registry.json`, `dispatch-actual.json`, `launcher-progress.tsv` beside the reports); keep round-63's wave dir seat-named only, or the census reports drift that is not one.

## Patch proposal (not applied)

`build/K63ExecWaveCensus/wave-census-tighten.patch` — two hunks only, for findings -1 (zero-seat envelope → fail-closed) and -4 (`counts.total` added to `COUNT_MISMATCH`), with the selftest/regex impact noted. Findings -2/-3/-5…-9 are scope boundaries or gate-owned records; deliberately not patched. Nothing under `scripts/` was edited.

## Artifacts

- `.ufo/waves/round-63/w1/K63ExecWaveCensus.md` (this report)
- `.ufo/waves/round-63/build/K63ExecWaveCensus/receipts.txt` (143 lines, every command + verdict + exit code)
- `.ufo/waves/round-63/build/K63ExecWaveCensus/census63-live.json` (`--json` output of the live round-63 census)
- `.ufo/waves/round-63/build/K63ExecWaveCensus/wave-census-tighten.patch` (draft, unapplied)
- scratch fixtures `/tmp/kumitate-r63/K63ExecWaveCensus/fix/{A,B,C,D,E,I,Z1..Z7}` (rebuildable; only `-dispatch.json`/report bytes, no git fixtures)

## Limits

- Live round-63 numbers move as seats land (`reports=5/40` at 21:03Z, `3/40` at 20:58Z); the seat counts, roles and attack totals are stable.
- Round-63 w2 does not exist yet, so the two-wave inline case is measured on round 61 only.
- I did not run `inline-dispatch-evidence.mjs --selftest` or its 14 committed controls (another seat owns the gate); the gate is cited from its code and from two fail-closed runs.
- I did not test the census caps (`MAX_DISPATCH_BYTES`, `MAX_SEATS_*`, entry limits) or symlink/FIFO confinement — the selftest covers them (WC27-WC32 pass) and I did not re-derive them.
- The census's `STRAY_REPORT` scan of report dirs was exercised on a fixture only; round-61's `reports=71/72` was cross-checked by counting the dirs (32 `.md` in `w1`, 39 in `w2`), not by opening each report.
- No tool was installed or upgraded this seat.
