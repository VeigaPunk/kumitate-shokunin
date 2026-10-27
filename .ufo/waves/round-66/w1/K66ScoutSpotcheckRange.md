VERDICT: Do not start the ledger range before round 55 with the tool as written — rounds 6–33 have no spot-check files and round 34 routes nothing, but rounds 37 (first-match binds a recap of round 36 and swallows Appendix A: 27 counted items where 7 real ones exist) and 38 (2 prose items dropped) are mis-reads the tool and the frozen counter share identically; after a last-match fix the defensible range is 35..66 at 169 items.

## Evidence

Survey driver (scratch, since deleted): imported the C1 tool's exported `routedItems()` and the frozen counter's `items66()` (extracted verbatim from `.ufo/waves/round-66/probe/ledger66-probe.mjs:67-101`) over every `corpus/lessons/round-N-verifier-spotcheck.md`, N=6..54, plus a full heading audit of each file.

```
$ node cmp2.mjs        # rounds 34..54, tool vs frozen counter
agree=true tool total=132 probe total=132

round | file | matched heading | items
6-33  | ABSENT (corpus/lessons holds round-1..31 lessons; first spot-check is round-34)
34    | yes  | NO MATCH (headings: '## Spot-check …', '## Adjudication' only)
35    | yes  | ## Routed defects (lane owns; fix next round)               | 4
36    | yes  | ## Routed defects (lane owes next round)                    | 8
37    | yes  | ## Round-36 routed defects D1–D8  (recap; line 84)          | 27
38    | yes  | ## Routed defects / operator handoff                        | 0
39-54 | yes  | 'Routed defects …' / 'Routed items / defects …' variants    | 8,7,7,8,6,7,5,6,6,5,6,5,4,5,4,4
```

Round 37 parsed items 12–27 (verbatim first lines from `routedItems`): `| native-trial-launch | 54 | 34 → 19 | …`, `| remaining-scripts-census (S8) | …`, `- Status at close: 469 true, …`, `- NTL (native-trial-launch.md, 21): …` — 19 items from the `### Anchor truth at the pin` appendix, not routed defects. Round 37's real section `## Routed defects (lane owes next round)` (`corpus/lessons/round-37-verifier-spotcheck.md:201`) holds R1–R7 = 7 items.

Round 38 section body (`round-38-verifier-spotcheck.md:211-225`) is two prose paragraphs `R38-1 → …` and `R38-2 → …` — no bullets or tables → 0 items.

Cross-check of the current range (unchanged by this finding): each of rounds 55–65 has exactly one matching heading (`grep -n '^#' … | grep -iE 'routed|defect'`); round 57's non-matching `## Orchestration conformance defect — double-live L1` (line 34) is restated as item 1 of the matched `## Conformance defects (status-neutral) and routed items` (line 123) — nothing lost.

## Findings

1. **K66ScoutSpotcheckRange-1 — high — first-match mis-read at round 37 if the range is extended.** The rule takes the FIRST heading matching `/\brouted\s+(defects?|items?)\b/i`; in `round-37-verifier-spotcheck.md` that is the recap `## Round-36 routed defects D1–D8` (line 84), and because the next heading is a deeper `###`, the section absorbs Appendix A. Result: 27 items counted (8 recap dispositions + 3 open-sentence bullets + 16 closure-measurement table rows/bullets), while the real new routed section at line 201 (R1–R7) is never parsed. Tool and frozen counter agree (`agree=true`), so L2 would still pass — this is an agreed mis-binding of real sections, the exact class the plan's ratchet fixes (never relaxes). Repro: `node -e "import('/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/routed-ledger.mjs').then(m=>{const t=require('fs').readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-37-verifier-spotcheck.md','utf8');console.log(m.routedItems(t).items.length)})"`.
2. **K66ScoutSpotcheckRange-2 — medium — prose routed items at round 38 are dropped.** `## Routed defects / operator handoff` matches the heading rule but its two items are paragraphs (`R38-1 →`, `R38-2 →`), and items are only column-0 bullets/table rows → 0 items. Same class as round 59's stated prose limit; do not extend the parser to paragraphs — treat like round 59 if the range is extended.
3. **K66ScoutSpotcheckRange-3 — informational — no ledgerable material before round 35.** Rounds 6–33 have no spot-check files at all; round 34's file routes nothing (only `## Spot-check` and `## Adjudication`). The corpus's first routed section is round 35.
4. **K66ScoutSpotcheckRange-4 — informational — rounds 47/48 `ROUTED_HELD` headings are NOT wrongly matched.** `## 2. Claim C1 — operability (ROUTED_HELD, …)` (round-47:33) and `### C1 — operability (ROUTED_HELD, rule F48+A48)` (round-48:28) fail `\brouted\s+` on the underscore; each file's single real match is its numbered routed-defects heading. The rule is safe at 47/48.
5. **K66ScoutSpotcheckRange-5 — recommendation.** Keep `--from 55` for any count with the tool unmodified. If the L1 lands a strengthening (select the LAST matching heading — a no-op on 55–65 where each file has exactly one match, and correct on 35–54 where the real section always follows any recap; add a selftest case on a round-37-shaped fixture per the ratchet), the next round can run `--from 35 --to 66`: 112 items (35–54, round 37 fixed 27→7) + 57 (55–65) = **169 items across 31 sections** before round 66's own items are appended. Starting at 34 adds nothing; starting at 37 discards rounds 35–36's 12 real items.

## Artifacts

- `.ufo/waves/round-66/build/K66ScoutSpotcheckRange/survey.md` — full per-round table, totals, miss/wrong-match audit, recommendation.

## Limits

- I read only headings, section bodies needed for the anomalies (rounds 37, 38, 57), and the probe parser; I did not re-verify that rounds 35–36/39–54 items are individually well-formed, nor whether those pre-55 items are already answered in later rounds (an adequacy question for the L1, not this survey).
- Counts come from the tool's `routedItems()` at the working tree; the frozen counter's `items66()` was verified to agree on 34–54 (132=132) but was not run on 55–65.
- No git fixture or mutation was needed; nothing in the lane was edited.
