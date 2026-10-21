ATTACK scripts/ufo-stale-watchdog.test.mjs (S8 member section, remaining-scripts-census.md:757-759) verdict=partial defects=2

Scope: every in-prose anchor of the re-anchored section, the population row at
`corpus/knowledge/remaining-scripts-census.md:171`, and revision/history handling.
All reads at pin 31c465f1 via `/fast/scratch/kumitate-r35/src`. No lane writes, no
tool installs. **0 false claims**: every claim in the section re-derives true.

## Anchor verification (command: `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-stale-watchdog.test.mjs | sed -n 'Np'`)

| cited | observed at 31c465f1 | claim verdict |
|---|---|---|
| `:16-22` | `16: import {` … `17: attemptRepend, 18: isSafeRunId, 19: MAX_REPEND_ATTEMPTS, 20: newestMtime, 21: rependTask, 22: } from "./ufo-stale-watchdog.mjs";` | holds — leaf imports the repend seam |
| `:28` | `test("attemptRepend success clears the deferral", () => {` | holds — first of 9 cases |
| `:62` | `test("a throw retries and never escapes the seam", () => {` | holds |
| `:127-133` | :127 `test("stale leaf is syntactically valid and has no daemon loop", …`; :129 `assert.equal(spawnSync(process.execPath, ["--check", stalePath]).status, 0);`; :133 `});` | holds — 1 `spawnSync(...)` call in file, at :129 (import at :10) |
| `:26` | `const RUN_ID = \`gq${"f".repeat(16)}\`;` | holds — fixture identity |

Counts: `wc -l` = **133** = population row `| scripts/ufo-stale-watchdog.test.mjs | 133 | suite |` (line 171);
`grep -cE '^test\('` = **9** = the note's "9 `node:test` cases"; baseline `wc -l` at 964f443e = **756** = "was 756 @ 964f443e".

Baseline (964f443e) pins re-read: `:6`/`:110` emitFor, `:122` `writeSync(2, telemetryLine(event))`,
`:60`/`:68` per-case `spawnSync`, `:36` `STALE_MS = 1_200_000`, `:274`/`:291`/`:304` rung4a/b/c
(`grep -nE 'STALE_MS|emitFor|rung4|spawnSync|tick\('`). **holds** — fd-2 fallback, tick ladder and
rung-4 configPath behavior were all pinned there.

"that supervision ladder moved to `scripts/ufo-l0-watch.mjs`": at pin `export function missionDuty`
l0-watch:1477, `function tick()` :1856, `// ── Mission stall ladder (folded from ufo-stale-watchdog, F5 larger) ──`
:1433; baseline l0-watch (1762 L) has no `missionDuty`. **holds**.

Removed-symbol traces: `emitFor`, `STALE_MS`, `SAFE_RUN_ID`, `fd2_fallback_carries_duty_events_when_log_path_dead`,
`closed_fd2_never_throws_out_of_tick`, `status_malformed`, `state_save_error`, `rung4`, `configPath`
all return 0 hits in the member at pin (`git show 31c465f1:$F | grep -c`). Tree-wide at pin:
`emitFor` 0, `SAFE_RUN_ID` 0, `state_save_error` 0. Every removed clause that carried behavior got a trace.

## Defect 1 — missing blank line after the section body (formatting, low)

`corpus/knowledge/remaining-scripts-census.md:759-760`: line 760 is
`## \`scripts/ufo-state-census.mjs\`` immediately after the body line, with no separating blank line
(master had one; `git show master:… | awk 'prev!="" && /^## /'` = 0 such boundaries; the lane file has
13, incl. this one). Command:
`awk 'prev!="" && /^## / {print NR": "substr($0,1,70)} {prev=$0}' corpus/knowledge/remaining-scripts-census.md`
→ `760: ## \`scripts/ufo-state-census.mjs\``. No gate consumes the boundary (`claims-check.mjs:294`
splits on `/^## /m`; CommonMark ATX headings interrupt paragraphs), so this is cosmetic, not a claim break.
Minimal fix: insert one blank line between 759 and 760.

## Defect 2 — two removed clauses carry no round-35 trace (history, low)

`corpus/knowledge/remaining-scripts-census.md:759`: the master opener
`Colocated suite (nc5-swarm r16) …` became `Compatibility-leaf suite …` and the `(nc5-swarm r16)`
provenance tag is gone with no `(round 35: removed …)` parenthetical, while the file's other two
nc5 tags survive (`git show master:… | grep -no 'nc5-swarm r[0-9]*'` → 719 r10, 727 r26, 787 r16;
lane `grep -no` → 700 r10, 708 r26 only). The master's "over 29 `test(` cases" clause is also replaced
silently by "9 `node:test` cases" — 29 never matched baseline (27 `^test(`, 28 `test(` substrings), so
dropping it is correct but untraced. Minimal fix: append one parenthetical, e.g.
`(round 35: removed nc5-swarm r16 provenance tag and the 29-case count — baseline measures 27 \`test(\` cases)`.

## Gate cross-check (read-only)

`node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8` →
`ROW S8 form=section notes=1 sections=60 adv=0` / `SUMMARY: errors=0 warnings=0` /
`CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=60 adv=0)` / exit 0. The section's anchors and
`attemptRepend` symbol satisfy the frozen probe.

## Observations, not defects

- `(round 35: removed STALE_MS — absent at 31c465f1)` is true of the member; `STALE_MS` still exists
  elsewhere at the pin (6 files, e.g. `scripts/ufo-l0-monitor-hook.test.mjs:41`). The trace is
  section-scoped, but a tree-wide reading would overclaim; [INFERENCE] no gate reads it that way.
- `?? scripts/proxy-check.mjs.orig` is untracked in the lane tree (out of scope here, likely sibling-owned).
- [INFERENCE] no markdown lint/style gate exists in the lane (no markdownlint/prettier config found), so
  Defect 1 is not auto-detected; [INFERENCE] rendering itself is unaffected (not browser-checked).

Tooling: no installs or upgrades. No writes outside this report.
