RESULT K74CriticClaims rev=3c369336 verdict=claims-broken attacks=6
HEADLINE: C1 PROXY: MATCH is unreachable at rev 3c369336: SRC_NOT_A_DIR masked 4 errors (A=821 vs 687, C2=176/177 vs 167, AXES 9 vs 10) + 3 unpinned scripts; kill rule forbids stanza edits to force MATCH.
A1 verdict=PASS: cheap controls cannot reach predicates.
  cmd: node scripts/proxy-check.mjs -> PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) exit 2; with live ufo-fsd-alpha -> FAIL-CLOSED (SRC_REV_MISMATCH) fb7157fc != 31c465f1 exit 2.
  cmd: node scripts/kimi-census.mjs -> KIMI_CENSUS: DRIFT (UNLISTED plugins/installed.json.bak-pre-shokunin; UNLISTED plugins/managed/kimi-shokunin) exit 1.
A2 verdict=DRIFT-FOUND: predicate definitions aligned but minor quote drift in plan.md line 49.
  evidence: plan.md quotes "KIMI_CENSUS: CLEAN (members=55 checked=55 errors=0 …)" but scripts/kimi-census.mjs:414 outputs "CLEAN (members=55 checked=55 chain=22 info=4)"; errors=0 is in preceding TOTALS line.
A3 verdict=PASS: arm order disentangles claims; K-term drift does not mask origin pass.
  evidence: proxy-check.mjs resolveOrigin() runs at lines 1275-1281 before deriveTerms(); restored clone clears exit 2 and prints src-rev=31c465f15669 even on DRIFT exit 1.
A4 verdict=PASS: plan forces honest stop if PROXY: MATCH is unreachable.
  quote: plan.md:30 "any re-derived term reading DRIFT, or any stanza/term edit made to force MATCH, kills the claim; if the pinned rev cannot be checked out, fail closed and report."
A5 verdict=PASS: distinct axes (operability vs coverage:kimi-layer); zero harm observed.
  evidence: operability f_O terms A=687 and C=33 unchanged; config.toml.*.bak chain generations remain 22; script-layer (88/88) and runtime-layer (92/92) held.
A6 verdict=PASS: 11 seats in band [8, 16]; attack share 4/11 = 36.4% >= 25%; connector count 1 <= 2.
  evidence: attack seats = K74MutKimi, K74LabratFailClosed, K74CriticClaims, K74ReviewFreeze (4/11); connector = K74ConnectorOverlap (1); all 11 seats mapped to C1/C2/repairs/frontier.
DECISIVE FLAW: C1 predicate "node scripts/proxy-check.mjs -> PROXY: MATCH exit 0" is broken at base rev 3c369336.
  cmd: git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD -> 31c465f15669f744848bd9f5d56191c5085670f7
  cmd: node scripts/proxy-check.mjs --json -> exitCode=1, 4 errors (A_DRIFT declared=687 computed=821 delta=+134; C2_DRIFT declared=167 computed=176; C2_TOTAL_DRIFT declared=167 computed=177; AXES_DRIFT coverage 10 vs 9), 3 warnings (PIN_UNPINNED control-replay.mjs, harm-matrix.mjs, routed-ledger.mjs).
  cause: 134 runnable scripts were added in rounds 70-73 under .ufo/waves/ while running on Windows without origin clone; SRC_NOT_A_DIR masked term derivation at round open.
  conflict: updating stanza to force MATCH violates plan.md:30 kill rule ("any stanza/term edit made to force MATCH, kills the claim"); leaving stanza fails predicate (exit 1 != 0).
CORRECTION: Narrow C1 acceptance to origin resolution + layer terms: PROXY prints src-rev=31c465f15669, S=88/88, R=92/92; pre-register stanza refresh for r70-r73 artifacts separately.
