RESULT ReRunC1Terms rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=reproduced before={"A":9,"C":17,"operability":8} after={"A":10,"C":19,"operability":9} strict_exit=0

Item attacked: C1's term counter — the claimed move A 9→10, C 17→19, operability 8→9 between the round-open commit dfabe92 and the measured commit c9a084bf, the `--strict` outcomes at both, and the claim that A counts exactly ten script files repo-wide.

Method: own scratch clone made with GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE unset, detached checkouts, `git status --porcelain` empty at both revisions (the counter measures the working copy, so a clean checkout measures the committed bytes). Node v24.21.0; no tools installed this seat; no mutants or selftests of mutated files were run by me, so the prlimit mutant-safety wrapper did not apply; my runs left zero processes behind.

Evidence:
$ env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin <scratch>/lane && env -u ... git -C <scratch>/lane checkout -q --detach c9a084bf03fb043d3cce5da102fffbc023552a45
$ git -C <scratch>/lane rev-parse HEAD && git -C <scratch>/lane status --porcelain | wc -l
c9a084bf03fb043d3cce5da102fffbc023552a45
0
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json | jq -c '.terms | {A, C, operability}'   (at c9a084bf)
{"A":10,"C":19,"operability":9}
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --strict; echo exit=$?   (at c9a084bf)
PROXY: MATCH (A=10 C=19 operability=9; C1=19/19 C2=94/94 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
exit=0
$ git checkout -q --detach dfabe92bcec021f5beec457fb50cec484e047e35 && git rev-parse HEAD
dfabe92bcec021f5beec457fb50cec484e047e35
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json | jq -c '.terms | {A, C, operability}'   (at dfabe92)
{"A":9,"C":17,"operability":8}
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --strict; echo exit=$?   (at dfabe92)
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=92 computed=93 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY  warn  PIN_UNPINNED  scripts/anchor-truth.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza
PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza
PROXY  warn  PIN_UNPINNED  scripts/wave-census.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=92 computed=93 delta=+1; AXES_DRIFT term=coverage declared=10 derived=9; PIN_UNPINNED term=scripts/anchor-truth.mjs; PIN_UNPINNED term=scripts/sources-check.mjs; PIN_UNPINNED term=scripts/wave-census.mjs; src-rev=31c465f15669)
exit=1
$ find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | sort | wc -l   (at c9a084bf)
10
(the ten: scripts/{anchor-truth,cite-check,claims-check,gate-mutants,kimi-census,proxy-check,round-gate,sources-check,surface-probe,wave-census}.mjs — none outside scripts/)
$ find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l   (at dfabe92)
9
$ node scripts/proxy-check.mjs --src ... --json | node -e '<JSON.parse stdin; print terms.A/C/operability>'   (at c9a084bf, filter-independent cross-check)
{"A":10,"C":19,"operability":9}

Comparison against the receipts, all exact:
- After-state terms and `--strict` MATCH line are byte-identical to `.ufo/waves/round-42/final/c1-measured-c9a084bf.txt` (same MATCH line, exit=0).
- Before-state terms and `--strict` DRIFT output are identical to `.ufo/waves/round-42/open/receipts.txt` (same two errors C2_TOTAL_DRIFT declared=92 computed=93 and AXES_DRIFT coverage 10 vs 9, same three PIN_UNPINNED warnings, exit=1; the strict exit at dfabe92 is 1, at c9a084bf it is 0, hence strict_exit=0 in the header refers to the measured commit).
- Repo-wide runnable count matches term A at both revisions (9 → 10), and the one added file is scripts/gate-mutants.mjs, exactly as plan C1 and lesson claim ("A +1 (scripts/gate-mutants.mjs)").
- Internal consistency: 10 scripts, 6 parent-frozen pins + 4 lane gate pins = complete pin coverage at c9a084bf, consistent with strict warnings 3 → 0 (R41-2 target) and `pins=6 match`.
- Plan arithmetic cross-check: A+C = 26 before, 29 after, matching the plan's f_O 26/29 → 29/32 ≈ 0.906 ⇒ 9; the strict MATCH independently confirms the declared operability equals the proxy's derived integer and the `## Axes` row equals it (no AXES_DRIFT at c9a084bf).

No defect found in the C1 term-counter claims. Every command and output above is as run in this seat's scratch clone.

Residual risk and verification gaps:
- jq on this host resolves to jaq 3.1.1 via ~/.local/bin/jq (a /usr/bin/jq also exists; `type jq` reported an odd "shell builtin" resolution). To rule the filter out I re-parsed the same `--json` output with node itself and got the identical triple, so the reported values are not an artifact of the jq/jaq substitution.
- The counter measures the working copy; a dirty lane at measurement time would not be caught by re-running in a clean clone. The receipts assert the lane working copy equaled the commit for scripts/ and SKILL.md; I could not verify the lane's live dirty state from inside the round (out of my write scope) — ReRunC1Gate/ReMeasureC1 seats with lane access cover that.
- I did not re-run the mutant battery or gate-mutants itself (ReRunC1Gate's scope); `pins=6 match` covers only that the gate-mutants pin equals the working-copy bytes.
- Shared-host note: this seat observed many sibling-seat node processes alive during the run (surface-probe --checklists under `timeout -s KILL 900`, cite-check selftests, gate-mutants runs under other falsify seats' scratch dirs). None were started by me and I did not interfere; proxy-check is a read-only recomputer, so no timing-sensitive result of mine is affected.
- No sources were opened by this seat; the C1 sourcing claim (S039/S040) was not in scope.
