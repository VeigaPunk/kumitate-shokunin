# ReviewRouteSpec — C1 / F48 route-patch acceptance

**Use:** L1 checklist for the four C1 route patches. This records acceptance criteria, not a claim that any candidate has passed. The frozen reference is `fe3d45bf929246915c8c0de5f7f8682b5015b22c`; the F48 probe is `.ufo/waves/round-48/probe/caproute48-probe.mjs`, SHA-256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`.

## Frozen predicate to sign against

The F48 predicate (`plan.md` § C1; probe header) is: a site is `ROUTED_HELD` at revision *r* when, in each of three `--selftest` runs of its owning gate from that revision's own `git archive`, under `strace -f` with a planted canary variable, the trace parses completely; the gate exits 0; the line before its final `VERDICT: PASS` is its own suite summary with `n = m` and `m` no lower than the base run; there is no `FAIL` line or successful `execveat`; there is no uncapped direct child of the gate outside the named allowances; the site's child exec count equals the base count and is at least one; and every such exec has, in its own ancestry and in order, that revision's `scripts/cap-run.mjs` (node) → `/usr/bin/systemd-run --scope` with its own `MemorySwapMax=0`, `MemoryMax<=1024M`, `TasksMax<=256` options → `/usr/bin/bwrap` carrying `--unshare-pid`, `--clearenv`, and `--die-with-parent`, with no canary variable in the child's environment.

**A diff that merely imports/calls `capSpawnSync` is not sufficient.** Sign off the diff and the observed F48 result; the probe's per-exec ancestry and environment judgment is the runtime proof.

## Common diff checks

For each of the four target sites:

- [ ] The existing child launch at the named site is actually routed through `scripts/cap-spawn.mjs`'s `capSpawnSync`; no parallel raw launch or fallback path remains for the same site. The observed target exec is the original child, not just the newly added `node cap-run.mjs` process.
- [ ] The child command identity and arguments below are preserved. Preserve each site's call multiplicity, branching, cwd, encoding, timeout, maxBuffer, environment values required by that selftest, and existing result/error handling. Do not silently retry, skip, coerce a failed status, or mask `capSpawnSync` errors.
- [ ] The environment passed at the routed boundary excludes the counter's dynamically planted `KUMITATE_CAPROUTE_CANARY_<hex>` key. Do not pass an unfiltered `process.env` (including through an existing environment-spread helper); retain only the environment needed for the existing behavior. The gate itself may receive the planted canary; the predicate forbids it in the routed site's child environment.
- [ ] Any host-created fixture paths consumed by a sandboxed child remain visible. `cap-run.mjs` creates a fresh `/tmp` and `/run` and binds its cwd; use its supported `--bind` option where fixtures outside cwd require it. In particular, RG742's fixtures and SP1592's `--self`/fake-HOME paths are under their owning selftest's temp root. A helper call that loses those fixtures and makes the gate fail is not acceptable.
- [ ] No new uncapped direct child of the owning gate is introduced. The only out-of-scope raw direct children permitted by F48 are the named allowances below (plus the probe's explicit fixture-tool allowance for `git`/`mkfifo`).

## Per-site diff acceptance

| Site | Frozen location and original child | Base execs per owning selftest | Diff must show |
|---|---|---:|---|
| **RG742** | `scripts/round-gate.mjs:742`, `runGate`; `node round-gate.mjs <args>` (not `--selftest`) | **116** | [ ] Replace this `spawnSync(process.execPath, [SELF, ...args], …)` launch with `capSpawnSync(process.execPath, [SELF, ...args], …)`. Preserve the 120,000 ms timeout, UTF-8 output, 16 MiB maxBuffer, and the existing clean/extra environment behavior while excluding the planted canary. Keep fixture paths under the selftest temp root available inside the child sandbox. The per-run target count must remain exactly 116. |
| **SP491** | `scripts/surface-probe.mjs:491`, `readSightingSurface`; `bash <src>/scripts/ufo-sighting surface --json` | **2** | [ ] Route that exact `bash` command through `capSpawnSync`; retain `cwd: src`, `NODE_COMPILE_CACHE: cacheRoot`, UTF-8 output, `SPAWN_TIMEOUT_MS`, and `MAX_BUFFER`. Do not leak the canary through the current environment spread. The per-run target count must remain exactly 2. |
| **SP519** | `scripts/surface-probe.mjs:519`, `readDispatcherStatus`; `node <src>/scripts/fleet-dispatcher.mjs status` | **2** | [ ] Route that exact `process.execPath` command through `capSpawnSync`; retain `cwd: src`, `UFO_STATE_DIR`, `UFO_PENDING_WORK_PATH`, `UFO_PROJECT_ROOT`, UTF-8 output, `SPAWN_TIMEOUT_MS`, and `MAX_BUFFER`. Preserve the throwaway-state and cleanup behavior, but exclude the canary from the child environment. The per-run target count must remain exactly 2. |
| **SP1592** | `scripts/surface-probe.mjs:1592`, `spawnSelf`; `node surface-probe.mjs <args>` (not `--selftest`) | **14** | [ ] Route each existing invocation through `capSpawnSync(process.execPath, [selfPath, ...args], …)`. Preserve its 120,000 ms timeout, UTF-8 output, existing per-call environment overrides (notably `HOME` and `UFO_SRC`), and the existing default maxBuffer behavior. Ensure fake home and `--self` fixture paths remain visible in the sandbox, and do not inherit the planted canary. The per-run target count must remain exactly 14. |

The base counts are the frozen plan's `base execs per selftest` values. They are equality checks, not minimum-only targets: the F48 counter reports a miss if a candidate run's site's count differs from the base, even if all observed execs are capped.

## Named direct-child allowances — keep raw

These are explicitly outside the four-site claim and are allowed as raw direct children by the frozen `r48` set (`caproute48-probe.mjs:61-75`). Keep the original `spawnSync` launches and their behavior; do not route them through `capSpawnSync`, capture them with a broad replacement, or change their arguments so they cease to be the named allowances.

- [ ] **RG1409** — `scripts/round-gate.mjs:1409-1412`: the nested `node <SELF> --selftest ...` launched by the outer round-gate selftest. It must remain raw. The plan excludes it because a routed nested suite would try to launch `systemd-run` inside bwrap's fresh `/run`; its child sites are the separately claimed routed sites.
- [ ] **SP1766** — `scripts/surface-probe.mjs:1766-1767`: the nested `node <selfPath> --selftest ...` launch. It must remain raw for the same nested-suite boundary.
- [ ] **SP1049** — `scripts/surface-probe.mjs:1049-1051`: `bash -c <item.command>` checklist runner. It must remain raw; the command is checklist data and this is a separately named allowance, not one of the four claimed route sites.

## Runtime sign-off (required in addition to diff review)

- [ ] Run the frozen command `node .ufo/waves/round-48/probe/caproute48-probe.mjs <lane> <candidate-rev> --set r48` against the candidate revision. Require `CAPROUTE48 … set=r48 held=4/4 runs=3 rule=F48`, exit **0**. Inspect all four `SITE` lines as `ROUTED_HELD`; do not substitute a source-level inference for the trace result.
- [ ] For every run, confirm complete trace parsing; gate exit 0; the correct owning-gate summary immediately before the final `VERDICT: PASS`; `n=m` and `m >=` the base summary; no `FAIL` lines; no successful `execveat`; no uncapped direct child outside the allowances; base-equal site counts (RG742 116, SP491 2, SP519 2, SP1592 14); and the ordered per-exec cap-run → systemd scope → bwrap chain with no canary in the target child environment.
- [ ] Apply the C1 kill rule at one unchanged commit: the L1 score run **and every committed wave re-run** of the same command (at least two re-runs) must each report 4/4 with exit 0. Record exit 2 as unevaluable and never as a score; exit 1 is a measured miss. Do not amend the predicate, site list, allowances, counter, or target after the first candidate score.

## Diff must not touch

- [ ] The frozen F48 counter, its SHA, predicate, base, four site matchers/count rule, canary/trace judging, allowances, or output/exit semantics.
- [ ] The non-target launches at RG1409, SP1766, or SP1049, or any other unrelated spawn site, selftest assertions, suite summaries, or verdict logic. No extra claimed site and no adjustment to call counts to make a comparison pass.
- [ ] `scripts/cap-run.mjs` or `scripts/cap-spawn.mjs` contracts/implementation, the F48 plan, or the frozen base. C1 is the four-site caller cutover, not a runner redesign or predicate amendment.

## L1 record

Candidate commit: ____________________  
Diff scope checked: ____________________  
F48 score receipt(s): ____________________  
Same-commit committed re-run receipts (at least two): ____________________  
Decision: ____________________  Date: ____________________

## Source anchors

- `.ufo/waves/round-48/plan.md:35-71, 103` — four C1 sites, named allowances, predicate, target, and kill rule.
- `.ufo/waves/round-48/probe/caproute48-probe.mjs:6-19, 53-75, 200-227, 263-310, 347-378` — frozen predicate, set/count/allowance definitions, archive runs, ancestry/environment checks, and final label/exit.
- `scripts/cap-spawn.mjs:2-18, 26-57`; `scripts/cap-run.mjs:14-36, 123-145, 177-190` — wrapper result/environment contract, fresh tmpfs and bind behavior, and the runner's launch chain.
- `scripts/round-gate.mjs:742-743, 1409-1412`; `scripts/surface-probe.mjs:491-497, 519-529, 1049-1051, 1592-1594, 1766-1767` — target launches and raw allowance boundaries.
