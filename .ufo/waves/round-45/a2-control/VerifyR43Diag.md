RESULT VerifyR43Diag rev=a2e5b54c verdict=confirmed cause=ERROR-exit2-reproduced-at-tip;-MutCiteWitness-4of4-survive

# VerifyR43Diag — R43-1/R43-5 disposition-only verification (no claim; anti-loop)

Revised: a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f (clone /fast/scratch/hyaku/kumitate-r45/seats/a2-VerifyR43Diag/lane detached at that rev). Inherited report checked: .ufo/waves/round-45/build/ExecR43GateMutantsDiag.md (UNTRUSTED; measured at cfa99304).

## Claim 1: shipped-tip `GATE_MUTANTS: ERROR` / exit 2 — CONFIRMED
Code at tip (scripts/gate-mutants.mjs): usage:149 exit map "0 killed · 1 survived/drift · 2 setup, nomatch, crash, unstable kill, timeout, control failure · 64 usage"; TIMEOUT_MS=60_000 (:30); main() (:1233-1245) runs mutants only if every control passes; gateExitCode (:544-559) returns 2 on any controlFailure or nomatch/crash/unstable/timeout/overflow, and also if targetCount!==2 or frozenKilled!==41.

Run needed: yes; ran once in my clone only:
`env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE KUMITATE_GATE_MUTANTS_TMP=<scratch>/gate-tmp TMPDIR=<scratch>/gate-tmp systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 1500 node scripts/gate-mutants.mjs --target wave-census`
Observed (<scratch>/gate-wc.log, 47 s):
  CONTROL wave-census PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=32/32 floor=31
  25 MUTANT lines, every one "killed ... confirm=same" (incl. M02/M03/M04/M12)
  CONTROL_AFTER wave-census PASS ... cases=32/32 floor=31
  GATE_MUTANTS: ERROR (mutants=25 killed=25 frozen=25/41 drift=0 targets=1 rev=working-copy manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0) drift=0 nomatch=0 crash=0 unstable=0 timeout=0 overflow=0 control-fail=0
Runner exit 2 (outer shell: "Command exited with code 2"). This ERROR is design-intrinsic for one target (cannot reach targetCount=2/frozenKilled=41); the inherited full-run variant (CONTROL wave-census FAIL timeout=60000ms => mutants=0, control-fail=1) is confirmed as a code path: runControl -> timedOut, gateExitCode -> 2, reportText prints ERROR with control-fail=1. Load cause confirmed in code: processLimitForCurrentUid() sums /proc/*/task threads of uid 1000 (observed ~12,000 live during this seat; inherited observed 1738/1674) and spawns every child via /usr/bin/prlimit --nproc=min(current+256, soft) -- node --max-old-space-size=128 (:413-415); sandboxEnv allowlist PATH/HOME/TMPDIR/LANG=C.UTF-8/TZ=UTC (:108-115).

## Claim 2: MutCiteWitness 4/4 survivors at tip — CONFIRMED
cite-check.mjs tip sha256 115bfde4... = round-44 pristine B (controls/MutCiteWitness.md). Re-derived four single-token copies of the tip scripts tree, same detector:
`env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u KUMITATE_CITE_SELFTEST_DEPTH -u KUMITATE_CITE_SELFTEST_INJECT_FAIL -u KUMITATE_CITE_SELFTEST_PRIMARY_ONLY TMPDIR=<scratch>/wtmp systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node cite-check.mjs --selftest`
| copy | sha256 | exit | VERDICT | result |
| pristine | 115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8 | 0 | PASS | 75/75 baseline |
| WC return1->0 | 3ab73921532a7dd7b1de2fbdd8fe099dad518e81fb1a873052f47bef24182811 | 0 | PASS | survived |
| comparison >0->>=0 | 6af3a03ee9aade805129488af2d6c389d682b14cd0baef3ff440a865e20cf2a4 | 1 | FAIL+PASS | survived (round-44 detector) |
| literal FAIL->PASS | 3e53a059d8b0191182b59962bd2dfabb5fd9f3d1d365be1515ab013edc3c4d2f | 0 | PASS | survived |
| switch ===->!== | f86d9412e6fdb5336e9aa45aa2bff01c672ebb2ec9830a7cc69211292061557b | 0 | PASS | survived |
All four hashes equal the round-44 table exactly. Under the gate's own K43 (killedOnce: exit!=0 AND one exact VERDICT: FAIL AND evaluable), comparison is already killed, so witness survivors are 3/4 by K43 (matches inherited correction). Dead-code/equivalence reasoning confirmed by reading cite-check.mjs:2643-2673 (primaryExit===0 unreachable inside witnessFailures>0; switch only differs when PRIMARY_ONLY=1 AND a case fails, both paths then write same lines/exit).

## Receipts cited — verified
- .ufo/waves/round-44/controls/MutCiteWitness.md: detector = exit!=0 AND exactly one FAIL line AND no PASS line; 4/4 survivors at b01ded32; hashes match my re-derivation byte-for-byte.
- corpus/lessons/round-44-verifier-spotcheck.md: routes R43-1 (gate-mutants gameable) and R43-5 (witness single points; "Shipped-tip GATE_MUTANTS: ERROR exit 2") as still open.
- corpus/lessons/round-43-verifier-spotcheck.md: R43-1 (counter gameable before data); R43-5 "WA/WB/WC survive K43, and K43 (c) accepts runs that print both VERDICT: PASS and FAIL".
- .ufo/waves/round-43/final/trial1-working-copy-unstable.txt: round-43 precedent of this counter printing instability under load; manifest=8486506f... identical to tip.
- Scripts unchanged between cfa99304 and tip: `git diff --stat cfa99304 a2e5b54c -- scripts/` empty; manifest hash 8486506f... identical; gate-mutants.mjs tip sha256 177f6cbb...; wave-census.mjs 76447250... (matches inherited header digests).

## Disposition
Record and defer: R43-1/R43-5 stay open by anti-loop design (plan.md); E5 marks the capability row unverified (history, not deleted); when the counter is re-scoped: kill `comparison` via K43 (already kills), remove the dead `if (primaryExit === 0) lines.push('VERDICT: FAIL')` and redundant witness `return 1` so literal/switch have no text left, and decouple witness exit from return to make WC killable.

No tools installed/updated; no git/jj writes; gate run only in my clone; no processes left (pgrep none). Node v24.21.0.
