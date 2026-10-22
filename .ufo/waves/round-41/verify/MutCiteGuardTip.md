RESULT MutCiteGuardTip rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=fixable killed=6/21 recursed=3

Scope: the cite-check self-observation guard as landed in 5320e0da — `scripts/cite-check.mjs:2458-2481` (child marker variable, the `1` injection value, the two self-observation cases) — at fae386aa. Detector = the committed C1 counter's own `runSuite` (`.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt:48-56`), copied byte-identical into a derived probe whose M array holds my 21 guard mutants; only `timeout: 600_000` was shortened to 60_000 (a timeout yields no `cases passed` line and is `killed-crash` either way). Each mutant ran in its own `setsid` group under a process-count watch (cap 30) and an RSS watch (cap 1.2 GB); every group was killed by group and by path, leftover rechecked 0 each time.

## Mutants (file:line, original -> replacement) and the committed detector's verdict

| id | site | original -> replacement | verdict |
|---|---|---|---|
| guard-outer-literal-2 | 2459 | `!== undefined` -> `=== '2'` | **crash / recursed** |
| child-text-env-dropped | 2469 | `child41(['--selftest'], { [INJECT41]: '1' })` -> `child41(['--selftest'])` | **crash / recursed** |
| child-json-env-dropped | 2475 | `child41(['--selftest','--json'], { [INJECT41]: '1' })` -> `child41(['--selftest','--json'])` | **crash / recursed** |
| guard-inner-literal-2 | 2460 | `=== '1'` -> `=== '2'` | killed (73/75, 2 FAIL) |
| inject-ok-true | 2461 | `ok: false` -> `ok: true` | killed (73/75, 2 FAIL) |
| inject-push-drop | 2461 | push of `injected failing case` deleted | killed (73/75, 2 FAIL) |
| child-text-value-2 | 2469 | `[INJECT41]: '1'` -> `[INJECT41]: '2'` | killed (74/75, 1 FAIL) |
| inject-case-name-changed | 2461 | `'injected failing case (child run only)'` -> `'injected case (child run only)'` | killed (74/75, 1 FAIL) |
| selfobs-text-exit-inverted | 2471 | `r.status === 1` -> `r.status === 0` | killed (74/75, 1 FAIL) |
| guard-outer-ne-1 | 2459 | `!== undefined` -> `!== '1'` | survived (73/73, 2 SKIP) |
| guard-outer-eq-undefined | 2459 | `!== undefined` -> `=== undefined` | survived (73/73, 2 SKIP) |
| guard-outer-always-true | 2459 | `!== undefined` -> `if (true)` | survived (73/73, 2 SKIP) |
| guard-outer-loose-ineq | 2459 | `!== undefined` -> `!= null` | survived (75/75) |
| selfobs-text-exit-assert-drop | 2471 | `r.status === 1 && ` deleted | survived (75/75) |
| selfobs-json-exit-assert-drop | 2478 | `r.status === 1 && ` deleted | survived (75/75) |
| selfobs-json-verdict-assert-drop | 2478 | `j?.verdict === 'FAIL' && ` deleted | survived (75/75) |
| selfobs-json-group-assert-drop | 2478 | `j?.suites?.[0]?.verdict === 'FAIL' && ` deleted | survived (75/75) |
| selfobs-skip-loop-dropped | 2463-2466 | SKIP `for` loop deleted | survived (75/75) |
| selfobs-skip-flag-false | 2465 | `skipped: true` -> `skipped: false` | survived (75/75) |
| selfobs-text-group-moved | 2468 | `check(` -> `checkI(` | survived (74/74) |
| marker-name-changed | 2458 | `'KUMITATE_CITE_SELFTEST_INJECT_FAIL'` -> `'..._FAIL_2'` | survived (75/75) |

Tally: killed 6, survived 12, recursed 3 (crash is not a kill). Control on pristine bytes: `75/75 cases passed (hermetic)`, `VERDICT: PASS`, exit 0; control on restored bytes: identical.

## Findings

