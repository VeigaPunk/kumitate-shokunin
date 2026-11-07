# K100Mutation — K2: do the shipped selftests pin R100?

Seat K100Mutation (mutation tester). Attack surface: the two R100 candidates as published by
K100ExecTool at `READY`. Read-only on the lane; every write is under this seat dir or
`/fast/scratch/hyaku/kumitate-r100/K100Mutation/` (removed before yield).

## Bytes attacked

| file | sha256 |
|---|---|
| `K100ExecTool/cite-sources.mjs` | `e887b982eff4bcfe5d15e47b2c105ebabf4b4dd9cae7ec4fdf8599fccdab9ace` |
| `K100ExecTool/source-capture.mjs` | `ad3227d6571838ccefa10aa3778c9777730f5e1ad9a89f03f528d6f2d7104355` |

`READY` (captured verbatim in `READY.captured`, hashes re-checked with `sha256sum` in
`candidates.sha256`): both lines match the bytes attacked — the panel ran against the final
candidates, not a mid-build snapshot. The lane commit `7c3bca09` carries exactly these two
hashes; at read time the lane working tree showed further uncommitted `scripts/` edits by
another seat (sha `da16e32b…` / `c9f22275…`), which are not mine and not the bytes measured
here.

## Method

`mutate.py --cite <c> --capture <p>` rewrites exactly one reader line per mutant (the cite
`const m = line.match(...)` line, the capture `for (const m of raw.…)` loop line, or the cite
record loop for M32) and runs BOTH tools' unchanged `--selftest`. A mutant is KILLED on a side
when the selftest of the tool whose line changed exits non-zero. `counter.py` then re-runs the
FROZEN counter on each per-tool survivor, pairing the mutant with the reference bytes of the
other tool, so (a)/(b) — not the sibling selftest — decide whether the counter catches it.
`equivalence.mjs` fingerprints each pair on a fixed 28-row battery (clean, blank pads 1/4/8,
TAB pad, NBSP/VT/FF/LS/CR/U+3000/U+FEFF pads, 4-SP/TAB/NBSP/U+3000 indents, CR/LS/PS breaks,
CRLF row, S123x, lowercase, fullwidth, no closing pipe, two ids, mid-line row, 1-2 digit ids)
for equivalence classification only. Command lines are in `COMMANDS.txt`.

## Reference (unmutated) selftest PASS lines

```
CITE_SOURCES_SELFTEST: PASS (25/25)
VERDICT: PASS
SOURCE_CAPTURE_SELFTEST: PASS (33/33)
VERDICT: PASS
```

(full output: `selftest-ref-cite.txt`, `selftest-ref-capture.txt`; both exit 0)

## Mutation table — R100 candidates (32 mutants)

