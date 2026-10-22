RESULT CritInjectionBypass rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=fixable bypasses=1 normal_mode_changed=no failing_suite_passes=no skip_mutant_survives=yes recursion_mutants=2/2-unbounded tools-installed=none
Scope: the hook KUMITATE_CITE_SELFTEST_INJECT_FAIL (scripts/cite-check.mjs:2452-2477). Clone /fast/scratch/hyaku/kumitate-r41/seats/CritInjectionBypass/lane, detached at 4e58bb0e, node v24.21.0. Harnesses: seats/CritInjectionBypass/mut41.mjs and rec41.sh. The variable is not set anywhere in the parent environment (`env -u`). L=lane, PIN=/fast/scratch/hyaku/kumitate-pin/src.
1. Normal mode: no effect (holds). The name appears only at lines 2456-2471, inside selfTest(), and main() returns at 2648 before normal mode starts.
  `node $L/scripts/cite-check.mjs --src $PIN --self $L --fleet $L [--json]`, run unset and then with =1:
  text: exit=1 stdout_sha=dfcb032e84ef13ef in both runs; json: exit=1 stdout_sha=b3860de09a3cc15d in both runs; stderr 0 bytes in all four.
  `--src /nonexistent-41`: exit=2, same stderr sha (c23da22d) in both runs. `--no-such-flag`: exit=64, same stderr sha (e02bb0aa) in both runs.
  Without --fleet the hashes differed, but two unset runs also differed: fleetIndexFiles 118 against 129, because the default fleet root is the parent of --self (my seat directory, which my own output files were growing). That difference is not caused by the hook.
2. Can the variable make a failing suite pass? No.
  `--selftest`: unset gives exit=0 75/75 SKIP=0 PASS; =1 gives exit=1 73/74 FAIL=1 SKIP=2 VERDICT FAIL; =0 and =true are inert (exit=0 75/75).
  `--selftest --integrations` with =1: exit=1, 73/74 hermetic and 4/9 integration (the 4/9 is a live-tree failure that exists without the hook), VERDICT FAIL.
  `--integrations` alone: exit=1 and 4/9 both with and without =1. The injected case lands in the hermetic group, which is not reported, so it is dropped. The integration verdict does not depend on the hook.
3. Bypass (the counted one): a mutant that skips both self-observation cases unconditionally survives the counter's rule and the exit code.
  Recipe: replace `if (process.env[INJECT41] === '1') {` together with the following injected-case push with `if (true) {`. Run with `node mut41.mjs $L 4e58bb0e`:
  CONTROL counter=survived exit=0 cases=75/75 skips=0 VERDICT: PASS
  MUTANT skip-unconditional counter=survived exit-oracle=survived exit=0 cases=73/73 skips=2 VERDICT: PASS
  Cause: SKIP rows are excluded from `ran` (line 2600), and nothing in the suite or in probe/cite-verdict-mutants.mjs.txt rejects a SKIP inside the hermetic group. The control has zero hermetic SKIPs, so a zero-SKIP rule is safe.
  Single-site variants are killed (exit=1): cond-true-only and cond-negate (73/74, the injected case fails in the parent); injected-ok-true and injected-push-drop (73/75, both self-observation cases fail).
  Weakening one assertion survives, as expected: removing `r.status === 1 &&` from either case gives 75/75 exit 0. This is second-order: that assertion is the only thing that kills suite-exit-text (text case) or suite-exit-json (json case).
4. Recursion and hang: none at 4e58bb0e. The child gets =1 and skips both spawning cases, and every other child runs in normal mode. strace 7.2 (`strace -f -s 400 -e trace=execve`) counted 27 cite-check execs under `--selftest` (the top run plus 26 children), with exactly one `--selftest` child and one `--selftest --json` child.
  The "cannot recurse" guarantee (lesson line 19) rests on one literal at two sites, and it is untested: breaking it is not a clean kill, it produces a runaway process tree.
  `bash rec41.sh child-env-drop-text` (remove `{ [INJECT41]: '1' }` from the text child): nested --selftest processes 7, 15, 22, 29 at 2, 4, 6 and 8 s; summed RSS 560, 1049, 1540, 2030 MB.
  `bash rec41.sh cond-literal-2` (`=== '1'` becomes `=== '2'`): 7, 14, 22, 28 processes; 556 to 2029 MB.
  After SIGTERM to the top process (what spawnSync's timeout sends, to the direct child only), the orphans kept multiplying: 29 became 39 at +3 s and 49 at +6 s (32 and 37 for the second mutant).
  The first `pkill -KILL` left 5 processes; a STOP-then-KILL loop reached remaining=0, and a recheck after 3 s showed 0.
  [INFERENCE] Under the counter's 600 s timeout, such a mutant would be classed killed-crash, and the orphan chain would keep running on the host after the counter exits.
5. Cost: `--integrations` alone also runs the whole hermetic block. strace shows 26 child execs there too, including both injected `--selftest` children, whose results are thrown away. That run is still read-only (line 1846), so this is a cost, not a correctness defect.
Impacted axes: operability (the counter misses a self-observation skip; one mutated literal can start an unbounded process storm) and no-harm (orphans outlive the timeout).
Smallest safe corrections, not applied, no patch:
  (a) In the counter, also count `^SKIP ` lines inside the hermetic group and set killed when skips > 0. This kills skip-unconditional (skips=2), and the control stays PASS (skips=0).
  (b) Make the guard fail-safe: skip self-observation when the variable is present with any value (`INJECT41 in process.env`), which defeats cond-literal-2. Spawn the injected children with `detached: true` and kill the whole process group (`process.kill(-pid)`) on timeout. The counter should likewise run each mutant in its own process group and kill the group afterwards.
Already disclosed elsewhere, not counted here: three aggregation mutants exit 0 (lesson lines 24-30; CritC1Statement and CritC1Vacuous) and the suite-any-fail operator variants (CritC1AltOperators).
