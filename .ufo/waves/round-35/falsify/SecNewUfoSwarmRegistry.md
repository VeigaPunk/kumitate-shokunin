ATTACK S8 section `scripts/ufo-swarm-registry.mjs` (corpus/knowledge/remaining-scripts-census.md:798-800) verdict=holds defects=0

Scope: the NEW round-35 section only (heading `:798`, body `:800`, member-table row
`:178`). Pin: `/fast/scratch/kumitate-r35/src` detached at
`31c465f15669f744848bd9f5d56191c5085670f7`. No lane-tree edits; fixture mutations
only in `/fast/scratch/kumitate-r35/w/SecNewUfoSwarmRegistry/`.

## Claims checked and observed

1. **Line count 173 L — true.**
   `wc -l /fast/scratch/kumitate-r35/src/scripts/ufo-swarm-registry.mjs` → `173`.
   File is 6736 bytes, LF-terminated (`tail -c 1 | xxd` → `0a`), so 173 is the
   whole-file count, not an off-by-one on a missing final newline. The table cell
   (`:178`) and the section body (`:800`) both say 173.

2. **Pinned identity — true.**
   `sha256sum scripts/ufo-swarm-registry.mjs` in the clone and
   `git show 31c465f1:scripts/ufo-swarm-registry.mjs | sha256sum` both →
   `9293f2bcf29b12fb861f0312dd12ebe49af3cfb5aca5d9ae35eadb9b2c8c5f43`.
   The body's “censused 2026-10-20 against pinned origin `31c465f1`” matches.

3. **Kind `tool` — true by the census's own rule.**
   `corpus/knowledge/remaining-scripts-census.md:116`: “`tool` = every other `.mjs`”
   (path-shape label, explicitly “not a behaviour claim”). `ufo-swarm-registry.mjs`
   is not `*.test.mjs`, so `tool` is correct.

4. **S8 membership — true, reproduced independently.**
   Rebuilt the census's own command (`:75-79`): 88 script-layer files
   (`ls scripts/*.mjs` 70 + `find scripts -mindepth 2 -type f` 18), minus the
   28-name S1–S7 list → **60** members, **33367** total lines, **22** suites;
   `scripts/ufo-swarm-registry.mjs` lands at member #57. The note's 60 distinct
   `## \`scripts/...\`` headings = 60 and the declared S8 count = 60
   (`claims-check --row S8`: `sections=60`, `MEMBER_COUNT_DRIFT` absent).

5. **Anchors — both live and semantically exact at the pin.**
   `awk 'NR==27||NR==165'` on the pinned file:
   `27:export const SWARM_REGISTRY_SCHEMA = "ufo-swarm-registry-v1";`
   `165:export function loadRegistryDocument(bytes, opts) {`
   claims-check JSON for this section:
   `{"heading":"scripts/ufo-swarm-registry.mjs","file":"scripts/ufo-swarm-registry.mjs",
   "anchors":2,"live":true,"symbols":3,"symbolHit":true,"inFamily":true}`.

6. **Description — true (read the file).**
   Header (`:1-25`) states it is “one authority” for the schema, member/agent-id
   patterns, byte bound, relative-path verdict + root-containment probe, and
   `loadRegistryDocument`/`normalizeRegistryDocument` parsing/normalizing the
   envelope/member container into ordered `{name, entry}` rows (`:134-156`).
   Both consumers import it, so “centralizes … shared” is observed, not asserted:
   `scripts/ufo-swarm-wave.mjs:110` imports
   `loadRegistryDocument, MAX_REGISTRY_BYTES, MEMBER_NAME_PATTERN,
   RESUME_ID_PATTERN, SWARM_REGISTRY_SCHEMA, relativePathProblem,
   resolveBeneathRoot`; `scripts/ufo-swarm-collect.mjs:54` imports
   `MAX_REGISTRY_BYTES, MEMBER_NAME_PATTERN, normalizeRegistryDocument,
   relativePathProblem, resolveBeneathRoot, SWARM_REGISTRY_SCHEMA`.
   “ordered member rows” mirrors the file's own wording and the rows array is
   order-preserving (no silent sort).

## Gates run at the pin (lane working tree)

- `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8`
  → `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=60 adv=0)` exit 0.
- Full `claims-check` → `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=0)`
  (matches the declared 175); only 6 pre-existing warnings (S2/R5/R7/R9), none S8.
- `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src`
  → `PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79 coverage=10;
  S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9;
  K=51/51 coverage:kimi-layer=10; pins=6 match)` exit 0, identical to the
  round-end claim line.

## Mutation tests (scratch copies, same `--src` pin)

- **m1 — delete the section heading** (`## \`scripts/ufo-swarm-registry.mjs\``):
  claims `DRIFT MEMBER_COUNT_DRIFT row=S8 declared 60 members, found 59 distinct
  sections`; proxy `DRIFT (S_SECTIONS_DRIFT declared=88 computed=87;
  COVERAGE_SCRIPT_DRIFT declared=10 computed=9; AXES_DRIFT coverage:script-layer
  declared=10 computed=9)` exit 1. This independently confirms the C1 “S 88→87”
  kill direction and that the section is load-bearing for coverage:script-layer.
- **m2 — both anchors retargeted to `:999`/`:998`:**
  claims `DRIFT SECTION_DEAD_ANCHOR` exit 1; proxy exit 0 (see caveat).
- **m3 — `SWARM_REGISTRY_SCHEMA`/`loadRegistryDocument` renamed to absent names:**
  claims `DRIFT SECTION_NO_SYMBOL` exit 1; proxy exit 0 (see caveat).
- Unmutated base copy of the lane tree: claims MATCH, proxy MATCH — the fixtures
  themselves introduce no drift.

## Caveat (not a defect in the section; [INFERENCE] on blast radius)

`scripts/proxy-check.mjs:585-607` counts a section into `S_sections` when
`inFamily === true` only; it ignores `live`/`symbolHit`. So m2/m3 still print
`S=88/88 coverage:script-layer=10` while the claims gate fails. That matches the
documented split (`proxy-check.mjs:84-90` says sections are counted when the gate
“resolved … and graded it a member”), and the round-end claim cites both gates;
it only becomes a hole if a future round reports coverage:script-layer without
the claims-gate run. The section itself is fully anchored, so nothing to fix here.

## Verdict

No refuting evidence found: line count, pinned blob, kind, membership, both
anchors, verbatim symbols, description, and both gates' treatment of the section
all check out. Departed-member history and the 5 deletions are outside this
section's claim and were not re-adjudicated here.

Tooling: none installed. No package transactions, no lane/user-state writes;
only scratch fixtures under `/fast/scratch/kumitate-r35/w/SecNewUfoSwarmRegistry/`.
