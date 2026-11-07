# K95ScribeLesson — round-95 w1 (scribe: knowledge entry, mined-mistake counter, correction)

Seat: leaf scribe, no subagents. Writes confined to `.ufo/waves/round-95/K95ScribeLesson/`; scratch
`/fast/scratch/hyaku/kumitate-r95/K95ScribeLesson` removed before yield. No lane or fleet file edited; no
tool installs; the candidate was not attacked (not this seat's role) and no probe was run.

## Delivered

| artifact | what it is |
|---|---|
| `K95ScribeLesson/knowledge-round-gate-registry-shape.md` | draft entry: the 13-field rule (11 cells + 2 edge fields), why the census `NF==13` test and not GFM-aware parsing (both authorities split on a bare `\|`; the census is the authority), what `citations.malformedRows` discloses, S94-5 evidence, fail-closed direction, six limits, receipts. `source:` ids left as `S27x`/`S27y` placeholders beside S271/S033/S267–S269. |
| `K95ScribeLesson/lesson-draft.md` | `## Mistakes` row **M95-1** (class · evidence · captured-by · fix), QUALITY **Q89** draft whose command is the recount, and the append-only SCORECARD correction for round 94 (S271 = 18, S272 = 10). |
| `K95ScribeLesson/wordcount-cmd.txt` | the one-liner: `bash …/wordcount-cmd.txt <lesson.md>`; sha256 `ff63fc45e0d7a944…`; `bash -n` rc=0 |
| `K95ScribeLesson/receipts/` | 12 receipts, all under this seat |

## Recount command (Q89's check)

Extracts every `N words): "<quote>"` pair, counts whitespace-separated words, prints `MISMATCH stated=N
actual=M` per bad pair (exit 1), `WORDCOUNT: CLEAN pairs=<n>` (exit 0), `WORDCOUNT: EMPTY pairs=0` (exit 2,
fail-closed; no pair is not a pass).

| file | output | rc | receipt |
|---|---|---|---|
| `corpus/lessons/round-94.md` | `MISMATCH stated=17 actual=18`, `MISMATCH stated=9 actual=10` | 1 | `receipts/wc-round-94.txt` |
| `corpus/lessons/round-74.md` | `WORDCOUNT: CLEAN pairs=2` | 0 | `receipts/wc-round-74.txt` |
| `corpus/lessons/round-72.md` | `WORDCOUNT: CLEAN pairs=1` | 0 | `receipts/wc-round-72.txt` |
| `corpus/lessons/round-93.md` | `WORDCOUNT: CLEAN pairs=1` (quote contains `` `stopReason: "error"` ``) | 0 | `receipts/wc-round-93.txt` |
| `corpus/lessons/round-40.md`, `round-85.md` | `WORDCOUNT: CLEAN pairs=1` each | 0 | `receipts/wc-round-40.txt`, `wc-round-85.txt` |
| `corpus/lessons/round-9.md` (no pair) | `WORDCOUNT: EMPTY pairs=0` | 2 | `receipts/wc-nopairs-round-9.txt` |

The two round-94 slips match the closure spot-check exactly (S271 18 vs 17, S272 10 vs 9, both undercounts by
one). Extracted quote text per pair is in `receipts/wc-sanity-quotes.txt`, so the passes are non-vacuous
(r74 pair 1 = 23 words, pair 2 = 12; r72 = 12; r93 = 16; r40 = 18; r85 = 14).

## Findings

1. **The count defect is not unique to round 94.** The same command fails three older lessons retroactively:
   r39 (`MISMATCH stated=10 actual=8`), r49 (`stated=15 actual=13`, twice), r73 (`19/20`, `10/9`, `18/17`)
   — `receipts/wc-round-39.txt`, `wc-round-49.txt`, `wc-round-73.txt`. An append-only corpus cannot repair
   them; Q89 therefore binds lessons filed from round 95 on, and the draft says so. If the L1 wants Q89 to
   apply lane-wide, that is a separate, larger decision (4 files; three are historical).
2. **Parser limit disclosed, not hidden.** The closing quote is the last `"` before the next paragraph,
   list item or heading; r93's internal `"error"` (inside backticks) passes, but a quote followed by a
   second double-quoted phrase in the same paragraph would be cut at the later quote and report a false
   mismatch. The criterion's Limit names this and one alternative count phrasing it does not cover.
3. **R94 lesson wording that the correction does not change.** Both quotes stay ≤ 25 words, so no source
   row, admission or verdict moves; the correction is count accuracy only, matching the spot-check's
   classification.
4. **Knowledge entry scope check.** The rule adds no verdict change on today's registry (210 rows,
   `malformed=0`, `open/real-malformed-before.txt`); its discriminating power is fixture clause (a) and the
   selftest, exactly as the plan discloses. The entry's limits say this rather than implying the real
   population exercises the rule.

## Observations (not evidence of a verdict)

`K95ExecTool/round-gate.mjs` was present throughout (`sha256 c5a2f8ac…`, 108330 bytes at 21:38) with no
`READY` file at report time; `K95ExecTool/score1.txt`/`score2.txt` exist. This seat did not run the frozen
counter against it, so these files are not evidence for C95_C1.

## Out of scope / not done

- No attack on `ctl-positive` or the candidate; no `probe95-c1.mjs` run.
- No placement of the entry at `corpus/knowledge/` (lane read-only); no SOURCES row edits, no `used-by`
  extension, no QUALITY/SCORECARD write — the L1 places and re-ids at integration.
- The Q89 draft's "current round's own run" receipt must be written at close against the filed
  `corpus/lessons/round-95.md`.
