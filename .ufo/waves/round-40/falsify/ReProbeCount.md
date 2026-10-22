RESULT ReProbeCount rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=confirmed open=20/26,10/10 cand=0/26,10/10

# ReProbeCount: independent re-run of the C1 counting probe (round-40 falsify, wave 2)

Verdict: confirmed. Both totals and all 72 per-case lines reproduce the L1 receipts exactly. Four findings follow (F1 to F4). None changes a count. F1 corrects the declared wording for the open revision.

## Totals (my runs)
- open f69817edf687c8ce4f87ed7953a353399232f69e: FLOOR_PROBE2 attacks_accepted=20/26 benign_clean=10/10 setup_errors=0
- cand 1530a75521345e0f4516ed7146180e65f788e017: FLOOR_PROBE2 attacks_accepted=0/26 benign_clean=10/10 setup_errors=0

## Commands
Exact argv; stdin is the probe file. Run 1: Python subprocess with this argv and stdin. Run 2: the literal shell command with stdout and stderr redirected to scratch files. Every run exits 0 with empty stderr. Normalized output of run 2 equals run 1 (0 differing lines).
```
node --input-type=module - --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev f69817edf687c8ce4f87ed7953a353399232f69e --src /fast/scratch/hyaku/kumitate-pin/src --base e18ff1af3392e3823227644c977c237737fe65c9 < /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-40/probe/floor-probe-v2.mjs.txt
node --input-type=module - --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev 1530a75521345e0f4516ed7146180e65f788e017 --src /fast/scratch/hyaku/kumitate-pin/src --base e18ff1af3392e3823227644c977c237737fe65c9 < /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-40/probe/floor-probe-v2.mjs.txt
```

## Inputs and revisions
- Base e18ff1af3392e3823227644c977c237737fe65c9. Pinned upstream source /fast/scratch/hyaku/kumitate-pin/src at 31c465f15669f744848bd9f5d56191c5085670f7 (git rev-parse HEAD).
- open rev: the probe reports open-supported=false, so it runs that gate without --open.
- cand rev: open-supported=true, so the probe passes --open f69817edf687c8ce4f87ed7953a353399232f69e. The check verdicts carry that tag: 25 DRIFT verdicts and 10 CLEAN verdicts at cand. The flag reached the gate.
- The probe file is tracked at 1530a755 and at master, and the working-tree copy equals the master blob. Same for floor-probe2-open.txt and floor-probe2-integration-c3d9547.txt. floor-probe2-measured-1530a755.txt is tracked at master (added by 0004ae31), not at 1530a755 itself.
- Lane master is 0004ae3102c595338c269e56e3a6f5e0d4a28307, one docs commit after 1530a755. Between them only round-40 wave files, LOG.md, SCORECARD.md, SKILL.md, corpus/README.md and corpus/lessons/round-40.md changed. Nothing under scripts/ or .ufo/pins/ changed, so the measured gate and pin hold on master.
- Lane writes: this report only. The probe works in temp clones and deletes them. Lane master stayed at 0004ae31 across my runs.

## Checks
1. Totals: identical to the L1 receipts and to my runs. Open 20/26 and 10/10. Candidate 0/26 and 10/10. setup_errors=0 at both.
2. Expected kind per attack, candidate (rule: "A,B" needs both kinds printed; "A/B" needs either; the kinds come from TRUTH finding lines, and A4 from its FAIL-CLOSED verdict). 26/26 pass. The seven printed kinds all occur in scripts/anchor-truth.mjs: BASE_TRUE_LOST, CHECKED_SHRANK, DEBT_GREW, DEBT_NEW, PIN_INVALID, REVIEW_UNBOUND, TOKEN_FORGED.

