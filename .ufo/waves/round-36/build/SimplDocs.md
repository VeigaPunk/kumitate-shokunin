SIMPL docs cuts=25 lines-saved=47

Read-only review of the four drafts in the build reports (no lane file edited, no
gate run): `ScribeKnowledgeFidelity.md` :47-120, `ScribeKnowledgePin.md` :5-93,
`ScribeLesson.md` :45-127, `ScribeSkillProse.md` :6-126, plus the intro now landed
at `SKILL.md:615-625` (under-list :646-654). Line deltas are net document lines for
the touched blocks at 80 cols; the lesson draft wraps at ~100, so its share reads 5
there, 7 at 80: headline 45-47.
# Cuts

## A. `anchor-fidelity-gate.md` — 10 cuts, 17 lines

A1 `ScribeKnowledgeFidelity.md:49` suffix `It turns the claims gate's geometric
liveness test into a content check; without it a section passes while its cited
passage moves out from under it.` -> delete; "## Four defect shapes" is the
evidence. **2**
A2 `:62` `— not a token or AST match` -> delete; Limits bullet 3 states the limit
with its consequence ("substring containment lets `foo` pair with `foo_bar`"). **0**
A3 `:74` `— an anchor with no adjacent symbol or no math-checkable range is outside
this arm's claim, and dead geometry is already…` -> merge to `…never gated or
ratcheted, and dead geometry is already the registry gate's (`SECTION_DEAD_ANCHOR`,
`scripts/claims-check.mjs:377-380`).` Keeps formula, "never ratcheted", citation. **1**
A4 `:82-85` four bullets -> one-clause shapes: delete `Geometry still live, `,
`Liveness sees geometry; fidelity asks where the paired symbol is: `,
`; if the symbol falls inside, the padding is invisible (limit below)`, and
`: printed so the census is complete, not a failure — the arm refuses to guess a
symbol the note did not write`. All four shapes survive by name. **3**
A5 `:91` first sentence `The only way to permit debt is to list a ceiling; deleting
an entry re-tightens that note to zero. ` -> delete; the contract sentence above
already fixes "a note absent from `notes` must read `nonok=0`". S030/S023 stays. **1**
A6 `:93-95` `## Pin coupling` (heading + 5-line paragraph) -> one paragraph:
`` `--pin` (PIN v1 — pin-file contract, the three outcomes and the `src-rev=`
segment: `corpus/knowledge/pinned-evidence.md`) resolves `--src` for this mode
too. `` Pin entry owns the subject; the note's mandate names no pin term. **5**
A7 `:99` `(hardcodes `self`/`src`, imports the live `probeSections`; run as a
`.mjs`; no invocation line was recorded)` -> `(no invocation line was recorded)`;
runner internals are in the report, the honesty clause stays. **1**
A8 `:113` `with every ratchet ceiling at 0 or the note absent from `notes`, and ` ->
delete; restates Ratchet, the nine-section `nonok=0` check stays. **1**
A9 `:117` `The class boundary is implementation-defined at the margins; ` -> delete;
restates the two totals just quoted. Keeps "the ratchet pins the landed script's
numbers, not the prototype's". **1**
A10 `:120` bullet -> merge its unique clause into "No semantic equivalence"
(`…passes any range, and blank lines inside an otherwise live range are not
seen.`); delete ``They are printed to make the census auditable; the gated number
is `elsewhere + absent` only.`` Membership is already in A3 and the table. **2**

## B. `pinned-evidence.md` — 4 cuts, 12 lines

B1 `ScribeKnowledgePin.md:52-53` `, `PROXY: MATCH (… pins=<n> match; src-rev=…)`,
`SURFACE_PROBE: DRIFT (… errors=<n> warnings=<n> src-rev=…)`` -> `, and
`proxy-check`/`surface-probe` carry the same segment`. One example is the claim;
three identical ones are not. Keeps `CLAIMS:`, the mismatch line, "12 is display
only". **1**
B2 `:57-63` `## Reproduction` + its fenced clone/checkout/chmod block -> delete;
append to the pin-file paragraph: `Rebuild the clone with the `recreate` string
verbatim, then `node scripts/claims-check.mjs --pin .ufo/pins/origin.json`.` The
exact one-liner is the `recreate` value at `:33` (byte-identical to
`ExecPinFiles.md:20`), and the command is in the `recheck:` header. **4**
B3 `:72-77` dispatcher paragraph (`Pinning presupposes a tree the gate cannot
mutate. … proves the tree unchanged before/after.`) -> delete; the mkdtemp fix is
C1(b)'s operating rule, owned by SKILL snippet 6 and lesson row 3, and the operator
paragraph above keeps "chmod a-w". **6**
B4 `:87` `- **External docs.** Sourced rows carry fetch date + anchor, not a
commit.` -> delete; the item names two unpinned classes, and source-row citation is
a third subject. **1**

## C. `corpus/lessons/round-36.md` — 5 cuts, 7 lines

C1 `ScribeLesson.md:54-59` `Before, in `.ufo/waves/round-36/baseline/`: `CHECKLIST:
11/13 pass`; … noid=429).` -> replace with `— with the before numbers under
`.ufo/waves/round-36/baseline/.`` Every number is the SCORECARD move-log `Before`
cell and is quoted per-row in the Mistake evidence column; the lesson is the only
one of the three artifacts with no mandate to restate them. **6**
C2 `:97` `(counts rise from the baseline 39/39 claims suite; quote the new totals)`
-> delete; an instruction to the future runner, not a lesson. **1**
C3 `:65` row 1 fix `Round 36 C1 pin: `--pin` (default `<self>/.ufo/pins/origin.json`
when present) resolves src from the pin's clone, asserts the revision and prints
`src-rev=` in the verdict;` -> `Round 36 C1 pin (`--pin`, PIN v1);`. Contract text
lives in pinned-evidence.md and SKILL; the row keeps the checklist effects (620
`--known`, 625/627 inherit, 13 -> 14). **0** (table row)
C4 `:65` tail `; at draft time `SKILL.md` still carries the 13 items` -> delete;
ships false once the patch lands. **0**
C5 `:69` tail `Draft-time state: no re-run output in `.ufo/waves/round-36/build/`
yet.` -> delete; same class as C4. **0**

