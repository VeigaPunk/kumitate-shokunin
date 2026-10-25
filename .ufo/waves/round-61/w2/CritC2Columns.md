# CritC2Columns — round 61 w2, C2 subcase 2 falsify (critic)

**Verdict: wave-1 claim CONFIRMED — the frozen D61 v1 probe reads shifted SOURCES cell indices**
(`c[9]/c[10]/c[12]` where the contract has `c[8]/c[9]/c[11]`), and E3 and E5 are
jointly unsatisfiable for any Registry row, exactly as `CritControlC2.md` counterexample 1
states. Reproduced in scratch with the frozen probe at two committed revisions, verbatim
outputs below. **The defect independently prevents D61 v1 from verifying an honest build**:
an honest, census-clean artifact reads `DOCTRINE61_UNMET` (held=4/6) purely from the column
shift, and no row can satisfy E3 and E5 at once (E3 PASS requires a malformed 12-cell row,
which the census flags E01/E02 → E5 MISS).

## Artifacts attacked

- `kumitate-shokunin/.ufo/waves/round-61/probe/doctrine61-probe.mjs` (frozen, rev `be4a820`).
- `kumitate-shokunin/.ufo/waves/round-61/plan.md` (E3/E4/E5 contract sentences, lines 66-73).
- Wave-1 `w1/CritControlC2.md` counterexample 1 clause: *"column off-by-one: probe reads
  c[9]/c[10]/c[12]; on the 11-column contract those are opened/recheck/trailing-empty
  (status/opened/used-by are c[8]/c[9]/c[11]); census requires NF=13 ... the probe requires a
  12th cell and a non-`S` id char → E3 and E5 are jointly unsatisfiable for any Registry row."*

## Frozen code under test (verbatim)

Probe line 17 (`doctrine61-probe.mjs`):
```js
const ok=c[9]==='mined'&&c[10]==='2026-10-25'&&c[12]==='corpus/knowledge/temporal-worker-versioning-pinning.md';add('E3',ok,`status=${c[9]} opened=${c[10]} used-by=${c[12]}`)
```
Census row contract (`scripts/sources-census.sh`): `SOURCES-CONTRACT-v1: one registry table,
11 columns => NF=13`; `row_pass` maps `status=trim($9); opened=trim($10); ... usedby=trim($12)`
(lines 627-628); `if (NF!=13) { printf "%s\tE01\t%s fields=%d\n",lane,id,NF-2 ... }` (line 635).
So contract cells in probe indexing are `c[8]` status, `c[9]` opened, `c[11]` used-by; `c[12]`
is the trailing empty after the closing `|`. The probe reads one cell to the right.

## Reproduction (scratch only)

Scratch: `/tmp/kumitate-r61/CritC2Columns/` — `fleet/` with `shokunin.conf`
(`kumitate|kumitate-shokunin|operability + coverage (orchestration and tooling)`) and a clone of
the lane at `be4a820` (`fleet/kumitate-shokunin`). All attacks were scratch commits; lane
jj/git state untouched. No tools installed (node/git/bash already present). Commands:
`node columns.mjs x1-shift-read`, `node columns.mjs x2-twelve-cell-e3-pass`.

### X1 — probe-visible 11-column row: E3 reads shifted cells (commit `c650902`)

Committed row (11 data cells, NF=13, contract values at contract cells):
```
|:S195:| Worker Versioning — Temporal docs — https://docs.temporal.io/worker-versioning.md | docs | A | which code version a durable retry may run | § Pinned Workflows; raw markdown read 2026-10-25, sha256 8ef2ee5f5e196d9d... | A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version. | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |
```
Frozen probe output (exact):
```
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2Columns/fleet/kumitate-shokunin c650902 --census-root /tmp/kumitate-r61/CritC2Columns/fleet
DOCTRINE61: DOCTRINE61_UNMET held=4/6 checks=6 rev=c650902 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS status=2026-10-25 opened=90d used-by=
 | E4 PASS pin=sha256 8ef2ee5f5e196d9d1 sha=8ef2ee5f5e196d9d
 | E5 MISS exit=1
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
exit=1
```
Cell map of that committed row (probe arithmetic `row.split('|').map(trim)`):
- `c[8]=status="mined" c[9]=opened="2026-10-25" c[11]=used-by="corpus/knowledge/temporal-worker-versioning-pinning.md"`
- probe reads `c[9]/c[10]/c[12]` = `"2026-10-25"/"90d"/""` → the E3 line prints `status=2026-10-25 opened=90d used-by=`.

