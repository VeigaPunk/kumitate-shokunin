# kumitate round 80 — frozen plan (L1, 2026-11-04)

Round of the run-15 hyaku block (ONE v1 wave, 8–16 seats, policy `ufo-wave-policy.json`).
Base tip: `1968689f9097f839457e242b41f83879e99af58e` (round-79 closure).
Axes: **operability 9** (lowest live axis; terminal integer) + **coverage:omp 10** (the axis's own
derivation surface).

Frozen before any data seat: this file, the two counters (`probe/probe80-c1.mjs`,
`probe/probe80-c2.mjs`), the open receipts (`open/`) and the pre-data controls (`controls/`).
The counters are frozen at the freeze commit and are not edited after any seat has scored; a
post-freeze defect is answered with a named erratum in the round lesson, never a silent edit.

## Open state (measured, `.ufo/waves/round-80/open/`)

- `node scripts/proxy-check.mjs` → `PROXY: DRIFT (C2_TOTAL_DRIFT declared=194 computed=195;
  O_MEMBERS_DRIFT declared=64 computed=65; AXES_DRIFT coverage row=10 derived=9)` exit 1
  (`open/base-receipts.txt`). C2 drift = the r79 closure landed `corpus/lessons/round-79-verifier-
  spotcheck.md` after the lane closed (9th spotcheck recurrence); O drift = the live `~/.omp/agent`
  root gained `config.yml.pre-rebalance2-20261104` (an operator routing backup) after the r79 close.
- `node scripts/spotcheck-adopt.mjs --check` → `SPOTCHECK_MAP: DRIFT spotchecks=46 uncovered=1
  first=corpus/lessons/round-79-verifier-spotcheck.md` exit 1; on a fixture whose spotcheck set is
  green and whose map is red for an unrelated reason it reads `SPOTCHECK_MAP: DRIFT spotchecks=46
  uncovered=0 first=oracle` exit 1 — the conflated reading (reproduced at
  `/fast/scratch/hyaku/kumitate-r80/L1-c1probe`, transcript in `open/conflation.txt`).
- `node scripts/omp-census.mjs` → `OMP_CENSUS: CLEAN (entries=65 findings=0 bound=35/35)` exit 0;
  `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` → `OMP_SHAPE_COMPARE: DRIFT
  entries=65 receipt=64 added=1 first=config.yml.pre-rebalance2-20261104` exit 1.
- `node scripts/kimi-census.mjs` → CLEAN 55/55; sources census exit 0 (six carried W04 warnings).

## C1 — operability: `spotcheck-adopt` v3 reads the spotcheck set and the map as two readings

**Claim sentence (frozen).** At M, `node .ufo/waves/round-80/probe/probe80-c1.mjs --set c1` prints
`C80_C1: HELD held=13/13` and exits 0; at the base tree (`--tool <base archive>`) the same counter
prints a held count below 13 and exits 1.

**Why it is a move, not a refactor.** Round 76's `spotcheck-adopt --check` folds the whole README map
into one verdict: when the map is red for any reason *other than* an uncovered spotcheck it prints
`SPOTCHECK_MAP: DRIFT … uncovered=0 first=oracle`, and `--adopt` refuses (`REFUSED_ORACLE`) a
spotcheck adoption whenever an unrelated map defect coexists. Both are the carried candidate-2
defect ("conflates an unrelated map drift with an uncovered spotcheck", open since round 76; owner
named round-80 L1 by the round-79 pre-registration). The repair splits the surfaces: the tool's own
verdict is the spotcheck set (`SPOTCHECK_COVERAGE:`), the map is a separate disclosed line
(`MAP:`), and `--adopt` validates its *own delta* (the target key resolves after the write, every
other finding byte-identical) instead of demanding a globally clean map.

**After-state (one value the closure re-derives with one command).** The committed counter's
`held=13/13`; the live lane after adoption reads `SPOTCHECK_COVERAGE: CLEAN spotchecks=47
uncovered=0` + `MAP: CLEAN` exit 0; a `git archive` of the base tree reads 0/13 on the same counter
(`controls/c1-base.txt`); `node scripts/spotcheck-adopt.mjs --selftest` exits 0.

