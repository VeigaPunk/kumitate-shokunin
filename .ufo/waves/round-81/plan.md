# kumitate round 81 — frozen plan (L1, 2026-11-04)

Round of the run-15 hyaku block (ONE v1 wave, 8–16 seats, policy `ufo-wave-policy.json`).
Base tip: `77c7a8b3fe7f3cebe681065da283de0ae38ddb5b` (round-80 verifier spot-check, the lane's remote tip).
Axes: **operability 9** (terminal integer; the lowest live axis) + **coverage:omp 10**.

Both live axes sit at or above the lane's saturation line (9), so the round is a
frontier/capability move per `AXES.md` §The stagnation nudge: C1 acquires a new capability
(`ready-handoff`), C2 deepens the OMP shape receipt into a self-describing one.

Frozen before any data seat: this file, the two counters (`probe/probe81-c1.mjs`,
`probe/probe81-c2.mjs`), the open receipts (`open/`) and the pre-data controls (`controls/`).
A post-freeze defect is answered with a named erratum in the round lesson, never a silent edit.

## Open state (measured, `.ufo/waves/round-81/open/`)

- `node scripts/proxy-check.mjs` at the base tree → `PROXY: DRIFT (C2_TOTAL_DRIFT
  declared=198 computed=199)` exit 1 (`open/proxy-open.txt`): the r80 closure landed
  `corpus/lessons/round-80-verifier-spotcheck.md` after the lane closed — **the 10th
  spotcheck-coverage recurrence**.
- `node scripts/spotcheck-adopt.mjs --check` at the base tree → `SPOTCHECK_COVERAGE: DRIFT
  spotchecks=47 uncovered=1 first=corpus/lessons/round-80-verifier-spotcheck.md` exit 1
  (`open/spotcheck-open.txt`), and `--adopt` of that file → `ADOPTED … wrote=both` +
  `README_MAP: CLEAN files=199 rows=199 covered=199` exit 0 (`open/spotcheck-adopt.txt`,
  capturing the repair transcript the r80 spot-check routed as R80-11).
- `node scripts/omp-census.mjs` → `OMP_CENSUS: CLEAN (entries=65 findings=0 bound=35/35)`
  exit 0; `--compare .ufo/pins/omp-shape.json` → `IN_SYNC` (`open/census-open.txt`).
- `node scripts/kimi-census.mjs` → CLEAN 55/55; sources census exit 0 (six carried W04)
  (`open/kimi-census.txt`, `open/sources-census.txt`).

## C1 — operability: capability acquisition `ready-handoff`

**Claim sentence (frozen).** At M, `node .ufo/waves/round-81/probe/probe81-c1.mjs --set c1`
prints `C81_C1: HELD held=16/16` and exits 0; at the base tree (`--tool <base archive>`) the
same counter prints a held count below 16 and exits 1.

**Why it is a move, not a refactor.** Every round of this campaign dispatches through the
run-7 inline handoff: the L1 writes `<wave>.ready` (JSON `{lane, round, wave, dispatch, l1}`),
the orchestrator polls for it, takes it within ~15 s and spawns the dispatch payload. Nothing
gated that file: a wrong lane/round/wave, a relative or escaping dispatch path, a missing
payload, a duplicate seat, a frozen-topology `planner`, a per-seat `model` key, a wave outside
the 8–16 band, an attack share under 25 %, three connectors, a missing `/skill:godspeed`
lead, or a seat text without the lane's absolute root all reached the orchestrator as a
handoff it would take. The rules exist as prose in the round prompt; this claim turns them
into one executable admission gate in the lane's own province (OMP task dispatch).

**After-state (one value the closure re-derives with one command).** `C81_C1: HELD held=16/16`
at M; the round's own committed handoff reads
`READY_HANDOFF: READY wave=w1 seats=<n> attack=<k>/<n> connector=1 …` exit 0.

**Counter arms (frozen, `.ufo/waves/round-81/probe/probe81-c1.mjs`).** 16 arms:
(1) `clean-fixture-ready`; (2) `round-81-live-ready` — **discriminating**: this round's own
`.ready` + dispatch read READY; (3) `band-below` (7 seats → `BAND`); (4) `band-above` (17 →
`BAND`); (5) `attack-share` (2/10 → `ATTACK_SHARE`); (6) `connector-cap` (3 → `CONNECTOR_COUNT`);
(7) `planner-refused` (`PLANNER_SEAT`); (8) `model-key-refused` (`ARTIFACT_KEYS`);
(9) `godspeed-required` (`GODSPEED`); (10) `task-lane-root` (`TASK_LANE_ROOT`);
(11) `relative-wave-path` (`RELATIVE_WAVE_PATH`); (12) `ready-keys` (`READY_KEYS`);
(13) `dispatch-escape` (fail-closed `DISPATCH_OUTSIDE`, exit 2); (14) `dispatch-absent`
(fail-closed `DISPATCH_ABSENT`, exit 2); (15) `usage-64`; (16) `selftest` (30/30).

**Kill rule.** Arm 2 is the one a do-nothing control cannot reach: the base tree has no
`scripts/ready-handoff.mjs`, so every arm that spawns the tool fails; a constant printer
(`READY_HANDOFF: READY …` regardless of input) passes arm 1 and fails 3–14 and 16.

## C2 — coverage:omp: the shape receipt becomes self-describing

**Claim sentence (frozen).** At M, `node .ufo/waves/round-81/probe/probe81-c2.mjs --set c2`
prints `C81_C2: HELD held=15/15` and exits 0; at the base tree (`--tool <base archive>`) the
same counter prints a held count below 15 and exits 1.

**Why it is a move.** Round 80 bound the O terms to a committed receipt and disclosed
`source=snapshot`; the receipt itself still carried no capture instant, so a closure reading
it months later could not tell whether the live root had moved since (`corpus/lessons/
round-80.md` §Limits: "The receipt carries no age field (round-81 candidate 5)"). C2 versions
the receipt to `kumitate-omp-shape-v2` (`captured_at` beside `entries`), makes `--shape`
disclose `captured=<date> age_days=<n>`, adds an opt-in `--max-age DAYS` staleness gate
(`SHAPE_STALE`, exit 1) and refuses a future capture instant (`SHAPE_CLOCK`) and a v2 document
without one (`SHAPE_INVALID`). The O score never reacts to the age: C2 is a coverage-evidence
move, not a re-score.

**After-state (one value the closure re-derives with one command).** `C81_C2: HELD held=15/15`
at M; the committed receipt reads `contract=kumitate-omp-shape-v2` with a `captured_at`, and
`--shape` prints `captured=<date> age_days=<n>`.

**Counter arms (frozen, `.ufo/waves/round-81/probe/probe81-c2.mjs`).** 15 arms:
(1) `snapshot-v2` (contract + `captured_at`, exact key set); (2) `shape-age-disclosed`
(`age_days=0`, **discriminating**); (3) `shape-v1-refused` (`SHAPE_VERSION want=…v2 got=…v1`);
(4) `compare-v1-accepted` (the report-only surface still reads a legacy receipt);
(5) `shape-age-backdated` (45 days → `age_days=45`); (6) `max-age-stale` (`SHAPE_STALE
age_days=45 max_age=30`, exit 1); (7) `max-age-pass` (window 60 → exit 0); (8)
`clock-future-refused` (`SHAPE_CLOCK`, exit 2); (9) `captured-at-required` (`SHAPE_INVALID`);
(10) `compare-v2` (`IN_SYNC`, content-free); (11) `stale-does-not-score` — **discriminating**:
the proxy on a 45-day-old receipt still reads `verdict=MATCH coverage_omp=10`; (12)
`proxy-terms-unchanged` (no `O_age`/`O_captured`/`O_stale` term is injected into the score
surface); (13) `receipt-pinned` (`pin.omp-shape` = sha256 of the committed receipt);
(14) `selftest` (97 cases); (15) `usage-max-age` (64).

**Kill rule.** Arm 11 is the no-harm pin: a control that lets age score reads below 10 and
fails it. The base tree accepts v1 and has no `captured_at`, so arms 1, 2, 3, 5–8, 10–13 fail
there; the constant printer passes at most arm 2 and fails the rest.

## Pre-data controls (committed receipts under `controls/`)

- `c1-base.txt`, `c2-base.txt`: the counters against a `git archive` of the base tip.
- `c1-stub.txt`, `c2-stub.txt`: the counters against constant printers
  (`controls/stub/` describes the stub bytes; the stub is generated inside the probe's work
  dir, never committed as a runnable).

## Routed repairs this round (not claims)

R80-1 … R80-12 (record defects from `corpus/lessons/round-80-verifier-spotcheck.md`) and the
10th spotcheck recurrence: adopted in the open receipts above; the rest are answered in the
round lesson (`## Routed-defect answers`) and in-place where the file is not an append-only
round record.

## Wave shape

ONE v1 wave, 12–14 seats: ≥25 % attack (reviewer, critic, mutation-tester, sentinel), one
connector, executors and scribes for the two instruments' fixtures/entries, scouts for the two
surfaces. The canonical planner seat is held by the L1 (the validator rejects `planner`).

## Amendment 1 (2026-11-04; append-only; written before any verdict)

Disclosed after the first frozen-counter runs, before any claim verdict:

1. **C1 counter fixture (arm 01).** The probe's clean fixture context did not
   carry the `Report:` resolution sentence the tool (correctly) requires since
   the trailer rule moved from the task text to the context; arm 01 read
   `DRIFT REPORT_TRAILER` against a legal handoff. The fixture context now
   carries the sentence. No arm name, expected value or tool rule changed.
2. **C2 counter fixtures (arms 01, 02, 04, 05, 06, 07, 10).** `materialise()`
   did not restore the receipt's permission bits, so every materialised root
   read `changed=<n>` under `--compare`; the fixture now chmods each entry to
   the recorded mode. No arm expectation changed.
3. **C2 counter proxy arms (11, 12).** The probe invoked the proxy with
   `--lane`, which the proxy does not accept (exit 64); it now uses `--self`.
   No expectation changed.
4. **C2 counter selftest arm (14).** The arm passed a `--work` directory that
   did not exist; it now creates it first.
5. **Tool defect found by arm 06:** `omp-census.mjs` `main()` called
   `runShape(parsed.shape, io, note)` without `parsed.maxAge`, so the CLI
   `--max-age` gate never fired (the selftest had called `runShape` directly).
   Fixed in `main()`. This is what the frozen arm is for; recorded under the
   round lesson `## Mistakes`.
6. **Tool count:** `ready-handoff.mjs --selftest` is 31/31 (the plan's §C1 arm
   16 text says 30/30 — the extra case is `lane-id-accepted`, added when the
   lane-id rule was fixed).

## Amendment 2 (2026-11-04; append-only; written before any verdict)

The pre-data controls committed at the freeze were measured with the pre-Amendment-1 probe fixtures.
Amendment 1 changed fixtures/args, not arms, so the controls were re-run with the committed counter
bytes and the receipts under `controls/` are the re-measured readings:

| control | freeze-time reading | committed reading (Amendment 2) |
|---|---|---|
| C1 base (`--tool <base archive>`) | 0/16 | 0/16 (`controls/c1-base.txt`) |
| C1 constant printer | 3/16 | 3/16 (`controls/c1-stub.txt`) |
| C2 base | 1/15 | **4/15** (`controls/c2-base.txt`) — arms 04, 09, 13, 14 pass at base |
| C2 constant printer | 5/15 | **6/15** (`controls/c2-stub.txt`) |

Why the C2 base moved: arm 13 (`receipt-pinned`) reads the lane's receipt and stanza, not `--tool`;
arm 04 (`compare-v1-accepted`) and arm 09 (`captured-at-required`) hold at a base tree that accepts
only v1; arm 14 (selftest) passes at base. The claim sentence ("a held count below 15 at the base
tree") is unchanged and still holds at 4/15; the kill rule's per-arm list in §C2 is superseded by this
table. The plan's "`controls/stub/` describes the stub bytes" is void: the stub is generated inside
the probe's work dir and only its output is committed.

## Amendment 3 (2026-11-04; append-only; written before any verdict)

The wave's fixture seat (`w1/K81ExecC1Fixtures.md` §"Fixtures the gate gets wrong") found two real
defects in `ready-handoff.mjs`, both fixed after the frozen counter had been scored 16/16 with the
earlier bytes and re-scored 16/16 with the fixed bytes:

1. **Case-variant duplicate seats were accepted** (`K81S01` vs `k81s01`): the dedupe Set was
   case-sensitive. Fixed to dedupe on the lowercased name; new selftest case
   `duplicate-case-variant`.
2. **The ready file itself was followed through a symlink out of the lane**: `readFileSync` had no
   `lstat`/realpath containment for the ready path, while the dispatch it names had both. Fixed:
   a non-regular ready path, an escaping realpath or an unresolvable path is fail-closed
   `READY_UNSAFE`; new selftest cases `ready-symlink-escape` and `ready-symlink-inside`.
3. The suite grows 31 → 34 cases; `pin.ready-handoff` re-pins. The frozen arms are unchanged and
   still read `C81_C1: HELD held=16/16`. The seat's third finding (seat text may name an absolute
   path outside the lane, F11) is a limit, not a defect: the handoff is not a sandbox.
