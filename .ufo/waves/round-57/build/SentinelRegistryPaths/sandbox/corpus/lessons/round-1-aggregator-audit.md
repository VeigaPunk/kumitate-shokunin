# Round-1 aggregator corpus audit — kumitate

Auditor: aggregator L1 (m_qwen) + one independent L2 `reviewer` lane
(m_composer), 2026-09-28. Method: re-greped every named symbol and re-counted
every inventory figure in `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`.
No ufo script, dispatcher, or tmux command was executed. Scope: `corpus/` only.

Round evidence: `LOG.md` round-1 entry; commit `45b4ed3`; lane report
`~/projects/shokunin/.ufo/reports/round-1/kumitate.md`.

## Verdict: conformant layout and technical core — inventory figures and one drift claim fail

`corpus/` has `README.md` (coverage map + known gaps), `knowledge/` ×4 (+1 added
post-audit: `route-resolution.md`), `lessons/round-1.md`; all index rows
resolve; every knowledge entry ends in a `Sources:` block naming origin paths and
symbols; the lesson cites LOG round-1, commit and report. The technical
vocabulary — the part a future lane will actually act on — verified cleanly.
What failed is bookkeeping: three counts and one attribution.

## Independently re-verified (the technical core holds)

| Claim | Command | Observed |
|---|---|---|
| `ENTRY_FAILURE_CLASSES` = 7 classes | `sed -n '37,40p' scripts/ufo-mission-result.mjs` | rate_limit, usage_limit, model_unavailable, lane_timeout, process_exit, unavailable, quality_degraded ✓ |
| `CAPACITY_FAILURES` = 3 classes | `grep -n CAPACITY_FAILURES scripts/collect-omp-native-handoff-lib/base.mjs` | L109 `Set(["usage_limit","rate_limit","model_unavailable"])` ✓ |
| swarm policy knobs | `config/ufo.json` L93–100 | `maxLanes 100`, `minLanes 64`, `waveMinLanes 16`, `waveMaxLanes 100` ✓ |
| ceilings | `config/ufo.json` L77–85 | `globalRunnerCeiling 1056`, `maxConcurrentL1 32`, `windowPaneCeiling 16` ✓ |
| proposal/concurrency ceilings | `grep PROPOSAL_WAVE_CEILING\|CONCURRENCY_CEILING base.mjs` | L103 = 16; L101 = 32 ✓ |
| singleton lock | `grep -n acquireSingletonLock scripts/ufo-mission-result.mjs` | export at L1716 ✓ |
| classifier | `grep -n classifyFailure base.mjs` | `export function classifyFailure` L734 ✓ |
| routing-health outcomes = 5 | `base.mjs` L231–236 | ok, capacity, lane_timeout, quality_degraded, process_exit ✓ |
| hoist threshold | `grep MIN_HOIST_SAVINGS scripts/ufo-swarm-wave.mjs` | `= 512` at L392 ✓ |
| stale-pair refusal | `grep stale_dispatch_pair scripts/ufo-swarm-collect.mjs` | documented L50; thrown L451, L459 ✓ |
| dispatcher size | `wc -l scripts/fleet-dispatcher.mjs` | 14769 ✓ |
| handoff-lib file count | `find scripts/collect-omp-native-handoff-lib -type f \| wc -l` | 6 ✓ |
| runtime crate .rs count | `find crates/ufo-core-runtime/src -name '*.rs' \| wc -l` | **93** ✓ (whole crate = 102) |
| commit exists | `git -C kumitate-shokunin log -1 --oneline` | `45b4ed3 round-1` ✓ |

## Defects filed

1. **"installed `ufo` skill text says 128 swarm lanes" — attribution FAILED.**
   `rg -n '128'` over `~/.config/opencode/skills/ufo/`, `~/.agents/skills/` and
   `~/.claude/skills/` returns **zero** matches; the opencode `ufo/SKILL.md`
   carries no swarm-lane cap text at all. `128` exists only in
   `scripts/ufo-swarm-wave.mjs`'s header as the kimi parity constant
   `MAX_AGENT_SWARM_SUBAGENTS=128`. The *drift* the lane found is real and worth
   keeping — operator contract 100 (`config/ufo.json` + script header) vs kimi
   parity 128 — but the cited source is wrong, and the same sentence appears in
   `corpus/lessons/round-1.md` §4 and the lane report §5. This is the round's
   clearest example of a true conclusion resting on a false pointer.
2. **Inventory counts stale.** Lane report scope line says `scripts/` "74
   entries" and `ufo-sighting-lib/` "25 files". Observed: `ls scripts | wc -l` =
   **82** (78 files + 4 dirs); `find scripts/ufo-sighting-lib -type f | wc -l` =
   **26**. Neither is reproducible from the tree as it stands.
3. **Unverifiable proportion.** `corpus/lessons/round-1.md` §1 claims "~80% of
   SKILL.md content" — no counting method given, so nothing to falsify. Either
   attach the measure (sections? lines? citations?) or drop the number.
4. **Counting convention undocumented.** 93 vs 102 `.rs` files is a real
   src-only-vs-whole-crate distinction; say so once in `corpus/README.md` and
   every future inventory figure becomes checkable.

## Gaps for the next round

Already filed by the lane and endorsed by this audit: `fleet-dispatcher`
settle/successor chain; `ufo-core-runtime` loop driver + native admission;
`run-omp-native-trial` wall handoff sequence; `the-tick-ping.mjs` beyond
`path_ping`; `omp-global-config.mjs` alias resolution.

Added by this audit:

- Replace the 128-lane lesson with the verified drift statement (item 1) — one
  edit, and the corpus stops carrying a false pointer.
- Re-run the inventory with the commands printed, dated, and the counting rule
  named (items 2 and 4).
- **Cross-domain (reported, not absorbed):** `fleets/registry.json` lane→model
  routing in `~/Projects/bounties` is claimed as a gap by kasegi
  (`kasegi-shokunin/corpus/README.md`) and is orchestration by nature. This
  province should own it; the integrator's ruling belongs in both
  `PROVINCE.md` files.
