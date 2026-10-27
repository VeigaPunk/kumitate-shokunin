# Round 66 — lesson

author: kumitate-shokunin (skeleton and `## Mistakes` drafted by seat `K66ScribeLesson`, wave 1; `## Gate` is a placeholder — another seat drafts it; integrated by the L1)
base: `8d557f85312de4fcc82e09ff735d21436bc3746d`; frozen at `621212bac37f8249c72ac982d1d6534cb8d60701` (plan, the L66/M66 counters with their pins, the four controls, the base receipts, `scripts/routed-ledger.mjs` v1, D7's README row and pin)
plan: `.ufo/waves/round-66/plan.md`, committed before the first `.ready` marker (QUALITY Q58)
status: DRAFT (wave 1). No integrated `M` exists at drafting time: every "before" value below is a committed base receipt and every "after" value is the counter's declared predicate, unobserved at an `M`. `SCORECARD.md` §Round 66 and the close receipts are written at round close.

## Claims

Both claims are the plan's, quoted as declared (`.ufo/waves/round-66/plan.md` §C1, §C2); this section records the before state, not a verdict.

| claim | rule | measured by | before (committed receipt) | after (declared, unobserved) |
|---|---|---|---|---|
| **C1 — operability, capability `routed-ledger`** (lowest non-retired axis, score 9) | L66 v1, checks L1..L6 | `node .ufo/waves/round-66/probe/ledger66-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>` | `LEDGER66_UNMET held=0/6 checks=6 rev=8d557f85… rule=L66 seed=0d44321a076abff3 \| L1 MISS tool-absent \| L2 MISS tool-absent \| L3 MISS 67 problems: ledger-empty-or-absent,unledgered:55#1,… \| L4 MISS tool-absent \| L5 MISS real-tool-passes-L4=false stubs-caught=always-clean+always-drift \| L6 MISS skill-row=false quality=false capability-row=false`, `EXIT=1` (`base/ledger66-base.txt`) | `LEDGER66_HELD held=6/6 checks=6 rev=<M> rule=L66`, exit 0 |
| **C2 — coverage frontier, the MCP deprecation registry** | M66 v1, checks M1..M8 | `node .ufo/waves/round-66/probe/deprec66-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>` | `DEPREC66_UNMET held=0/8 checks=8 rev=8d557f85… rule=M66 \| M1 MISS entry-absent \| M2 MISS no-entry \| M3 MISS no-rows \| M4 MISS bullets=0;… \| M5 MISS no-bullets \| M6 MISS … \| M7 MISS no-Bearing-section,no-cited-row-for-sse.ts-at-v18.12.6 \| M8 MISS census-exit=0 sources-check=true source-capture=true readme-map=false province-names-entry=false`, `EXIT=1` (`base/deprec66-base.txt`) | `DEPREC66_HELD held=8/8 checks=8 rev=<M> rule=M66`, exit 0 |

Do-nothing controls, scored before any seat and committed (quotes: the counter's own verdict line, control script `probe/c1-controls.sh` / `probe/c2-donothing.sh`):
`c1-controls.sh donothing` → `held=4/6` UNMET (`base/ledger66-donothing.txt`); `c1-controls.sh autoledger` (one machine-generated open row per item) → `held=4/6` UNMET, L2/L3 miss (`base/ledger66-autoledger.txt`);
`c2-donothing.sh` (the staged entry copied byte-for-byte plus a PROVINCE line) → `held=0/8` UNMET (`base/deprec66-donothing.txt`). The freeze tool's own selftest reads `ROUTED_LEDGER_SELFTEST: PASS (33/33)`, exit 0 (`base/routed-ledger-selftest-freeze.txt`).

Stated limits inherited verbatim from the plan: C1's counter verifies bindings, not adequacy (an answer line that quotes itself passes if new and located); round 59's routed section is prose, 0 items; item ordinals assume append-only spot-checks. C2's counter cannot tell a sound reading from a well-grounded wrong one, and presence of `sse.ts` / a `roots` declaration is not proof of run-time use.

## Gate

PLACEHOLDER — drafted by another seat (the round's per-row Gate record: URL, access date `2026-10-27`, ≤25-word located quote, capture sha256/size, plus the theme's >= 1 admit and >= 1 reject). The D1 correction owed to this heading is recorded under `## Mistakes` and in `## Routed defects answered`; the skeleton does not pre-empt it.

## Mistakes

One mistake, mined as a class (not a second routed item for the same family):

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| `routed-unledgered` — a routed item is answered (or silently not answered) in prose that no later round can find, and the round's own report then asserts the record exists | (a) **the item**: `.ufo`-fleet report `/home/vgpnk/Projects/shokunin/.ufo/reports/round-65/kumitate.md:48` states "the lesson's `## Gate` carries URL, date and quote per row"; the lesson's Gate does not: `corpus/lessons/round-65.md:71-72` maps `S204` = `package.json` and `S205` = `client.ts`, and `:79` states "(`grep -cE '^\| S206 \|' corpus/SOURCES.md` → `0`)" — while landed `corpus/SOURCES.md:156-158` is `S204` = `src/mcp/client.ts`, `S205` = `src/web/search/providers/zai.ts`, `S206` = `src/mcp/transports/http.ts`. Routed as D1 by `corpus/lessons/round-65-verifier-spotcheck.md:71` ("CORPUS rule 1 … is therefore unmet for S205/S206"). **(b) the class it repeats**: D7 of the same spot-check (`:77`) lands a file without its `corpus/README.md` row — the `reference-drift` family the lane has mined since round 56, called the "eleventh R56-V3-family recurrence" (`.ufo/waves/round-65/plan.md:115`). **(c) the loss is countable and uncounted**: at HEAD the lane holds **57 routed items in 11 spot-check sections** for rounds 55..65 (`build/K66ScribeLesson/items-55-65.txt`) and **no ledger binds one** — `corpus/routed-ledger.md` is absent, `ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md`, `EXIT=2` (`build/K66ScribeLesson/run-base-head.txt`) | **none at round 65** — no gate, no ledger; D1 was found by hand at the non-author spot-check, and only after the report had shipped the false sentence. From round 66: the ledger row for D1 in `corpus/routed-ledger.md` plus `scripts/routed-ledger.mjs` (v1 at the freeze, 33/33 selftest) | the fix is a **row, not another promise**: one ledger row per routed item, the row bound to the item by a located quote and to its answer by `path:line` + a located quote, and the gate failing when any row is missing. Rated as a structural fix for the class: the same gate binds D7's `reference-drift` items (README row + pin) and D1's record items, so a round that ships a false "carries URL, date and quote per row" without the rows reads DRIFT at the next open |

**The fix is shown able to fail** — one command, two fixtures on a scratch clone (`git clone --shared`, HEAD `88041bc9`, scratch deleted after the receipts were copied here):

```
node scripts/routed-ledger.mjs --root <clone> --from 55 --to 55 --ledger corpus/routed-ledger.md        # row present
node scripts/routed-ledger.mjs --root <clone> --from 55 --to 55 --ledger corpus/routed-ledger.minus.md  # the R55-D1 row deleted
```

Pass: `ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=2 rows=2 open=0 closed=2 wontfix=0` `EXIT=0` (`build/K66ScribeLesson/run-pass.txt`). Fail, same bytes minus one row:
`FINDING UNLEDGERED round-55-item-1` / `ROUTED_LEDGER: DRIFT spotchecks=1 sections=1 items=2 rows=1 open=0 closed=1 wontfix=0 findings=1 first=UNLEDGERED:round-55-item-1` `EXIT=1` (`build/K66ScribeLesson/run-fail-unledgered.txt`).
The fixture's routed section is the minimal two-item shape (`build/K66ScribeLesson/minimal-spotcheck-55.md`), its answers are located in `build/K66ScribeLesson/minimal-answers.md`, and its ledger is `build/K66ScribeLesson/minimal-ledger.md`. A second deletion was not needed: the finding names the missing ordinal, so the gate reports *which* routed item is lost, not just that something is.

**What the fix does not catch (measured, not predicted).** The section rule counts column-0 list items and table data rows only, so a routed defect written as a paragraph inside the routed section is not an item: a spot-check whose section reads "One lane-owned defect: the Gate row table is stale against the registry (S205/S206), see the report." with a header-only ledger prints `ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=0 rows=0 open=0 closed=0 wontfix=0`, `EXIT=0` (`build/K66ScribeLesson/run-prose-hole.txt`). The gate binds routed *items*, not routed *prose* — the plan's stated limit covers round 59's historical prose section, not this laundering path. A strengthening selftest case (a prose-only routed section that names a defect ⇒ DRIFT) belongs to the L1's ratchet; this skeleton does not edit the frozen tool.

Not the same row, different family: the two other open record defects this lesson carries are D2 (`harm-matrix` still has no `## Capabilities` row — `grep -n harm-matrix SCORECARD.md` → one hit, `:2995`, inside the round-65 prose stanza) and D3 (`grep -c 'harm-matrix\|omp-binary-probe' SKILL.md` → `0`); both are answered rows, not new mistakes.

## Routed defects answered

Round 65 routed seven items (`corpus/lessons/round-65-verifier-spotcheck.md:71-77`). L3's round-65 clause requires each to carry a closed/wontfix row whose answer line is **new since the base**; the ledger `corpus/routed-ledger.md` is the L1's file and does not exist at HEAD, so no row is claimed here. Proposed answer anchors, each of which the tool locates or rejects (an anchor that is not found at its `path:line` reads `ANSWER_DEAD`):

| item | what it routed | proposed row | answer anchor to locate (owed by the L1) |
|---|---|---|---|
| D1 | Gate row table contradicts the registry (S205/S206) | `R65-D1`, class `gate-record` | the appended per-row Gate record for S205/S206 in this lesson's `## Gate` (the correction D1 itself names as its fix) |
| D2 | `harm-matrix` capability row missing | `R65-D2`, class `registry-home` | the `harm-matrix` row in `SCORECARD.md` `## Capabilities` |
| D3 | `SKILL.md` rows and pins for `harm-matrix` / `omp-binary-probe` | `R65-D3`, class `registry-home` | the two `SKILL.md` table rows + their `pin.*` entries |
| D4 | stale proxy stanza; Q62–Q64 / `class-recurrences.sh` not landed | `R65-D4`, class `carried-unaddressed` | this lesson's `## Close status` line that states the carried/fixed proxy reading |
| D5 | `cite-check-fleet-dot` errors 1545 → 1637 unexplained | `R65-D5`, class `unexplained-gate` | this lesson's `## Close status` line attributing the +92 |
| D6 | round size / the 40-seat falsify wave that never ran | `R65-D6`, class `carried-unaddressed` | the round-66 wave census line + this lesson's `## Close status` |
| D7 | this spot-check landed without its `corpus/README.md` row | `R65-D7`, class `reference-drift` | `corpus/README.md:195` (row present at the freeze commit `621212ba`; the row's arrival at the round-66 opener is the answer) |

D7 is the one row whose answer already exists in committed bytes; the other six are answered only by this round's integration, which is why the round-65 clause tests "new since the base" rather than presence.

## Close status

DRAFT — nothing below is observable at wave 1 and none of it is claimed as landed.

- **C1 / C2 verdicts at `M`**: not measured. Both before receipts are `held=0/n` exit 1; the do-nothing controls sit at `4/6` and `0/8`; the first `held=6/6` / `held=8/8` reading, if any, is the L1's at the landed tip.
- **`corpus/routed-ledger.md`**: absent at HEAD (`run-base-head.txt`, exit 2). Until the L1 lands it, the lane's 57 routed items stay unbound — the count is the mistake row's evidence (c), not a verdict.
- **Routed D1–D7**: mapping proposed above; all seven remain open until their rows exist with located answers. D1's fix (the per-row Gate record) is not written by this seat.
- **Carried, not re-measured by this seat**: the `proxy-check` DRIFT at the base (`base/proxy-before.txt`), the six W04 duplicate-URL warnings (`base/census-before.txt`), and the `base/readme-map-before.txt` DRIFT repaired in the freeze as maintenance — D7's own class, repaired, not claimed.
- **Seat limits**: this seat ran the tool only on a scratch clone and only in `--from 55 --to 55`; no full-lane `--from 55 --to 65` measured reading was taken (it fails closed at HEAD for the absent ledger, and no ledger draft was written by this seat to measure against).
