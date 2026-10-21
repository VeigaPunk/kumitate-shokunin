FIDELITY scripts/ufo-watchdog-repend.test.mjs anchors=14 ok=14 moved=0 changed=0 gone=0

Scope: single upstream member `scripts/ufo-watchdog-repend.test.mjs` (+66/-8 between 964f443e and 31c465f1), notes read-only. Member section in remaining-scripts-census.md is lines 843–846 (last section in file). Anchors counted: the member-section heading (note:843), the full-path citation in the prose (note:845), and all 12 `:N` line anchors on note:845. No other file mentions this member except the population-table row (note:161), which carries name+byte-count, not a line anchor (flagged below, out of anchor scope).

## Anchor verification table (all 14 ok)

| note:line | cited anchor | symbol/claim | at 964f443e | at 31c465f1 | verdict |
|---|---|---|---|---|---|
| 843 | `## scripts/ufo-watchdog-repend.test.mjs` heading | section start | member exists | member exists, unchanged name | ok |
| 845 | full-path `node scripts/ufo-watchdog-repend.test.mjs` | run command | line 8 comment "Run: node scripts/ufo-watchdog-repend.test.mjs" | same at line 8 | ok |
| 845 | `:14` `MAX_ATTEMPTS` imported | import list | 14 | 16 (shifted +2 by new `node:os`/`node:url` imports at 12,14) | ok |
| 845 | `:15` `STABLE_REFUSAL_REASONS` imported | import list | 15 | 17 | ok |
| 845 | `:16` `decideRow` imported | import list | 16 | 18 | ok |
| 845 | `:17` `extractRependReport` imported | import list | 17 | 19 | ok |
| 845 | `:18` `manifestClassFor` imported | import list | 18 | 20 (new sibling import `manifestClassReader` at 21) | ok |
| 845 | `:19` `normalizeState` imported | import list | 19 | 21 | ok |
| 845 | `:20` `rowSignature` imported | import list | 20 | 22 | ok |
| 845 | `:21` `runRependCycle` imported | import list | 21 | 23 | ok |
| 845 | `:25` local `test` runner | `function test(name, fn) {` | 25 | 31 ("drives it with a local `test` runner" still true) | ok |
| 845 | `:47` `fakeSpawn` records calls, replays canned report | `function fakeSpawn(report)` + `calls.push` + canned `JSON.stringify(report)` stdout | 47–54 | 53–60 (identical body) | ok |
| 845 | `:56` `STABLE` is the `mission_stale_registered` refusal | `const STABLE = { repended: false, reason: "mission_stale_registered" };` | 56 | 62 (identical) | ok |
| 845 | `:311` end-to-end `main` against scratch surfaces (`UFO_STATE_DIR` + scratch queue) | `test("main_end_to_end_scratch_suppresses_then_manifest_change_resets", ...)` starts; scratch queue path; suppression then manifest-change reset | 311 | 333 (test body: `mkdtempSync`, `queuePath`, `UFO_STATE_DIR` env, suppressed second tick, reset on manifest change — all present) | ok |

Behavioral check against the +66/-8 diff (artifact-verified): every hunk is additive or intra-test adjustment — new imports (11–14, 21 `manifestClassReader`), `ROOT`/`HELPER` consts (27–28), `notes: {}` deepEqual additions, quiet-floor/cap-once logging assertions, renamed cap test title (`cycle_cap_stops_invoking_after_three_successes` → `cycle_cap_logs_once_per_key, not every tick`, still asserting the attempt cap + "cap reached" line), and three new tests (`manifest_reader_parses_once_per_cycle` 374, FIFO-tick 390, module-root-anchored defaults 409). No note-described behavior (suppression, manifest-change reset, transient retry, success counting, attempt cap, legacy bare-number migration) was removed or contradicted; `manifestClassFor` remains exported and pinned. No anchor went stale in meaning — only the 12 line numbers moved.

## Non-ok rows

(none)

## Out-of-scope observation for the C2 re-census owner

- note:161 population-table row still lists `364` bytes for this member; at 31c465f1 the file is 422 lines (`git show 31c465f1:... | wc -l`). Not an anchor; the script-layer re-census (C2) rewrites this count. Also the leading `*` census marker on 161 already flags the member as changed.

## Commands run

- `grep -n 'ufo-watchdog-repend\.test\.mjs' corpus/knowledge/remaining-scripts-census.md` → lines 161, 843, 845 (and prose full-path) only.
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-watchdog-repend.test.mjs` → 7 hunks, all additive/adjusting as summarized above (captured raw in-session).
- `git -C /fast/scratch/kumitate-r35/src show 964f443e:scripts/ufo-watchdog-repend.test.mjs` (lines 1–70, 300–325) and `show 31c465f1:...` (lines 1–80, 310–340) — every cited region read at both revisions.
- Line counts: 364 (base) vs 422 (pinned), consistent with +66/-8 = +58 net.

## Residual risk / gaps

- All anchors were re-read at the pinned revision; none inferred. The only judgment call: the renamed cap-test title does not alter any note-claimed behavior (note never names the test title), so counted ok, not `changed`.
- The note's prose sentence "success counting and the attempt cap" remains accurate at 31c465f1 despite the cap test now also pinning one-time logging — no wording change strictly required; optional improvement: append "and once-per-key cap logging" when the re-census rewrites the section.
