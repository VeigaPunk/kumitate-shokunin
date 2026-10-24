# RevEntry — review of the C2 entry draft `fail-closed-clock-validation`

Seat: RevEntry (reviewer). Leaf, time-boxed. Review window 2026-10-24 04:00–04:18Z.
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (read-only for this seat).

**Bytes reviewed (pinned):** `build/ScribeEntry/fail-closed-clock-validation.md`,
20,138 B, sha256 `dbaed764f234427436052627e485c35f11348393f164bb7c9b24ca5c7f09d672`,
mtime 2026-10-24 01:10:14 −0300. The seat revised the draft three times during review
(17,959 B → 19,288 B → 20,138 B); findings and line numbers below were re-verified on the
pinned newest bytes, and the key defects (F1, F2, F3) are present in all three snapshots.
Later edits are not covered. Companion row draft: `build/ScribeSources/SOURCES-delta.md`. Frozen material:
`plan.md` §C2, `probe/doctrine52-probe.mjs` (D52 v1), `base/doctrine52-base.txt`,
`corpus/SOURCES.md`, `scripts/sources-check.mjs`, `scripts/receipt-attest.mjs`, and the
scout/exec artifacts named in the text.

## Headline

The draft is substantive, its provenance discipline is unusually honest, and its nineteen
real bindings all verify. It is **not ready to commit as-is**: one clause misstates the
artifact it binds (F1), eight clauses — including all of the entry's *new* evidence — sit
behind non-hash `FILL-AT-INTEGRATION` markers (F2), and one wording contradiction should be
closed (F3). The frozen counter catches none of this. Staged faithfully (base tree at
`f539a71e` + the pinned draft at the entry path + S102 `spec` / S103 rows inside
`## Registry`), rule D52 reads:

```
DOCTRINE52_HELD held=5/5 checks=5 rev=338cb8b0774da975d4aaf8fbce48bae7be259b72 rule=D52
| E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS          exit 0 (measured)
```

while `clauses=27`, `bound=19`, `fill=8`. `HELD` certifies the shape contract; it does not
certify clause-level evidence completeness, claim-to-binding relevance, or truth.

## Findings — entry content

### F1 (HIGH, blocking) — Clause "Static arms alone are not a counter" (line 141) misstates the artifact it binds

Text: "a verdict-printing stub cleared r51's static arms at held=5/5". The bound file says
otherwise: `w1/CritC1.md:56` — "A bounded, real-execution stub cleared both and every A1–A4
arm … no full `ATTEST_HELD held=5/5` reading is claimed"; `:157` — "clears all four
behavior-facing arms" (`4/4`); `:20` — v3's added arms reject the same stub at `run` (exit 64,
no receipt). The hash verifies, so E2 is silent; the clause asserts a reading its own receipt
explicitly disclaims. Fix to `4/4` and add the v3 rejection — that is the sharper point the
entry wants (a stub is only excluded by behavior-sensitive arms).

### F2 (HIGH, blocking) — Eight clauses, including the entire new-evidence block, are unbound; five are fillable now

Lines 175–182 carry `@sha256:FILL-AT-INTEGRATION-1…8`. The marker is deliberately not 64
hex, so E2 ignores those clauses (`bound=19` of `clauses=27`) and the draft still reads HELD
(measured). These are exactly the entry's new evidence: S102 body, S103 body, S103 quote
file, the clock sweep, three receipts, and the extracted v1 instrument. Consequences:

- The C2 contract's "≥12 receipt-bound clauses" floor is met by precedent bindings alone; the
  new claims can stay unbound and the predicate still holds. This is the gap to close by
  discipline, not by the counter.
