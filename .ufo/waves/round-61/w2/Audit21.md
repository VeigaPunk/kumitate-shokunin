# Audit21 — Round60-Readme: verifier-spotcheck README row + covered pin; readme-map & cite-sources gates

Seat: `L1Kumitate61.Audit21` (reviewer, leaf member — no subagents). Scope: verify
`corpus/lessons/round-60-verifier-spotcheck.md`'s README map row and its `covered`
pin; run `readme-map` and `cite-sources`; name remaining drift. Read-only on lane
files; scratch `/tmp/kumitate-r61/Audit21` (unused — all evidence inline). No tool
installs (pacman paused); node v24.21.0, git, python3.

## Verdict: row + pin present and faithful; both gates CLEAN in the working tree; residual drift = the repair is still uncommitted and the proxy stanza is stale (in-flight, integration-owned).

## 1. Spotcheck file, row, pin — all present

- File: `corpus/lessons/round-60-verifier-spotcheck.md` exists, **committed** at
  `3304337` ("round-60 verifier spot-check (integrator, hyaku)", `git log` on the
  file). Headed `# Round-60 verifier spot-check — non-author`, author line `hyaku
  closure (non-author integrator, @m_flash)`; step-1 conformance table, C1/C2
  re-derivation, 6-row discernment table, R60-V1..V9 routed defects.
- README row: `corpus/README.md:181` (uncommitted working-copy diff). Directly
  follows the `lessons/round-60.md` row at :180 — same placement the prior
  verifier-spotcheck rows use.
- Covered pin: `.ufo/pins/readme-map.json:143` `"lessons/round-60-verifier-spotcheck.md"`
  between `lessons/round-59-verifier-spotcheck.md` (:142) and `lessons/round-60.md`
  (:144); registry `version: 2`, `covered_len=148 unique=148`, no dup, JSON parses.
  R60-V8's prescription (row + `covered` entry) is satisfied in the tree.

## 2. Gates run (working tree, this seat)

```
$ node scripts/readme-map.mjs
README_MAP: CLEAN files=148 rows=148 covered=148            exit 0
$ node scripts/readme-map.mjs --selftest
README_MAP_SELFTEST: PASS (16/16)                            exit 0
$ node scripts/cite-sources.mjs
CITE_SOURCES: CLEAN cited=179                                exit 0
$ node scripts/cite-sources.mjs --selftest
CITE_SOURCES_SELFTEST: PASS (8/8)                            exit 0
```

Independent bimap cross-check (not the gate): `comm -3` of first-column paths vs
`find corpus/{knowledge,lessons} -name '*.md'` yields only `lessons/round-<N>.md`
— an inline-code mention in prose at `corpus/README.md:254`, not a table row
(gate counts `^| ` rows only; correct). 148 = 146 committed + 2 untracked
(`lessons/round-61.md`, `knowledge/temporal-worker-versioning-pinning.md`), and
both already carry a row (:183, :182) and a pin (:145, :56).

Script-integrity: `sha256sum scripts/readme-map.mjs` = `b1c8bf97…` = pin entry
`pin.readme-map` in the `kumitate-gate-pins-v1` stanza (`SCORECARD.md`) **and**
`counter-pins.json` (`"readme-map"`, round 58). `scripts/cite-sources.mjs` sha256
`7211be84…` = `pin.cite-sources` in the gate-pins stanza (it is not in
`counter-pins.json`, which covers only the named registry — by design). Both
gates were exercised on their pinned bytes.

## 3. Row fidelity — claims re-derived, no mis-statement found

