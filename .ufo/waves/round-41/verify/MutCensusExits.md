RESULT MutCensusExits rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=partial killed=20/22

Scope: the whole exit map of `scripts/wave-census.mjs` at fae386aa (sha256 `3a32dd345f9a9f52290f608b9d98fe5a1583026bba45c3997f7e489796e37ee4`, 26213 bytes) — parseArgs Usage throws -> 64, FailClosed and any read error -> 2 (incl. the attempt-2 string name/agent check and the attempt-2 read-error message split), verdict CLEAN -> 0, DRIFT -> 1, selftest pass -> 0 / fail -> 1.
Setup: own clone `/fast/scratch/hyaku/kumitate-r41a2/seats/MutCensusExits/lane` detached at fae386aa; harness `mutate.mjs` (one exact-string mutant at a time, bytes restored after each run, sha256 checked), independent exit-map probe `probe.mjs` (16 legs: U1-U6 usage incl. `--root`/`--expect` with no value, F1-F6 fail-closed incl. string-name/agent and the read-error regular-file leg, C1 CLEAN->0, D1-D2 DRIFT->1, S1 selftest->0+VERDICT: PASS).
Detector per mutant: repo `node scripts/wave-census.mjs --selftest` PLUS the probe. Control: `exit=0 WAVE_CENSUS_SELFTEST: 23/23 pass VERDICT: PASS`; probe `16/16 legs hold`. Killed = at least one detector case failed while the mutant was active; a crash is not a kill (inconclusive = no detector completed).

M01 killed :393 `return 64;` -> `return 2;` — selftest WC11,WC20; probe U1-U6
M02 killed :393 `return 64;` -> `return 0;` — selftest WC11,WC20; probe U1-U6
M03 killed :82 `throw new Usage('at least one --round is required')` -> `throw new FailClosed(...)` — selftest WC11; probe U1 (uncaught, exit 1)
M04 killed :70 `throw new Usage(\`--round takes a decimal integer, got ${v}\`)` -> `FailClosed` — selftest WC20; probe U2
M05 killed :80 `throw new Usage(\`unknown argument: ${a}\`)` -> `FailClosed` — selftest WC20; probe U3
M06 killed :76 `throw new Usage(\`--expect takes [<round>/]<wave>:<role>=<n>, got ${v}\`)` -> `FailClosed` — selftest WC11; probe U4
M07 killed :67 `throw new Usage(\`${a} needs a value\`)` -> `FailClosed` — selftest 23/23 PASS; probe U5,U6 (the selftest never calls a bare value-flag; killed only by the probe)
M08 killed :402 `return 2;` -> `return 1;` — selftest WC09,WC10,WC22,WC23; probe F1-F6
M09 killed :402 `return 2;` -> `return 0;` — selftest WC09,WC10,WC22,WC23; probe F1-F6
M10 killed :402 `return 2;` -> `return 64;` — selftest WC09,WC10,WC22,WC23; probe F1-F6
M11 killed :107 `typeof t.name !== 'string' || typeof t.agent !== 'string'` -> `typeof t.name !== 'string'` — selftest WC22; probe F5 (agent half still pinned)
M12 killed :405 `rep.verdict === 'CLEAN' ? 0 : 1` -> `? 1 : 0` — selftest 12 cases; probe C1,D1,D2
M13 killed :405 `... ? 0 : 1` -> `return 0;` — selftest WC02,WC03,WC04,WC05,WC12,WC15,WC16,WC17,WC19; probe D1,D2
M14 killed :405 `... ? 0 : 1` -> `return 1;` — selftest WC01,WC02,WC03,WC08,WC14,WC16,WC17,WC21; probe C1
M15 killed :166 `findings.length ? 'DRIFT' : 'CLEAN'` -> `? 'CLEAN' : 'DRIFT'` — selftest 14 cases; probe C1,D1,D2
M16 killed :408 `process.exitCode = main();` -> `process.exitCode = 0;` — selftest produced no summary (mutant removed the call); probe killed it: 15/16 legs fail (every exit becomes 0)
M17 killed :396 `if (opts.selftest) return selftest();` -> `return 0;` — selftest printed nothing (no summary); probe S1 fails (no VERDICT: PASS)
M18 killed :387 `return pass === results.length ? 0 : 1;` -> `? 1 : 0;` — selftest exit=1 with 23/23 printed; probe S1 (want 0, got 1)
M19 SURVIVED :387 `return pass === results.length ? 0 : 1;` -> `return 0;` — selftest 23/23 PASS, probe 16/16. Confirmed gap: compound probe (one check forced to fail) gives pristine exit=1 VERDICT: FAIL vs mutant exit=0 VERDICT: FAIL — the suite cannot observe its own aggregator exit code through the code that aggregator computes.
M20 killed :401 `\`read error: ${e.message}\`` -> `\`err: ${e.message}\`` — selftest WC23 (the attempt-2 read-error label is pinned)
M21 killed :401 `e instanceof FailClosed ? e.message : \`read error: ${e.message}\`` -> `e.message` — selftest WC23 (the FailClosed/read-error split is pinned)
M22 SURVIVED :107 `!t || typeof t.name !== 'string' || typeof t.agent !== 'string'` -> `!t || typeof t.agent !== 'string'` — selftest 23/23 PASS, probe 16/16. Discriminating probe: a task with `name: 42` (non-string) + string agent -> pristine exit=2 `fail-closed … has a task without a string name and agent`; mutant exit=0 `WAVE_CENSUS: CLEAN`. WC22 covers only a missing agent; a non-string name is never fed, so the name half of the attempt-2 check is unpinned.

Working-copy cross-measure (not my rev): sibling's uncommitted working copy (sha256 `617c9cc4ef29c7dad28de033b961e9e67bb0210c881dc65629813d2ae4c40fca`, 26/26 pass) kills M19 — WC24 spawns a child selftest with an injected failure and asserts the child exits 1 — and still leaves M22 SURVIVED: killed=21/22.
Restoration: every mutant wrote back pristine bytes after its run; `FINAL sha256` = `PRISTINE sha256` (`3a32dd34…` at fae386aa, `617c9cc4…` at the working copy), `equal=true bytesEqual=true`; clone `git status --porcelain` clean. Lane `scripts/wave-census.mjs` never written by me (only read for the working-copy cross-measure).
Tools: node v24.21.0 only; no installs (pacman paused; nothing needed).
