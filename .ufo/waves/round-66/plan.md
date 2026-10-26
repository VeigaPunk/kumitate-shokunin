# Round 66 — plan (frozen before any wave seat was dispatched or scored)

Round: kumitate 66, attempt 1, L1 `KumitateR66`. Base revision `8d557f85312de4fcc82e09ff735d21436bc3746d` (branch `master`,
ahead=0; the round-65 non-author spot-check commit). Frozen 2026-10-27. These sentences are the claims; the same words appear in
the counters' code and in the receipts' labels. Committed before the first `.ready` marker (QUALITY Q58).

## Axis state and nudge

Owned axes (SCORECARD `## Axes`): operability 9 (terminal integer of the saturating `f_O` proxy — it cannot reach 10), coverage
retired at 10, coverage:script-layer / runtime-layer / kimi-layer 10. The last capability row entered in round 64; round 65's
`harm-matrix` is still missing its row (routed D2). Stagnation window N = 3, so the nudge is **not** active and the lowest-axis
obligation stands: **C1 works operability**, the lowest non-retired axis. **C2 works the coverage frontier** (sourced claim).
No score integer can move; each verdict is its frozen counter. No axis may be harmed.

Base state (receipts in `base/`): `readme-map` DRIFT (`files=160 rows=159`, the round-65 spot-check row — routed D7), repaired in
this freeze commit as maintenance, not claimed. `proxy-check` FAIL-CLOSED at first run because the pinned origin clone under
`/fast/scratch/hyaku/kumitate-pin/src` had been reaped (`base/proxy-before-src-reaped.txt`); recreated with the command recorded in
`.ufo/pins/origin.json`, it reads DRIFT (`base/proxy-before.txt`: A, C2, C2_total, K_members, K_sections, AXES coverage, PIN_UNPINNED)
— carried (D4), refreshed at the close if the refresh is measured. Census exit 0 with the six carried W04 warnings.

## C1 — operability, capability acquisition `routed-ledger`

**Surface it moves:** a new gate, `scripts/routed-ledger.mjs` (contract `kumitate-routed-ledger-v1`, tool v1 committed at this freeze,
33-case selftest), and its data, `corpus/routed-ledger.md`. Every non-author spot-check routes defects back to the lane in one section;
the answers are scattered across later lessons, SCORECARD sections and reports, and nothing counts them, so one class (README map drift,
R56-V3 family) recurred eleven times and round 65 left seven routed items (D1–D7). The gate binds every routed item of the spot-checks in
rounds 55..65 (57 items in 11 sections at base) to a ledger row by a located quote, binds every answered row to a located answer line, and
counts class recurrences (`considerthese/2026-10-25.md` ideas 4 and 5). Command that shows it unmoved:
`test -e scripts/routed-ledger.mjs` and `test -e corpus/routed-ledger.md` at the base revision (both absent).

**Frozen predicate `LEDGER66_HELD`** (rule L66 v1, checks L1..L6), measured over `git archive M`:

- L1 — `node scripts/routed-ledger.mjs --selftest` prints `ROUTED_LEDGER_SELFTEST: PASS (n/n)` with n >= 30, exit 0.
- L2 — the tool on the lane at M (`--rev M --from 55 --to 65 --classes`) exits 0 with `ROUTED_LEDGER: CLEAN spotchecks=11`, `items=`
  equal to the counter's own independent item count, and rows >= items.
- L3 — the counter's own re-verification of the ledger (independent of the tool): every item of rounds 55..65 has a row whose quote is
  located in it; every closed/wontfix answer quote is located at its `path:line` (±2) outside the ledger and the spot-checks; **every
  round-65 item (D1–D7) has a closed or wontfix row whose answer line is new since the base** (answered this round); >= 5 distinct
  classes; >= 1 class spans >= 4 distinct spot-check rounds.
- L4 — 14 held-out fixtures generated at counting time from random tokens (no answer key exists to read): the tool's exit code and
  finding id / item count match for every mutant (dropped row, swapped or decoy quote, wrong / self-pointing / past-EOF answer, duplicate
  id, ordinal past the section, nested bullet and trailing prose treated as items, over-long quote, a spot-check without a routed section,
  ledger absent).
- L5 — the counter can fail: an always-CLEAN stub and an always-DRIFT stub both miss the L4 harness; counts only where the real tool passes L4.
- L6 — registry home in the same revision: a `SKILL.md` table row names `routed-ledger.mjs`; `corpus/QUALITY.md` names `routed-ledger`;
  `SCORECARD.md` `## Capabilities` has a row whose first cell names `routed-ledger`.

**Counting command:** `node .ufo/waves/round-66/probe/ledger66-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>`
→ `LEDGER66_HELD held=6/6 checks=6 rev=<M> rule=L66` exit 0.
**Kill rule:** any check MISS → the claim fails as declared. A rule changed after any seat scored is not this claim's rule.
**Ratchet (declared now, monotone):** a wave finding that the tool mis-reads a real section (an item missed, a non-item counted, a quote
or answer accepted that should not be) is fixed in the tool with a new selftest case — a strengthening, never a relaxation. The counter,
its controls and this plan are pinned in `.ufo/pins/counter-pins.json` at this freeze and never edited.

**Before (base `8d557f85`):** `LEDGER66_UNMET held=0/6` exit 1 (`base/ledger66-base.txt`).
**Do-nothing controls (committed, scored before any seat):** `probe/c1-controls.sh donothing` — the freeze tool + an empty ledger
skeleton + the three registry-home lines → `held=4/6` UNMET (`base/ledger66-donothing.txt`); `probe/c1-controls.sh autoledger` — the
same plus one machine-generated open row per item (first words, one class) → `held=4/6` UNMET (`base/ledger66-autoledger.txt`; L2/L3 miss).
**Stated limit (declared now):** the counter verifies bindings, not adequacy: an answer line that quotes itself as an answer passes L3
if it is new and located; whether an answer really answers the item is the non-author closure's judgment. Round 59's routed section is
prose (0 items) and its one orchestrator note is not ledgered. Item ordinals assume the spot-checks stay append-only.

