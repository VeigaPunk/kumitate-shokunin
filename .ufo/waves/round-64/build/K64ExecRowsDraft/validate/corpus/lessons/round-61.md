# Round 61 — lesson

author: kumitate-shokunin
base: `c2721f812cebd97ab67a1dd8cd8492a193f82d42`
access date for the source opened this round: 2026-10-25
plan: `.ufo/waves/round-61/plan.md` (frozen before wave results)

## Gate

| candidate | decision | criterion / reason | located evidence |
|---|---|---|---|
| S195 / `temporal-worker-versioning-pinning.md` | ADMIT (source and entry landed; claim C2 does not verify) | Q1–Q4; one source, one theme, durable Workflow code-version boundary | `https://docs.temporal.io/worker-versioning.md`, § Versioning behaviors → § Pinned Workflows, opened 2026-10-25. “A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version.” (13 words; captured at `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md:39`; capture sha256 `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`) |
| `exactly-once-attribution.md` (document arXiv 2609.29095) | REJECT; flip: a later band-4 round re-opens the measured paper and adopts only under the lane's existing document id | duplicate-document scope: lane S134 already identifies this arXiv paper; the package also has two staged rows for that same document (S204 title/structure, S211 abstract). Do not import a measured result not re-opened under this entry | `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/exactly-once-attribution.md`; current package rows `SOURCES.append.md:16,23`; lane `corpus/SOURCES.md` S134 |
| `multi-agent-coordinator-topologies.md` (documents S200/S202) | REJECT; flip: a later one-theme coordinator-topology round re-opens both documents and grounds its measurement claims on a version-pinned source | one-theme rule: coordinator topology is separate from this round's durable Workflow versioning entry. Wave-1's "spliced quote" diagnosis was corrected by wave-2 Audit14: the quote is verbatim in arXiv 2512.08296v3; wave-1 compared v1 §4.1 to the unversioned v3 abstract | `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/multi-agent-coordinator-topologies.md`; `.ufo/waves/round-61/w2/Audit14.md` |

**Claim verdicts.** C1 `DISPATCH61_HELD` fails as declared: the frozen counter is satisfiable by the critic's no-seat fabrication (`w1/CritControlC1.md`), so a CLEAN reading cannot establish dispatch. C2 `DOCTRINE61_HELD` fails as declared: the probe has an unsatisfiable row shape / misindexed cells, and accepts a forged build (`w1/CritControlC2.md`, `build/RevClaimFreeze/verdict.md`). Do not alter either frozen predicate after seats scored.

## Census before → after

Before (committed receipt `.ufo/waves/round-61/base/census-before.txt`; exit 0): `sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` reported six W04 duplicate-URL warnings and registry 133 rows, A=110 B=15 C=8.

After (measured at the close revision): `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` exit 0; rows 134, A=111 B=15 C=8. The single added row is S195, mined, opened 2026-10-25, used only by `corpus/knowledge/temporal-worker-versioning-pinning.md`. Existing rows touched: none. The six W04 warnings remain; no frontier row was changed in place.

## Assimilation

One entry adopted from the staged theme after opening its source this round. The staged Temporal entry cited package S217; the lane registry's next free id is S195, and the entry and its citation use S195. The package's separate S195 MCP Architecture row is not appended; it is the document already held by lane S125. The collision check before append: registry 133 ids; staged package 155 ids; intersection empty. See `.ufo/waves/round-61/build/ScoutCollisionGuard/guard-proof.md` and `.ufo/waves/round-61/assimilation/` receipts.

Quarantine slice: 9 register rows; after the wave-2 version audit, all 9 are present at their cited URL/version, 0 absent, 0 unverifiable. The initial wave-1 S116 `absent` verdict was superseded: arXiv 2512.08296v1/v2 §4.1 says 180/four, but the register's unversioned URL serves v3, where the 260/six sentence is verbatim (§4.1). The exact v3 result, sizes and counts are in `.ufo/waves/round-61/w2/Audit14.md`; per-row register findings remain in `.ufo/waves/round-61/build/ScoutQuarantineRegister/verdicts.md`. The S109/S118/S178 register ids bind to lane-held documents only by URL/DOI, not by equal id. None of the quarantine rows was appended.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| `reference-drift` — campaign quarantine ids were compared with the lane registry by id in round 60, despite the two id spaces differing | `corpus/lessons/round-60.md` §Assimilation; current hand-check `.ufo/waves/round-61/build/ScoutQuarantineRegister/verdicts.md` | none — no criterion required document-identity reconciliation | compare the cited URL/DOI and document, then name both ids; round 61 applies this mapping (e.g. register S109 ↔ lane S125), never infer identity from an id |
| `vacuous` — frozen C1/C2 predicates can read HELD without the claimed activity / are unachievable for an honest record | `.ufo/waves/round-61/w1/CritControlC1.md`, `CritControlC2.md`, `build/RevClaimFreeze/verdict.md` | frozen-plan kill rule (any MISS fails; do-nothing control cannot reach target) | report both claims failed as frozen; a future v2 must bind to evidence not self-authored by the lane, use one consistent row schema, bind full capture bytes to the measured revision, and include positive and negative controls |
| `landing` — after-values were drafted before measurement in an earlier lesson version | `.ufo/waves/round-61/build/ScribeLessonPrep/lesson-draft.md` §Retracted claims; round-61 base/close receipts | none | retain only after-values re-derived at the committed measured revision; the earlier predictions were removed |
| `stale-premise` — the S116 absent verdict was based on a v1 capture while the register's unversioned arXiv URL serves v3 | `.ufo/waves/round-61/w1/ScoutQuarantineRegister.md`; correction `.ufo/waves/round-61/w2/Audit14.md` | none — the check did not pin source version before comparing quote text | compare quote against the exact version actually cited/served; record version-history differences before classifying absent, and amend a verdict only with a fresh source reopen |

## Retracted claims

Earlier drafts' predicted after-values and statements that C1/C2 were HELD are withdrawn. The final revision and counters, not a working-tree prediction, are authoritative. No tool installs or updates this round.
