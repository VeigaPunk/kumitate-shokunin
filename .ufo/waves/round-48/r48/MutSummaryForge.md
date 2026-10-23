**CRITICAL (read first): the strongest suite-summary forgery — a real case failing, its `FAIL` line suppressed, the summary coerced to `62/62 pass`, exit 0, final line `VERDICT: PASS` — survives the frozen counter: `SITE RG742 … label=ROUTED_HELD`, `capped/n=116/116,116/116,116/116`, `cases=62/62,62/62,62/62`, `uncapped_direct=0,0,0` in all 3 runs at commit `9e11273`. The assigned `n > m` variant is killed (`reason=selftest_cases_below_base`); the internally consistent variant is not distinguishable by rule F48's summary clause, whose oracle is the gate's own report.** Coverage finding about the frozen predicate — not a licence to change the contract this round.

# MutSummaryForge — suite-summary forgery (kumitate round 48, attempt 2, v2 wave r48)

**CRITICAL FINDING (surviving mutant): the strongest suite-summary forgery — one real case failing, its `FAIL` line suppressed, the summary coerced to `62/62 pass`, exit 0, final line `VERDICT: PASS` — survives the frozen counter: `SITE RG742 … label=ROUTED_HELD`, `capped/n=116/116,116/116,116/116`, `cases=62/62,62/62,62/62`, `uncapped_direct=0,0,0`, in all 3 runs, at commit `9e11273`. The assigned `n > m` variant is killed (`reason=selftest_cases_below_base`); the internally consistent variant is not distinguishable by rule F48's summary clause, whose oracle is the gate's own report.** This is a coverage finding about the frozen predicate; it is not a licence to change the contract this round.

Seat `kumitate-r48-MutSummaryForge` (mutation-tester) · judged axis: operability · base `f00cf278`, frozen tip `fe3d45bf` · counter sha256 `f24a3af5…` (matches the freeze) · no tool installed (pacman paused; nothing needed via uv/npx/official binary).

## Claim under attack

C1 predicate clause under test: *"the line before its final `VERDICT: PASS` is that gate's own suite summary with n = m and m no lower than the base run's, no FAIL line …"* (counter `runGate`/`judge`: `SUMMARY['round-gate']`, `failLines`, `status`, `verdictPass`, `pass !== total || total < b.total`). The question: can a gate that actually fails a case still satisfy that clause and be labelled `ROUTED_HELD`?

## Sandbox and baseline (all writes under the seat sandbox)

`/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48a-MutSummaryForge/lane` — `git clone --no-hardlinks` of the lane, detached at `fe3d45bf`.

Route (one site, `RG742`): `scripts/round-gate.mjs` `runGate` (line 742, the only non-selftest self-spawn; the nested `--selftest` at 1409 is the counter's named allowance) now calls `scripts/cap-spawn.mjs` `capSpawnSync(process.execPath, [SELF, ...args], { env, bind: [tmp], timeout: 120_000, maxBuffer: 16 MiB })`. `env` is the existing `{...cleanEnv(), ...extraEnv}` with every `KUMITATE_CAPROUTE_CANARY_*` key excluded (cap-run's bwrap carries `--clearenv`); `bind: [tmp]` because the sandbox's `/tmp` is a fresh tmpfs. This is a probe route, not a C1 candidate build (three surface sites deliberately untouched).

Per-rev sha256 of `scripts/round-gate.mjs` (`git show <rev>:scripts/round-gate.mjs | sha256sum`):

| rev | role | sha256 |
|---|---|---|
| `fe3d45bf` / `f00cf278` | pristine (identical bytes; `git diff --stat` on `scripts/` empty) | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| `8b7ecc1` | M0 route-only baseline | `614081cc7f1092b380c632a29cab38fe13f602a1daf95ede159f987f51d3d043` |
| `f21e8ef` | M1 assigned forgery (n > m) | `5e62e630c1ffa7eed1599e37c5efd0cac58d865c8fe82d790f18cdaffa3f54b1` |
| `9e11273` | M2 strongest forgery (n = m) | `cde90339bebc10c72f4a70825b41338859cf1c9297094cadcb1498c83a2c6f37` |

Baseline validity: the counter's own base run at `f00cf278` read `RUN round-gate base0 exit=0 cases=61/61 … verdict_pass=true fail_lines=0`, `RUN surface-probe base0 exit=0 cases=46/46 …`.

## M0 — route-only baseline (the pristine bytes of the mutated behavior)

Detector: `node .ufo/waves/round-48/probe/caproute48-probe.mjs <lane> 8b7ecc13314b9d566131835dea5f47daa2e49c05 --set r48` → **exit 1**

```
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=48 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2120 resumed=80 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2120 resumed=60 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2120 resumed=48 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
CAPROUTE48 rev=8b7ecc13314b9d566131835dea5f47daa2e49c05 base=f00cf278 set=r48 held=1/4 runs=3 rule=F48
```

The routed site is `ROUTED_HELD` in all 3 runs; `SP491/SP519/SP1592` are `ROUTED_MISS` (never routed by this seat: `uncapped_direct_children=9, canary_in_env, no_*_ancestor`). **Not a control reading**: these builds carry the intended route, so `ROUTED_HELD` is the expected baseline, not a pre-data control hit; `held=1/4` is a probe artefact and is never a candidate score. F48 is unamended.

