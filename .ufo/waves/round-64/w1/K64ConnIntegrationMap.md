VERDICT: A 6-step integration sequence with exact line anchors across 8 files repairs base proxy drift (C2 153→156, coverage 9→10) and safely lands claims C1 and C2 without breaking any intermediate gate.

## Evidence

- `node scripts/proxy-check.mjs` (at base revision `6825a514`):
  ```
  PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=153 computed=154 delta=+1
  PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
  PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=153 computed=154 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)
  exit=1
  ```
- `node scripts/readme-map.mjs` (at base revision `6825a514`):
  ```
  README_MAP: note unpinned:lessons/round-63-verifier-spotcheck.md
  README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md
  exit=1
  ```
- `node scripts/proxy-check.mjs --self <clean-archive-HEAD>`:
  ```
  PROXY  error  A_DRIFT  A: declared=257 computed=263 delta=+6
  PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=153 computed=154 delta=+1
  PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
  PROXY  warn  PIN_UNPINNED  scripts/report-receipt-diff.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
  PROXY: DRIFT (A_DRIFT term=A declared=257 computed=263 delta=+6; C2_TOTAL_DRIFT term=C2_total declared=153 computed=154 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/report-receipt-diff.mjs; src-rev=31c465f15669)
  ```
- `node scripts/sources-check.mjs` (live base):
  ```
  SOURCES_CHECK: CLEAN (rows=136 tiers=A:113,B:15,C:8 status=queued:13,mined:104,rejected:19 entries_with_source=20 legacy=38)
  ```
- `node scripts/source-capture.mjs` (live base):
  ```
  SOURCE_CAPTURE: CLEAN captures=29 exemptions=107
  ```
- `node scripts/source-dupes.mjs` (live base):
  ```
  SOURCE_DUPES: CLEAN groups=6 known=6
  ```

## Findings

- `K64ConnIntegrationMap-1` (major, attacks base gate integrity): Unmapped `lessons/round-63-verifier-spotcheck.md` creates `C2_TOTAL_DRIFT` (153 vs 154) and drops derived coverage 10→9 (`AXES_DRIFT`).
  Reproduce: `node scripts/proxy-check.mjs` -> exit 1 (`AXES_DRIFT`, `C2_TOTAL_DRIFT`).
  Repair: Add map row to `corpus/README.md:189`, add to `.ufo/pins/readme-map.json`, update `SCORECARD.md:292-293` `C2=154`, `C2_total=154`.

- `K64ConnIntegrationMap-2` (major, attacks proxy gate strictness): `scripts/report-receipt-diff.mjs` triggers `PIN_UNPINNED` (drift under `--strict`) until registered in `proxy-check.mjs:GATE_PINS` and `SCORECARD.md:kumitate-gate-pins-v1`.
  Reproduce: `node scripts/proxy-check.mjs --strict` -> exit 1 (`PIN_UNPINNED`).
  Repair: Insert `'pin.report-receipt-diff': 'scripts/report-receipt-diff.mjs'` at `scripts/proxy-check.mjs:481`, declare `pin.report-receipt-diff` in `SCORECARD.md:332`, re-pin `pin.proxy-check` at `SCORECARD.md:308`.

- `K64ConnIntegrationMap-3` (critical, attacks inter-gate ordering): Cross-coupled dependencies among `corpus/SOURCES.md`, `.ufo/pins/source-captures.json`, `corpus/knowledge/jj-workspace-seat-containment.md`, and `corpus/README.md` fail closed if integrated out of order.
  Reproduce: Adding S198 before its capture fails `source-capture.mjs` (`S198:uncaptured`); adding S198 before entry fails `sources-check.mjs` (`USED_BY_MISSING`); adding entry before S198 fails `sources-check.mjs` (`ENTRY_SOURCE_UNKNOWN`); citing S198 in README before SOURCES.md fails `cite-sources.mjs` (`ghosts=1`).
  Repair: Ordered sequence: (1) captures on disk → (2) bind captures in JSON pin & append S198–S200 to SOURCES.md → (3) land entry & isolation-substrates amendment → (4) land lesson & README bimap.

- `K64ConnIntegrationMap-4` (major, attacks stanza accounting): At clean HEAD, runnable count `A` is 263 (+6 from 257 at base: 2 tools + 4 probe scripts), and note count `C2` moves to 156 (+3: round-63 spotcheck, jj entry, round-64 lesson).
  Reproduce: `node scripts/proxy-check.mjs --self <archive-HEAD>` -> `A_DRIFT delta=+6`, `C2_TOTAL_DRIFT delta=+1`.
  Repair: Update `SCORECARD.md` stanza: `A=263`, `C2=156`, `C2_total=156`.

## Artifacts

- `.ufo/waves/round-64/build/K64ConnIntegrationMap/integration-map.md`: Complete specification of files, numbers, exact line anchors, proof commands, and dependency-ordered steps.
- `.ufo/waves/round-64/w1/K64ConnIntegrationMap.md`: This scoped integration map report.

## Limits

- Did not edit lane-owned files outside build/report scope (L1 integration owner prerogative).
- Did not verify live external HTTP fetch for J5 (network-dependent in `jj64-probe.mjs --no-live`).
- Probes evaluate over `git archive <rev>`; uncommitted build/scratch artifacts were excluded from term calculations.
