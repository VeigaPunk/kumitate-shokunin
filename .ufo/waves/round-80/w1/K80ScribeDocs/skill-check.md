# SKILL.md truthfulness check — at `6d03402fddf44cc9797ec590f0f888e933db4677`

Diff base → scaffold: `SKILL.md | 6 +-` — **three** changed lines: one gate-registry row
(`spotcheck-adopt`) and two checklist items (`SKILL.md:742`, `SKILL.md:745`). No second registry row
was changed; see §"Missing sentence" for the row that should have been.

## 1. Gate-registry row `spotcheck-adopt` (`SKILL.md:631`) — changed, reads truthfully

Checked clause by clause against the tool bytes and a live run at the scaffold:

| row clause | measured | verdict |
|---|---|---|
| `--check` → `SPOTCHECK_COVERAGE: CLEAN spotchecks=<n> uncovered=0` exit 0 / `DRIFT … uncovered=<k> first=<path>` exit 1 | `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` exit 0 on the lane; counter arm 02 `DRIFT … uncovered=1 first=corpus/lessons/round-75-verifier-spotcheck.md` exit 1 | true |
| then `MAP: CLEAN` / `MAP: DRIFT first=<finding>`; other map defects disclosed, never folded into the spotcheck verdict | arm 03 `SPOTCHECK_COVERAGE: CLEAN …` + `MAP: DRIFT first=uncovered:knowledge/late.md` exit 0; arm 04 `MAP: DRIFT first=orphan-row:knowledge/ghost.md` exit 0; arm 05 both lines exit 1 | true |
| `--adopt` validates its own delta (target key resolves, every other finding unchanged) | `scripts/spotcheck-adopt.mjs` after the writes: `missing(after,key)` empty and `JSON.stringify(otherFindings(after,key)) === JSON.stringify(otherFindings(result,key))`, else restore + `REFUSED_ORACLE`; arm 08 `ADOPTED … wrote=both` on a red map | true |
| contract `kumitate-spotcheck-adopt-v3`, journal at `.ufo/pins/adopt-journal/<uuid>` with the named refusal/recovery lines | tool header `kumitate-spotcheck-adopt-v3`; `JOURNAL = '.ufo/pins/adopt-journal'`; arms 09–11 (`REFUSED_ORACLE` duplicate, `ALREADY_ADOPTED`, corrupt pre-image `REFUSED_ORACLE` with both destinations and journal retained) | true |
| `--selftest` → `SPOTCHECK_ADOPT_SELFTEST: PASS` | `PASS (28/28)`, `VERDICT: PASS` | true |

Precision nit (not a falsehood, no edit required): the first cell says the byte-writing arm "writes
only the two files it names"; the journal directory is a third path. The same row's contract cell names
the journal, so the row is self-consistent; a reader who stops at cell one would be surprised.

## 2. Checklist item `SKILL.md:742` (Spotcheck-map check, v3) — changed, reads truthfully

Claims: contract `kumitate-spotcheck-adopt-v3` since round 80; the two readings are separate so a green
spotcheck set on an unrelated red map is readable; the repair arm is the registry row's `--adopt`; the
command is `node scripts/spotcheck-adopt.mjs --check` → exit 0 + `SPOTCHECK_COVERAGE: CLEAN`.

Measured: `--check` at the scaffold → `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` +
`MAP: CLEAN`, exit 0; the checklist runner executed the item and read `PASS SKILL.md:742 exit=0
substring=hit`. True. Note the item no longer asserts `MAP: CLEAN` — intended by the split; the map's
blocking gate is item 741 (`readme-map`, `README_MAP: CLEAN files=195 rows=195 covered=195` at the
scaffold).

## 3. Checklist item `SKILL.md:745` (two-reading split + crash recovery) — changed, reads truthfully

| item clause | measured | verdict |
|---|---|---|
| the split readings, delta-scoped `--adopt` on a red map, duplicate refusal, byte-exact rollback and the journal's three SIGKILL windows ride the tool's 28-case suite | `--selftest` `PASS (28/28)`; counter arms 08–11 | true |
| the round-77 probe's label arms (`SPOTCHECK_MAP:`, `v2`) are superseded history and read `held=9/13` at round 80 | `node .ufo/waves/round-77/probe/probe77.mjs --set c2` at the scaffold → `C77_C2: UNMET held=9/13`, failing exactly `c2.1`–`c2.4` on the v2 labels | true |
| its semantic arms c2.5–c2.13 pass | all nine PASS in the same run (`probe77-c2-at-6d03402f.txt`) | true |
| `node .ufo/waves/round-80/probe/probe80-c1.mjs --set c1` → exit 0 + `C80_C1: HELD held=13/13` | measured, exit 0 | true |

## 4. Missing sentence — the `proxy-check` row (`SKILL.md:610`) is stale for C2

The row still presents the O plane as `--omp-root DIR (default $OMP_AGENT_ROOT or ~/.omp/agent)` and
`--omp-shape FILE` as a round-77 additive flag. At the scaffold the tool's own header says the opposite:
with neither `--omp-shape` nor `--omp-live`/`--omp-root` it judges `.ufo/pins/omp-shape.json`
(`source=snapshot`), and `--omp-live` is the explicit live opt-in
(`scripts/proxy-check.mjs:64-68`, `:691-694`; usage line `:7`). `grep -n -- '--omp-live' SKILL.md` →
**0 hits**. Proposed minimal replacement for the two stale clauses (one sentence, no padding):

> round 80 makes the committed receipt the default O source: with neither `--omp-shape` nor
> `--omp-live`/`--omp-root` the proxy judges `.ufo/pins/omp-shape.json` and reports `source=snapshot`;
> `--omp-live` reads the live root (`$OMP_AGENT_ROOT` or `~/.omp/agent`) and is exclusive with
> `--omp-shape` at usage 64; an absent default receipt fails closed (`OMP_SHAPE_NOT_FOUND`), never a
> silent live read.

Nothing else in the row needs to move: the six additive terms, the in-process import, the
`OMP_ROOT_NOT_A_DIR`/`OMP_NOTE_MISSING` fail-closed arms and the `AXES_DRIFT` row are unchanged and
measured true.

## 5. Not changed, checked anyway

- `omp-census` row (`SKILL.md:617`) already names round-77 `--snapshot`/`--shape` and round-78
  `--compare`; measured true at the scaffold (`--shape` CLEAN source=snapshot 65/0/35; `--compare`
  IN_SYNC 65/65).
- Checklist item 741 (`readme-map`) and item 744 (offline receipt re-derivation) read true at the
  scaffold; item 753 (`--compare`, non-scoring, transient classification) reads `IN_SYNC … transient=0`.
