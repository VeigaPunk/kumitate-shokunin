VERDICT: The receipt tool ran on all 24 real reports (rounds 40..63) and every one of its 31 finding lines was hand-checked: 7 lines are TRUE (round 60 only — 6 template tokens + `DISPATCH60_HELD held=10/10` against a receipt reading `held=8/10`) and 24 lines in 12 classes are FALSE positives; a four-part patch in my build dir removes all 24 without moving any of the 16 frozen control verdicts (36/36 selftest), and the frozen counter's P2 is unsatisfiable as committed (it needs ≥8 distinct finding ids; the contract has 7, one of them unreachable from a control case, and the 16 cases exercise 6).

## Evidence

Real-report run (committed tool, `--rev master` = dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef; 6 CLEAN / 18 DRIFT):

```
r40 DRIFT HASH_DEAD 31c465f1…   r48 DRIFT SHONEN_COUNT boxes=3      r54..56 DRIFT HASH_DEAD 45c35e40…
r41 DRIFT HASH_DEAD 31c465f1…   r49 DRIFT TALLY_UNRECEIPTED (×3)    r57 DRIFT HASH_DEAD 1cd6d667…
r42 DRIFT HASH_DEAD 31c465f1…   r50/51/52 DRIFT SHONEN_COUNT boxes=0 r58 DRIFT TALLY_UNRECEIPTED ATTEST58_UNMET held=9/9
r43 DRIFT HASH_DEAD 31c465f1…   r53 DRIFT TALLY_UNRECEIPTED,HASH_DEAD r60 DRIFT PLACEHOLDER×6,TALLY_UNRECEIPTED
r44..47,59,63 CLEAN                                                  r61 DRIFT RECEIPT_MISSING,HASH_DEAD
                                                                     r62 DRIFT TALLY_UNRECEIPTED×2,HASH_DEAD×2
```

Patch result (same 24 reports, patched copy): 23 CLEAN, r60 DRIFT unchanged; `diff` of the two runs shows only the 17 rounds whose findings were false positives flipping to CLEAN.

```
$ node /tmp/kumitate-r64/K64ExecReceiptRealRun/patched/report-receipt-diff.mjs --selftest
REPORT_RECEIPT_SELFTEST: PASS (36/36)                       # committed tool: PASS (20/20)
$ node .ufo/waves/round-64/build/K64ExecReceiptRealRun/control-harness.mjs
cases=16 mismatches=0                                        # every case: original verdict == patched verdict == expect
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin dd1a3e6f… --report <6-heading draft>
RECEIPT64_UNMET held=4/5 checks=5 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=R64 | P2 MISS ids=6   exit 1
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs /tmp/kumitate-r64/K64ExecReceiptRealRun/laneclone 5928f8e7… --report <6-heading draft>
RECEIPT64_UNMET held=4/5 checks=5 rev=5928f8e70690ff765f09f52e61425789ded9a553 rule=R64 | P2 MISS ids=6   exit 1
```

So on the patched tool P1/P3/P4/P5 pass and only P2 misses; the committed tool reads the same `held=4/5` with the same `P2 MISS ids=6`. P5 was exercised with a six-heading draft (`.ufo/…/build/K64ExecReceiptRealRun/round64-report-p5-draft.md`); the real round-64 report does not exist yet (L1 owns it). Full per-finding hand-check is in `classification.tsv` (31 rows, each with the receipt line or `git cat-file` result that decides it).

## Findings

**K64ExecReceiptRealRun-1 — blocker — the frozen P2 is unsatisfiable, so `RECEIPT64_HELD` cannot be reached at any revision.** P2 demands ">= 8 distinct finding ids". The tool defines 7 (`PLACEHOLDER, TALLY_UNRECEIPTED, RECEIPT_MISSING, HASH_DEAD, HASH_ORPHAN, SECTION_MISSING, SHONEN_COUNT`), and `HASH_ORPHAN` cannot be exercised by a committed control case: a case lane is a plain directory, a nested repo commits as a gitlink, and `git archive` emits it empty —

```
$ git ls-files -s   →  160000 3bbf7d9c… 0  case/lane
$ git archive HEAD | tar -t  →  case/  case/lane/
$ git -C <extracted>/case/lane rev-parse --show-toplevel
fatal: not a git repository …        # P2 passes no --rev, so cat-file always fails in a case lane
```

