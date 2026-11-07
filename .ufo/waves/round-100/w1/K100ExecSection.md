# K100ExecSection — R100 blind spots: section scope + row shape (report-only, round-101 input)

Seat K100ExecSection, 2026-11-07. Scope: measure what frozen rule R100 deliberately leaves out —
(a) id rows **outside `## Registry`** and (b) **row-shape** classes — for the two JS row readers
(`scripts/cite-sources.mjs:36`, `scripts/source-capture.mjs:157`) vs the fleet census `row_pass`
(`scripts/sources-census.sh:574-695`). Nothing under `scripts/`, `corpus/`, `probe/`, `controls/`,
`open/`, `plan.md` was modified; all writes are in `K100ExecSection/` and this report.

Provenance (receipts `ref/sha256.txt`): BASE = `git show 5e2f9856271525760ade3b08892f6df7601fa689:scripts/…`
— byte-identical to the lane worktree (`sha256` cite `7211be84…`, capture `39bdeb39…`; worktree==base verified),
so BASE == live lane behavior. Reference reader = `ctl-positive` regenerated with
`python3 .ufo/waves/round-100/probe/make-controls100.py <scratch>/ctl` (16 controls; `ref/controls-sha256.txt`
matches lane `controls-sha256.txt`; ref shas `865ba7e5…`/`59ca1a3b…`). Census: GNU Awk 5.4.1, bash 5.3.20;
tools: node v24.21.0.

## Method

16 fixtures (`fixtures/*.md`, all rows 11 cells/13 fields unless the class says otherwise, tier cell `Z1` so **every
census-recognised in-registry row emits an `E06` line naming its id**; `S901` = in-Registry anchor in every fixture).
Five readers per fixture: census `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <f> --today 2026-11-07`;
BASE; ref (ctl-positive); and three minimal census-parity fix variants (`fixed-sec`, `fixed-fc`, `fixed-both`, diffs
`fix-sec.diff` `fix-fc.diff` `fix-both.diff` — each applies cleanly with `git apply` and reproduces the tested variant
byte-for-byte). cite-sources recognition = one README map row citing exactly the probe id (`CLEAN cited=1` ⇒ ROW,
`DRIFT ghosts=1 first=<id>` ⇒ NOT-ROW). source-capture recognition = two-partition receipt: regD binds only a control
`S000` capture (every `X:uncaptured` ⇒ X recognised); regC exempts all fixture ids (every `X:orphan-exemption` ⇒ X NOT
recognised). Exact commands + verdicts: `section.txt`, `shape.txt`; per-run receipts `receipts/`.

## 1. Section scope (census reads id rows outside `## Registry` as `E12 … row outside Registry section`, never as rows)

| class (fixture) | census | BASE | ref (ctl-positive) | fix-both |
|---|---|---|---|---|
| row before any heading (`section-before`) | E12 S101, E06 S901 | ROW (S101+S901) | ROW | NOT-ROW ✓ |
| row under `## Search log` (`section-search-log`) | E12 | ROW | ROW | NOT-ROW ✓ |
| row after `# Notes` closes Registry (`section-after-h1`) | E12 | ROW | ROW | NOT-ROW ✓ |
| row inside fenced block outside Registry (`section-fence-out`) | E12 (fences are not census syntax) | ROW | ROW | NOT-ROW ✓ |
| row inside fenced block **inside** Registry (`section-fence-in`) | E06 both rows | ROW | ROW | ROW — agreement (census has no fence concept) |
| row under `### Registry` (`section-h3`) | E12 (`###` matches no census heading; state carried from `## Search log`) | ROW | ROW | NOT-ROW ✓ |
| row under `##Registry` no-space (`section-nospace`) | E12 (`##[ \t]` requires a space; line ignored) | ROW | ROW | NOT-ROW ✓ |
| row after `## Registry\r` (`section-cr`) | E12 (heading matched but trim keeps CR ⇒ ≠ `Registry` ⇒ state cleared) | ROW | ROW | NOT-ROW ✓ |
| `   ## Registry` 3-SP indent (`section-indent3`) | E06 both (census allows 0–3 SP headings) | ROW | ROW | ROW — agreement |
| `    ## Registry` 4-SP indent (`section-indent4`) | E12 **both rows incl. the anchor** (heading ignored, registry never opens) | ROW | ROW | NOT-ROW ✓ |
| file-start U+FEFF (shape-bom, below) | E12 **all rows** (BOM record fails `^ {0,3}##[ \t]`) | ROW | ROW | NOT-ROW ✓ |

**BASE diverges from the census in 9 of 11 section placements; the R100 reference (`ctl-positive`) diverges identically** —
section scope is outside R100 by design. `fix-sec`/`fix-both` (census heading machine verbatim: `^ {0,3}##[ \t]` +
ASCII-SP/TAB-trim equality with `Registry`, `^ {0,3}#[ \t]` resets, rows only when open) close all of them.

## 2. Row shape (all inside a clean `## Registry`)

