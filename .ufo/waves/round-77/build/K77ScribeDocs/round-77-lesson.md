author: kumitate L1
round: 77

# Round 77 — pinned OMP shape and crash-recoverable adoption

Draft for L1 application, not a landed result. Axes: C1 coverage:omp and C2 operability. Frozen plan: `.ufo/waves/round-77/plan.md`, scaffolding `4dc470a131e10900fdd456b6b68d7ba27151d9d2`. Measured close revision: <TBD>. Final claim outcomes: <TBD>. Every figure below is either an explicitly attributed inherited receipt or awaits L1's measured close; this scribe did not rerun the gates.

## Gate

- **Admit — S227, SQLite, Atomic Commit In SQLite** (docs, tier A), https://www.sqlite.org/atomiccommit.html, §§4.2 “Hot Rollback Journals”, 4.4 “Rolling Back Incomplete Changes”, 9.5 “Deleting Or Renaming A Hot Journal”. The source supplies the ordering principle for C2: publish usable pre-images before changing destinations and recover before normal work resumes. This is a two-file single-writer adaptation, not SQLite locking, isolation or power-loss durability. Registry/capture provenance: `corpus/SOURCES.md` S227 and `.ufo/waves/round-77/open/captures/sqlite-atomiccommit.html`; independent source-seat quote agreement and close grounding: <TBD>.
- **Reject — `merge/kumitate/` package as a bulk append (carried, corrected count).** Frozen plan §Assimilation records **155 S-rows / 161 lines / 70 entries**, unchanged from round 75, not the round-76 lesson's “161 rows over 70 entries … larger”. Criterion missed: §10 scoping/proportionality and CORPUS.md rule 4 (expansion is knowledge, not rows); this package cannot be re-grounded entry by entry inside a two-claim tooling round. **Flip:** a dedicated assimilation round that opens, re-grounds and judges entries individually. Assimilation: none.
- **Hold — round-78 candidates.** The unrelated-map-drift `--check` split, one K-plane derivation, and live-versus-snapshot drift policy remain candidates, not shipped behavior or extra claims. Flip: separately scoped evidence and frozen predicates for each admitted move.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| control-fixture-path-shape (inherited r76) | r76 lesson: a `corpus/lessons/`-prefixed first cell was ignored; corrected control used bare `lessons/` | none for ignored malformed cells; oracle only parses its declared row grammar | Keep corrected fixture with parsed row count; preserve the failed first attempt as evidence, not a claimed half-state. |
| predicate-count-vs-schema (inherited r76) | r76 C1 froze one textual coverage_omp occurrence; JSON legitimately emits computed and declared slots | Q70 and Q64 | Judge the computed JSON path and exercise the actual counter on a known-good sample before freezing; do not rewrite the inherited literal miss. |
| freeze-under-red-map (inherited r76) | r76 `plan-before-ready` archive map arm stayed DRIFT despite green close | existing map arm, not run before that freeze | r77 scaffolding repairs the inherited map first; retain frozen historical bytes. |
| control-token-spelling (inherited r76) | frozen `STANZA_UNKNOWN_KEY` versus receipt `STANZA_KEY_UNKNOWN` | Q65 | Preserve both verbatim and quote receipt tokens exactly. |
| adopt-appends-at-eof (inherited r76) | r76 lesson records a lessons row after `## Frontier` despite CLEAN oracle | none for placement in v1 | C2 inserts after last lessons row; frozen c2.11 checks placement above Known gaps independently of oracle cleanliness. |
| absent-diagnostic-evidence / FREEZE-FIX-6 disposition | `open/r76-freeze-fix-6-disposition.txt` records `git cat-file -e ebfcedfa:scripts/spotcheck-adopt.mjs` exit 128, but the loader command imports `spotcheck-adopt-absent.mjs` and prints an ERR_MODULE_NOT_FOUND excerpt with `exit=0` | Q55 receipt fidelity; source-seat review disposition <TBD> | Keep actual module absence separate from the supplemental differently named loader demo; do not call its exit line a successful proof of the exact original loader invocation. The inherited receipt is not rewritten. |
| carried-reject-count-unit | r76 lesson conflated lines with rows and called the unchanged package larger; r77 frozen plan corrects the units | source/counter unit review | Use 155 rows / 161 lines / 70 entries, attributed to the frozen plan; retain original filed lesson as history. |
| close-upstream-instrument-refusal (r75 D4 carried) | frozen plan: `round-gate --close` reports `UPSTREAM_MISSING` on jj detached HEAD | round-gate fail-closed arm | Why-not: operator-owned instrument, outside lane repair authority; disclose refusal, do not weaken the gate. |
| readme-map-final-newline (r76 routed D4) | frozen plan records lost final newline and scaffolding restoration of `}\n` | byte-level destination inspection | v2 writer preserves destination final-byte state; keep newline repair separate from claims. |
| recurring-closure-uncovered (sixth recurrence) | `open/gates-open.txt`: pre-repair README_MAP DRIFT, spotchecks=43 uncovered=1; freeze records both map readings CLEAN | readme-map + spotcheck check + plan-before-ready map arm | Row and covered-pin repaired in scaffolding inside the table; do not claim this pre-data repair as v2 execution. |

## Counters

First series table for `considerthese/2026-10-26.md` proposal 6; counts are not trend verdicts. Open/freeze values below are quotations of committed `open/gates-open.txt` / `open/inherited.txt` at scaffolding, not fresh scribe measurements. L1 supplies close revision, command, exact output and receipt for every final cell.

| counter | open at a321ed80 / freeze context | close at <TBD> | provenance / counting command |
|---|---|---|---|
| proxy findings | three named findings: A_DRIFT, C2_TOTAL_DRIFT, AXES_DRIFT; unchanged at freeze | <TBD> | `node scripts/proxy-check.mjs --strict`; `open/gates-open.txt` lines 6,17 |
| census entries / findings | entries=64 findings=0 bound=35/35 at freeze | <TBD> | `node scripts/omp-census.mjs`; `open/gates-open.txt` line 12; report offline and live readings separately |
| README uncovered | uncovered round-76-verifier-spotcheck before repair; files=184 rows=183 covered=183 bad=2 → freeze CLEAN files=184 rows=184 covered=184 | <TBD> | `node scripts/readme-map.mjs`; `open/gates-open.txt` lines 4,10 |
| spotcheck uncovered | spotchecks=43 uncovered=1 → freeze uncovered=0 | <TBD> | `node scripts/spotcheck-adopt.mjs --check`; `open/gates-open.txt` lines 5,11 |
| registry rows / tiers | freeze rows=166 tiers=A:142,B:16,C:8 (includes S227 scaffolding) | <TBD> | `node scripts/sources-check.mjs`; `open/gates-open.txt` line 13; do not confuse this with pre-S227 base census |
| cite-check findings | <TBD> | <TBD> | `node scripts/cite-check.mjs`; proposal 6's noisy-counter series also includes citation errors |

A rising close counter requires an explicit explanation here: <TBD>. Do not treat a missing close reading as zero.

## Spot-check

Pending the non-author closure. No author-seat review is substituted for that closure. The next closure's `corpus/lessons/round-77-verifier-spotcheck.md` and map row must not be pre-created. Record named non-author admit/reject agreement or disagreement and the resulting disposition only when it exists.
