RESULT ScoutTimingBudgets verdict=TWO_ITEMS_BATTERY_NONE

Read-only. Lane HEAD `fe3d45bf929246915c8c0de5f7f8682b5015b22c` (ancestor of base `f00cf278a5ab57e87b18418fc972be9f893f65da`). `git diff --stat f00cf278 HEAD -- scripts/round-gate.mjs scripts/surface-probe.mjs scripts/gate-mutants.mjs SKILL.md` is empty. `scripts/round-gate.mjs` blob `b3031e31f66d426e69a2f6a47106013dce10172a` is identical at `cac43009`, `f00cf278`, and HEAD. No tool installed. No selftest or checklist was run in this seat.

# Budget code

One budget for every checklist item, not a per-item table. `scripts/surface-probe.mjs:249` `CHECKLIST_TIMEOUT_MS = 120_000`. `runChecklistsMode` (`:1047-1051`) `spawnSync('bash', ['-c', item.command], { cwd: opts.self, timeout: CHECKLIST_TIMEOUT_MS })`. Header `:128` states the same 120 s. A hit leaves `status === null`, which fails the exit set (`:1054-1056`) so the item is FAIL. Grammar is `CHECKLIST_RE` at `:277`; skipped lines (`--checklists`, `- [x]`) spawn nothing.

# Who runs the two selftests

Only two checklist commands. No other `scripts/*.mjs` spawns `round-gate.mjs` or `surface-probe.mjs` except those two files and `proxy-check.mjs`, whose `FIXTURE_SCRIPTS` (`proxy-check.mjs:1378-1380`) are pin bytes, comment "never executed". `cite-check.mjs` and `wave-census.mjs` contain neither name.

| item | command | how | checklist budget |
|---|---|---|---|
| SKILL.md:683 Surface-probe hermetic suite | `node scripts/surface-probe.mjs --selftest` | direct | 120 s |
| SKILL.md:684 Round-gate hermetic suite | `node scripts/round-gate.mjs --selftest` | direct | 120 s |

Nested, inside those two commands (not separate checklist items):

- SP1766 `scripts/surface-probe.mjs:1766-1767`: one child `node <self> --selftest`, `timeout: 180_000`, env `KUMITATE_SURFACE_PROBE_NESTED=1`. The child skips that spawn (`:1762-1764`) and still runs the other child sites.
- RG1409 `scripts/round-gate.mjs:1409-1412`: one child `node <SELF> --selftest`, `timeout: 120_000`, env `KUMITATE_ROUND_GATE_NESTED=1`. The child skips that spawn (`:1398-1399`) and still runs every `runGate`.

Launch count in one full `--selftest` tree (outer + that one nested child), matching plan C1 "base execs per selftest":

- Round-gate: 58 `runGate(` call sites in `selfTest` (`round-gate.mjs:894` through `:1513`; definition at `:742` is not a call). Nested repeats all 58. 58×2 = 116 RG742 launches. Each `runGate` has its own `timeout: 120_000` (`:743`). 50 sites are before the nested spawn, 8 after (`:1444-1513`).
- Surface-probe: 7 `spawnSelf` execs per process (3 direct at `:1595,:1600,:1605`, `bareSrc` ×3 at `:1630,:1636,:1643` via `:1624`, plus `:1649`) ×2 = 14 SP1592. `spawnSelf` timeout `120_000` (`:1593`). Plus one `readSightingSurface` (`:1573` → SP491) and one `readDispatcherStatus` (`:1537` → SP519) per process ×2 = 4. Those two readers use `SPAWN_TIMEOUT_MS = 20_000` (`:248,:494,:522`). 14+4 = 18.

Routing add used below is the L1 figure given in the assignment, not remeasured here: ~0.12 s per launch at load1≈65. Serial `spawnSync`, so the add is on the outer wall: 18×0.12 = 2.16 s (surface-probe), 116×0.12 = 13.92 s (round-gate). The nested process sees only its own half: 9×0.12 = 1.08 s (surface-probe, under its 180 s spawn timeout) and 58×0.12 = 6.96 s (round-gate, under its 120 s spawn timeout).

