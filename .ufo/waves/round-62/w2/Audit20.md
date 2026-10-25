# Audit20 — Round60-Receipt: sandbox re-run of round-60 probes vs tip receipts and scorecard/report claims

Seat: `L1Kumitate62.Audit20` (critic, round-62 w2, read-only falsification).
Assignment: re-run the round-60 probes in a sandbox at `a745a3b0`; compare to the close tip
receipts and scorecard/report claims; list every contradiction. No claim plan proposed; no
verdicts on round-62 claims.

## Method (all exercised, none inferred)

- Sandbox: `git clone --no-checkout` of the lane repo → `/tmp/kumitate-r62/Audit20/sandbox`,
  checked out detached at the round-60 work commit
  `a745a3b0e02253e722834ef95042d97ed92e5e53` (probe files used are the rev's own committed
  bytes). Lane HEAD at review time: `0cbe0d75e5a08718e2256408329692908c837766`.
- Probes: `.ufo/waves/round-60/probe/dispatch60-probe.mjs` and
  `doctrine60-probe.mjs` (frozen counters A60/D60), run twice each at the work rev; plus
  single runs at base `ffbfe3cc38ff8eaa6375550b16472c90a006a179` and at HEAD for context.

### Verbatim reruns (sandbox, work rev `a745a3b0`, two runs each)

```
DISPATCH60: DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=A60
 | A1 PASS bytes=12389 | A2 PASS exit=0 verdict=true | A3 PASS findings=6 | A4 PASS row-present | A5 PASS checklist-item | A6 PASS pin-match | A7 MISS row-absent | A8 PASS gate=true mistakes=true name=true | A9 PASS rows=20 prose=20 | A10 MISS exit=2 DISPATCH_EVIDENCE: FAIL-CLOSED wave-dir-absent dir=/tmp/a60-probe.ObY8S4/.ufo/waves/round-60/w1
exit=1            (run 2: identical, token CRIWjn)

DOCTRINE60: DOCTRINE60_HELD held=6/6 checks=6 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=D60
 | F1 PASS fanout=true detect=true | F2 PASS rows=7 | F3 PASS used-by-exact | F4 PASS captures=7 | F5 PASS group=true exit=0 SOURCE_DUPES: CLEAN groups=6 known=6 | F6 PASS admit=true reject=true flips=2 collisions=S125+S127+S136
exit=0            (run 2: identical)
```

