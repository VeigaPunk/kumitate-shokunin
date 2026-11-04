# Counter-receipt discrimination — an internal-consistency check is not an oracle

source: S245 — Hossain & Dwyer, *A Brief Survey on Oracle-based Test Adequacy Metrics*
(arXiv:2212.06118v3, § Abstract; https://arxiv.org/abs/2212.06118v3, opened 2026-11-04);
own-work — `.ufo/waves/round-85/plan.md` (contract `kumitate-counter-receipt-v2`),
`.ufo/waves/round-85/probe/probe85-c1.mjs`, `.ufo/waves/round-85/controls/`
verified-at: 2026-11-04 — `node .ufo/waves/round-85/probe/probe85-c1.mjs --lane . --work <scratch>`
reads `C85_C1: HELD held=20/20` exit 0 at the integrated tree
(`.ufo/waves/round-85/build/K85Scribe/receipts/probe-integrated.txt`);
`node .ufo/waves/round-85/controls/content-variation.mjs --lane . --work <scratch>` reads
`CONTENT_VARIATION: HELD held=3/3 distinct_sha=true` exit 0
(`receipts/cv-integrated.txt`); the three committed control tools re-score
`1/20`, `0/20`, `1/20` (`receipts/control-{base,stub,noreader}-probe.txt`);
the same-path control against each of them reads `0/3` (frozen receipts
`.ufo/waves/round-85/controls/cv-{base,stub,noreader}.txt`)
recheck: re-run the two frozen gates above and the three control tools from the committed
controls; re-open S245 only if arXiv publishes a v4 abstract (cadence 180d)

## The defect class

A counter transcript is a claim about a counter's run: rows
`<PREFIX> arm <name> ok|FAIL` and one summary `<PREFIX>: HELD|UNMET held=N/D`. The round-83
receipts carried 28 arm rows under a `held=27/27` headline with one `FAIL` row: internally
inconsistent, so v1's arithmetic (`ARMS_TOTAL`) caught the *receipt*. Round 84 froze a 16-arm
probe over that instrument and the claim did **not** admit: a six-line program that never
opened a receipt printed the same 16 labels and reached `held=16/16`
(`.ufo/waves/round-84/build/K84Critic/no-work-probe-node.txt`). Internal consistency is not an
oracle — a printer can be consistent, and coverage counts executed code, not the quality of the
oracle that judges it (S245: "it does not provide any insights into the quality or quantity of
test oracles").

## What v2 binds

`kumitate-counter-receipt-v2` answers from inputs it must actually open:

```
COUNTER_RECEIPT: CLEAN | DRIFT <TOKEN> | FAIL-CLOSED <TOKEN> | USAGE
RECEIPT: bytes=<n> rows=<r> held=<h>/<d> findings=<token|none> sha256=<64hex|->
SOURCE: sites=<n> declared=<n|absent> receipt=<r>          # only with --src
```

- **Bytes.** `sha256` is the digest of the exact file read, `bytes` its UTF-8 length. A receipt
  that is not opened cannot produce them; a per-run metadata line (`rev=<nonce>`) moves the
  digest without moving the parse, so a canned answer is wrong on every run.
- **Source binding (`--src`).** The receipt's arm names must be literal `arm('<name>')` call
  sites in the counter source (not preceded by an identifier character), the row count must
  equal the site count, and the last declared `const|let|var ARMS = <int>` must agree with both.
  This is the r83 `const ARMS = 27` versus 28 call sites defect caught from the source *before*
  the counter runs: the r83 *repair* receipt (28/28, clean under v1) reads
  `DRIFT SOURCE_DECLARED` with `SOURCE: sites=28 declared=27 receipt=28`.
- **Precedence** is fixed and one finding wins: malformed (2) `SUMMARY_COUNT`,
  `ARM_MALFORMED`, `ARMS_EMPTY`, `SUMMARY_ORDER`, `RECEIPT_UNREADABLE`; drift (1) `ARMS_TOTAL`,
  `ARM_DUPLICATE`, `ARM_PREFIX`, `HELD_COUNT`, `ARM_FAILED`, `VERDICT`; source (2)
  `SOURCE_UNREADABLE`, `SOURCE_ARMS_EMPTY`; source drift (1) `ARM_UNBOUND`, `SOURCE_ARITY`,
  `SOURCE_DECLARED`. Zero arm sites is fail-closed, never vacuous; a receipt finding outranks a
  source finding.

## Control classes a claim must freeze before data (Q78)

1. **Absent tool** — the probe scores the base tree; the work must be the difference.
2. **Constant printer** — a stub that always answers `CLEAN`/`HELD`.
3. **Label-keyed no-reader** — the round-84 kill class: canned answers keyed on the input's
   label, never opening it.
4. **Same-path content variation** — one receipt path written three times with different
   content must produce three distinct answers and three distinct digests.

Measured for round 85 with the frozen 20-arm probe: base v1 `1/20`, constant `0/20`,
no-reader `1/20`; content-variation `0/3`, `0/3`, `0/3`; the integrated v2 `20/20` and `3/3`
(`.ufo/waves/round-85/controls/`,
`.ufo/waves/round-85/build/K85Scribe/receipts/`). The probe's arms assert exit
**and** the derived `RECEIPT:`/`SOURCE:` lines, so a partial printer fails the arms whose
expected values come from bytes it did not read.

## Limits

- **Not authentication.** A forged receipt that is internally consistent **and** source-bound
  still passes. The digest binds the bytes read, not their provenance; custody is the committed
  blob. Measured: a two-row receipt with no counter behind it reads `CLEAN` exit 0.
- **Byte dependence is not comprehension.** The frozen gates measure that the answer *depends
  on bytes read*, not that the transcript was understood. Two attack lanes reproduce this
  against the frozen probe: one keyed on the content digest of the receipt body
  (`.ufo/waves/round-85/build/K85Scribe/receipts/blind-content-keyed-probe.txt`, `20/20` exit 0,
  and `.ufo/waves/round-85/build/K85Scribe/receipts/blind-content-keyed-cv.txt`, `3/3` exit 0),
  and one that reads only the 21-byte nonce
  header and replays a static table
  (`.ufo/waves/round-85/build/K85Scribe/receipts/blind-nonce-read-probe.txt`, `20/20` exit 0). A lane
  that satisfies both frozen gates need never parse an arm row. The claim's guarantee is
  *byte-bound*, not *semantic*.
- **Grammatical scope.** A transcript-shaped line is a summary only at column zero; a leading
  token (an `arm` row indented, a prefixed summary) is not significant, so it hides from the
  verdict while the `RECEIPT:` line stays truthful. Measured: a receipt whose second arm row is
  indented reads `CLEAN` with `rows=1 held=1/1` — the red row is invisible to the parse and
  visible in the byte count. Only the frozen arm/summary grammar is supported; other counter
  formats, JSON receipts and selftest-only output are outside it.
- **Textual source binding.** Literal `arm('…')` extraction is not an AST: a call site inside a
  comment or string binds (and can force a false red), and a non-decimal `ARMS` literal
  (`0x1`, `1e3`, `3.5`) is treated as no declaration (`declared=absent`) rather than parsed.
  The lane's counters declare decimal integers.
- **No liveness or size bound.** An ordinary read can block on a FIFO or exhaust memory on a
  huge input; the instrument is for trusted committed regular receipts. No hostile-filesystem
  safety claim.
- **No source digest.** The `SOURCE:` line names the counts it extracted, not the source bytes;
  a source edit that keeps the same call-site roster is invisible.
- Transcript arithmetic is not semantic correctness: a green counter can still test nothing —
  v2 raises the cost of a vacuous *answer*, not of a vacuous *test*.