| # | mutant | shape | cite selftest | capture selftest | verdict | first killing case |
|---|---|---|---|---|---|---|
| 1 | `M01-nothing` | ctl-nothing | fail | fail | KILLED | FAIL r100-pad-nbsp-not-row — CITE_SOURCES: CLEAN cited=1 |
| 2 | `M02-k99` | ctl-k99 | pass (n/a) | fail | KILLED | case r100-samerecord-cr-not-row: FAIL exit=0 last="SOURCE_CAPTURE: CLEAN captures=1 exemptions=1" |
| 3 | `M03-citeonly` | ctl-citeonly | pass (n/a) | fail | KILLED | case r100-pad-nbsp-not-row: FAIL exit=0 last="SOURCE_CAPTURE: CLEAN captures=1 exemptions=1" |
| 4 | `M04-captureonly` | ctl-captureonly | fail | pass (n/a) | KILLED | FAIL r100-pad-nbsp-not-row — CITE_SOURCES: CLEAN cited=1 |
| 5 | `M05-indent-blank` | ctl-indent-blank | pass (n/a) | fail | KILLED | case r100-indent-tab-not-row: FAIL exit=0 last="SOURCE_CAPTURE: CLEAN captures=1 exemptions=1" |
| 6 | `M06-indent4` | ctl-indent4 | fail | fail | KILLED | FAIL r100-indent4-not-row — CITE_SOURCES: CLEAN cited=1 |
| 7 | `M07-spaceonly` | ctl-spaceonly | fail | fail | KILLED | FAIL r100-blankpad-rows — CITE_SOURCES: DRIFT ghosts=3 first=S911 |
| 8 | `M08-nbsp` | ctl-nbsp | fail | fail | KILLED | FAIL r100-pad-nbsp-not-row — CITE_SOURCES: CLEAN cited=1 |
| 9 | `M09-leadjs` | ctl-leadjs | fail | fail | KILLED | FAIL r100-leadpad-not-row — CITE_SOURCES: CLEAN cited=1 |
| 10 | `M10-trailjs` | ctl-trailjs | fail | fail | KILLED | FAIL r100-trailpad-not-row — CITE_SOURCES: CLEAN cited=1 |
| 11 | `M11-padcap3` | ctl-padcap3 | fail | fail | KILLED | FAIL r100-blankpad-rows — CITE_SOURCES: DRIFT ghosts=4 first=S912 |
| 12 | `M12-noanchor` | ctl-noanchor | fail | fail | KILLED | FAIL r100-trailpad-not-row — CITE_SOURCES: CLEAN cited=1 |
| 13 | `M13-unicode-digits` | ctl-unicode-digits | pass | fail | KILLED | case r100-fullwidth-not-row: FAIL exit=1 last="SOURCE_CAPTURE: DRIFT captures=1 exemptions=0 bad=1 first=S８４６:uncaptured" |
| 14 | `M14-ci` | ctl-ci | pass | fail | KILLED | case r100-lowercase-not-row: FAIL exit=1 last="SOURCE_CAPTURE: DRIFT captures=2 exemptions=0 bad=1 first=s845:uncaptured" |
| 15 | `M15-splitany` | ctl-splitany | pass (n/a) | fail | KILLED | case r100-samerecord-cr-not-row: FAIL exit=0 last="SOURCE_CAPTURE: CLEAN captures=1 exemptions=1" |
| 16 | `M16-vt-blank` | own | fail | fail | KILLED | FAIL r100-pad-vt-not-row — CITE_SOURCES: CLEAN cited=1 |
| 17 | `M17-indent-cap2` | own | fail | fail | KILLED | FAIL r100-indent-rows — CITE_SOURCES: DRIFT ghosts=1 first=S924 |
| 18 | `M18-indent-min1` | own | fail | fail | KILLED | FAIL clean-known-ids — CITE_SOURCES: DRIFT ghosts=2 first=S112 |
| 19 | `M19-split-crlf` | own | pass (n/a) | pass | **SURVIVED** |  |
| 20 | `M20-digits4` | own | fail | fail | KILLED | FAIL clean-known-ids — CITE_SOURCES: DRIFT ghosts=2 first=S112 |
| 21 | `M21-cite-no-close` | own | fail | pass (n/a) | KILLED | FAIL r100-trailpad-not-row — CITE_SOURCES: CLEAN cited=1 |
| 22 | `M22-cite-gflag` | own | fail | pass (n/a) | KILLED | FAIL clean-known-ids — CITE_SOURCES: DRIFT ghosts=2 first=S112 |
| 23 | `M23-cap-mflag` | own | pass (n/a) | fail | KILLED | case r100-samerecord-cr-not-row: FAIL exit=0 last="SOURCE_CAPTURE: CLEAN captures=1 exemptions=1" |
| 24 | `M24-cite-unanchored` | own | fail | pass (n/a) | KILLED | FAIL r100-indent4-not-row — CITE_SOURCES: CLEAN cited=1 |
| 25 | `M25-cap-split-crlf-only` | own | pass (n/a) | fail | KILLED | case clean: FAIL exit=2 last="SOURCE_CAPTURE: FAIL-CLOSED reason=sources doc carries no S### rows" |
| 26 | `M26-cap-indent4` | own | pass (n/a) | fail | KILLED | case r100-indent4-not-row: FAIL exit=0 last="SOURCE_CAPTURE: CLEAN captures=1 exemptions=1" |
| 27 | `M27-cap-no-close` | own | pass (n/a) | fail | KILLED | case r100-trailpad-not-row: FAIL exit=0 last="SOURCE_CAPTURE: CLEAN captures=1 exemptions=1" |
| 28 | `M28-cite-indent-blank` | own | fail | pass (n/a) | KILLED | FAIL r100-indent-tab-not-row — CITE_SOURCES: CLEAN cited=1 |
| 29 | `M29-cite-digits2` | own | pass | pass (n/a) | **SURVIVED** |  |
| 30 | `M30-cap-digits2` | own | pass (n/a) | pass | **SURVIVED** |  |
| 31 | `M31-cite-digitsplus` | own | pass | pass (n/a) | **SURVIVED** |  |
| 32 | `M32-cite-splitany` | own | pass | pass (n/a) | **SURVIVED** |  |

**Selftest kill count (pair level): 27/32.** cite line changed in 22, killed 17; capture line changed in 24, killed 22.