| Row claim | Evidence |
|---|---|
| `held=8/10` receipt at `a745a3b0` | `.ufo/waves/round-60/close/dispatch60-work.txt:1` — `DISPATCH60_UNMET held=8/10 … rev=a745a3b0e…` with `A7 MISS row-absent`, `A10 MISS … wave-dir-absent` |
| `swarm-registry.json` object-shaped | spotcheck file :61-66; gate reads `dispatch-actual.json`, launcher wrote `members` as object |
| rows 126→133, duplicate pinned | spotcheck §2 (`SOURCES.md` 133 rows at `a745a3b0`, base 126; `source-dupes.json` group 6, S117/S126) |
| AGREE 6/6 | spotcheck §3 table: 2 admits + 2 rejects re-opened, all `agree` |
| R60-V1..V9 | spotcheck §5 lists exactly nine routed defects, summaries match |
| report path `.ufo/reports/round-60/kumitate.md` | resolves at **fleet** root `/home/vgpnk/Projects/shokunin/.ufo/reports/round-60/kumitate.md`, committed `7b0581ed` by `kumitate-shokunin <kumitate@shokunin.local>` — matches the row's convention; lane `.ufo/reports/` holds only round-33 (the fleet path is the canonical report location) |
| "Row added in round 61 (R60-V8)" | true: `git show HEAD:corpus/README.md` and `HEAD:.ufo/pins/readme-map.json` each grep 0 hits for `round-60-verifier`; the file is committed, its map coverage is not |

Wave-1 reviewer `RevReadmeMap` flagged `cite-sources` DRIFT (ghost `S141`/`S211`
in the row's prose). **Repaired**: `grep -n 'S14\|S21' corpus/README.md` → 0
hits; current row text carries "package-id crosswalk" instead of the bare ids;
`CITE_SOURCES: CLEAN` confirms. That wave-1 finding is stale w.r.t. the current
tree.

## 4. Remaining drift (named, all integration-scope not row-scope)

- **HIGH — repair uncommitted.** At HEAD (`be4a820` lineage: file landed `3304337`,
  row/pin did not) the tree reverts to `files=146 rows=145 covered=145` DRIFT —
  RevReadmeMap's pre-repair baseline. `git status --porcelain`: `M corpus/README.md`,
  `M .ufo/pins/readme-map.json` (+ `corpus/{QUALITY,SOURCES}.md`, `PROVINCE.md`,
  `.ufo/waves/round-61/{plan.md,build/,close/,controls/,build-wave2.mjs}`,
  `.ufo/waves/round-60/close/dead-seats-r60.md`, and untracked
  `corpus/lessons/round-61.md` + `corpus/knowledge/temporal-worker-versioning-pinning.md`).
  Same failure shape as R60-V1: the fix exists only in the working copy until a
  scoped close commit lands.
- **HIGH — proxy stanza not refreshed (R60-V8's third clause).**
  `node scripts/proxy-check.mjs` → exit **1**:
  `PROXY: DRIFT (A_DRIFT declared=105 computed=115 +10; C2_DRIFT declared=145
  computed=148 +3; C2_TOTAL_DRIFT declared=145 computed=148 +3; PIN_UNPINNED
  scripts/make-dispatch-actual.mjs; src-rev=31c465f15669)`.
  Stanza `SCORECARD.md` `kumitate-proxy-v1` still declares `C2=145`,
  `C2_total=145`, `A=105`. Both the w1 fixer (`ExecReadmeMapFix`) and reviewer
  (`RevReadmeMap`) prescribe `C2=146→now 148`, `C2_total=148`, plus whatever `A`
  settles at — in-flight while wave-2 seats land. `AXES_DRIFT` observed cleared
  by the row addition in w1 (coverage derived 10 again); not re-measured now.
- **LOW — `PIN_UNPINNED scripts/make-dispatch-actual.mjs`.** Present in
  `scripts/` since w1, absent from both pin stanzas; warning only, suppressed
  once integration either pins it in `kumitate-gate-pins-v1` or routes it
  elsewhere.

## 5. Residual risk / gaps

- `readme-map`/`cite-sources` verdicts are **working-tree** verdicts; a discard
  of the uncommitted diff reopens DRIFT. Operability of the fix is demonstrated
  only by the in-flight diff, not a landed object.
- `cite-sources` still has no escape syntax — any future row prose quoting an
  `S###` defect label re-reds the gate (class reopened once already by this row).
- Not re-run (out of scope / settled by others): `round-gate.mjs`,
  `counter-pins.mjs` selftest, `sources-census.sh`, the dispatch61/doctrine61
  probes. `proxy-check` run here is the residual-drift measurement, not an
  acceptance signal for this row.
- `.ufo/reports/round-60/kumitate.md` row citation resolves fleet-side only;
  readers inside the lane checkout must step up one directory — consistent with
  every prior report citation convention, noted not scored.