- Five of the eight are fillable *today* and each already prints its hash on the same line. I
  verified all five against the working tree / freeze rev:
  `9ab2b8864a85dca73a88f49b0927bc7bc85f596926e4fd1890905777924e700a` (S102, 35,064 B);
  `9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140` (S103, 172,329 B);
  `a7d6e7a17bb4733f57bc539be3d91defe2e6f7e238274e1adfa8e79a40f2ab3b` (quote.json);
  `a775d5f3d89f1f0b4a83361d54616f4089610075a0cb6ceb839489bc0409ff46` (clock-sweep.txt);
  `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` (v1 instrument via
  `git show f539a71e:scripts/receipt-attest.mjs`, equal to the plan's v1 pin).
  A committed clause that names a hash in prose while binding a placeholder is internally
  inconsistent. Fill the five before commit; only the three receipts legitimately wait.
  Re-run D52 afterwards and record `bound=27` as part of the close evidence.
- The draft's own rule against binding rewritten blobs (lines 184–191) is correct and should
  survive integration verbatim.

### F3 (MEDIUM) — "Rolled month" wording still contradicts the measured mechanism in the same file

Line 92 states the measured truth ("`2026-13-01` … yields `NaN`") and line 147 corrects the
probe header's "rolls month 13 into January 2027" sentence; but the R52-1 heading (line 91)
still reads "the rolled clock", line 114 lists "rolled month" among the selftest arms, and
line 129 says "a receipt re-dated to a rolled month still read VALID". Month 13 is
unparseable, not rolled. Measured here on node v24.21.0: `Date.parse('2026-13-01T00:00:00.000Z')`
= NaN; the finite roller is `2026-02-30` → `2026-03-02`, which the draft already states.
Reword the three spots to "non-finite month field (`2026-13-01`)" so the case study names one
mechanism. (The sweep artifact's script variable `v1_iso_re_accepts_rolled` is the likely
source of the loose term; the entry should not inherit it.)

### F4 (LOW) — ABNF snippets are normalized, not byte-exact

Line 55 writes `date-month = 2DIGIT ; 01-12` and `date-mday = 2DIGIT ; 01-28, 01-29, 01-30,
01-31 based on month/year`; saved RFC 3339 line 406 is `date-month      = 2DIGIT  ; 01-12`
and line 407 wraps after "based on". Semantics are unaffected (ABNF whitespace), but quotes
attributed `(S102 §5.6)` elsewhere in the corpus are byte faithful; add "spacing normalized"
or reproduce the wrap.

### F5 (LOW) — Clause "Suite independence" (line 140) count not independently recounted

The bound file does show the fresh `mktemp -d` protocol and a real sabotage control that
reads red (`w1/ExecSelftestExec.md:4-7,103-110`), so the substance holds; the "27-case" number
rests on the round-51 plan text. Fine to keep, but do not cite it as fresh measurement.

### F6 (LOW) — Stale dependency note (lines 193–197)

The note says `build/ExecClockSweep/` had no transcript and `build/MutCounter52/` had no
`counter-mutant.txt` at drafting. Both now exist (`ExecClockSweep/clock-sweep.md`,
`MutCounter52/counter-mutant.txt`); the note will read as stale in committed bytes. Either
update it to point at the landed artifacts or drop it — the entry's own `clock-sweep.txt`
binding remains valid either way.

## Findings — companion rows and integration coupling

### F7 (MEDIUM) — The scout's S102 proposal row is enum-invalid; ship the `spec` variant

`w1/ScoutRfc3339.md:29` and `build/ScoutRfc3339/sources-row.txt` give `kind = standard`, which
is outside the frozen enum `{spec, docs, paper, code, tool, dataset, talk, book, community,
own-work}`. Measured: with `standard`, `scripts/sources-check.mjs` prints
`SOURCES_CHECK: DRIFT (KIND_ENUM)` exit 1, which breaks E4 and the D52 predicate.
`build/ScoutRfc3339/sources-row-spec.txt` uses `spec`. ScribeSources already swapped and
recorded the deviation (`SOURCES-delta.md` F1); integration must take that ready block, not
the report row. Its two ready lines are structurally intact (12 pipes, 13 split fields,
complete used-by path — the "…" seen in some renders is display truncation, verified).

### F8 (MEDIUM) — Rows and entry must land in one commit; the eight pending paths are absent at the freeze rev

`git ls-tree -r --name-only f539a71e .ufo/waves/round-52/build` = 0 files; `w1` = 0. The
pending paths do not exist as blobs at `f539a71e`, and `USED_BY_MISSING` (E11) fires if a
`mined` row names an absent entry path. Round 51's precedent committed these classes (96
`round-51/build`, 33 `w1`, 65 `w2`, 9 `receipts` at `f539a71e`), but the plan's close sequence
does not enumerate them. Integration must (a) land the entry and both rows together,
(b) commit `build/` and `receipts/` bytes before R1 is measured, and (c) fill F2's five
bindings before R1.

## Findings — frozen D52 counter (measured probes)

### C1 (MEDIUM) — E2 accepts twelve copies of one binding

Twelve near-identical `- ` lines repeating a single correct binding read `E2 PASS` (fixture
rev `1fd6f3eada9606120f28b8979429bf32a53e8d86`). No distinctness requirement. The pinned
draft is clean on this (18 distinct paths over 19 bindings), but `E2 PASS` must not be read
as twelve independent pieces of evidence, now or at close.

### C2 (MEDIUM) — E2 false-MISSes on non-UTF-8 blobs

E2 hashes `Buffer.from(git show … stdout)` after a UTF-8 decode. A clause carrying the
correct sha256 of a file containing `0xFF 0xFE` reads `E2 MISS … hash-miss=12` (fixture
`dd700208c5fae8d9cf46c6053b20fe7b7416b6c6`). Bind UTF-8 text only (the draft does); a
captured binary/terminal transcript binding would be unpassable and would read as forgery.

### C3 (MEDIUM) — E1/E3 do not bind citations to the source rows

