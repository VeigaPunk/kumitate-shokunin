# kumitate — round 44 report

Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, branch `master`. Open `6cda8c35`, pushed tip `37e8f66973c54854bea305c842d806e497c64666`
(`jj-lane.sh state` → `local=remote=37e8f669… ahead=0 behind=0 tracked=0 untracked=0`). L1 `KumitateR44` held the §3
planner seat (the validator rejects `planner`). Dispatched 01:03Z, closed 02:02Z.

## Work performed

Declared claim (one): **C1 operability — capability `omp-census`**, a new lane gate over the OMP agent root
`~/.omp/agent` (shape only: names, kinds, permission bits), counted by predicate P44 with the frozen counter
`probe/p44d-count.mjs`. Anti-loop: rounds 42–43 failed on `gate-mutants`; this round works different ground
(PROVINCE frontier "OMP harness contract").
**Author's verdict: C1 does not verify** — post-data skip-work controls read MET under the frozen counter
(kill rule 2). Details below; the closure rules.

- Plan, predicate and counter frozen before any seat: `361d4492` (`.ufo/waves/round-44/plan.md`, `probe/p44-count.mjs`,
  `probe/p44-shape.tsv`, do-nothing receipt).
- Pre-data redesign 1 (L1 found fixed stray labels a census could key on): `292d9266`, `p44b-count.mjs`.
- Control wave (39 seats) scored 26 control programs: CtlLabelKeyedA and CtlLabelKeyedB read MET under p44b
  (`.ufo/waves/round-44/controls/CtlLabelKeyedA.md:1`, `CtlLabelKeyedB.md:1`) → redesign 2 `28e29bbe` (`p44c`, 150 cases),
  27 controls re-scored UNMET (`controls-v3/`).
- Residual call (8 seats) against p44c: CritV3LabelB (`residual/CritV3LabelB.md`) and CritV3Boundary
  (`residual/CritV3Boundary.md:1`) read MET → redesign 3 `32b7fd56` (`p44d`, 207 cases; `casePasses` text unchanged in all
  four versions), 44 controls UNMET (`controls-v4/`). Q29 check over round 44: `Q29: PASS (grep printed nothing)`.
- Census built (seat ExecCensusBuild, `controls/ExecCensusBuild.md`), integrated by the L1 with source ids and an `extensions/`
  member (S060): `scripts/omp-census.mjs` sha256 `fd4d1c4e…`, `--selftest` 29 cases PASS, live root
  `OMP_CENSUS: CLEAN (entries=38 findings=0)`; gate pin, SKILL checklist items 20–21, registry row — measured commit `d81978cd`.
- Counted run (first frozen-counter run on any census bytes): `final/p44-measured-d81978cd.txt` → `P44_COUNT: MET
  (passed=207 cases=207 …)` exit 0, seed `2676cbe7…` — commit `bde1086e`.
