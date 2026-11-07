# K99Mutation — K2: does the shipped selftest pin R99?

Seat `K99Mutation` (mutation-tester), round 99, w1. Target: the **candidate** `sources-check.mjs` built by
`K99ExecTool`; K2 asks whether the candidate's **shipped `--selftest`** fails on the 16 frozen control shapes (the
R99 violating rewrites) applied to the shipped code — i.e. whether a future edit can silently restore the wider
ECMAScript `trim()` class and still ship green.

## Verdict

**K2: the shipped selftest has teeth on 15 of the 16 control shapes and on 8 of 11 independent shapes.**
23 of the 27 planted mutants are killed (23/26 behavior mutants; the 27th is a byte-identical no-op sanity row).
Three behavior mutants survive; each is a real hole with a concrete arm that would catch it (§4), but none of them
is a cell-trim **class** hole: every pad class the frozen counter draws (SP, TAB, VT, FF, CR, NEL, NBSP, every Zs
sample, LS/PS, Cf, C0, fillers) is pinned by at least one `r99trim-*` arm, and the "blank pads are accepted" side is
pinned for lengths 1, 4 and 8.

## 1. Reference (required first): unmutated candidate PASSes

Candidate bytes (final, byte-identical to what the builder's `READY` pins):

- lane path `kumitate-shokunin/.ufo/waves/round-99/K99ExecTool/sources-check.mjs`
- sha256 `50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31`, size 60858, mtime 2026-11-07 03:38:01
- `READY` (written 03:44:17) and the builder's `sha256.txt` both carry `50b945…`; the lane file sha256 was equal
  before and after this probe (no lane mutation by this seat)
- diff vs BASE `f9cd1bff`: `-function trim(value) { return value.trim(); }` and +201 lines (the R99 helper plus
  `r99trim-*` selftest arms). The mutant anchors below apply exactly once each.

Reference run (planted at `<scratch>/snap/scripts/sources-check.mjs` beside `cap-spawn.mjs`/`cap-run.mjs` from BASE
`f9cd1bff`, i.e. the same plant the frozen counter uses):

```
TMPDIR=<scratch>/tmp SHOKUNIN_ROOT=/home/vgpnk/Projects/shokunin LANG=C.UTF-8 \
  node snap/scripts/sources-check.mjs --selftest
```
```
SOURCES_SELFTEST: 90/90 pass
VERDICT: PASS
```
exit 0, `0` SKIP lines. Receipt: `K99Mutation/cand-mutants/snap-selftest.txt`.

## 2. Method

`K99Mutation/mutate.py <candidate> <out>` rewrites the single `function trim(value) { return …; }` line (or the
one id / count / used-by-split / ID_FORM-detail line named) and asserts the shape applied; each mutant is planted
as `<out>/<name>/scripts/sources-check.mjs` with BASE `cap-spawn.mjs` + `cap-run.mjs` beside it. Every mutant is
run with the same environment and bound as the counter's arm (h):

```
TMPDIR=<scratch>/tmp SHOKUNIN_ROOT=/home/vgpnk/Projects/shokunin LANG=C.UTF-8 \
  timeout 180 node <mutant>/scripts/sources-check.mjs --selftest      # 4 at a time
```

`killed` = exit != 0 **or** the last line is not `VERDICT: PASS`; the killing arm is the `FAIL <label>` line(s).
Receipts: `K99Mutation/cand-mutants/<mutant>.selftest.txt` (full output), `<mutant>.exit`,
`cand-mut-gen.txt` (mutant sha256), `cand-mut-summary.txt` (table below).

## 3. Mutants (27 rows) — candidate sha `50b945…`

16 rows are the frozen control shapes from `make-controls99.py` applied to the candidate (`m01`, `m02`–`m12`,
`m17`–`m20`), 10 are this seat's own plausible defects, 1 is a byte-identical no-op sanity row.

| # | mutant | shape | verdict | exit | pass | first killing arm |
|---|---|---|---|---|---|---|
| 1 | m00-noop | byte-identical (harness control, not a defect) | SURVIVED | 0 | 90/90 | — (expected: proves the detector does not kill a clean tool) |
| 2 | m01-js-trim | `ctl-nothing`: `value.trim()` (ECMAScript TrimString) | KILLED | 1 | 76/90 | r99trim-id-nbsp |
| 3 | m02-spaceonly | `ctl-spaceonly`: only U+0020 pads | KILLED | 1 | 87/90 | r99trim-duplicate (+ r99trim-blank-accepted) |
| 4 | m03-asciiws | `ctl-asciiws`: VT FF CR stripped | KILLED | 1 | 81/90 | r99trim-id-vt |
| 5 | m04-nbsp | `ctl-nbsp`: NBSP stripped | KILLED | 1 | 84/90 | r99trim-id-nbsp |
| 6 | m05-zs | `ctl-zs`: `\p{Zs}` stripped | KILLED | 1 | 81/90 | r99trim-id-nbsp / r99trim-id-emsp |
| 7 | m06-leadonly | `ctl-leadonly`: trail side keeps JS trim | KILLED | 1 | 76/90 | r99trim-id-nbsp |
| 8 | m07-trailonly | `ctl-trailonly`: lead side keeps JS trim | KILLED | 1 | 76/90 | r99trim-id-nbsp |
| 9 | m08-padcap3 | `ctl-padcap3`: blank pads capped at 3 | KILLED | 1 | 89/90 | r99trim-blank-accepted |
| 10 | m09-bomstrip | `ctl-bomstrip`: U+FEFF stripped | KILLED | 1 | 87/90 | r99trim-id-bom |
| 11 | m10-cfstrip | `ctl-cfstrip`: U+200B–200D/U+2060 stripped | KILLED | 1 | 89/90 | r99trim-id-zwsp |
| 12 | m11-c0strip | `ctl-c0strip`: C0 + SP stripped | KILLED | 1 | 80/90 | r99trim-id-vt / r99trim-id-soh |
| 13 | m12-pystrip | `ctl-pystrip`: Python `str.strip()` class | KILLED | 1 | 76/90 | r99trim-id-nbsp / r99trim-id-nel |
| 14 | m13-vtclass | own: `[ \t]` -> `[ \t\v]` | KILLED | 1 | 86/90 | r99trim-id-vt |
| 15 | m14-plus12 | own: `+` -> `{1,2}` (pads of 3+ leave residue) | KILLED | 1 | 89/90 | r99trim-blank-accepted |
| 16 | m15-nocaret | own: `^` anchor dropped (all inner runs stripped) | **SURVIVED** | 0 | 90/90 | — see §4.1 |
| 17 | m16-nogflag | own: `g` flag dropped (one side per call) | KILLED | 1 | 37/90 | clean fixture returns CLEAN |
| 18 | m17-idonly | `ctl-idonly`: id blank, other cells JS trim | KILLED | 1 | 85/90 | r99trim-kind-cell / r99trim-tier-cell |
| 19 | m18-enumonly | `ctl-enumonly`: id JS trim, other cells blank | KILLED | 1 | 81/90 | r99trim-id-nbsp |
| 20 | m19-countall | `ctl-countall`: `counts.rows` counts every Registry row | KILLED | 1 | 77/90 | r99trim-id-nbsp (+ r99trim-counts) |
| 21 | m20-splitjs | `ctl-splitjs`: used-by parts keep JS trim | **SURVIVED** | 0 | 90/90 | — see §4.2 |
| 22 | m21-counts-after13 | own: `counts.rows` moved after the 13-field guard | KILLED | 1 | 89/90 | frozen awk census parity |
| 23 | m22-idform-raw | own: ID_FORM detail prints the untrimmed id cell | KILLED | 1 | 77/90 | r99trim-id-nbsp |
| 24 | m23-idform-empty | own: ID_FORM detail says `(empty)` for an NBSP-only id | **SURVIVED** | 0 | 90/90 | — see §4.3 |
| 25 | m24-tab-to-space | own: TAB -> SP then JS trim | KILLED | 1 | 76/90 | r99trim-id-nbsp |
| 26 | m25-nbsp-to-space | own: NBSP -> SP then JS trim | KILLED | 1 | 76/90 | r99trim-id-nbsp |
| 27 | m26-idonly-raw | own: id blank, the ten other cells not trimmed at all | KILLED | 1 | 53/90 | clean fixture returns CLEAN |

Kill count: **23/27 rows killed; 23/26 behavior mutants killed.**
Control shapes: **15/16 killed** (`ctl-splitjs` is the one survivor). The only surviving own shapes are `m15`, `m23`.

## 4. Survivors and the arm that should catch each

Each suggested arm was **ran** against the candidate and the survivor (`K99Mutation/verify-suggested.py`,
receipt `K99Mutation/cand-mutants/verify-suggested.txt`); all three discriminate.

### 4.1 `m15-nocaret` — inner-cell space corruption is invisible
Shape: `value.replace(/[ \t]+|[ \t]+$/g, '')` (the `^` anchor dropped). It strips inner runs as well, so
`do cs` becomes the valid `docs`, `fixture scope` becomes `fixturescope`, etc. The suite only compares finding
kind+detail on padding-shaped payloads, so inner payload corruption in `source`/`scope`/`anchor`/`teaches`/`used-by`
never surfaces: 90/90 pass.
Arm that should catch it: `r99trim-kind-inner` — one row with `kind = 'doc s'`, expecting
`KIND_ENUM id=S002 kind=doc s`.
Measured: candidate `exit=1 findings=['KIND_ENUM:id=S002 kind=doc s']`; mutant `exit=0 findings=[]`.

### 4.2 `m20-splitjs` — used-by path parts keep JS trim (`ctl-splitjs`)
Shape: `value.split(',').map((p) => p.trim())` — the R99 helper is bypassed for used-by parts. This is R99's
"every helper that calls it" clause and simultaneously the plan's **disclosed out-of-scope** fleet divergence
(frozen plan limit 2): the counter does not judge it, and `ctl-splitjs` is declared HELD by design.
Arm that should catch it: `r99trim-usedby-part` — a used-by cell whose second part is NBSP-padded
(`'…alpha.md, \u00a0…missing.md'`), expecting `USED_BY_MISSING … missing used-by \u00a0corpus/knowledge/missing.md`
(the pad is part of the path under R99; JS trim silently drops it, changing the reported path).
Measured: candidate `missing used-by \xa0corpus/knowledge/missing.md`; mutant `missing used-by
corpus/knowledge/missing.md` (exit 1 both, detail differs).

### 4.3 `m23-idform-empty` — ID_FORM detail for an NBSP-only id
Shape: `id=${id === '\u00a0' ? '(empty)' : id}`. An id cell that is exactly one NBSP is non-empty after the blank
trim, so R99 reports `ID_FORM id=<NBSP>`; no arm uses an NBSP-only id cell, so the detail rewrite is invisible.
Arm that should catch it: `r99trim-id-blank-only` — a row whose id cell is exactly `\u00a0`, expecting
`ID_FORM id=\u00a0` (census E02 for the same row reports the blank string).
Measured: candidate `ID_FORM:id=\xa0`; mutant `ID_FORM:id=(empty)`.

`m00-noop` surviving is the intended harness control: a byte-identical tool passes (the detector is not
over-killing), and it is not counted as a defect.

## 5. Pre-state control: BASE's own selftest pins nothing (K2's premise, reproduced)

`ctl-positive` — BASE bytes with only the R99 `trim` line — regenerated from
`probe/make-controls99.py` into this seat's scratch (sha256 `80b2f3f2f4092d92d1a6a9eadddf1e7dfdd36c7422f95d640e96fb46e93d23a1`,
matches `controls/controls-sha256.txt`), reference run `SOURCES_SELFTEST: 71/71 pass`, `VERDICT: PASS`.
The same 27 mutants against those bytes: **3 killed, 24 survived**.
The 3 kills are incidental, not cell-class arms: `m16-nogflag` (truncated trim breaks every fixture),
`m21-counts-after13` (the `frozen awk census parity` arm sees `counts.rows` change), `m26-idonly-raw`
(untrimmed cells produce `ROW_FIELD_EMPTY`). `m01-js-trim` (the do-nothing BASE `trim()`) and every pad-class shape
survive — exactly the r98/`OBSERVED.txt` (h=1/1) defect K2 exists to catch. Receipts:
`K99Mutation/ctlpositive-mutants/`.

