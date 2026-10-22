RESULT ScoutCiteVerdict rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=mapped guards=22 unpinned=16 [warn-total:1581, resolved-kind-gate:1583, strict-conjunct:1589, strict-warn-arm:1589, resolved>0:1590, citeCheck-map:1595, render-env-empty:1626, render-env-zero:1626, exit2-empty:2527, exit2-zerores:2528, exit0/1-map:2535, parse-64:2512, suite-group-verdict:2471, suite-any-fail:2474, suite-exit-json:2486, suite-exit-text:2503] equivalent=filesScanned>0:1590 sev_conditions=25 sev_unpinned=14 [FRAGMENT:219, AMBIG:220, RESOLVED_BY_CONTEXT:218, RESOLVED_BY_PRECEDENCE:218, SELF_MISSING:223, FLEET_MISSING:224, PIN_UNTYPED:1182/1192/1247, content-pin-OK:1199, rev-pin-OK:1231, symbol-on-line-OK:1337, REF_OWNER_AMBIG:1510, SYMBOL_MISS:1345]

# ScoutCiteVerdict — every condition behind cite-check's VERDICT / CITE_CHECK / exit code

Target: `scripts/cite-check.mjs` at `f69817edf687c8ce4f87ed7953a353399232f69e` (sha256
`40573448330f52fb7d45c59cb0b91d236b6e277a250d850a0e2585adc7c10c9f`, 2538 lines, node v24.21.0).
Answer to the assigned question: the routed `totals.resolved > 0` (line 1590) is **not alone**.
16 of the 22 verdict/exit/suite conditions are unpinned, and 14 of the 25 severity decisions that
feed the error/warn counts are unpinned. The zero-resolution defence is duplicated at three
independent sites (1590, 1626, 2528), each individually unpinned, so the R39-5 drop generalises
into a triple.

Method: scratch clone at the open revision
(`/fast/scratch/hyaku/kumitate-r40/seats/ScoutCiteVerdict/lane`, detached at `f69817e`), one
mutant per condition in a throwaway copy of the file, every mutant run through
`node <mutant>/scripts/cite-check.mjs --selftest` (baseline `62/62 cases passed (hermetic)`, exit 0)
and through a five-fixture document probe. Killed = at least one case FAILed while the mutant was
active; survived = `62/62 cases passed`. Fixtures: `z0` one scanned doc, zero resolved citations,
zero findings; `zf` fragment-only doc; `zw` one OK citation + one warn; `zw --strict` same with
`--strict`; `ze` one OK citation + one error; `zd` zero scanned docs. Baseline document behaviour:
`z0` FAIL / `DRIFT (environment: zero-resolutions)` / exit 2; `zf` FAIL / exit 2; `zw` PASS /
CLEAN / exit 0; `zw --strict` FAIL / exit 1; `ze` FAIL / exit 1; `zd` FAIL /
`DRIFT (environment: empty-scan-set)` / exit 2.

Structural cause: no selftest case anywhere asserts `verdict === 'PASS'` (grep in the test region
1846-2500 finds zero occurrences; the only verdict assertions are `=== 'FAIL'` at 1873 and 1968).
The suite pins leniency mutations that suppress a specific *error kind* it has a positive error
control for (UNRESOLVED, LINE_OOR, REV_UNKNOWN, PIN_MISMATCH, SYMBOL_OFF_LINE, ORPHAN_REF) and the
drift gate itself, but it cannot pin leniency in the *aggregation* of those findings into the
verdict — the resolved counter, both strict arms, the `citeCheck` mapping and the exit mapping all
survive because the suite has no CLEAN/PASS control at all.

## A. Verdict-composing conditions (22)

