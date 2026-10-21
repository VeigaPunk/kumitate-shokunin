FIDELITY scripts/ufo-swarm-collect.mjs anchors=20 ok=11 moved=5 changed=4 gone=0

# C2 anchor fidelity — `scripts/ufo-swarm-collect.mjs` (964f443e → 31c465f1)

Source: read-only clone `/fast/scratch/kumitate-r35/src` (detached 31c465f1). Diff:
`71 insertions(+), 93 deletions(-)`; file 842 L → 820 L. Notes audited: the four
assigned files only (grep shows `ufo-swarm-collect.mjs:N` anchors exist in
`swarm-wave-lifecycle.md` alone; the other three cite the member by name/header).

Anchor inventory counted: 11 `file:N`/`file:N-M` citations, 1 member-section
heading, 6 name/header citations, 2 file-size claims = 20. Read-only; no note edited.

## Non-ok anchors

note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording (<=30 words, 964f443e label kept)
---|---|---|---|---|---
swarm-wave-lifecycle.md:12 | `scripts/ufo-swarm-collect.mjs` (wc row `842`) | file length 842 | changed | file is 820 L | `  820 scripts/ufo-swarm-collect.mjs (re-anchored at 31c465f1; 842 at origin HEAD 964f443e).`
swarm-wave-lifecycle.md:92 | prose `(842 L)` | owning-surface size | changed | file is 820 L | `(820 L at 31c465f1; 842 L at origin HEAD 964f443e).`
swarm-wave-lifecycle.md:95 | `:661` | sole CLI verb `collect` | moved | `:639` (`if (command !== "collect")`) | `` `collect` (`scripts/ufo-swarm-collect.mjs:639`; 661 at origin HEAD `964f443e`); re-anchored at 31c465f1. ``
swarm-wave-lifecycle.md:97 | `:54`–`:58` | five schema consts incl. local `REGISTRY_SCHEMA` | changed | `:56`–`:59` (4 local consts); `SWARM_REGISTRY_SCHEMA` imported at `:54` from `scripts/ufo-swarm-registry.mjs:27` | `**Input schemas** (`scripts/ufo-swarm-collect.mjs:56`–`:59`; `SWARM_REGISTRY_SCHEMA` imported at `:54`) — re-anchored at 31c465f1, four local constants.`
swarm-wave-lifecycle.md:103 | `:71` | `MAX_REGISTRY_BYTES` 1 MiB parity; `MAX_INPUT_BYTES` 4 MiB | changed | registry bound now `scripts/ufo-swarm-registry.mjs:30` (imported `:54`); `MAX_INPUT_BYTES` gone → `MAX_WAVE_BYTES` `:67`–`:69`, `MAX_RESULTS_BYTES` `:71` | `Byte caps re-anchored at 31c465f1: `MAX_WAVE_BYTES` :67–69, `MAX_RESULTS_BYTES` :71; `MAX_REGISTRY_BYTES` imported from `scripts/ufo-swarm-registry.mjs:30` (origin HEAD 964f443e: :71).`
swarm-wave-lifecycle.md:113 | `:567` | `collectEntries` | moved | `:540` | `**Join.** `collectEntries` (`scripts/ufo-swarm-collect.mjs:540`; 567 at origin HEAD `964f443e`); re-anchored at 31c465f1.`
swarm-wave-lifecycle.md:116 | `:582` | missing row → `unmapped_member` | moved | `:555` | `(`scripts/ufo-swarm-collect.mjs:555`; 582 at origin HEAD `964f443e`); re-anchored at 31c465f1.`
swarm-wave-lifecycle.md:117 | `:576` | extra row → `unexpected_member` | moved | `:549` | `(`scripts/ufo-swarm-collect.mjs:549`; 576 at origin HEAD `964f443e`); re-anchored at 31c465f1.`
swarm-wave-lifecycle.md:122 | `:659` | `main` spine | moved | `:637` | `**main spine** (`scripts/ufo-swarm-collect.mjs:637`; 659 at origin HEAD `964f443e`): same steps; registry default gate now `resolveBeneathRoot` + `ALLOW_EXTERNAL_TOOLS`; re-anchored at 31c465f1.`

## OK anchors (11)

