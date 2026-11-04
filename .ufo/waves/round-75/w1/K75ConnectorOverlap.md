# K75ConnectorOverlap — report (kumitate round 75 w1, 2026-11-04)

## What I did
Sibling-overlap scan for round 75's two surfaces — (a) C1 `coverage:omp` (OMP agent-plane
members `lsp.json`, `config.yml.pre-*`, `agent.db.pre-*`, `models.db.corrupt-*`) and (b) C2
`origin-tip-drift` — across all 20 sibling lane repos (read-only) and the fleet level.
Frozen plan read first (`plan.md:1-83`); base `c38382d5`.

## Exact commands (grep/read/glob tools; all explicit literal paths)
1. Broad pass, 20 sibling dirs: pattern
   `lsp\.json|omp/agent|config\.yml\.pre|agent\.db\.pre|models\.db\.corrupt|tip-drift|origin[- ]pin|coverage:omp|origin-tip` → 6901+ files (dominated by `.ufo/` dispatch boilerplate naming `~/.omp/agent/RULES.md`).
2. Narrow pass, same dirs: `lsp\.json|config\.yml\.pre|agent\.db\.pre|models\.db\.corrupt|tip-drift|coverage:omp|origin-tip` → 23 files, all dispositioned.
3. Governance surfaces: `omp/agent|origin[- ]pin|coverage:omp` over 20 × {PROVINCE.md, SKILL.md} → kaidoku, kasegi, kotoba, mado, mori, tameshi hits; zero `origin[- ]pin`/`coverage:omp` anywhere.
4. `rev-list --count` over fleet `scripts/` + existing sibling script/tool dirs
   (`chousa/tools`, `kaidoku/tools`, `kake/scripts`, `tabi/scripts`; other 16 lanes have no scripts dir) → only fleet `scripts/hyaku/{inline.sh:173, jj-lane.sh:176-177,409-410, jj-lane-selftest.sh:190}`, all lane/fleet push-state.
5. Pin-kinship: `origin|pin|upstream` over `tabi/scripts` (42 files; `tsukuroi/scripts` absent) + reads of `tabi check-release-pins.mjs:1-63`, `check-user-round-contract.mjs:24-27,407-418`, `check-freshness.mjs:84-101`, `kumitate scripts/omp-census.mjs:1-15`.
6. Ownership: glob `*-shokunin/.ufo/pins/*` → **kumitate only** (8 files incl. `origin.json`); fleet-root `.ufo/pins` does not exist.

## Verdict lines
- `OVERLAP: named — tameshi, mado, kotoba, kaidoku, kama, kasegi, mori, chousa, tabi (fleet: scripts/hyaku)` — all adjacent-citable (ii) or unrelated word match (iii).
- `CONTESTED: none` — no sibling lane governs, declares or duplicates either surface; no duplicate `rev-list`/`pin..HEAD` origin-drift instrument exists anywhere; `.ufo/pins/` is kumitate-only.
- Key adjacencies: tameshi r55 swept the same `~/.omp` root (one-off evidence; corroborates mode 0600); mado declares a refusal boundary over `~/.omp/agent` (compatible — the census header states readdir+lstat only, never content); kaidoku r19 external-writer incident is the precedent for the plane mutating outside lane control; fleet `hyaku.env` is the decision ledger for the `config.yml.pre-*` family (citable by the note, no absorb); tabi `check-release-pins.mjs` is the nearest functional kin to C2 (different unit: upstream tag+bytes, not pin-vs-origin HEAD).

## Files
- Receipt (hit table, per-hit dispositions, compatibility notes, limits):
  `.ufo/waves/round-75/build/K75ConnectorOverlap/overlap.md`
- This report: `.ufo/waves/round-75/w1/K75ConnectorOverlap.md`

## Limits
- Text, gitignore-respecting scans; no `~/.omp/agent` member content read; repo evidence only (no live sibling state).
- `audio-shokunin`, `game-dev-2d-shokunin` lack SKILL.md; 16 sibling lanes have no scripts dir.
- Tool defect filed: glob-form grep paths silently match nothing (`xd://report_issue`); all recorded scans use explicit paths.
- No writes outside the two files above; no scratch, no installs, no commits.