| case | expected | printed kinds | refusal class | expected kind printed |
|---|---|---|---|---|
| P01-review-nosuchseat | REVIEW_UNBOUND | REVIEW_UNBOUND | DRIFT exit 1 | yes |
| P02-swap-451-456 | BASE_TRUE_LOST | BASE_TRUE_LOST,CHECKED_SHRANK,DEBT_GREW,DEBT_NEW | DRIFT exit 1 | yes |
| P03-swap-453-456 | BASE_TRUE_LOST | BASE_TRUE_LOST,CHECKED_SHRANK,DEBT_GREW,DEBT_NEW | DRIFT exit 1 | yes |
| P04-swap-454-456 | BASE_TRUE_LOST | BASE_TRUE_LOST,CHECKED_SHRANK,DEBT_GREW,DEBT_NEW | DRIFT exit 1 | yes |
| P05-swap-455-456 | BASE_TRUE_LOST | BASE_TRUE_LOST,CHECKED_SHRANK,DEBT_GREW,DEBT_NEW | DRIFT exit 1 | yes |
| P06-reorder-remaining-scripts-census.md14-15 | REVIEW_UNBOUND/BASE_TRUE_LOST | REVIEW_UNBOUND | DRIFT exit 1 | yes |
| P07-reorder-route-probe-cluster.md71-72 | REVIEW_UNBOUND/BASE_TRUE_LOST | REVIEW_UNBOUND | DRIFT exit 1 | yes |
| P08-reorder-sighting-wall.md22-23 | REVIEW_UNBOUND/BASE_TRUE_LOST | REVIEW_UNBOUND | DRIFT exit 1 | yes |
| P09-reorder-sighting-wall.md42-43 | REVIEW_UNBOUND/BASE_TRUE_LOST | REVIEW_UNBOUND | DRIFT exit 1 | yes |
| P10-reorder-sighting-wall.md63-64 | REVIEW_UNBOUND/BASE_TRUE_LOST | REVIEW_UNBOUND | DRIFT exit 1 | yes |
| P11-debt-trade | DEBT_NEW | DEBT_NEW | DRIFT exit 1 | yes |
| P12-headroom-73 | DEBT_GREW | DEBT_GREW,DEBT_NEW | DRIFT exit 1 | yes |
| A1-closure-r38-missing-key | TOKEN_FORGED,BASE_TRUE_LOST | BASE_TRUE_LOST,CHECKED_SHRANK,TOKEN_FORGED | DRIFT exit 1 | yes |
| A2-valid-shaped-key | TOKEN_FORGED,BASE_TRUE_LOST | BASE_TRUE_LOST,CHECKED_SHRANK,TOKEN_FORGED | DRIFT exit 1 | yes |
| A3-forged-true-token | TOKEN_FORGED | TOKEN_FORGED | DRIFT exit 1 | yes |
| A4-hand-source | PIN_INVALID | PIN_INVALID | FAIL-CLOSED exit 2 | yes |
| A5-base-true-range-widened | BASE_TRUE_LOST | BASE_TRUE_LOST | DRIFT exit 1 | yes |
| A6-earlier-true-copy-masks-falsified-original | BASE_TRUE_LOST | BASE_TRUE_LOST | DRIFT exit 1 | yes |
| ATK_SLOTS_ALL | DEBT_GREW | DEBT_GREW,DEBT_NEW | DRIFT exit 1 | yes |
| ATK_X1_REC38 | REVIEW_UNBOUND | REVIEW_UNBOUND | DRIFT exit 1 | yes |
| ATK_X1_REC40 | REVIEW_UNBOUND | REVIEW_UNBOUND | DRIFT exit 1 | yes |
| ATK_REORDER_REC | REVIEW_UNBOUND | REVIEW_UNBOUND | DRIFT exit 1 | yes |
| ATK_REBREAK | BASE_TRUE_LOST | BASE_TRUE_LOST,CHECKED_SHRANK,DEBT_GREW,DEBT_NEW | DRIFT exit 1 | yes |
| ATK_RELOCATE2 | BASE_TRUE_LOST | BASE_TRUE_LOST,CHECKED_SHRANK,DEBT_GREW,DEBT_NEW | DRIFT exit 1 | yes |
| ATK_TRADE | DEBT_NEW | DEBT_NEW | DRIFT exit 1 | yes |
| ATK_FRESH | DEBT_NEW | DEBT_GREW,DEBT_NEW | DRIFT exit 1 | yes |