E3 checks only `c[8] === 'mined'` and `c[11].includes(entry)`; placeholder title/quote/tier
cells still read `E3 PASS` (fixture). E1's URL test is an unanchored substring
(`rfc-editor\.org/rfc/rfc3339`). So "citations match the scouts' saved bytes" is manual. I
did it: line 1 URLs and both body hashes/byte counts match; S102's saved bytes are
byte-identical to a live re-fetch of `https://www.rfc-editor.org/rfc/rfc3339.txt` on
2026-10-24T04:05Z (1011 lines, same sha256); the S103 14-word quote occurs exactly once at
saved-HTML byte offset 99350, line 1765. L1 must re-diff line 1 and every source clause after
integration edits.

### C4 (LOW) — E1's window is looser than the gate that matters

`sources-check.mjs` requires line 1 to start with `source:` and extracts cited ids only from
line 1; `verified-at:`/`recheck:` must be within five lines. The draft satisfies the stricter
rule (lines 1–3). E1 alone would accept a trio split across lines 1–5 with ids off line 1.

### C5 (LOW) — Entry-absent early return prints `held=0/5` without executing E2–E5

On the pristine base tree `sources-check` prints `SOURCES_CHECK: CLEAN …` exit 0 and the
census exits 0, so a real execution would read 2/5, not the `held=0/5 checks=5` the probe
hardcodes on that path. Verdict and K5's kill are unaffected; `base/doctrine52-base.txt`
overstates execution under Q43's wording.

### C6 (LOW) — E5 is not rev-bound

E5 runs the live fleet census on the working tree, not the extracted rev; it reads PASS on
fixtures outside the lane (measured). Close idempotence rests on E1–E4.

## Verified positives (evidence for what holds)

- **Same-line binding rule (round-51 D2 class) is closed.** A binding wrapped onto a
  continuation line reads `E2 MISS clauses=12 bound=0` (fixture
  `298779d17cf663245479a128a5845dd7360ba5b0`); the regex runs per `- ` line. All nineteen
  draft bindings sit on their clause line.
- **Nineteen of nineteen 64-hex bindings verify at `f539a71e`** (`git show <rev>:<path> |
  sha256sum`): attest52-base, attest52-probe.mjs (twice), plan.md, doctrine52-base,
  invocation-attestation, CritA3eGap, CritA2Span, attest-run-1, attest51-probe, CritLedger,
  RevInstrumentContract, ExecSelftestExec, CritC1 (hash yes, claim no — F1), attest-base-v3r6,
  RevengerGap, doctrine51-probe, ReRunB49-1, baseline-gates. 18 distinct paths.
- **Spot-checked claim support** (beyond the hash): `CritA2Span` carries the
  `[-60,000,+60,073]` tolerance; `baseline-gates` shows `A_DRIFT +2`, `C2_TOTAL_DRIFT +1`,
  `AXES_DRIFT 10 vs 9`; `attest-base-v3r6` reads `held=0/9`; `RevengerGap` carries the Q39
  ceiling. Only F1 misstates its bound file.
- **E1 passes on the pinned draft** (trio lines 1–3; S102/S103 and the rfc-editor URL on line
  1). **E4 passes** with the `spec`-kind rows inside `## Registry`.
- **The R52-8 measurement is now direct, not inferred**: `clock-sweep.txt` runs v1's own
  extracted bytes and records `TZ=UTC` → `RECEIPT: VALID` exit 0; `TZ=Asia/Tokyo` and
  `TZ=America/New_York` → `RECEIPT: TAMPERED` exit 1 (sweep lines 24–26, 42–44, 56–58),
  matching the entry's lines 95–102. The cited v1 extraction hash equals the plan pin.
- **The month-13 correction clause (line 147) is the entry's best honesty move**: it quotes
  the frozen probe's wrong sentence verbatim and corrects it with measurement. Keep it; F3 is
  only about the remaining loose wording elsewhere.
- **S103 provenance is solid**: 172,329 B, `9c120292…`; quote unique at offset 99350 / line
  1765; row enum-clean (`docs`, B, mined, used-by filled).

## Residual risk and gaps

- Substantive review beyond the four spot-checked clauses is L1's: a bound, hash-matching
  path can still be irrelevant to its clause (F1 is the observed instance).
- The staged HELD reading used rows I assembled from `sources-row-spec.txt` + `S103-row.md`
  (ScribeSources' delta landed afterwards and agrees); it proves the counter's posture on the
  pinned draft, not that the integration commit will be byte-identical.
- The draft was still being revised during review; the pinned hash above is the reviewed
  state. Any later edit needs at minimum a re-run of D52 plus a re-read of the edited clauses.
- No `lsp` device is exposed in this seat; artifacts are Markdown corpus plus an `mjs`
  counter, and counter behavior was established by execution, not navigation — no text search
  is presented as semantic proof.
- Tools installed or updated: none. Network: one `curl` re-fetch of the official RFC 3339 URL
  for byte comparison. Scratch fixtures live in `/tmp/rev52-*`; the only lane write is this
  report.

Report: `.ufo/waves/round-52/w1/RevEntry.md`