| # | Guard / condition | Line | Pinned by case (in-file) | Status |
|---|---|---|---|---|
| 1 | `SEVERITY` classifier: UNRESOLVED, LINE_OOR, REV_UNKNOWN, PIN_MISMATCH, SYMBOL_OFF_LINE, SELF_MISSING, FLEET_MISSING = `error` | 217-224 | per-entry results in section B | mixed (14 of 25 severity decisions unpinned) |
| 2 | error severity → `totals.error++` | 1580 | `bogus-path → UNRESOLVED error` @1871 | pinned |
| 3 | warn severity → `totals.warn++` | 1581 | none | UNPINNED |
| 4 | `f.kind === 'OK'` gate on `totals.resolved++` | 1583 | none | UNPINNED |
| 5 | `drift` error arm (`totals.error > 0`) | 1589 | `bogus-path → UNRESOLVED error` @1871 | pinned |
| 6 | `drift` strict conjunct (`opts.strict`) | 1589 | none — no case passes `--strict` | UNPINNED |
| 7 | `drift` strict-warn arm (`opts.strict && totals.warn > 0`) | 1589 | none | UNPINNED |
| 8 | `totals.filesScanned > 0` | 1590 | none in isolation; equivalent mutant (`resolved>0` implies it); `fail-closed: empty scan set` @1964 kills only the pair removal | equivalent |
| 9 | `totals.resolved > 0` | 1590 | none | UNPINNED (known R39-5) |
| 10 | `!drift` | 1590 | `bogus-path → UNRESOLVED error` @1871 | pinned |
| 11 | `citeCheck: verdict === 'PASS' ? 'CLEAN' : 'DRIFT'` | 1595 | none — `text/json totals agree` @1956 only checks the `CITE_CHECK:` substring | UNPINNED |
| 12 | renderText env arm `filesScanned === 0 → 'empty-scan-set'` | 1626 | none | UNPINNED (CITE_CHECK text label only) |
| 13 | renderText env arm `resolved === 0 → 'zero-resolutions'` | 1626 | none | UNPINNED (CITE_CHECK text label only) |
| 14 | `kind !== 'dir'` fail-closed → exit 2 | 2520-2523 | `bare run (no --src): both candidates absent keeps the --src fail-closed arm (exit 2)` @2334 (only the `--src` arm is exercised) | pinned |
| 15 | main env arm `filesScanned === 0` → exit 2 | 2527, 2531-2533 | none | UNPINNED |
| 16 | main env arm `resolved === 0` → exit 2 | 2528, 2531-2533 | none | UNPINNED |
| 17 | `report.verdict === 'PASS' ? 0 : 1` | 2535 | none — bare-run cases print `exit=1` in `detail` but assert only `src`; @2334 asserts exit 2, which returns earlier | UNPINNED |
| 18 | parse throw → exit 64 | 2510-2513 | none | UNPINNED (exit contract) |
| 19 | per-group `verdict: failed ? 'FAIL' : 'PASS'` | 2471 | none — no injected failing case | UNPINNED (structural) |
| 20 | overall `suites.some(FAIL) ? 'FAIL' : 'PASS'` | 2474 | none | UNPINNED (structural) |
| 21 | json branch `verdict === 'FAIL' ? 1 : 0` | 2486 | none | UNPINNED (structural) |
| 22 | text branch `verdict === 'FAIL' ? 1 : 0` | 2503 | none | UNPINNED (structural) |

Rows 19-22 are unpinned by construction: the suite is its own observer, so forcing PASS/exit 0 is
indistinguishable while all 62 cases are green (both mutants ran `62/62`, exit 0). Closing them
needs a sub-run with one deliberately failing case, asserting FAIL and exit 1. Routing limbs with
no FAIL/PASS decision of their own are excluded from the count: 2514 (`--help` → 0) and 2515 (mode
dispatch into the suite rows).

## B. Severity classifier (feeds the error/warn counts; 25 decisions, 14 unpinned)

`SEVERITY` is consulted at exactly one site, `rec()` line 816 (`severity: SEVERITY[kind]`), and
`rec()` is called with only 11 kinds. 8 of the 19 map entries are therefore dead (see below);
severity for the other kinds is a literal at the construction site.

Live map entries:

| kind | value | mutation | result | killer |
|---|---|---|---|---|
| OK | note | note→error | killed (4) | prototype-member token; workspace artifact; fragments; generated $OUT_DIR |
| UNRESOLVED | error | error→note | killed (7) | bogus-path + 6 R16/R27/R29 cases |
| FP_EXEMPT | note | note→error | killed (6) | fragments + 5 R27/R29 cases |
| RUNTIME_UNRESOLVED | warn | warn→note | killed (1) | runtime artifact name @1905 |
| SUFFIX_RESOLVED | warn | warn→note | killed (1) | unique suffix @1913 |
| FRAGMENT | note | note→error | **SURVIVED** | — |
| AMBIG | warn | warn→note | **SURVIVED** | — |
| SELF_MISSING | error | error→note | **SURVIVED** | — |
| FLEET_MISSING | error | error→note | **SURVIVED** | — |
| RESOLVED_BY_CONTEXT | note | note→error | **SURVIVED** | — |
| RESOLVED_BY_PRECEDENCE | note | note→error | **SURVIVED** | — |

Direct severity decisions (every `severity: '…'` literal, 13 of them, plus the one ternary):

