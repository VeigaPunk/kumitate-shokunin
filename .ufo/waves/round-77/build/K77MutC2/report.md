# K77MutC2 — journal mutation battery

Axes: operability + coverage (orchestration/tooling). No claim verdict or integration performed.

Read the frozen round-77 plan first, including C2, then the delivered K77ExecJournal patch. Tested in my isolated shared clone at scaffolding revision `4dc470a131e10900fdd456b6b68d7ba27151d9d2` with that patch applied. Target SHA-256: `1f1f4a0ffafb6f4abeee2188a1deb38575f042b3b8221abccf71bbbf109016e5`. This is patch-byte evidence, not a measurement at M.

## Deliverables

- `mutants.mjs`: detached, timeout-bounded `--selftest` runner; 120000 ms per invocation. Copies only the tool directory into isolated `scripts/` sandboxes; redirects child TMPDIR into its sandbox. One literal replacement per mutant; exactly one match required. Missing or ambiguous anchors are NOT-EVALUABLE, never kills.
- `mutants.json`: eight frozen defects (a–h), exact anchors and replacements, expected detector cases.
- `real-v2-run.txt`: actual complete real-tool battery output, including per-mutant before/mutated/restored hashes.
- `standin.txt`, `standin-adopt.mjs`, `standin-mutants.json`: reproducible good journal mini-tool versus broken twin; baseline passes, twin fails, restored bytes pass.

## Actual outputs

Patched pristine tool: `SPOTCHECK_ADOPT_SELFTEST: PASS (26/26)` and `VERDICT: PASS`.

Real battery: `BASELINE exit=0 signal=- timeout=false verdict=PASS`.

| Arm | Defect | Mutated selftest | Restored selftest | Verdict |
|---|---|---|---|---|
| a | Publish journal after first destination write | exit 1 | exit 0 | KILLED |
| b | Recover only on --adopt | exit 1 | exit 0 | KILLED |
| c | Read hash-only stub rather than .pre bytes | exit 1 | exit 0 | KILLED |
| d | Keep journal after successful adoption | exit 1 | exit 0 | KILLED |
| e | Keep stale .tmp directory | exit 1 | exit 0 | KILLED |
| f | Accept foreign-lane journal | exit 1 | exit 0 | KILLED |
| g | Print RECOVERED when no journal exists | exit 1 | exit 0 | KILLED |
| h | Insert row at EOF | exit 1 | exit 0 | KILLED |

`MUTANTS77_C2: ALL-KILLED killed=8/8`

All eight restored hashes equal the target SHA-256 above. No timeout or spawn failure occurred. No surviving arm in this frozen battery against the delivered patch. This does not claim universal selftest coverage. For c, the hash-only stub is rejected by the pre-image digest guard; rollback crash cases then fail as expected rather than silently writing invented pre-images.

Stand-in: `MUTANT mini-unconditional-recovered KILLED exit=1 restored=pass bytes=ok arm=g`, followed by `MUTANTS77_C2: ALL-KILLED killed=1/1`. Good/restored SHA-256 `4335fd312b5e9a08b707b18fd041c24f9b449268440bf943ecb2ed07ffd71635`; broken twin SHA-256 `d8d7bc686984a9483788ca01d47ab6d5af59712f55940fce4fe3bd77c4e6cdf1`.

One initial runner-layout attempt failed its pristine baseline (tool copied one level too shallow, so readme-map.mjs was absent). It was inconclusive, not counted as a killed mutant. The corrected runner preserves the `scripts/` layout; the subsequent real transcript is saved separately.

## Exact L1 command at M

Run from the measured lane checkout root (not fleet root):

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-77/build/K77MutC2/mutants.mjs --tool scripts/spotcheck-adopt.mjs --work /fast/scratch/hyaku/kumitate-r77/L1-mutants-c2
```

Use a dedicated, otherwise empty work directory: the runner removes it on exit. Expect exit 0 and `MUTANTS77_C2: ALL-KILLED killed=8/8`. A changed final implementation may invalidate anchors; report NOT-EVALUABLE honestly rather than counting it as a kill.

## Boundaries and cleanup

No production lane files, index, commits, or sibling scratch trees changed. Only this seat's explicitly assigned receipts were written in the shared lane. No installations or updates. The scratch clone, mini-tool fixtures and counter work directories are removed before handoff; retained stand-in sources are receipts, not leftover scratch trees.

Self-evaluation: accuracy 4 (evidence is patch-byte-specific, not M); completeness 4 (all requested arms exercised; stand-in isolates only g); clarity 4 (full hashes are in machine receipts); actionability 4 (exact M command supplied, requires correct checkout cwd); conciseness 4 (report repeats the verdict table for readability). Overall 4.0. Improvement: L1 should retain the M rerun output alongside this pre-M receipt. No acceptance scope was narrowed.
