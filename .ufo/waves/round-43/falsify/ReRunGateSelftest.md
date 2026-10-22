RESULT ReRunGateSelftest rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=PASS selftest=41/41 red=11/11 k43_identical=yes

Items (all at measured commit 84cb1d5d8e703aafd4f73d887ba4237692ff13f9, scratch seat /fast/scratch/hyaku/kumitate-r43/seats/ReRunGateSelftest; counter bytes extracted from 0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82:scripts/gate-mutants.mjs, sha256 e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a matches the frozen value).

1. Pristine selftest at the measured revision.
   Command: KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ReRunGateSelftest/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node /fast/scratch/hyaku/kumitate-r43/seats/ReRunGateSelftest/work/pristine/scripts/gate-mutants.mjs --selftest
   Observed: GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0; VERDICT: PASS; exit=0. FAIL lines: 0.

2. Eleven re-applied mutants (4 isolation + 7 counter-suite, named in .ufo/waves/round-43/build/ExecGateIsolation.md). Each was applied to a copy of the measured-revision scripts tree (full scripts/ from `git archive 84cb1d5d… scripts`), run with the same bounded wrapper; each produced 40/41 pass, exactly one FAIL case, VERDICT: FAIL, exit=1.
   - iso1 process cap >16 → >160: FAIL process-cap-kills-overfull-group (timeout=true overflow=false)
   - iso2 RSS cap 512*1024 → 512*1024*1024: FAIL rss-cap-kills-overfull-group (timeout=true overflow=false)
   - iso3 --end-of-options removed: FAIL git-revision-end-of-options (rev-parse delimiter missing)
   - iso4 leading-dash revision guard removed: FAIL single-dash-revision-rejected (accepted)
   - m01 timeout predicate disabled: FAIL k43-evaluable-rejects-timeout
   - m02 overflow predicate disabled: FAIL k43-evaluable-rejects-overflow
   - m03 group-clean forced true: FAIL k43-evaluable-rejects-live-group
   - m04 control-total comparison removed: FAIL k43-evaluable-requires-control-total
   - m11 fail-name sort → reverse: FAIL k43-fail-names-ignore-output-order
   - m12 after.pass → after: FAIL failed-control-after-adds-integrity-error (control-after predicate missing)
   - m13 unstable → survived in invalid states: FAIL k43-unstable-is-invalid-before-survivor (exit=1)
   Red = 11/11.

3. K43 function byte-identity between 0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82 and 84cb1d5d8e703aafd4f73d887ba4237692ff13f9: extracted evaluable, killedOnce, classifyMutant, confirmKill, failNames, gateExitCode from both revisions (brace-balanced) and compared byte-for-byte. All six IDENTICAL (sha256 prefixes identical per function: evaluable 87b60683caba336c, killedOnce 449da36bf4b25d70, classifyMutant e06c1819ec993a7e, confirmKill a688a4c8ed13fe1b, failNames 1497311031b66333, gateExitCode 339c325b4bbdbf5c). k43_identical=yes.

4. Host safety: every run through systemd-run --user --scope -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600; after all runs pgrep -af on the seat path found no leftover processes; the gm-tmp dir is empty (mode 0700, parent owned by the seat user, not world-writable).

Verification gaps: none blocking. The gate's full mutation run (43 mutants + controls) was not executed by this seat; the parent owns post-integration gates. LSP unavailable in this seat; findings here are behavioral (observed sub/exit codes) and byte-level comparisons, not text-grep semantics.