| line | kind / meaning | mutation | result |
|---|---|---|---|
| 1182 | PIN_UNTYPED | note→error | **SURVIVED** |
| 1192 | PIN_UNTYPED | note→error | **SURVIVED** |
| 1199 | content pin match (OK) | note→error | **SURVIVED** |
| 1206 | PIN_MISMATCH | error→note | killed (1) `content pin match → OK; mismatch → PIN_MISMATCH` |
| 1231 | rev pin resolved (OK) | note→error | **SURVIVED** |
| 1239 | REV_UNKNOWN | error→note | killed (1) `bogus rev → REV_UNKNOWN error` |
| 1247 | PIN_UNTYPED | note→error | **SURVIVED** |
| 1316 | LINE_OOR | error→note | killed (1) `out-of-range ref → LINE_OOR error` |
| 1323 | ref resolved (OK) | note→error | killed (2) `prototype-member token …`; `R28 quote: a backticked quote carrying a citation counts once` |
| 1337 | symbol on-line (OK) | note→error | **SURVIVED** |
| 1433 | inline FRAGMENT (second FRAGMENT site; the map entry at 219 is unpinned) | note→error | killed (1) `fragments → FRAGMENT note, no error` |
| 1492 | ORPHAN_REF | warn→note | killed (1) `ownerless ref → ORPHAN_REF warn` |
| 1510 | REF_OWNER_AMBIG | note→error | **SURVIVED** |
| 1345 | ternary: SYMBOL_OFF_LINE arm | error→note | killed (1) `symbol off-line → SYMBOL_OFF_LINE error` |
| 1345 | ternary: SYMBOL_MISS arm | warn→note | **SURVIVED** |

Dead map entries (survived their mutation; provably equivalent because `SEVERITY` is read only at
816 and `rec()` never receives these kinds): PIN_UNTYPED, SYMBOL_MISS, ORPHAN_REF,
REF_OWNER_AMBIG, LINE_OOR, REV_UNKNOWN, PIN_MISMATCH, SYMBOL_OFF_LINE. Tuning them changes
nothing; the effective severity is the literal at 1182/1192/1247, 1344-1345, 1492, 1510, 1316, 1239,
1206, 1344.

## C. Mutation outcomes (Stryker vocabulary; single-condition drop)

| Mutant | Selftest | Killer | Document witness |
|---|---|---|---|
| G1 drop `filesScanned > 0` (1590) | survived 62/62 | — (equivalent) | no probe distinguishes; pair removal with G2 killed by `fail-closed: empty scan set` @1964 (61/62) |
| G2 drop `resolved > 0` (1590) | survived 62/62 | — | `z0`: JSON `verdict=PASS citeCheck=CLEAN`, text `VERDICT: PASS`, exit 2 |
| G3 drop `!drift` (1590) | killed 61/62 | `bogus-path → UNRESOLVED error` | `ze`: PASS/CLEAN/exit 0 |
| G4 drop error arm (1589) | killed 61/62 | `bogus-path → UNRESOLVED error` | `ze`: PASS/CLEAN/exit 0 |
| G5 drop strict-warn arm (1589) | survived 62/62 | — | `zw --strict`: PASS/CLEAN/exit 0 (was FAIL/exit 1) |
| G6 drop `opts.strict` conjunct (1589) | survived 62/62 | — | `zw` default: FAIL/DRIFT/exit 1 (was PASS/exit 0) |
| G7 drop `kind === 'OK'` gate (1583) | survived 62/62 | — | `zf`: PASS/CLEAN/exit 0, `resolved=1` on a note-only doc |
| G8 drop warn-count arm (1581) | survived 62/62 | — | `zw --strict`: `warnings=0`, PASS/exit 0 |
| G9 citeCheck always CLEAN (1595) | survived 62/62 | — | `ze`: JSON `citeCheck=CLEAN` with `verdict=FAIL`; text `VERDICT: FAIL | CITE_CHECK: CLEAN` |
| G10 renderText env → null (1626) | survived 62/62 | — | `z0` text loses the `zero-resolutions` label; verdict unchanged |
| G11 drop main envErr pair (2527-2528) | survived 62/62 | — | `z0` exit 2→1; `zd` exit 2→1 |
| G12 final return always 0 (2535) | survived 62/62 | — | `ze` / `zw --strict`: exit 0 with `VERDICT: FAIL` |
| G13 parse return 0 (2512) | survived 62/62 | — | unknown flag exits 0 (was 64) |
| G14 stat `kind !== 'dir'` → false (2520) | killed 61/62 | `bare run … (exit 2)` @2334 | exit 2 survives by accident via the zero-res arm; the `is missing` stderr assertion is lost |
| G15 suite `verdict='PASS'` (2474) | survived 62/62 | — | structural |
| G16 group `verdict='PASS'` (2471) | survived 62/62 | — | structural |
| G17 suite return always 0 (2503) | survived 62/62 | — | structural |

## D. The R39-5 finding, reproduced and generalised