- `swarm-wave-lifecycle.md:89` heading `## scripts/ufo-swarm-collect.mjs` — member still present, heading form valid.
- `swarm-wave-lifecycle.md:93` `:3`–`:12` — header byte-identical; "never a judge input and never a handoff path" still at `:10`–`:11`; `ufo-mission-result-v1` bridge still at `:3`–`:4`.
- `swarm-wave-lifecycle.md:105` `:93` `STATUS_OUTCOME` — same line, same 6-entry map (`completed/failed/timeout/cancelled/canceled/aborted`).
- `swarm-wave-lifecycle.md:108` `:111` `FAILURE_CLASS_REASON` — same line, same 7 keys.
- `swarm-wave-lifecycle.md:126` `:121` `SwarmCollectError` — same line; exit contract intact (`:768`/`:774` `return 0`; `:803`–`:810` usage→64 else 1).
- `dispatch-shapes.md:21-22` header quote (no line anchor) — holds at `:10`–`:11`.
- `dispatch-shapes.md:25` header source — file still opens with that header.
- `failure-telemetry.md:28` import-parity claim — holds (see drift #7): `FAILURE_CLASS_REASON` still 7 keys matching `ENTRY_FAILURE_CLASSES`; `failureClass` on a `completed` row still rejected (`scripts/ufo-swarm-collect.mjs:391`–`:392`). [INFERENCE] "import-parity" is doctrinal, not a literal import: the map is defined locally at `:111`.
- `failure-telemetry.md:112` source list — member still exists.
- `remaining-scripts-census.md:62` S8 listing row — member still in the `ls` universe.
- `remaining-scripts-census.md:812` suite subject — `scripts/ufo-swarm-collect.test.mjs:16` still `const SCRIPT = join(import.meta.dirname, "ufo-swarm-collect.mjs")`.

## Described behavior removed/changed even where lines survive

1. Blanket `MAX_INPUT_BYTES` 4 MiB deleted. Bounds are now producer-derived and `readJsonInput` requires `maxBytes`: `MAX_WAVE_BYTES` = 100×65536 + 2×65536 + 1048576 = 7,733,248 B (~7.375 MiB) at `:67`–`:69`; `MAX_RESULTS_BYTES` = 100 MiB at `:71`; `MAX_REGISTRY_BYTES` 1 MiB imported. The note's "MAX_INPUT_BYTES 4 MiB" sentence is now false (row above).
2. Registry document normalization moved to `scripts/ufo-swarm-registry.mjs` (`normalizeRegistryDocument`, `SWARM_REGISTRY_SCHEMA` at `:27`); the local `REGISTRY_SCHEMA` const is gone. Fail-closed map/array validation and duplicate/nameless-entry rejection preserved, now shared with the wave side (collect `:412`–`:443`).
3. Local `MEMBER_NAME` regex deleted → `MEMBER_NAME_PATTERN` imported (collect `:54`, definition `scripts/ufo-swarm-registry.mjs:33`); grammar identical `^[A-Z][A-Za-z0-9]{1,31}$`.
4. `trustedReportDir` no longer calls `beneath` inline: `resolveBeneathRoot(ROOT, value)` (`scripts/ufo-swarm-registry.mjs:64`–`:73`) wraps `beneath` with the same catch→`inside:false` fallback. Semantics preserved.
5. Default `registry.path` gate re-implemented on shared `relativePathProblem` (registry `:45`–`:58`) + `resolveBeneathRoot`; `!inside && !ALLOW_EXTERNAL_TOOLS` → `EXEC_PATH_OUTSIDE_ROOT` at collect `:320`–`:330`. `beneath` remains in the chain, so the note's wording stays true transitively.
6. State derivation gained a `runProven` arm: `row.outcome === "completed" || row.status === "timeout"` now forces `started` when `state` is absent (collect `:577`–`:578`). No note paragraph pins this, but it removes a prior contradiction with the not_started rejection at `:372`–`:373`.
7. Import surface expanded (collect `:52`–`:54`): `MAX_SWARM_LANES` (mission-result `:2462`), `MAX_PROMPT_BYTES`/`MAX_CONTEXT_BYTES` (wave `:147`–`:148`), registry symbols. Header, `STATUS_OUTCOME`, `FAILURE_CLASS_REASON`, `SwarmCollectError`, join order registry > results > resume (`soleEvidence` at `:527`, used `:560`/`:569`), and the `--emit-xml`/`writeFilePairAtomic` spine (`:762`–`:764`) are unchanged.

## Adjacent drift (outside this member, for L1)

- `scripts/ufo-swarm-collect.test.mjs`: 1554 → 1621 L, so `remaining-scripts-census.md:158` (`1554`) is stale. That section's `:816`–`:817` claim ("reuses `spinWait` and `ENTRY_FAILURE_CLASSES` … `:17`") also drifted: 31c test `:14` imports only `spinWait`; no `ENTRY_FAILURE_CLASSES` import remains (grep empty). Test-member anchors not otherwise re-verified.
- `scripts/ufo-swarm-wave.mjs`: 1907 → 1844 L, so `swarm-wave-lifecycle.md:11` (`1907`) and `:13` (`2749 total`) are stale; true total 820 + 1844 = 2664.

## Remaining unknowns

- Whether `MAX_WAVE_BYTES` actually admits a producer-legal 100-lane wave at 31c is not exercised here (suite out of scope) — [INFERENCE] bound arithmetic only.
- `failure-telemetry.md` `mission-result.mjs:540`/`:513` anchors belong to another member and were not re-verified.

## Commands run

- `git -C /fast/scratch/kumitate-r35/src diff --stat 964f443e 31c465f1 -- scripts/ufo-swarm-collect.mjs` → `71 insertions(+), 93 deletions(-)`.
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-swarm-collect.mjs` (full hunk set).
- `git show <rev>:scripts/ufo-swarm-collect.mjs | grep -nE '...'` and `sed -n 'N,Mp'` at both revs for every cited anchor.
- `wc -l` via `git show … | wc -l` for collect (842/820), wave (1907/1844), collect.test (1554/1621), wave.test (1942/1911).
- `git show 31c465f1:scripts/ufo-swarm-registry.mjs | sed -n '20,100p'`; `grep -n` for `MAX_SWARM_LANES`/`MAX_PROMPT_BYTES`/`MAX_CONTEXT_BYTES`.
- `grep -rn 'ufo-swarm-collect\.mjs:[0-9]' corpus/knowledge` → 11 hits, all `swarm-wave-lifecycle.md`.

No tool installs or upgrades were needed; no pacman transaction was attempted.
