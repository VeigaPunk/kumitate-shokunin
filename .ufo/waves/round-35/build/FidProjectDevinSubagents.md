FIDELITY scripts/project-devin-subagents.mjs anchors=9 ok=1 moved=5 changed=2 gone=1

# C2 anchor fidelity — `scripts/project-devin-subagents.mjs`

Source pin: /fast/scratch/kumitate-r35/src, base `964f443e` (444 L) -> `31c465f1` (379 L), diff +9/-74.
Notes under test: `corpus/knowledge/remaining-scripts-census.md` — roster row `:129`, section heading `:656`, single-paragraph body `:658` (no `:N` continuation anchors exist). Read-only; no note edits.

Anchor inventory (9 judged): roster row `:129`; heading `:656`; prose anchors `:162`, `:148`, `:36`, `:102`, `:328`, `:160`, `:450`.

## Anchor verdicts

note:658 | scripts/project-devin-subagents.mjs:162 | "Projects the `devin-native-v1` seat profiles" | moved | scripts/project-devin-subagents.mjs:100 (`const profileId = "devin-native-v1"`), body at `:107` (`function loadProfile()`) | Projects the `devin-native-v1` seat profiles (`scripts/project-devin-subagents.mjs:100`, `loadProfile` at `:107`) — re-anchored at 31c465f1.
note:658 | :148 | `root` (repo root) | moved | scripts/project-devin-subagents.mjs:86 | It is rooted at the repo (`root`, `scripts/project-devin-subagents.mjs:86`) — re-anchored at 31c465f1.
note:658 | :36 | `safeRoleKey` role-key validation | moved | scripts/project-devin-subagents.mjs:31 (regex), `:33` (`assertSafeRoleKey`) | validates each role key against `safeRoleKey` (`scripts/project-devin-subagents.mjs:31`, enforced by `assertSafeRoleKey` at `:33`) — re-anchored at 31c465f1.
note:658 | :102 | "Repo inputs are read through `readBoundedRepoFile` under the `MAX_REPO_FILE_BYTES` 1 MiB bound" | changed | bound constant `scripts/project-devin-subagents.mjs:84`; reader is now shared `readBoundedFile` imported `:29`, called `:114`, `:251`, `:306` | Repo inputs ride shared `readBoundedFile` (`scripts/project-devin-subagents.mjs:29`) under the local `MAX_REPO_FILE_BYTES` 1 MiB bound (`:84`; read sites `:114`/`:251`/`:306`) — re-anchored at 31c465f1.
note:658 | :328 | "a missing canonical card fails as `card_missing`" | gone | scripts/project-devin-subagents.mjs:247 (missing-card throw); `card_missing` exists at neither revision | a missing canonical card throws `canonical agent card missing for devin seat: agents/<role>.md` (`scripts/project-devin-subagents.mjs:247`) and surfaces as `ok:false` plus `error` — re-anchored at 31c465f1.
note:658 | :160 | "`--check` is the read-only mode" | moved | scripts/project-devin-subagents.mjs:98 (`const checkOnly`), acceptance arm `:92-97` | `--check` is the read-only mode (`checkOnly`, `scripts/project-devin-subagents.mjs:98`; accepted at `:93`) — re-anchored at 31c465f1.
note:658 | scripts/project-devin-subagents.mjs:450 | "`ok` ... true only when missing, drifted and extra all empty" | moved | scripts/project-devin-subagents.mjs:336 (identical expression) | `ok` (`scripts/project-devin-subagents.mjs:336`) is true only when missing, drifted and extra are all empty in check mode — re-anchored at 31c465f1.
note:129 | roster row `| scripts/project-devin-subagents.mjs | 444 | tool |` | 444-line tool member | changed | member is 379 L at 31c465f1; row itself stays at note:129 | `| scripts/project-devin-subagents.mjs | 379 | tool |` (444 L at 964f443e; re-anchored at 31c465f1).

## ok anchor