## C2 — coverage frontier: the MCP deprecation registry and the installed OMP release (sourced claim)

**Surface it moves:** `PROVINCE.md` frontier band "MCP protocol revisions as they bear on orchestration" ("other MCP revision families
remain queued") gains the lane's first entry on the **deprecation registry**: `corpus/knowledge/mcp-deprecation-registry.md`, grounded on
rows opened this round (access date 2026-10-27) — the 2026-07-28 Deprecated Features page, the feature-lifecycle policy, and the installed
OMP release's own legacy SSE transport at tag `v18.12.6` — and read against the host: the installed release ships `transports/sse.ts` and
declares the `roots` client capability, both deprecated in the registry (HTTP+SSE: earliest removal "Three months after SEP-2596 reaches
Final"; Roots: "First revision released on or after 2027-07-28"). It enters through the assimilation theme "MCP deprecation registry and
its clocks" of `merge/kumitate/` (staged `mcp-feature-deprecation-registry`, `mcp-deprecation-removal-state-2026-10-25`,
`mcp-deprecation-registry-timing-2026-10-27`, `sep-2596-*`) — one entry, re-grounded on rows opened in round 66, never copied. Command that
shows it unmoved: `test -e corpus/knowledge/mcp-deprecation-registry.md` at the base (absent).

**Frozen predicate `DEPREC66_HELD`** (rule M66 v1, checks M1..M8), over `git archive M`: M1 provenance trio (>= 3 S-ids,
`verified-at: 2026-10-27`, `recheck:`); M2 every source row new since the base, 11 cells, `mined`, opened 2026-10-27, URL, tier A/B,
used-by the entry; M3 every row bound to a committed capture (sha256 + size); M4 >= 6 located quotes (<= 25 words) found in the captures,
every row quoted, one quote with `2027-07-28` and one with `Three months after`; M5 every quote re-found in a live fetch; M6 the entry's
`## Registry snapshot` table has exactly as many rows as the captured Deprecated table (>= 5) and carries every row's `Deprecated in` and
`Earliest removal` cells; M7 a `## Bearing on the installed OMP release` section cites one of S201–S206, names `roots` and `HTTP+SSE`, and
one cited new row is `sse.ts` at `/v18.12.6/`; M8 census exit 0, `sources-check` CLEAN, `source-capture` CLEAN, `readme-map` CLEAN, a
PROVINCE frontier line names the entry.

**Counting command:** `node .ufo/waves/round-66/probe/deprec66-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>`
→ `DEPREC66_HELD held=8/8 checks=8 rev=<M> rule=M66` exit 0. **Kill rule:** any MISS → fails as declared; same no-retroactive-change rule.
**Before:** `DEPREC66_UNMET held=0/8` exit 1 (`base/deprec66-base.txt`). **Do-nothing control:** `probe/c2-donothing.sh` — the staged entry
copied byte-for-byte plus a PROVINCE line → `held=0/8` UNMET (`base/deprec66-donothing.txt`).
**Stated limit:** the counter measures an evidence chain and a live re-fetch; it cannot tell a sound reading from a well-grounded wrong one;
presence of `sse.ts` and a `roots` declaration in source is not proof the host uses them at run time.

## Frontier step, assimilation, routed defects (inside the claim cap; not claims)

- **Census** before (`base/census-before.txt`, exit 0, six W04) and after, pasted in the report.
- **Assimilation:** ONE theme (C2). Collision guard + proof-of-failure fixture and quarantine slice re-derived in `assimilation/`. The
  lesson's `## Gate` records >= 1 admit and >= 1 reject from the theme's staged set.
- **considerthese:** `2026-10-25.md` ideas 4 (count recurrences) and 5 (deferral ledger) are the substance of C1; one proposal per round
  → idea 5 is the one taken (idea 4 was taken in round 65 but its script never landed; C1 lands the counting).
- **Mistake mined (§2b.3):** candidate — routed items lost between rounds (round 65 filed "the lesson's Gate carries URL, date and quote per
  row" while S205/S206 had no Gate record, D1); captured-by: none until C1.
- **Routed R65 defects** D1–D7 answered in `corpus/routed-ledger.md` rows with located answers (this is L3's round-65 clause).
- **Open work carried from round 65 (D6):** the 40-seat falsify wave that never ran — its items ride this round's wave (re-open S201–S206,
  mutate `harm-matrix`, forge H65/O65).

## Round shape

One v2 wave (policy `ufo-wave-policy-v2.json`, band 64–128) carrying build and attack items together, seats prefixed `K66`; attack roles
(reviewer, critic, mutation-tester, labrat) >= 25%; a few connector seats. Optionally one residual call of <= 8 reviewer/critic seats
after integration (attacks on M), counted in the round total (<= 128). Planner seat: the L1 (the validator rejects `planner`).

## Write scope

Lane repo only: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Seats write only their report (`.ufo/waves/round-66/w1/<Seat>.md`) and
build artifacts under `.ufo/waves/round-66/build/<Seat>/`; scratch under `/fast/scratch/hyaku/kumitate-r66/<Seat>/`, deleted on exit. The L1
is the sole integration owner of `scripts/`, `SCORECARD.md`, `corpus/`, `PROVINCE.md`, `LOG.md`, `SKILL.md`, `.ufo/pins/`.
