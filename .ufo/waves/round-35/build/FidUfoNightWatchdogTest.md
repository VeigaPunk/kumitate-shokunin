FIDELITY scripts/ufo-night-watchdog.test.mjs anchors=2 ok=1 moved=1 changed=0 gone=0

## Scope and snapshot

Notes: `corpus/knowledge/remaining-scripts-census.md`, snapshot = current file (863 lines). Member mentions: table row note:163 and probe-list entry note:414 are population mentions, not anchors. Anchors per the item definition (line anchors + member-section headings):
1. note:782 — member-section heading `## \`scripts/ufo-night-watchdog.test.mjs\``
2. note:784 — `hasTmux` at `scripts/ufo-night-watchdog.test.mjs:90` (the only line anchor; no `:N` continuation anchors exist in this one-sentence section).

The notes file mutated mid-verification (table row count 118→195 at note:163, all downstream lines shifted +17): a concurrent re-census by the integration owner. All verdicts below are pinned to the post-mutation snapshot (positions above re-confirmed by a second grep+read pass).

## Non-ok anchor rows

note:784 | `scripts/ufo-night-watchdog.test.mjs:90` | `hasTmux` — primary surface symbol, the module-level tmux availability gate for the socket-form server test | moved | scripts/ufo-night-watchdog.test.mjs:168 | Primary surface symbol `hasTmux` (census label `964f443e`, re-anchored at 31c465f1 to `scripts/ufo-night-watchdog.test.mjs:168`).

## Ok anchors

- note:782 heading — member still exists at 31c465f1 (195-line suite); heading text unchanged. ok.

## Evidence (all against the pinned private clone /fast/scratch/kumitate-r35/src)

- Upstream diff `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-night-watchdog.test.mjs`: +100/-23. Five tests added (31c465f1 lines: `singleton_extras` :72, `rotate_if_large` :80, `heartbeat_stale` :99, `recover_wall` :116, `lock_watchdog` :151), `libRun` helper :35, client-spawn comment/exec-optimization fix :171-174, and the final test replaced.
- `hasTmux` move: 964f443e:90 `const hasTmux = spawnSync("tmux", ["-V"]).status === 0;` → 31c465f1:168 byte-identical, same skip-gate role (consumed at 31c465f1:170 `skip: !hasTmux && "tmux not installed"`). The 17 lines of new tests inserted above it pushed the definition down 78 lines.
- Behavior-removed sweep: notes contain no claim on the two removed arms — the `lock_owner_pid` compact/pretty-JSON test (964f443e:72-88) and "the watchdog sources the lib and no longer carries the argv-only reaper filter" (964f443e:113-118, replaced by bare `bash -n` "the watchdog script parses" at 31c465f1:193). Grep for `argv-only reaper|sources the lib|ufo-night-watchdog-lib` over the notes → no matches. So changed=0, gone=0.
- Commands run: `diff --stat`, full `diff 964f443e 31c465f1 -- <file>`, `show <rev>:<file> | cat -n | sed -n` at both revisions (:80-118 base; :165-172, :88-92 target), `grep -n hasTmux` at both revisions, `wc -l` (118 vs 195).
- [INFERENCE] `hasTmux` remains a defensible "primary surface symbol" at 31c465f1: it is still the only module-level gate; the new tests exercise lib functions inside test bodies rather than adding module-level symbols.

## Adjacent observations (outside anchor scope, for the integration owner)

- Section body note:784 still reads "118 L ... re-censused 2026-10-14 against origin HEAD `964f443e`" while the table row note:163 already carries 195. The L-count/restamp belongs to the S-census owner; the proposed wording above only re-anchors `:90`→`:168` and keeps the `964f443e` label.
- The old note text near `scripts/ufo-watchdog-repend.mjs` (note:858) cites `ufo-night-watchdog.sh` (outside the script-layer universe) — different member, untouched by this diff, no action.
