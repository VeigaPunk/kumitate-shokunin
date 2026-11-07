# K98Reviewer — C1 (operability) review, round 98

Claim C1: in `declaredPins()`, a line is a registry row iff it matches `^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|`
(ASCII space/TAB pad only), inside and outside the Registry alike; everything else unchanged (R98).

- Candidate: `.ufo/waves/round-98/K98ExecTool/round-gate.mjs`, sha256 `e7c1455e8e8afa1267a35de4f4fce86b007104989aafd6783319cef1bb7ed01f`
  (bytes stable since 01:03; `K98ExecTool/sha256.txt` and the builder's `selftest.txt` name the same sha).
- Base: `scripts/round-gate.mjs` at `7038ee4c`, sha256 `edaa115fa053798665b2694d05bf8cc8389a9cdfae74930eab33398776bea135`
  (verified identical to the lane's working-tree `scripts/round-gate.mjs`).
- Freeze `7038ee4c487d8c8d3116d98ec831b8e754337239`; K4 re-checked:
  `git -C <lane> diff --quiet 7038ee4c..HEAD -- .ufo/waves/round-98/{plan.md,probe,controls}` → clean
  (`plan.md` sha `3639383a…`, `probe/probe98-c1.mjs` sha `7300fc57…`).
- READY was absent during this review (no `K98ExecTool/READY` at 01:18); per the seat spec the
  counter was first run on the regenerated `ctl-positive` (reference rule), then on the candidate
  bytes named by `K98ExecTool/sha256.txt`.
- Receipts: all under `.ufo/waves/round-98/K98Reviewer/` (`handcheck.txt`, `mut-*.out`, `score.txt`,
  `ctl-positive-counter.txt`, `spot.json`, `spot.txt`, `spot-SOURCES.md`, `spot-report.md`,
  `ctl-positive-regenerated.mjs`). Probe work dir: `/fast/scratch/hyaku/kumitate-r98/K98Reviewer/probe*`.

## 1. Edit points (diff base → candidate: 3 hunks, 110 lines; nothing else)

| # | candidate lines | change |
|---|---|---|
| 1 | 118–120 | header doc: the R94 row regex text `\s` → `[ \t]` plus an id-cell clause |
| 2 | 410–411 | `SOURCES_ROW_RE` constant (`/^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/`) and its `/** */` comment |
| 3 | 1792–1871 | new selftest arms (xxviii) (inside, 1831) and (xxix) (outside, 1863) + 8-line comment |

All other lines—section state (r96), 13-field rule (r95), `rejected`, URL/pin extraction,
`outsideRows`/`malformedRows` plumbing and ordering, text lines, contract, imports, exit codes—are
byte-identical to base; no `u`/`i` flags, no `\s` anywhere in the row test (only line 434 tests the
constant, unchanged).

## 2. Rule conformance (hand analysis)

- `SOURCES_ROW_RE` is exactly R98's predicate (line 411); `declaredPins()` body unchanged, so R98's
  admitted set is a strict subset of BASE's and no other branch moves.
- **Invariant asked for:** on every line R98 admits, `fields[1]` is `[ \t]*S\d{3,}[ \t]*` by
  construction, so `fields[1].trim()` (JS) equals the census `$2` trimmed with `[ \t]`. Asserted on
  the 54 R98-admitted lines of the 286-row class matrix: **0 mismatches**
  (`handcheck.txt:INVARIANT`). `\d` without `u` is `[0-9]`, equal to census `[0-9]`.
- **E02 rows inside the Registry** (id cell padded with a non-blank `\s`): R98 refuses them, so they
  no longer declare pins and no longer list as malformed (BASE declared/listed them). The census
  still counts them as table rows and prints `W03` with the invalid id; the frozen DECL definition
  filters `W03` ids to `^S[0-9]{3,}$`, so R98 matches DECL. Confirmed per case: e.g. `R13 lead:VT`
  has `census{W03=1,E02=1}` and the reference declares nothing (`handcheck.txt`).
- **Outside rows:** R98's class equals the census E12 class (`^\|[ \t]*S[0-9]{3,}[ \t]*\|` after the
  0–3-space strip) on all 32 pad classes × lead/trail/both: 18/18 admission-honest rows in the matrix.
- **Malformed:** census `E01` ids filtered to valid ids == R98 `malformedRows` (18/18); invalid-id
  `E01`/`E02` rows are listed by neither side.

## 3. Case hand-check (35 tiny fixtures; each: `bash scripts/sources-census.sh validate --file <case> --today 2026-11-07`)

Reference implementation = R98 written independently in `handcheck.mjs`; `d/o/m` = declared pin /
outside id / malformed id predicted; `AGREE` = census W03-valid / E12 / E01-valid lists equal.

```
R13 lead:none        cell=[S700001 ]          admitted=Y ref{d=1,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=0}  rc=0 AGREE
R13 lead:SP          cell=[ S700002 ]         admitted=Y ref{d=1,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=0}  rc=0 AGREE
R13 lead:2SP         cell=[  S700003 ]        admitted=Y ref{d=1,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=0}  rc=0 AGREE
R13 lead:TAB         cell=[\u0009S700004 ]    admitted=Y ref{d=1,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=0}  rc=0 AGREE
R13 lead:SPTAB       cell=[ \u0009S700005 ]   admitted=Y ref{d=1,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=0}  rc=0 AGREE
R13 lead:TABSP       cell=[\u0009 S700006 ]   admitted=Y ref{d=1,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=0}  rc=0 AGREE
R13 lead:VT          cell=[\u000bS700007 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 lead:FF          cell=[\u000cS700008 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 lead:CR          cell=[\u000dS700009 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 lead:NEL         cell=[\u0085S700010 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 lead:NBSP        cell=[\u00a0S700011 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 lead:U+180E      cell=[\u180eS700012 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 lead:U+2003      cell=[\u2003S700013 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 lead:U+2028      cell=[\u2028S700014 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 lead:U+FEFF      cell=[\ufeffS700015 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 lead:SP+NBSP     cell=[ \u00a0S700016 ]   admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 trail:TAB        cell=[ S700017\u0009]    admitted=Y ref{d=1,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=0}  rc=0 AGREE
R13 trail:VT         cell=[ S700018\u000b]    admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R12 lead:SP          cell=[ S700019 ]         admitted=Y ref{d=0,o=0,m=1}  census{W03=0,E12=0,E01=1,E02=0}  rc=1 AGREE
R12 lead:NBSP        cell=[\u00a0S700020 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=0,E12=0,E01=1,E02=1}  rc=1 AGREE
R13rej lead:SP       cell=[ S700021 ]         admitted=Y ref{d=0,o=0,m=0}  census{W03=0,E12=0,E01=0,E02=0}  rc=0 AGREE
R13rej lead:NBSP     cell=[\u00a0S700022 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=0,E12=0,E01=0,E02=1}  rc=1 AGREE
L13 lead:SP          cell=[ S700023 ]         admitted=Y ref{d=0,o=1,m=0}  census{W03=0,E12=1,E01=0,E02=0}  rc=1 AGREE
L13 lead:NBSP        cell=[\u00a0S700024 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=0,E12=0,E01=0,E02=0}  rc=0 AGREE
L13 trail:TAB        cell=[ S700025\u0009]    admitted=Y ref{d=0,o=1,m=0}  census{W03=0,E12=1,E01=0,E02=0}  rc=1 AGREE
L13 lead:CR          cell=[\u000dS700026 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=0,E12=0,E01=0,E02=0}  rc=0 AGREE
P lead:SP            cell=[ S700027 ]         admitted=Y ref{d=0,o=1,m=0}  census{W03=0,E12=1,E01=0,E02=0}  rc=1 AGREE
P lead:CR            cell=[\u000dS700028 ]    admitted=N ref{d=0,o=0,m=0}  census{W03=0,E12=0,E01=0,E02=0}  rc=0 AGREE
R13 indent:3SP       cell=[ S700029 ]         admitted=Y ref{d=1,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=0}  rc=0 AGREE
R13 indent:4SP       cell=[ S700030 ]         admitted=N ref{d=0,o=0,m=0}  census{W03=0,E12=0,E01=0,E02=0}  rc=0 AGREE
R13 indent:TAB       cell=[ S700031 ]         admitted=N ref{d=0,o=0,m=0}  census{W03=0,E12=0,E01=0,E02=0}  rc=0 AGREE
L13 indent:SPTAB     cell=[ S700032 ]         admitted=N ref{d=0,o=0,m=0}  census{W03=0,E12=0,E01=0,E02=0}  rc=0 AGREE
R13 id:2digit        cell=[ S12 ]             admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 id:lower         cell=[ s700999 ]         admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
R13 id:trailalpha    cell=[ S700998x ]        admitted=N ref{d=0,o=0,m=0}  census{W03=1,E12=0,E01=0,E02=1}  rc=1 AGREE
```

32-class matrix (all pads × lead/trail/both × {inside 13-field, outside, inside 12-field}):
`MATRIX pads=32 rows=286 ref d=18 o=18 m=18 census W03=96 E12=18 E01=96 E02=156 rc=1 agree=true`.
(`W03=96` vs 18 valid: the census prints `W03` for every mined+unused row regardless of id validity;
the frozen DECL filters `^S[0-9]{3,}$`, which is exactly R98's admitted-id set.)

## 4. Candidate spot-check (independent of the frozen counter)

Fixture `spot-SOURCES.md` (report `spot-report.md`): inside `|TAB S301 TAB|` 13-field, `|VT S302 |`
13-field, `|NBSP S307 |` 13-field, `|TAB S303 TAB|` 12-field; before any heading `| S306 |`; Leads
`|TAB S304 TAB|`, `| S305 NBSP|`.

`node round-gate.mjs … --json` → `declared=['a0001101a000']`, `outsideRows=['S306','S304']`,
`malformedRows=['S303']`, 5 unresolved; text mode:
`COMMIT_CITED_DECLARED declared=1 [a0001101a000]`, `SOURCES_ROWS_MALFORMED malformed=1 [S303]`,
`SOURCES_ROWS_OUTSIDE outside=2 [S306 S304]` — exactly the R98 reference (`spot.json`, `spot.txt`).

## 5. Selftest teeth (arms would fail without the change)

Five mutants built from the candidate bytes (`mut-*.out`, each `node <mutant> --selftest`):
BASE `\s`, trail `\s`, lead `\s`, indent `{0,4}`, `S\d{2,}`. Every one: **93/96, with arms (xxviii)
and (xxix) FAIL** (the third failure is the hermeticity arm re-running the suite). The mutant arms
block (candidate lines 1792–1874) is byte-identical to the final candidate's, so the receipts bind
to sha `e7c1455…`. Under `ctl-spaceonly` the TAB rows are refused, under `ctl-nbsp`/`ctl-zs`/
`ctl-asciiws` the NBSP/Zs/VT rows declare or list, and the relevant arm fails in each case; the
builder's `selftest.txt` shows 96/96 PASS on the unmutated candidate.

## 6. Defects

- **Blocker: none.**
- **Non-blocker D1** — header doc, candidate lines 118–120: the insert turned the R94 sentence into
  a comma splice: “ … registry row (`RE`) **whose** id cell is padded with ASCII space/TAB only
  (census `row_pass`, POSIX `blank`), status cell (8th column) is not `rejected`.” The second clause
  lost its relative pronoun (`whose`/`and whose` before “status cell”); it also does not name
  “Round 98 (R98)” the way the R95/R96 clauses name their rounds. Behaviour is unaffected; the
  stated class and the `rejected` condition are factually right, but the sentence no longer parses.
  Fix: “… only (census `row_pass`, POSIX `blank`), **and whose** status cell (8th column) is not
  `rejected`.” (and prefix “Round 98 (rule R98):”).
- Observations (not defects): (i) the frozen DECL is `W03`-derived, i.e. mined rows whose used-by is
  `—`; rows mined with a used-by path still declare pins under R98 (unchanged from BASE) but are
  outside the counter's coverage. (ii) The census prints `W03` for invalid ids too (83/105 on FIX-A),
  so raw `W03` counts never equal `citations.declared`; DECL's `^S[0-9]{3,}$` filter is the right
  comparison and R98 matches it.

## 7. Counter verdict

```
C98_C1: HELD a=1/1 b=1/1 c=1/1 d=81/81 e=1/1 seed=4621cec6b5943a86 tool_sha256=e7c1455e8e8afa1267a35de4f4fce86b007104989aafd6783319cef1bb7ed01f
```
(exit 0; `score.txt`). Context lines: FIX-A declared 22/22, outside 28/28 in order, malformed 22/22
in order; FIX-B 0/0, 78/78, 0/0; TEXT both lines exact; BASE on the same draw: declared 82,
outside 108, malformed 82 (`C98 FIX-A BASE` line). Reference rule on the same counter (regenerated
`ctl-positive`, sha `d5737901…`, `ctl-positive-counter.txt`):
`C98_C1: HELD a=1/1 b=1/1 c=1/1 d=81/81 e=1/1 seed=89059ecc5e380567 tool_sha256=d5737901…`.

Residual risk: the candidate bytes were bound by `K98ExecTool/sha256.txt` (same sha as the file I
reviewed and ran); no `READY` file existed while this review ran. If the builder rewrites the
candidate, the verdict above must be re-bound by sha.
