# Round 48 — four child sites routed under a repeatable counter

Lane base `f00cf278a5ab57e87b18418fc972be9f893f65da`; freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c`; candidate `ce9aee5daf71004a5890134f9526cc6fe424b206`. Attempt 2, one v2 wave `r48` (65 seats) + one residual call (8 reviewer/critic seats); all dispatches inline through the orchestrator (operator directive, mid-flight).

## Mistakes

1. **class:** A trace counter can silently omit child executions when it assumes fixed spacing in the PID prefix or the syscall-return column, then report a routed site from an incomplete trace. **evidence:** the R47-5 root-cause receipts — three concurrent traces at `f00cf278` read A2 `106/106, 105/106, 103/106` where F48 reads `106/106` (`.ufo/waves/round-48/probe/receipts/rc-at802-parser.txt`), and after a host PID wrap A2 reads `104/99, 103/99, 104/96` where F48 reads `106/106` (`rc-at802-pidwrap.txt`). This round adds the load-bearing proofs: `r48/MutCounterPadded.md` (padded returns at columns 41–200 parse; the `\)\s+= ` funnel and the `if(!ret) die` arm are each load-bearing — the A2 shape on identical bytes exits 0 while losing 3/4 execs) and `r48/ExecPidWrapProbe.md` (a real host wrap captured in a live trace: 54 padded-prefix records, all parsed by F48, all lost by A2). **captured-by:** none at R47 scoring time; now the round-48 plan § A48-adjacent receipts and this lesson. **fix:** F48's `\)\s+= ` return funnel, `^(\d+) +` prefix, and fail-closed unresumed/unparsed arms — frozen before any data seat, validated pre-candidate by `r48/A48-*.txt`.
2. **class:** A close conclusion can rest on cancelled-seat chat readings, or state an aggregate contradicted by its cited receipts. **evidence:** `corpus/lessons/round-47.md:105-125` (3/5, 3/5, 4/5 from seats listed as cancelled; the spot-check found only the cancellation list, `corpus/lessons/round-47-verifier-spotcheck.md:28-29,59-60`) and `SCORECARD.md` "all fourteen controls read 0/5" vs receipts `held=3/5` / `held=1/5`. **captured-by:** none at round-47 close. **fix:** R47-1 — the re-runs are committed receipts this round (`r48/ScribeReceipts-a2-rerun-{1,2,3}.txt`, readings 3/5, 3/5, 4/5 under load1 22→54; `r48/ReviewA2Receipts.md` SOUND); R47-2/R47-3 — the SCORECARD `## Round 47 correction`; QUALITY Q36 (below).
3. **class:** A frozen counter whose suite-summary clause trusts the gate's own report reads a forged self-consistent summary as ROUTED_HELD. **evidence:** `r48/MutSummaryForge.md` M2 — a round-gate selftest that genuinely fails one case, suppresses the FAIL line, prints `62/62` + `VERDICT: PASS` exit 0, read ROUTED_HELD 3/3 under F48. **captured-by:** the pre-data control wave (MutSummaryForge), exactly the class the kill rule exists for. **fix:** A48 — per-case line corroboration (count of `PASS/FAIL/SKIP` lines == m, count of `PASS` lines == n) for gates that print per-case lines; validated by `r48/A48-m2prime.txt` (the forgery dies at exactly RG742) without disturbing honest suites (`r48/A48-stab-r47-f00cf278.txt` 5/5).
4. **class:** An instrument author's own amendment can silently never reach the measured object. **evidence:** the intermediate A48 bytes `df42ab6b…` computed `caseLines`/`passLines` in `runGate` but never spread them into the per-site object, so `t.caseLines` was `undefined` and the oracle misfired on every CASELINES gate (first re-score round: r47 stability 2/5). **captured-by:** the A48 re-score protocol itself (receipts `r48/A48-stab-r47-f00cf278.txt` first round vs final). **fix:** re-run the full control battery against the amended bytes before any candidate score; the intermediate receipts are discarded, never scores.

