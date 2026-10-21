# ATTACK scripts/ufo-watchdog-repend.test.mjs verdict=holds defects=2

Target: the re-anchored S8 member section `## `scripts/ufo-watchdog-repend.test.mjs``
(census.md:810-812, round-35 edit vs base master `1770305fae20826b39905a8251ddeca6b4957ac4`).
Upstream read ONLY via the pinned clone `/fast/scratch/kumitate-r35/src` (detached at
`31c465f15669f744848bd9f5d56191c5085670f7`; base `964f443e` via `git show`). Axes named:
coverage:script-layer (attack axis), operability (collateral — the section feeds the
S_sections distinct-identity claim C1). No lane files edited; no tools installed (none
needed; nothing to record). Scratch: /fast/scratch/kumitate-r35/w/SecUfoWatchdogRependTest/.

## Population-table row vs wc -l at the pin

- Census:181 `| `scripts/ufo-watchdog-repend.test.mjs` | 422 | suite |` — read verbatim.
- `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-watchdog-repend.test.mjs | wc -l` → **422**. MATCH.
- Base master row (master:161) said 364; `git show 964f443e:scripts/ufo-watchdog-repend.test.mjs | wc -l` → **364** (base value was correct at 964f443e; the round-35 edit updates the cell without an inline "was" trail — see D1).
- `git diff --stat 964f443e 31c465f1 -- scripts/ufo-watchdog-repend.test.mjs` → 74 changed lines (+66/−8 → net +58 = 364+58=422). Consistent.

## Anchor-by-anchor verification at 31c465f1

Every `:N` anchor in census.md:812 read verbatim at the pin:

| Census claim (census:812) | Pin line read | Verdict |
|---|---|---|
| `MAX_ATTEMPTS` (`scripts/ufo-watchdog-repend.test.mjs:16`) | `MAX_ATTEMPTS,` (member of the import block 15-25) | ok |
| `STABLE_REFUSAL_REASONS` (`:17`) | `STABLE_REFUSAL_REASONS,` | ok |
| `decideRow` (`:18`) | `decideRow,` | ok |
| `extractRependReport` (`:19`) | `extractRependReport,` | ok |
| `manifestClassFor` (`:20`) | `manifestClassFor,` | ok |
| `normalizeState` (`:22`) | `normalizeState,` | ok |
| `rowSignature` (`:23`) | `rowSignature,` | ok |
| `runRependCycle` (`:24`) | `runRependCycle,` | ok |
| local `test` runner (`:31`) | `function test(name, fn) {` | ok |
| fixed `NOW` (`:42`) | `const NOW = 1_757_200_000;` | ok |
| `row` factory (`:43`) | `const row = (over = {}) => ({` | ok |
| `fakeSpawn` (`:53`) | `function fakeSpawn(report) {` — pushes into `calls`, returns `spawnImpl` that replays `JSON.stringify(report)` on stdout (53-60; the old `:47` content moved +6) | ok |
| `STABLE` (`:62`) | `const STABLE = { repended: false, reason: "mission_stale_registered" };` | ok |
| end-to-end case `main_end_to_end_scratch_suppresses_then_manifest_change_resets` (`:333`) | `test("main_end_to_end_scratch_suppresses_then_manifest_change_resets", () => {` (333-373; full body read) | ok |
| sets `UFO_STATE_DIR` to a scratch root (`:345`) | `const env = { ...process.env, UFO_STATE_DIR: dir };` | ok |
| "suppression on a second tick" | `assert.ok(t2.stdout.includes("suppressed"), ...)` at :358 | ok |
| "reset after a manifest change" | `writeFileSync(manifestPath, JSON.stringify({ missions: [] }))` :363; `assert.ok(!t3.stdout.includes("suppressed"), "manifest change resets suppression")` :366 | ok |

All 15 anchors byte-verified at the pin. Gate cross-check: `node scripts/claims-check.mjs
--src /fast/scratch/kumitate-r35/src --row S8 --json` → verdict MATCH; this section reports
`anchors:15 live:true symbolHit:true inFamily:true` and 60/60 S8 sections live+symbol-hit.
`node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --symbols --json` filtered
to census lines 806-812: 31 findings, 0 non-ok.

## Prose claims beyond anchors (behavioral)

- "Pins cover stable-refusal suppression with row/manifest-change reset, transient retry,
  success counting, the attempt cap and legacy state migration" — all present in the pin:
  suppression+reset `:137-160`, `:187-215`; transient `:173-179`; success `:217-225`;
  attempt cap `:181-185`, `:227-237`; legacy bare-number migration `:91-97`. ok.
- Semantic delta vs master paragraph: the pin's decision surface also validates v2 members
  (`normalize_state_validates_v2_members_fail_closed` :99-118), suppresses on future
  refusal stamps (:162-171), skips rows carrying an iteration outcome (:128-135), bounds
  failure tails (:307-320), parses the manifest once per cycle (:375-391), and anchors
  module-root defaults (:413-418). None of these contradicts any census sentence — the
  census is silent on them, and silence is not a false claim.