The 16 frozen cases exercise 6 ids (`PLACEHOLDER, TALLY_UNRECEIPTED, RECEIPT_MISSING, SECTION_MISSING, SHONEN_COUNT, HASH_DEAD`), and the probe prints `P2 MISS ids=6` for both the committed and the patched tool. Repro: `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`. Remedy (report-only; frozen counters and controls untouched): two new worktree-mode checks with their own ids (e.g. `TALLY_REV_MISMATCH`, `ROUND_MISMATCH`) plus two cases — a strengthening the ratchet allows — or declare C1 UNMET as filed.

**K64ExecReceiptRealRun-2 — high — `SHONEN_COUNT` counts box lines, not boxes, and rejects a backticked box.** r48 has four boxes on three lines (`r48.md:39` holds two: `- [ ] Instructions … — [ ] No cross-domain bleed`); r50/r51/r52 write four boxes as `` - `[~]` **…** `` (`r50.md:203-215`, `r51.md:157-169`, `r52.md:150-162`). All four standard boxes are present in each. Repro: `node scripts/report-receipt-diff.mjs --lane . --round 48 --report .ufo/waves/round-64/build/K64ExecReceiptRealRun/r48.md --rev master`. Patch A (count `\`?\[[xX~ ]\]\`?` on list lines).

