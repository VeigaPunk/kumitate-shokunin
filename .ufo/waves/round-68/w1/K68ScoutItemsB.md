VERDICT: Extracted routed-section items for rounds 59–62 with the frozen counter's own `items67` (sliced verbatim, run on committed bytes at 39f61816): r59=0 items (prose section), r60=9, r61=6, r62=5 — 20 items, 1 routed section per round; JSONs landed in build/K68ScoutItemsB/.

## Evidence

Extraction runs `items67` sliced verbatim out of `.ufo/waves/round-68/probe/ledger68-probe.mjs` (lines 137–184) plus `routedItems` sliced verbatim out of `scripts/routed-ledger.mjs` (lines 73–105), on `git show 39f61816d4ee7a8d401df42c1818c91a9c537bce:corpus/lessons/round-<n>-verifier-spotcheck.md` (the lane tip = freeze commit; `git diff --stat d23892ad 39f61816 -- corpus/lessons/` is empty, so base and tip bytes are identical, and `committed_equals_worktree: true` for all four files).

```
$ OUT=…/build/K68ScoutItemsB node extract.mjs
[{"n":59,"sections":1,"items":0,"v1":0,"agree":true},{"n":60,"sections":1,"items":9,"v1":9,"agree":true},{"n":61,"sections":1,"items":6,"v1":6,"agree":true},{"n":62,"sections":1,"items":5,"v1":5,"agree":true}]
total items 20
```

Cross-check of the counter's own count over all twelve spot-checks (verbatim `items67`, same rev):

```
55:1s/3i  56:1s/4i  57:1s/4i  58:1s/8i  59:1s/0i  60:1s/9i  61:1s/6i  62:1s/5i  63:1s/6i  64:1s/5i  65:1s/7i  66:1s/4i
TOTAL items 55..66 = 61          (matches plan.md's "61 items in 12 sections")
```

Per-round item labels (first bolded `Rxx-Vy`/`Dx` token in each folded item text; `null` = no such label):
```
r60 k1..k9: R60-V1 R60-V2 R60-V3 R60-V4 R60-V5 R60-V6 R60-V7 R60-V8 R60-V9
r61 k1..k6: R61-V1 R61-V2 R61-V3 R61-V4 R61-V5 R61-V6
r62 k1..k5: null  null  R61-V2  null  null      (numbered list "1."–"5.", no R62-V* labels)
r66 (cross-check only): 4 items — lines 71,72,73 are D1/D2/D3; line 74 is "- **Note for the operator (not a defect, promotion-owned):** all four SHONEN boxes remain lane-asserted [~]"
```

## Findings

- **K68ScoutItemsB-1** (info) — Delivered extraction. Counts: **r59: 1 routed section (`## 8. Routed defects`, line 251), 0 items; r60: 1 section (`## 5. Routed defects the lane must fix next round`, line 163), 9 items; r61: 1 section (`## 6. Routed defects (lane fixes next round)`, line 211), 6 items; r62: 1 section (`## Routed defects the lane must fix next round`, line 55), 5 items.** Frozen counter and v1 tool agree on every round (`parsers_agree: true`). Reproduce: `cd /fast/scratch/… && node extract.mjs` (script copied to `build/K68ScoutItemsB/extract.mjs`).

- **K68ScoutItemsB-2** (info — the required round-59 confirmation) — Why the counter finds **0 items** in round 59: its item grammar admits only lines starting `^([-*+]|[0-9]+[.)])\s` (list item) or `|` (table row) outside fences. The scanned window is lines 252–280: the `## 8.` body proper (252–275, four prose paragraphs led by `**No new lane-owned defect is routed.**`, "Not lane-owned, status-neutral — orchestrator ordering defect", "Operator note", "Not credited") plus `## 9. Non-author statement` (276–280, one prose paragraph) — `items67` extends a routed section to the next *routed* heading or EOF, so §9 is scanned too. Zero list/table lines anywhere in the window, so `items67` and `routedItems` both return `items: []` and `found: true` — the orchestrator-ordering defect named in prose is unledgerable under the declared rule, exactly the plan's stated limit ("its one orchestrator note is not ledgered").

- **K68ScoutItemsB-3** (low — drafting hazard, not a counter defect) — The counter counts **round 66 = 4 items**, not the "D1–D3" (3) the plan's parenthetical names: the section's fourth bullet `corpus/lessons/round-66-verifier-spotcheck.md:74` (`- **Note for the operator (not a defect, promotion-owned):** all four SHONEN boxes…`) is a column-0 list line and is item `66#4` under the frozen rule. The plan's "61" is still right (r55–65 sum to 57, not the prose's "58"), but an L1 ledger draft covering only 66#1–#3 fails L3 with `unledgered:66#4` + `r66-item-4-not-answered-this-round` (probe lines 267–270 require a closed/wontfix row for every round-66 item, answer at an exact line of a lane file whose quote is new vs `8d557f85`). Reproduce: `git show 39f61816:corpus/lessons/round-66-verifier-spotcheck.md | sed -n '69,74p'` then run the verbatim `items67` (or see build/K68ScoutItemsB/extract.mjs on any input range).

- **K68ScoutItemsB-4** (low — operability notes for quote binding) — Three verbatim-`items67` behaviors the ledger's L3 `wb()`/uniqueness checks will bind against: (a) item text keeps folded continuation lines, so r61#2's four indented sub-bullets (`probe:items67` folds them in since they are indented) and r60#9's trailing blank line are part of the item text — quotes may come from inside them; (b) round-62 items carry no `R62-V*` ids (they are `1.`–`5.`); item 3's bolded label is `R61-V2`, so a `R62-*` row id for it would still need `idm` round-match vs `n=62` — `R62-V3`-style ids are safe, `R61-V2` as an id is not (`id-round-mismatch`, probe line 246); (c) `items67`'s section window differs from v1's (ends at next routed heading/EOF, not next same-or-higher heading) — for r59–62 this is verified harmless (identical counts), but a spot-check with list items in a later non-routed section would count them.

## Artifacts

- `build/K68ScoutItemsB/round-59-items.json` — 1 section, 0 items, full section text captured.
- `build/K68ScoutItemsB/round-60-items.json` — 9 items, verbatim folded text + word counts + R60-V ids.
- `build/K68ScoutItemsB/round-61-items.json` — 6 items, same shape.
- `build/K68ScoutItemsB/round-62-items.json` — 5 items, same shape.
- `build/K68ScoutItemsB/extract.mjs` — the extraction script (verbatim `items67` + `routedItems` slicing); reproduces every JSON.

## Limits

- Rounds 55–58 and 63–66 are other seats' slices; I ran `items67` over them only as a read-only cross-check of the counter's 61-item total (result above) — no JSONs written for them.
- `routedId` in the JSONs is a convenience label (first `Rxx-Vy`/`Dx` token); the binding key is `(round, k)` ordinal, which is what L3 consumes.
- Did not run the full probe (it needs a ledger that does not exist yet) — extraction parity was verified parser-to-parser, not counter-run-to-JSON.
