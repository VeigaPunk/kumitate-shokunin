VERDICT: The C1 tool v1 mis-splits two real routed sections (round-37 picks a cross-round heading and counts 27 items instead of 7; round-38's prose-routed items are invisible at 0) but is correct on all 11 in-claim rounds 55–65 (57 items, unchanged by the patch), so the fix is safe to integrate and the claim's item count is unaffected.

## Evidence

Scope run: `routedItems()` over every `corpus/lessons/round-*-verifier-spotcheck.md` in the lane (rounds 34–67 exist; 34–65 were in scope at the freeze), compared against a from-scratch reading of each routed section.

Frozen tool under test = `scripts/routed-ledger.mjs` sha256 `f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5`, identical in the lane, at freeze `621212bac37f8249c72ac982d1d6534cb8d60701`, and at the tip I inspected (`git diff 621212ba..HEAD -- scripts/routed-ledger.mjs` → empty).

Tool vs the frozen counter's independent parser (`probe/ledger66-probe.mjs:67 items66`), over all 32 files:
```
node compare.mjs … → TOTAL tool=189 counter=189 ; every file identical=true
```
So the counter's parser agrees with the tool everywhere — the disagreements below are against a *human* reading, not against the counter.

Real-section inventory (v1 = frozen tool, v2 = patched):
```
round | found | v1_items | v2_items | changed | in_claim_range
37 | true | 27 | 7 | YES | no
38 | true | 0 | 2 | YES | no
55..65 (all) | true | 57 total | 57 total | no | yes
```
(`build/K66ExecToolHarden/corpus-item-split-audit.txt`, all 34 rounds.)

Round-37 routed sections — the file has **two** headings matching the tool's `HEAD_RE`, and the tool takes the first:
```
84:## Round-36 routed defects D1–D8      ← picked by v1 (a round-36 cross-reference)
201:## Routed defects (lane owes next round)  ← round 37's own routed section (R1–R7)
```
v1's 27 items = the D1–D8 disposition table (8 rows), the "D3 sentences still open" bullets, the "Anchor truth at the pin" appendix table, the per-note regression bullets and the "Spot-verified at the pin" table — i.e. round-36 material and appendix prose. A careful human reading of *round 37's* routed section gives 7 items (R1–R7 at `round-37-verifier-spotcheck.md:203,205,208,211,217,219,220`). v2 gives exactly those 7.

Round-38 routed section is prose, so v1 yields zero items and the tool's own rule ("prose paragraphs are not items") makes both routed items invisible:
```
211:## Routed defects / operator handoff
213:R38-1 → kumitate next permitted repair: close the direct-entry missing-key/ordinal
220:R38-2 → kumitate/operator: keep build90-vs-Main88 context violation and partial
```
A human counts 2 items there; v1 counts 0 (`grep -c '^R38-' → 2`).

Other classes measured and found CLEAN on the real corpus (no defect):
- Continuation lines: `contam.mjs` (mirrors the tool's own body rule) → `contaminated-item-lines=0`; no item body swallows a column-0 paragraph, in any of the 34 files.
- Numbered items with nested bullets: round-45 D2 (`:123`), round-44 item 6 (`:201`), round-61 V2/V3 (`:218`,`:224`) keep their sub-bullets in the parent item body (documented rule, and the counter agrees).
- Table separator detection: tool `sep()` vs counter `isSep()` → `sep-divergences=0` across all files.
- Normalisation: tool `norm()` vs counter `norm()` → `norm-divergences=0` on every real item (6 items contain `<…>`/entity text; both strip them identically).
- Prose-vs-item boundary: no column-0 prose is absorbed into an item body anywhere (round-37/48/49/58/59/60 show prose paragraphs correctly *outside* items).

Selftest, before (v1 + the 3 new cases) and after (patched), on the scratch copy only:
```
BEFORE: ROUTED_LEDGER_SELFTEST: FAIL (34/36)   exit 1
  CASE FAIL cross-round routed heading is skipped; the own-round section wins :: items=1
  CASE FAIL a prose routed item opened by an id arrow is an item :: items=0
  CASE ok  prose without an id arrow is still not an item
AFTER:  ROUTED_LEDGER_SELFTEST: PASS (36/36)   exit 0
  CASE ok  cross-round routed heading is skipped; the own-round section wins
  CASE ok  a prose routed item opened by an id arrow is an item
  CASE ok  prose without an id arrow is still not an item
```
(`build/K66ExecToolHarden/selftest-before.txt`, `selftest-after.txt`.) No existing case was weakened: all 33 pre-existing cases still report `ok` in the after run, and the frozen v1 (33/33) receipt `base/routed-ledger-selftest-freeze.txt` is reproduced by the unpatched copy.

Frozen counter `probe/ledger66-probe.mjs` run against two scratch clones (lane untouched):
```
baseline clone  rev f9fcd4b6… → LEDGER66_UNMET held=3/6 … L2 MISS … L3 MISS … L6 MISS
patched  clone  rev 6b9d093b… → LEDGER66_UNMET held=3/6 … L2 MISS … L3 MISS … L6 MISS
```
Identical: the patch changes nothing the counter measures. L2/L3 miss because `corpus/routed-ledger.md` does not exist yet (the C1 data file is unwritten — not my path) and L6 misses because the registry-home rows are not landed. `own-items=57 own-spotchecks=11` in both runs — the counter's own count is 57 over rounds 55–65, matching the tool's 57 before and after the patch.

## Findings

**K66ExecToolHarden-1 — MEDIUM — round-37: the tool binds a cross-round section, so 7 real items are missed and 20 non-items are counted.**
Attacks: section selection. `routedItems()` takes the *first* heading matching `/\brouted\s+(defects?|items?)\b/i`; in `corpus/lessons/round-37-verifier-spotcheck.md` the first match is `## Round-36 routed defects D1–D8` (`:84`), a round-36 cross-reference table, while round 37's own routed section is `## Routed defects (lane owes next round)` (`:201`) with R1–R7 (`:203,205,208,211,217,219,220`). Result: 27 "items", of which 8 are round-36's D1–D8 and the rest are appendix tables/bullets.
Reproduce:
```
node -e "const {routedItems}=await import('./scripts/routed-ledger.mjs');const fs=await import('node:fs');console.log(routedItems(fs.readFileSync('corpus/lessons/round-37-verifier-spotcheck.md','utf8')).items.length)"   # 27
```
Fix (in `build/K66ExecToolHarden/routed-ledger-v2.patch`): skip a matching heading whose text opens with "Round <n>" naming a different round; `routedItems(text, {round})` takes the owning round, `evaluate()` passes it. New selftest case `cross-round routed heading is skipped; the own-round section wins` fails before (items=1) and passes after (items=2).
Note: this is a *widening* only for round-37 (outside the claim's 55–65 window), so the frozen counter's L2/L3 item counts for 55–65 are untouched (measured: 57 → 57, `changedFiles=0` in range).

**K66ExecToolHarden-2 — MEDIUM — round-38: prose-routed items are invisible, so two routed items escape the ledger entirely.**
Attacks: item recognition. `corpus/lessons/round-38-verifier-spotcheck.md:211` `## Routed defects / operator handoff` contains two prose paragraphs, `:213` `R38-1 → kumitate next permitted repair: …` and `:220` `R38-2 → kumitate/operator: …`. v1 counts 0 items for that round, so a ledger for round 38 would bind nothing; a careful reading counts 2.
Reproduce:
```
node -e "const {routedItems}=await import('./scripts/routed-ledger.mjs');const fs=await import('node:fs');console.log(routedItems(fs.readFileSync('corpus/lessons/round-38-verifier-spotcheck.md','utf8')).items.length)"   # 0
```
Fix (same patch): a paragraph that opens with an item id and `→` at the head of a paragraph is an item; wrapped continuation lines stay with it. New selftest case `a prose routed item opened by an id arrow is an item` fails before (items=0) and passes after (items=2); `prose without an id arrow is still not an item` keeps round-59's prose section (0 items) and round-49/58/60's operator-note prose out of the item set.

**K66ExecToolHarden-3 — LOW — one bullet may carry several defect ids, so the item ordinal under-counts the defects.**
Attacks: item granularity. Measured over rounds 55–65: 57 items but 49 distinct `R…-V…`/`R…-…`/`A2e` ids; 6 bullets carry >1 id — `round-55:120` (R41-2, R43-1, R43-5, R53-2), `round-56:111`, `round-57:137`, `round-60:192` (R60-V7, R60-V1), `round-60:195` (R60-V8, R56-V3, R58-V7), `round-61:238` (R61-V5, R56-V3). A ledger row binds one quote to one item ordinal, so a carried defect inside a shared bullet is bound only by the quote that names it.
Reproduce:
```
node -e "const fs=await import('node:fs');const {routedItems}=await import('./scripts/routed-ledger.mjs');for(const n of [55,56,57,60,61]){const r=routedItems(fs.readFileSync('corpus/lessons/round-'+n+'-verifier-spotcheck.md','utf8'));r.items.forEach((it,k)=>{const ids=[...new Set([...it.matchAll(/\b(R\d+-V\d+|R\d+-\d+|A2e)\b/g)].map(m=>m[1]))];if(ids.length>1)console.log(n,k+1,ids.join(','))})}"
```
I did **not** patch this: splitting a shared bullet changes the item ordinals for rounds 55–65 and would therefore change `own-items` in the frozen counter's L2/L3 (which re-derives its own count with its own parser). Fixing it is a counter-side decision, out of my write scope; flagging it for the L1.

**K66ExecToolHarden-4 — LOW (corroboration, not mine) — the selftest inherits `GIT_DIR` and commits its fixture into that repo.**
Peer `K66SentinelTool` raised this; I reproduced it independently: with `GIT_DIR=<fixture>/.git` set, `node scripts/routed-ledger.mjs --selftest` printed PASS and the fixture repo went from 0 to 1 commits (`gitenv_commits_before=0 after=1`). Recorded in `build/K66ExecToolHarden/git-env-inheritance.txt`; the fix belongs with the peer's hardening, not in my two-hunk patch.

## Artifacts

Under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecToolHarden/`:
- `routed-ledger-v2.patch` — unified diff v1 → v2 (parse fix: cross-round heading skip + id-arrow prose items + 3 new selftest cases).
- `routed-ledger-v2-draft.mjs` — the patched tool, integration-ready.
- `routed-ledger-v1-frozen.mjs` — byte copy of the frozen v1 the diff applies to (sha256 `f92a364d…`).
- `selftest-before.txt` / `selftest-after.txt` — the two verdict lines quoted above.
- `corpus-item-split-audit.txt` — v1 vs v2 item counts for all 34 rounds.
- `item-split-diff.txt` — the two changed files item-by-item (before/after).
- `probe-receipts.txt` — frozen `ledger66-probe.mjs` on baseline and patched scratch clones.
- `git-env-inheritance.txt` — corroboration receipt for finding 4.

Scratch (`/fast/scratch/hyaku/kumitate-r66/K66ExecToolHarden/`) deleted on exit. No lane file outside my report and build dir was touched; no commit, no jj/git mutation in the lane.

## Limits

- The operator stopped the run mid-seat: this report is filed from work completed before the stop. I did not run the patched tool against a *complete* ledger (`corpus/routed-ledger.md` does not exist — the C1 data file is unwritten and is not my path), so I could not measure the patched tool's end-to-end verdict on a real ledger; I measured the parser (57 items in-range, unchanged) and the frozen counter's L4/L5 behaviour instead.
- The C1 data file `corpus/routed-ledger.md` was absent throughout, so every "item" statement about the ledger's own rows is untested here.
- Findings 1 and 2 concern rounds 37 and 38, which are outside the claim's 55–65 window; they are tool-hardening, not claim-affecting, and the patch leaves rounds 55–65 byte-identical in item count and item text.
- Finding 3's fix is deliberately *not* proposed as a patch: it would alter in-range item ordinals and hence the frozen counter's own count.
- I did not audit the tool's answer-path containment, `norm()` cost, or ledger-row parsing against real ledger rows — out of this seat's scope and covered by peer `K66SentinelTool`.
- The lane moved past the freeze while I worked (tip `f9fcd4b648d9969915822a4b990deed437f45eb0`, a round-67 spot-check commit); the tool file itself is unchanged since the freeze, so all measurements above are against the frozen v1.