**K64ExecReceiptRealRun-3 — high — `HASH_DEAD` fires on hashes the report itself declares non-local and on URL path segments.** `31c465f1…` is the source pin of the read-only clone `/fast/scratch/hyaku/kumitate-pin/src` (`r40.md:7`, also r41–r43); `b717dc03…` a "scratch repo rev" (`r53.md:35`); `1cd6d667…` a `/tmp` clone's scratch rev (`r57.md:84-85`); `ab902da2…` a "fabrication fixture" (`r61.md:65`); `4247d2da…` a git bundle's revision (`r62.md:9`); `45c35e40…` sits inside `github.com/can1357/oh-my-pi/tree/<hash>` (`r54.md:48`, r55:121, r56:127, r62:38,49). None resolves in the lane, the fleet or `/home/vgpnk/Projects/shokuknow` (`git cat-file -e …^{commit}` → no/no/no). Repro: `--round 40`/`54`/`57`. Patch B: skip a hash that is a URL component; classify an unresolvable hash as `HASH_EXTERNAL` (printed, non-fatal) only when every occurrence carries a closed-set provenance marker on its own line or one wrapped neighbour that does not itself carry the hash — `HASH_DEAD` still fires when any occurrence lacks it (selftest `hash-external-mixed`). Residual hole, accepted: a forger can append a marker word to a dead lane hash; the tool cannot resolve external repos anyway (the plan's stated limit).

**K64ExecReceiptRealRun-4 — medium — `RECEIPT_MISSING` on a glob.** `r61.md:112` names `.ufo/waves/round-61/close/a2-*.txt`; the regex stops at `*` and reports the truncated stem `…/close/a2-` while 6 committed files match (`git ls-tree -r --name-only master -- .ufo/waves/round-61/close | grep -c '/a2-.*\.txt$'` → 6). Repro: `--round 61`. Patch C: allow `*` in the path class and expand it against the rev's file list.

**K64ExecReceiptRealRun-5 — medium — `TALLY_UNRECEIPTED` for tallies the round's own receipts do carry.** Four sub-classes: (a) round 49 filed receipts under `r49/` and `controls/`, not `base|close` — `.ufo/waves/round-49/r49/L1-score-0526f898.txt:7` reads `ORACLE_HELD held=6/6` and `controls/CtlNothing-base-b7b040b5.txt:7` reads `ORACLE_UNMET held=0/6`; (b) r53:102-103 cites `build/MutCounter53/counter-mutant.txt:4` (`ATTEST53_UNMET held=0/0`); (c) r58:30-31 cites `controls/MutCounter58.txt:1` (`ATTEST58_UNMET held=9/9 … checks-mismatch want=10`); (d) r62:29 quotes round-61 receipts (`round-61/close/a2-tip-dispatch61.txt:2` = `DISPATCH61_UNMET held=2/4`, `a2-tip-doctrine61.txt:2` = `DOCTRINE61_UNMET held=3/6`). Repro: `--round 49`/`53`/`58`/`62`. Patch D: pool = `base/`+`close/` verbatim **plus** every `.txt` of the round outside `build/`, `probe/`, `controls/`; plus citation resolution — the tally is accepted when the report names the receipt carrying it within the same ±1 wrapped line, any round, globs expanded. `HELD` is fail-closed: never accepted from a citation, because `.ufo/waves/round-61/close/a2-repro-c1-fabrication.txt:2` reads `DISPATCH61_HELD held=4/4` and a round-62 report citing it was accepted before I closed that door:

```
$ … --round 62 --report <r62 + "DISPATCH61_HELD held=4/4 (round-61/close/a2-repro-c1-fabrication.txt)">
patched-before-fix: REPORT_RECEIPT: CLEAN      patched-final: DRIFT TALLY_UNRECEIPTED DISPATCH61_HELD held=4/4
```

Guard case drafted at `.ufo/…/build/K64ExecReceiptRealRun/c16-held-cited-other-round/` (expect `1/TALLY_UNRECEIPTED`; both tools pass it).

**K64ExecReceiptRealRun-6 — medium — false negatives the tool still accepts (ratchet input, not patched by me).** (a) A `HELD` reading copied from a same-round `close/` forgery transcript: `round-61/close/a2-repro-c1-fabrication.txt` carries `DISPATCH61_HELD held=4/4`, so a round-61 report may claim it — the plan's stated limit ("a receipt the lane itself wrote is trusted as written"). (b) The receipt's `rev=` is never compared with the report's: a tally receipted at rev A satisfies a claim made at rev B (no control exercises this, and it is the natural 8th id for finding -1). (c) A bare `held=10/10` and `HELD 4/4` are unchecked by design (`r63.md:49-50`, `r61.md:29-30`, `r62.md:29` all use them) — declared limit.

**K64ExecReceiptRealRun-7 — medium — rounds whose receipts are not under `base|close` are unfalsifiable.** Rounds 40–44 hold 75–161 files each but no `base/`/`close/` (`git ls-tree -r --name-only master -- .ufo/waves/round-44 | head` → `controls-v3/…`, `build/…`), so the pool is empty and r44 reads CLEAN while its report leans on `controls-v3/`/`controls-v4/` (`r44.md:21-24`). The same is true for round 49's `r49/`. Repro: `--round 44` (CLEAN, 0 receipts).

**K64ExecReceiptRealRun-8 — medium — the wave-seat report shape cannot be P5's subject.** The shape mandated to me this round (`VERDICT:` + `## Evidence/Findings/Artifacts/Limits`) reads `DRIFT SECTION_MISSING,SHONEN_COUNT`; P5's subject must be the L1's round-64 report, which must carry the six headings (see the draft I used for P5).

## Artifacts

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ExecReceiptRealRun/`
- `classification.tsv` — 31 finding rows (12 HASH_DEAD, 8 TALLY_UNRECEIPTED, 6 PLACEHOLDER, 4 SHONEN_COUNT, 1 RECEIPT_MISSING), TRUE/FALSE + class + the hand-check evidence for each
- `patch-report-receipt-diff.diff` (199 lines, headers `a/…`/`b/scripts/report-receipt-diff.mjs`; `patch -p1` and `git apply --check` both accept it and the result is the draft byte-for-byte) + full-file draft `report-receipt-diff.patched.mjs` (selftest 36/36)
- `control-harness.mjs`, `controls-both-tools.txt`, `patched-selftest.txt`, `original-run.txt`, `patched-run.txt`
- `probe-original.txt`, `probe-patched.txt`, `probe-original-with-draft.txt`, `probe-patched-with-draft.txt`, `scratch-rev.txt` (scratch lane `5928f8e7…`, a `--shared` clone at `/tmp/kumitate-r64/K64ExecReceiptRealRun/laneclone`)
- `round64-report-p5-draft.md`, `c16-held-cited-other-round/` (report + lane + expect), `r40.md`…`r63.md` (the 24 reports as filed)

## Limits

- P5 was not run against the real round-64 report (it does not exist; L1 owns it) — only against a six-heading draft, on the committed and the patched tool.
- The patch was verified only against the 16 frozen control cases, its 36 selftests and the 24 real reports; no mutation testing of the patch, and no run over reports of other lanes or rounds < 40.
- `HASH_EXTERNAL` is a narrowing of `HASH_DEAD`'s scope, not a proof: an adjacent provenance word downgrades an unresolvable hash (documented in finding -3). Same-round forgery transcripts in `close/` remain trusted (finding -6a).
- Nothing installed (node and git were present); no pacman transaction attempted; no frozen counter, control, pin, plan or lane file outside my build/report paths was modified.
