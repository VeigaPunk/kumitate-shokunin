RESULT ReviewQualityQ25Q28 rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=fail runnable=3/4 lane_fails=3

Reviewed QUALITY Q25-Q28 at 84cb1d5d8e703aafd4f73d887ba4237692ff13f9 in scratch clone /fast/scratch/hyaku/kumitate-r43/seats/ReviewQualityQ25Q28/lane. Every criterion is lesson-backed: Q25-Q28 each cite corpus/lessons/round-42-verifier-spotcheck.md sections (C1 three-predicate, Terms counter, D1, D7). Commands run bounded (systemd-run --user --scope -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600). No tools installed. No leftover processes; gm-tmp empty.

Q25 (one kill predicate, frozen, stated identically) — FAILS (two arms still open).
$ N=43; P=$(grep -oE '^\*\*K[0-9]+' .ufo/waves/round-43/plan.md | head -1 | tr -d '*'); p=$(printf '%s' "$P" | tr 'A-Z' 'a-z') → P=K43 p=k43
$ sed -n '1,24p' scripts/gate-mutants.mjs | grep -c K43 → 2 (header names the predicate)
$ grep -cE "check\('k43-[a-z0-9-]+'" scripts/gate-mutants.mjs → 13 (predicate cases, id prefix)
$ grep -oE '\([a-d]\)' .ufo/waves/round-43/plan.md | sort -u | wc -l → 4
$ grep -cE "^\([a-d]\) case [a-z0-9-]+" .ufo/waves/round-43/plan.md → 0 (clause-to-case map ABSENT; Q25 Field (3)/Fails-when require one line per clause; still open since e5ffcbe)
Binding case (a) `timeout-and-process-group-cleanup` still carries no k43- prefix (naming arm open, as measured at e5ffcbe).
Code matches K43 exactly (killedOnce = evaluable && numeric non-zero && exact VERDICT: FAIL; confirmKill = same sorted FAIL names; no round-42 third rule `failLines>0`).
$ KUMITATE_GATE_MUTANTS_TMP=... gm-tmp systemd-run ... node scripts/gate-mutants.mjs --selftest → GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0, VERDICT: PASS, exit=0 (criterion text's stale "28/28" is 41/41 at this commit)
Single-clause drops (one clause removed in a scratch copy of scripts/): (a) drop `if (run.timedOut) return 'timeout';` → FAIL timeout-and-process-group-cleanup survived timeout=100ms, 40/41, exit=1; (b) drop `&& run.status !== 0` → FAIL k43-exit-zero-with-verdict-fail-is-survived killed, 40/41, exit=1; (c) drop `&& hasLine(run.stdout, 'VERDICT: FAIL')` → FAIL k43-nonzero-with-verdict-pass-is-survived killed, 40/41, exit=1; (d) drop `&& failNames(second.stdout) === failNames(first.stdout)` → FAIL k43-confirmation-other-names-or-pass-disagrees other names / pass on rerun, 40/41, exit=1. Binding works; the receipt of drops at this commit is not committed (only ScribeQualityCriteria draft shows them at e5ffcbe; gate changed since).

Q26 (operability claim needs pass-sensitive counter) — FAILS (prescribed receipts absent / summary format differs).
$ F=.ufo/waves/round-43/final/checklist-pass.txt; awk '/^PASS [0-9]+\/[0-9]+$/{split($2,a,"/");print a[1]}' "$F" → awk: fatal: cannot open file `.ufo/waves/round-43/final/checklist-pass.txt' for reading: No such file or directory (exit=2)
$ grep -c ' exit=0$' "$F" → grep: .ufo/waves/round-43/final/checklist-pass.txt: No such file or directory (exit=2)
No open/checklist-pass.txt exists either; the only checklist receipt is final/checklist-84cb1d5d.txt: exit=0 lines=18, exit=1 lines=1, summary `CHECKLIST: 19/19 pass` — no `PASS n/m` line, and the summary counts passes, not exit=0 lines, so it disagrees with the criterion's definition.
The round's claimed counter (battery) IS pass-sensitive: committed junk-control receipts (build/ExecJunkControls.md) show J1/J2 → ERROR exit=2 control-fail=2, J3 → ERROR exit=2 nomatch=7; and the plan explicitly does not claim the blind terms integer ("Not claimed: the operability integer ... terms counter is blind, D3"). The letter of Q26 (named receipts, summary = exit=0 count) is unmet.

Q27 (no untracked wave report at filing) — PASS at measured commit; filing-time sweep is the L1's later step.
$ find .ufo/waves/round-43 -name '*.md' | sort vs git ls-files | grep '\.md$' | sort → diff no output, exit=0 (36 on disk = 36 tracked)
$ git status --porcelain --untracked-files=all -- .ufo/waves/round-43 → no output, exit=0
$ git --no-optional-locks -C /home/vgpnk/Projects/shokunin status --porcelain --untracked-files=all -- .ufo/waves/round-43 .ufo/reports/round-43 → no output, exit=0 (fleet sweep clean)
Round-42 three late falsify reports are now tracked (git ls-files lists CritC1Claim.md, CritSeparabilityTip.md, CritTradesTip.md). Current working copy holds 2 untracked falsify files (ReviewTimeline.md, swarm-registry.json) — mid-round report writes, before report filing; not a violation yet.

Q28 (counted knowledge section must cite a source row) — FAILS (hole open at measured commit).
$ scan (base 16a5441, K_MEMBER_RULES bind) → prints corpus/knowledge/kimi-skills-plugins.md:173: ## `~/.kimi-code/skills/cursor-lane` (one line; non-empty vs "prints nothing"; base has 13 headings, now 18)
$ awk S041 row → mined corpus/knowledge/kimi-session-state.md, corpus/lessons/round-42.md (row ok)
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --strict → PROXY: MATCH (...) K=53/53 coverage:kimi-layer=10; no K_SECTION_UNSOURCED warning; grep UNSOURCED scripts/proxy-check.mjs → 0 hits (no exclusion logic exists)
Blind probe: unbinding that heading in a copy → PROXY: DRIFT, K_sections computed=52 (declared 53), coverage_kimi=9 → the uncited section is counted (K_sections=53) and moves the coverage term; exactly the Q28 "Fails when ... the counter counts an uncited section" case. S041's row and used-by pass; the scan and counter behavior fail.

Verdict: Q25, Q26 and Q28 fail at the measured commit (3); Q27 passes now with the filing-time caveat. Verdict=fail. Findings are reviewer findings; the canonical assignment remains the only instruction source.