## Gate

### Candidates

- **S098 — strace(1) 7.2 manual** (`https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in`): return-value column alignment (`-a`, default column 40, :832-835) and interleaved unfinished/resumed records (:148-158). Opened this round: drafted from attempt-1's `build/ScribeStraceManual.md`, independently re-fetched and verified byte-exact (sha256 `c16859e0…`) by `r48/ReopenS098.md` (HOLDS) and `r48/ReviewSources.md` (CONFORMS). **Admitted, tier A, status mined** — the amended counter header cites it textually (its teaching is the parser's `\)\s+= ` funnel and fail-closed resumed handling) and this lesson cites it; used-by `.ufo/waves/round-48/probe/caproute48-probe.mjs` + `corpus/lessons/round-48.md`.

### Admitted

- S098 (above). Re-open reports landing with HOLDS: S084, S091, S092 (`r48/ReopenS084.md`, `ReopenS091.md`, `ReopenS092.md`, verified `r48/ReviewReopens48.md`); S088 ruling `r48/ReconcileS088.md` (seat completed; HOLDS).

### Rejected

- None this round.

## Round-48 record

### Waves and seats

Attempt 1 (died with the orchestrator ~09:30 -03): freeze `fe3d45bf` + a 34-seat `build` wave; uncommitted outputs inherited per the addendum §5, re-verified and committed in the close. Attempt 2: one v2 wave `r48`, 65 seats (executor 7, scribe 7, scout 6, connector 1, revenger 2, reviewer 14, critic 6, mutation-tester 19, sentinel 2, simplifier 1; attack = reviewer+critic+mutation-tester = 39, 60%; band 64–128 under `ufo-wave-policy-v2.json`; grant `seats=65 live=21 cap=256`), plus a residual call of 8 reviewer/critic seats (`kumitate-r48-close`; grant `seats=8 live=123`). Dead seats: none in the r48 wave or the residual. The §3 planner seat was held by the L1 (orchestrator ruling; the validator rejects planner).

### C1 — operability (ROUTED_HELD, rule F48+A48) — verified

Four sites routed through `scripts/cap-run.mjs` (`kumitate-cap-run-v2`) via `scripts/cap-spawn.mjs` `capSpawnSync` at candidate `ce9aee5daf71004a5890134f9526cc6fe424b206` (route patches from seats ExecRouteRG742/SP491/SP519/SP1592, integrated by the L1; cap-spawn verdict-dir leak fix rides in the same commit). Frozen counter `probe/caproute48-probe.mjs`, final sha256 `3ed305f2…` (F48 frozen at `f24a3af5…`; A48 amendment forced pre-data by control MutSummaryForge M2, before any candidate score, strictness-only, validated `r48/A48-*.txt`).

- Before: `held=0/4` exit 1 at `f00cf278` (×3 stability, freeze receipts) and at the freeze (`r48/A48-stab-r48-fe3d45bf.txt`).
- L1 score: `CAPROUTE48 rev=ce9aee5daf71004a5890134f9526cc6fe424b206 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48+A48` exit 0 (`r48/L1-score-ce9aee5d.txt`; counter sha256 recorded; UTC dates; load1 38→26).
- Committed same-commit re-runs (kill rule): `close/ReRunCounter48-1-receipt.txt` (ReRunCounterA, 4/4 exit 0, sha `48088fe3…`) and `close/ReRunCounter48-2-receipt.txt` (ReRunCounterB, 4/4 exit 0). No exit-2 run occurred in any scored invocation.
- H2 (r47 set at the candidate): `close/ReRunR47Set-receipt.txt` — `held=5/5 runs=3 rule=F48+A48` exit 0 (K488 53/53, SC549 42/42, SC859 1/1, CC879 46/46, AT802 106/106).

### C2 — capability counter-rerun (COUNTER_RERUN) — verified

