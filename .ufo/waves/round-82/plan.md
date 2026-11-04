# Round 82 — plan (frozen before any data seat)

Lane: kumitate. Round: 82. Attempt 1. Fleet host: Linux run-15 host.
Base revision: `0c23c4fca408591341f22bad58660ac81e1ec5ff` (the round-81 verifier spot-check, the
lane's remote tip). Report: `.ufo/reports/round-82/kumitate.md` (fleet repo).

Prompt binding: `/home/vgpnk/Projects/shokunin/.ufo/prompts/kumitate-round-82.md`; campaign addendum
§6 run-15 block (one v1 wave, band 8–16, ≥25 % attack seats, at most 2 connector seats, no planner
seat, never pass `model`). Lane axes: operability + coverage (orchestration & tooling).

## Claims (2) — frozen predicates

Each claim is one axis-move on a distinct axis. Predicates are the same sentence here, in the frozen
counter's code, and in the close receipt's label. Kill rule K82 applies to both: a claim is **killed**
if its frozen counter reads `HELD` on a tree where the named work is absent (the base tree or the
constant-answer stub), or if a counter arm is changed after any data seat has scored.

### C1 — operability (the lane's lowest non-retired axis, integer 9 terminal; capability deepening)

**Claim.** `scripts/ready-handoff.mjs` becomes `kumitate-ready-handoff-v2`: the handoff it judges is
bound to the dispatch it names and to the campaign policy's own numbers, not to constants in the
tool. Seven new judgments: (a) the dispatch basename must be `<wave>-dispatch.json` (`WAVE_BINDING`);
(b) a `wave` field inside the dispatch payload must agree with `ready.wave` (`DISPATCH_WAVE`);
(c) two seats may not resolve to one report destination (`REPORT_DEST_DUPLICATE`); (d) `ready.l1`
must not collide with a seat name (`L1_SEAT_COLLISION`); (e) with `--agents FILE`, `ready.l1` must
resolve in the named agent registry (`L1_UNRESOLVED`; `AGENTS_ABSENT`/`AGENTS_MALFORMED` fail
closed); (f) the seat band and the seat-role vocabulary are read from `--policy FILE`
(`POLICY_ABSENT`/`POLICY_MALFORMED` fail closed), so the lane's `8:16` and its `labrat`/`distiller`
admissions stop duplicating the campaign's authority; (g) the dispatch-symlink escape that survived
round 81's mutation battery is an explicit arm.

**Predicate (C82_C1).**
`node .ufo/waves/round-82/probe/probe82-c1.mjs --set c1 --lane .` → `C82_C1: HELD held=22/22`, exit 0
at the measured revision M. At the base tree the same command reads `held=0/22` (the tool is absent);
the constant-`READY` stub reads `held=6/22`.

### C2 — coverage:omp (integer 10 held; the OMP-plane evidence surface gains the receipt's age)

**Claim.** `scripts/omp-census.mjs --compare` stops pretending the receipt it diffs is timeless: it
discloses the receipt's capture instant and age on its own verdict line, accepts an opt-in
`--max-age DAYS` staleness gate (`SHAPE_STALE_RECEIPT`, exit 1), and fails closed
(`SHAPE_AGE_UNKNOWN`, exit 2) when a caller gates the age of a legacy v1 receipt that carries none.
The age never scores: `coverage:omp` stays 10 on a 45-day receipt.

**Predicate (C82_C2).**
`node .ufo/waves/round-82/probe/probe82-c2.mjs --set c2 --lane .` → `C82_C2: HELD held=13/13`, exit 0
at the measured revision M. At the base tree the same command reads `held=6/13` (round 81's compare
already holds the five plain-diff arms and `--shape --max-age`; the seven new arms — the two age
disclosures, the two compare gates, both legacy-age refusals and the suite floor — do not); the
constant-`IN_SYNC` stub reads `held<=5/13`.

## Controls (pre-data, committed with this plan)

- `controls/c1-base.txt`, `controls/c2-base.txt` — both counters over `git archive` of the base
  revision.
- `controls/c1-stub.txt`, `controls/c2-stub.txt` — both counters over a constant-answer stub
  (`READY_HANDOFF: READY …` / `OMP_SHAPE_COMPARE: IN_SYNC …`).
- `open/` — base-revision receipts: proxy (`C2_DRIFT 202→203` at open, the adopted spot-check row),
  checklists `39/41` (both reds caused by that same stanza drift; verified by re-running the r79
  probe: `held=9/11`, the two failing arms are the live-MATCH ones), claims MATCH, anchor CLEAN,
  census CLEAN 65/0, kimi CLEAN 55/55, spotcheck/map CLEAN after the open repair.

## Round shape

ONE v1 wave (`w1`) of 14 seats under `/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`
(band 8–16), attack 5/14 = 36 % (reviewer ×2, critic, mutation-tester, sentinel), connector 1,
executor 3, scribe 2, scout 2, revenger 1. The canonical planner seat is held by the L1 (the
validator refuses `planner` as a swarm role). Residual: none planned. Round total: 14 seats.
Scratch root: `/fast/scratch/hyaku/kumitate-r82/<seat>/` (`HYAKU_SCRATCH`).

## Work order

1. Open repairs BEFORE the freeze: adopt `corpus/lessons/round-81-verifier-spotcheck.md` (the 11th
   spotcheck-coverage recurrence) — `SPOTCHECK_COVERAGE: CLEAN spotchecks=48 uncovered=0`,
   `README_MAP: CLEAN files=203 rows=203 covered=203`.
2. Freeze: this plan, both counters, the four controls, the open receipts.
3. Scaffolding: `ready-handoff` v2 + its suite, `omp-census` compare age + its suite, pins, stanza,
   SKILL rows/checklist items, two sourced knowledge entries + their captures, SOURCES rows.
4. Wave: spec + validator run + dispatch + `w1.ready` (handoff), one batched spawn handoff, wait.
5. Close: both counters at M, receipts, SCORECARD section + stanza, LOG entry, lesson
   (`## Gate`, `## Mistakes`), routed-defect answers R81-1…R81-8, report, lane commit + push,
   report commit.

## Frontier step (inside the claim cap)

- `corpus/SOURCES.md`: new rows opened this round (Kubernetes *Validating Admission Policy* for the
  single-declaration rule; one considered-and-rejected candidate so the outside check has a reject to
  sample — R81-6). Census start: `sources-census.sh validate --root … kumitate` → exit 0, six carried
  W04.
- Lesson `corpus/lessons/round-82.md`: `## Gate` (URLs, access date, ≤25-word located quotes),
  `## Mistakes`.
- `considerthese/2026-10-26.md` proposal 3 (new tools must be registered in the same round) lands as
  one `QUALITY.md` criterion citing the file + date.
- Assimilation: `none` this round (the round's two claims are discipline claims; the staged package
  needs its own id-collision + quarantine pass), stated in the report.

## Routed defects answered (from `round-81-verifier-spotcheck.md`)

R81-1 receipts must stamp the revision they measured; R81-2 cite the receipt that carries the
reading; R81-3 registry pin refresh; R81-4 knowledge `verified-at` tallies refreshed; R81-5 quote a
committed record; R81-6 a rejected candidate this round; R81-7 the refusal count with its command
(there are **eight** `Refusal` tokens, not six); R81-8 the round-81 lesson's open map reading
(199/199/199) as an append-only erratum.

## Limits declared before data

- The gate stays advisory until the dispatcher calls it; this round records the gate as lane-side
  admission (candidate 1's second arm) and does not claim enforcement.
- `--agents` liveness is a caller-supplied registry read: no lane instrument may read the content of
  `~/.omp/agent` (PROVINCE: readdir + lstat only), so liveness is an explicit live read or unchecked
  (`agents=none` disclosed).
- The attack share and the connector cap stay lane-owned constants (the campaign policy carries no
  machine-readable field for them); the band and the role vocabulary are policy-derived.

## Amendment 1 (append-only, before any data seat scored; corrections to the frozen text above)

- **A1.1** `--band` is gone from the tool: the seat band and the seat-role vocabulary are read from
  `--policy` (the plan's C1(f)). `--attack-pct` stays (lane-owned).
- **A1.2** The round-81 disclosure that "a symlink placed inside the wave dir and resolving outside
  passes the lexical `inside()` check" is **refuted by measurement**: `lstatSync(dispatch).isFile()`
  refuses the symlink before the lexical check runs, and the tool answers `FAIL-CLOSED
  DISPATCH_ABSENT ("dispatch is not a regular file")`. Arm 18 therefore asserts the refusal that
  actually fires and is renamed `dispatch-symlink-refused`; the count stays 22. The realpath arm stays
  as defence in depth and stays unreachable behind the lstat guard — disclosed, not claimed.
- **A1.3** `readJson` gains a distinct malformed token: v1 conflated "cannot read" and "not JSON" under
  one token, so `AGENTS_MALFORMED`/`POLICY_MALFORMED` were unreachable. The frozen arms 10/11/12/13
  assert the four distinct tokens.
- **A1.4** Measured controls: `C82_C1` base `0/22`, stub `6/22`; `C82_C2` base `6/13`, stub `4/13`.
- **A1.5** The frozen counters changed before data in two disclosed places only: the arm-18 rename
  (A1.2) and `probe82-c2`'s score arm, which ages the lane's own pinned receipt instead of a synthetic
  one (a synthetic receipt's names are census findings, so it could not isolate "the age never
  scores"). The measured base value 6/13 is stated in the claim above.