So the candidate's teeth come from its new `r99trim-*` arms (10 id pad classes, five single-cell class arms,
duplicate, counts, blank-accepted, census-parity), not from the inherited BASE suite.

## 6. Divergence note on the builder's `arm-teeth.txt` (resolved)

The builder's first `arm-teeth.txt` (03:38) reported all 15 shapes SURVIVED; its 03:42 rerun reported 14/15 with
`ctl-idonly` SURVIVED. Both were catalog/driver artefacts, not test gaps: the `make-controls99.py` idonly shape
reverts the helper to JS `trim()` **and** gives the id cell the blank regex; a driver that only rewrites the id line
leaves the helper at R99 and produces a no-op. Applied faithfully (`m17-idonly`, helper reverted + id blank inline)
the shape is KILLED by `r99trim-kind-cell` and `r99trim-tier-cell` in this seat's run. The builder confirmed the fix
by message; their current `arm-teeth.txt` reports `RESULT: 16/16 shapes killed by at least one r99trim arm`, which
agrees with this seat's independent 15/16 + `ctl-splitjs`-out-of-scope result. Reported here only so the integration
note does not cite the superseded 03:38/03:42 receipts.

## 7. Bounds, hashes, cleanup

- Read-only on the lane: no file under `scripts/`, `corpus/`, `probe/`, `controls/`, `open/` or `plan.md` was
  written. Candidate sha256 readings: `50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31` at
  03:41:34, 03:43:23, 03:43:48, 03:45:19 (the last after the whole probe and after `READY` appeared) — unchanged
  before/after, so every result above is for the final shipped bytes. Only this report (`w1/K99Mutation.md`) and
  `K99Mutation/` receipts were written in the lane.
- Planted helper hashes (BASE `f9cd1bff`): `cap-spawn.mjs` `1fde43fb…`, `cap-run.mjs` `e1d0a79b…`.
- Mutant hashes: `K99Mutation/cand-mut-gen.txt`; per-mutant output: `K99Mutation/cand-mutants/*.selftest.txt`.
- Scratch `/fast/scratch/hyaku/kumitate-r99/K99Mutation` removed before yield; no `/tmp` receipt is cited.
- Environment unchanged (no installs, no pacman, no sysctls, no git mutation anywhere).
