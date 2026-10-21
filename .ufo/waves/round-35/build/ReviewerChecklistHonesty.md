CHECKLIST_HONESTY stale_assertions=5 flippable=625,627,628
(stays red: 620 — upstream-owned sighting surface; see F4)

# Operability honesty review — round 35 build (read-only seat)

Baseline: `.ufo/waves/round-35/baseline/checklists.txt` → `CHECKLIST: 9/13 pass`,
`VERDICT: FAIL`, exit 1, src pinned `31c465f1`. FAIL items: SKILL.md:620 (Live
sighting-surface conformance), :625 (Proxy recompute), :627 (Member-claims gate),
:628 (Kimi-substrate census).

## A. Prose lines asserting checklist pass / "executed" with a pass count

All matches for `CHECKLIST: n/m`, `executed checklist`, `runs green`, `pass`,
`thirteen` across SCORECARD.md, SKILL.md, README.md. README.md: zero hits — clean.

STALE (correction note drafted below):

1. **SCORECARD.md:47-49** — "All eleven are *executed*, not merely listed:
   `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 10/10 pass`,
   `VERDICT: PASS`, exit 0". Present-tense + pass count. False today: 13 items,
   9/13, exit 1 (baseline). Also internally inconsistent ("eleven" vs "10/10").
2. **SCORECARD.md:313-314** — "operability now has five runnable artifacts and
   ten executed checklist items". False today: A=7 (SCORECARD.md:307), C=13.
3. **SKILL.md:663-664** — "Current 2026-09-29 measurement: `8/8 × 74/114` ⇒ 6
   and `11/11 × 69/98` ⇒ 7". The "Current" label is stale: the stanza the same
   file pins declares S_members=91/S_sections=91, coverage_script=10
   (SCORECARD.md:285-309), and at the round-35 pin the tree computes
   S_members 88 / S_sections 86 ⇒ 9 (baseline/proxy.txt S_MEMBERS_DRIFT,
   S_SECTIONS_DRIFT, COVERAGE_SCRIPT_DRIFT). Paragraph describes round 16.
