author: kumitate L1
round: 79

# Round 79 — the K score keeps both factors, and the lane's report gate learns to resolve its pointers

Two claims, two axes: C1 `coverage:kimi-layer` repairs the round-78 harm under the operator default (b) —
the composite `floor(10 × C1k/C1k_total × K_sections/K_members × (K_members−K_findings)/K_members)` keeps the
documentation factor *and* the census finding factor — and C2 `operability` deepens the lane's own report gate
(`report-receipt-diff` v4, new id `POINTER_DEAD`) instead of adding a second report tool. Frozen plan:
`.ufo/waves/round-79/plan.md` plus Amendment 1 (C2 re-scope) and Amendment 2 (C2 arm-2 correction), all
pre-data.

## Gate

Sources opened this round (rows in `corpus/SOURCES.md`; captures pinned in
`.ufo/waves/round-79/build/L1/captures/` with HTTP status and sha256 in `fetch-receipt.txt`):

- **Admit — S229, GNU grep manual §2.3 *Exit Status*, kind `docs`, tier A, status `mined`.** Opened
  2026-11-04: HTTP/2 200, 248692 bytes, sha256 `517177d0…`. Located quote, 21 words: `0 if a line is
  selected, 1 if no lines were selected, and 2 if an error occurred.` Criterion met: primary documentation
  of one tool's three-way outcome, which grounds separating a *no-match/absence* verdict from an *error*
  verdict in the lane's report gate. Boundary stated in the entry: grep's exceptions (quiet mode) and other
  implementations' statuses above 2 are not adopted; the page says nothing about report pointers.
- **Admit — S230, scikit-learn `fbeta_score` API page, kind `docs`, tier A, status `mined`.** Opened
  2026-11-04: HTTP/2 200, 133786 bytes, sha256 `97e0b28f…`. Located quote, 24 words: `The F-beta score is
  the weighted harmonic mean of precision and recall, reaching its optimal value at 1 and its worst value at
  0.` Criterion met: the documented statement of a two-factor aggregation in which neither factor may be
  discarded. Boundary stated: a library metric's documentation, not general scoring doctrine; the lane
  adopts the non-compensatory *shape* only, and a product can still permit partial compensation between
  intermediate values.
- **Admit — S231, own-work: round-78 `close/harm-counterexample.txt` at `94ab4065`, tier A.** Re-read this
  round (`git show 94ab4065:.ufo/waves/round-78/close/harm-counterexample.txt`, lines 14 and 17). Located
  quote, 7 + 5 = 12 words: `verdict=DRIFT … coverage_kimi=9` / `verdict=DRIFT … coverage_kimi=10`. Criterion
  met: the lane's own re-runnable output; it grounds the *discriminating arm* (a de-named heading must cost
  a point) rather than any external fact.
- **Reject — S232, Wikipedia *Harmonic mean* lead section, kind `community`, tier C.** Opened 2026-11-04:
  HTTP 200, 557781 bytes, sha256 `b74c35a7…`. Located quote, 15 words: `In mathematics, the harmonic mean is
  a kind of average, one of the Pythagorean means.` Criterion missed: a community source is never sole
  support for an admitted entry, and the page states no non-compensatory aggregation rule. **Flip:** a
  standards body, original paper or maintained library's documentation that states the aggregation
  property for two measured factors.
- **Reject — the `merge/kumitate/` assimilation package as a bulk append (carried, unchanged).** Re-measured
  read-only at the round open: `SOURCES.append.md` 155 S-rows over 161 lines, `MERGE-REPORT.json`
  `entries=70`, `accepted=155`. Criterion missed: §10 proportionality and CORPUS.md rule 4. **Flip:** a
  dedicated assimilation round that re-opens each entry and admits its rows one at a time.
  `Assimilation: none` this round.
- **Reject (design, not a source) — a separate `report-refs` tool.** The round opened with C2 planned as a
  new instrument; reading `scripts/report-receipt-diff.mjs` showed the lane already owns a report gate with
  a receipt pass, so the new tool would be a second method for one job. Amendment 1 re-scoped C2 to v4 of
  the existing gate before any measurement. Sibling check: kotoba's
  `verifiers/check_report_pointers.py` (round 73) owns *cross-lane* report-pointer checking; kumitate's v4
  stays inside its own gate (PROVINCE round-79 addition).

Non-author spot-check of this Gate: the round-78/79 closure records its own sample; this lesson states the
decisions, not an agreement it cannot attest.

## Mistakes