All 15 violating control shapes (M01–M15) are killed at pair level. M13 and M14 are killed
only by the capture arms; their cite sides cannot be killed by any input (see classification
below), which independently reproduces K100ExecTool's arm-teeth waiver.

## Survivors (5 pair-level; 7 changed sides passing their own selftest)

| mutant | side(s) that survived | class | case that should catch it | frozen counter |
|---|---|---|---|---|
| `M13-unicode-digits` | cite | cite side observational-equivalent (ID_RE cites ASCII only; capture side of the same pair is KILLED by r100-fullwidth-not-row) | none can exist for cite (ID_RE); the pair is killed on capture | cite: HELD a=1 b=1 c=1 d=1 |
| `M14-ci` | cite | cite side observational-equivalent (ID_RE cites uppercase ASCII only; capture side of the same pair is KILLED by r100-lowercase-not-row) | none can exist for cite (ID_RE); the pair is killed on capture | cite: HELD a=1 b=1 c=1 d=1 |
| `M19-split-crlf` | capture | equivalent: split(/\r?\n/) strips only a record-final CR; the row match is a prefix match and is not end-anchored, so the recognition function is identical (0 diffs on the 28-row battery; counter HELD) | none: equivalent mutant | capture: HELD a=1 b=1 c=1 d=1 |
| `M29-cite-digits2` | cite | cite observational-equivalent: citedIds extracts only /\bS[0-9]{3,}\b/, so 1-2 digit registry ids can never be cited; no cite input can flip a verdict (counter HELD) | none can exist (ID_RE); a direct registryIds unit case would be needed to observe it | cite: HELD a=1 b=1 c=1 d=1 |
| `M30-cap-digits2` | capture | NOT equivalent: capture binds registry ids directly, so a \| S99 \| row becomes recognisable and is reported uncaptured (battery diff S99); missed by the selftest AND by the frozen counter (its battery draws no 1-2 digit ids) | a capture r100 case with a \| S99 \| row bound/exempted, or \| S99 \| in SOURCES with no binding -> S99:uncaptured | capture: HELD a=1 b=1 c=1 d=1 |
| `M31-cite-digitsplus` | cite | cite observational-equivalent: S + 1+ digits only adds uncitable 1-2 digit ids (ID_RE gates 3+); 0 diffs on the battery; counter HELD | none can exist (ID_RE) | cite: HELD a=1 b=1 c=1 d=1 |
| `M32-cite-splitany` | cite | NOT equivalent: cite reads a row after U+2028 on the same LF record (battery diff S124); missed by the selftest; the frozen counter CATCHES it (UNMET a=0 a_miss=6) | a cite r100 case mirroring r100-samerecord-cr-not-row / r100-samerecord-u2028-not-row (row after CR/LS on the same LF record is not a row) | cite: UNMET a=0 b=1 c=1 d=1 |

Counter receipts: `cand-counters/counter-results.tsv` (one line per genuine changed side; this
rerun dropped the no-op probes the first pass produced when a mutant supplied the reference line
verbatim) and `cand-counters/counters.log` (full stdout, fresh seed each run).

## Shipped (BASE / ctl-positive) selftests — the K2 answer for the pre-R100 bytes

Same 32 mutants applied to `ctl-positive` (BASE tools + the L1 reference reader lines;
regenerated into scratch with `make-controls100.py`, 16/16 controls):

- pair-level killed **4/32**; the surviving 28 include **all 15 violating control shapes**.
- the only 4 kills (M18-indent-min1, M20-digits4, M22-cite-gflag, M25-cap-split-crlf-only) are
  pre-existing happy-path cases (`clean-known-ids`, `clean`), not R100 cases: the shipped
  selftests pin the row grammar only well enough to parse a clean fixture.
- independent run of the 16 generated controls: every one exits 0 on both shipped selftests
  (`base-controls-selftest.txt`) — identical to the frozen `controls/OBSERVED.txt` d=1 column.

