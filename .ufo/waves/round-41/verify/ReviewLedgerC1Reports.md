RESULT ReviewLedgerC1Reports rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=mixed findings=32 dropped=11
Ledger of the eight C1 falsify reports: for every finding, its disposition at fae386aa9e0542710b7a893d84c8e92e86fc079b. All pointers are to that revision. Dropped = neither fixed nor recorded in lesson/SCORECARD/SKILL/README at that revision.

| # | report | finding (short) | disposition at fae386aa | pointer |
|---|---|---|---|---|
| A1 | CritC1AltOperators | 6 second-operator survivors (suite-any-fail some→every; severity==note; warn>=0 strict; resolved>1; first/last-group) | recorded | `corpus/lessons/round-41.md:160-167` ("Width beyond the counter", all six named) |
| A2 | CritC1AltOperators | lesson/SKILL/README say "pins the 16" unqualified | fixed | lesson `:11-13` ("drop-to-constant"), `SKILL.md:599` ("that the round-40 scout found unpinned"), `corpus/README.md:119` (same words) |
| A3 | CritC1AltOperators | warn-only case comment says one resolved citation, fixture measures resolved=2 | recorded | lesson `:163-164` (same sentence) |
| A4 | CritC1AltOperators | 4 proposed new cases (injected `--integrations` child, note-severity finding, clean --strict PASS, single-token fixture) | dropped (lane took the qualification alternative, A2) | diff 4e58bb0e..fae386aa `scripts/cite-check.mjs` = guard only, no new cases |
| S1 | CritC1SetWidth | SKILL.md:599 "the 16 … each pinned" overclaims | fixed | `SKILL.md:599` rewritten: scout qualifier + 13-exit/3-case-line split + "read those lines, not only the exit code" |
| S2 | CritC1SetWidth | README row "pins its 16" overclaims | fixed | `corpus/README.md:119`: "pins the 16 … the round-40 scout found unpinned" |
| S3 | CritC1SetWidth | 7 survivors outside the 16 unrecorded (—help exit, flag-followed-by-flag, record() ok, 2 integration gates, hermetic group select, unreadable-doc label) | recorded | lesson `:185-190` ("Set width … 11 killed, 3 equivalent, 7 survive", all 7 named, "outside C1 and stay open") |
| S4 | CritC1SetWidth | optional code follow-up (0-case group → exit 2; cases for --help, --self --json, throwing check) | dropped as code; recorded open | no such change in the 10-line cite-check diff; lesson `:185-190` keeps them open |
| T1 | CritC1Statement | SKILL:599 must split 13 exit-detected vs 3 case-line-only | fixed | `SKILL.md:599` (exact split, names the 3 suite-aggregation mutants) |
| T2 | CritC1Statement | lesson must mirror the split | fixed | lesson `:26-30` (13/3, names the three, credits CritC1Statement) |
| T3 | CritC1Statement | SKILL:676 checklist line should require full n/n + no FAIL line | recorded, not fixed | line `SKILL.md:676` unchanged ("exit 0 + `VERDICT: PASS`"); caveat recorded at `SKILL.md:599` and lesson `:27-29` ("checklist item 2 … would accept two of them") |
| T4 | CritC1Statement | exit-code-only observer scores 3/16 survived | recorded | same 13/3 text (`SKILL.md:599`, lesson `:26-30`) |
| V1 | CritC1Vacuous | vacuous=0/16, kills non-vacuous (confirmation) | no action needed; receipts committed | `.ufo/waves/round-41/final/cite-mutants-measured-68db3419.txt`, `cite-mutants-measured-4e58bb0e.txt` |
| V2 | CritC1Vacuous | optional: record that 3 kills show only as case FAIL lines | recorded | lesson `:26-30` (same text as T2) |
| I1 | CritInjectionBypass | normal mode unaffected; inject cannot flip a failing suite to PASS (both held) | confirmed, no action | report holds; no contrary evidence found at fae386aa |
| I2 | CritInjectionBypass | skip-unconditional mutant survives counter (SKIP rows leave `ran`) | recorded open; counter fix not applied | lesson `:181-183` ("Still open … the frozen counter does not treat a `SKIP` line as a kill"); probe has no SKIP logic (`grep SKIP probe/cite-verdict-mutants.mjs.txt` = empty) |
| I3 | CritInjectionBypass | changed literal in `=== '1'` guard recurses unbounded | fixed | `scripts/cite-check.mjs:2456-2460` (guard `!== undefined`, only `1` injects); verified live: `KUMITATE_CITE_SELFTEST_INJECT_FAIL=2` → `73/73`, two SKIP, `VERDICT: PASS`, exit 0 |
| I4 | CritInjectionBypass | children not killed as a process group on timeout | recorded open; not fixed | lesson `:183-184`; `scripts/cite-check.mjs:2428-2430` child41 spawnSync has no `detached` |
| I5 | CritInjectionBypass | `--integrations` also runs the hermetic block (cost) | dropped (seat asked no correction: "a cost, not a correctness defect") | not in lesson/SCORECARD/SKILL at fae386aa |
| R1 | ReProbeC1 | before 15/16 and after 0/16 reproduce; anchors faithful; receipts match | confirmed, no action; before-value recorded as round evidence | lesson `:58-59` (MutCiteOpenAudit's independent before value "replaced by the falsify seat ReProbeC1"); receipts in `final/` |
| P1 | ReviewCitePin | wave-census checklist item cannot fail on a never-dispatched wave (0/46 CLEAN) | fixed by rename | `SKILL.md:662-663` ("round 40's committed swarm evidence (a fixed, landed round)"), `SKILL.md:690` ("payload counts and findings; a payload proves validation, not dispatch") |
| P2 | ReviewCitePin | SCORECARD Axes operability row stale (A=7, C=13 vs live 9/17) | recorded, superseded in place | `SCORECARD.md:1811-1815` ("the rows they name stay as written and this list supersedes their numbers") |
| P3 | ReviewCitePin | wave-census has no proxy pin (strict DRIFT) | recorded | lesson `:169-171` ("no `kumitate-proxy-v1` pin (a third `PIN_UNPINNED` warning …)") |
| P4 | ReviewCitePin | SKILL:662 "last landed round" vs hard-coded --round 40 | fixed | `SKILL.md:663`: "a fixed, landed round" |
| P5 | ReviewCitePin | proxy cannot tell whether a counted item was run | dropped (seat labeled it RESIDUAL, no correction asked) | unchanged at fae386aa |
| H1 | ReviewR403Receipt | R40-3 receipt stale at tip: receipt/lesson say errors=545, tip read 549 | dropped; still stale, now 551 | lesson `:141` unchanged ("errors=545"); no "549" anywhere; my run at fae386aa (real fleet root): `CITE_CHECK: DRIFT (files=96 tokens=9361 errors=551 warnings=474)` exit 1 |
| H2 | ReviewR403Receipt | receipt not reproducible from a clone; fleet path unrecorded | dropped | `final/cite-receipt-r40-3.txt` header still "default --fleet = the real fleet root", no path, no fleet index |
| H3 | ReviewR403Receipt | receipt tokens=9319 not reproduced (9310 at 68db3419) | dropped | receipt unchanged; fae386aa reads 9361 |
| H4 | ReviewR403Receipt | "dead lane hash" wording wider than evidence | dropped | `corpus/lessons/round-40-verifier-spotcheck.md:206` unchanged |
| H5 | ReviewR403Receipt | receipt per-file command is a placeholder; full output not committed | dropped | receipt unchanged at fae386aa |
| H6 | ReviewR403Receipt | 8 of 33 REV_UNKNOWN rows report the pin-marker line, not the hash line | dropped | no correction recorded |
| H7 | ReviewR403Receipt | lesson's own citations of `.ufo/` artifacts are UNRESOLVED by construction (info) | dropped; grew | fae386aa round-41 lesson alone: `:39,110,140,149,152` UNRESOLVED; new `:113` PIN_MISMATCH (`778a35ee` bound to `corpus/README.md`) |

New facts observed while re-deriving dispositions at fae386aa (routed to the L1, not fixed by this read-only seat):
1. The C2 lesson bullet cites receipt `wave-recount-final.txt` (lesson `:39`) but no file of that name is tracked anywhere in the lane (`git ls-files | grep wave-recount` lists only `-before-27592977.txt`, `-measured-4e58bb0e.txt`, and the probe). The cited evidence for "and at the final tip" is absent at fae386aa.
2. `LOG.md:1827` says "R40-1, R40-3, R40-5, R40-6, R40-7 fixed", but per H1 the R40-3 receipt is stale at the tip and its recorded number (545) has been wrong since 4e58bb0e (549) and is 551 at fae386aa.
3. The C1 counter receipts end at 4e58bb0e bytes; `pin.cite-check` was re-pinned to the guard-fixed bytes (SCORECARD `:301` = sha256 `896f0720…`, which equals `sha256sum scripts/cite-check.mjs` at fae386aa), and no committed counter receipt exists for those bytes. The claim text bounds its measurements to 68db3419/4e58bb0e, so nothing is overclaimed, but the pinned bytes are unmeasured until this wave's ExecC1CounterTip lands.

## Evidence

```
$ git clone --no-hardlinks …/kumitate-shokunin …/seats/ReviewLedgerC1Reports/lane && git -C … checkout -q --detach fae386aa9e0542710b7a893d84c8e92e86fc079b
→ HEAD = fae386aa9e0542710b7a893d84c8e92e86fc079b; commits in range: 02fef27, 5320e0d, fae386a
$ git diff --stat 4e58bb0e..fae386aa | tail -8
  SKILL.md 10 ±, corpus/README.md 2, corpus/lessons/round-41.md +135, SCORECARD.md 41 ±,
  scripts/cite-check.mjs 10 ±, scripts/wave-census.mjs +167, LOG.md +15, 8 falsify reports added
$ git diff 4e58bb0e..fae386aa -- scripts/cite-check.mjs
  only hunk: 2452-2465 — guard `if (env[INJECT41] === '1')` → `if (env[INJECT41] !== undefined) { if (env[INJECT41] === '1') {push} ; skip-loop }`
$ sha256sum scripts/cite-check.mjs; grep -n 'pin\.cite-check' SCORECARD.md
  896f0720b7fe7492806b0a5b7458a995de1d666d6759297675b7d964872c6d0e | 301:pin.cite-check=896f0720b7fe7492806b0a5b7458a995de1d666d6759297675b7d964872c6d0e
$ grep -c 'SKIP' .ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt
  0   (frozen counter unchanged; I2 stays open as recorded)
$ node scripts/cite-check.mjs --selftest | tail -2
  75/75 cases passed (hermetic) / VERDICT: PASS   (exit 0)
$ KUMITATE_CITE_SELFTEST_INJECT_FAIL=2 node scripts/cite-check.mjs --selftest | tail -3
  SKIP … SKIP … / 73/73 cases passed (hermetic) / VERDICT: PASS   (no recursion; matches lesson :181-183)
$ KUMITATE_CITE_SELFTEST_INJECT_FAIL=1 node scripts/cite-check.mjs --selftest | tail -2
  73/74 cases passed (hermetic) / VERDICT: FAIL
$ sed -n '2428,2430p' scripts/cite-check.mjs
  child41 = … spawnSync(process.execPath, [SELF, ...args], { encoding:'utf8', timeout:300_000, maxBuffer:…, env:… })
  (no `detached`, no process-group kill → I4 recorded-open is accurate)
$ node scripts/cite-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --fleet /home/vgpnk/Projects/shokunin
  VERDICT: FAIL / CITE_CHECK: DRIFT (files=96 tokens=9361 errors=551 warnings=474) / exit=1   (H1: 545 recorded, 551 now)
$ …same run, grep round-41.md:
  :39 ERROR UNRESOLVED wave-recount-final.txt — not found under src
  :110 UNRESOLVED build-dispatch.json; :140 UNRESOLVED build/CritC1Design.md; :149 UNRESOLVED ScoutCiteVerdict.md; :152 UNRESOLVED anchor-reviews.json
  :113 ERROR PIN_MISMATCH 778a35ee — content pin does not match sha256(corpus/README.md)=9549abb1…
$ git ls-files | grep wave-recount
  .ufo/waves/round-41/final/wave-recount-before-27592977.txt
  .ufo/waves/round-41/final/wave-recount-measured-4e58bb0e.txt
  .ufo/waves/round-41/probe/wave-recount.sh.txt      (no wave-recount-final.txt anywhere)
$ grep -n 'errors=545\|549' corpus/lessons/round-41.md SCORECARD.md LOG.md
  corpus/lessons/round-41.md:141: … errors=545 …   (only hit; 549 recorded nowhere)
$ grep -n 'R40-3' LOG.md
  LOG.md:1827: R40-1, R40-3, R40-5, R40-6, R40-7 fixed; …
$ grep -n 'dead lane hash' corpus/lessons/round-40-verifier-spotcheck.md
  206:2. cite-check cannot tell an external commit named in the row's own URL from a dead lane hash.
$ head -2 .ufo/waves/round-41/final/cite-receipt-r40-3.txt
  # R40-3 receipt … (cite-check.mjs = 68db3419 bytes) …
  $ node scripts/cite-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src   (default --fleet = the real fleet root)
$ grep -n 'fixed, landed round\|round 40.s committed payloads' SKILL.md
  663: … round 40's committed swarm evidence (a fixed, landed round) …
  690: - [ ] Wave census of round 40's committed payloads (payload counts and findings; a payload proves validation, not dispatch) …
$ ls .ufo/waves/round-41/final/
  a2-census-repair-mutants.txt cite-mutants-measured-4e58bb0e.txt cite-mutants-measured-68db3419.txt
  cite-mutants-open-a58b7f72.txt cite-receipt-r40-3.txt wave-recount-before-27592977.txt wave-recount-measured-4e58bb0e.txt
  (no cite-mutants receipt at the re-pinned 896f0720 bytes)
```

## Residual risk and verification gaps

- I did not run the 16-mutant counter at fae386aa; that measurement belongs to ExecC1CounterTip this wave. My gap note: committed C1 receipts stop at 4e58bb0e bytes while pin.cite-check names 896f0720 bytes.
- T3 remains a live trap: a consumer following only `SKILL.md:676` still accepts 2 of the 3 case-line-only mutants; the caveat is recorded 80 lines above (`SKILL.md:599`) and in the lesson.
- H1's staleness is now worse than reported (551 vs 545) and `LOG.md` calls R40-3 fixed; the dangling `wave-recount-final.txt` citation and the `:113` PIN_MISMATCH are unrouted at fae386aa.
- Counts by disposition (32 rows): fixed 8 (A2, S1, S2, T1, T2, I3, P1, P4); recorded 10 (A1, A3, S3, T3, T4, V2, I2, I4, P2, P3); confirmed-no-action 3 (I1, V1, R1); dropped 11 (A4, S4, I5, P5, H1–H7).
- Tools installed or updated: none. Scratch clone: /fast/scratch/hyaku/kumitate-r41a2/seats/ReviewLedgerC1Reports/lane (detached at fae386aa). Only lane write: this report.
