# Round 20 — K5 + the first coverage:kimi-layer measurement (2026-10-13)

The final round of the goal, executed exactly as pre-registered in round 19:
a registry change (K5) declared a round ahead, then the first measurement of
`coverage:kimi-layer` — the round-16 role for the K block.

## What landed

- **K5 root-residue family** (3 members: `workspaces.json`, `tui.toml.bak`,
  `rc-qrcode.png`) — note `kimi-residue-files.md` (364 L, three member
  sections, internals level): 9/9 `wd_*` key recomputations from
  `workspaces.json` roots (the discriminating case: `Projects` →
  `wd_projects_…` proves the case-folding), the tui 1-byte diff re-verified
  with the `cmp -l` positional-diff trap recorded, and a strict PNG shape
  census (payload deliberately not decoded).
- **`kimi-census.mjs` K5 + always-on root enumeration** (896 L, 43 selftest
  cases): `KIMI_CENSUS: CLEAN (members=49 checked=49)` with
  `root children=37 declared=25 chain=12 strays=0`; the `--root-enum` flag
  is now a usage refusal (no escape hatch — the frozen rule); secrecy
  re-proven by strace (directory opens only, zero secret-path occurrences).
- **`proxy-check.mjs` K-block derivation** (92/92 selftest, +21 K cases):
  stanza keys `C1k=5`, `C1k_total=5`, `K_members=49` (live),
  `K_sections=24`, `coverage_kimi=4`; `--kimi-root` with
  `KIMI_ROOT_NOT_A_DIR` fail-closed; `pin.proxy-check` re-pinned and
  `pin.kimi-census` added; `## Axes` gained the row.
- **First measurement: `coverage:kimi-layer` = 4**
  (`floor(10 × 5/5 × 24/49)`) — five live axis integers now: operability 8,
  coverage:script-layer 6, coverage:runtime-layer 7, coverage:kimi-layer 4
  (plus the retired terminal 10).
- **Label collisions repaired**: `kimi-session-state.md` and
  `kimi-binary-secrets.md` title lines carried wave-1-era K4/K5 self-labels
  from before the K numbers were frozen — corrected to K3/K4 (the K5 lane
  caught it; the residue note records the collision in its Scope section).

## Defects recorded

- **Stale stanza, self-caught (the round's real lesson):** the C2 stanza
  value went un-re-pinned in round 19 (declared 60; the tree already read
  61 after the round-19 lesson row). Round 19's close listed the proxy
  DRIFT causes as "layer terms only" — incompletely. Round 20 re-pins
  C2=63/63 and records the durable rule: at round close, capture the FULL
  drift line, not a summary of it — and count README rows with the gate, not
  from memory: round 20's first pin wrote 62 for +2 rows on a 61 base
  (skipped one), and the gate's own `C2_DRIFT delta=+1` caught exactly the
  uncounted row. The M3 lane's deviation report surfaced it ("C2 61/62 drifts") — a lane reading the stanza literally caught what
  the integrator's summary glossed.
- **Occurrence-vs-distinct limit (recorded, queued):** 24 K-sections name 17
  distinct members (`config.toml` heads 5 sections in `kimi-config-plane.md`)
  — the same hole the round-17 critic found in the S/R numerators; the
  distinct-member term reads 17/49 ⇒ 3. Definition kept as frozen
  (distinct (note,heading) pairs) — changing it in the measuring round is
  the exact failure mode rounds 15→16 refused; the tightening lands with
  its own before/after in a later round.

## Gate

- ## Gate
  - What would falsify this lesson: a stanza key the tool does not verify, a
    K-member count not reproducible from `~/.kimi-code`, or an axes integer
    the derivation does not recompute.
  - Re-run: `node scripts/kimi-census.mjs` → `KIMI_CENSUS: CLEAN
    (members=49 checked=49 chain=12 info=4)` exit 0; `node
    scripts/proxy-check.mjs --src ~/Projects/ufo-fsd-alpha` → **K terms and
    legacy terms MATCH** (A=6, C=11, C1=19/19, C2=63/63, C1k 5/5, K 24/49,
    coverage_kimi 4, pins=6 match), layer terms DRIFT (carried debt,
    unchanged — and the drift line contains *only* those six layer terms:
    the full-line capture rule applied at this close); `--selftest` 92/92
    and 43/43; `node scripts/cite-check.mjs
    --src … --json` → 0 errors in every `kimi-*` note (verified after
    integration — the round-19 self-sweep rule).
  - Carried debt unchanged: the OMP-side re-census remains parked with the
    S2 move; the checklist's three origin-dependent items fail closed on it
    (7/11 pass; the census item is green).