- **Class — `vacuous` (a counter arm that its own contract makes unreachable).** C2's first counter required
  `≥10 POINTER_DEAD` lines with first `close/proxy-json.txt`, while the same contract said receipt-shaped
  tokens are never re-reported. **Evidence pointer:** `.ufo/waves/round-79/controls/c2-base.txt` (v3 already
  reads `ids=RECEIPT_MISSING,HASH_DEAD` on the filed r78 report; the six `close/*` pointers are
  `RECEIPT_MISSING`) and `plan.md` Amendment 2. **Captured-by:** none — no criterion asked whether an arm's
  expected value was reachable under the contract's other clauses (now Q73). **Fix:** the arm is derived from
  the contract plus the control receipt (≥4 `POINTER_DEAD`, names `amended-plan-observed.md` and `SOURCES.md`
  present, `RECEIPT_MISSING` still in the ids); the fixed counter was re-run on both controls and on base
  before the change (`controls/c2-base.txt`, `controls/c2-stub.txt`, close `c2-probe.txt`). Shown able to
  fail: the pre-fix arm is unreachable on the filed report (4 lines, not 10).
- **Class — `reference-drift` (the round-78 probes' `DEFAULT_LANE` is one segment short).** Both r78 probes
  resolve `.ufo`, not the lane, so a bare invocation reads the wrong tree; r78's report-79 note routed it.
  **Evidence pointer:** `.ufo/waves/round-78/probe/probe78-c1.mjs` (`resolve(dirname(SELF), '..', '..', '..')`)
  versus this round's four-level form. **Captured-by:** the counters' own `--lane` arm — a bare run is never
  the claimed command. **Fix:** round-79 probes pass `--lane` explicitly in every claim command and resolve
  four levels; the r78 bytes are historical and are not rewritten.
- **Class — `scope` (C2's first "why" overstated the gap).** The plan's first text said the lane had no
  instrument that resolves report pointers; v3 does resolve the receipt-shaped class. **Captured-by:** the
  base control run before data. **Fix:** Amendment 2 restates the gap as the non-receipt pointers (four on
  the filed r78 report), and the claim sentence is unchanged.

## Counters

| counter | open | close | source |
|---|---|---|---|
| proxy findings (`--strict`) | 0 (`PROXY: MATCH` after the round-open repair) | 0 (`PROXY: MATCH`) | `open/gates-open.txt`; `close/proxy-check.txt` |
| proxy A / C2 / C2_total | 868 / 191 / 191 | 875 / 193 / 193 | `open/proxy-json-open.json`; `close/proxy-json.txt` |
| K census (members / findings) | 55 / 0 | 55 / 0 | `open/gates-open.txt`; `close/census.txt` |
| OMP census (entries / findings / bound) | 64 / 0 / 35 | 64 / 0 / 35 | `open/gates-open.txt`; `close/shape.txt` |
| OMP live shape compare | `DRIFT entries=68 added=4 first=agent.db-shm` (checklist red) | `IN_SYNC … transient=0` | `open/checklists-BEFORE.txt`; `close/checklists.txt` |
| README map (files / uncovered) | 191 / 0 | 193 / 0 | `open/gates-open.txt`; `close/readme-map.txt` |
| spotcheck map (spotchecks / uncovered) | 45 / 0 | 45 / 0 | `open/gates-open.txt`; `close/spotcheck-check.txt` |
| SOURCES rows / tier A | 167 / 143 | 171 / 146 | `open/gates-open.txt`; `close/sources.txt` |
| checklists (pass / listed) | 38 / 39 | 39 / 39 | `open/checklists-BEFORE.txt`; `close/checklists.txt` |
| probe C1 (base / stub → M) | 7/11, 4/11 | 11/11 | `controls/c1-base.txt`, `controls/c1-stub.txt`; `close/c1-probe.txt` |
| probe C2 (base / stub → M) | 9/12, 4/12 | 12/12 | `controls/c2-base.txt`, `controls/c2-stub.txt`; `close/c2-probe.txt` |

## Limits

- **The composite still floors.** A documentation loss and a census finding each cost a point at 55 members,
  but the product can only reach 9 from one step, and integer flooring hides further intermediate losses;
  combined losses are not additive. The `K_findings` penalty double-counts a *missing* member (denominator
  drop plus finding), as `O_findings` already did.
- **`POINTER_DEAD` resolves existence, not honesty.** A pointer that resolves is not evidence that the cited
  bytes support the sentence. Prose examples that look like paths are flagged (the critic's r76/r77
  counterexamples: `MISSION.md`, `readme-map.mjs`, `omp-crash.log`); the remedy is to fence illustrative names
  or resolve them. The gate reads prose only, so fenced examples are exempt. With `--rev`, a report outside the
  lane cannot admit an external file; without a git repo, `--rev` fails closed.
- **The report gate is not a second author.** The v4 pass is a pre-filing check of this lane's own report; the
  non-author closure still reads the claims.
- **The K score remains a live-root term** (`K_members`/`K_findings` read the kimi census), so a closure on a
  different host reads it fail-closed rather than fitted.
