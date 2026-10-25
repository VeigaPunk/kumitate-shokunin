# Seat K63R2ExecWaveCensus

VERDICT: Wave census is CLEAN and my independent computation matches the tool exactly for both waves, but the frozen plan's role-mix and size shape is violated: wave 2 has 39 seats (< 40), round total 79 (< 80), and the m_flash share is 38.5% in wave 2 and 44.3% round-wide — both below the plan's 50% floor.

## Evidence

Tool census (node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/wave-census.mjs --round 63 --root /home/vgpnk/Projects/shokunin/kumitate-shokunin --expect 'w1:attack=10'):

```
WAVE round=63 wave=w1 schema=ufo-swarm-wave-dispatch-v1 seats=40 attack=10 reports=40/40 roles: executor=13 scribe=6 scout=5 reviewer=4 connector=3 critic=3 mutation-tester=3 revenger=1 sentinel=1 simplifier=1
WAVE round=63 wave=w2 schema=ufo-swarm-wave-dispatch-v1 seats=39 attack=20 reports=0/39 roles: reviewer=12 executor=11 critic=5 mutation-tester=3 scribe=3 connector=2 scout=2 simplifier=1
ROUND round=63 waves=2 seats=79 attack=30 reports=40/79
WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)
EXIT=0
```

Independent computation (Python stdlib over w1-dispatch.json registry/tasks/Report: trailers and w2-spec.json items):

```
W1 registry members: 40 | taskCall tasks: 40 | registry==tasks roles: True | name sets equal: True
W1 roles: scout=5 connector=3 executor=13 scribe=6 simplifier=1 reviewer=4 critic=3 mutation-tester=3 sentinel=1 revenger=1
W1 reports present: 40 absent: 0 | mflash 20/40=50.0% | attack 10/40=25.0% | connectors 3
W2 items: 39 | roles: reviewer=12 executor=11 critic=5 mutation-tester=3 scribe=3 connector=2 scout=2 simplifier=1
W2 mflash 15/39=38.46% | attack 20/39=51.28% | connectors 2
ROUND seats 79 | mflash 35/79=44.3% | attack 30/79=37.97% | connectors 5
W2 report dir holds only swarm-registry.json (0 .md reports; wave in flight -> 0/39 expected)
```

Agreement: tool and independent match on every number (roles, seats, attack totals, reports 40/40 for w1, 0/39 for w2). The tool additionally checked registry↔task name congruence and counts.spawn vs tasks (findings=0 -> CLEAN, exit 0); independent added share percentages. No difference in values.

Plan anchor: `plan.md:138` "Wave 2 (>= 40 seats...)", `plan.md:139` "Round total 80–100", `plan.md:139-140` ">= 50% of seats executor/scribe/simplifier (m_flash), >= 25% attack roles, a few connectors (m_antigravity)".

## Findings

1. **K63R2ExecWaveCensus-1** — severity medium; attacks the L1's wave-2 dispatch shape against the frozen plan. Wave 2 = 39 seats (< plan's >= 40) and reports total = 79 (< plan's 80–100). Reproduce: `node scripts/wave-census.mjs --round 63 --root /home/vgpnk/Projects/shokunin/kumitate-shokunin` (ROUND line: `seats=79`; WAVE w2 line: `seats=39`).

2. **K63R2ExecWaveCensus-2** — severity medium; attacks the m_flash majority rule (plan.md:139-140, run-7 addendum: >= 50% executor/scribe/simplifier). Wave 2 = 15/39 = 38.5%; round-wide = 35/79 = 44.3% — both below the floor. Reproduce: `python3 -c 'import json,collections;d=json.load(open(".ufo/waves/round-63/w2-spec.json"));r=collections.Counter(i["role"] for i in d["items"]);print(sum(r[x] for x in ("executor","scribe","simplifier")),len(d["items"]))'` → `15 39`.

3. **K63R2ExecWaveCensus-3** — severity info; wave-1 meets the plan thresholds exactly but no margin: m_flash 20/40 = 50.0% (>= 50%), attack 10/40 = 25.0% (>= 25%); reports 40/40 exist at their Report: paths; connectors 3. Reproduce: independent count above (W1 lines).

4. **K63R2ExecWaveCensus-4** — severity info; `w2-dispatch.json` is not committed at a9531c8 (git show exit 128; w1-dispatch.json is committed): wave-2 census numbers are live-dispatch worktree evidence for the in-flight wave, not yet committed bytes.

## Artifacts

- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63R2ExecWaveCensus/census.md (both pastes + agreement + shape-vs-plan table)
- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w2/K63R2ExecWaveCensus.md (this report)

## Limits

- Did not judge whether the m_flash rule applies per wave, per round, or both; either reading is violated (38.5% / 44.3% both < 50%).
- Did not check wave-2 seat reports (wave in flight; 0/39 expected and observed).
- Did not run the census under `--json` or -- --selftest; the default render and exit 0 were used.
- Did not verify which specific seats drove the 39 vs 40 count (spec items count = 39); no tool installs were needed (node + python stdlib only).
