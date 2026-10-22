RESULT ReviewR403Receipt rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=stale errors=549 rev_unknown=33 external=1

# R40-3 receipt re-derivation (falsify, read-only review)

## Verdict

The committed receipt `.ufo/waves/round-41/final/cite-receipt-r40-3.txt` is correct for the corpus it measured (the bytes of commit 68db3419): errors=545, warnings=474, files=95, 33 REV_UNKNOWN, 1 external-url and 32 not-in-url, and 511 + 34 = 545. It is stale at the measured tip 4e58bb0. With the real fleet root, the same command there reads errors=549, because the round-41 lesson itself adds four UNRESOLVED errors. The lesson row R40-3 (`corpus/lessons/round-41.md` line 71) still says "errors=545" at the tip. The receipt also cannot be reproduced from a clone: cite-check's default `--fleet` is the directory above `--self`, so the literal command gives different totals.

Verdict word: stale.

## Measured values (scratch clones under /fast/scratch/hyaku/kumitate-r41/seats/ReviewR403Receipt/)

| run | files | tokens | errors | warnings | REV_UNKNOWN |
|---|---|---|---|---|---|
| committed receipt (text) | 95 | 9319 | 545 | 474 | 33 |
| 68db3419 bytes, real fleet root | 95 | 9310 | 545 | 474 | 33 |
| 4e58bb0 tip, real fleet root (receipt convention) | 96 | 9348 | 549 | 474 | 33 |
| 4e58bb0 tip, literal command in a clone (default fleet = clone parent) | 96 | 9342 | 713 | 541 | 35 |
| lane head 02fef27a (lane master moved past 4e58bb0), real fleet | 96 | 9351 | 549 | 474 | 33 |

Commands: `node scripts/cite-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src [--fleet /home/vgpnk/Projects/shokunin] [--json]`, run in the clone. Exit 1 in every run (DRIFT).

At 4e58bb0 with the real fleet root, error kinds are UNRESOLVED 257, LINE_OOR 247, REV_UNKNOWN 33, PIN_MISMATCH 12 (sum 549). The literal clone run has FLEET_MISSING 98, LINE_OOR 245, PIN_MISMATCH 12, REV_UNKNOWN 35, UNRESOLVED 323 (sum 713).

## 511 + 34 = 545

- `corpus/lessons/round-40-verifier-spotcheck.md`: 34 errors, all UNRESOLVED, at 68db3419, at 4e58bb0 and at lane head. The receipt's figure is right.
- Everything else: 545 - 34 = 511 at 68db3419; 549 - 34 - 4 = 511 at 4e58bb0.
- The four new errors at 4e58bb0 are all in `corpus/lessons/round-41.md`: line 49 `build-dispatch.json`, line 70 `build/CritC1Design.md`, line 79 `ScoutCiteVerdict.md`, line 82 `anchor-reviews.json`. Each names a round artifact under `.ufo/`. cite-check prunes `.ufo/` from its index (EXCLUDE_DIRS), so these can never resolve.
- The receipt's per-file command is a placeholder (`grep " ERROR " <output>`). The full cite-check output is not committed, so the 34 cannot be checked from committed bytes.

## REV_UNKNOWN: 33 rows, class split verified

The receipt's 33 file:line:hash rows match my run row for row. I classified each row two ways: the hash inside an http(s) URL on the reported line, and the hash anywhere in the file.

- external-url (1): `corpus/SOURCES.md:49`, 140f211984e8a0c926ec305a550da425f9bb8d69, inside the S036 raw.githubusercontent.com URL on that line. An ordinary read of that URL returned the Stryker report-schema JSON, so the commit exists in the external repo.
- not-in-url, present as commit objects in origin `/home/vgpnk/Projects/ufo-fsd-alpha` but not reachable from any fetched ref of origin (28 rows):
  - ee907f1cf (9): cost-and-profile.md:3, :116; native-admission-detail.md:3; runtime-support.md:3; test-inventories.md:4; round-12.md:145; round-5-aggregator-mirror-out-of-province-membrane-seal.md:12; round-6-aggregator-audit.md:120; round-7.md:27
  - ee907f1cf75241e21ee311e35ba4c2cdf44bcbbe (1): round-6-aggregator-audit.md:5
  - b18e0274d (7): enqueue-admission.md:4, :5, :174; reconcile-and-cycle.md:4, :280; round-30.md:23; round-7.md:24
  - daa371583 (5): gate-verdict.md:6; ops-watchers.md:13; route-probe-cluster.md:451; round-12.md:119, :155
  - 93798be12 (3): runtime-remainder-census.md:6, :533; round-15.md:92
  - 4f34e7dab (2): round-13.md:155; round-14.md:69
  - 51b814c2b (1): round-17.md:65
- not-in-url, absent from every store probed (4 rows): 44a3c781 (round-7.md:24), ba5e02be (round-30.md:25), d76ddcc0e (native-trial-launch.md:233), 2c6c580b (round-8-aggregator-box3-coldrun.md:50).