`scripts/counter-rerun.mjs` absent at the freeze. At `ce9aee5d`: `node scripts/counter-rerun.mjs --selftest` → `COUNTER_RERUN_SELFTEST: PASS` exit 0 (14 cases; the flake-injection case and the counter-not-executed check each kill a print-PASS stub); real run `node scripts/counter-rerun.mjs --probe <abs frozen probe> --lane <abs lane> --rev ce9aee5d… --runs 2 -- --set r48` → `COUNTER_RERUN: AGREE (runs=2)` exit 0, both runs `held=4/4` exit 0 with byte-identical final summary lines (sha256 `f3c23bdc…`) — `r48/L1-c2-binding-ce9aee5d.txt`. Final-summary-line agreement only; site-level stability is a different, unclaimed instrument (`r48/CritC2Shape.md`).

### Pre-data controls (all killed, no F48 amendment forced except A48's strictness-only arm)

17 attempt-1 control mutants at `held=0/4` (inherited, re-verified); attempt-2 wave controls MutSpawnEnvDodge, MutSpawnFakeRunner, MutSpawnCanaryLeak, MutRunnerDropSwap, MutRunnerLooseMem, MutRunnerDropTasks, MutRunnerUnshare, MutSiteSPDouble, MutCountPadSite, MutSiteRGArgv (survived as designed — argv not in predicate), MutAllowanceProbe (both directions), MutDoNothing48, MutNestedSelftest (allowance load-bearing) — receipts under `r48/`. Named residues: execveat-helper control (none killed — SimplifierPredicate), sh-wrapped nested-selftest at surface-probe (MutNestedSelftest M-sp-sh), cap-spawn OOM→status-0 contract wart (ReviewCapSpawnCode), the bind view (below).

### Harm

H1: base `r48/L1H1Base-f00cf278-run1-2.txt` (two runs at the declared base, 18/22, FAILs 685/686/687/697 — sandbox `REPORTS_DIR_MISSING`, pre-existing proxy drift, item-697 budget timeout) vs tip `close/H1Tip-run{1,2}.txt` + `close/H1Tip.md` — harm = an item passing both base runs and failing any tip run. H2: above, PASS. H3: proxy `--strict` at the close commit (re-pinned stanza). H4: census exit 0 at close. Measured en route: kimi-census and omp-census CLEAN at the freeze (`r48/ScoutLiveSurface.md`); cap-spawn leak fix delta 0 on a quiet host (`r48/L1-leakfix-delta.txt`).

### Open limits (recorded, not hidden)

- **Bind view**: a surgical drop of only the SP491/SP519 `--bind` mounts reads `held=4/4` (`r48/L1BindProbe-receipt.txt`): ROUTED_HELD cites no fs-view evidence and a counter-side bind oracle is unconstructible over per-run `mkdtemp` random dirs; defended by integration source review + H1; the full-bind-drop is killed by gate-health terms (`r48/MutSpawnDropBind.md`).
- A48 corroborates counts, not that cases ran (output-text oracle, RevengerCounter).
- argv identity is not in the predicate (MutSiteRGArgv).
- git-scm page drift stale-dated S076/S092/S063 pins (`r48/ReviewReopens48.md`) — noted, no chase.
- The lane PID space wraps every ~23 min under wave load: exit 2 is live across the ≥3 kill-rule runs; recorded, never a score (`r48/ExecPidWrapProbe.md`).

### Quality rules landed

Q36 (repeat-run receipts, amended wording per `r48/ReviewQualityDraft.md`): a frozen-counter success verdict is scoreable only with ≥2 committed receipts for the same frozen command/revision, exit 0 and byte-identical success summaries, complete trace parsing, and per-site counts equal to plan-pinned base counts. Q37 supported as drafted. Both appended to `corpus/QUALITY.md`.

## Sources

S093, S095, S069, S072 (carried); **S098 opened and mined this round** (the parser's alignment and unfinished/resumed handling rest on it). C1 rests on S098 with S093; C2 rests on R47-1/Mistake 3.
