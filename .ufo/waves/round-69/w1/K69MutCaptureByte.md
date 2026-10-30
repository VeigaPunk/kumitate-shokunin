VERDICT: The live S210 digest detector killed the repinned capture forgery; offline did not detect the tamper, and whole-predicate mutation scoring is inconclusive because the baseline already fails.

## Evidence

Axes: coverage (independent capture authentication), operability (isolated, reproducible probe).
Frozen plan: `.ufo/waves/round-69/plan.md:142-168`; freeze commit `9401d8655970d542b81d318bdad558d6dea39397` (assignment provenance, not independently rechecked).
Build prefix B = `.ufo/waves/round-69/build/K69MutCaptureByte/`; all evidence paths below are lane-relative, not scratch citations.

Executed once (driver exit 0):
```text
python3 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/build/K69MutCaptureByte/probe.py
```
Driver extracted base `14057f3e3899180c95713bace088fb9c0d0046e3` into one isolated git fixture. Before every fixture git write it asserted its top-level directory. No lane git writes were made.
Pristine here means untampered capture bytes with the all-pinned origin section already appended, allowing the S210 digest arm to execute identically in all three phases.
Mutation: append `\nK69MutCaptureByte fabricated capture line\n` to S210's capture and recompute both its pin sha256 and byte length. Every S207–S213 origin bullet declares `pinned` with capture date 2026-10-30.
Expected bounded detector: `S210:origin-sha-mismatch` absent on pristine/restored LIVE runs, present on mutated LIVE run; absent in every `--no-live` run.
The driver invokes `TMPDIR=<seat scratch> node <frozen deprec69-probe.mjs> <fixture> <revision> [--no-live]`; exact argv and revisions are preserved in B`metadata.json:7-94`.

Pristine LIVE, B`pristine-live.txt:1-2`:
```text
DEPREC69_UNMET held=9/11 checks=11 rev=fa4b9224d21535d34fae1653c0e3ab0f1fd775e7 rule=M69 live=exercised | M9 MISS readme-map-exit=1 | M11 MISS S207:mirror-required,S208:mirror-required,S211:mirror-required,S207:no-snapshot-mirror
EXIT_CODE=1
```
Pristine offline, B`pristine-offline.txt:1-2`:
```text
DEPREC69_UNMET held=8/11 checks=11 rev=fa4b9224d21535d34fae1653c0e3ab0f1fd775e7 rule=M69 live=no-live(vacuous-declared) | M5 MISS no-live | M9 MISS readme-map-exit=1 | M11 MISS S207:mirror-required,S208:mirror-required,S211:mirror-required,S207:no-snapshot-mirror,no-live
EXIT_CODE=1
```
Mutated LIVE, B`mutated-live.txt:1-2`:
```text
DEPREC69_UNMET held=9/11 checks=11 rev=77f1961ee3d4ffd8f8e12524b510ee4213ef0abe rule=M69 live=exercised | M9 MISS readme-map-exit=1 | M11 MISS S207:mirror-required,S208:mirror-required,S211:mirror-required,S207:no-snapshot-mirror,S210:origin-sha-mismatch
EXIT_CODE=1
```
Mutated offline, B`mutated-offline.txt:1-2`:
```text
DEPREC69_UNMET held=8/11 checks=11 rev=77f1961ee3d4ffd8f8e12524b510ee4213ef0abe rule=M69 live=no-live(vacuous-declared) | M5 MISS no-live | M9 MISS readme-map-exit=1 | M11 MISS S207:mirror-required,S208:mirror-required,S211:mirror-required,S207:no-snapshot-mirror,no-live
EXIT_CODE=1
```
Restored LIVE, B`restored-live.txt:1-2`:
```text
DEPREC69_UNMET held=9/11 checks=11 rev=d11a85d610cf331a2fc9fc399ce0d42497151128 rule=M69 live=exercised | M9 MISS readme-map-exit=1 | M11 MISS S207:mirror-required,S208:mirror-required,S211:mirror-required,S207:no-snapshot-mirror
EXIT_CODE=1
```
Restored offline, B`restored-offline.txt:1-2`:
```text
DEPREC69_UNMET held=8/11 checks=11 rev=d11a85d610cf331a2fc9fc399ce0d42497151128 rule=M69 live=no-live(vacuous-declared) | M5 MISS no-live | M9 MISS readme-map-exit=1 | M11 MISS S207:mirror-required,S208:mirror-required,S211:mirror-required,S207:no-snapshot-mirror,no-live
EXIT_CODE=1
```
Restoration evidence, B`metadata.json:96-123`:
- Capture SHA256 before/restored: `6608969be1213cafd12edc27269519be54b3fadb0443ff0f1b5fc76f75752de4`; mutant: `14f9d2f34d987314ff18c6ca3eff0d274a3470bd1288868b3205ed371e6dbcac`.
- Pin-file SHA256 before/restored: `0f03941ee74bde3bad5ffbf1489f9618103871554d4733e77cc869b9686478a5`; mutant: `c534e047e17ae6da6e1d75e83ac6adea7908a17a5bffc1060ac6b9b226c81453`.
- Prepared entry SHA256 in all measured phases: `230b6679e9cf529104b96907c614cb695ae3440edb9a60cf371f5dbf3f72b325`.
- Entry finally restored to original base SHA256 `8e6c0b1f99497fbe444060dcc9535800b7a99163a7bab884b82d1c17fd350df6`.
- `restored_prepared_exact: true`, `restored_base_exact: true`, `scratch_removed: true`; driver stdout `SCRATCH_REMOVED=True`.

## Findings

1. **K69MutCaptureByte-1 — informational, successful targeted kill.** Attacks M3/M4 self-consistency being mistaken for provenance: repinning preserves those checks, but LIVE adds exactly `S210:origin-sha-mismatch`, which disappears after exact restoration. Reproduce using the driver command above. This is not a whole-predicate killed-mutant claim: pristine is already UNMET due inherited README-map drift and deliberately missing mirrors.
2. **K69MutCaptureByte-2 — named coverage limit, offline tamper survives the targeted detector.** Offline pristine/mutant/restored verdict contents are identical apart from revisions: no S210 mismatch appears. M5/M11 still fail closed on `no-live`; this does not yield a false HELD verdict. This is the plan's explicit limit, not a newly discovered contract defect. Reproduce using the same driver, which passes `--no-live` for each phase.

## Artifacts

- `.ufo/waves/round-69/w1/K69MutCaptureByte.md` (this report).
- B`probe.py` (reproduction driver), B`metadata.json` (commands, revisions, outputs, all before/mutant/restored hashes).
- B`pristine-live.txt`, B`pristine-offline.txt`, B`mutated-live.txt`, B`mutated-offline.txt`, B`restored-live.txt`, B`restored-offline.txt` (verbatim detector receipts with exit codes).

## Limits

No integration or frozen byte edits; no other mutants or runtimes invoked. No tool installs/updates. Network results describe this run, not future availability. Disposable fixture commits were removed with scratch; reproduction regenerates revisions. Only the targeted S210 mismatch detector has a passing baseline; whole-claim mutation outcome is inconclusive.
Self-evaluation: accuracy 5 (six verbatim receipts and hashes); completeness 5 (both modes across three phases, restoration and cleanup); clarity 4 (B abbreviation requires expansion); actionability 4 (reproduction requires live network); conciseness 4 (six full verdicts intentionally repeat). Overall 4.4/5. Improvement priorities: consume raw receipt filenames for machine review; preserve live-network qualification when citing the result. Would the user agree? The expected LIVE mismatch and named offline limit are directly evidenced.