3. Benign: 10/10 at open and at candidate. Each is ACCEPTED, exit 0, verdict TRUTH: CLEAN.
4. Exit codes and crashes: the fail-closed path returns 2 (scripts/anchor-truth.mjs:602-604). DRIFT exits 1 and CLEAN exits 0 (lines 742-746). A4 is the only exit-2 case, at open and at candidate, and the probe counts it as refused. No crash: stderr is empty in every run, every refusal verdict starts with TRUTH: DRIFT or TRUTH: FAIL-CLOSED, and no case is UNCLASSIFIED.
5. Refusal classes out of 36 cases. Open: accepted 30 (20 attacks and 10 benign), DRIFT exit 1 5, FAIL-CLOSED exit 2 1. Candidate: accepted 10 (benign only), DRIFT exit 1 25, FAIL-CLOSED exit 2 1.

## Comparison with the L1 receipts
- floor-probe2-open.txt (open): totals identical. 36/36 case headers identical (kind, expected, observed, exit, kinds, clean). Case blocks identical after normalization. 0 differing cases.
- floor-probe2-measured-1530a755.txt (candidate): same result. 0 differing cases after normalization.
- Normalization changes only two per-run values: (a) the temp directory name /tmp/r40-floor-probe2-XXXX becomes <TMP>; (b) the 12-hex commit id printed by the temp clone in the TRUTH_WARN line of ATK_X1_REC38 and ATK_X1_REC40 becomes <HEAD12>. The commit id changes per run because commitAll() creates a new commit each run.

## Findings (by severity)
F1 (medium; declared claim wording; numbers unaffected). The declared C1 text says the open revision "reads all attacks accepted". Neither the receipts nor my runs show that. At open, 20 of 26 are accepted and 6 are refused: A1, A2, A3, A5 and A6 by DRIFT (exit 1), and A4 by FAIL-CLOSED (exit 2). The master docs already say 20/26 (master:LOG.md:1805, master:SCORECARD.md:1763, master:corpus/lessons/round-40.md:26 and :45). The wrong wording exists only in the declared text. The floor gain is 20 attacks (0/26 against 20/26), not 26. Any restatement of C1 must use 20/26.
F2 (low; counting definition). A4 is refused by exit 2 (FAIL-CLOSED, PIN_INVALID), not by a DRIFT finding, at both revisions. The probe defines refused as "not (exit 0 and TRUTH: CLEAN)", so 0/26 follows its own rule. Under the assignment rule (no case counted as refused on exit 2 or a crash), this check fails for one case. Finding-only refusals: 5/26 at open and 25/26 at candidate. Reporting defect: kinds= prints "-" for A4, because kindOf() reads only "TRUTH  <KIND>" finding lines, and PIN_INVALID appears only in the FAIL-CLOSED verdict text. Fix (probe reporting only, no gate change): print the refusal class and take the FAIL-CLOSED token into kinds=.
F3 (low; latent blind spot). The probe discards gate stderr and counts any non-CLEAN exit as refused. An uncaught gate exception exits 1 with no TRUTH line, so it would be counted as REFUSED with no kind. This did not happen here: every refusal has a DRIFT or FAIL-CLOSED verdict, and stderr is empty. Fix: count a refusal only on those two verdict prefixes, and print gate stderr.
F4 (residual risk; scope). The counted mode is --open. At candidate the probe passes --open because the gate supports it. The checklist command in the assignment has no --open. The L1 notes that without --open, review records are read at HEAD, with one TRUTH_WARN line. So 0/26 describes only the --open mode. This item did not measure the no-open mode. Either the checklist command passes --open, or the docs state that 0/26 applies only with --open.

## Fixed probe versus seat original (diff, no finding)
seat-vs-fixed.diff (in scratch) shows four changes: (a) commitAll() before the three record-forging cases (ATK_X1_REC38, ATK_X1_REC40, ATK_REORDER_REC), so the forged records sit at HEAD; (b) ATK_REORDER_REC hand-writes the swap instead of calling repin; (c) resetFiles() runs git reset --hard to the rev, and setup_errors is counted, so a setup error no longer counts as accepted; (d) benign anchors B03 and B04 move from scripts/local-helper.mjs:12 to :11. At 31c465f line 11 is "const MAX_N_PREDICT = 512;" and line 12 is DEFAULT_N_PREDICT, so (d) repairs a false anchor and does not touch the gate. I did not run the seat original, so I cannot say how its counts differed.

