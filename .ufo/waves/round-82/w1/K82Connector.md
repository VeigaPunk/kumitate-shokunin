# K82Connector — cross-surface scan: where the round's five rules are restated

Seat `K82Connector` (connector), round 82 wave w1. **Read-only**: no lane file was written except
this one; every hypothesis that needed a mutation ran on a copy under
`/fast/scratch/hyaku/kumitate-r82/K82Connector/` (removed at the end; `ls` then ENOENT).
No counter was run (the counter/mutation seats own that). No tool was installed or upgraded.

Revision: `63b12695` (scaffolding) + a dirty working tree from sibling seats: `SKILL.md`,
`corpus/QUALITY.md`, `corpus/README.md`, `SCORECARD.md`, `corpus/SOURCES.md`, and — noticed after my
measurements — `scripts/ready-handoff.mjs`, whose diff is **append-only inside `runSelftest` after
`:536`** (three trailer-prose cases). Every production anchor I cite is ≤`:536`, so those line numbers
hold. **`SKILL.md` line numbers below were read at `2026-11-04T11:04:46Z`**; that file is being
edited by a sibling, so any line >755 may have moved by the time this is read.

Roots scanned:

| root | state |
|---|---|
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin` | the lane, at `63b12695` + sibling edits (listed above) |
| `/home/vgpnk/Projects/shokunin/scripts/hyaku` | the campaign policy + dispatcher |
| `/home/vgpnk/Projects/ufo-fsd-alpha` | **the seat spec's path `origin-work/ufo-fsd-alpha` does not exist on this host**; `ls -d` → ENOENT. The repo is at this path (`git rev-parse --show-toplevel` → `/home/vgpnk/Projects/ufo-fsd-alpha`, HEAD `fb7157fc`) |

Copy classes used in every table:

- **authority** — the copy a machine reads to decide.
- **quote** — prose or an append-only record that restates the authority; a machine never reads it as
  the rule. Frozen wave artifacts under `.ufo/waves/round-<N>/` are *historical evidence*, not copies:
  they record what a round did and cannot drift.
- **drift-capable** — a live surface a machine or a seat reads *as* the rule, which can disagree with
  the authority without any gate going red. These are the rows that matter.

---

## 1. Rule-to-copy tables

### (a) The wave band — "8–16 seats in one v1 wave"

Authority for this round: `scripts/hyaku/ufo-wave-policy.json:89-90` (`waveMinLanes: 8`,
`waveMaxLanes: 16`; the neighbouring `minLanes: 8` `:85` and `maxLanes: 256` `:84` are the *round*
bound, not the wave band — the two bands are distinct fields on purpose, `ufo-mission-result.mjs:2656-2658`).

| # | surface | class | what it says | drift vector |
|---|---|---|---|---|
| a1 | `scripts/hyaku/ufo-wave-policy.json:89-90` | **authority** | `waveMinLanes 8`, `waveMaxLanes 16` | edited by the operator only; the gate fails closed (`POLICY_MALFORMED`) if the field is absent or inverted |
| a2 | `scripts/ready-handoff.mjs:160-168`, `:199` | derived (was a copy) | `lo`/`hi` read from `--policy`; `BAND` compares `tc.tasks.length` | **the copy this round deleted.** At base `0c23c4fc:scripts/ready-handoff.mjs:47` the tool carried `band: '8:16'`, `:34` a hard-coded `ROLES` set, `:160` `add('BAND', … outside ${lo}:${hi}')` with no policy read |
| a3 | `kumitate-shokunin/.ufo/waves/round-82/w1-dispatch.json:6-9` | drift-capable snapshot | `maxLanes 14, minLanes 8, waveMinLanes 8, waveMaxLanes 16` | written by the validator (`ufo-swarm-wave.mjs:1361-1363`) at spec time and **never re-read**: `ready-handoff.mjs:199` compares the seat count to the policy, never to this block. A dispatch rendered under an older policy reads clean forever |
| a4 | `scripts/hyaku/ufo-wave-policy-v2.json:89-90` | drift-capable policy copy | `waveMinLanes 64`, `waveMaxLanes 128` | a second policy file one `ls` away from the authority; its own note `:88` says "v1 (`ufo-wave-policy.json`, 32-64)" while v1 reads 8–16 — the cross-reference is already stale |
| a5 | `ufo-fsd-alpha/config/ufo.json:90-91` | **upstream authority for a different enforcer** | `waveMinLanes 32`, `waveMaxLanes 256`; `ufo-mission-result.mjs:2573 MIN_SWARM_LANES = 2` when a field is absent | the validator's band source is this config (`ufo-swarm-wave.mjs:838-848`), refusing `too_few_lanes` / `wave_too_wide` at `:1085-1091` |
| a6 | `SKILL.md:18` and `:538` | drift-capable prose | "spawn waves **16–100** lanes (`waveMinLanes`/`waveMaxLanes`, config default band, `minLanes` 64 target)"; "doctrine moved to the **16–100** band" | matches neither the policy (8–16) nor the config (32–256). A seat that sizes a wave from the lane's own skill table lands outside both enforcers |
| a7 | `scripts/hyaku/lane-addendum.md:5` (8–16), `:13` (16–32), `:93` (64–128), `:232-234` (64–128) | quote, with a prose supersede protocol | four bands in one file; `:3`/`:11` declare which block "supersedes" which | survives only because each superseding block names its predecessors. A reader that takes the first match reads 8–16; one that takes the last "binding" block reads 64–128 |
| a8 | `.ufo/prompts/kumitate-round-82.md:145` (8–16), `:153` (16–32), `:232-233` (64–128) | quote | the same three blocks, pasted into the round's binding prompt | same failure mode as a7, per round |
| a9 | `.ufo/waves/round-82/plan.md:8`, `:66` | quote | "band 8–16" | correct today; frozen |
| a10 | `ufo-fsd-alpha/.omp/skills/ufo/SKILL.md:417-422` (+ byte mirrors `.cursor/…`, `.devin/…`) | quote | the field names and the `too_few_lanes`/`wave_too_wide` refusals | three mirrors of one file; only the godspeed directive mirror is drift-checked (`collect-omp-native-handoff-lib/policy.mjs:912` "godspeed directive mirror drift") |

### (b) The swarm seat-role vocabulary

Authority for this round: `scripts/hyaku/ufo-wave-policy.json:104-114`
(`nativeProfiles.omp-native-v1.proposalRoles` — scout, reviewer, critic, connector, sentinel,
executor, mutation-tester, revenger, simplifier, scribe).

| # | surface | class | what it says | drift vector |
|---|---|---|---|---|
| b1 | `ufo-wave-policy.json:104-114` (and the devin profile's duplicate list `:217-227`) | **authority** | the ten roles | the same JSON carries the list twice, for two profiles |
| b2 | `scripts/ready-handoff.mjs:168`, `:222-225` | derived | `seatRoles` from the policy; `planner` → `PLANNER_SEAT`, unknown → `ROLE_UNKNOWN`, then `ATTACK.has` counts | admission is policy-derived (C1(f)); the **attack subset is not** |
| b3 | `scripts/ready-handoff.mjs:41` | drift-capable lane constant | `ATTACK = {reviewer, critic, mutation-tester, labrat}` | `labrat` is not a policy proposal role, so `:223` returns before `:225` ever sees it — **one of the four attack members is unreachable** |
| b4 | `scripts/wave-census.mjs:55-56` | drift-capable | `ATTACK` = the same four; `KNOWN_ROLES` = nine incl. `planner`+`distiller`, excl. `reviewer`/`critic`/`mutation-tester` (recovered through `ATTACK` at `:245`) | a third vocabulary in the same lane: `--expect w1:planner=0` is accepted here and refused as a seat by `ready-handoff.mjs:222` |
| b5 | `ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs:265-275` | drift-capable hardcoded set | `SWARM_ROLES` = the same ten, as a literal | the validator never reads `proposalRoles`; the two lists agree today by coincidence, not by construction |
| b6 | `ufo-fsd-alpha/crates/ufo-core-runtime/src/native_schema.rs:143`, `:151` | different authority, same words | `MANDATORY_PROPOSAL_ROLES` (6) + `OPTIONAL_PROPOSAL_ROLES` (4) | the judge splits the ten into two classes the lane's tables do not know about |
| b7 | `SKILL.md:948-950` | drift-capable prose rule | "Constants live once: `ENTRY_FAILURE_CLASSES`, `CAPACITY_FAILURES`, **`PROPOSAL_ROLES`**, deadline/seat-class maps — import or quote the source, never a restated copy" | `grep -rn 'PROPOSAL_ROLES' --include='*.mjs'` over the lane returns **no definition** (only round-52 build copies of this same sentence). The single source the rule names does not exist |
| b8 | `scripts/hyaku/lane-addendum.md:4`, `:31-32`, `:37-39` | quote | role lists that also carry non-proposal roles (`security-reviewer`, `sonic`, `distiller`, `seance`) | prose only; a reader sizing a wave from it can name a role no gate admits |

Consequence already realised **in this round's own record**: `plan.md:66` counts
"attack 5/14 = 36 % (reviewer ×2, critic, mutation-tester, **sentinel**)" while the gate counts
`attack=4/14` (§3, M3). Both clear the 25 % floor, so nothing goes red; the two documents simply
disagree about what an attack seat is. *The deep reading of validator-vs-gate role authority belongs
to seat K82Revenger (`.ufo/waves/round-82/w1/K82Revenger.md` §0); this table only inventories it.*

### (c) The `/skill:godspeed` lead and the `Report:` trailer grammar

Authority: `.ufo/prompts/kumitate-round-82.md:95` — "**Godspeed lead:** every L2 lane prompt leads with
`/skill:godspeed`, followed by the verbatim directive bytes … Resumes and nudges never re-carry it";
and `:441-442` for the trailer-resolution clause. Enforcement: `scripts/ready-handoff.mjs`.

| # | surface | class | what it says | drift vector |
|---|---|---|---|---|
| c1 | `.ufo/prompts/kumitate-round-82.md:95`, `:441-442` | **authority** (round binding) | lead with the invocation; context says how a relative trailer resolves | re-pasted per round |
| c2 | `scripts/ready-handoff.mjs:228-229` | enforcement | `task.task.split('\n')[0].trim() !== '/skill:godspeed'` → `GODSPEED` | **exact first line after trim** |
| c3 | `ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs:170`, `:184` | enforcement, different grammar | `GODSPEED_INVOCATION`; `hasInvocation = /^\s*\/skill:godspeed(?:\s|$)/u` | leading blank lines are legal there and preserved in the rendered lane (measured, §3 M2) → a lane the validator renders can fail the lane's own gate |
| c4 | `scripts/ready-handoff.mjs:233-247` | enforcement | first `Report:` line, **first path-shaped token anywhere on it**, trailing punctuation stripped, relative resolved at the lane | a second `Report:` line is silently ignored |
| c5 | `scripts/wave-census.mjs:57` | enforcement, different grammar | `RE_REPORT` requires the trailer to be the **last line** and the path to sit under `.ufo/waves/…md` | a trailer with prose after it, or a report dir outside `.ufo/waves/`, is invisible to the census (reports counted absent) |
| c6 | `ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs:225-226`, `:424` | producer | renders `Report: write your scoped findings to <reportDir>/<name>.md`; default `reportDir` `.ufo/scopes/<wave>` | arbitrary relative dir, not the lane's `.ufo/waves/` shape |
| c7 | `scripts/hyaku/lane-addendum.md:299-301` | drift-capable prose | "the validator renders each seat a relative `Report: .ufo/waves/...` trailer" | the renderer's default is `.ufo/scopes/<wave>` (`:424`); the `.ufo/waves/` form comes from this lane's spec `reportDir`, not from the validator |
| c8 | `.ufo/waves/round-82/w1-dispatch.json:121` (context), `:126+` (tasks) | quote | the composed prose | frozen in the dispatch |
| — | `ufo-swarm-wave.mjs:191-220` | **not the same rule** | `GODSPEED_MARKER = "| godspeed"` (`ufo-fsd-alpha/scripts/collect-omp-native-handoff-lib/base.mjs:120`), one terminal marker, `checkEnvelopeMarker` (`:212`) refuses two | this is the *judge handoff envelope* marker (`ufo judge-handoff`), not the lane lead. Same word, different contract — recording it here so a later scan does not "fix" one into the other |

### (d) The `.ready` five-key contract and lane identity

Authority: `scripts/ready-handoff.mjs:42` (`READY_KEYS = ['lane','round','wave','dispatch','l1']`),
enforced at `:178` (exact key set), with the *declared* contract in `lane-addendum.md:158-163`.

| # | surface | class | what it says | drift vector |
|---|---|---|---|---|
| d1 | `scripts/ready-handoff.mjs:42`, `:178`, `:179-183` | **authority** | five keys exactly; `lane` may be `kumitate` **or** `kumitate-shokunin` (`:180-182`) | pre-dispatch gate |
| d2 | `scripts/hyaku/lane-addendum.md:158-163` | quote | the five keys with a JSON example | prose; a sixth key would be refused by d1 and unnoticed here |
| d3 | `scripts/hyaku/inline-dispatcher.py:89` | quote | "JSON: lane, round, wave, dispatch abs path, l1 = your agent id" | same |
| d4 | `.ufo/waves/round-82/w1.ready` | instance | `{"lane":"kumitate","round":82,"wave":"w1", …,"l1":"KumitateR82"}` | the live handoff |
| d5 | `scripts/inline-dispatch-evidence.mjs:277-279`, `:290-293` | **second enforcer, different acceptance** | no key-set check at all; `lane` must match `^[A-Za-z0-9._-]+$` **and** equal `basename(root)` minus `-shokunin` | the full-dir name is legal at d1 and refused here — measured, §3 M4. Also requires `tc.context.includes("<lane> round <round>")`, where d1 requires only the lane *root path* in the context |
| d6 | `scripts/plan-before-ready.sh:12-13`, `:295` | weaker consumer | the round's "marker" is the first `:(glob)<dir>/*.ready`, **falling back to `*-dispatch.json`** | never reads a key; a round with no `.ready` at all still passes this gate |
| d7 | `scripts/hyaku/ready-watch.sh:9`, `:26-27` | weaker consumer | existence of `*.ready` minus `*.ready.dispatched` | wake signal only |
| d8 | `SKILL.md:618` | drift-capable prose | registry row: "must carry exactly `{lane, round, wave, dispatch, l1}`" | correct today; nothing reads it, so a v3 key set would leave it stale |
| d9 | `scripts/hyaku/inline-dispatcher.py:266-267` | producer | writes `<wave>.ready.dispatched` = `time.strftime('%Y-%m-%dT%H:%M:%S')` + the id map | a second, zone-less "when was this taken" instant (§e9) |

### (e) Receipt age and the capture instant

Authority: `scripts/omp-census.mjs:166-168` (contract `kumitate-omp-shape-v2`, `ISO_SECOND`
`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$`), read by `validateShape` `:170-188` and aged by
`receiptAgeDays` `:216-219`.

| # | surface | class | what it says | drift vector |
|---|---|---|---|---|
| e1 | `scripts/omp-census.mjs:248-269` | **authority** (new this round) | compare discloses `receipt_captured=`/`age_days=` `:257`; `--max-age` → `SHAPE_AGE_UNKNOWN` `:260` / `SHAPE_CLOCK` `:264` / `SHAPE_STALE_RECEIPT` `:268` | the three tokens are new names; nothing else parses them yet |
| e2 | `scripts/omp-census.mjs:487-516` | authority (round 81 path) | `--shape` refuses v1 (`:494-497`), `SHAPE_STALE` `:505`, discloses `captured=… age_days=` `:516` | **two token families for one idea inside one tool**: `SHAPE_STALE` vs `SHAPE_STALE_RECEIPT`, `captured=` vs `receipt_captured=` |
| e3 | `.ufo/pins/omp-shape.json:3` | instance | `"captured_at": "2026-11-04T09:45:44Z"` | the pinned receipt |
| e4 | `SCORECARD.md:331` | drift-capable binding | `pin.omp-shape=8b6aaa79…` (sha256 of the receipt bytes) | the digest covers the bytes **that contain `captured_at`**, so any re-capture to refresh the age necessarily breaks the pin and forces a SCORECARD edit |
| e5 | `scripts/proxy-check.mjs:553`, `:1311-1313` | independent consumer | `pin.omp-shape` → the file; `shapeFromFile` returns **entries only** | structural proof that the age cannot reach `coverage:omp` — the "age never scores" arm does not rest on trusting the census |
| e6 | `corpus/knowledge/self-describing-shape-receipt.md:29` | **drift-capable, wrong today** | "`--compare` stays report-only and still reads a legacy v1 receipt" | false since this round: `--compare --max-age` gates and exits 1/2 (`e1`). The scaffolding commit `63b12695` touched `scripts/` + `plan.md` only, not this note |
| e7 | `corpus/knowledge/self-describing-shape-receipt.md:2` | drift-capable, wrong today | `verified-at: … --selftest → VERDICT: PASS (97 cases)` | measured **105** (§3 M5). Also cites `runShape` at `:492` (now `:487`) and `receiptAgeDays` at `:216` (correct) |
| e8 | `SKILL.md:756` (new), `:757` (round 81), `:754` (round 78) | drift-capable prose | `:756` names all three new tokens correctly | `:754` still describes the compare as non-gating ("shape-only and non-scoring") |
| e9 | `.ufo/waves/round-82/w1.ready.dispatched:1` | a second instant, different grammar | `2026-11-04T07:58:53` — no zone (`inline-dispatcher.py:266-267`) | never parsed for age by any gate; `inline-dispatch-evidence.mjs:255` checks existence only |
| e10 | `tsukuroi-shokunin/tools/check-boot-chain.py:125`, `:1008` | cross-lane, different schema | `captured_at` in `TOP_KEYS`; sample value carries a `-03:00` offset | same field name, three instant grammars across the fleet (Z, none, offset) |
| e11 | `.ufo/waves/round-82/probe/probe82-c2.mjs:115-120` | frozen counter | asserts `receipt_captured=`, `SHAPE_STALE_RECEIPT`, `SHAPE_AGE_UNKNOWN` | the authority for the claim's token names; frozen at `97a63012` |

---

## 2. The two ranked drift risks

### R1 — the `.ready` handoff is judged twice, by two gates that accept different files. **Not reduced by this round.**

`ready-handoff.mjs` (pre-dispatch) and `inline-dispatch-evidence.mjs` (post-hoc, registry row
`SKILL.md:635`) both read `<wave>.ready`. They disagree in three places:

| key | `ready-handoff.mjs` | `inline-dispatch-evidence.mjs` |
|---|---|---|
| key set | exactly five (`:42`, `:178`) | not checked |
| `lane` | `kumitate` **or** `kumitate-shokunin` (`:180-182`) | `basename(root)` minus `-shokunin`, strictly (`:291-293`) |
| context | must contain the lane **root path** (`:200`) | must contain `"<lane> round <round>"` (`:294`) |

Measured, same `.ready` bytes, `lane: "kumitate-shokunin"`: the gate says **READY** (no `LANE_MISMATCH`;
M4a) and the evidence gate says **`FINDING READY_MISMATCH:lane-dir=kumitate ready=kumitate-shokunin`**,
exit 1 (M4b). A green pre-dispatch admission can therefore be a red close gate.

Why this round did not reduce it: C1 added `WAVE_BINDING` (`:186-187`), `DISPATCH_WAVE` (`:189-192`),
`REPORT_DEST_DUPLICATE` (`:243-246`) and `L1_SEAT_COLLISION` (`:219-221`) to **one** side only. The
post-hoc gate's own dispatch check (`:277-279`: regex `/\/\.ufo\/waves\/round-\d+\/[^/]+-dispatch\.json$/`
**and** `endsWith('/round-N/<wave>-dispatch.json')`) is stricter than the new `WAVE_BINDING` and is
written in a different vocabulary, so the two will keep diverging. The real wave is unaffected
(`w1.ready` uses `lane: "kumitate"`), so this is latent, not live.

Cheapest close: make `ready-handoff` emit the strict lane form as a *finding* (`LANE_DIR_FORM`) rather
than accepting both, or make `inline-dispatch-evidence` accept `laneId` too. Either way one of the
two must import the other's predicate; a third comment saying "keep in sync" will not hold.

### R2 — the wave band lives in seven places, and only the tool learned to derive it. **Reduced this round, at the tool only.**

What C1(f) actually removed: the lane gate's private `band: '8:16'` and `ROLES` literals
(`0c23c4fc:scripts/ready-handoff.mjs:34,47,160`) are gone; `ready-handoff.mjs:150-168` now reads
`waveMinLanes`/`waveMaxLanes`/`proposalRoles` from `--policy` and fails closed `POLICY_ABSENT`/
`POLICY_MALFORMED` without it. A policy edit can no longer desync this gate from the campaign.

What remains, unchanged: `SKILL.md:18`/`:538` (16–100), `ufo-wave-policy-v2.json:89-90` (64–128,
with a stale note at `:88` about v1), `ufo-fsd-alpha/config/ufo.json:90-91` (32–256 — the source the
*other* enforcer reads, `ufo-swarm-wave.mjs:838-848`), `lane-addendum.md:5/13/93/232`,
`.ufo/prompts/kumitate-round-82.md:145/153/232`, and the dispatch's own snapshot
`w1-dispatch.json:6-9` which no gate ever compares back to the policy.

Second-order effect worth naming: `--band` is gone (plan A1.1) — `node scripts/ready-handoff.mjs
--round 82 --wave w1 --policy $P --band 8:16` prints `unknown argument: --band` + usage and exits
**64** (measured), not a finding. The failure moved from "judged wrong" to "usage", which is safer but
silent to a wrapper that only inspects the verdict line.

---

## 3. Measurements

All commands read the lane or a scratch copy; none wrote the lane. `$L` =
`/home/vgpnk/Projects/shokunin/kumitate-shokunin`; `$P` =
`/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`.

**M1 — the round's own handoff, judged by its own gate (the authority's live reading).**