| # | mutant | cite | capture | kept? |
|---|---|---|---|---|
| 1 | `M01-nothing` | pass | pass | **survived** |
| 2 | `M02-k99` | pass | pass | **survived** |
| 3 | `M03-citeonly` | pass | pass | **survived** |
| 4 | `M04-captureonly` | pass | pass | **survived** |
| 5 | `M05-indent-blank` | pass | pass | **survived** |
| 6 | `M06-indent4` | pass | pass | **survived** |
| 7 | `M07-spaceonly` | pass | pass | **survived** |
| 8 | `M08-nbsp` | pass | pass | **survived** |
| 9 | `M09-leadjs` | pass | pass | **survived** |
| 10 | `M10-trailjs` | pass | pass | **survived** |
| 11 | `M11-padcap3` | pass | pass | **survived** |
| 12 | `M12-noanchor` | pass | pass | **survived** |
| 13 | `M13-unicode-digits` | pass | pass | **survived** |
| 14 | `M14-ci` | pass | pass | **survived** |
| 15 | `M15-splitany` | pass | pass | **survived** |
| 16 | `M16-vt-blank` | pass | pass | **survived** |
| 17 | `M17-indent-cap2` | pass | pass | **survived** |
| 18 | `M18-indent-min1` | fail | fail | killed |
| 19 | `M19-split-crlf` | pass | pass | **survived** |
| 20 | `M20-digits4` | fail | fail | killed |
| 21 | `M21-cite-no-close` | pass | pass | **survived** |
| 22 | `M22-cite-gflag` | fail | pass | killed |
| 23 | `M23-cap-mflag` | pass | pass | **survived** |
| 24 | `M24-cite-unanchored` | pass | pass | **survived** |
| 25 | `M25-cap-split-crlf-only` | pass | fail | killed |
| 26 | `M26-cap-indent4` | pass | pass | **survived** |
| 27 | `M27-cap-no-close` | pass | pass | **survived** |
| 28 | `M28-cite-indent-blank` | pass | pass | **survived** |
| 29 | `M29-cite-digits2` | pass | pass | **survived** |
| 30 | `M30-cap-digits2` | pass | pass | **survived** |
| 31 | `M31-cite-digitsplus` | pass | pass | **survived** |
| 32 | `M32-cite-splitany` | pass | pass | **survived** |

## Findings (scoped to K2)

1. **K2 verdict for the candidates: the R100 selftest arms do pin R100 on 27/32 mutants**,
   including every one of the 15 frozen violating shapes at pair level. Of the 5 pair-level
   survivors, 3 are equivalent/observationally equivalent (M19, M29, M31) and 2 are real gaps:
   M32 is caught by the frozen counter, M30 is caught by neither (findings 2-4).
2. **Real selftest gap (routed): capture `{2,}` (M30) survives the capture selftest** — the new
   arms assert 3+-digit ids are rows and 3+-digit malformed ids are not, but no case draws a
   1-2 digit id cell. Behaviour differs (`| S99 |` -> `S99:uncaptured`), so it is not equivalent.
3. **The frozen counter also misses M30** (HELD, a=1 b=1): its battery draws ids of 3-8 digits
   only. Per the plan this is a coverage observation, not a verdict change — HELD stays a
   refutation budget over the drawn classes. Reported, not acted on (K1/K4 untouched).
4. **Selftest gap caught by the counter (M32): cite record model.** Cite keeps `text.split('\n')`;
   the capture arms carry same-record CR/LS cases but the cite arms do not. The counter catches
   it (UNMET a=0 a_miss=6, twice on fresh seeds).
5. **Cite-side unkillability of M13/M14 is structural, not a missing case**: `citedIds` reads
   citations with `ID_RE = /\bS[0-9]{3,}\b/g`, so lowercase/`\p{Nd}` registry ids can never be
   cited; the fingerprint shows zero cite diffs. The same argument covers M29/M31 (digit count).
6. **M19 is equivalent**: `split(/\r?\n/)` only removes a record-final CR and the row regex is a
   prefix match (not end-anchored), so no LF record changes recognition. Fingerprint 0 diffs.

## Receipts in this seat dir

- `mutate.py`, `counter.py`, `equivalence.mjs`, `report.py` — harness (cited above).
- `cand-e887b982/{mutants.json,selftest.tsv}` — candidate panel; per-mutant sources + selftest
  stdout were written under scratch `mut-candidate/<mutant>/` (scratch is removed at yield; the
  panel receipts carry the killing case names, so the evidence stands).
- `selftest-ref-cite.txt`, `selftest-ref-capture.txt` — reference PASS lines.
- `cand-counters/{counter-results.tsv,counters.log}` — frozen counter on every genuine survivor.
- `baseline-ctlpositive/{mutants.json,selftest.tsv}` — shipped-selftest panel.
- `base-controls-selftest.txt` — the 16 controls (regenerated under scratch `gen/`) exit 0 on both
  shipped selftests; `m30-2digit-check.txt` — the M30 observable difference on a minimal fixture.
- `behavior-cand-ref.json`, `behavior-cand-M*.json` — 28-row behaviour fingerprints.
- `READY.captured`, `candidates.sha256`, `COMMANDS.txt` — bytes attacked and exact commands.