## Residual risk and verification gaps
- Not run: the no-open (checklist) mode; the seat original probe; mutation runs; gate logic beyond exit codes and kind names.
- The probe counts a setup error as refused. setup_errors=0 at both revisions, so no count here is affected.
- F4 above: the 0/26 figure is measured only with --open.

## Tools
No installs. Host node v24.21.0 and git 2.56.0 used as-is. No pacman, sudo, or service changes.

## Per-case lines: open f69817edf687c8ce4f87ed7953a353399232f69e (probe output; temp names normalized)
```
CASE P01-review-nosuchseat attack expected=REVIEW_UNBOUND observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=779 debt=19 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE P02-swap-451-456 attack expected=BASE_TRUE_LOST observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=777 debt=21 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE P03-swap-453-456 attack expected=BASE_TRUE_LOST observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=777 debt=21 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE P04-swap-454-456 attack expected=BASE_TRUE_LOST observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=777 debt=21 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE P05-swap-455-456 attack expected=BASE_TRUE_LOST observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=777 debt=21 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE P06-reorder-remaining-scripts-census.md14-15 attack expected=REVIEW_UNBOUND/BASE_TRUE_LOST observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE P07-reorder-route-probe-cluster.md71-72 attack expected=REVIEW_UNBOUND/BASE_TRUE_LOST observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE P08-reorder-sighting-wall.md22-23 attack expected=REVIEW_UNBOUND/BASE_TRUE_LOST observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE P09-reorder-sighting-wall.md42-43 attack expected=REVIEW_UNBOUND/BASE_TRUE_LOST observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE P10-reorder-sighting-wall.md63-64 attack expected=REVIEW_UNBOUND/BASE_TRUE_LOST observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE P11-debt-trade attack expected=DEBT_NEW observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE P12-headroom-73 attack expected=DEBT_GREW observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=884 true=778 debt=93 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE A1-closure-r38-missing-key attack expected=TOKEN_FORGED,BASE_TRUE_LOST observed=REFUSED exit=1 kinds=TOKEN_FORGED,BASE_TRUE_LOST clean=false
  
  TRUTH: DRIFT (3 findings: TOKEN_FORGED BASE_TRUE_LOST base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE A2-valid-shaped-key attack expected=TOKEN_FORGED,BASE_TRUE_LOST observed=REFUSED exit=1 kinds=TOKEN_FORGED,BASE_TRUE_LOST clean=false
  
  TRUTH: DRIFT (3 findings: TOKEN_FORGED BASE_TRUE_LOST base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE A3-forged-true-token attack expected=TOKEN_FORGED observed=REFUSED exit=1 kinds=TOKEN_FORGED clean=false
  
  TRUTH: DRIFT (1 findings: TOKEN_FORGED base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE A4-hand-source attack expected=PIN_INVALID observed=REFUSED exit=2 kinds=- clean=false
  
  TRUTH: FAIL-CLOSED (PIN_INVALID <TMP>/lane/.ufo/pins/anchor-truth.json)
CASE A5-base-true-range-widened attack expected=BASE_TRUE_LOST observed=REFUSED exit=1 kinds=BASE_TRUE_LOST clean=false
  
  TRUTH: DRIFT (1 findings: BASE_TRUE_LOST base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE A6-earlier-true-copy-masks-falsified-original attack expected=BASE_TRUE_LOST observed=REFUSED exit=1 kinds=BASE_TRUE_LOST clean=false
  
  TRUTH: DRIFT (1 findings: BASE_TRUE_LOST base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE ATK_SLOTS_ALL attack expected=DEBT_GREW observed=ACCEPTED exit=0 kinds=- clean=true
  appended 188 slot anchors; TRUTH: PINNED (notes=4 anchors=999 true=778 debt=208 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=999 true=778 debt=208 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE ATK_X1_REC38 attack expected=REVIEW_UNBOUND observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH: PINNED (notes=4 anchors=811 true=779 debt=19 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=811 true=779 debt=19 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE ATK_X1_REC40 attack expected=REVIEW_UNBOUND observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH: PINNED (notes=4 anchors=811 true=779 debt=19 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=811 true=779 debt=19 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE ATK_REORDER_REC attack expected=REVIEW_UNBOUND observed=ACCEPTED exit=0 kinds=- clean=true
  records committed; review-swap hand-written
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE ATK_REBREAK attack expected=BASE_TRUE_LOST observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH: PINNED (notes=4 anchors=811 true=777 debt=21 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=811 true=777 debt=21 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE ATK_RELOCATE2 attack expected=BASE_TRUE_LOST observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH: PINNED (notes=4 anchors=811 true=777 debt=21 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=811 true=777 debt=21 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE ATK_TRADE attack expected=DEBT_NEW observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH: PINNED (notes=4 anchors=811 true=778 debt=20 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE ATK_FRESH attack expected=DEBT_NEW observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH: PINNED (notes=4 anchors=816 true=778 debt=25 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=816 true=778 debt=25 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE B01-no-edit benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE B02-prose-no-anchor benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE B03-new-true-anchor benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH: PINNED (notes=4 anchors=812 true=779 debt=20 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=812 true=779 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE B04-insert-earlier-anchor benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH: PINNED (notes=4 anchors=812 true=779 debt=20 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=812 true=779 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE B05-review-paragraph-rewrap benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE BEN_PROSE benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE BEN_REPAIR benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  records NOT rewritten; pin re-keyed; TRUTH: PINNED (notes=4 anchors=810 true=778 debt=19 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=810 true=778 debt=19 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE BEN_INSERT_NOSHIFT benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  inserted before ord 179; records NOT shifted in the committed file; TRUTH: PINNED (notes=4 anchors=812 true=779 debt=20 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=812 true=779 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE BEN_REKEY benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH: PINNED (notes=4 anchors=811 true=778 debt=20 unchecked=13 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
CASE BEN_UNCHECKED benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  inserted before ord 179; records shifted; TRUTH: PINNED (notes=4 anchors=812 true=778 debt=20 unchecked=14 src-rev=31c465f15669)
  TRUTH: CLEAN (notes=4 anchors=812 true=778 debt=20 unchecked=14 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
```
FLOOR_PROBE2 attacks_accepted=20/26
FLOOR_PROBE2 benign_clean=10/10
FLOOR_PROBE2 setup_errors=0
FLOOR_PROBE2 lane-rev=f69817edf687c8ce4f87ed7953a353399232f69e base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e open-supported=false