# Recorded walls

No `wall=` checklist receipt exists at `f00cf278` or anywhere under `.ufo/waves/round-48/`. R46-3 (`wall=` / `load1=`) is absent from round-40..46 checklist files. Round-46 close receipts pass both items and record no per-item wall, e.g. `.ufo/waves/round-46/close/checklists-4.txt:5-6` at `980a16af`, load `55.60 43.99 30.01`, outer `timeout 900`.

The only recorded per-item walls are `.ufo/waves/round-47/build/ExecChecklistTail.md:62-70`: `node scripts/surface-probe.mjs --checklists` on the patched seat clone (cac43009 + the surface-probe receipt patch; that patch is the `surface-probe.mjs` delta that `f00cf278` already contains; `round-gate.mjs` blob unchanged).

- SKILL.md:683 `wall=0.806` `load1=20.50` PASS
- SKILL.md:684 `wall=4.627` `load1=20.50` PASS

Not at load1≈65. Not an f00cf278 checkout. Same bytes as base for both scripts.

# Projected margin (checklist 120 s is the binding cap)

| item | base wall recorded | routing add | projected wall | margin to 120 s |
|---|---|---|---|---|
| SKILL.md:683 surface-probe `--selftest` | 0.806 s | 2.16 s | 2.966 s | 117.0 s |
| SKILL.md:684 round-gate `--selftest` | 4.627 s | 13.92 s | 18.547 s | 101.5 s |

Inner caps do not bind first. Nested surface-probe's 180 s timeout is longer than the checklist 120 s that wraps it. Nested round-gate's 120 s timeout starts only after the outer's first 50 `runGate`s; even if the entire recorded 4.627 s sat inside the nested child, 4.627+6.96 = 11.6 s against that 120 s. Each individual `runGate` / `spawnSelf` still has a 120 s cap, against a ~0.12 s add.

Confidence: high on the caller set and the 120 s / 60 s constants (source, identical at base). Medium on the projected seconds: the 0.12 s add is the L1 figure at load1≈65, the only walls are at load1=20.50, and this seat did not re-run either selftest. A several-times slower base at load 65 is still tens of seconds, not the 120 s cap, on these two items alone.

# Gate-mutants battery (item 697) — none of these selftests

`scripts/gate-mutants.mjs:36` `TARGETS = ['cite-check', 'wave-census']`. `runSelftestFile` (`:413-427`) always execs `<copy>/<target>.mjs --selftest` with `timeoutMs` default `TIMEOUT_MS = 60_000` (`:30`), capped by `Math.min(TIMEOUT_MS, timeoutMs)` (`:386`), plus a 16-process / 512 MB group cap (`:431`). Killed mutants run twice (`:689,:694`). Controls re-run after. Neither target file names `round-gate` or `surface-probe`. The hermetic suite (`SKILL.md:698`, `gate-mutants.mjs --selftest`) runs `fixture.mjs --selftest` via `runControl(staged.scripts, 'fixture')` (`:1131`), not the two gates.

So the +116 / +18 launches do not apply to item 697 or to either battery target. Item 697's own checklist budget is still the same 120 s, and that budget is already a separate, pre-existing hazard: `.ufo/waves/round-47/build/ExecLoad697.md` walls for `node scripts/gate-mutants.mjs` range 4024–187125 ms, with exit 2 from `unstable` / `timeout=60000ms` / `control-fail`, and the checklist embedding at ExecChecklistTail.md:94 is `wall=92.094` `load1=20.72` exit 2. That is the battery's own 60 s runs under the 120 s checklist line, not C1 routing.

# Not these commands

SKILL.md:682 `surface-probe.mjs --known …` and SKILL.md:685/686 `round-gate.mjs` / `--tracked` are not `--selftest`. They do hit the live sites (SP491/SP519 once each on :682; no RG742, which is only the selftest `runGate`). Out of the asked set. Their checklist budget is the same 120 s; recorded walls in the same ExecChecklistTail run are 0.116 s, 0.023 s, 0.020 s.