note:656 | heading `## scripts/project-devin-subagents.mjs` | member identity + projector role | ok | unchanged heading; projection still renders `ufo-<role>.md` into `.devin/agents` and `packages/devin/.devin/agents` (`:102-105`), from `agents/*.md` plus `config/ufo.json` `nativeProfiles.devin-native-v1` (`:99-101`, `:122`).

## Behavior removed/changed by the diff (even where lines survive)

1. `readBoundedRepoFile` deleted (base `:91-119`: `O_NOFOLLOW|O_NONBLOCK` open, `isFile` refusal, 1 MiB fstat bound, size+1 slack read, re-fstat size-change guard) -> shared `readBoundedFile(path, maximum, label, fail)` at `scripts/ufo-mission-result.mjs:832`. Call sites: `:114` (config; Buffer passed straight to `JSON.parse`), `:251` (card; explicit `.toString("utf8")`), `:306` (drift compare). Any text naming `readBoundedRepoFile` now dangles.
2. `writeAtomicFile` deleted (base `:121-149`: rename-over, `O_NOFOLLOW` re-open) -> `writeFileAtomic` (`ufo-mission-result.mjs:968`) at `:298`, `:310`. Preserved ordering: `assertSafeDest` still runs before every `mkdirSync`/write (`:274-276`, `:292`, `:297`).
3. Header comment rewritten (`:80-83`) to record that reads and atomic publish ride the shared leaf helpers; the 7-name `node:fs` import block is replaced by the single import at `:29`.
4. Unchanged by the diff: `assertSafeDest` body (`:46` vs base `:53`), target list (`:102-105`), report shape and `ok` expression, `--check` write gating (`:288`, `:308`, `:328`), exit 1 on `!report.ok` (`:379`).

## Note defects not caused by this diff (flagged anyway)

- "refusal arm always carries a stable snake_case `errorCode`" is false at both revisions: the catch builds only `error: error.message` (`:362-379`; base `:427-444`), and `errorCode` occurs nowhere in the file. Observed within the member; no wrapper adds it (single `console.log` surface at `:378`).
- `ok` is `!checkOnly || (missing.length === 0 && drifted.length === 0 && extras.length === 0)` (`:336`), so "true only when ... all empty" holds only under `--check`; in sync mode it is unconditionally true.
- Every prose anchor except `:102` was already offset at `964f443e`: `:148` = `}` closing `writeAtomicFile`, `:160` = `process.exit(64);`, `:36` = a `node:url` import, `:328` = `}` closing `expectedFiles`, `:450` exceeds the 444-line base file. The prose was censused against a different vintage than the roster row, so `:102` was the only base-accurate anchor and `:450` could never have resolved.

## Commands run (output quoted above)

- `git -C /fast/scratch/kumitate-r35/src diff --stat 964f443e 31c465f1 -- scripts/project-devin-subagents.mjs` -> `9 insertions(+), 74 deletions(-)`; `git show <rev>:... | wc -l` -> 444 / 379.
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/project-devin-subagents.mjs` (full hunk list).
- `git show <rev>:scripts/project-devin-subagents.mjs | grep -nE '<symbols>'` at both revisions (symbol map); `sed -n` windows `30-40`, `88-130`, `140-205`, `306-332`, `395-444` (base) and `26-32`, `60-120`, `144-164`, `240-260`, `320-379` (new), each with `nl -ba`.
- `git log --oneline -S'card_missing' 31c465f1 -- scripts/project-devin-subagents.mjs` -> empty.
- `git show 31c465f1:scripts/ufo-mission-result.mjs | grep -nE 'export function (readBoundedFile|writeFileAtomic)'` -> `:832`, `:968`.
- `grep -n "project-devin-subagents" corpus/knowledge/remaining-scripts-census.md` -> `:129`, `:376` (test-suite member, out of scope), `:656`, `:658`.

Tool installs: none required (git/sed only). No [INFERENCE] items: every claim above is a direct read at the pinned revisions.