**Counter arms (frozen, `.ufo/waves/round-80/probe/probe80-c1.mjs`).** 13 arms: (1) `coverage-clean`;
(2) `coverage-uncovered`; (3) `map-only-drift-green-coverage` — **discriminating**: green spotcheck
set on a map red for an uncovered non-spotcheck file reads `SPOTCHECK_COVERAGE: CLEAN … uncovered=0`
and `MAP: DRIFT first=uncovered:knowledge/late.md`, exit 0 (base: one conflated `SPOTCHECK_MAP: DRIFT
… uncovered=0 first=oracle`, exit 1); (4) `map-orphan-row-green-coverage` (map red via `orphan-row:`);
(5) `both-drift` (coverage DRIFT names the spotcheck first, map line still printed, exit 1);
(6) `oracle-refusal-preserved` (format-unmapped README → `REFUSED_ORACLE` exit 2, no coverage line);
(7) `usage-64`; (8) `adopt-on-red-map` — `--adopt` of an uncovered spotcheck on a map with an
unrelated uncovered knowledge file adopts both halves, exit 0, and the unrelated finding survives
base: `REFUSED_ORACLE` exit 2); (9) `adopt-duplicate-refused` (a duplicate README row for the target
→ exit 2, bytes unchanged); (10) `adopt-idempotent` (`ALREADY_ADOPTED`, bytes unchanged);
(11) `rollback-clean` (corrupt pre-image journal → exit 2, both halves unchanged, journal retired);
(12) `selftest` (`--selftest` exit 0 and `SPOTCHECK_ADOPT_SELFTEST: PASS (n/n)` with n ≥ 25);
(13) `live-lane-clean` (the lane's own `--check` after adoption).

*Kill rule.* All 13 arms must pass; any miss is UNMET and an honest stop. A constant printer cannot
pass 2+3+5 (the same command must read DRIFT with `uncovered=1` on one fixture and CLEAN with
`uncovered=0` on another), and a tool that still folds the map fails 3, 4 and 8.

*Controls (pre-data, `.ufo/waves/round-80/controls/`).* (a) `--tool` = a `git archive` of the base
tree `1968689f` → held < 13 (`controls/c1-base.txt`); (b) a stub `spotcheck-adopt.mjs` that prints
`SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0` and exits 0 unconditionally → arms 2/5 fail
(`controls/c1-stub.txt`).

## C2 — coverage:omp: the O terms re-derive from committed bytes, not from the live root

**Claim sentence (frozen).** At M, `node .ufo/waves/round-80/probe/probe80-c2.mjs --set c2` prints
`C80_C2: HELD held=12/12` and exits 0; at the base tree (`--tool <base archive>`) the same counter
prints a held count below 12 and exits 1.

**Why it is a move, not a refactor.** The `coverage:omp` integer is derived from `O_members`,
`O_findings` and `O_bound` — all three read the live `~/.omp/agent` by default. That root is
operator-owned and changes between rounds (r75 64 entries, r78 64, r80 65: `config.yml.pre-
rebalance2-20261104`), so the axis's own integer flakes on host churn and a closure on another host
cannot re-derive it: at this round's open the same live read produced `O_MEMBERS_DRIFT declared=64
computed=65`. The round-77 `--omp-shape` receipt and the round-78 `omp-shape-compare` diagnostic
exist; the move is to make the receipt the **default** O source (disclosed `source=snapshot` in the
verdict and the JSON body), keep the live read behind an explicit `--omp-live`/`--omp-root` opt-in,
and re-capture the receipt at 65 members. The live root keeps its watch through the non-scoring
`omp-census --compare` checklist item.

**After-state (one value the closure re-derives with one command).** The committed counter's
`held=12/12`; `node scripts/proxy-check.mjs` → `PROXY: MATCH (… O_members=65 O_findings=0 O_bound=35
coverage:omp=10; …; source=snapshot)` exit 0 with `OMP_AGENT_ROOT=/nonexistent`; the same command
with `--omp-live` against the live root reads `O_members=65` too (`source=live`) and `--omp-live`
against a 68-member fixture root reads `O_members=68` and DRIFTs; `node scripts/omp-census.mjs
--compare .ufo/pins/omp-shape.json` reads `IN_SYNC entries=65 receipt=65`.

**Counter arms (frozen, `.ufo/waves/round-80/probe/probe80-c2.mjs`).** 12 arms: (1)
`default-snapshot` — `OMP_AGENT_ROOT` pointing at a 68-member fixture root, no flags: MATCH,
`source=snapshot`, `O_members=65` (base: live read → `O_MEMBERS_DRIFT`); (2) `live-opt-in` —
`--omp-live` with the same root: `source=live`, `O_members=68`, DRIFT (base: `--omp-live` → exit 64);
(3) `offline-default` — `HOME`/`OMP_AGENT_ROOT` empty, `--kimi-root` fixture: MATCH
`source=snapshot` (base: live read fails closed); (4) `receipt-pinned` — the `pin.omp-shape` hash in
`kumitate-gate-pins-v1` equals the receipt's sha256, tampering it fires `GATE_PIN_DRIFT`; (5)
`receipt-absent` — a `--self` without the receipt → `OMP_SHAPE_NOT_FOUND` exit 2 (never a silent live
fallback); (6) `receipt-invalid` → `OMP_SHAPE_INVALID` exit 2; (7) `stanza-off-by-one` (a copied
scorecard declaring `O_members=64`) → `O_MEMBERS_DRIFT`; (8) `finding-on-receipt` (a receipt member
with a wrong mode) → `O_findings=1 coverage_omp=9`; (9) `snapshot-equals-census` — the proxy's O
terms equal `omp-census --shape` on the same receipt (one derivation); (10) `compare-non-scoring` —
`omp-census --compare` DRIFTs on the 68-member root while the proxy default stays MATCH; (11)
`selftest` (`proxy-check --selftest`, `omp-census --selftest` exit 0); (12) `live-clean` — `--omp-live`
against the real live root: MATCH `source=live`.

*Kill rule.* All 12 arms must pass; any miss is UNMET and an honest stop. Arm 1 vs 2 is the
discrimination (same fixture, two sources, two counts), arm 3 is offline re-derivability, and arm 5
refuses the silent fallback that caused the flake.

*Controls (pre-data, `.ufo/waves/round-80/controls/`).* (a) `--tool` = a `git archive` of the base
tree → held < 12 (`controls/c2-base.txt`); (b) a stub `proxy-check.mjs` that prints one constant
clean JSON with `source: "snapshot"` → arms 2/5/6/7/8 fail (`controls/c2-stub.txt`).

## Sourced claim and frontier step

C1's knowledge entry is sourced on rows opened this round (SOURCES additions recorded in the lesson's
`## Gate` with URL, access date and a ≤25-word located quote); C2's entry is own-work-grounded
(S### own-work rows). The census is run at round open and close; the mistake mined this round is the
conflation/record class the r79 spot-check routed (D2/D3 dead pointers, D6 unnamed revision) — a dead
pointer in a filed record is a `reference-drift` mistake, captured by the r79 `POINTER_DEAD` finding
and fixed by resolving every new pointer this round.

## Freeze

This plan, both counters, `open/` and `controls/` are committed at the freeze commit before the wave
is dispatched; the after-state is measured at the close commit, which names the measured revision in
every close receipt (`rev=` line).