## Per-case lines: candidate 1530a75521345e0f4516ed7146180e65f788e017 (probe output; temp names normalized)
```
CASE P01-review-nosuchseat attack expected=REVIEW_UNBOUND observed=REFUSED exit=1 kinds=REVIEW_UNBOUND clean=false
  
  TRUTH: DRIFT (1 findings: REVIEW_UNBOUND base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE P02-swap-451-456 attack expected=BASE_TRUE_LOST observed=REFUSED exit=1 kinds=DEBT_GREW,CHECKED_SHRANK,BASE_TRUE_LOST,DEBT_NEW clean=false
  
  TRUTH: DRIFT (6 findings: DEBT_GREW CHECKED_SHRANK BASE_TRUE_LOST DEBT_NEW base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE P03-swap-453-456 attack expected=BASE_TRUE_LOST observed=REFUSED exit=1 kinds=DEBT_GREW,CHECKED_SHRANK,BASE_TRUE_LOST,DEBT_NEW clean=false
  
  TRUTH: DRIFT (6 findings: DEBT_GREW CHECKED_SHRANK BASE_TRUE_LOST DEBT_NEW base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE P04-swap-454-456 attack expected=BASE_TRUE_LOST observed=REFUSED exit=1 kinds=DEBT_GREW,CHECKED_SHRANK,BASE_TRUE_LOST,DEBT_NEW clean=false
  
  TRUTH: DRIFT (6 findings: DEBT_GREW CHECKED_SHRANK BASE_TRUE_LOST DEBT_NEW base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE P05-swap-455-456 attack expected=BASE_TRUE_LOST observed=REFUSED exit=1 kinds=DEBT_GREW,CHECKED_SHRANK,BASE_TRUE_LOST,DEBT_NEW clean=false
  
  TRUTH: DRIFT (6 findings: DEBT_GREW CHECKED_SHRANK BASE_TRUE_LOST DEBT_NEW base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE P06-reorder-remaining-scripts-census.md14-15 attack expected=REVIEW_UNBOUND/BASE_TRUE_LOST observed=REFUSED exit=1 kinds=REVIEW_UNBOUND clean=false
  
  TRUTH: DRIFT (2 findings: REVIEW_UNBOUND base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE P07-reorder-route-probe-cluster.md71-72 attack expected=REVIEW_UNBOUND/BASE_TRUE_LOST observed=REFUSED exit=1 kinds=REVIEW_UNBOUND clean=false
  
  TRUTH: DRIFT (2 findings: REVIEW_UNBOUND base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE P08-reorder-sighting-wall.md22-23 attack expected=REVIEW_UNBOUND/BASE_TRUE_LOST observed=REFUSED exit=1 kinds=REVIEW_UNBOUND clean=false
  
  TRUTH: DRIFT (2 findings: REVIEW_UNBOUND base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE P09-reorder-sighting-wall.md42-43 attack expected=REVIEW_UNBOUND/BASE_TRUE_LOST observed=REFUSED exit=1 kinds=REVIEW_UNBOUND clean=false
  
  TRUTH: DRIFT (2 findings: REVIEW_UNBOUND base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE P10-reorder-sighting-wall.md63-64 attack expected=REVIEW_UNBOUND/BASE_TRUE_LOST observed=REFUSED exit=1 kinds=REVIEW_UNBOUND clean=false
  
  TRUTH: DRIFT (2 findings: REVIEW_UNBOUND base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE P11-debt-trade attack expected=DEBT_NEW observed=REFUSED exit=1 kinds=DEBT_NEW clean=false
  
  TRUTH: DRIFT (1 findings: DEBT_NEW base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE P12-headroom-73 attack expected=DEBT_GREW observed=REFUSED exit=1 kinds=DEBT_GREW,DEBT_NEW clean=false
  
  TRUTH: DRIFT (74 findings: DEBT_GREW DEBT_NEW base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE A1-closure-r38-missing-key attack expected=TOKEN_FORGED,BASE_TRUE_LOST observed=REFUSED exit=1 kinds=TOKEN_FORGED,BASE_TRUE_LOST,CHECKED_SHRANK clean=false
  
  TRUTH: DRIFT (6 findings: TOKEN_FORGED BASE_TRUE_LOST CHECKED_SHRANK base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE A2-valid-shaped-key attack expected=TOKEN_FORGED,BASE_TRUE_LOST observed=REFUSED exit=1 kinds=TOKEN_FORGED,BASE_TRUE_LOST,CHECKED_SHRANK clean=false
  
  TRUTH: DRIFT (6 findings: TOKEN_FORGED BASE_TRUE_LOST CHECKED_SHRANK base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE A3-forged-true-token attack expected=TOKEN_FORGED observed=REFUSED exit=1 kinds=TOKEN_FORGED clean=false
  
  TRUTH: DRIFT (1 findings: TOKEN_FORGED base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE A4-hand-source attack expected=PIN_INVALID observed=REFUSED exit=2 kinds=- clean=false
  
  TRUTH: FAIL-CLOSED (PIN_INVALID <TMP>/lane/.ufo/pins/anchor-truth.json)
CASE A5-base-true-range-widened attack expected=BASE_TRUE_LOST observed=REFUSED exit=1 kinds=BASE_TRUE_LOST clean=false
  
  TRUTH: DRIFT (2 findings: BASE_TRUE_LOST base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE A6-earlier-true-copy-masks-falsified-original attack expected=BASE_TRUE_LOST observed=REFUSED exit=1 kinds=BASE_TRUE_LOST clean=false
  
  TRUTH: DRIFT (2 findings: BASE_TRUE_LOST base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE ATK_SLOTS_ALL attack expected=DEBT_GREW observed=REFUSED exit=1 kinds=DEBT_GREW,DEBT_NEW clean=false
  appended 188 slot anchors; TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (notes=4 anchors=9
  TRUTH: DRIFT (192 findings: DEBT_GREW DEBT_NEW base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE ATK_X1_REC38 attack expected=REVIEW_UNBOUND observed=REFUSED exit=1 kinds=REVIEW_UNBOUND clean=false
  TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (notes=4 anchors=811 true=779 debt=19 uncheck
  TRUTH: DRIFT (1 findings: REVIEW_UNBOUND base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE ATK_X1_REC40 attack expected=REVIEW_UNBOUND observed=REFUSED exit=1 kinds=REVIEW_UNBOUND clean=false
  TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (notes=4 anchors=811 true=779 debt=19 uncheck
  TRUTH: DRIFT (1 findings: REVIEW_UNBOUND base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE ATK_REORDER_REC attack expected=REVIEW_UNBOUND observed=REFUSED exit=1 kinds=REVIEW_UNBOUND clean=false
  records committed; review-swap hand-written
  TRUTH: DRIFT (2 findings: REVIEW_UNBOUND base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE ATK_REBREAK attack expected=BASE_TRUE_LOST observed=REFUSED exit=1 kinds=DEBT_GREW,CHECKED_SHRANK,BASE_TRUE_LOST,DEBT_NEW clean=false
  TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (notes=4 anchors=811 true=777 debt=21 uncheck
  TRUTH: DRIFT (5 findings: DEBT_GREW CHECKED_SHRANK BASE_TRUE_LOST DEBT_NEW base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE ATK_RELOCATE2 attack expected=BASE_TRUE_LOST observed=REFUSED exit=1 kinds=DEBT_GREW,CHECKED_SHRANK,BASE_TRUE_LOST,DEBT_NEW clean=false
  TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (notes=4 anchors=811 true=777 debt=21 uncheck
  TRUTH: DRIFT (5 findings: DEBT_GREW CHECKED_SHRANK BASE_TRUE_LOST DEBT_NEW base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE ATK_TRADE attack expected=DEBT_NEW observed=REFUSED exit=1 kinds=DEBT_NEW clean=false
  TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (notes=4 anchors=811 true=778 debt=20 uncheck
  TRUTH: DRIFT (1 findings: DEBT_NEW base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE ATK_FRESH attack expected=DEBT_NEW observed=REFUSED exit=1 kinds=DEBT_GREW,DEBT_NEW clean=false
  TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (notes=4 anchors=816 true=778 debt=25 uncheck
  TRUTH: DRIFT (6 findings: DEBT_GREW DEBT_NEW base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE B01-no-edit benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE B02-prose-no-anchor benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE B03-new-true-anchor benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (notes=4 anchors=812 true=779 debt=20 uncheck
  TRUTH: CLEAN (notes=4 anchors=812 true=779 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE B04-insert-earlier-anchor benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (notes=4 anchors=812 true=779 debt=20 uncheck
  TRUTH: CLEAN (notes=4 anchors=812 true=779 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE B05-review-paragraph-rewrap benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE BEN_PROSE benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE BEN_REPAIR benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  records NOT rewritten; pin re-keyed; TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (notes=4
  TRUTH: CLEAN (notes=4 anchors=810 true=778 debt=19 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE BEN_INSERT_NOSHIFT benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  inserted before ord 179; records NOT shifted in the committed file; TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record 
  TRUTH: CLEAN (notes=4 anchors=812 true=779 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE BEN_REKEY benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (notes=4 anchors=811 true=778 debt=20 uncheck
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
CASE BEN_UNCHECKED benign expected=CLEAN observed=ACCEPTED exit=0 kinds=- clean=true
  inserted before ord 179; records shifted; TRUTH_WARN review sources are bound against the lane's current HEAD (<HEAD12>), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH: PINNED (no
  TRUTH: CLEAN (notes=4 anchors=812 true=778 debt=20 unchecked=14 base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)
```
FLOOR_PROBE2 attacks_accepted=0/26
FLOOR_PROBE2 benign_clean=10/10
FLOOR_PROBE2 setup_errors=0
FLOOR_PROBE2 lane-rev=1530a75521345e0f4516ed7146180e65f788e017 base=e18ff1af3392e3823227644c977c237737fe65c9 open=f69817edf687c8ce4f87ed7953a353399232f69e open-supported=true