4. **SKILL.md:660-663 and :762-764** — layer member counts "scripts/*.mjs (72) +
   every file under scripts/*/ (42 …)", runtime "93 + 5" (Σ 114/98). Round-16
   tree. Frozen round-35 census: 88 script members (frozen/s-deleted-5.txt −5,
   frozen/s-added-2.txt +2, s-modified-members-55.tsv; 91 → 88). Runtime 92
   unchanged (no R_MEMBERS_DRIFT in baseline/proxy.txt).
5. **SCORECARD.md:1521-1524** — Round-32 executed: "the stanza + `## Axes` now
   carry the measured values: `S_members` 114→**91**, `S_sections` 74→**56** …
   `floor(10 × 56/91) = 6`". Contradicts the stanza that actually ships
   (declared S_sections=91, coverage_script=10, Axes rows 10 — baseline/proxy.txt)
   and SCORECARD.md:309 ("91, round-32 measurement"). The 56 is the 2026-10-13
   recon reading (SCORECARD.md:740-743). One of the two round-32 narratives is
   wrong about its own round; unreconciled in the record.

HONEST-DATED (no correction needed; listed for completeness): SCORECARD.md:418
(round-14 `CHECKLIST: 10/10 pass`), :423 (round-12 selftest 20/20), :426
(round-11 C=9), :428 (round-10 6/6), :430 (round-9 C=4), :550 (round-14
executed-vs-forecast 10/10), :1014 and :1109 (`CHECKLIST: 9/9 pass` records),
:1407/:1410 (round-17 incident 10/10→8/10→10/10), :837 ("runs green" — round-20
milestone record; the kimi item is red today, but the sentence is dated by its
block), :393-394 (round-34 rows: C=13 and live `SOURCES_CHECK: CLEAN` still true
per baseline/sources.txt exit=0; the kimi row records the before-state DRIFT
accurately). SKILL.md:613-630 checklist block is mechanism-descriptive, no pass
claim.

## B. Flippability of the four failures

- **625 Proxy recompute — FLIPPABLE via C2 (+C1 re-pin).** baseline/proxy.txt:
  6 errors — C2_TOTAL_DRIFT 77→78, S_MEMBERS_DRIFT 91→88, S_SECTIONS_DRIFT
  91→86, COVERAGE_SCRIPT_DRIFT 10→9, AXES_DRIFT ×2 (coverage,
  coverage:script-layer). C2's re-census re-pins stanza + Axes at 31c465f1;
  declared==computed ⇒ MATCH. Target 88/88 ⇒ 10 requires sectionizing the 2
  added members (`scripts/omp-route-grammar.mjs`, `scripts/ufo-swarm-registry.mjs`,
  frozen/s-added-2.txt); landing 86 sections instead yields score 9 — MATCH is
  still achievable with 9s, 10 is not. PIN_UNPINNED (scripts/sources-check.mjs,
  warn) does NOT gate: checklist item runs bare (SKILL.md:626) and
  scripts/proxy-check.mjs:940 `drift = errors > 0 || (strict && warnings > 0)`.
  C1 (distinct S/R derivation) changes how S_sections/R_sections compute; its
  re-pin must land atomically with C2's or the stanza drifts mid-round.
- **627 Member-claims gate — FLIPPABLE, but C2 alone is insufficient.**
  baseline/claims.txt: 6 errors — 5 × SECTION_FILE_UNRESOLVED (S8:
  omp-wave-context.mjs, primeagent-recovery-assess.mjs,
  primeagent-refinement-ledger.mjs, ufo-refinement-context.mjs,
  ufo-refinement-context.test.mjs) — exactly frozen/s-deleted-5.txt, cleared by
  C2's note re-census; PLUS 1 × SECTION_DEAD_ANCHOR row=R11
  `crates/ufo-core-runtime/src/round.rs` anchors 17-20 dead (runtime member
  modified upstream). That is outside C2's script-layer scope; round-35
  pre-reg claim 3 (R5+R7 sectionization, SCORECARD.md:449-450) does not cover
  R11 either. scripts/claims-check.mjs:421 `drift = errors > 0 || …` — any
  single error keeps 627 red. Needs the R11 anchor re-verification as
  maintenance in the same landing.
- **628 Kimi-substrate census — FLIPPABLE via C3.** baseline/kimi.txt: single
  error `UNLISTED mcp.json`, K1 members=3 frozen=3, members=50 checked=50.
  C3 (K1 3→4 shape-only member; census MEMBERS+FROZEN re-pin; stanza
  K_members 50→51 per SCORECARD.md:439-444) ⇒ CLEAN, 51/51.
- **620 Live sighting-surface conformance — STAYS RED (upstream).**
  baseline/surface.txt: `SURFACE_PROBE: DRIFT`, errors SCRIPT_DIGEST_MISMATCH
  (concatenated bytes sha256:f17d1547… ≠ manifest.scriptDigest b36559d0…) and
  VERB_UNDECLARED (`surface` dispatched in scripts/ufo-sighting.mjs, absent
  from manifest). Both live in the origin tree's sighting manifest/scripts
  (`config/ufo.json` surfaceDigest — SKILL.md:600,700-710 names it an
  out-of-repo gap); this lane holds no write there (source pin: read-only
  clone at the detached revision). No round-35 claim touches the surface.
  Upstream-owned repair (regenerate manifest / declare the verb).

## C. Correction note — APPEND-ONLY draft (for the integrator to append to SCORECARD.md; I wrote no lane file)

```markdown
**Errata — round 35 build, 2026-10-20 (checklist-honesty sweep; appended, nothing above edited).**
At round-35 open the executable checklist reads `CHECKLIST: 9/13 pass`, `VERDICT: FAIL`, exit 1
(`.ufo/waves/round-35/baseline/checklists.txt`, src pinned `31c465f15669f744848bd9f5d56191c5085670f7`):
items at SKILL.md:620 (Live sighting-surface conformance), :625 (Proxy recompute), :627 (Member-claims
gate), :628 (Kimi-substrate census) FAIL. Standing prose above therefore no longer describes the present:
1. `:47-49` "All eleven are *executed* … `CHECKLIST: 10/10 pass` … exit 0" — true as dated (their
   admission rounds), false as standing prose: the list is now thirteen items and the live run is 9/13,
   exit 1. Read as "were executed at admission"; current state is this errata's 9/13.
2. `:313-314` "five runnable artifacts and ten executed checklist items" — round-15-era counts; today
   A=7, C=13 (see `:307`).
3. SKILL.md:663-664 "Current 2026-09-29 measurement: `8/8 × 74/114` ⇒ 6 …" — the "Current" label is
   stale; the stanza has since been re-measured (S_members 91, coverage_script 10, `:285-309`), and at
   the round-35 pin the tree computes S_members 88 / S_sections 86 ⇒ 9 (`baseline/proxy.txt`). It
   describes the round-16 reading; re-label it dated or re-measure at close.
4. SKILL.md:660-663 and :762-764 member counts (scripts 72 + scripts/*/ 42 = 114; runtime 93 + CLI 5)
   describe the round-16 tree; the pinned tree holds 88 script members (frozen s-deleted-5.txt −5,
   s-added-2.txt +2, s-modified-members-55.tsv; 964f443e→31c465f1). Runtime 92 unchanged.
