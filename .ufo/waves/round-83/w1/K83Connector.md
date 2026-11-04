# K83Connector — cross-lane scan (round 83)

Read-only seat. No lane file was written except this report; no frozen probe, control, sibling repo,
fleet file or `.ufo/state` was touched. Scratch: `/fast/scratch/hyaku/kumitate-r83/K83Connector`
(removed before yield). No tool installed or upgraded. Host: Linux run-15, lane tip `eca7debd`
(`git rev-parse --short HEAD`), working tree dirty only in `SKILL.md` (M) and
`corpus/knowledge/dispatcher-admission-surface.md` (??) — both sibling seats' ground, unread as authority.

**OVERLAP: 3 (absorb 0, report 3)** — three grounds overlap round 83's touched surface; none may be
absorbed into this lane; each is routed as a report. Four further grounds were checked and are clear.

| # | ground | sibling / owner | evidence (read at) | ruling |
|---|---|---|---|---|
| 1 | Wave settlement: reads `ufo-swarm-wave-dispatch-v1`, enumerates declared members, parses the `Report:` trailer, classifies the report file (`present`/`empty`/`stub`/`missing`/`misrooted`/`unsafe`/`unparsed`) | **mori** (`tools/mori-wave-settlement.py`; `PROVINCE.md:145-154`) | `DISPATCH_SCHEMA = "ufo-swarm-wave-dispatch-v1"` (:34); `REPORT_RE = ^Report: write your scoped findings to (\S+)$` (:36); statuses (:35); `misrooted` when the file is under the fleet root (:242-246); **no `resumeSends` read at all** (`grep -n resumeSends` → 0 hits); absolute trailer refused `unsafe` (:160-163); province says "result acceptance and re-dispatch stay **kumitate**'s" (:150) | **report** — settlement classification is mori's; C1's `REPORT_TRAILER` / `REPORT_DEST_*` arms are plan-time admission and stay this lane's. Two divergences routed below, not patched |
| 2 | Wave-cap arithmetic over the fleet policy: `policy.sighting.dispatch.swarm`, `waveMinLanes`/`waveMaxLanes`, spec `maxLanes`, registry member count | **tabi** (`scripts/round-evidence-audit.mjs`, gate `c2-wave-caps`; `SKILL.md:2477`) | `band = policy?.sighting?.dispatch?.swarm` (:301); `maxLanes > band.waveMaxLanes` → capProblem (:364-365); `maxLanes < band.waveMinLanes` → capProblem (:366-367); registry members > `maxLanes` (:375-378); required `--round-cap` (:289-290) | **report** — same policy field, second arithmetic. One latent false-positive class found (below); tabi's gate is tabi's, never edited here |
| 3 | Origin-upstream facts: `SWARM_ROLES`, `MAX_SWARM_LANES = 256`, `SWARM_DISPATCH_SCHEMA` at `ufo-fsd-alpha` `fb7157fc` | **operator** (PROVINCE §Adjacent: "Upstream defects … filed in lane reports for the operator; never patched from here") | `ready-handoff.mjs:47-54` copies the three constants with the pin in the comment; `scripts/wave-census.mjs` holds its own `ATTACK` set (:55); no instrument binds either copy to origin bytes | **report** — provenance is sound (pin named), byte-binding is absent; binding is operator/next-round ground, not absorbed |
| 4 | Report-pointer resolution in a filed report | **kotoba** (`verifiers/check_report_pointers.py`; `PROVINCE.md:31`) | kotoba PROVINCE:31 "lands `verifiers/check_report_pointers.py` for report pointers"; kumitate PROVINCE round-79 addition already rules: own-report pre-filing deepening, cross-lane checking reported, never absorbed | **clear** — round 83 touches neither pointer resolution nor `report-receipt-diff.mjs` v4; standing round-79 rule stands |
| 5 | Research method, source hierarchy, citation chaining, source registry | **chousa** (`PROVINCE.md:3-13`) | "Refuses: … orchestration, multi-agent dispatch and agent lifecycle (→ kumitate …)" | **clear** — S240–S242 are this lane's own registry rows; chousa's method province does not reach timestamp semantics or dispatcher code |
| 6 | Agent / model evaluation | **kengaku** (`PROVINCE.md:31`, :164) | "**kumitate:** OMP route resolution, fallback policy, operational failure taxonomy"; "**kasegi:** bounty ledger mission-state / dispatcher semantics" | **clear** — C1 judges plan admission (roles, band, cap), not model capability; no evaluation claim is made or restated |
| 7 | `swarm-registry.json` / `spec.json` consumer, registry members ∪ spec items, seat scope trailers | **tsukuroi** (`tools/check-seat-scope.py`) | docstring: "seat names and roles come from those two files (registry members union spec items, spec role wins)"; findings are `SCOPE-*`, exit 0/1/2 | **clear** — an artifact reader for execution-scope declarations, not an admission gate; C1 changes no registry file, so its input is unchanged |

