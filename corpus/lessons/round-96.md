# kumitate round 96 — lesson (`round-gate` declares only from rows inside the census `## Registry`; attempt 1)

Frozen at lane commit `617e80cd8b01efb5748d729dbdcac95734bc461d`: `.ufo/waves/round-96/plan.md`, counter
`probe/probe96-c1.mjs`, control generator `probe/make-controls96.py`, 20 pre-data controls, `open/` receipts. The
round-95 verifier spot-check was adopted into the README map **before** that freeze (`8191f90e`,
`close-l1/adopt-r95-spotcheck.txt`: DRIFT → CLEAN). Wave spec + validated dispatch `f5873bff`; integration
M = `09de67917b5b7731aa06ae019c7e9b94359981c9` (`scripts/round-gate.mjs` sha256
`edaa115fa053798665b2694d05bf8cc8389a9cdfae74930eab33398776bea135`).

Claim C1 operability (lowest non-retired axis, integer 9 terminal): `declaredPins()` matched every row-shaped line
of `corpus/SOURCES.md` wherever it sat, so a row under `## Leads (unopened)`, before the first heading or after a
later `#` heading declared its pin although the fleet census calls it E12. Frozen rule R96: the gate walks the
registry with the census `row_pass` section state; a row-shaped line outside the section declares nothing, gets no
field-count check, and its id is listed (file order, repeats kept) in the always-present `citations.outsideRows`;
text mode adds one non-finding `SOURCES_ROWS_OUTSIDE` line when there is something to list.

## Gate