```
cd $L && node scripts/ready-handoff.mjs --lane . --round 82 --wave w1 --policy $P
→ READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1
  roles=scout=2,executor=3,scribe=2,connector=1,reviewer=2,critic=1,mutation-tester=1,sentinel=1,revenger=1
  policy=ufo-wave-policy.json agents=none          EXIT=0
```

**M2 — the godspeed lead: two grammars.** `ufo-swarm-wave plan` over a prompt that begins with a blank
line before the invocation (`UFO_PROJECT_ROOT` = scratch):

```
node /home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs plan --spec-json '{"reportDir":"scopes/x","items":[{"role":"scout","prompt":"\n/skill:godspeed\n\nAudit a."},{"role":"reviewer","prompt":"Audit b."}]}'
→ tasks[0].task = '\n/skill:godspeed\n\nAudit a.\n\nLane bounds: …\n\nReport: write your scoped findings to scopes/x/SwarmScout01.md'
  first line = ''  ·  tasks[1] first line = '/skill:godspeed'
```

The same two tasks, placed in a scratch `.ready`+dispatch pair and judged by the lane gate:

```
node $L/scripts/ready-handoff.mjs --lane <scratch> --round 82 --wave w1 --policy $P --json
→ findings = [BAND, GODSPEED (seat SwarmScout01 does not lead with /skill:godspeed), TASK_LANE_ROOT×2]
```