| class (fixture) | census | BASE | ref | fix-both |
|---|---|---|---|---|
| 12-field row (`shape-fields12`) | `E01 S111 fields=10`, id NOT census-valid (no E06) | ROW | ROW | NOT-ROW ✓ (`fix-fc`) |
| 14-field row (`shape-fields14`) | `E01 S112 fields=12` | ROW | ROW | NOT-ROW ✓ (`fix-fc`) |
| duplicate id (`shape-dup`) | **both rows counted**: E06 S113 ×2 **and** `E03 S113 duplicate id` | cite: ROW (recognition parity); capture: `FAIL-CLOSED reason=sources doc has duplicate row id S113` exit 2 | same | same — recognition parity holds; the capture refusal is contract shape (`kumitate-source-capture-v1`, exit maps frozen), routed below |
| file-start U+FEFF (`shape-bom`) | E12 for **every** row; census-valid set = ∅ | ROW (all) | ROW | NOT-ROW ✓ (`fix-sec`); capture under fix exits `FAIL-CLOSED … carries no S### rows` |
| escaped `\|` in id cell (`shape-escpipe`) | line still processed as a row: `E01 S115\ fields=12` + `E02 S115\` — but **no valid id** (`S115\` ∉ `^S[0-9]{3,}$`) | NOT-ROW (S115) | NOT-ROW | NOT-ROW — id parity already holds; divergence is classification-only (tools have no E01/E02 row-line analog) |
| empty id cell (`shape-emptyid`) | `E02` (empty id) **and** `E06  tier=Z1` — row counted, id empty | NOT-ROW | NOT-ROW | NOT-ROW — id parity holds; classification-only |

`fix-fc` gate = `line.replace(/^ {0,3}/,'').split('|').length === 13` (gawk `NF==13` on the stripped record).

**Net: 10 recognition divergences (9 section + 2 field-count + BOM); `fix-both` reaches census parity on every drawn
class** (summary printed by `driver.py`; per-id verdicts in `section.txt`/`shape.txt`).

## 3. Minimal fixes (diffs in this seat dir; report-only, not landed)

- `fix-sec.diff` — census section gate in `registryIds()` and `loadSourceIds()` (same 8-line walk in both tools; also
  switches their row regex to the R100 ASCII pad, so `fix-sec` composes with R100).
- `fix-fc.diff` — 13-field gate on the 0–3-SP-stripped record (census `NF==13`), both tools.
- `fix-both.diff` — both gates + R100 row regex (the r101 package preview).
- `git apply --check`/`git apply` clean on a BASE tree; result == `fixed-<v>/` bytes (verified, applies receipts in-session).
- **Selftest co-update required** (measured, receipts `selftest-*.txt`): cite fixes fail shipped cases `clean-known-ids`
  and `prose-outside-rows-ignored` — its fixtures carry no `## Registry` heading and 2-cell rows; capture fixes fail 9
  cases (`clean`, `hash-mismatch`, `capture-absent`, `not-a-regular-file`, `bytes-mismatch`, `path-escape`,
  `uncaptured`, `orphan-capture`, `captures-empty`) — `fixture()` builds heading-less docs. Fix = make both selftest
  fixture builders census-shaped (heading + 13-field rows); `fc/capture` already passes 13/13. No case asserts
  section-blind recognition as a requirement — the failures are fixture-shape, not semantics.
- Known side effects to route: (i) `sec`-capture reports `FAIL-CLOSED … carries no S### rows` on census-invalid files
  (census reports per-row E12s, exit 1) — recognition parity with a different failure mode; exit maps are frozen by R100,
  r101 must bless this shape. (ii) `dup`: census counts rows under E03 while capture refuses — strictness asymmetry,
  contract decision. (iii) `escpipe`/`emptyid`: parity holds on ids; a row-line/E02 telemetry analog does not exist in
  the tools and is not proposed (exit maps frozen).

## 4. Live impact (all 21 fleet lanes, probe100-c1 (c) recipe: snapshot README+SOURCES + reg.json binding every `S\d{3,}` token)

`live-impact.txt`: census `validate` per lane: **21/21 exit=0** (warnings only: W01/W04 — no E-lines live ⇒ no live row
sits outside `## Registry`, malformed, or behind a BOM today). BASE vs {ref, sec, fc, both} × {cite, capture}:
**210 comparisons, 0 differences** in stdout+exit (per lane `same` lines; kumitate lane e.g. `CLEAN cited=282` /
`CLEAN captures=1 exemptions=216` for every variant). All measured divergence classes are **prospective**: zero live
exposure in this fleet snapshot, matching the plan's disclosed limit (1).

## 5. Recommendation to route into round 101

1. Adopt `fix-both.diff` (or sec+fc separately) **with the selftest fixture-shape update**; verify with the frozen
   counter — arm (c) is already proven no-regression here (210/210 same).
2. Bless the `sec`-capture FAIL-CLOSED shape (and the dup refusal) as contract, or add an E12/E03-analog note — exit-map
   decision, not a recognition one.
3. Battery gap for the counter: draw section-scope and field-count classes (E12/E01 attributions) if r101 extends C1;
   the current battery is in-Registry 13-field only by design.

## Evidence index (this seat dir)

`section.txt`, `shape.txt` (required outputs; exact commands embedded) · `live-impact.txt` · `fix-sec.diff`,
`fix-fc.diff`, `fix-both.diff` · `fixed-{sec,fc,both}/{cite-sources,source-capture}.mjs` · `fixtures/` (16 SOURCES
fixtures + per-id READMEs + regD/regC partition registries + cap files) · `receipts/` (census per fixture; cite per
(fixture,id,reader); capture partitions per (fixture,reader); selftests) · `driver.py` (whole measurement, re-runnable) ·
`base/`, `ref/` (tool bytes + sha256). Live snapshots and control generation ran under
`/fast/scratch/hyaku/kumitate-r100/K100ExecSection/` (ephemeral, removed after the wave).
