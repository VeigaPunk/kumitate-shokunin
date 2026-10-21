REP2 numbers=58 mismatches=9 verdict=refuted

# Rep2 — round-37 report section 2 (Landed changes + Before → after)

Target: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-37/kumitate.md` lines 46–68. The body is unchanged across the eight errata (last read at fleet HEAD 9764dc5).
Pinned basis: the report's own landed commit `86c0676` (pin `31c465f1`). Lane HEAD moved nine times after 86c0676 during this audit (a5d627b, 5031720, fdac52c, 1c281bb, fb5b90e, 5bc40d0, 469500f, c7648c7, 8c41439). "Now" below means 8c41439.
Method: `git clone --no-hardlinks` of the lane at each commit into `/fast/scratch/kumitate-r37/Rep2/clone-*`. Gates ran in those clones. Live gates also ran read-only in the lane and wrote nothing to tracked files (sibling falsify seats edited `.ufo/waves/round-37/falsify/*` in the same window). Evidence: `/fast/scratch/kumitate-r37/Rep2/evidence/`. Tool installs: none. Spawns: none.
Counting rule: numbers = each checkable value or pointer target in section 2 (19 Landed items, 39 Before→after items). Mismatch = does not reproduce at 86c0676. Unverified = no shipped gate or committed artifact can reproduce it.

## Landed changes — 19 items, 8 mismatches at 86c0676

| id | report says | check (snapshot) | observed | status |
|---|---|---|---|---|
| L1 | landed `86c0676c8c86…` | rev-parse --verify; merge-base --is-ancestor against origin/master (c7648c7) | resolves; ancestor | ok |
| L2 | `5ceb8cdc…` | same | resolves; ancestor | ok |
| L3 | ratchet `total 186` | `git show 86c0676:.ufo/pins/fidelity-ratchet.json`; gate nonok | sum of 20 notes = 186 = gate nonok; per-note ceilings = measured nonok (20/20) | ok |
| L4 | "four note restorations + notices" | `git grep -c 'Round-37 anchor-truth restoration' 86c0676 -- corpus/knowledge/` | 4 files carry the notice | ok |
| L5 | every symbol-keyed anchor reverted to its 0614092 line | line-aligned residual vs 0614092, equal-prose lines (`:\d+(-\d+)?` normalised), at 86c0676 | remaining-scripts-census 43 positions (18 lines); sighting-wall 9 (9); route-probe 16 (16); native-trial 8 (8). Total 76 | MISMATCH |
| L6 | SCORECARD `C2 84` | `git show 86c0676:SCORECARD.md` lines 288–289 | `C2=84`, `C2_total=84` | ok |
| L7 | SCORECARD "round-37 note" | `git show 86c0676:SCORECARD.md`, grep `Round 37 correction` | 0 hits; first lands in a5d627b. Pointer does not resolve at the pinned commit | MISMATCH |
| L8 | SCORECARD "Axes evidence" (D3 says the runtime row reads 92/92) | `git show 86c0676:SCORECARD.md` line 316 | `floor(10 × 11/11 × 83/92)` = **9** beside score 10 | MISMATCH |
| L9 | `corpus/QUALITY.md` Q16 | grep at 86c0676 | line 126 | ok |
| L10 | `corpus/README.md` rows | `git show` of 5ceb8cd and 86c0676 | one row per commit (round-36 in 5ceb8cd; round-37 in 86c0676) | ok |
| L11 | LOG round-37 `C2/C2_total=83`, `C2=83/83` | `git show 86c0676:LOG.md` lines 1724–1726 | 83 quoted; measured 84 | MISMATCH |
| L12 | LOG round-37 `CHECKLIST: 14/14 pass` | same lines | at 86c0676 the item-632 gate fails (see B15) | MISMATCH |
| L13 | lesson D8 `C2/C2_total = 83` | `git show 86c0676:corpus/lessons/round-37.md` line 36 | `= 83`; changed to 84 only at 5031720 | MISMATCH |
| L14 | `final/proxy.txt` (landed artifact) | `git show 86c0676:.ufo/waves/round-37/final/proxy.txt` | `PROXY: DRIFT (C2_TOTAL_DRIFT declared=83 computed=84; AXES_DRIFT 10/9)`; measured MATCH | MISMATCH |
| L15 | `final/checklists.txt` | `git show 86c0676:.ufo/waves/round-37/final/checklists.txt` | `CHECKLIST: 13/14 pass`, `VERDICT: FAIL`. Item 634 (proxy recompute) is recorded FAIL but passes; item 632 fails instead | MISMATCH |
| L16 | `final/fidelity.txt` | same path at 86c0676 | `FIDELITY_TOTAL anchors=1551 … nonok=186` | ok |
| L17 | `final/claims.txt` | same | `CLAIMS: MATCH (… sections=184 adv=4 …)` | ok |
| L18 | `final/sources.txt` | same | `SOURCES_CHECK: CLEAN (rows=32 …)` | ok |
| L19 | `.ufo/waves/round-36/evidence/remaining-scripts-census.rej.txt` | `wc -c`; `grep -c '^@@'` | 72390 bytes; 19 hunks (matches). Fleet `-.rej` absent. `cmp` against the original is not reproducible; the original is deleted | ok |

## Before → after — 39 items: 1 mismatch, 1 unverified

Command for every fidelity line: `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json`, run in clones at 91da27c6 and 86c0676.

| id | report says | observed | status |
|---|---|---|---|
| B1 | before `anchors=1574` | 91da27c6: `FIDELITY_TOTAL anchors=1574 ok=867 elsewhere=0 absent=0 dead=168 noid=539 nonok=0` | ok |
| B2 | before `nonok=0` | same line | ok |
| B3 | before `notes=20` | `FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)`. The report quotes `nonok=0` where this line has `src-rev`. Numbers match; quote form differs | ok |
| B4 | "123 previously true anchors made false" | no shipped gate emits per-anchor status; the only source is the spot-check breakdown 102+12+5+4 = 123 | unverified |
| B5 | after `anchors=1551` | 86c0676: `FIDELITY: CLEAN (notes=20 anchors=1551 src-rev=31c465f15669)` | ok |
| B6 | after `notes=20` | same | ok |
| B7–B13 | FIDELITY_TOTAL `anchors=1551 ok=675 elsewhere=169 absent=17 dead=173 noid=517 nonok=186` (7 values) | 86c0676: identical | ok |
| B14 | "186 rows … ratcheted per note" | per-note ceilings = measured nonok, 20/20 (ratchet bytes identical at 86c0676 and a5d627b) | ok |
| B15 | `CHECKLIST: 14/14 pass` | 86c0676 SCORECARD has 0 `| 37 |` rows. Item 632's command, `node scripts/round-gate.mjs` with fleet paths supplied, gives `SCORECARD_ROW_MISSING`, exit 1. Live lane at 5031720: `CHECKLIST: 13/14 pass`, `VERDICT: FAIL` | MISMATCH |
| B16–B30 | PROXY `A=7 C=14 operability=8; C1=19/19 C2=84/84 coverage=10; S=88/88; R=92/92; K=51/51; pins=6` (15 values) | 86c0676 clone: identical; live lane identical | ok |
| B31–B35 | CLAIMS `rows=19 yes=19 notes=27 sections=184 adv=4` (5 values) | identical in clone and live lane | ok |
| B36 | SOURCES `rows=32` | `rows=32 tiers=A:31,B:1,C:0 status=queued:14,mined:16,rejected:2` | ok |
| B37–B38 | f_O `21/24` | (A+C)/(A+C+3) = (7+14)/(7+14+3) | ok |
| B39 | operability integer 8 | floor(10 × 21/24) = 8; PROXY `operability=8` | ok |

## Pointers

- Resolve at 86c0676: every section-2 path exists except L7 (the round-37 SCORECARD note first appears in a5d627b).
- "Landed work `86c0676c`" is not the lane head. HEAD is now 8c41439. Nine later commits touch the lane, including the SCORECARD row 37 (5bc40d0) that the closure gate needs. None is listed in Landed changes.
- `.ufo/waves/round-37/repairs.md:5` says the D1 `git diff --stat` is "recorded in the report". The report names the command but not the output. Pointer claim is false (minor).
- Outside section 2, not counted: D1 "274 + 29 + 36 + 30 anchor replacements". The restorer is not committed. Line-aligned positional counts on equal-prose lines give 123 / 29 / 25 / 29; only sighting-wall matches. Unverified.

## Now (HEAD 8c41439) — section 2 is superseded

- FIDELITY_TOTAL: `anchors=1574 ok=702 elsewhere=169 absent=31 dead=168 noid=504 nonok=200`. Ratchet `total 200` (= sum = measured nonok, 20/20 notes).
- Superseded values (not reproduced at HEAD): L3 186→200; B5 and B7 anchors 1551→1574; B8 ok 675→702; B10 absent 17→31; B11 dead 173→168; B12 noid 517→504; B13 nonok 186→200; B14 186→200 (9 values). LOG round-37 still says `total 186` and `anchors=1551` (2 more).
- Reproduces at HEAD: CHECKLIST 14/14 PASS (live, 469500f, clean tree). `final/` receipts refreshed at 8c41439. PROXY, CLAIMS and SOURCES unchanged.
- The fleet report body still quotes 86c0676 numbers after eight errata. The errata correct the restoration and checklist claims, but section 2 was never rewritten.

## Observations for closure

1. Population change undisclosed: before 1574 vs after 1551 differ only in remaining-scripts-census (checker anchors 507 → 484). The before/after is not like-for-like at 86c0676.
2. Fidelity erratum 3 reproduces exactly: sighting-wall has 9 residual positions, and MANIFEST_SCHEMA is at base.mjs:49 where the base has :41.
3. Pairing rule: `next ?? prev` at 91da27c6 (line 300) and `prev ?? next` at 86c0676 (line 303). CLAIMS_SELFTEST 47/47 reproduces at 86c0676 and at HEAD.

## Residual risk and gaps

- The `cmp` equality of the `.rej` cannot be re-checked (source deleted). Size and hunk count reproduce.
- "123" and "274+29+36+30" are not reproducible from committed artifacts.
- The item-632 check at 86c0676 used fleet paths supplied to round-gate, because the clone has no fleet root. The count is at most 13/14.
- The lane moved during the audit. Each number is tied to the snapshot named above.

Evidence files: `/fast/scratch/kumitate-r37/Rep2/evidence/` (`B-fid-ratchet.out`, `C-fid-ratchet.out`, `H-fid-ratchet.out`, `G-fid.out`, `Rep2-pinned-86c0676-extra.txt`, and others).
