# w1 / K100Mutation — K2: do the shipped selftests pin R100?

Seat K100Mutation (mutation tester). Read-only on the lane. Bytes attacked: the K100ExecTool
candidates as published at `READY` — cite `e887b982…ab9ace`, capture `ad3227d6…104355`
(`READY.captured`, `candidates.sha256` in the seat dir; READY was captured after the executor's
final write and its two hashes were re-checked with `sha256sum` against the bytes the panel read:
identical). The lane commit `7c3bca09` carries exactly these hashes; the lane working tree also
showed further uncommitted `scripts/` edits by another seat (`da16e32b…` / `c9f22275…`) at read
time — not mine, and not the bytes measured here.

## Answer

**Candidates: yes, largely — 27/32 mutants killed by the unchanged `--selftest`, including all 15
frozen violating control shapes at pair level.** cite reader line: 22 mutants, 17 killed;
capture reader line: 24 mutants, 22 killed (counts overlap where a shape moves both lines).

**Shipped/BASE selftests: no — 4/32 killed, and all 15 violating shapes survive.** The four kills
are pre-existing happy-path cases (`clean-known-ids`, `clean`), not R100 cases. Independently
reproduces the plan's `controls/OBSERVED.txt` d=1 column (`base-controls-selftest.txt`: 16/16
generated controls exit 0 on both shipped selftests).

## Survivors and their class

| mutant | side that survived | class | should-catch case | frozen counter |
|---|---|---|---|---|
| `M13-unicode-digits` (cite half) | cite | observational equivalent: `citedIds` uses `ID_RE = /\bS[0-9]{3,}\b/g`, so a `\p{Nd}` registry id can never be cited; 0 cite diffs on the 28-row battery | none can exist for cite; pair killed by capture `r100-fullwidth-not-row` | HELD (a=1) |
| `M14-ci` (cite half) | cite | same argument for `/i` (lowercase registry id uncitable) | none; pair killed by capture `r100-lowercase-not-row` | HELD (a=1) |
| `M19-split-crlf` | cite + capture | **equivalent**: `split(/\r?\n/)` strips only a record-final CR; the row regex is a non-end-anchored prefix match, so recognition is identical (0 diffs, 28-row battery) | none (equivalent mutant) | HELD (a=1,b=1) |
| `M29-cite-digits2` | cite | observational equivalent: 1-2 digit registry ids can never be cited (`ID_RE` gates 3+) | none observable; a direct `registryIds` unit case only | HELD (a=1) |
| `M30-cap-digits2` | capture | **NOT equivalent**: `\| S99 \|` becomes a row and is reported `S99:uncaptured` (`m30-2digit-check.txt`: CLEAN vs `DRIFT … first=S99:uncaptured`) | a capture `r100-*` case with a 1-2 digit id cell (bound or unbound) | **HELD — also missed** (battery draws 3-8 digit ids only) |
| `M31-cite-digitsplus` | cite | observational equivalent (same `ID_RE` argument) | none observable | HELD (a=1) |
| `M32-cite-splitany` | cite | **NOT equivalent**: cite reads a row after CR/LS/PS on the same LF record (battery diff S124) | a cite case mirroring `r100-samerecord-cr-not-row` / `r100-samerecord-u2028-not-row` | **UNMET a=0 a_miss=6, two fresh seeds** (`m32-counter-2seeds.txt`) |

## Findings (routed, not fixed here)

1. **Selftest gap G-K2-a (capture):** `{2,}` digit acceptance survives every case. The new arms
   assert 3+-digit ids are rows and malformed 3+-digit ids are not, but no case draws a 1-2 digit
   id cell. Real behaviour change (`S99:uncaptured`), so not equivalent. Needs a capture case.
2. **Selftest gap G-K2-b (cite):** the cite record model (`text.split('\n')`) has no same-record
   CR/LS case; `ctl-splitany` applied to cite survives. The frozen counter catches it, so C1's
   verdict is unaffected, but the selftests do not pin that half of R100. Needs a cite case.
3. **Counter coverage note (not a verdict change, K1/K4 untouched):** the frozen battery draws ids
   of 3-8 digits only, so it cannot distinguish a `{2,}` capture reader (HELD on M30). Per the
   plan, HELD is a refutation budget over drawn classes; this is a limit of the drawn set.
4. **Executor waiver independently reproduced:** the cite halves of `ctl-ci` and
   `ctl-unicode-digits` pass by verdict-equivalence because citations are ASCII `S`+3-9 digits;
   their capture halves are killed. This is structural (`ID_RE` unchanged by R100), not a gap.
5. No harm surface touched: only reader lines were mutated; both candidates' reference selftests
   stay green (`CITE_SOURCES_SELFTEST: PASS (25/25)` + `VERDICT: PASS`;
   `SOURCE_CAPTURE_SELFTEST: PASS (33/33)` + `VERDICT: PASS`, exit 0).

## Receipts (seat dir `.ufo/waves/round-100/K100Mutation/`)

`mutants.md` (32-row table, kill counts, full classification), `mutate.py`, `counter.py`,
`equivalence.mjs`, `report.py`, `COMMANDS.txt`, `cand-e887b982/{mutants.json,selftest.tsv}`,
`baseline-ctlpositive/{mutants.json,selftest.tsv}`, `selftest-ref-{cite,capture}.txt`,
`cand-counters/{counter-results.tsv,counters.log}`, `m30-2digit-check.txt`,
`m32-counter-2seeds.txt`, `base-controls-selftest.txt`, `behavior-cand-*.json`,
`READY.captured`, `candidates.sha256`.

Scratch `/fast/scratch/hyaku/kumitate-r100/K100Mutation/` was used for the mutant trees and the
16 regenerated controls and is removed before yield.