So a lane the validator renders can carry a `GODSPEED` finding: `ufo-swarm-wave.mjs:184` accepts
`^\s*/skill:godspeed`, `ready-handoff.mjs:229` requires the first line itself. (The `BAND`/
`TASK_LANE_ROOT` findings are the 2-seat scratch fixture, not the divergence.)

**M3 — attack count: plan vs gate.**

```
python3 … w1-dispatch.json → {'scout':2,'executor':3,'scribe':2,'connector':1,'reviewer':2,'critic':1,'mutation-tester':1,'sentinel':1,'revenger':1}
attack(tool set {reviewer,critic,mutation-tester,labrat}) = 4
attack(plan set, sentinel substituted for labrat)          = 5
```

`plan.md:66` says "attack 5/14 = 36 % … sentinel"; M1 says `attack=4/14` (28.6 %). Both clear 25 %.

**M4a/M4b — the two `.ready` judges on identical bytes** (`lane: "kumitate-shokunin"`, scratch copy):

```
M4a node $L/scripts/ready-handoff.mjs --lane <fix> --round 82 --wave w1 --policy $P --json
    → verdict=DRIFT findings=[BAND, GODSPEED, TASK_LANE_ROOT×2]   ← no LANE_MISMATCH
M4b node $L/scripts/inline-dispatch-evidence.mjs --root <fix> --round 82 --wave w1 \
        --sessions-root <empty dir> --dispatcher-log none
    → INLINE_DISPATCH: DRIFT (seats=1 sessions=0 done=0 reports=0 dead=0)
      FINDING READY_MISMATCH:lane-dir=kumitate ready=kumitate-shokunin        EXIT=1
```

