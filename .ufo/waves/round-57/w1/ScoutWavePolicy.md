# ScoutWavePolicy — wave-spec validation vs ufo-wave-policy-v2

## Verdict: VALIDATES (corroborated — validator re-runnable, verdict captured)

`.ufo/waves/round-57/w1-spec.json` passes `ufo-swarm-wave.mjs plan` under
`scripts/hyaku/ufo-wave-policy-v2.json` with exit 0, emitting schema
`ufo-swarm-wave-v1`, `counts={spawn:64, resume:0, total:64}`. All four named
constraints hold, verified both by the validator's acceptance and by an
independent re-count.

## Validator re-run (the plan verdict, captured)

Command (run twice — lane-rooted and scratch-rooted):

```
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && \
  UFO_CONFIG_PATH=/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy-v2.json \
  UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 \
  UFO_PROJECT_ROOT=/home/vgpnk/Projects/shokunin/kumitate-shokunin \
  node /home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs \
    plan --spec .ufo/waves/round-57/w1-spec.json
```

Observed: exit 0, stderr empty, 122,895-byte JSON plan on stdout
(`ufo-swarm-wave-v1`). Key emitted fields:

- `counts = {"spawn":64,"resume":0,"total":64}`
- `policy = {"source":"config","maxLanes":256,"minLanes":16,"waveMinLanes":64,
  "waveMaxLanes":128,"declaredMaxLanes":null,"hardCeiling":256,...}` — confirms
  the validator resolved the v2 policy file, not v1 (32–64) or defaults.
- `registry.path = .ufo/waves/round-57/w1/swarm-registry.json` (computed only).
- `tasks[]`: 64 entries, each `{name, agent, task}`; `agent` values map 1:1 to
  the ten leaf roles below — no planner/distiller/labrat/Main selector appears.

## Per-constraint evidence

| Constraint | Result | Evidence |
|---|---|---|
| band 64–128 | 64 items — inside band | validator `counts.total=64`; independent `spec.items.length=64` (spec-counts.txt). Rejection paths exist: `too_few_lanes` (<64), `wave_too_wide` (>128), `impossible_band` (cap<floor) at ufo-swarm-wave.mjs:965-985 |
| attack >= 25% | 24/64 = 37.5% | reviewer 13 + critic 6 + mutation-tester 5 = 24; matches spec context's own declaration. NOTE: the ≥25% rule is the campaign rule in lane-addendum.md:50-53; the validator itself enforces band/roles/keys but has no attack-share check — verified by reading planSwarmWave |
| leaf roles only | all 10 roles ∈ SWARM_ROLES | spec roles ⊆ {scout, reviewer, critic, connector, sentinel, executor, mutation-tester, revenger, simplifier, scribe} (ufo-swarm-wave.mjs:248-259); `unknown_role` would fire otherwise |
| no planner seat | none | `role` values counted: {executor:19, reviewer:13, scribe:8, scout:7, critic:6, mutation-tester:5, simplifier:2, sentinel:2, revenger:1, connector:1}; planner/distiller/labrat/Main are frozen-topology and rejected by `unknown_role`. Spec context sentence "The L1 holds the planner seat" is prose, not an item — consistent with the orchestrator ruling cited in plan.md:9 |

Additional structure observed: 64 distinct names (validator `duplicate_name`),
0 resume lanes, all spec keys within SPEC_KEYS, `reportDir` lane-relative,
`axes=[operability,coverage]`, `milestone` present. Both `item` texts are
pairwise-distinct (validator `duplicate_expansion` did not fire).

## Write-boundary proof (plan emits no registry)

`persistWaveRegistry` is invoked only on the `run` path
(ufo-swarm-wave.mjs:1808-1815). Proven by sandbox re-run: spec re-rooted at
`build/ScoutWavePolicy/sandbox-root/` (`UFO_PROJECT_ROOT` pointed there), plan
re-run exit 0, and the sandbox still contains only `w1-spec.json` — no
`swarm-registry.json` materialized. The lane's live
`.ufo/waves/round-57/w1/swarm-registry.json` (mtime 09:51:26, 56,159 B)
predates my validator run (output captured 09:53:07) and is the live
dispatch's own `run`-path artifact — not a write from this seat.

## Gaps / notes

- The 25% attack-share floor is NOT machine-enforced by the validator; it is a
  lane-addendum campaign rule. It holds here at 37.5% by count, but a spec
  under 25% would still pass `plan`. Independent count required (done above).
- `w1/swarm-registry.json` exists and is modified vs commit f0dc6d1 — evidence
  the orchestrator dispatched this wave (live seat activity), consistent with
  the spec's "do not attempt dispatch" instruction to seats, which I followed.
- No install performed; node v24.21.0 pre-existing. No pacman run (host-wide
  pause honored).

## Evidence files

`build/ScoutWavePolicy/`:
- `validator-plan.stdout.txt` — full lane-rooted `plan` verdict (exit 0, raw)
- `validator-plan.stderr.txt` — empty stderr
- `plan-verdict-slim.txt` — plan JSON minus tasks/context (verdict fields)
- `plan-rerun.json` + `plan-rerun.stderr` — sandbox-rooted re-run, exit 0
- `sandbox-root/` — scratch UFO_PROJECT_ROOT, proves no registry write
- `spec-counts.txt` — independent census of items/roles/attack-share
