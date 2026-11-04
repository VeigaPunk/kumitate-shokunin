# Candidate 4 — `cite-check` carried red: count and error classes

Seat K87Scout, read-only. Command: `node scripts/cite-check.mjs` (default `--self` = lane, default `--fleet`
= lane's parent). Raw outputs in `build/K87Scout/raw/`.

## Current count

- Live working tree (dirty, uncommitted round-87 files): `node scripts/cite-check.mjs` → exit 1,
  `CITE_CHECK: DRIFT (files=225 tokens=14693 errors=2304 warnings=946)`. Raw: `raw/cite-check-live-worktree.out`.
- Freeze commit `25a3a75df123a59c5cf0de944a6d2f067e278f82` (clone):
  `node scripts/cite-check.mjs --self <clone> --fleet /home/vgpnk/Projects/shokunin` → exit 1, `errors=2304`.
  Raw: `raw/cite-check-freeze-25a3a75.out`.
- Base `db97929212bb61ae970b10abac3cc4cd976713ae` (clone, same explicit `--fleet`): `errors=2304`.
  Raw: `raw/cite-check-base-db97929-fleet-explicit.out`.
- Disclosure: my first base run used the clone's default fleet (the scratch dir), which produced
  `FLEET_MISSING` 119 and `errors=2677`. That number is an artefact of my invocation, not of the base tree.
  Raw kept as `raw/cite-check-base-db97929-DEFAULT-FLEET-ARTIFACT.out`.

Error-line census (`grep -E '  ERROR ' cite-check.out | sed … | sort | uniq -c`): UNRESOLVED 1866, LINE_OOR 232,
PIN_MISMATCH 137, REV_UNKNOWN 69 (sum 2304). Identical at freeze.

## Top three classes

### 1. UNRESOLVED — 1866 occurrences, 975 distinct tokens (81% of errors). Mixed, with one systematic part.

Measured split (`raw/cite-check-unresolved-tokens-occurrences.txt`, one line per occurrence, commands in report):

- **Round-relative artefacts (systematic):** 1143 occurrences resolve to an exact path under some
  `.ufo/waves/round-*/` (checked with `compgen -G`); 1090 by first-segment prefix heuristic (`close/`, `w1/`,
  `controls/`, `probe/`, `base/`, …). Root cause in code: `scripts/cite-check.mjs:121`
  `EXCLUDE_DIRS = new Set(['node_modules','.git','target','.ufo'])`, applied in `walk` at `:290`, so
  `buildIndex(opts.self, 8)` (`:1538`) never indexes `.ufo/waves/`. Only the 24 occurrences that exist at lane
  root or under `kimi` resolve elsewhere.
- **Dead remainder:** 699 occurrences / 420 distinct tokens (`raw/cite-check-unresolved-tokens-dead-distinct.txt`):
  603 occurrences are **bare basenames** (no slash; e.g. `plan.md`, `sources-census.sh`, `atomic-write.mjs`) —
  a name in prose with no resolvable place; 48 are ellipsis-elided (`…/corpus/SOURCES.md`); 8 are hash-prefix
  elisions (`45c35e40…/`).

### 2. LINE_OOR — 232 occurrences (10%). Systematic in one file.

`fleet-dispatcher.mjs` line refs: 74 (`fleet-dispatcher.mjs`) + 9 (`scripts/fleet-dispatcher.mjs`) = 83 of 232
(36%); `collect-omp-native-handoff.mjs` 10. Example: `SKILL.md:136` `scripts/fleet-dispatcher.mjs L12086` against
a 9,523-line file (`SKILL.md:136` error line). These cite pinned line numbers in the origin tree that no longer
match the resolved file.

### 3. PIN_MISMATCH — 137 occurrences (6%). Mixed.

Short content pins against lane files, e.g. `corpus/SOURCES.md:192` `ae87bdab` vs
`corpus/knowledge/receipt-age-on-the-compare-path.md`; `corpus/SOURCES.md:253` `5a5be7b6` vs `.omp/mcp.json`.
The most repeated single token occurs 4 times (`ba5e02be`); the rest are singletons or pairs. Not one class.

## Round-88 pre-registration candidate

Partition the 1866 UNRESOLVED occurrences by the rung that should resolve them (round-relative wave index vs.
prose-only basename vs. elision) and measure the red count after each partition is either indexed or
classified. The round-relative part is the only one with a single code cause (`:121`, `:290`).
