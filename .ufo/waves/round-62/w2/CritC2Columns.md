# CritC2Columns — round 62 w2, C2 subcase 2 falsify (critic)

**Verdict: wave-1 claim CONFIRMED — the frozen D61 v1 probe reads shifted SOURCES cell
indices** (`c[9]/c[10]/c[12]` where the 11-column contract has `c[8]/c[9]/c[11]`), and
E3 and E5 are jointly unsatisfiable for any Registry row, exactly as
`w1/CritControlC2.md` counterexample 1 states. Reproduced from scratch with the frozen
probe at three scratch revisions; verbatim outputs below. **The defect independently
prevents D61 v1 from verifying an honest build**: an otherwise honest, census-clean
artifact reads `DOCTRINE61_UNMET` (held=4/6) purely from the column shift, and no row can
satisfy E3 and E5 at once (E3 PASS requires a malformed 12-cell row, which the census
flags E01/E02 → E5 MISS).

## Artifacts attacked

- Frozen probe `kumitate-shokunin/.ufo/waves/round-61/probe/doctrine61-probe.mjs`
  (committed at base `be4a820`, unchanged through all scratch revs).
- Census contract `scripts/sources-census.sh` (fleet): `SOURCES-CONTRACT-v1: one
  registry table, 11 columns => NF=13`; `row_pass` maps
  `status=trim($9); opened=trim($10); recheck=trim($11); usedby=trim($12)` (lines
  626–628); `if (NF!=13) { printf "%s\tE01\t%s fields=%d\n",lane,id,NF-2 ... }` with
  `if (id !~ /^S[0-9]{3,}$/) printf "%s\tE02\t%s\n",lane,id` (line 635).
- Round-61 plan E3 sentence (`plan.md` lines 66–68): *"E3 — its `source:` cites `S195`;
  row S195 exists in `corpus/SOURCES.md`, `status` is `mined`, `opened` is
  `2026-10-25`, and its `used-by` names exactly that entry."*

## Frozen code under test (verbatim)

Probe line 17 (`doctrine61-probe.mjs`):

```js
const r=spawnSync('git',['-C',lane,'show',`${rev}:corpus/SOURCES.md`],{encoding:'utf8'});const row=(r.stdout||'').split('\n').find(l=>/^\|[[:space:]]*S195[[:space:]]*\|/.test(l));if(!row)add('E3',false,'row-absent');else{const c=row.split('|').map(x=>x.trim());const ok=c[9]==='mined'&&c[10]==='2026-10-25'&&c[12]==='corpus/knowledge/temporal-worker-versioning-pinning.md';add('E3',ok,`status=${c[9]} opened=${c[10]} used-by=${c[12]}`)}
```

So the probe splits the row on `|` and checks `c[9]/c[10]/c[12]`. For an 11-cell
contract row the split yields `['', id, source, kind, tier, scope, anchor, teaches,
status, opened, recheck, used-by, '']`, i.e. `c[8]=status`, `c[9]=opened`,
`c[10]=recheck`, `c[11]=used-by`, `c[12]=''` (trailing empty). The probe reads one cell
to the right of the contract in every position.

## Reproduction (scratch only)

Scratch: `/tmp/kumitate-r62/CritC2Columns/` — `fleet/` with `shokunin.conf`
(`kumitate|kumitate-shokunin|operability + coverage (orchestration and tooling)`) and a
clone of the lane at `be4a820` (`fleet/kumitate-shokunin`). Honest-state base additions
committed in scratch: the entry
`corpus/knowledge/temporal-worker-versioning-pinning.md` (provenance trio `source:`,
`verified-at: 2026-10-25`, `recheck:`), the real scout capture
`.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` (sha256
`8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`), the README map row
for the entry and the R60 verifier spot-check row (plan E6 wording), and pins for both
(`readme-map` reads `CLEAN files=147 rows=147 covered=147` at every scratch rev). All
attacks were scratch commits; lane jj/git state untouched. No tools installed (node
v24.21.0, git 2.56.0, gawk 5.4.1 already present). Commands:
`node doctrine61-probe.mjs <lane> <rev> --census-root <fleet>` and
`sources-census.sh validate --root <fleet> kumitate`. Transcripts:
`/tmp/kumitate-r62/CritC2Columns/receipts/{x1,x2,x3}-{probe,census}.txt`.

### X1 — 11-cell contract row, probe-visible id: E3 reads shifted cells (rev `12bff29`)

Committed row (11 data cells, NF=13, contract values at contract cells; id styled
`:S195:` because that is the only id shape the frozen regex can see — subcase 1):

```
|:S195:| Worker Versioning — Temporal docs — https://docs.temporal.io/worker-versioning.md | docs | A | worker-versioning-pinning | § Pinned Workflows; raw markdown read 2026-10-25, sha256 8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc | A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version. | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |
```

Frozen probe output (exact, exit=1):

```
DOCTRINE61: DOCTRINE61_UNMET held=4/6 checks=6 rev=12bff291138076efdfa4e5c29c0527b1577604ac rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS status=2026-10-25 opened=90d used-by=
 | E4 PASS pin=sha256 8ef2ee5f5e196d9d1 sha=8ef2ee5f5e196d9d
 | E5 MISS exit=1
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
```

