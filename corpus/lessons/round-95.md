# kumitate round 95 — lesson (`round-gate` trusts a registry row only in the census shape; attempt 1)

Frozen at lane commit `ee8479be66acd906f1d2b5f24f1b75a3d9172c1b`: `.ufo/waves/round-95/plan.md`, counter
`probe/probe95-c1.mjs`, control generator `probe/make-controls95.py`, 8 pre-data controls, `open/` receipts. The
round-94 verifier spot-check was adopted into the README map **before** that freeze (`eadd519d`,
`close-l1/adopt-r94-spotcheck.txt`: DRIFT → CLEAN) — the M94-1 ordering held this round. Wave spec + validated
dispatch `65c3374d`; integration M = `ce58e03ebb5a9c4ca65793099390c565b2c1bdde` (`scripts/round-gate.mjs` sha256
`7aaf00825e836465e3ab767ef7cb01453b7c7443cd6927e9581c7e88a3c39e58`).

Claim C1 operability (lowest non-retired axis, integer 9 terminal): `declaredPins()` read the status at
`line.split('|')[8]` with no field-count check, so an unescaped `|` shifted a `rejected` status out of view and the
row still declared its pin (K94Sentinel S94-5), and short/long rows declared from whatever cell landed at index 8.
Frozen rule: a registry row declares pins only when `line.split('|')` yields exactly 13 fields (census `NF==13`); any
other count declares nothing and its id is appended, in file order, to the always-present `--json`
`citations.malformedRows`.

## Gate

- **admit — `scripts/round-gate.mjs` (M `7aaf0082…`).** K95ExecTool built the rule (READY `c5a2f8ac…`, selftest
  79 → 86, `C95_C1: HELD` ×2 in `K95ExecTool/score{1,2}.txt`). L1 integration (`close-l1/integration-diff-ready-vs-M.txt`):
  (1) the round-94 `COMMIT_CITED_DECLARED` text line keeps its exact format and malformed rows get their own
  non-finding line `SOURCES_ROWS_MALFORMED malformed=<n> [<ids>]` (K95Reviewer non-blocker 2: the READY bytes had
  changed the r94 line); (2) arm (xviii) now really builds a 14-field row (K95Reviewer non-blocker 1: it built 15);
  (3) arm (xxi) puts every clause K95CriticA showed the counter blind to into one registry — URL-less, 3-space
  indented, repeated and low-sorting malformed rows listed in file order, a CRLF 13-field row and an off-enum
  status still declaring — plus a text-mode arm. Selftest 88/88. Re-mutation (`close-l1/integration-remut.txt`): the
  shipped selftest kills all six frozen forgery shapes and all nine K95CriticA constructions, **15/15**.
- **admit — S273** (GFM spec, Tables extension), opened 2026-11-07 (UTC) by K95ScribeSources and re-opened by the
  L1 (`close-l1/l1-reopen-s273-s274.txt`, HTTP 200, sha256 `b153d814…`); quote (§4.10, sentence before Example 200, 15 words): "Include a pipe in a cell’s content by escaping it, including inside other inline spans:"
  It grounds why the lane's census shape is stricter than GFM: an escaped pipe is GFM content but a census field.
- **admit — S274** (POSIX awk, Issue 8), opened 2026-11-07 (UTC), re-opened by the L1 (HTTP 200, sha256
  `6df7d077…`); quote (§ Regular Expressions, FS item, 18 words): "Otherwise, if FS is any other character c, fields shall be delimited by each single occurrence of c."
  It is the mechanism behind the census `awk -F'|' … NF!=13` test the gate now mirrors.
- **admit — QUALITY Q89** (a stated quote word count is recounted by a command before filing): shown able to fail
  on round 94 (`K95ScribeLesson/receipts/wc-round-94.txt`, two MISMATCH lines, rc=1) and to pass on rounds 74 and 93
  (rc=0); this lesson's own run is `.ufo/waves/round-95/close-l1/q89-round-95.txt`.
- **reject — GFM-aware row parsing** (honouring `\|` as cell content, S273). Reason: the lane's two registry
  validators (census E01, `sources-check.mjs:261` `ROW_MALFORMED`) split on a bare `|`; a GFM-aware gate would trust
  rows both validators refuse — a second authority on one file. Flip: the census contract adopts an escape.
- **reject — "the frozen counter pins the rule's clauses"** (K95CriticA): 9 of 9 rule-violating constructions
  (`atk-urlonly`, `-sorted`, `-dedupe`, `-crlf`, `-vocab`, `-nofailclosed`, `-hardcode`, `-dupskip`, `-noindent`)
  reach `C95_C1: HELD` (`K95CriticA/receipts/atk-*.txt`). The frozen fixture's four malformed rows are LF,
  unindented, distinct, URL-bearing and ascending. Constructions are not kill events under the frozen rule; the
  shipped bytes rest on the selftest (15/15 above) and the reviewer's hand read, not on the counter alone.

