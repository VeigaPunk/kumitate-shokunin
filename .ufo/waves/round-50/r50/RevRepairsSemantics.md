# RevRepairsSemantics — pre-data attack on frozen `LEDGER_HELD` (R1–R8)

Seat: reviewer · Target: `.ufo/waves/round-50/probe/repairs50-probe.mjs` (frozen) vs the routed
defects in `corpus/lessons/round-49-verifier-spotcheck.md` §5 and `plan.md` R50-1..R50-10.
Question attacked: *which R-checks can print PASS while the underlying routed defect is NOT
repaired?* For each: `acceptable limit (record it)` or `real hole`.

All reads verified against committed/worktree bytes; commands and outputs inline. The probe was run
read-only against `HEAD` (`6927903`) for state confirmation:

```
node .ufo/waves/round-50/probe/repairs50-probe.mjs . HEAD --fleet /home/vgpnk/Projects/shokunin
  R1 MISS no ## Gate   R2 MISS absent   R3 MISS absent   R4 MISS files=1
  R5 PASS swept        R6 MISS missing  R7 PASS exit=0   R8 PASS erratum
REPAIRS50: LEDGER_UNMET held=3/8 checks=8 rev=HEAD rule=R50  exit=1
```

---

## REAL HOLE — R8 is already satisfied and can never regress (live-fleet read)

`f50d178 2026-10-23 17:46 -0300 "round-50: kumitate report erratum"` landed the `## Erratum` on fleet
`master` *during this wave*, so the probe now prints `R8 PASS` at **any** lane rev — including the
planned `ff40d7d` base. Verified: `git -C /home/vgpnk/Projects/shokunin show
master:.ufo/reports/round-49/kumitate.md` contains `## Erratum` (:123) and all six supersedes tokens
(`01b70bb0` :126, `923a172` :126, `c432cc9`→`c432cc95` :127, `16/16` :129, `15/15` :43/:129,
`64b92866` :3/:133).

Two semantic weaknesses inside the check (probe :109–112):

1. `rep.stdout.includes('## Erratum')` is an **unanchored substring** — a `### Erratum`, a fenced code
   line, or `## ErratumX` all satisfy it. No `^`/`$` anchor, no requirement that it be a real `##`
   heading.
2. The six tokens are required **anywhere in the whole report**, not inside the erratum block. The
   defect was "the report carries no erratum *naming the superseded numbers*" — the check requires
   the numbers to appear in the file but never binds them to the erratum or to the *superseded*
   relation. A `## Erratum` naming nothing, plus the tokens appearing in any other context, passes.
   (Bounded: pre-erratum the report lacked `16/16`/`01b70bb0`/`923a172`/`c432cc9`, so the token
   floor did force *naming* them at landing — but it does not force *relating* them.)

**Verdict: real hole.** Limit (d) in plan.md records live-read *ordering*, but the consequence is
bigger: R8 has **no before/after discriminator** — the frozen control claim "at `ff40d7d` → R8 miss"
is now permanently non-reproducible by rerun (the probe reads today's fleet master regardless of
`<rev>`). The close must state this instead of relying on the recorded "expected UNMET" shape.

## REAL HOLE — R1 word-presence is not a ledger (quoting the defect verbatim passes)

Probe :62–66 requires only that the text between `## Gate` and the next `## ` heading contain the
four substrings `candidates`, `admitted`, `rejected`, `spot-check`. CORPUS.md:19/LEARNING.md:69
require *candidates considered, admitted, rejected with reasons, and the spot-check result* — a
semantic ledger.

Concrete bypass: the routing text itself — spotcheck :134–136, "CORPUS.md requires candidates,
admitted, rejected (with reasons) and the spot-check result" — **contains all four keywords**. A
`## Gate` section whose entire content is a quote of that paragraph passes R1 with zero ledger
content. The check cannot distinguish a real ledger from its own bug report.

**Verdict: real hole** (low exploitability — the L1 will write a real ledger — but the check carries
no discriminative power; record it as a word-floor, not a ledger test). Secondary brittleness:
`/^## Gate\s*$/m` demands a *bare* heading — `## Gate ledger` or `## Gate (addendum)` fails; an
honest variant heading reads MISS.

