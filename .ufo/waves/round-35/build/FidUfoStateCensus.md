FIDELITY scripts/ufo-state-census.mjs anchors=3 ok=1 moved=2 changed=0 gone=0

## Anchor census (source of truth)

grep -n 'ufo-state-census' corpus/knowledge/remaining-scripts-census.md returns exactly:
153 (table row), 154 (test-suite row), 403/404 (member list), 789 (heading), 791 (paragraph), 793/795 (test-suite section).

Anchor categories per assignment: `path:N` / `path:N-M`, `:N` continuations inside the member's own `## ` section, and member-section headings.
- note:789 `## \`scripts/ufo-state-census.mjs\`` — heading, cites the member, judged ok (file still exists at 31c465f1).
- note:791 `scripts/ufo-state-census.mjs:22` and note:791 `:28` — the only two line anchors in this member's section. Both moved.

Table row 153 and list item 403 cite the member without line anchors and are outside the enumerated anchor categories; noted below only for stale-length metadata.

## Non-ok anchors

note:791 | `scripts/ufo-state-census.mjs:22` | `CENSUS_SCHEMA` (primary surface symbol) | moved | scripts/ufo-state-census.mjs:25 | Primary surface symbol `CENSUS_SCHEMA` at `scripts/ufo-state-census.mjs:25`; 964f443e `:22` re-anchored at 31c465f1 (+3 import lines).

note:791 | `:28` | `censusState` (secondary surface symbol) | moved | scripts/ufo-state-census.mjs:31 | `censusState` at `scripts/ufo-state-census.mjs:31`; 964f443e `:28` re-anchored at 31c465f1 (+3 import lines).

## Evidence

Diff 964f443e..31c465f1 inserts two import lines plus one reflowed-import line before the constants block:
- 964f443e:17-23 (old 16-22): `import { dirname, join, relative, resolve, sep }` → 31c465f1:20-23 adds `isAbsolute` to that import and adds `import { isMainModule } from "./ufo-mission-result.mjs";`. Net +2 lines before `CENSUS_SCHEMA`.
- 964f443e:22 `export const CENSUS_SCHEMA = "ufo-state-census-v1";` → 31c465f1:25, same declaration, same value.
- 964f443e:28 `export function censusState({ stateDir, top = DEFAULT_TOP, maxEntries = DEFAULT_MAX_ENTRIES })` → 31c465f1:31 `export function censusState({ stateDir, sessionsDir = null, top = DEFAULT_TOP, maxEntries = DEFAULT_MAX_ENTRIES })`.

Behavior-change scan at anchor sites: no described behavior removed or changed.
- `CENSUS_SCHEMA` value `ufo-state-census-v1` identical at 31c465f1:25.
- `censusState` remains the exported entry point; its signature only gains an optional `sessionsDir = null` parameter — an additive extension, not a change to any behavior the note describes. The note's claim (primary/secondary surface symbol location) is purely positional, so both anchors are moved, not changed/gone.
- No note text describes any behavior the diff removed: the note's only claims are the two symbol anchors plus the member metadata (184 L, tool, "Live S8 member", revision label). The diff's behavioral changes (`--sessions-dir`/`UFO_SESSIONS_DIR` second-root walk, `isWithin`/`admitRoot` helpers, `isMainModule` entry guard) touch code the note never anchors or describes.

Stale metadata (outside anchor statuses, flagged for the re-census owner): member length claim "184 L" (note:791 and table row 153's `| 184 |`) was exact at 964f443e (verified 184 lines) but is 219 L at 31c465f1 (+54/-19, confirmed by the diff stat and `git show 31c465f1:... | wc -l` = 219). [INFERENCE] The script-layer re-census (C2) should carry the 219 L figure; length correction is not an anchor move and is not counted in the verdict line.

## Commands run

1. `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7` (pin confirmed).
2. `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-state-census.mjs` → 153-line diff, stat `1 file changed, 54 insertions(+), 19 deletions(-)`.
3. `git -C /fast/scratch/kumitate-r35/src show 964f443e:scripts/ufo-state-census.mjs | wc -l` → 184; `| nl -ba | sed -n '18,32p'` → `CENSUS_SCHEMA` at 22, `censusState` at 28 (note anchors verified verbatim at the cited lines).
4. `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-state-census.mjs | wc -l` → 219; `| nl -ba | sed -n '25p;31p'` → `CENSUS_SCHEMA` at 25, `censusState` at 31 (read from the git object, not the worktree).
5. `grep -n 'ufo-state-census' corpus/knowledge/remaining-scripts-census.md` → the 9 lines listed above (anchor census complete).

## Notes

- Read-only: no notes or lane files edited; no installs performed (existing git/grep sufficed); no pacman transactions.
- No [UNVERIFIED] items; the only inference is the re-census handoff suggestion above.