### Rows touched (old → new)

- New: S273, S274 (status `mined`, recheck `on-release`, used-by `corpus/knowledge/round-gate-registry-shape.md`).
- No existing row's `status`, `recheck` or `used-by` changed.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M95-1 — a located quote's stated word count was never re-derived from the quote.** Round 94's `## Gate` printed 17 and 9 beside quotes of 18 and 10 (both undercounts by one, both still ≤ 25, no admission changed). | `corpus/lessons/round-94-verifier-spotcheck.md` §1 defect (b), §5 item 4; `bash .ufo/waves/round-95/K95ScribeLesson/wordcount-cmd.txt corpus/lessons/round-94.md` → `MISMATCH stated=17 actual=18`, `MISMATCH stated=9 actual=10`, rc=1 (`K95ScribeLesson/receipts/wc-round-94.txt`) | none (CORPUS "a count carries its command" was prose; only the non-author closure caught it by hand) | QUALITY Q89, shown able to fail (r94 rc=1) and pass (r74, r93 rc=0); this lesson passes it (`close-l1/q89-round-95.txt`). Correction appended in SCORECARD (`## Round 95 — named correction to round 94`). |
| **M95-2 — the frozen counter again certified a fixture tuple, not the rule's clauses** (same class as K94CriticA, r94). Nine wrong gates reached HELD; four of the nine clauses were named in the round-95 pre-registration item (2) as latent and still were not armed in the counter's fixture. | `.ufo/waves/round-95/w1/K95CriticA.md`; `SCORECARD.md` `## Round 95 pre-registration` item (2) | Q85/Q86 (class sampling, arm every field class) — the fixture drew each clause once, in one shape | Shipped-selftest arm (xxi) kills all nine (`close-l1/integration-remut.txt`); routed: the next frozen counter carries a clause battery (URL-less, indented, repeated, low-sorting, CRLF, off-enum, fail-closed `--json`) before the freeze. |

## Verdicts

- C1 frozen predicate at M: `C95_C1: HELD a=1/1 b=1/1 c=78/78 d=1/1 tool_sha256=7aaf0082…` twice
  (`.ufo/waves/round-95/close/probe1.txt`, `probe2.txt`). Do-nothing control `UNMET a=0 b=0 c=0/78`; six forgeries
  UNMET; positive control HELD (`controls/`). K4: plan/probe/controls/open unchanged since the freeze.
- Harm battery at M (`close/battery-M.txt`): readme-map, sources-check (rows 212), counter-pins, spotcheck-adopt,
  `round-gate --tracked`, rounds 93/94, census all CLEAN; proxy DRIFT on the A_wave/C2 bookkeeping terms only,
  re-declared at close.
- Framing (K95CriticB, verdict *sound*): the class has 0 real occurrences in 21 lanes and 74 registry revisions
  (K95Scout); the value is prospective fail-closed agreement with the census, not a live defect. Reported as such.

## M2 addendum (after WAVE-DONE)

K95Mutation (`.ufo/waves/round-95/K95Mutation/mutants.md`): 15 mutants on the READY bytes, 13 killed by the selftest,
`checkafterstatus` equivalent, `checkafterreject` survived (a malformed row whose index-8 cell reads `rejected` was
skipped before it could be listed). M2 `a59fbedc` adds arm (xxii); the survivor now fails it
(`close-l1/survivor-remut.txt`); selftest 89/89; frozen counter at M2 HELD twice (`close/probe-m2-{1,2}.txt`).

## Routed to round 96

1. Section membership (K95CriticB): a row-shaped line outside `## Registry` is census E12 but the gate's regex still
   reads it (BASE and M alike); the claim title "census shape" covers field count only.
2. Counter clause battery (M95-2) for the next frozen counter.
3. Sibling transfer (K95Connector §4): tabi/kake tools that read SOURCES columns by index without a count check —
   reported to the fleet, never edited; census fixture lacks a `\|` E01 row.
4. Carried: M93-3 counter repair, M93-5 `--close` probe-receipt requirement, R93-D1 seat-route redaction, F93
   fixtures, K94CriticB 1b self-attestation (closure re-open is the only guard).

## Assimilation

None this round (no `merge/kumitate/` theme fits a gate parse repair). considerthese: not mined this round
(latest `considerthese/2026-11-06.md` § "Self-improvement ideas" left for a later round; no proposal fits C1).