5. `:1521-1524` (Round 32 executed) "the stanza + `## Axes` now carry … `S_sections` 74→**56** …
   `floor(10 × 56/91) = 6`" contradicts the stanza that ships (declared S_sections=91,
   coverage_script=10; `baseline/proxy.txt`) and `:309` ("91, round-32 measurement"). The 56 is the
   2026-10-13 recon reading (`:740-743`). The round-35 integrator must reconcile which narrative
   round 32 actually landed before close.
Flippability: 625 flips via C2's stanza+Axes re-pin (C1's distinct-derivation re-pin in the same
landing); 627 flips via C2's note re-census for the 5 deleted S8 members PLUS an R11 round.rs
anchor repair (anchors 17-20; runtime-side, outside C2's script-layer scope — claims-check gates on
any error); 628 flips via C3 (K1 3→4, K_members 50→51). 620 stays red: SCRIPT_DIGEST_MISMATCH and
VERB_UNDECLARED (`surface`) are origin-tree sighting-manifest defects (`config/ufo.json`
surfaceDigest; `scripts/ufo-sighting.mjs`) — upstream-owned; this lane holds no write there.
```

## D. Commands run / evidence

- Read `.ufo/waves/round-35/baseline/{checklists,proxy,claims,census,kimi,surface,sources}.txt` and
  `frozen/{s-deleted-5,s-added-2}.txt` (+ TSV listing); all citations above quote them.
- Grep over the three prose files: `CHECKLIST: ?\d+/\d+`, `executed checklist|\d+/13|…executed…`,
  `runs green|all green|…pass…|thirteen`, `S_sections`, round headings. README.md: no assertions.
- Exit semantics read from source: `scripts/proxy-check.mjs:937-940`, `scripts/claims-check.mjs:418-421`
  (warn-only ≠ drift without `--strict`; bare checklist runs are un-strict).
- No tools installed (none needed); no lane files written except this report; no gate re-run (frozen
  baseline is the ground truth; the forbidden origin path was never touched).

## E. Residual risk / verification gaps

- [INFERENCE] Section placement for the 2 added members (S8 remainder note vs an S-family row's own
  note) is the executor's call; I verified membership and counts, not placement.
- The SCORECARD.md:1521-1524 vs :309 round-32 contradiction is flagged, not resolved — resolving it
  requires the round-32 wave records, which I did not open (out of item scope).
- PIN_UNPINNED (sources-check.mjs) stays a standing warn after C2; harmless to the bare checklist item
  but it will surface under any future `--strict` run — maintenance may pin it (pre-reg does not name it).
- Post-fix state (C2/C3 landed, 620 still red) is asserted from gate semantics, not executed — gates
  were not re-run in this read-only seat.