## D. SKILL snippets — 6 cuts, 11 lines

D1 Snippet 4 (`ScribeSkillProse.md:46-52`, 7 lines) -> 5: drop the verbatim
re-quote of the retired sentence and the closing recap; keep the surviving gap
(frozen expected-verdict snapshot), the date, the gate names, the pin path, PIN v1,
the working-rules pointer. **2**
D2 Snippet 6 (`:78-92`, 15 lines) -> 13: delete `resolve `--src` from the pin's
clone when `--src` is absent, assert `git -C <src> rev-parse HEAD` equals the
pinned revision, ` and `(`PROXY: DRIFT (…; src-rev=31c465f15669)`)`; both are in
the under-list sentence and the registry rows. Keep recreate, the operator rule,
`--pin` default, `src-rev=`, both exit-2 outcomes, no-pin portability, mkdtemp. **2**
D3 Snippet 7 (`:99-126`, 28 lines) -> 24: replace the 7-line pairing heuristic with
`(window and exclusions: `corpus/knowledge/anchor-fidelity-gate.md`)` and the
4-line output-shape tail with `the per-note line shape is in
`corpus/knowledge/anchor-fidelity-gate.md``. Universe/classes/ratchet/repairs and
the no-pin clause stay verbatim. **4**
D4 `SKILL.md:620-625` (6 lines) -> 4: drop `(contract `kumitate-origin-pin-v1`, a
private clone detached at a pinned revision)` and `so a pass is scoreable against
a revision instead of against whichever tree sits at the default path`; the
contract id and that rationale recur at :646-654. Keep the pin-aware item list,
item 1's explicit `--src`, the fallback. **2**
D5 `SKILL.md:646-654` (9 lines) -> 8: `With a pin active (`.ufo/pins/origin.json`,
contract `kumitate-origin-pin-v1`) the pin-aware gates resolve `--src` from the
pin's read-only clone, assert that clone's `HEAD` equals the pinned revision, and
print `src-rev=<12 hex>` inside the verdict line, ` -> `With a pin active they
assert the clone's `HEAD` equals the pinned revision (contract
`kumitate-origin-pin-v1`), `. Rationale and mkdtemp sentence stay. **1**
D6 `ScribeSkillProse.md:17` `(a listed finding must fire — `KNOWN_STALE` — an
unlisted one stays an error)` -> `(a listed finding that stops firing is
`KNOWN_STALE`)`; word cut, the strict direction is the claim. **0**
# Corrections the cuts do not cover

R1 **11-hex `src-rev=` in quoted verdicts.** The gates print `slice(0,12)` =
`31c465f15669`; `31c465f1566` (11) appears in `ScribeKnowledgeFidelity.md:110`,
`ScribeLesson.md:83,88,91`, and the Log/Shonen drafts. Pin note and SKILL snippet 6
use 12; a quoted verdict must be the line the gate prints.
R2 **Stale-on-arrival sentences** are cut as C4/C5; no other draft carries one.
R3 **Snippet 5 is already applied** (`SKILL.md:615-618` + pin paragraph 620-625);
apply D4/D5/D6 to that text, do not paste Snippet 5 again (the scribe's finding 5).
# Preserved (nothing falsifiable or cited was cut)

Exit codes (0/1/2/64; `SRC_REV_MISMATCH`/`SRC_REV_UNVERIFIABLE`/`SRC_NOT_A_DIR`/
`KNOWN_STALE`/`KNOWN_REV_MISMATCH`/`RATCHET_MALFORMED`/`RATCHET_REV_STALE`); the
five classes and `nonok = elsewhere + absent`; ratchet id, revision equality,
ceilings; PIN v1 id, default path, resolution rule, `src-rev=` width; the exact
`recreate` string; mkdtemp isolation; before totals (`anchors=1530 … nonok=588`),
the reference limit (1504/577); S023/S030/S031/S032 ids and quotes; 13 -> 14
checklist history; every path:line citation.
Tradeoff: A6/B2/D3 swap contract text for pointers, so the entries stop being
self-contained on pin/fidelity mechanics — safe only if both notes land this round.
# Out of headline (not counted)

E1 `SCORECARD.md` draft S7 (a)/(b) restates the two notes' classes, before totals
and pin contract (`ScribeScorecard.md:110-140`); pointers instead, keep (c)/(d):
≈7 lines [estimate].
E2 Fidelity draft `:105` `Largest debts: …` duplicates the prototype file's
per-note lines (kept as evidence); optional, 2 lines, falsifiable data.
# Commands run (read-only)

`cat` of the four build reports; `sed -n '610,665p' ExecChecklistRewrite/lane/SKILL.md`;
`grep -n 'src-rev=31c465f1566\b' .ufo/waves/round-36/build/Scribe*.md`; `grep -n
'recreate' .ufo/waves/round-36/build/ExecPinFiles.md` (matches the note's literal);
python3 `textwrap` at 80 cols per touched block; the pin gate was not re-run; no installs, no lane writes, no git/jj mutation.