Base rev: `DISPATCH60_UNMET held=0/10` exit 1; `DOCTRINE60_UNMET held=0/6` exit 1
(matches `base/dispatch60-base.txt`, `base/doctrine60-base.txt` and the report's base rows).
HEAD rev `0cbe0d75`: `DISPATCH60_UNMET held=9/10` (A7 now PASS `capability-row`; A10 MISS
`exit=2 … FAIL-CLOSED registry-unreadable path=…/w1/dispatch-actual.json`), exit 1;
`DOCTRINE60_HELD held=6/6` exit 0.

## Receipt comparison (close tip receipts, committed `be4a820c`, unchanged at HEAD)

| receipt | committed | my rerun | match |
|---|---|---|---|
| `close/dispatch60-tip.txt` (457 B, 3 lines) | `DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0… rule=A60`, exit=1, A7 MISS + A10 MISS | identical head line, identical exit=1, identical check details | head line byte-identical; detail line identical except the probe's `mkdtemp` token (`L6n7ih` committed vs `ObY8S4`/`CRIWjn` mine) |
| `close/doctrine60-tip.txt` (336 B, 3 lines) | `DOCTRINE60_HELD held=6/6 checks=6 rev=a745a3b0… rule=D60`, exit=0 | identical | full byte-identical (no token) |

Live wave transcript corroborates: `w1/ExecDispatch60.stream.jsonl` records the same 8/10
(A7+A10 MISS, token `ihmnFD`, EXIT=1); `ExecDoctrine60.stream.jsonl` records 6/6 EXIT=0.

## Contradictions (claim → evidence)

1. **SCORECARD.md line 2833 vs its own named receipt.** The round-60 section still reads
   "After: at the measured revision `__MEASURED__` → `DISPATCH60_HELD held=10/10 checks=10`
   exit 0 (`close/dispatch60-tip.txt`)". The cited file reads `DISPATCH60_UNMET held=8/10
   checks=10 … rule=A60`, exit=1; my rerun reproduces 8/10; and *no revision in history
   reaches 10/10* — at HEAD the probe yields 9/10 because no committed round-60
   `dispatch-actual.json` exists (only round-59/round-61 w1/w2 carry one; round-60 w1 has
   only `launcher-progress.tsv`). The same file's appended "Round 61 correction" block
   (lines 2877–2882) explicitly withdraws this sentence ("no committed receipt carries it").
   The scorecard contradicts its own evidence and its own correction; the stale text remains
   in the superseded body. (Placeholder `__MEASURED__` is unfilled here and in the report.)

2. **Filed round-60 report vs work-commit reality.** `.ufo/reports/round-60/kumitate.md`
   ("Before → after measurements"): "work commit `a745a3b0…`: `held=9/10` — the only miss is
   A10". Actual (receipt + rerun + live transcript): `held=8/10` with **both** A7 (capability
   row did not yet name round 60) and A10 MISS. The frozen plan's declared expectation
   (`plan.md:61-63`: "work commit → `held=9/10` … exactly A10 MISS") was also wrong; the
   plan was declared pre-data, but the report states 9/10 as an observed fact. Scorecard line
   2830 already uses the correct 8/10, so the report contradicts the scorecard too.

3. **Filed report vs receipt on the "measured revision".** Same report: "measured rev
   `__MEASURED__`: `DISPATCH60_HELD held=10/10 checks=10 … rule=A60`, exit 0
   (`.ufo/waves/round-60/close/dispatch60-tip.txt`)" and SHONEN "counters at `__MEASURED__`".
   The cited receipt is `UNMET held=8/10` exit 1; `__MEASURED__`/`__TIP__` are unfilled
   placeholders; and 10/10 is unreachable at every committed rev (A10 permanently blocked:
   wave-dir-absent at the work rev, registry-unreadable at HEAD). This is the overclaim the
   scorecard correction withdraws; the filed report still carries it.

4. **C2 measured-revision identity (form, not value).** `SCORECARD.md:2846-2848`: "After:
   `DOCTRINE60_HELD held=6/6 checks=6` exit 0 at the measured revision `__MEASURED__`
   (`close/doctrine60-tip.txt`); the same 6/6 already holds at the work commit
   `a745a3b0`." Substance verified (6/6 at both, receipt + rerun). Residual: the placeholder
   is never filled in the body; the correction block later fixes measured = `a745a3b0`
   (C2 stands). No numerical contradiction.

## Other observations (not predicate contradictions)

- **R61 ExecTipReceipts description drift.** The round-61 w1 executor report described
  `close/dispatch60-tip.txt` as a 4-line/544 B worktree file carrying the appended note "C1
  after-state (10/10) is delivered by round 61 C1 …" with token `oGUwJa`. Today (and at HEAD)
  the file is the committed 3-line/457 B form without the note, token `L6n7ih`. The appended
  note was never committed and is gone from the worktree; current state is clean and matches
  the committed receipt, but the R61 "as landed" description does not match the file as it
  exists.
- `close/dead-seats-r60.md` (untracked during R61 review, LOW-2) is now tracked; consistent
  with the later R60-V6 dead-seat-table commit.

## Smallest safe corrections

- Fill/rewrite SCORECARD line 2833 to read 8/10 at `a745a3b0` (A7+A10) with the round-61
  pointer, and remove the `__MEASURED__` placeholder from the C1/C2 "After" rows (C2 measured =
  `a745a3b0`), so the body matches the already-appended correction block.
- Rewrite the filed round-60 report's C1 measurement rows to 8/10 (A7+A10) at `a745a3b0`,
  drop the 10/10 measured-rev sentence and the `__MEASURED__`/`__TIP__` placeholders, and
  mark C1 unprovable (as the R61 correction and verifier spot-check already do).
- Keep the D60 6/6 statement as-is; only resolve the placeholder identity.

Evidence files: `/tmp/kumitate-r62/Audit20/sandbox` (clone at `a745a3b0`); rerun outputs in
this report; receipts `kumitate-shokunin/.ufo/waves/round-60/close/{dispatch60,doctrine60}-tip.txt`
(HEAD = `be4a820c` bytes); scorecard lines 2829–2834, 2845–2848, 2873–2896; report
`.ufo/reports/round-60/kumitate.md`; live transcripts `w1/ExecDispatch60.stream.jsonl`,
`w1/ExecDoctrine60.stream.jsonl`. No installs/upgrades were made; no pacman transactions.
