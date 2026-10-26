VERDICT: The lane's real-report numbers re-derive exactly (11 DRIFT / 13 CLEAN of 24, byte-identical to controls/real-reports-v2.txt; only r60 is a true DRIFT, 7 lines) and the tree's own disclosure is accurate, but the v2 tool accepts a laundered r60 that writes its overstated tally without `held=` and reads CLEAN — a report-lie the ratchet must close, for which a tested patch draft is supplied.

## Evidence

Tool = `scripts/report-receipt-diff.mjs` at lane HEAD `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` (= master); `node scripts/report-receipt-diff.mjs --selftest` → `REPORT_RECEIPT_SELFTEST: PASS (52/52)` rc=0.

Reports: last committed blob per round, `git -C /home/vgpnk/Projects/shokunin log --format=%h -n1 -- .ufo/reports/round-N/kumitate.md` then `git show <h>:<path>`; 24/24 rounds present. The `f47ad6ba` "restore" commit re-added byte-identical blobs (verified `git rev-parse f47ad6ba:<p>` == latest report commit's blob for r49/r51/r57 and == first blob for the other 21), so "last blob" = latest report revision, not a repair artifact.

Run: `node .../report-receipt-diff.mjs --lane .../kumitate-shokunin --round N --report <file> --rev 2ed8a5f8… --fleet /home/vgpnk/Projects/shokunin` (raw: build/K64R2ExecRealReports/run-last.txt).

```
$ awk -F'\t' '$3=="DRIFT"{print "r"$1" REPORT_RECEIPT: DRIFT "$4}' rerun-last.tsv > mine-drift.txt
$ diff mine-drift.txt .ufo/waves/round-64/controls/real-reports-v2.txt && echo EXACT-MATCH
EXACT-MATCH lines=11
$ awk -F'\t' '$3=="CLEAN"' rerun-last.tsv | wc -l
13
```
Per-round verdicts identical with `--rev 2ed8a5f8…` and with the worktree (no differing line); lane worktree clean for receipts.

TRUE findings (round 60 only), each independently re-measured:
```
$ grep -o '__[A-Z][A-Z0-9_]*__' r60.md | sort | uniq -c   → 1 __COMMITS__ / 4 __MEASURED__ / 1 __TIP__ (=6)
$ grep -n 'DISPATCH60_HELD' r60.md → 88:  `DISPATCH60: DISPATCH60_HELD held=10/10 checks=10 … rule=A60`,
$ git show 2ed8a5f8:.ufo/waves/round-60/close/dispatch60-tip.txt | head -1
DISPATCH60: DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0… rule=A60
```
(`close/doctrine60-tip.txt:1` does read `DOCTRINE60_HELD held=6/6`, so r60:96 is correctly NOT flagged.)

FALSE findings, deciding commands (all 16 rows in build/…/classification.tsv):
```
git -C {lane,fleet,shokuknow} cat-file -e 31c465f1^{commit} → fatal: Not a valid object name (×3)   [r40-43: read-only clone /fast/scratch/hyaku/kumitate-pin/src, r40.md:7-8]
same for b717dc03 (r53:35), 1cd6d667 (r57:84-85), ab902da2 (r61:65), 4247d2da (r62:9)
git show 2ed8a5f8:.ufo/waves/round-61/close/a2-repro-c1-fabrication.txt | head -1
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r61/CritControlC1/a4-full-fabrication ab902da2…
git -C kumitate-shokunin bundle list-heads .ufo/waves/round-61/controls/r61-c2-full-fabrication.bundle | head -1
4247d2da937842bd6846874d548b7125b356e14c refs/heads/r61-c2-forgery
git show 2ed8a5f8:.ufo/waves/round-49/r49/L1-score-0526f898.txt | sed -n 7p
BINDORACLE49: ORACLE_HELD held=6/6 checks=6 rev=0526f898… rule=B49 oracle_sha256=c3929a97…
git show 2ed8a5f8:.ufo/waves/round-49/controls/CtlNothing-base-b7b040b5.txt | sed -n 7p
BINDORACLE49: ORACLE_UNMET held=0/6 checks=6 rev=b7b040b5 rule=B49 oracle_sha256=absent
git show 2ed8a5f8:.ufo/waves/round-53/build/MutCounter53/counter-mutant.txt | sed -n 4p
ATTEST53: ATTEST53_UNMET held=0/0 checks=0 rev=d124a775… rule=A53 version=v1 |
git show 2ed8a5f8:.ufo/waves/round-58/controls/MutCounter58.txt | head -1
ATTEST58: ATTEST58_UNMET held=9/9 checks=9 rev=24791fd2… rule=A58 version=v1 | checks-mismatch want=10
git show 2ed8a5f8:.ufo/waves/round-61/close/a2-tip-dispatch61.txt | sed -n 2p
DISPATCH61: DISPATCH61_UNMET held=2/4 checks=4 rev=019a844c… rule=P61
git show 2ed8a5f8:.ufo/waves/round-61/close/a2-tip-doctrine61.txt | sed -n 2p
DOCTRINE61: DOCTRINE61_UNMET held=3/6 checks=6 rev=019a844c… rule=D61
```

First committed blobs (rounds with several report commits: 49 = `0fdce71a`+erratum `f50d178d`; 51 = five, `e30f32ff…e248fe62`; 57 = `7c3d1203`,`8e43dbcd`; every other round has one):
```
r49 SAME first=[DRIFT TALLY_UNRECEIPTED] last=[DRIFT TALLY_UNRECEIPTED]   (first 9886 B, last 10774 B: the erratum adds no tally)
r51 SAME CLEAN at all five revisions (14225/14553/14990/15057/15171 B)
r57 DIFF first=[CLEAN] last=[DRIFT HASH_DEAD]                              (first blob carries 0× `1cd6d667`; the hash arrives with commit 8e43dbcd)
r60 SAME DRIFT PLACEHOLDER,TALLY_UNRECEIPTED                               (r60 has ONE report commit 7b0581ed; restored blob identical — no first/last case exists for r60)
```
All other 21 rounds: first == last blob, SAME.

Smoke test over the other lanes' reports, same rounds only, read-only, worktree lane, no verdict judgement (raw: build/…/smoke.tsv):
```
for N in 40..63; for f in .ufo/reports/round-$N/*.md (kumitate.md excluded); lane=<stem>-shokunin
97 runs: 71 rc=0, 26 rc=1, 0 rc=2, 0 crash, 0 stderr-only first line, max 94 ms (kotoba round 48), 0 runs >5 s, 0 skipped lanes
```

## Findings

**K64R2ExecRealReports-1 — MEDIUM — a report can drop `held=` and keep its overstated tally (a lie the tool accepts).**
Attacks C1's `TALLY_UNRECEIPTED` arm and the plan's ratchet ("any report-lie a wave seat finds that the tool accepts"). `TALLY` requires the literal `held=`; a labelled tally written `DISPATCH60_HELD 10/10` is invisible. Laundering the real r60 report (fill the 6 tokens with real hashes, write the same overstatement without `held=`) reads CLEAN:
```
$ sed -e 's/__TIP__/2ed8a5f8…/g' -e 's/__MEASURED__/2ed8a5f8…/g' -e 's/__COMMITS__/d92cf1ff…/' \
      -e 's/DISPATCH60: DISPATCH60_HELD held=10\/10 checks=10/DISPATCH60: DISPATCH60_HELD 10\/10/' r60.md > r60-full-lie.md
$ node scripts/report-receipt-diff.mjs --lane … --round 60 --report r60-full-lie.md --rev 2ed8a5f8… --fleet …
REPORT_RECEIPT: CLEAN (round=60 rev=2ed8a5f8… bytes=13770)        rc=0        [input: build/…/mutants/r60-full-lie.md]
```
Fix drafted and tested (not integrated — L1 owns `scripts/`): `build/K64R2ExecRealReports/patch-tally-bare-form.diff` makes `held=` optional, indexes only the `held=` form (no relaxation of what satisfies a claim), and flags a bare-form claim only when the round's own receipts carry that counter (either verdict) with another pair — so r62's quoted foreign `DISPATCH61_HELD 4/4` and r63's `INLINE63_HELD 6/6` stay clean. Tested: `patch -p1 --dry-run` rc=0 on the lane tool; patched copy `--selftest` → `PASS (54/54)` (52 arms + 2 new); all 24 real reports → 24/24 SAME findings as the integrated tool (0 new false positives); both mutants → `DRIFT … TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10` rc=1.

**K64R2ExecRealReports-2 — LOW — 7 of the 15 false lines are receipt-scope artefacts that v1 already classified, and v2 did not carry the fix.**
Attacks the precision claim behind "11 DRIFT": ten DRIFT rounds are false positives. Four classes are the plan's declared limit (`HASH_DEAD` cannot resolve an external repo: r40-43, r53, r57, r61, r62 = 8 lines), but the receipt-scope class (r49 ×3, r53, r58, r62 ×2 = 7 lines) is *not* in plan.md's stated limit ("a receipt the lane itself wrote is trusted as written") — the receipts exist and are cited, just outside `base/`/`close/`. `controls/CHANGES-AFTER-FREEZE.md:31-38` declares it; plan.md does not. A rebased fix exists as a v1 draft only (`build/K64ExecReceiptRealRun/patch-report-receipt-diff.diff` widens the pool to `r<N>/`+`controls/` and allows same-line citations), which I did NOT test against v2. Repro: the r49/r53/r58/r62 rows above — each cited receipt carries the exact claimed pair.

**K64R2ExecRealReports-3 — LOW — the verdict depends on which blob of a report the caller passes; r57 flips CLEAN→DRIFT between its two commits.**
Attacks any use of the tool that treats "the report" as a path rather than a commit: a seat can file a clean report first and append the dead hash later. r57's first blob (`7c3d1203`) reads CLEAN, its last (`8e43dbcd`) reads `DRIFT HASH_DEAD 1cd6d667…`; the file is byte-identical to nothing else in the round. Repro: `git show 7c3d1203:.ufo/reports/round-57/kumitate.md` and `git show 8e43dbcd:…` piped through the tool. P3's r60 case is unaffected (single commit `7b0581ed`); the control file's convention (last blob) is the correct one, but it should be written down.

## Artifacts

- `.ufo/waves/round-64/w2/K64R2ExecRealReports.md` (this report)
- `.ufo/waves/round-64/build/K64R2ExecRealReports/classification.tsv` — 16 rows / 22 lines, TRUE/FALSE + class + deciding command
- `.ufo/waves/round-64/build/K64R2ExecRealReports/{rerun-last.tsv,rerun-first.tsv,rerun-last-drift-lines.txt,run-last.txt,run-first.txt,run-intermediate.txt,smoke.tsv,patched-vs-orig.txt}`
- `.ufo/waves/round-64/build/K64R2ExecRealReports/patch-tally-bare-form.diff` (proposed, tested; L1 integrates)
- `.ufo/waves/round-64/build/K64R2ExecRealReports/mutants/{r60-nohold.md,r60-full-lie.md}`
- scratch `/tmp/kumitate-r64/K64R2ExecRealReports/` (report blobs, patched tool copy) — to be deleted by the L1's sweep; no lane tree copies made, 0 `.mjs/.sh/.py` files added under the lane.

## Limits

- Other lanes' reports were smoke-tested only (exit codes/timing); no verdict about them is claimed and none is judged here.
- The 37 receipt controls and the counters (`receipt64-probe`, `jj64-probe`) were not re-run — other seats' assignments.
- The v1 receipt-pool patch was not rebased onto v2, so its behaviour on the 24 reports is untested; only the bare-form patch is measured.
- HASH_DEAD resolution was tested in exactly three repos (lane, fleet, shokuknow) plus existence of `/fast/scratch/hyaku/kumitate-pin/src`; I did not resolve the pins *inside* those external clones.
- Receipt contents are trusted as written (the plan's stated limit); I did not re-run any counter to confirm a receipt's own honesty.
- My dispatch names `controls/receipt/real-reports-v2.txt`; the committed file is `controls/real-reports-v2.txt` (as `CHANGES-AFTER-FREEZE.md:32` also names it). I used the real path — a prompt typo, not a lane defect.
- No tool installs or upgrades were needed.