## M1 — assigned mutant: summary `n > m`, FAIL line suppressed, exit 0, `VERDICT: PASS`

Two edits in `scripts/round-gate.mjs`, one behavior point (the report block) plus its stimulus:
1. stimulus: one added case that returns `{ ok: false, detail: 'injected failure' }` at the end of the checks (index `62/62`) — a genuine failure for the reporter to hide;
2. report block: `if (!r.ok) return;` drops the `FAIL` line, the summary is printed as `${results.length + 1}/${results.length} pass` (= `63/62`), the last line is hard-coded `VERDICT: PASS`, and `selfTest()` returns `0`.

Expected detector: `pass !== total` → `selftest_cases_below_base` (the FAIL-line check cannot fire because the mutant suppresses the FAIL line, by design).

`node … caproute48-probe.mjs <lane> f21e8eff6b38694bd17f59131514cae4fde503c9 --set r48` → **exit 1**

```
RUN round-gate rev0 exit=0 cases=63/62 execs=2120 resumed=65 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=63/62 execs=2120 resumed=66 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=63/62 execs=2120 resumed=65 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=116/116,116/116,116/116 base_n=116 cases=63/62,63/62,63/62 base_cases=61/61 uncapped_direct=0,0,0 reason=selftest_cases_below_base
CAPROUTE48 rev=f21e8eff6b38694bd17f59131514cae4fde503c9 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
```

**Verdict M1: killed** (3/3 runs, `selftest_cases_below_base`). The mutant did keep exit 0, `VERDICT: PASS`, zero FAIL lines, the base exec count (116) and a full cap chain (`capped/n=116/116`) — the kill rests solely on the `n != m` clause.

## M2 — strongest variant: summary coerced to `n = m`, FAIL line still suppressed, exit 0, `VERDICT: PASS`

One-line change from M1: the summary is printed as `${results.length}/${results.length} pass` (= `62/62`, and the base total is 61, so `m >= base m`). Everything else identical.

`node … caproute48-probe.mjs <lane> 9e112738bc7dd4f7a94436ce6f67f557a65be499 --set r48` → **exit 1** (only because the three surface sites are unrouted in this probe build; RG742 is the unit)

```
RUN round-gate rev0 exit=0 cases=62/62 execs=2120 resumed=28 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=62/62 execs=2120 resumed=30 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=62/62 execs=2120 resumed=41 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=62/62,62/62,62/62 base_cases=61/61 uncapped_direct=0,0,0
CAPROUTE48 rev=9e112738bc7dd4f7a94436ce6f67f557a65be499 base=f00cf278 set=r48 held=1/4 runs=3 rule=F48
```

Direct characterization of the same mutant bytes (`node scripts/round-gate.mjs --selftest`): `exit=0`, `pass_lines=61 fail_lines=0 case_lines=61`, `stimulus_mentions=0`, `stderr_bytes=0`, tail:

```
PASS  [61/62]  every declared finding kind fires in at least one fixture — 14 kinds observed
ROUND_GATE_SELFTEST: 62/62 pass
VERDICT: PASS
```

**Verdict M2: survived.** The gate advertises 62 cases but prints 61 case lines; the failing case (`62/62`) is nowhere in the output. Every clause F48 checks is satisfied: exit 0, `VERDICT: PASS`, summary `n = m = 62 >= 61`, `fail_lines=0`, site/child exec count equal to base (116), cap chain intact, no canary. Mechanism: the summary clause's oracle is the gate itself; a consistently forged report is indistinguishable from a truthful one, and the FAIL-line clause is vacuous when the line is suppressed.

Independent oracle that would have killed M2 (reported, **not applied**; the counter is frozen): reconcile the case list with the summary — require `count(^(PASS|FAIL|SKIP)  \[)= m` and `count(^PASS)= n`. Here 61 ≠ 62. Candidate next-round strengthening only.

## Restoration evidence

- Working tree restored to the frozen tip: `head=fe3d45bf929246915c8c0de5f7f8682b5015b22c`, `git status --porcelain` empty.
- `sha256sum scripts/round-gate.mjs` = `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` (byte-identical to `fe3d45bf`/`f00cf278`, the pristine bytes).
- Mutant commits retained in the disposable clone for re-measurement: `8b7ecc1` (M0), `f21e8ef` (M1), `9e11273` (M2).
- No lane-repo, fleet-repo or sibling write; no git/jj write outside the sandbox clone; `/tmp` scratch (`/tmp/k48a-*.txt`) only.

## Findings

1. **Critical (report first line): M2 survives F48.** A gate that suppresses a real FAIL line and prints a self-consistent passing summary with exit 0 and `VERDICT: PASS` is `ROUTED_HELD`. This is a property of the frozen predicate (self-report oracle), observed at 3/3 runs, not an inference.
2. M1 is killed exactly as the assignment expected, but only by the `n != m` half: the `FAIL`-line half is empty against a forgery that suppresses the line (`fail_lines=0` in every forged run).
3. C1 integrity: no candidate score was produced or implied by this seat. `held=1/4` readings belong to probe builds and the M1/M2 mutants; none may be read as a C1 candidate or a control (control mutants are the inherited 17 pristine-build mutants, all `held=0/4`, F48 unchanged).