So even when E1/E2/E4/E6 all pass, an honest 11-column row yields E3 MISS purely from the
off-by-one. Census on the same row: `kumitate	E02	:S195:` exit=1 (only the id is invalid; NF
is fine).

### X2 — 12-cell row: E3 PASS while census E01/E02 fire (commit `824b103`)

Committed row (12 data cells, NF=14; a `pad` cell after teaches shifts contract values into the
probe's cells):
```
|:S195:| Worker Versioning — Temporal docs — https://docs.temporal.io/worker-versioning.md | docs | A | which code version a durable retry may run | § Pinned Workflows; raw markdown read 2026-10-25, sha256 8ef2ee5f5e196d9d... | A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version. | pad | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |
```
Frozen probe output (exact):
```
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2Columns/fleet/kumitate-shokunin 824b103 --census-root /tmp/kumitate-r61/CritC2Columns/fleet
DOCTRINE61: DOCTRINE61_UNMET held=5/6 checks=6 rev=824b103 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 8ef2ee5f5e196d9d1 sha=8ef2ee5f5e196d9d
 | E5 MISS exit=1
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
exit=1
```
Census on the same rev (exact):
```
$ sources-census.sh validate --root /tmp/kumitate-r61/CritC2Columns/fleet kumitate   (W04 warnings elided)
kumitate	E01	:S195: fields=12
kumitate	E02	:S195:
exit=1
```
Cell map: contract cells are `c[8]/c[9]/c[11]="pad"/"mined"/"90d"` — the row is malformed by
contract; E3 PASS only because the 12th cell exists and the id char `:` is non-`S` (this is the
only row shape the probe's regex can see at all: `[[:space:]]` in JS parses as class
`{[,:,s,p,a,c,e}` + literal `]`, so `| S195 |` never matches — subcase 1).

## Joint unsatisfiability (demonstrated)

- Census-valid Registry rows (11 cells, NF=13) → `c[12]=''` → E3 always MISS (X1 shows the
  shifted read; even a hypothetical `| S195 |` row cannot be seen by the regex).
- Rows that satisfy E3 (12 cells) → census `E01 fields=12` (+ `E02` for the non-S id) → E5
  MISS exit=1 (X2).
Therefore **E3 and E5 are jointly unsatisfiable; no `DOCTRINE61_HELD` under D61 v1 can come
from a census-clean artifact.**

## Does it independently prevent D61 from verifying?

Yes. The claim under test (plan.md C2) is a frontier move whose evidence must be an honest,
census-clean S195 row. X1 shows a fully honest build (entry trio, real capture, README map,
11-column contract row) reads `DOCTRINE61_UNMET held=4/6` with the sole honest-path miss caused
by the shifted indices (E3); E5 additionally misses because the only probe-visible id shape is
census-invalid. The wave-1 a0 receipt (`controls/ctl-c2-critic-a0-honest-row-vacuity.txt`)
observes the same for the `| S195 |` contract row. Together, the two E3/E4 defects make any
v1 HELD unattainable by honest work and attainable only by forgery (a5), so D61 v1 cannot
verify the declared claim — C2 fails as declared under v1 unless re-declared as a disclosed v2.

## Smallest safe correction (affirms wave-1 v2 proposal)

- E3/E4: `c[8]==='mined' && c[9]==='2026-10-25' && c[11]===ep` (verified against census
  `$9/$10/$12` mapping); restrict the search to lines inside `## Registry`; fix the row regex
  (`/^\|\s*S195\s*\|/`).
- Re-run the negative control `ctl-c2-unopened-row.txt` against v2 with a positive control
  (a0 must read HELD) so it is non-vacuous.