Dropping **only** line 1590's `totals.resolved > 0` reproduces the routed defect: all 62 selftest
cases pass, and a scanned document with zero resolved citations and zero drift (`z0`,
`filesScanned=1 resolved=0 error=0 warn=0`) flips to `verdict=PASS` / `citeCheck=CLEAN` in
`--json` and `VERDICT: PASS` in text. The process still exits 2 because the same condition is
duplicated at 2528, so printed verdict and exit code then disagree.

Dropping that guard **and** the main env arm (2528) gives `exit=0` with JSON
`verdict=PASS citeCheck=CLEAN` while the text still prints `CITE_CHECK: DRIFT (environment:
zero-resolutions)` — JSON and text disagree inside one run, because 1626 holds a third copy.

Dropping all three sites (1590, 1626, 2528) gives a fully green run on a document set with zero
resolved citations: `selftest 62/62 exit=0`; `z0` and `zf` both `json exit=0 verdict=PASS
citeCheck=CLEAN resolved=0` and `text exit=0 VERDICT: PASS | CITE_CHECK: CLEAN (files=1 tokens=0
errors=0 warnings=0)`. Each of the three drops is individually unpinned, so no single test
addition closes the family; all three sites need a pin.

## E. Probe recipe for the round-40 floor probe

These five fixtures plus one bad-argv call detect every non-equivalent survivor in section C:
`z0` (zero-resolved, no-drift doc, text **and** `--json`, assert verdict, CITE_CHECK, stderr, exit),
`zf` (note-only doc), `zw` default and `--strict`, `ze` (error + one resolved; text, `--json`, exit),
`zd` (empty scan set). Section B needs two more positive controls: a doc that reaches
FRAGMENT/AMBIG/SELF_MISSING/FLEET_MISSING/RESOLVED_BY_CONTEXT and must stay CLEAN, and a pin doc
where an untyped/ambiguous pin must stay note. Also note the in-file case
`fail-closed: empty scan set → exit-2 condition` @1964 is misnamed: it calls `runCheck` in-process
and never observes exit 2, and it passes with `resolved > 0` deleted.

## F. Evidence (exact commands and observed output)

```
$ git -C lane rev-parse HEAD
f69817edf687c8ce4f87ed7953a353399232f69e
$ cd lane && node scripts/cite-check.mjs --selftest
62/62 cases passed (hermetic)
VERDICT: PASS          (exit 0)
$ node /fast/scratch/hyaku/kumitate-r40/seats/ScoutCiteVerdict/work/G2_resolved/scripts/cite-check.mjs --selftest
62/62 cases passed (hermetic)      (survived; exit 0)
$ node /fast/scratch/hyaku/kumitate-r40/seats/ScoutCiteVerdict/work/G2_resolved/scripts/cite-check.mjs --json --self fixtures/z0/self --src fixtures/z0/src --fleet fixtures/z0/fleet
{"verdict":"PASS","citeCheck":"CLEAN","totals":{"filesScanned":1,"resolved":0,"error":0,"warn":0,...}}   (exit 2)
$ node /fast/scratch/hyaku/kumitate-r40/seats/ScoutCiteVerdict/work/G2_resolved/scripts/cite-check.mjs --self fixtures/z0/self --src fixtures/z0/src --fleet fixtures/z0/fleet
VERDICT: PASS | CITE_CHECK: DRIFT (environment: zero-resolutions)
$ node /fast/scratch/hyaku/kumitate-r40/seats/ScoutCiteVerdict/work3/Triple/scripts/cite-check.mjs --json --self fixtures/z0/self --src fixtures/z0/src --fleet fixtures/z0/fleet
exit 0, verdict PASS, citeCheck CLEAN; text: VERDICT: PASS | CITE_CHECK: CLEAN (files=1 tokens=0 errors=0 warnings=0)
$ node /fast/scratch/hyaku/kumitate-r40/seats/ScoutCiteVerdict/work/G5_strictWarnArm/scripts/cite-check.mjs --strict --self fixtures/zw/self --src fixtures/zw/src --fleet fixtures/zw/fleet
exit 0, verdict PASS (baseline with --strict: FAIL, exit 1)
```

## Remaining unknowns

- No script in the tree executes `cite-check.mjs`: `scripts/proxy-check.mjs:447` only pins its
  sha256 and `scripts/claims-check.mjs:442` only cites its prune list. Blast radius is
  operator/agent reads of stdout/`--json`/exit, not an automated consumer.
- `--integrations` (live tree) was not exercised; it adds cases but no new verdict conditions.
- Whether the round-40 probe asserts these fixtures itself or imports this harness is an
  integration decision for the L1 seat. Harness and raw results stay in scratch
  (`/fast/scratch/hyaku/kumitate-r40/seats/ScoutCiteVerdict/{harness,extra,lit,allsev}.mjs`,
  `results.json`). No tools installed; no lane file written except this report.
