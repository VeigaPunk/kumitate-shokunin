# Round 63 wave census (wave 1 + wave 2) — K63R2ExecWaveCensus

Tool: `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/wave-census.mjs --round 63 --root /home/vgpnk/Projects/shokunin/kumitate-shokunin --expect 'w1:attack=10'`
Independent: Python stdlib over `w1-dispatch.json` (registry members + taskCall.tasks + Report: trailers) and `w2-spec.json` (items).

## Tool census (verbatim)

```
WAVE round=63 wave=w1 schema=ufo-swarm-wave-dispatch-v1 seats=40 attack=10 reports=40/40 roles: executor=13 scribe=6 scout=5 reviewer=4 connector=3 critic=3 mutation-tester=3 revenger=1 sentinel=1 simplifier=1
WAVE round=63 wave=w2 schema=ufo-swarm-wave-dispatch-v1 seats=39 attack=20 reports=0/39 roles: reviewer=12 executor=11 critic=5 mutation-tester=3 scribe=3 connector=2 scout=2 simplifier=1
ROUND round=63 waves=2 seats=79 attack=30 reports=40/79
WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)
EXIT=0
```

## Independent computation (verbatim)

```
W1 registry members: 40 | taskCall tasks: 40
W1 registry roles: {'scout': 5, 'connector': 3, 'executor': 13, 'scribe': 6, 'simplifier': 1, 'reviewer': 4, 'critic': 3, 'mutation-tester': 3, 'sentinel': 1, 'revenger': 1}
W1 task roles: same; registry==tasks roles: True; name sets equal: True (40 distinct)
W1 reports present: 40 absent: 0
W1 mflash: 20 / 40 = 50.0 % | W1 attack: 10 / 40 = 25.0 % | W1 connectors: 3
W2 items: 39
W2 roles: {'reviewer': 12, 'critic': 5, 'mutation-tester': 3, 'executor': 11, 'scribe': 3, 'connector': 2, 'scout': 2, 'simplifier': 1}
W2 mflash: 15 / 39 = 38.46 % | W2 attack: 20 / 39 = 51.28 % | W2 connectors: 2
ROUND total seats: 79 | mflash: 35 / 79 = 44.3 % | attack: 30 / 79 = 37.97 % | connectors: 5
W2 report dir exists with only swarm-registry.json (0 .md reports yet — wave in flight)
```

## Differences tool vs independent

None in the numbers: w1 roles, seat counts, attack totals, report presence (40/40), and w2 roles/seats/attack all match exactly (`W1 registry==tasks roles: True`; names 40/40). The tool additionally verified registry↔task name congruence and `counts` vs `tasks` (no COUNT_MISMATCH / REGISTRY_MISMATCH findings → CLEAN), and reports ROUND aggregates; the independent run added share percentages and checked the w2 report directory contents (empty of .md reports → 0/39 consistent).

## Shape vs frozen plan (plan.md)

- `plan.md:138` — "Wave 2 (>= 40 seats, ...)": **w2 has 39 seats** (< 40).
- `plan.md:139` — "Round total 80–100": **round total 79** (< 80).
- `plan.md:139-140` — ">= 50% of seats executor/scribe/simplifier (m_flash)": w2 = 15/39 = 38.5%, round = 35/79 = 44.3% — **both below 50%**.
- `plan.md:140` — ">= 25% attack roles": w1 25.0%, w2 51.3%, round 38.0% — all >= 25% (w1 exactly at threshold).
- "a few connectors": w1 3, w2 2, round 5.
- Wave1 40 seats matches plan; w1 m_flash exactly 50%, attack exactly 25%.
- `w2-dispatch.json` is NOT committed at a9531c8 (git show exit 128; w1-dispatch.json is committed): wave-2 census numbers are live-dispatch (worktree) evidence of the in-flight wave.