`dispatch.wave` also proved weaker than the plan's wording: with `--round 82`, a payload carrying
`"wave": "kumitate-r99-w1"` produces **no** `DISPATCH_WAVE` finding (only `endsWith('-w1')` is
checked, `:189-191`), and an absent `wave` key is skipped entirely.

**M5 — the census suite count, against the note that cites it.**

```
cd $L && node scripts/omp-census.mjs --selftest --work <scratch>/st | tail -1
→ VERDICT: PASS (105 cases)      EXIT=0
cd $L && node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json
→ OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0
  receipt_captured=2026-11-04 age_days=0      EXIT=0
```

`corpus/knowledge/self-describing-shape-receipt.md:2` records `97 cases`.

---

## 4. Cross-lane material — reported, never absorbed

| lane | tool | what it restates | relationship to this round's rules |
|---|---|---|---|
| kotoba | `verifiers/check_report_pointers.py` | resolves every backticked lane path a round report cites at a rev (`-> report pointers resolved N of M; unresolved U`) | **adjacent, not a copy**: it judges the *report's* citations, not the `Report:` trailer grammar. A lane-wide pointer gate would not have caught any row in §1(c) |
| souji | `tools/souji-freeze-check.py:27`, `:152` | enumerates `.ufo/waves/round-<N>/` artifacts named `*-dispatch*`, `*.ready*`, `*-spec.json`, `*-results.json` as **frozen** pre-dispatch bytes | restates the *filename* contract only; carries no five-key semantics. `tools/souji-census-*.sh` are disk/proc/fleet-root censuses — **not** the OMP shape census, so `coverage:omp` has no sibling implementation to reconcile with |
| tsukuroi | `tools/check-boot-chain.py:125`, `:1008` | a `captured_at` in `TOP_KEYS` under schema `tsukuroi-boot-chain-v2`, offset-form instants | field-name reuse under a different schema; no shared authority with e1, and none should be created |
| kumitate (siblings) | `K82ScoutReconC1.md` (validator vs gate: role and band authority), `K82Revenger.md` (same question re-derived from the validator's bytes), `K82ScoutReconC2.md` (compare consumers + age exposure) | deep readings of rows a5/b5/b6 and e1/e2 | reported here as pointers; this seat inventories the surface, they own the deep verdict |

One incidental observation: `/home/vgpnk/Projects/shokunin/kumitate-shokinin` (misspelled sibling
directory) exists next to the lane. It is outside every rule table and no tool references it, but a
glob-shaped scan (`*-shokunin`) picks it up; anyone widening a grep beyond absolute paths will read it
as the lane.

---

## 5. What I did not check

- Frozen history under `.ufo/waves/round-01…81/**` was not enumerated: those are append-only records,
  and none is an input to a live gate. Where a live tool reads one (the probes, the registry), the
  reading is cited instead.
- No counter was run and no mutation battery was applied — those seats exist in this wave.
- The gate's own `--agents` liveness arm (plan limit: `agents=none` disclosed) was not exercised; M1
  reproduces the round's real reading, which discloses `agents=none`.
- `SKILL.md` is dirty in the working tree; every line number above is stamped `11:04:46Z`. Rows a6,
  b7, d8 and e8 are the ones most likely to move.