**F1 (operability, HIGH). The 4e58bb0e recursing literal change is closed on the inner site only; one line over it still recurses without limit.** At 4e58bb0e the guard was one condition, `if (process.env[INJECT41] === '1')`, and the recursor was `'1'` -> `'2'` (CritInjectionBypass: "cond-literal-2 ... 7, 14, 22, 28 processes; 556 to 2029 MB"). 5320e0da split that into outer marker `!== undefined` (2459) plus inner injection `=== '1'` (2460). The inner literal change is now killed cleanly (guard-inner-literal-2, 73/75, exit 1, no recursion). The outer marker literal change reproduces the original failure exactly: guard-outer-literal-2 (`!== undefined` -> `=== '2'`, one site) sends the child down the else branch, the child re-runs the two self-observation cases, and the tree multiplies. Measured on that mutant: 2 -> 4 -> 7 -> 9 processes and 143 -> 626 MB in the first 2 s; after SIGTERM to the direct child (the signal `spawnSync`'s timeout sends) the orphans kept multiplying to 46 processes and 3.27 GB over the next 10 s. The same shape survives for child-text-env-dropped and child-json-env-dropped (45 processes, 3.21 GB, still growing 10 s after SIGTERM). So the code comment "a changed literal cannot recurse" (2456) and the lesson "a changed literal no longer recurses" (`corpus/lessons/round-41.md:180`) hold for the inner literal only; the outer marker is still one literal edit from the 4e58bb0e failure. The fix half of CritInjectionBypass's suggestion (b) — "spawn the injected children with `detached: true` and kill the whole process group" — was not applied.

**F2 (coverage, HIGH). Two skip-bypass mutants that were killed at 4e58bb0e now survive at fae386aa: a regression from 5320e0da.** Measured on each revision's own bytes with the same detector: at 4e58bb0e, `=== '1'` -> `!== '1'` and `=== '1'` -> `=== undefined` both read `73/74 cases passed`, `VERDICT: FAIL`, exit 1 (killed) — the single condition still pushed the injected failing case, so the parent's own suite failed. At fae386aa the split means the outer bypass reaches the child branch while the inner `=== '1'` no longer fires, so the injected failing case is never pushed: both mutants read `73/73 cases passed`, `VERDICT: PASS`, exit 0 — survived, two SKIP rows. This is a second bypass shape, distinct from the already-disclosed unconditional skip (guard-outer-always-true, 73/73, also survived). The lesson's open limit records only the unconditional skip.

**F3 (coverage, MEDIUM). The frozen C1 counter has zero anchors in the guard block, so none of these 21 mutants is inside its measured set.** Resolving each of the 16 committed anchors to a line in `scripts/cite-check.mjs`: 1581, 1583, 1589 (x2), 1590, 1595, 1626 (x2), 2608, 2611, 2623, 2640, 2649, 2664, 2665, 2672. None lies in 2455-2481; `grep -c` over the guard block for every anchor string gives 0. `survived=0/16` therefore says nothing about the guard, and the guard is where the round's self-observation claim lives.

**F4 (coverage, MEDIUM). The counter's rule cannot see a case that vanishes.** `selfobs-text-group-moved` moves the text self-observation case from the hermetic group (`check`) to the integration group (`checkI`), so under `--selftest` it never runs; the run reports `74/74`, and the counter's kill rule (`exit !== 0 || failLines > 0 || VERDICT: FAIL || p < n`) sees p == n and calls it survived. The counter compares a mutant against itself, never against the control's 75, so a lost case is invisible.

**F5 (coverage, LOW). The self-observation assertions are individually unpinned; two of the four weakenings are new.** Dropping `r.status === 1 &&` from the text case (2471) or the json case (2478) survives — already disclosed by CritInjectionBypass as second-order. Not previously disclosed: dropping `j?.verdict === 'FAIL' &&` (M21) and dropping `j?.suites?.[0]?.verdict === 'FAIL' &&` (M12) also survive (75/75). The child's reported count is unpinned too: `skipped: true` -> `skipped: false` (2465) moves the child from `73/74` to `75/76` with the parent's verdict unchanged, and deleting the SKIP loop (2463-2466) is fully equivalent for the parent — no assertion reads the SKIP rows.

**F6 (operability, LOW). The marker variable's name is unpinned.** Renaming the constant's value at 2458 to `KUMITATE_CITE_SELFTEST_INJECT_FAIL_2` survives (75/75): the parent and the child both read the renamed constant, so the handshake still works. Nothing pins the published name `KUMITATE_CITE_SELFTEST_INJECT_FAIL` that `SKILL.md:599` and the lesson name.

**F7 (environment, already disclosed by the L1, confirmed here).** With the variable inherited at any value other than `1`, the unmodified tip skips both self-observation cases, reads `73/73 VERDICT: PASS`, and the frozen counter reads `survived=4/16`; measured at fae386aa with `KUMITATE_CITE_SELFTEST_INJECT_FAIL=2` the counter prints `CITE_MUTANTS survived=4/16 nomatch=0 crash=0 control=PASS`, and at 4e58bb0e the same environment reads `survived=0/16`. `SKILL.md:599` and `SCORECARD.md:399` now carry the "run it unset" clause (committed in 57269a5, after my target revision), and the lesson records it at line 213. I confirm the numbers; a marker the caller cannot inherit is round-42 work.

## Restoration and harm

Pristine `scripts/cite-check.mjs` sha256 `896f0720b7fe7492806b0a5b7458a995de1d666d6759297675b7d964872c6d0e` before and after; the restored copy and the lane file both hash to it (`RESTORE identical=yes`); the restored control run is `75/75 cases passed (hermetic)`, `VERDICT: PASS`, exit 0. Every mutant ran in its own process group and was killed by group and by path; leftover recheck 0 after each of the 21 and `host_leftover_citecheck=0` at the end. No process of mine is running. Scratch: `/fast/scratch/hyaku/kumitate-r41a2/seats/MutCiteGuardTip/` (clone detached at fae386aa, `git status --porcelain` = 0). The lane working tree was not touched: the only lane-side write is this report.

## Tools

None installed or updated. Used node v24.21.0, git, python3, bash, pgrep/pkill/ps, sha256sum. `bc` is absent on this host (used only for a probe's cosmetic timestamp label; no measurement depends on it).

## Evidence (commands and outputs)

- E1 `git clone -q --no-hardlinks <lane> <scratch>/lane && git checkout -q --detach fae386aa9e0542710b7a893d84c8e92e86fc079b` -> `git rev-parse HEAD` = fae386aa9e0542710b7a893d84c8e92e86fc079b; `git status --porcelain | wc -l` = 0.
- E2 `sha256sum scripts/cite-check.mjs` = 896f0720b7fe7492806b0a5b7458a995de1d666d6759297675b7d964872c6d0e.
- E3 Detector identity: `diff <(sed -n '/const runSuite = /,/^  };/p' <committed probe>) <(sed -n '/const runSuite = /,/^  };/p' <derived probe>)` prints nothing -> `DETECTOR_IDENTICAL=yes`; derived probe `node --check` OK; 17+4 mutants, `timeout 600_000` -> `60_000` only.
- E4 `MUTANT guard-outer-literal-2 <no verdict line; probe killed by rss-cap(1275740KB) exit=137> | outer=rss-cap | leftover=0`.
- E5 `MUTANT child-text-env-dropped <no verdict line; probe killed by rss-cap(1269800KB) exit=137> | leftover=0`; `MUTANT child-json-env-dropped <... rss-cap(1200180KB) exit=137> | leftover=0`.
- E6 Killed mutants, the committed probe's own verdict lines: `MUTANT guard-inner-literal-2 killed exit=1 cases=73/75 fail_lines=2`; `MUTANT inject-ok-true killed exit=1 cases=73/75 fail_lines=2`; `MUTANT inject-push-drop killed exit=1 cases=73/75 fail_lines=2`; `MUTANT child-text-value-2 killed exit=1 cases=74/75 fail_lines=1`; `MUTANT inject-case-name-changed killed exit=1 cases=74/75 fail_lines=1`; `MUTANT selfobs-text-exit-inverted killed exit=1 cases=74/75 fail_lines=1`.
- E7 Survived mutants, the committed probe's own verdict lines: `MUTANT guard-outer-ne-1 survived exit=0 cases=73/73 fail_lines=0`; `MUTANT guard-outer-eq-undefined survived exit=0 cases=73/73 fail_lines=0`; `MUTANT guard-outer-always-true survived exit=0 cases=73/73 fail_lines=0`; `MUTANT selfobs-text-exit-assert-drop survived exit=0 cases=75/75`; `MUTANT selfobs-json-exit-assert-drop survived exit=0 cases=75/75`; `MUTANT selfobs-json-verdict-assert-drop survived exit=0 cases=75/75`; `MUTANT selfobs-json-group-assert-drop survived exit=0 cases=75/75`; `MUTANT marker-name-changed survived exit=0 cases=75/75`; `MUTANT selfobs-skip-loop-dropped survived exit=0 cases=75/75`; `MUTANT selfobs-skip-flag-false survived exit=0 cases=75/75`; `MUTANT guard-outer-loose-ineq survived exit=0 cases=75/75`; `MUTANT selfobs-text-group-moved survived exit=0 cases=74/74 fail_lines=0` (control `75/75 cases passed (hermetic)`).
- E8 Recursion growth, guard-outer-literal-2: `t=0.5s procs=2 rss_kb=142896`, `t=1.0s procs=4 rss_kb=287212`, `t=1.5s procs=7 rss_kb=431628`, `t=2.0s procs=9 rss_kb=625772` (cap hit); after SIGTERM to the direct child: `t=1s procs=12 rss=788992`, `t=4s procs=23 rss=1624008`, `t=10s procs=46 rss=3268480`; `leftover_after_cleanup=0`.
- E9 Recursion growth, child-text-env-dropped: `procs=3/5/7` and `rss=205036/357112/501040` in 1.5 s; after SIGTERM `t=10s procs=45 rss=3209888`; `leftover_after_cleanup=0`.
- E10 Cross-revision (same detector, each revision's own bytes): `OLD-control survived 75/75`, `OLD-outer-ne-1 killed exit=1 cases=73/74 fail=1 skip=2 VERDICT: FAIL`, `OLD-outer-eq-undefined killed exit=1 cases=73/74 fail=1 skip=2 VERDICT: FAIL`; `NEW-control survived 75/75`, `NEW-outer-ne-1 survived exit=0 cases=73/73 fail=0 skip=2 VERDICT: PASS`, `NEW-outer-eq-undefined survived exit=0 cases=73/73 fail=0 skip=2 VERDICT: PASS`.
- E11 Counter anchors: resolving each of the 16 committed anchors gives lines 1581, 1583, 1589, 1589, 1590, 1595, 1626, 1626, 2608, 2611, 2623, 2640, 2649, 2664, 2665, 2672; `anchors_inside_guard_block(2455-2481)=0`; `sed -n '2455,2481p' scripts/cite-check.mjs | grep -c "<all anchor strings>"` = 0.
- E12 Counter's kill rule, committed probe line 54: `const killed = r.status !== 0 || failLines > 0 || /^VERDICT: FAIL$/m.test(s) || p < n;` — no comparison against the control's case count.
- E13 `KUMITATE_CITE_SELFTEST_INJECT_FAIL=2 node <probe> --lane <clone> --rev fae386aa...` -> `CITE_MUTANTS survived=4/16 nomatch=0 crash=0 control=PASS`; same probe at `--rev 4e58bb0e...` -> `survived=0/16 nomatch=0 crash=0 control=PASS`; unset at fae386aa -> `survived=0/16 nomatch=0 crash=0 control=PASS`; `=1` -> `survived=0/16 ... control=FAIL`.
- E14 `KUMITATE_CITE_SELFTEST_INJECT_FAIL=2 node <pristine> --selftest` -> `73/73 cases passed (hermetic)`, `VERDICT: PASS`, two `SKIP  suite self-observation ...` rows; unset -> `75/75 cases passed (hermetic)`, `VERDICT: PASS`; `=1` -> `73/74 cases passed`, `VERDICT: FAIL`, exit 1.
- E15 Guard text at fae386aa: `2459  if (process.env[INJECT41] !== undefined) {`, `2460  if (process.env[INJECT41] === '1') {`; at 4e58bb0e the same site was `2457  if (process.env[INJECT41] === '1') {` (one condition, both roles).
- E16 Committed claims: `corpus/lessons/round-41.md:20` "the child skips the two self-observation cases, so it cannot recurse"; `:180` "failure, so a changed literal no longer recurses (`KUMITATE_CITE_SELFTEST_INJECT_FAIL=2` -> `73/73`, two SKIP). Still open: a mutant that skips both self-observation cases unconditionally"; code comment `2455-2457` "Any value of the variable marks a child ... so a changed literal cannot recurse; only the value `1` injects the failing case".
- E17 Restoration: `sha256sum` of pristine, restored copy and lane file all `896f0720b7fe7492806b0a5b7458a995de1d666d6759297675b7d964872c6d0e`; `RESTORE identical=yes`; restored control `75/75 cases passed (hermetic)` / `VERDICT: PASS` / exit 0.
- E18 Host cleanliness after all runs: `pgrep -fc 'cite-check.mjs --selftest'` = 0; `pgrep -fc 'MutCiteGuardTip'` = 0; per-mutant `leftover=0` on all 21.

## Residual and limits

- The 3 recursing mutants are crashes, not kills; I report them as recursed and did not treat them as detections.
- The counter's own `nomatch` path was never exercised: every one of my 21 anchors occurs exactly once in the revision's `scripts/cite-check.mjs` (the derived probe reports no `nomatch` for any of them).
- F1's orphan figures are from a probe I bounded at 30 processes / 1.2 GB; the unbounded growth I report is what was measured up to those caps, and the caps themselves are what stopped it.
- I did not re-measure the 16 committed C1 conditions at fae386aa beyond the two control runs in E13/E14.
- The lane advanced from fae386aa to 57269a5 while I worked (a sibling L1 commit); all my measurements are of fae386aa bytes, and F7's SKILL/SCORECARD clauses are as committed in 57269a5.
