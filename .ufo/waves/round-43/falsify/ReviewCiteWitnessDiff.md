RESULT ReviewCiteWitnessDiff rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=genuine findings=0

Scope: `git diff e5ffcbe7f155b89cb1870f9da7b0d671d092948b 84cb1d5d8e703aafd4f73d887ba4237692ff13f9 -- scripts/cite-check.mjs` = 18 insertions, 1 deletion, nothing else. Line numbers below are at 84cb1d5d.

## What the diff adds
- 2463-2465: comment + `const PRIMARY41 = 'KUMITATE_CITE_SELFTEST_PRIMARY_ONLY';`
- 2476: the one child spawn of the "suite self-observation" check now passes `{ [INJECT41]: '1', [PRIMARY41]: '1' }` (only changed line).
- 2642-2649: witness block — `primaryExit = verdict === 'FAIL' ? 1 : 0`; counts `witnessFailures` over `suites[].cases[]` with predicate `!result.skipped && !result.ok`.
- 2663-2668: after the primary `lines.push(`VERDICT: ${verdict}`)`, if `witnessFailures > 0` and env `KUMITATE_CITE_SELFTEST_PRIMARY_ONLY !== '1'`: push an extra exact `VERDICT: FAIL` line only when `primaryExit === 0`, print, `return 1`.
- 2669-2670: primary text exit unchanged (`return verdict === 'FAIL' ? 1 : 0`).

## Genuine second verdict path — yes
- The witness counts recorded per-case results (`suites` built at 2619-2626 from the `hermetic`/`integration` case arrays that `check()`/`checkI()` record). It does not read source, hashes, paths, or clocks.
- In unmutated code the witness predicate (`!skipped && !ok`) is identical to the primary's (`ran = cases.filter(!skipped)`; `failed = ran.filter(!ok)`), so `witnessFailures > 0` ⟺ `verdict === 'FAIL'`: on a healthy run the block is silent and output/exit are byte-identical to base. The witness only changes behavior when a verdict/exit expression is corrupted — which is exactly the kill gap it must close.
- Coverage of the three cite-check survivors matches the frozen gate manifest (gate-mutants.mjs@0f4108bf:127-130): `suite-group-verdict` and `suite-any-fail` leave the primary printing `VERDICT: PASS`/exit 0 while real cases fail → witness appends `VERDICT: FAIL` and returns 1 → killed; `suite-exit-text` mutates the 2670 return to `return 0`, but the witness `return 1` (2667) precedes it → killed.

## No differential signal (mutant run vs control run)
- Added lines read exactly one environment variable, `KUMITATE_CITE_SELFTEST_PRIMARY_ONLY` (2664). It is set only into the selftest's own child env (2476); the parent never sets it (grep: 3 occurrences, 2465/2476/2664; the frozen gate contains 0). Gate sandbox env is a fixed `{PATH, HOME, TMPDIR, LANG, TZ}` (gate-mutants.mjs:69-75), so control and mutant runs see the identical env shape.
- No own-source reads, no `*.pin.txt`, no `createHash`, no argv[1]/import.meta, no cwd/TMPDIR probes, no timing in the added lines (A1 D-static independently counted 0; probe receipt `final/c1-discriminators-84cb1d5d.txt`: `D-static added_self_reads=0`, `C1_DISCRIMINATORS: PASS`).
- D-null (comment-only append still passes) PASS in the same receipt — the witness keys on case results, not on source bytes. It is not a tripwire.
- The extra `VERDICT: FAIL` line carries no `N/M cases passed` tally (parseCaseCount total unchanged) and no `FAIL `-prefixed line (failNames unchanged); gate `killedOnce` (gate-mutants.mjs:448-450) requires a non-zero numeric exit plus exact line `VERDICT: FAIL` — the PASS-preference in `detailFor`'s verdict label (436-437) is display-only, so the dual-line output is honestly classified killed.

## PRIMARY_ONLY child — parent observation is honest
- With `PRIMARY41=1` the child skips the witness block (2664) and reports purely the primary path: injected failing case → primary `VERDICT: FAIL` (2663) + primary exit (2670). The parent's assertion (2482: `r.status === 1 && /^FAIL {2}injected failing case/m && /^VERDICT: FAIL$/m && skips`) is unchanged from base and now pins the primary verdict/exit mapping alone.
- This flag is load-bearing, not cosmetic: in a `suite-exit-text` mutant the child (witness off) prints the right verdict but exits 0; the parent records that failure honestly (my rerun detail: `exit=0 verdict=VERDICT: FAIL`). With the witness left on, the child would exit 1 via the witness return and the parent's check would pass — the flag prevents the witness from masking the primary defect it exists to expose.
- The `--json` child (2486) is untouched; JSON mode returns before the witness (2629-2640), so the flag is irrelevant there.

## Empirical rerun (own scratch clone at 84cb1d5d, removed after)
- Control copy sha256 227f56455dc1e7f03546a3afad9d7421f218daf930ea6dcfc310a58e4388c708 = the measured receipt's cite-check header. `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node <copy>/cite-check.mjs --selftest`.
- control: exit=0, line 79 `VERDICT: PASS` only, fail_lines=0 (witness silent, ~2.3 s).
- suite-group-verdict (literal applied at occ=1): exit=1; lines 79-80 = `VERDICT: PASS` + `VERDICT: FAIL`; fail_lines=2 (both self-observation cases saw child exit=0).
- suite-any-fail: exit=1; same dual-line shape; fail_lines=2.
- suite-exit-text: exit=1; single `VERDICT: FAIL` (primary), no `VERDICT: PASS`; fail_lines=1 (child `exit=0 verdict=VERDICT: FAIL`).
- Matches the frozen-counter receipt `final/c1-measured-84cb1d5d.txt`: both verdict mutants killed with detail `verdict=PASS` (dual line), `suite-exit-text` killed with `verdict=FAIL`, all `confirm=same`, `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 …)` exit 0. No leftover processes; scratch deleted.

## Findings by severity
- Defects: none. The comment at 2463-2464 ("the parent never sets it") is accurate; the witness is a genuine second aggregation/exit path over recorded results with no differential signal.
- Observations (not defects): (1) witness is text-mode only; JSON-mode exit (`suite-exit-json`) is killed via the parent's text-path observation, not by the witness. (2) The witness firing branch has no in-suite test case — it cannot fire in unmutated code; its behavior is evidenced by the gate kills and the reruns above.

## Residual risk / verification gaps
- The witness shares the `result.ok`/`result.skipped` substrate with the primary path: it is a second aggregation/exit, not an independent observer of case outcomes. A future mutation of `check()`'s ok-flag would blind both paths. No frozen K43 literal targets that site (all 18 cite-check manifest ids verified, gate-mutants.mjs:115-132), and K43 is frozen this round, so this is out of scope — but it bounds what the witness claims to protect.
- K43(d)'s rerun determinism for the witness-added FAIL line rests on stable child details (`exit=0 verdict=…`); the measured receipt shows `confirm=same` for all 43, and the A1-recorded same-temp-tree rerun limit applies unchanged.
- I did not rerun the full frozen counter (other seats own that; the committed receipt is cited, not re-derived).
- Tooling installs: none. Lane writes: this report file only; no git/jj writes anywhere.