## Defects (2, both minor / cosmetic)

### D1 — round-35 line-count change left no "was" trail in the table row
- census.md:181 now reads `422` with no history note; 10 of 11 siblings that changed
  length this round carry `; was N @ 964f443e` (e.g. land-fleet-run 133 L; was 124 at
  census:596; ufo-state-census 219; was 184 at census:762) — including this member's own
  sibling section `ufo-watchdog-repend.mjs` (428 L, no `was` trail either at census:180).
  The `was 364` value is recoverable only from the base master tree.
- Command: `awk 'NR==181' corpus/knowledge/remaining-scripts-census.md` and the master
  row at master:161 (`364`).
- Minimal fix: in the row cell or the section prose add `(was 364 @ 964f443e)`, mirroring
  the convention used by the other re-anchored rows.

### D2 — re-anchor trail dropped the old STABLE refusal literal (trace gap)
- Master prose (master:845) ended its fixture list with "`STABLE` (`:56`) is the
  `mission_stale_registered` refusal". The new paragraph (census:812) cites `STABLE`
  (`:62`) but no longer names `mission_stale_registered` anywhere — the only mention of
  the suite's stable refusal class vanished with the rewording (grep on census:812 → 0
  occurrences; master paragraph → 1). The removed clause names real pin behavior (the
  fixture still exists verbatim at `:62`), and the suite-neighbor section
  `ufo-watchdog-repend.mjs` still names it (`mission_stale_registered` at census:808), so
  the note remains self-consistent — a trace gap, not a false claim.
- Command: `awk 'NR==812' corpus/knowledge/remaining-scripts-census.md | grep -c mission_stale_registered` → 0;
  `git show master:corpus/knowledge/remaining-scripts-census.md | awk 'NR==845' | grep -c mission_stale_registered` → 1.
- Minimal fix: append `the `mission_stale_registered` refusal` after `STABLE` (`:62`)` in
  census:812, or a `(round 35: removed the named stable refusal class — reworded)` marker
  in the ExecS8Fidelity style.

## Revision-label and removed-clause checks

- Revision labels: this section is prose (not short-form), so it never carried the
  "re-censused 2026-10-14" label; the label itself is correctly absent (it would be false
  as a date for the round-35 re-anchor). Note-level history lives in the header
  (2026-10-14 re-census at 964f443e, historical; pinned 2026-10-20 re-census at 31c465f1)
  and in the new `## Departed members (re-census 31c465f1, 2026-10-20)` block.
- Removed clauses: no behavior described in the master paragraph disappeared —
  suppression, row/manifest-change reset, transient retry, success counting, attempt cap
  and legacy migration are all still pinned at 31c465f1. No `(round 35: removed ...)`
  marker was needed here; the two reworded sentences above carry only the D2 trace gap.
- New false claims: none found. Every named symbol/line exists at the pin and the
  behavioral sentences match pin bodies.

## Runtime cross-checks (pinned code exercised)

- `node scripts/ufo-watchdog-repend.test.mjs` from an archive copy of the pin (writable;
  `git -C /fast/scratch/kumitate-r35/src archive 31c465f1 scripts | tar -x` under
  `/fast/scratch/kumitate-r35/w/SecUfoWatchdogRependTest/`) → **29/29 pass**, exit 0
  (the two extra tests vs 964f443e's 26/26 are `manifest_reader_parses_once_per_cycle`
  and `a FIFO queue is a typed unreadable tick, never a hang`; the pin's header comment
  :2 numbers 29 cases). Note: the pin's clone itself is mode 555 without `.ufo/`, so the
  FIFO test ENOENTs there — the suite self-skips nothing and prints 27/29 with exit 0 in
  the read-only clone; a scratch `.ufo` is needed for the last two tests.
- Wave-1 input for this member (FidUfoWatchdogRependTest.md, "anchors=14 ok=14
  moved=0 changed=0 gone=0") verified independently: all 14 rows re-derived here from
  raw `git show` reads agree with its verdicts (same line moves, identical bodies at the
  pin). Its optional improvement ("append once-per-key cap logging") was NOT taken by the
  integrated note — census:812 still says only "the attempt cap", a missed free
  improvement, not a defect (the sentence remains true).

## Residual risk / verification gaps

- The census paragraph claims about pin behavior were checked by reading pinned bodies;
  no test was written, no build/lint run. The suite was run only from an archive copy in
  scratch (read-only pin clone cannot take the FIFO fixture's mkdtemp).
- LSP device unavailable (not present in this session's tool inventory); symbol checks
  were done by pinned-source reads plus the lane's own `cite-check --symbols` gate.