- Falsify wave (36 seats): replay identical (`falsify/ReRunP44Replay.md`), 6/6 fresh seeds and 6/6 under load MET, no gate harm
  (`falsify/ReviewNoHarmGates.md`), **CtlPostDataA: three skip-work controls MET 207/207** (`falsify/CtlPostDataA.md:1-15`:
  whole-shape hash catalogs of p44d's own CLEAN shapes; a one-edit name tolerance; `agents` → `qqdwgo` passes).
- Repairs first (round-43 closure R43-1..R43-6): capability row `gate-mutants` records the miss in rounds 42–43 (R43-4) and the
  shipped-tip receipt `GATE_MUTANTS: ERROR (… frozen=38/41 …)` exit 2 (R43-3, `controls/ExecR43ShippedReceipt.md`);
  `corpus/lessons/round-43.md` § Round-44 routed corrections (R43-2, R43-6); MutCiteWitness ran the owed mutants: 4/4 survive
  (R43-5, open); R43-1 not re-claimed (anti-loop). Round-43 report minors corrected here: its `## Landed changes` listed `b01ded32`
  twice and line 117 was a dangling sentence; its "four routes → A1" is wrong (A1 names two). Proxy `--strict` was DRIFT at round
  open (missing README row for the round-43 spot-check) and is MATCH now.
- QUALITY Q29 (skip-work controls scored and committed before data), shown able to fail on round 43 (`controls/ScribeQ29.md`).

## Landed changes

| commit | what | LOG.md |
|---|---|---|
| `361d4492` | plan, frozen P44 counter v1, shape, before receipt | round-44 entry |
| `292d9266` | pre-data redesign 1 (p44b) | round-44 entry |
| `28e29bbe` | pre-data redesign 2 (p44c), controls-v3 | round-44 entry |
| `32b7fd56` | pre-data redesign 3 (p44d), controls-v4, wave-1 + residual reports | round-44 entry |
| `d81978cd` | `scripts/omp-census.mjs`, proxy gate pin, SKILL items 20–21, SOURCES S053–S061, README row, R43 repairs (measured commit) | round-44 entry |
| `bde1086e` | counted-run receipt | round-44 entry |
| `8e822511` | knowledge entry `corpus/knowledge/omp-agent-root.md` | round-44 entry |
| `37e8f669` | close: falsify evidence, lesson `corpus/lessons/round-44.md`, LOG, SCORECARD, QUALITY Q29, source fixes | round-44 entry + close line |

## Before → after measurements

- **C1 (P44, counter p44d at `32b7fd56`):** before at `6cda8c35` (census absent) `P44_COUNT: UNMET (passed=0 cases=207 floor=20
  census_sha256=absent)` exit 1 (`open/p44d-before-6cda8c35.txt`; re-derived by ReRunBefore) → after at `d81978cd`
  `P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=fd4d1c4e…)` exit 0. Command (plan § Measurement):
  `git show 32b7fd56:.ufo/waves/round-44/probe/{p44d-count.mjs,p44-shape.tsv}`, `git show d81978cd:scripts/omp-census.mjs`,
  `node p44d-count.mjs --census omp-census.mjs --shape p44-shape.tsv --seed 2676cbe767adc1820fd316e02a7b9020`.
  **Not admissible as verified:** controls that skip the work reach the same value (`falsify/CtlPostDataA.md`), and the third
  redesign was preceded by a builder's non-frozen harness run on a candidate and a work-equivalent program scored under p44c
  (`falsify/CritRedesignTimeline.md`). The measured census also reads MET under p44/p44b/p44c
  (`final/p44-superseded-counters-d81978cd.txt`), but controls met each of those too.
- Terms (diagnostic, not claimed): `node scripts/proxy-check.mjs --strict` at round open `DRIFT (C2_TOTAL_DRIFT 96/97; AXES_DRIFT)`
  → at `37e8f669` `MATCH (A=16 C=21 operability=9; C2=99/99 coverage=10; …)`.

## Sources & frontier

Census command `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`: round start
`kumitate W04 S034 duplicate url …` / `kumitate ok …/corpus/SOURCES.md` exit 0; round end the same two lines, exit 0.
Rows 52 → 61 (`grep -c '^| S[0-9]' corpus/SOURCES.md`). Added: tier A code S053, S054, S055, S057, S060; tier A docs S056;
tier B own-work S058, S061; tier B docs S059 **rejected** (cmux docs; OMP's own code is the primary source for `extensions/`).
Touched old→new: S053–S061 `used-by` `scripts/omp-census.mjs` → `corpus/knowledge/omp-agent-root.md, corpus/lessons/round-44.md`;
S054 anchor 197-199 → 197-200; S057 anchor + SupportedClients.js. Frontier: the OMP harness band gains its first member-level
entry and gate (no PROVINCE band moved). Sourced claim: C1's census rules cite S053–S061. Mined mistake: `## Mistakes` in the
lesson (skip-work controls met the counter, r43 and r44; fix Q29). Gate rejects this round: S059 (Q2), the unsourced
`omp-crash.log` case (no writer at the tag).

## Trend verdicts

- **expansion — improved.** New ground: OMP agent root members, writers and chain families (S053–S061 opened; entry
  `corpus/knowledge/omp-agent-root.md`), re-opened by falsify seats (ReopenS054/S056/S057/S060/S061, defects fixed or recorded).
- **quality — unchanged.** The census works and no gate regressed (ReviewNoHarmGates), but the claimed capability did not verify;
  source rows needed in-round fixes.
- **discernment — improved.** Same-round rejects (S059, `omp-crash.log`), three pre-data counter replacements on control
  evidence, and the author records C1's failure under its own frozen kill rule rather than replacing the counter after data.

## SHONEN

- [ ] SKILL.md contains real decision tables, error patterns, checklists, cited sources
- [~] At least one end-to-end domain task executed and logged in LOG.md — `omp-census` live run, LOG round-44 entry (author-asserted)
- [ ] Instructions executable by an agent without oral context
- [~] No cross-domain bleed (PROVINCE.md still accurate) — no band moved; secrets shape-only (author-asserted)

## Gate

Real rejects with reasons: S059 cmux docs (vendor docs; primary OMP code exists — Q2); `src:omp-crash.log` case dropped (path
defined, no writer at v18.12.6). Plus the C1 claim itself fails kill rule 2.

## Round shape

Default two v1 waves + one residual call: wave 1 `controls` 39 seats (mutation-tester 11, critic 10, scout 6, sentinel 3,
executor 3, reviewer 2, scribe 2, connector 1, revenger 1); residual 8 (critic 6, reviewer 2); wave 2 `falsify` 36 (scout 10,
reviewer 8, critic 6, mutation-tester 6, sentinel 2, scribe 2, executor 1, connector 1). Round total 83. The validator's
`taskCall` was sent unchanged except the `solutionSpace` field the task tool requires. Wave 2's first send was refused
("Background job limit reached (100)") and resent unchanged after a seat settled. Dead/held: CritV3Channels, CritV3LabelA
(provider `cyber_policy` refusal; holds). Cancelled at wrap-up (findings absent): SentinelReaper, and 18 wave-2 seats named in the
lesson § Verdict at close. Misroot sweep: `git -C /home/vgpnk/Projects/shokunin status --porcelain` lists 9 untracked fleet files;
none names kumitate or round 44 (grep) — no misroot.

## Open L0 questions

None new. Recorded for the operator: `pin.omp-census` adds a fifth key to the `kumitate-gate-pins-v1` block while L0 `9a00d09`
(round-42 D6) on that block is still open (ReviewProxyGatePins F1).

Stale-lane: respawn-per-round driver; no other mission of this lane is open. Tool installs: none (bwrap, prlimit, node present).