## REAL HOLE — R6 is R1's weaker twin: two bare headings, zero content floor

Probe :100: `round-50.md` passes with `## Mistakes` and `## Gate` present **and nothing else**.
Two empty sections — the literal r49 defect (a `## Gate` heading with no ledger is the r50 analog of
r49's missing one) — print PASS. R1 at least demands four words; R6 demands none.

**Verdict: real hole** — same class as R1, strictly weaker; `LEDGER_HELD` can certify the r50 lesson
shape while it contains no mistakes and no ledger.

## REAL HOLE (coverage) — routed defect 6 / R50-8 has no counter check at all

Spotcheck defect 6 = wave claims without committed receipts: bare-array `r49-taskcall.json` and
unproven "validator exit 0". Plan R50-8 keeps `context`+`tasks` together for r50. **No R-check reads
`.ufo/waves/round-50/r50-taskcall.json`** — not its shape, not `context` presence, not a validator
receipt. `LEDGER_HELD held=8/8` can print while the taskCall file repeats the r49 bare-array defect.
(`MutSpecDup` covers it ad hoc; the frozen instrument does not.) R50-9/R50-10 are likewise carried by
H3/H1, not the R-ledger — but those are named harm rules, so they are disclosed; R50-8's absence is
not disclosed anywhere.

**Verdict: real hole** — the auxiliary audit binds 5 of the 6 routed lane defects plus two
round-shaped sections; defect 6 escapes with no check and no recorded limit.

## REAL HOLE (minor) — R2/R3: the `DRIFT` verdict can never score, and receipts need no fetch

Probe :73: `/^REOPEN50: (HOLD|DRIFT) /` on the first nonblank line **and** `t.includes('sha256=<pinned>')`
anywhere in the file. Consequences:

- A genuine drift (source's real hash ≠ pinned) is **inexpressible**: the honest receipt
  `REOPEN50: DRIFT … sha256=<new-hash>` reads MISS. The predicate is satisfiable only in the
  no-drift world — `LEDGER_HELD` presupposes HOLD.
- Perversely, `REOPEN50: DRIFT … sha256=<old-hash>` *passes* — verdict and hash are not bound.
- No fetch is needed at all: the pinned hashes sit in plan.md/probe header; a seat can write a
  perfect receipt having never fetched a byte.

**Verdict: real hole on forgeability, acceptable limit on drift-inexpressibility** — *only* because
`RevReopen` independently re-fetches both sources this wave. That dependence is unrecorded in
plan.md's limits: record that R2/R3 check receipt *format*, not occurrence; their strength is
borrowed from the reviewer seat, not the counter.

## REAL HOLE (small) — R5 is lexical, not semantic; and over-broad both ways

Probe :96: `!skill.includes('all eleven') && /Twelve/.test(skill)`.

- A repair to "all **11**", "the **eleven** gates", or `All eleven` leaves the same false count in
  place and passes — the defect is the wrong number, not the phrase.
- Conversely an honest meta-mention ("the phrase 'all eleven' was wrong here") fails — the string is
  forbidden absolutely, even in a correction note. The real sweep at HEAD rewrote both sentences to
  "all twelve" (SKILL.md:595/:598) — fine — but the counter would also pass a *worse* sentence.

**Verdict: real hole** (low exploitability; directionality makes it a necessary-not-sufficient gate;
record the variants blind spot).

## ACCEPTABLE LIMIT — R4 (recorded, needs sharpening)

Plan limit (c) already records "preamble+distinct-bytes, not a temporal proof". Sharper facts worth
recording:

- **Zero-run forgery**: three files, each = `run-at=<distinct ISO>` + a *copied* `BINDORACLE49:
  ORACLE_HELD held=6/6` line (probe :86 accepts the line anywhere in the body) + any filler pass —
  no oracle execution required. Distinctness is `sha(t)` of the whole file (:88), so three different
  timestamps on identical bodies suffice. The defect's real demand — independent executions — is
  unprovable to this counter.
- The receipt's `rev=`/`oracle_sha256=` are **not bound** to the scored rev or the oracle's pinned
  hash — a receipt scoring a different rev counts.
- `Date.parse` leniency (:85): header says ISO but any parseable date works; dates in the past pass,
  so "run-at" need not even be *this round's* wall clock.
- **Every-file strictness**: `recs.every(r.held && !NaN)` (:90) means one malformed or FAILED-run
  receipt among ≥3 kills R4 — mild incentive to delete or not commit failed runs; also `Math.max`
  over a NaN set yields NaN → span check dies on one bad prelude.
- **Integration footgun**: `/ReRunB49-[^/]*\.txt$/` on `ls-tree` paths (:80) counts only files
  *directly* under `.ufo/waves/round-50/` — `r50/seats-ExecSpacingHarness/run{1,2}.txt` (where the
  seat item says to write) are invisible to R4. If the L1 commits only seat-dir files, R4 misses
  despite real runs.

**Verdict: acceptable limit (record it)** — recorded in kind, but the close should state *zero-run
forgery* and *rev/oracle unbound* explicitly rather than the vaguer "forged clock line".

## ACCEPTABLE LIMIT — R7 live-tree read is rev-unbound and unrecorded

Probe :103–105 runs `sources-census.sh validate --root <fleet> kumitate`, which reads
`corpus/SOURCES.md` from the **live working tree** (script :467/:483 `$ROOT/<lane>/corpus/SOURCES.md`,
no rev). So R7 scores tree state at probe time, not `<rev>` state — same asymmetry as R8, but plan
limit (d) records only R8. Also: W-codes never fail (script header: exit 1 only on E/overdue), so the
four pre-existing W04 duplicate-url warnings pass by design — correct, but means R7 is a
*malformation* gate, not a content-quality gate.

**Verdict: acceptable limit (record it)** — add R7 to the live-read limit disclosure.

---

## Scoreboard

| check | defect it audits | could pass unrepaired? | verdict |
|---|---|---|---|
| R1 | routed 2 / R50-2 (Gate ledger) | yes — keyword soup or quoted routing text | **real hole** |
| R2/R3 | routed 3 / R50-3 (reopen receipts) | yes — perfect receipt, zero fetches; DRIFT unread | **real hole** (mitigated only by RevReopen re-fetch) |
| R4 | routed 4 / R50-4 (spaced receipts) | yes — 3 preludes, zero oracle runs | acceptable limit (record sharper) |
| R5 | routed 5 / R50-5 (eleven→twelve) | yes — "all 11" variants keep the false count | **real hole** (small) |
| R6 | round-50 lesson shape | yes — two empty headings | **real hole** |
| R7 | SOURCES well-formedness (live) | n/a to a routed defect; rev-unbound | acceptable limit (record it) |
| R8 | routed 1 / R50-1 (erratum) | already-satisfied; unanchored heading, unscoped tokens | **real hole** — no discriminator left |
| — | routed 6 / R50-8 (taskCall shape) | always passes — no check exists | **real hole** (coverage) |

## Residual risk

The dominant risk is not a dishonest pass — the L1 is producing real repairs — but a **misleading
label**: `LEDGER_HELD held=8/8` reads as "8 conformance properties verified" while 4 of them are
lexical/formal tests with known zero-work bypasses and a 5th (R8) no longer discriminates anything.
The honest close should print the R1/R5/R6 word-floor caveat next to the score, note that R8's pass
predates the close commit, and name the R50-8/taskCall gap rather than implying the routed ledger is
fully audited.

## Verification gaps

- Did not execute mutation runs (MutRepairsMutants/MutReceiptSyntax own those); all verdicts here are
  code-read + state observation (`HEAD` probe run above, fleet `git show`, `git log`).
- R7's live-read claim rests on `sources-census.sh` :467/:483 path construction, not a strace of the
  run — read-only confirmed.
- Reopen receipts `ReopenS095/098.md` exist in the worktree with spec-format first lines
  (`REOPEN50: HOLD … sha256=… fetched=2026-10-23`) but are uncommitted as of `6927903`; their HOLD
  honesty is RevReopen's seat, not re-derived here.

Tool installs: none (bash/coreutils/git/node only; pacman untouched).