Cell map (probe arithmetic `row.split('|').map(trim)`): contract cells are
`c[8]=status="mined"`, `c[9]=opened="2026-10-25"`, `c[11]=used-by="corpus/knowledge/temporal-worker-versioning-pinning.md"`;
the probe reads `c[9]/c[10]/c[12]` = `"2026-10-25"/"90d"/""` → the E3 line prints
`status=2026-10-25 opened=90d used-by=`. Census on the same rev (exact, exit=1):

```
kumitate	E02	:S195:
```

(only the id is invalid; NF is fine), so E5 MISS. E1/E2/E4/E6 all pass.

### X2 — 12-cell row: E3 PASS while census E01/E02 fire (rev `20432d2`)

Committed row (12 data cells, NF=14; a `pad` cell shifts contract values into the
probe's cells):

```
|:S195:| Worker Versioning — Temporal docs — https://docs.temporal.io/worker-versioning.md | docs | A | worker-versioning-pinning | § Pinned Workflows; raw markdown read 2026-10-25, sha256 8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc | A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version. | pad | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |
```

Frozen probe output (exact, exit=1):

```
DOCTRINE61: DOCTRINE61_UNMET held=5/6 checks=6 rev=20432d28aeb7841d5db4c7aac5067b301e7f24b8 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 8ef2ee5f5e196d9d1 sha=8ef2ee5f5e196d9d
 | E5 MISS exit=1
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
```

Census on the same rev (exact, exit=1):

```
kumitate	E01	:S195: fields=12
kumitate	E02	:S195:
```

Cell map: contract cells are `c[8]/c[9]/c[11]="pad"/"mined"/"90d"` — the row is
malformed by contract; E3 PASS only because a 12th cell exists and the id char `:` is
non-`S`.

### X3 — honest 11-cell row with id `S195`: census-clean yet E3/E4 MISS (rev `1ae8639`)

Committed row (11 data cells, id `S195`, otherwise identical contract cells):

```
| S195 | Worker Versioning — Temporal docs — https://docs.temporal.io/worker-versioning.md | docs | A | worker-versioning-pinning | § Pinned Workflows; raw markdown read 2026-10-25, sha256 8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc | A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version. | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |
```

Frozen probe output (exact, exit=1):

```
DOCTRINE61: DOCTRINE61_UNMET held=4/6 checks=6 rev=1ae8639f4cb41cd71a8bf05554c9b9701046b89f rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
```

Census on the same rev (exact, exit=0): `kumitate	ok	.../corpus/SOURCES.md`
(W04 pre-existing base warnings elided). So the census-clean honest row passes E5 yet
fails E3 (`row-absent`) because the frozen regex cannot see `| S195 |` — and E4 fails
with it because the pin is extracted from the same regex-matched row.

## Joint unsatisfiability (demonstrated)

- Census-valid Registry rows (11 cells, NF=13) → E3 always MISS: with the frozen regex
  the honest `| S195 |` row is invisible (`row-absent`, X3); with the only probe-visible
  id shape (`:S195:`), E3 misses on the shifted read (X1). A corrected regex would still
  read `c[9]="2026-10-25"` ≠ `mined`, so the column shift alone defeats every NF=13 row.
- Rows that satisfy E3 (12 cells, NF=14) → census `E01 fields=12` (+ `E02` for the
  non-S id) → E5 MISS exit=1 (X2).

Therefore **E3 and E5 are jointly unsatisfiable; no `DOCTRINE61_HELD` under D61 v1 can
come from a census-clean artifact.**

## Does it independently prevent D61 from verifying?

Yes. The claim under test (plan.md C2) is a frontier move whose evidence must be an
honest, census-clean S195 row. X1 demonstrates a fully honest build (entry trio, real
capture with matching sha pin, README map clean, 11-column contract row) reads
`DOCTRINE61_UNMET held=4/6` with the sole honest-path miss caused by the shifted indices
(E3); the shift is independent of the regex defect — even if the honest `| S195 |` row
were made visible, `c[9]="2026-10-25"` would still fail `c[9]==='mined'`. E5
additionally misses because the only probe-visible id shape is census-invalid (X1), and
the census-clean id shape yields `row-absent` (X3). Together with the wave-1 a0 receipt
(`controls/ctl-c2-critic-a0-honest-row-vacuity.txt`), the E3/E4 defects make any v1 HELD
unattainable by honest work and attainable only by forgery (a5), so D61 v1 cannot verify
the declared claim. C2 fails as declared under v1 unless re-declared as a disclosed v2.

## Smallest safe correction (affirms wave-1 v2 proposal)

- E3/E4: `c[8]==='mined' && c[9]==='2026-10-25' && c[11]===ep` (verified against census
  `$9/$10/$12` mapping); restrict the search to lines inside `## Registry`; fix the row
  regex (`/^\|\s*S195\s*\|/`).
- Re-run the negative control `ctl-c2-unopened-row.txt` against v2 with a positive
  control (a0 must read HELD) so it is non-vacuous.