Checks behind the origin split: `git --git-dir=<origin>/.git cat-file -t` reports "commit" for the seven distinct present hashes. Inside origin, `git rev-list --all` over its fetched refs (147 commits) and `git rev-list 31c465f` (the pin's history as far as origin fetched it, 41 commits) contain none of the six short prefixes. The lane's object store (`git --git-dir=<lane>/.git cat-file -t`) lacks all 11 distinct hashes probed. Origin is itself shallow (two boundary commits), so "absent" for the four rows is inconclusive, while "present but unreachable" is a positive fact.

Fleet dependence: with the real fleet root, the fleet repo resolves c5abaac (`round-6-aggregator-audit.md:42`) and 46e9ec3 (`round-8-aggregator-box3-coldrun.md:138`). With the clone-parent fleet they are REV_UNKNOWN, which is why the literal run shows 35.

## Findings by severity

1. **medium-high, stale at the tip (R40-3 not closed at 4e58bb0).** The receipt and `round-41.md:71` say errors=545 at the tip. The tip reads 549 (four round-41 lesson errors). Lane head 02fef27a still reads 549 with the same lesson row at 545. Fix: re-run at the final tip with the real fleet root, record the new totals in the row, and say the receipt is for that revision.
2. **high, operability: the receipt is not reproducible from a clone.** `scripts/cite-check.mjs` sets `--fleet` to `dirname(--self)` (`cite-check.mjs` line 272). A clone under /fast/scratch therefore reads 713 errors, 541 warnings and 35 REV_UNKNOWN. The receipt header "(default --fleet = the real fleet root)" holds only when the lane sits at /home/vgpnk/Projects/shokunin/kumitate-shokunin. The receipt names the fleet only as "the real fleet root" (no path) and records no fleet index (321798 files now).
3. **medium: receipt token count not reproduced.** The receipt says tokens=9319. At 68db3419 with the real fleet root I get 9310. Commits 27592977, 2759297 and 34fccc17 also give 9310. Tokens do move with the fleet root at one revision (9342 clone-parent, 9348 real), so the difference is probably fleet churn. Not proven, because the receipt records no fleet state.
4. **medium: "dead lane hash" wording is wider than the evidence.** The closure file line 206 says cite-check cannot tell "an external commit named in the row's own URL from a dead lane hash". The 28 unreachable hashes are origin objects, not lane objects (the lane lacks all probed). They are unreachable from origin's fetched refs and from the pin's history, so "dead" holds for them. "Lane" is wrong. The four absent hashes are not shown dead; they could be typos or commits beyond origin's shallow depth. The ReviewCiteReceiptCand claim "rev-parse nowhere" holds only for the searched repos (self, pin, fleet).
5. **low: the receipt lacks the evidence it cites.** The per-file command is a placeholder and the full output is not committed. The 34 and the 511 cannot be checked from committed bytes. Fix: commit the full text output, as round 40's cite-receipts do.
6. **low: line attribution.** Eight of the 33 findings report the line of the pin marker. The hash sits on the next line or lines: cost-and-profile.md:116 (hash at 117), enqueue-admission.md:174 (175), reconcile-and-cycle.md:4 (5) and :280 (281), route-probe-cluster.md:451 (452), runtime-remainder-census.md:533 (534), round-13.md:155 (156), round-30.md:25 (26, 28). Still not-in-url in every case.
7. **info: the lesson's own errors are structural.** The 4 new errors and the closure file's 34 are bare names of `.ufo/` artifacts. The gate prunes `.ufo/` and can never resolve them, so each closure file adds errors by construction. The receipt counts them without naming the cause.

## Residual risk and verification gaps

- Origin's history is shallow, so I could not prove or disprove that the four absent hashes exist beyond its depth.
- I did not run the lane's own selftest or other gates; they are outside this item.
- I did not re-derive round-40's 511 at 1530a75 (the falsify seat's scratch runs were not committed).

## Touches and tools (read-only)

- Lane: `diff -rq` and `cmp` of corpus and SKILL.md against the clone; `cat .git/HEAD` and loose refs; `git --git-dir=<lane>/.git cat-file -t` (object reads, no index, no refs); `git clone --no-hardlinks` from the lane (read). No lane file written except this report.
- Fleet root `/home/vgpnk/Projects/shokunin`: read by cite-check (index walk of about 321,800 files) and `git rev-parse --verify` probes that cite-check itself runs for REV pins. No jj command, no writes.
- Origin `/home/vgpnk/Projects/ufo-fsd-alpha/.git`: read-only git (cat-file, log, merge-base, rev-list, for-each-ref, rev-parse).
- Pin `/fast/scratch/hyaku/kumitate-pin/src`: read by cite-check; read-only git.
- Remote: one ordinary HTTP read of the S036 raw URL (raw.githubusercontent.com, no access control involved).
- Tools: none installed or updated. Present: node v24.21.0, git, and a binary at ~/.local/bin/jq that reports itself as "jaq 3.1.1". JSON counts came from that binary; they agree with cite-check's own summary lines (549, 545, 713).
