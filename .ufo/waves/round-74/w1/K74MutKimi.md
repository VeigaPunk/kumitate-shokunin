RESULT K74MutKimi rev=3c369336 verdict=survivors mutants=7 killed=5
Patch status: build/K74ExecKimiMembers/K74ExecKimiMembers.patch absent at start; built two-member declaration directly in scratch clone.
Baseline tallies:
- node scripts/kimi-census.mjs --selftest -> KIMI_CENSUS_SELFTEST: 54/54 pass (VERDICT: PASS)
- node scripts/proxy-check.mjs --selftest -> PROXY_SELFTEST: 122/122 pass (VERDICT: PASS)
- node scripts/kimi-census.mjs (live) -> KIMI_CENSUS: CLEAN (members=55 checked=55 chain=22 info=4)

Mutant 3(a) [kimi-census: drop plugins/installed.json.bak-pre-shokunin member rule]:
- Verdict: KILLED (exit 1, cases=26/54)
- Observed kill line: FAIL green fixture → CLEAN exit 0, members=55 checked=55 chain=3 info=4 (last=KIMI_CENSUS: DRIFT (MEMBER_MISSING plugins/installed.json.bak-pre-shokunin))

Mutant 3(b) [kimi-census: drop plugins/managed/kimi-shokunin member rule]:
- Verdict: KILLED (exit 1, cases=26/54)
- Observed kill line: FAIL green fixture → CLEAN exit 0, members=55 checked=55 chain=3 info=4 (last=KIMI_CENSUS: DRIFT (MEMBER_MISSING plugins/managed/kimi-shokunin))

Mutant 3(c) [kimi-census: flip plugins/installed.json.bak-pre-shokunin family K2 -> K1]:
- Verdict: KILLED (exit 1, cases=52/54)
- Observed kill line: FAIL --json families read 4/29/10/9/3 and members=55 (members=55 K1=5 K2=28 K3=10 K4=9 K5=3 rows=32 strays=0)

Mutant 3(d) [kimi-census: remove installed.json.bak-pre-shokunin from plugins enumerable list]:
- Verdict: KILLED (exit 1, cases=36/54; live fixture exit 1)
- Observed kill line: FAIL green fixture → CLEAN exit 0, members=55 checked=55 chain=3 info=4 (last=KIMI_CENSUS: DRIFT (UNLISTED plugins/installed.json.bak-pre-shokunin))

Mutant 3(e) [kimi-census: decrement FROZEN.K2 echo from 29 to 28]:
- Verdict: KILLED (exit 1, cases=53/54)
- Observed kill line: FAIL --json families read 4/29/10/9/3 and members=55 (members=55 K1=4 K2=29 K3=10 K4=9 K5=3 rows=32 strays=0)

Mutant 4(a) [proxy-check: drop plugins/installed.json.bak-pre-shokunin from K_MEMBER_RULES]:
- Verdict: SURVIVED (exit 0, cases=122/122)
- Observed output: PROXY_SELFTEST: 122/122 pass (VERDICT: PASS)
- COVERAGE FINDING: proxy-check --selftest has zero assertions checking for plugins/installed.json.bak-pre-shokunin in K_MEMBER_RULES.

Mutant 4(b) [proxy-check: drop plugins/managed/kimi-shokunin from K_MEMBER_RULES]:
- Verdict: SURVIVED (exit 0, cases=122/122)
- Observed output: PROXY_SELFTEST: 122/122 pass (VERDICT: PASS)
- COVERAGE FINDING: proxy-check --selftest has zero assertions checking for plugins/managed/kimi-shokunin in K_MEMBER_RULES.

Receipt path: .ufo/waves/round-74/build/K74MutKimi/mutation-receipt.txt
Restoration: All mutants tested isolated and exact baseline sha256 restored before and after each probe.
