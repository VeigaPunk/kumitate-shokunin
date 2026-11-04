# kumitate — round 82 report (DRAFT — not filed; fill [[…]] at close)

Lane: kumitate (operability + coverage — orchestration and tooling). Round 82, attempt 1.
Lane repo: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Base `0c23c4fca408591341f22bad58660ac81e1ec5ff`
(the round-81 verifier spot-check, the lane's remote tip). Freeze `97a630123a8980aa2dba4864998400ab5351dbe3`.
Scaffolding `63b12695ca3599d92c6d128353ca987daf64365b` (tools) and
`c4396021c31e5d631c3ec498b4fa81cef1b98b46` (wave payload + sources). Work revision M = [[M]].
Report filed at `.ufo/reports/round-82/kumitate.md`.

## Work performed

Round 82 declares **two claims on two axes**: **C1 operability** — the lane's lowest non-retired axis
(integer 9, terminal under `f_O`) — a capability deepening of `ready-handoff` to
`kumitate-ready-handoff-v2`; **C2 coverage:omp** (integer 10 held) — the OMP-plane evidence surface
gains the receipt's own age on the compare path.

- **C1 — the handoff gate binds what it judges.** `scripts/ready-handoff.mjs` now reads the seat band
  (`sighting.dispatch.swarm.waveMinLanes`/`waveMaxLanes`) and the seat-role vocabulary
  (`nativeProfiles.omp-native-v1.proposalRoles`) from `--policy` instead of restating them, refuses a
  dispatch whose basename is not `<wave>-dispatch` and a payload `wave` that is not this slot, refuses
  two seats that resolve to one `Report:` destination, refuses `ready.l1` equal to a seat name, and
  resolves `l1` against a caller-supplied `--agents` registry. Evidence: `scripts/ready-handoff.mjs`
  (suite 34 → 53 cases, `[[suite-receipt]]`), frozen counter `C82_C1 held=22/22`
  (`.ufo/waves/round-82/close/c1-probe.txt`).
- **C2 — the receipt carries its age on the compare path.** `scripts/omp-census.mjs --compare` prints
  `receipt_captured=<date> age_days=<n>`, gates an opt-in `--max-age DAYS`
  (`SHAPE_STALE_RECEIPT` exit 1) and refuses to guess a legacy v1 receipt's age
  (`SHAPE_AGE_UNKNOWN` exit 2); the age never enters the score. Evidence: `[[diff-anchor]]`, suite
  98 → 105 (`[[suite-receipt]]`), frozen counter `C82_C2 held=13/13`
  (`.ufo/waves/round-82/close/c2-probe.txt`).
- **Open repair before the freeze** (the round-82 planned candidate 4): the 11th spotcheck-coverage
  recurrence — `corpus/lessons/round-81-verifier-spotcheck.md` — is adopted in the freeze commit;
  `SPOTCHECK_COVERAGE: CLEAN spotchecks=48 uncovered=0` and `README_MAP: CLEAN files=203 rows=203
  covered=203` (`.ufo/waves/round-82/open/spotcheck-map.txt`).
- **Frontier step**: S238 (Kubernetes *Validating Admission Policy*, tier A, admitted, capture
  `ae87bdab…`) and S239 (Open Policy Agent docs, rejected with reason and flip) opened this round;
  two knowledge entries cite them (`[[entries]]`); the lesson carries the locate-and-count Gate.
- **considerthese**: `considerthese/2026-10-26.md` idea 1 ("every number has a transcript") mined into
  `QUALITY.md` **Q75** with the r81 R80-8/R81-4 evidence; idea 3 is already Q68 and is not re-mined.
- **Routed defects R81-1 … R81-8** answered in `corpus/lessons/round-82.md` §Routed-defect answers.
- **Wave**: one v1 wave, 14 seats (attack 4/14 = 29 % by the policy's four attack roles; sentinel is a
  fifth adversarial seat), connector 1; all seats [[settle-line]] (`w1-results.json`).

## Landed changes

[[LANDED-TABLE]]

## Before → after measurements

[[MEASUREMENTS]]

## Sources & frontier

[[SOURCES]]

## Trend verdicts

[[TRENDS]]

## SHONEN

[[SHONEN]]

## Wave findings and integration

[[WAVE-FINDINGS]]

## Round shape, seats and residual calls

[[SHAPE]]

## Stale-lane

Lane round 82 launched 2026-11-04T07:45:55-03:00 (`.ufo/watchdog.log` `launch kumitate round=82 pgid=1970144
driver=hyaku-inline attempt=1`) and completed [[complete-line]]; the mission was progressing (lane commits
`97a63012`, `63b12695`, `c4396021`, [[M]] inside the window), not silent. Respawn-per-round driver; no other
mission of this lane is open.

## Tool installs and L0

No tool was installed or upgraded this round (no `uv`, `npx`, `cargo`, `npm` or pacman transaction ran;
pacman stays paused host-wide). L0: [[L0]].

## Routed repairs, limits and open questions

[[LIMITS]]
