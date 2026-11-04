# K83MutCounters — mutation score vs the frozen round-83 counters

Seat: K83MutCounters (mutation-tester) · round 83, wave w1 · 2026-11-04
Lane under test: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` @ `eca7debd9aa6184a81f7e4abb43d507299a31f31`
Scratch: `/fast/scratch/hyaku/kumitate-r83/K83MutCounters/` (isolated `git archive` copy; deleted after scoring — see Evidence log)

## Method

- Isolated copy only: `git -C <lane> archive eca7debd… | tar -x -C <scratch>/copy`. One live copy, no clone, no git mutation anywhere.
- Pristine byte anchors saved before any mutation (sha256): `scripts/ready-handoff.mjs` `c1463c58…9ba`, `scripts/omp-census.mjs` `f6ace3e2…e45`, `probe/probe83-c1.mjs` `5da10098…301`, `probe/probe83-c2.mjs` `f63ebc52…5a` (full digests in Evidence log).
- Detector (run against the scratch copy, never the lane): `node <scratch>/copy/.ufo/waves/round-83/probe/probe83-cX.mjs --set cX --lane <scratch>/copy --work <scratch>/work`, with `HYAKU_SCRATCH` and `TMPDIR` pinned inside the scratch root.
- Per mutant: edit the scratch file → run the detector → restore exact bytes from the pristine anchor → re-hash. Lane tree received no writes except this report.
- No tools installed or upgraded (none needed).

## Baseline (pristine M copy)

- `C83_C2: HELD held=16/16` exit 0 — all 16 arms ok.
- `C83_C1: HELD held=27/27` exit 0 — **but 28 `arm()` calls execute and one arm FAILs at pristine M**:
  `C83_C1 arm band-total-resumes FAIL … out=READY_HANDOFF: DRIFT ATTACK_SHARE (2/12 attack seats below 25%)`.
  The fixture is 6 spawn + 6 resume ⇒ total 12, attack 2/12 < 25% ⇒ the tool can never emit the
  expected `READY … total=12` line. The `held === ARMS` gate (ARMS=27) tolerates exactly one
  failing arm, and this dead arm consumes that slot. Disclosed below; frozen bytes untouched.

## Tool mutants (mutated in the scratch copy; counters frozen)

| id | locus (scratch file:line) | mutation | counter reading | catching arm(s) | verdict |
|---|---|---|---|---|---|
| T1 | omp-census.mjs:222 | `if (ageDays < 0)` → `if (false)` in `clockRefusal` | `C83_C2: UNMET held=11/16` exit 1 | compare-future-unbounded, compare-future-bounded, compare-clock-names-instant, shape-clock-regression, clock-one-predicate (5 — all clock arms) | KILLED |
| T2 | ready-handoff.mjs:236 | `const total = tasks.length + resumeSends.length` → drop the `resumeSends` term | `C83_C1: UNMET held=26/27` exit 1 | resume-only-exempt (delta vs baseline: READY line shows `total=0`); band-total-resumes also flips to `BAND,DISPATCH_COUNTS` but was already dead at baseline | KILLED |
| T3 | ready-handoff.mjs:186 | `const cap = Math.min(policyMaxLanes, dispatchMaxLanes ?? Infinity, MAX_SWARM_LANES)` → `const cap = MAX_SWARM_LANES` | `C83_C1: UNMET held=24/27` exit 1 | maxlanes-policy, maxlanes-dispatch, maxlanes-impossible (3); maxlanes-ceiling still ok (cap=256) | KILLED |
| T4 | ready-handoff.mjs:249 | `if (dispatch.counts !== undefined)` → `if (false && …)` (DISPATCH_COUNTS never fires) | `C83_C1: UNMET held=26/27` exit 1 | dispatch-counts (lying fixture reads READY exit 0) | KILLED |
| T5 | ready-handoff.mjs:51-52 | `'labrat'` added to `SWARM_ROLES` | `C83_C1: UNMET held=26/27` exit 1 | policy-role-unjudgeable; labrat-seat-refused still held (policy proposalRoles gate) | KILLED |
| T6 | ready-handoff.mjs:258 | `if (unjudgeable.length)` → `if (true)` (POLICY_ROLE_UNJUDGEABLE fires always) | `C83_C1: UNMET held=20/27` exit 1 | clean-ready, resume-only-exempt, maxlanes-ceiling, dispatch-counts (true half), agents-members, agents-array-shape, attack-reachable (7 new + band-total-resumes already dead) | KILLED |
| T7 | ready-handoff.mjs:201-204 | delete the `{members:{…}}` registry branch in `--agents` | `C83_C1: UNMET held=25/27` exit 1 | agents-members (fail-closed AGENTS_MALFORMED), agents-members-nol1 (same); `{agents:[{id}]}` shape unaffected | KILLED |
| T8 | omp-census.mjs:270 | compare path judges the clock only under `--max-age` (exact v2 restore) | `C83_C2: UNMET held=14/16` exit 1 | compare-future-unbounded, clock-one-predicate; compare-future-bounded still ok (bounded path intact) | KILLED |

MUTANTS(tools): killed=8 survived=0 — every sampled behavior-bearing defect on both tools is caught; each plan-named predicate has ≥1 live catching arm.

## Counter self-tamper mutants (mutated in the scratch copy of the counters; tools pristine)

Caught ⇔ the run deviates from the frozen predicate (`C83_Cx: HELD held=N/N`, exit 0) on pristine tool bytes.

| id | locus | mutation | run on pristine tools | verdict |
|---|---|---|---|---|
| D1 | probe83-c1.mjs:209 | delete arm `band-small` | `C83_C1: UNMET held=26/27` exit 1 (27 arm lines) | CAUGHT — held-count gate `held === ARMS` trips on any arm loss |
| D2 | probe83-c1.mjs:161 | delete arm `band-total-resumes` (the dead arm) | `C83_C1: HELD held=27/27` exit 0 — byte-indistinguishable verdict from true frozen bytes | SURVIVED — missing tripwire: the gate counts held vs a constant, not `arm()` calls; no arm-roster or self-hash check |
| D3 | probe83-c1.mjs:166 | needle `'MAXLANES'` → `'ZZZ_NO_SUCH_TOKEN'` | `C83_C1: UNMET held=26/27` exit 1 (arm goes red on pristine tools) | CAUGHT — self-defeating weakening; the tripwire is the arm itself, not a meta-check |
| D4 | probe83-c1.mjs:166 | needle `'MAXLANES'` → `''` (tautology) | `C83_C1: HELD held=27/27` exit 0 | SURVIVED — no needle-strength check. Redundancy: combined with tool mutant T3 the suite still reads UNMET 24/27 (exit-code field `want(...,1,…)` + sibling arms maxlanes-dispatch/maxlanes-impossible trip) |
| D5 | probe83-c2.mjs:115 | delete arm `compare-future-unbounded` | `C83_C2: UNMET held=15/16` exit 1 | CAUGHT — held-count gate |
| D6 | probe83-c2.mjs:115 | needle `'SHAPE_CLOCK'` → `''` | `C83_C2: HELD held=16/16` exit 0 | SURVIVED — same missing tripwire as D4; sibling clock arms keep the suite effective against tool mutants (T1/T8 still killed via exit codes) |
| D7 | probe83-c2.mjs:132,136 | compound: delete arm `compare-missing-receipt` + verdict word forced to `'HELD'` | prints `C83_C2: HELD held=15/16`, exit 1 | CAUGHT — two independent tripwires: exit code (`return held === ARMS ? 0 : 1` untouched) and the `held=15/16` fraction vs the frozen predicate string `held=16/16`; the verdict word alone is forgeable only when nothing fails |

MUTANTS(counters): killed=4 survived=3 — survivors D2/D4/D6 are coverage findings: the suite has no self-integrity check (no `arm()`-call count, no needle-strength check, no self-hash). The freeze commit plus external hashes are the controls that close this; a counter tampered post-freeze cannot match the recorded digests.

## Totals

MUTANTS: killed=12 survived=4

- Tool side: 8/8 killed. C1's new predicates (band total incl. resumeSends, effective cap = min(policy, dispatch, 256) with MAXLANES/MAXLANES_IMPOSSIBLE ordering, DISPATCH_COUNTS, POLICY_ROLE_UNJUDGEABLE, `{members}` agents shape, reachable attack set) and C2's every-call clock guard (unbounded compare, instant naming, one-predicate parity with `--shape`) each have at least one live catching arm.
- Counter side: 4/7 caught. All arm *deletions of a passing arm* and all *red-ward* needle edits are caught by the held-count gate; all *green-ward* weakenings (delete the dead arm, empty a needle) survive the suite itself.

## Counter defect disclosed (not edited)

`probe83-c1.mjs` declares `const ARMS = 27` but executes **28** `arm()` calls; `band-total-resumes`
fails at pristine M (its 6-spawn+6-resume fixture trips ATTACK_SHARE 2/12 < 25%, so the expected
`READY_HANDOFF: READY wave=w1 seats=6 resumes=6 total=12` is unreachable). The printed predicate
`C83_C1: HELD held=27/27` still matches because the gate tolerates exactly one failing arm.
Consequences: (a) the suite currently runs with zero spare capacity — any second failing arm flips
the verdict; (b) deleting the dead arm reproduces the frozen predicate exactly (mutant D2).
Per plan rules this is disclosed, not edited; a retarget (e.g. attack seats proportionate to the
12-lane total) or re-labelling per K4 is a later round's call.

## What I could not verify

- Exhaustiveness: the 8 tool mutants sample the behavior-bearing points named by the task; other single-point defects (e.g. WAVE_BINDING stem rule, `Date.parse` tolerance, READY_KEYS) were not probed.
- Full forgery (a counter that unconditionally prints the predicate line) is trivially invisible to the suite itself and out of scope; freeze bytes + the hashes recorded here are the control.

## Evidence log

- Commands (all against the scratch copy; `--lane /fast/scratch/hyaku/kumitate-r83/K83MutCounters/copy --work /fast/scratch/hyaku/kumitate-r83/K83MutCounters/work`, `HYAKU_SCRATCH`/`TMPDIR` pinned in-scratch):
  - baseline: `node …/probe83-c1.mjs --set c1 …` → `C83_C1: HELD held=27/27` (exit 0; 28 arm lines, band-total-resumes FAIL); `node …/probe83-c2.mjs --set c2 …` → `C83_C2: HELD held=16/16` (exit 0).
  - per mutant: one detector run each; verdicts and catching arms in the tables above (exact arm lines observed in run output).
  - restored state: both counters re-run after the final restore → `C83_C1: HELD held=27/27` exit 0, `C83_C2: HELD held=16/16` exit 0.
- Hashes (lane == scratch copy == pristine anchors at close):
  - `scripts/ready-handoff.mjs` `c1463c5837e9ba95d1c11bdc3cb0082f608fec0d9e425a5a55585b26ba09d9ba`
  - `scripts/omp-census.mjs` `f6ace3e2d451e20ff5f7f6f0a41aae98296952ae549b03e6ecb3d15bccbf1e45`
  - `probe/probe83-c1.mjs` `5da10098b192a728be87b0cb676eacdd49e4163c0822dcfa6b53ad9b2b064301`
  - `probe/probe83-c2.mjs` `f63ebc52f2a12dd713b918f6c1065a576dafb0456c9a3dd436a01a21d10c2f5a`
- Mutated-file hashes recorded pre-restore: T1 `c2478b10…`, T2 `eed3506f…`, T3 `b5b0fe6f…`, T4 `a210157f…`, T5 `fe8c8447…`, T6 `87f7cbaa…`, T7 `5605b60d…`, T8 `c08ea433…`, D1 `39a3304d…`, D2 `af472cca…`, D3 `110759d0…`, D4 `cf0ba284…`, D5 `f63b1010…`, D6 `377c3771…`, D7 `7436533b…` (all restored to the pristine digests above; the D4+T3 combined probe also restored).
- Scratch `/fast/scratch/hyaku/kumitate-r83/K83MutCounters/` deleted after this report was written.