## 1. The same admission-parity pattern already held elsewhere

The pattern (a lane gate restating the dispatcher's own admission arithmetic) is not new to the
fleet; round 83's C1 adds an **admission-time** instance to what were **post-dispatch** instances:

1. **This lane, round 41** — `scripts/wave-census.mjs` (`kumitate-wave-census-v1`):
   `const seatCount = tc.tasks.length + resumeCount` (:175), `COUNT_MISMATCH` when
   `counts.spawn`/`counts.resume` differ from the payload (:200-203), `REGISTRY_MISMATCH` against
   `registry.members` keys (:205-214), `taskCall: null` read as a resume-only wave (:171-173).
   C1 v3 is the pre-dispatch twin of this check; the spawns+resumes total is the same fact.
2. **mori, round 20** — `tools/mori-wave-settlement.py` requires `ufo-swarm-wave-dispatch-v1`
   (:346) and enumerates declared members from `taskCall.tasks` (:270-285), with the province
   explicitly withholding acceptance from its own verdict (:150). Same parity shape, different tense.
3. **tabi, round 23** — `scripts/round-evidence-audit.mjs` reads the fleet policy band and audits
   wave caps against it (:301, :364-378). Same policy field, own arithmetic.

So the pattern is held **three times in the fleet before this round**, and only this lane's C1 reads it
**before** the dispatcher spawns. That is the novelty, and the reason the two divergences in §3 matter:
the fleet now has four readers of one contract (`wave-census`, `dispatch-evidence`, `mori`, `tabi`),
each with its own arithmetic. S240's action cell ("a second arithmetic is drift") binds only this lane.

## 2. Ground truth re-read at the pin (not taken from the plan)

`/home/vgpnk/Projects/ufo-fsd-alpha` @ `fb7157fc`:

- `SWARM_ROLES` (`ufo-swarm-wave.mjs:265-275`) is exactly the ten roles v3 copies; `planner` /
  `distiller` / `labrat` / `Main` are frozen-topology seats (:262-264) — v3's `ATTACK` correctly
  drops `labrat`.
- `MAX_SWARM_LANES = 256` (`ufo-mission-result.mjs:2572`), `MIN_SWARM_LANES = 2` (:2573);
  `cap = min(policy.maxLanes ?? 256, 256)` then `min(cap, spec.maxLanes)` (:815, :836);
  `laneCeiling = min(policyCeiling, cap)` (:1068); guard order `impossible_band` → `too_many_lanes`
  → `too_few_lanes` → `wave_too_wide` (:1074-1094).
- **The dispatcher has no attack-share rule**: `grep -in attack scripts/ufo-swarm-wave.mjs` returns
  nothing. The 25 % floor is lane-owned, which is why an attack-share refusal must never be presented
  as "what the dispatcher would refuse".
- Real policy (`scripts/hyaku/ufo-wave-policy.json`):
  `sighting.dispatch.swarm = {maxLanes:256,minLanes:8,waveMinLanes:8,waveMaxLanes:16,…}`;
  `proposalRoles` = the ten `SWARM_ROLES` names.

## 3. Adjacent evidence found on the way (in-lane; not sibling ground)

### 3.1 C1's frozen predicate is satisfied exactly when one arm fails — the counter's target is unreachable

`node .ufo/waves/round-83/probe/probe83-c1.mjs --set c1 --lane .` → `C83_C1: HELD held=27/27`, exit 0.
But the probe runs **28** arms against `const ARMS = 27` (probe :21; 28 `arm('` calls; 28 printed arm
lines), so `held === ARMS` is true **iff exactly one of the 28 arms fails**:

- at M: 27 pass + 1 fail → `HELD held=27/27`, exit 0;
- at the base control: 13 fail → `UNMET held=15/27` (`controls/c1-base.txt`);
- with the one failing arm repaired in a scratch copy: 28 pass → **`UNMET held=28/27`, exit 1**.

Demonstration (scratch only, no lane/frozen byte touched):

```
mkdir -p $S/demo/scripts && cp .../kumitate-shokunin/scripts/ready-handoff.mjs $S/demo/scripts/
# scratch copy: attack share over spawn seats instead of total
node .ufo/waves/round-83/probe/probe83-c1.mjs --set c1 --lane $S/demo --work $S
→ C83_C1 arm band-total-resumes ok  … attack=2/12 …   (28 ok lines)
→ C83_C1: UNMET held=28/27   (exit 1)
```

The failing arm at M is real and not a fixture artifact:

```
C83_C1 arm band-total-resumes FAIL exit=1 want="READY_HANDOFF: READY wave=w1 seats=6 resumes=6 total=12"
  out=READY_HANDOFF: DRIFT ATTACK_SHARE (2/12 attack seats below 25%)
```

Cause: `ready-handoff.mjs:236` makes `total = tasks.length + resumeSends.length`, and :322 tests
`attack * 100 < opts.attackPct * total`, while `attack` is incremented only inside `tasks.forEach`
(:298). A resume lane cannot carry a role (`resume_role_forbidden`, `ufo-swarm-wave.mjs:938`), so
every resume inflates the denominator with a seat that can never count in the numerator. A mixed wave
that v2 admitted (2/6 = 33 %) is now refused (2/12 = 16.7 %) — the C1 change *lowers* operability for
resume-bearing waves. The tool's own suite misses it because its case uses `attack: 3` of 6+6 =
exactly 25 % (`ready-handoff.mjs:691-694`): `READY_HANDOFF_SELFTEST: 68/68 pass`, `VERDICT: PASS`.

C2's counter does not share the defect: 16 `arm('` calls, `ARMS = 16` (probe83-c2 :21), 16/16, exit 0
(my run). Its docstring's "held=15/15" is stale prose only.

### 3.2 C2's "unparseable instant reads SHAPE_CLOCK" is not literally held

`clockRefusal(doc, ageDays)` returns `null` when `Number.isNaN(ageDays)` (`omp-census.mjs:221`), so the
predicate itself would not refuse a malformed instant; in practice a malformed `captured_at` never
reaches it — `validateShape` (`:173-177`) refuses it first as `SHAPE_INVALID` (exit 2). The frozen arm
`clock-one-predicate` compares exit codes only (`shape=2 compare=2`), so token-level equality is not
counter-held. Behaviour (refuse, exit 2, both paths) holds; the plan's token sentence overstates.

### 3.3 `--agents` with the dispatcher's real registry can never resolve the L1

The round's own registry is `{schema:"ufo-swarm-registry-v1", members:{…15 seats…}}`
(`.ufo/waves/round-83/w1/swarm-registry.json`; 15 members = 15 spawn tasks, no `KumitateR83`).
The gate's documented real invocation omits `--agents` (`SKILL.md:755`) and reads:

```
READY_HANDOFF: READY wave=w1 seats=15 resumes=0 total=15 attack=4/15 connector=1 roles=scout=2,executor=3,scribe=3,connector=1,reviewer=2,critic=1,mutation-tester=1,sentinel=1,revenger=1 policy=ufo-wave-policy.json agents=none   (exit 0)
```

Supplying the producer's real registry takes the L1 arm:

```
node scripts/ready-handoff.mjs --lane . --round 83 --wave w1 --policy …/ufo-wave-policy.json --agents .ufo/waves/round-83/w1/swarm-registry.json
→ READY_HANDOFF: DRIFT L1_UNRESOLVED (ready.l1="KumitateR83" is not in …/swarm-registry.json)   (exit 1)
```

`ufo-swarm-wave.mjs` builds `memberEntries` from the wave's spawn and resume lanes (`:1171-1248`) and writes `members: Object.fromEntries(memberEntries)` (`:1404`), so the producer's
document **never** contains the L1 by construction. Change 7 ("accepts the validator's `{members}`
registry shape") is therefore only exercisable against a synthetic registry that carries the L1 — the
frozen arm's fixture is exactly that (`probe83-c1.mjs:105`: `members:{KumitateR83:{role:"main"}}`).
Shape parsing is correct; the L1 arm and the accepted shape are mutually unsatisfiable on real bytes.

### 3.4 Two in-lane readers of one envelope, two vocabularies

`wave-census.mjs:55` keeps `labrat` in `ATTACK` and caps (:63-64) at 1000/10000; `ready-handoff` now
uses the reachable three. Harmless for `ufo-swarm-wave-dispatch-v1` payloads (the validator refuses
`labrat`), only reachable through a bare residual `{context,tasks}` payload; the caps are census DoS
bounds, not admission. Named for coherence, not as a defect.

## 4. Proposed move (one, bounded)

**Do not record C1 as held on `held=27/27`. Re-derive the attack share over spawn seats and make the
counter's denominator derive from its arm list; land both in a new counter version (round 84), never by
editing the frozen probe.**

Concretely:
1. `ready-handoff.mjs:322` — judge the lane-owned floor over the seats that can carry a role
   (`tasks.length`), and print the denominator that was judged (`attack=2/6`, with `total=12` already
   on the line). The 25 % floor is lane-owned and the dispatcher has no such rule (§2), so this cannot
   loosen any dispatcher-parity arm.
2. `probe83-c1b.mjs` (new file, round 84) — `const ARMS = arms.length`, so `HELD` means all arms pass
   and a repair cannot flip the verdict to `UNMET held=28/27`.
3. Close receipt: relabel C1's arms per K4 — 13 arms were failing at base, 15 carried; the moved set is
   the v3 block (`tool-v3-contract`, `clean-ready`, `band-total-resumes`, `resume-only-exempt`,
   `maxlanes-*`, `dispatch-schema`, `dispatch-counts`, `policy-role-unjudgeable`, `agents-members`,
   `agents-members-nol1`).
4. Route the two cross-reader divergences as reports, not patches: mori settlement is resume-blind
   (`resumeSends` unread → a resume wave reads `no-spawn`), and tabi's `c2-wave-caps` treats
   `spec.maxLanes > waveMaxLanes` as a cap problem while the dispatcher only clamps the ceiling
   (`ufo-swarm-wave.mjs:1068`) and accepts such a spec.

**Affected axes:** operability (C1) — repaired: a validator-legal mixed wave stops being refused, and
the counter's verdict becomes reachable/falsifiable. `coverage:omp` (C2) — untouched (16/16, ARMS
correct). No sibling ground absorbed; no frozen byte edited.

**Risks:** (a) changing the printed denominator changes the READY line's shape, so the SKILL row and
`corpus/knowledge/dispatcher-admission-surface.md` must be amended in the same commit or the docs
describe a line the tool no longer prints; (b) a new counter version is a later round's claim, so round
83's close receipt must *disclose* the `27/27` accounting rather than re-freeze it silently; (c) the
proposed spawn-denominator reading must not be applied to `BAND`, which is correctly over `total`.

**Verification:** `node .ufo/waves/round-83/probe/probe83-c1.mjs --set c1 --lane .` must stop reading
`HELD` at M for the right reason (either UNMET at 27/28, or a v2 probe at 28/28); the patched-copy run
above is the expected-green reference (`band-total-resumes ok`, READY `seats=6 resumes=6 total=12`); the
tool's own suite must gain a below-floor mixed case (2 of 6+6), not only the 3-of-12 boundary.

## 5. Exact commands run

```
node .ufo/waves/round-83/probe/probe83-c1.mjs --set c1 --lane . --work /fast/scratch/hyaku/kumitate-r83/K83Connector   # exit 0, HELD 27/27
node .ufo/waves/round-83/probe/probe83-c2.mjs --set c2 --lane . --work /fast/scratch/hyaku/kumitate-r83/K83Connector   # exit 0, HELD 16/16
node scripts/ready-handoff.mjs --selftest --work /fast/scratch/hyaku/kumitate-r83/K83Connector                        # 68/68, VERDICT: PASS
node scripts/ready-handoff.mjs --lane . --round 83 --wave w1 --policy <fleet policy>                                   # READY … attack=4/15, exit 0
node scripts/ready-handoff.mjs --lane . --round 83 --wave w1 --policy <fleet policy> --agents .ufo/waves/round-83/w1/swarm-registry.json   # DRIFT L1_UNRESOLVED, exit 1
node .ufo/waves/round-83/probe/probe83-c1.mjs --set c1 --lane $SCRATCH/demo --work $SCRATCH                            # UNMET held=28/27, exit 1 (spawn-denominator copy)
grep -c "arm('" .ufo/waves/round-83/probe/probe83-c1.mjs  # 28   (ARMS = 27 at :21)
grep -in attack /home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs  # no hits
```

## 6. What I could not verify

- I did not execute the origin dispatcher (`ufo-swarm-wave.mjs`) — read-only source read at `fb7157fc`,
  so §2 is source fact, not an observed refusal.
- mori's and tabi's gates were read, not run: their selftests and receipts are their lanes' evidence.
  The resume-blind settlement and the `maxLanes > waveMaxLanes` false positive are source-read findings;
  no run at their tips.
- The patched scratch copy is a demonstration of the counter's accounting, not a claim about M; no
  measurement of a repaired lane exists.
- Whether the L1 is meant to be a registry member at all is a contract question I can only state:
  the dispatcher's producer never writes it, and the gate requires it when `--agents` is supplied.