- **admit — `scripts/round-gate.mjs` (M `edaa115f…`).** K96ExecTool built the rule (READY `9975be54…`, selftest
  89 → 92, `C96_C1: HELD` ×2 in `K96ExecTool/score{1,2}.txt`, arm teeth 18/18 in `K96ExecTool/arm-teeth.txt`).
  K96Reviewer hand-checked every edit point and fixture A line by line (no blocker). L1 integration
  (`close-l1/integration-diff-ready-vs-M.txt`, `close-l1/integration-arms.js`): arm (xxvi) — tab-indented and VT
  `##` lines are not headings, a fenced row inside the Registry declares, `## Registry<TAB>` is inside,
  `## Foo ## Registry` is outside, a 3-space outside row is listed; arm (xxvii) — rows and no capital-R `Registry`
  anywhere declare nothing and are all listed. Selftest 94/94. Re-mutation of the shipped bytes
  (`close-l1/integration-remut.txt`): **30/31** killed — all 18 control shapes and every K96CriticA construction
  except `hardcode-fixtures` (keyed on the counter's fixture text; a counter weakness, not a selftest target) —
  plus K96Mutation's survivor `b20-spaceclass` (now fails arm (xxvi)).
- **admit — S275** (CommonMark spec 0.31.2, https://spec.commonmark.org/0.31.2/), opened 2026-11-07 (UTC) by
  K96ScribeSources (`K96ScribeSources/quotes.md`, HTTP 200, sha256 `c85f56cc…`) and re-opened by the L1
  (`close-l1/l1-open-commonmark.txt`, same sha256, each quote FOUND after whitespace collapse); quote (§4.2 ATX
  headings, paragraph after Example 61, 19 words): "The opening sequence of # characters must be followed by spaces or tabs, or by the end of line."
  It grounds the clause the census and the gate share with CommonMark (`##` then space or tab). Second located
  quote (same paragraph, 22 words): "The optional closing sequence of #s must be preceded by spaces or tabs and may be followed by spaces or tabs only."
  It grounds the clause where the census departs (it keeps `##` in the text, so `## Registry ##` is outside).
- **admit — QUALITY Q90** (a lesson's new source rows carry their registry URL): shown able to fail on round 95
  (`K96ScribeLesson/receipts/lesson-urls-round-95.txt`, `MISSING_URL S273`, `MISSING_URL S274`, rc=1) and round 94
  (S272, rc=1), and to pass on rounds 34, 35, 36, 46 (rc=0); this lesson's own run is
  `.ufo/waves/round-96/close-l1/q90-round-96.txt`.
- **reject — a CommonMark-aware section reader** (S275: honour closing sequences, strip `\r`, skip fenced
  headings). Reason: the census is the registry's authority and E12 is its finding; a CommonMark reader would
  trust rows the census calls E12 (`## Registry ##`, `## Registry\r`, a `## ` inside a fence) — a second reader of
  one file. Flip: the census adopts CommonMark headings.
- **reject — "the frozen counter pins the rule's clauses"** (K96CriticA): 8 of 14 new wrong gates reach
  `C96_C1: HELD` (`K96CriticA/receipts/*.txt`; `ws-class`, `indent-class`, `trail-tab`, `lastindex`,
  `outside-unindented`, `fence-rows`, `no-registry-fastpath`, `hardcode-fixtures`). The 20 controls pin 18 clauses;
  the battery did not draw `\s` vs `[ \t]`, a tab indent, a trailing tab, a later `##` in the heading text, an
  indented outside row, a fenced row, or a registry with no section. The shipped bytes rest on arms
  (xxiii)–(xxvii) and the re-mutation above, not on the counter alone.
- **reject — follow the lane's `sources-check.mjs` section reader instead.** K96Connector/K96CriticB: it reads a
  whole-CRLF registry as clean (`split(/\r?\n/)`) where the census prints 212 E12, and it misses `##<TAB>Registry`
  (heading regex wants a literal space). Flip: the census and `sources-check.mjs` converge on one reader.

### Rows touched (old → new)

- New: S275 (status `mined`, recheck `on-release`, used-by `corpus/knowledge/round-gate-registry-section.md`),
  URL https://spec.commonmark.org/0.31.2/.
- No existing row's `status`, `recheck` or `used-by` changed.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M96-1 — a lesson's `## Gate` admitted new `corpus/SOURCES.md` rows without their URLs.** Round 95 recorded access date, location and quote for S273/S274 but no URL; round 94 omits S272's; round 47 omits 5 of 16. | `corpus/lessons/round-95-verifier-spotcheck.md` §5 item 1; `.ufo/waves/round-96/K96ScribeLesson/receipts/lesson-urls-round-{95,94,47}.txt` (rc=1) | none (CORPUS rule 1 was prose; only the non-author closure caught it by hand) | QUALITY Q90 with its command, shown able to fail (r95, r94) and pass (r34–r36, r46); this lesson passes it (`close-l1/q90-round-96.txt`). |
| **M96-2 — the frozen counter again certified a fixture, not every clause of the rule** (third consecutive round: K94CriticA, M95-2, K96CriticA). The clause battery grew from 4 to 20 controls and still left 8 HELD constructions; one control (`ctl-defaultin`) reached HELD on the counter's first draft and was caught pre-freeze only because every control was scored before the freeze. | `.ufo/waves/round-96/K96CriticA/constructions.md`; `controls/prefreeze-run1/ctl-defaultin.txt` vs `controls/ctl-defaultin.txt` | Q85/Q86 (class sampling, arm every field class) — the battery drew each clause from the plan's list, not from the census grammar | Shipped arms (xxvi)/(xxvii) kill 7 of 8 (`close-l1/integration-remut.txt`); routed to round 97: derive the battery from the census grammar's character classes (`[ \t]` vs `\s`, indent class, trim class, first-vs-last `##`) and nonce the fixture ids and titles so `hardcode-fixtures` dies. |

Misroot sweep (`git -C /home/vgpnk/Projects/shokunin status --porcelain` before the report): no file of this
round's seats at the fleet root (receipt `close-l1/misroot-sweep.txt`).

## Verdicts

- C1 frozen predicate at M: `C96_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=79/79 f=1/1 tool_sha256=edaa115f…` twice
  (`.ufo/waves/round-96/close/probe1.txt`, `probe2.txt`). Do-nothing control `UNMET a=0/1 b=0/1 c=0/1 d=0/1 e=0/79`;
  18 violating controls UNMET; positive control HELD (`controls/`). K4: plan/probe/controls/open unchanged since
  the freeze.
- Framing (K96CriticB, *sound mechanism, narrow live surface*): 0 outside rows in 21 lanes and in all 75
  kumitate registry revisions (K96Scout, K96CriticC H96 survives: 75/75 + 21/21 + 300/300 seeded mutations agree
  with census E12). The value is prospective fail-closed agreement with the census; the one class where both lane
  gates read green while the census refuses (CRLF on the `## Registry` line) is exactly fixture B.

## Routed to round 97

1. Counter: census-grammar-derived clause battery + nonce fixture ids/titles (M96-2).
2. Lane `scripts/sources-check.mjs` section reader: CRLF and `##<TAB>` disagreements with the census (K96Connector
   findings 2–3); one reader for the lane.
3. Fleet census internal disagreement: gawk `row_pass` keeps `\r`, bash `usedby_findings` strips it — one
   `validate` run prints E12 and E11 for the same row (K96Connector finding 1; L0 question filed).
4. Exotic whitespace in the row-id cell (`\s` vs `[ \t]`; K96CriticC boundary): fail-closed direction, 0 real hits.
5. Sibling transfer (K96Connector §4): tabi/kumitate tools that read SOURCES rows with no section check — reported,
   never edited.
6. Carried: M93-3 counter repair, M93-5 `--close` probe-receipt requirement, R93-D1 redaction, F93 fixtures.

## Assimilation

None this round (no `merge/kumitate/` theme fits a gate section rule). considerthese: not mined this round
(latest `considerthese/2026-11-06.md` left for a later round; no proposal fits C1).
