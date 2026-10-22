RESULT ReviewR39Routing rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=gaps gaps=R39-1,R39-2,R39-3,R39-4,R39-7,C2-claim

Scope: routed-defect plan review at round open. I read the round-39 spot-check (R39-1..8) and
round-39 lesson (L1-L3), the open gate and gate code, and the wave-1 reports already in
.ufo/waves/round-40/build/ (falsifier recipes, scouts, critics). I re-ran the open-state
counting commands in my own clone at f69817ed (paths under
/fast/scratch/hyaku/kumitate-r40/seats/ReviewR39Routing/). No tools installed or upgraded.

Per-defect verdicts — is the planned fix sufficient, and what must the report cite?

R39-1 (review:<seat> forge) — direction sufficient, one design choice still open. Binding a
review: entry to a committed record is the right close. The open rule variant decides which
existing entries survive: a record-only rule (anchor-reviews.json <note>#<ord> + seat + token)
keeps all 138 bound entries CLEAN; adding report-naming or report-token requirements refuses 1-2
real entries (census#100 seat L1 has no L1.md anywhere; route-probe#43 token `targets.every`
is not in Check74.md); requiring a decisions-file act refuses 4 (adds census#103, census#228).
The plan must name the variant and the disposition of those 1-4 entries before coding.
Required evidence: CritRedReviewForge recipe rerun at the measured commit — 4/4 forges REFUSED
with a finding at S8#92 (both seats, hand-written pin and --write-pin --reviews route, plus
re-pin survival), CONTROL CLEAN with counts unchanged (true=778 debt=20), the 138 bound review
entries still CLEAN, and census#269 (review:Prose03) CLEAN. Residual to name: the gate would
read the record from the same worktree the pin edit writes, so a pin+record co-edit still
forges; freezing the record digest (e.g. in the replay's input_digests) is the mitigation.

R39-2 (raw swap / reorder) — the plan's single "token-kept rule" is NOT sufficient as stated.
The falsifiers show one-axis rules are each bypassed: token comparison alone misses the
run-reorder review-swap class (tokens are kept; the lie is positional pairing in the note);
the note-pairing (pairedTrue) rule alone misses the swap class (#451's own token is also true
at :58) and misses carry mode (a review token travels with its coordinate, counts unchanged).
Strict token equality also over-refuses: census#269 (base pair -> review:Prose03, token
shortened) and the legitimate re-key H13 must stay CLEAN. The fix must compose: a base-true
identity is kept only if the matched entry is true AND its token is kept or its review source
is bound to a record AND the note's own pairing at that identity still reads true.
Required evidence: union attack set REFUSED — 4 pair swaps + 4 carry swaps (CritRedSwaps) + 5
review-swap reorders (CritRedReorder), while 450,452 stays refused and the 12 both-true swaps
stay CLEAN; benign set CLEAN — H0 prose, H13 re-key, AT25, census#269, H8 debt repair. State
the H1/H2/H5 tradeoff (re-ranging a base-true anchor is refused by design) explicitly.

R39-3 (debt headroom) — sufficient only if the rule covers new non-true identities of every
kind. A debt cap alone is bypassed: CritRedHeadroom's unchecked variant appends 2000 no-symbol
anchors and reads CLEAN (unchecked is neither debt nor true). The correct rule: any new
non-true identity (raw@path#n) absent from the frozen base is a finding. S8#99 must be
dispositioned: it has no base debt identity (round-38 re-attribution minted it), so the rule
flags it unless it is repaired first — H8 shows the repair (add `preserveToCold`) reads CLEAN.
Required evidence: replay patches census-73, all-notes-188, unchecked-2000, and round-39's
limit-debt-trade script all REFUSED at the measured commit; CONTROL CLEAN; AT25 and AT32
CLEAN; C1 59/62 with OLD_TOKEN_LOSSES 0 unchanged; S8#99 repaired (or grandfathered with a
stated reason). If the fix changes the pin schema, re-run headroom-attack.py rather than the
static patches.

R39-4 (evidence depth) — plan matches the gap, three specifics to enforce. (a) Probe v2 must
count a refusal only at exit 1 with the attack's expected finding kind; exit 2, exit 64,
crash, or preflight failure prints INVALID (round-39's probe counted any nonzero exit, so a
blanket-refuse or crashing mutant scored 0/6). Every listed attack must be ACCEPTED at open —
all are, verified this round. Carry A1-A6 as a legacy_accepted line so a fix that reopens
round-39 cannot hide. (b) Mutant ledger: open receipt exists (26 mutants, 23 killed, 3
survived: M15 group-counts-only-unchecked, M09 drops the b.t>0 guard, M14 deletes the old key
loop). MutAnchorSurvivors supplies verified fixtures AT31-AT33 that kill exactly those three
(33/33 pristine; each survivor fails only its own fixture). The re-run at the measured commit
must kill all previous 26 plus one mutant per new arm, using the Stryker vocabulary (crash is
not a kill). (c) Frozen replay: commit receipts of the round-39 recipes (floor-probe A1-A6,
swaps, reorders, headroom) against the measured commit. M14 may alternatively be deleted as
dead weight, but only with the deletion measured (AT33 first proves it live, then remove).
Required citation: probe sha256, open and measured FLOOR_PROBE2 lines, ledger table, replay
receipts.

R39-5 (cite-check guard) — SUFFICIENT, and already evidenced. ExecCiteZeroResolved's receipt
shows the red-before (mutant M1 dropping only `totals.resolved > 0` at :1590 passes 62/62 and
flips VERDICT FAIL to PASS on a scanned zero-resolved no-drift tree, including the JSON
verdict=PASS citeCheck=CLEAN exposure) and the green (two new hermetic cases, 64/64). The
process exit stays 2 via the zero-resolutions fail-closed arm, so the fixture correctly
asserts the verdict field, not the exit code. Report must cite: the receipt
(.ufo/waves/round-40/final/cite-zero-resolved-red-before.txt), the patch, and 64/64 at the
measured commit.

R39-6 (W04 correction) — SUFFICIENT as a lesson correction. Facts verified: W04 is keyed per
lane file (fleet scripts/sources-census.sh:643-645, url_seen per lane, scope-differentiated),
the duplicate is the lane's own S023 (corpus/SOURCES.md, same URL as S034, opened 2026-10-20),
and the round-39 report line to correct is fleet .ufo/reports/round-39/kumitate.md:176
("W04 is adjacency... kama and tameshi hold the same URL"). The open receipt already logs the
W04 row naming S034. Evidence to cite: those three citations plus the S034-admit omission.

R39-7 (cite-check receipt) — plan is right but the number will not be 639, and the run must
be a clean clone at the measured commit. My clean-clone run at f69817ed reads errors=660
warnings=529 files=93 (the round-39 tip claimed 639; the delta is the new spot-check lesson
itself, which quotes raw attack tokens). The round-39 claim "errors 639 → 639" had no
committed receipt at all (only 643 at 654d1b28 exists). Required evidence: the measured-commit
run committed under .ufo/waves/round-40/final/ with command, revision and full output, plus
the 639 -> 660 -> measured delta explained file by file (round-40's own new corpus files will
move it again).

R39-8 (environment) — pin move is correct and approved by ReviewPinMove (path-only change,
clone at rev, byte-identical tree to the r39 closure clone, all four gates validate), but it
lives only in the working copy at f69817ed: the committed tree still names the dead
/fast/scratch/kumitate-r36/src, so it MUST land in the measured commit or every bare run
regresses to fail-closed. Required evidence: bare (no --src) anchor-truth, proxy-check,
claims-check, surface-probe runs at the measured commit, and CHECKLIST: 15/15 (open is 8/15
with six SRC_MISSING exits plus the census item).

C2-claim (kimi re-census + README row) — the fix list is right; the CLAIM AS DECLARED is
wider than its counting command and must be re-worded. "0 AXES_DRIFT rows" is necessary but
not sufficient: CritC2Design built cosmetic mutants (axes integers lowered; stanza-only;
phantom README row; placeholder K2 heading) that reach 0 rows, and combination E8 is
byte-for-byte the same PROXY verdict as the honest shape; a crash also reads 0. Note the open
drift is 5 errors, not 2 rows (C2_TOTAL_DRIFT 88/89, K_MEMBERS_DRIFT 51/52,
COVERAGE_KIMI_DRIFT 10/9, plus the two AXES_DRIFT rows); the L1's own open receipt counted
"AXES_DRIFT rows: 3" with a bare grep (the summary line matches too) — use the anchored
`grep -c '^PROXY  error  AXES_DRIFT'`. Required evidence (the CritC2Design closure chain, all
parts): PROXY: MATCH exit 0 with C2=89/89 coverage=10, K=52/52 coverage:kimi-layer=10, pins
match; census CLEAN members=52; census selftest pass with re-pinned fixtures (the 6->7
literal change alone makes --selftest CRASH with EEXIST — a crash is not a pass; fixtures
move to 7/8-declared and skills-lane-07); stanza updates C2_total 88->89, K_members 51->52,
K_sections ->52, and the pin.kimi-census re-pin; Axes integers stay 10; README map row for
lessons/round-39-verifier-spotcheck.md owned as third-party (hyaku closure, README:63
precedent; my count: README rows 88, note files 89, no row); K2 section at internals level
quoting the skill's own bytes (2.0.26, mode 600, 19437 B, sha256 defba946..., cli-creator/ ,
operations.md divergence from the plugin's 1.11.3 copy) — a paraphrase of the existing plugin
section would be false provenance; the basename collision note and the three errata
(:271, :291, :441-442) plus stale counts (SCORECARD K2 "⇒ 26", census header, Axes kimi
evidence). Headings must use the full skills/kimi-webbridge path or K_SECTION_AMBIGUOUS fires.

Operator teaching check: corpus/lessons/ holds no operator-*.md file (glob: none). The
operator's channel this round is considerthese/2026-10-22.md (lane commit 3a81b7c). Teaching
not yet reflected in the plan: (1) the true-count reconciliation question (778 per the
floor-probe universe vs the 628 per-note sums) was asked of the round-39 closure and remains
unanswered — the round-40 report must state the universe beside every true-count it cites;
(2) author-date hygiene (4e34c35 reused a 2026-10-21 author date) — round-40 commits should
carry fresh author dates, checkable at closure; (3) outsider reproducibility — receipts that
name /fast/scratch/hyaku/kumitate-pin/src should also name the origin.json recreate line.

Residual risks and verification gaps: CritClaimSizing's M1-M6 (SCORECARD/SHONEN statements
that disagree with commands, e.g. the operability row's stale "20/23 ... 7 more" and
"round 35" last-change cell) are outside the routed plan; the round touches SCORECARD anyway,
so disclose or fix them rather than leave a calibration exposure. The C2 claim is mislabeled
if called lane calibration — it measures Axes-integer drift only. ScoutReviewRecords'
non-repudiation gap (record editable beside the pin) is unresolved by design this round; name
it. My own runs used the pinned clone only; the bare-gate checklist value at the measured
commit is unverified until the origin.json change lands.

Evidence (commands and outputs, my clone at f69817ed unless noted):
1 git clone --no-hardlinks <lane> .../ReviewR39Routing/lane && checkout f69817edf687... -> HEAD f69817edf687c8ce4f87ed7953a353399232f69e
2 node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src | grep -E 'AXES_DRIFT|PROXY'
  -> 2 AXES_DRIFT rows (coverage 10/9, coverage:kimi-layer 10/9) + C2_TOTAL_DRIFT 88/89 + K_MEMBERS_DRIFT 51/52 + COVERAGE_KIMI_DRIFT 10/9 + 2 PIN_UNPINNED; PROXY: DRIFT exit 1
3 node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9  (bare)
  -> TRUTH: FAIL-CLOSED (SRC_MISSING /fast/scratch/kumitate-r36/src) exit 2  (R39-8 open state)
4 node scripts/anchor-truth.mjs --base e18ff1af... --src /fast/scratch/hyaku/kumitate-pin/src
  -> TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af... src-rev=31c465f15669) exit 0
5 node scripts/anchor-truth.mjs --selftest -> ANCHOR_TRUTH_SELFTEST: 30/30 pass, VERDICT: PASS
6 node scripts/cite-check.mjs --selftest -> 62/62 cases passed (hermetic), VERDICT: PASS
7 node scripts/cite-check.mjs --src <pin> (clean clone) -> VERDICT: FAIL, CITE_CHECK: DRIFT (files=93 tokens=9089 errors=660 warnings=529)
8 red-before mutant (drop `totals.resolved > 0` at scripts/cite-check.mjs:1590, reverted after):
  selftest 62/62 pass (survived); zero-resolved warn-only fixture: pristine VERDICT: FAIL -> mutant VERDICT: PASS, exit 2 both (fail-closed arm)
9 git show f69817ed:.ufo/pins/origin.json -> clone /fast/scratch/kumitate-r36/src (old); working copy -> /fast/scratch/hyaku/kumitate-pin/src (moved, uncommitted)
10 node scripts/kimi-census.mjs verify -> UNLISTED skills/ "7 children, 6 declared", TOTALS members=52, KIMI_CENSUS: DRIFT
11 grep -c '^| `\(knowledge\|lessons\)/' corpus/README.md -> 88; find corpus/{knowledge,lessons} -name '*.md' | wc -l -> 89; grep round-39-verifier-spotcheck corpus/README.md -> no row
12 glob corpus/lessons/operator-*.md -> no files
13 .ufo/waves/round-40/open/receipts.txt: W04 row `S034 duplicate url stryker-mutator.io/... across scopes`; `AXES_DRIFT rows: 3` (bare grep); CHECKLIST: 8/15; cite-check receipt errors=660
14 fleet .ufo/reports/round-39/kumitate.md:152 `cite-check: errors 639 → 639`; :176 `W04 is adjacency... kama and tameshi hold the same URL`
15 fleet scripts/sources-census.sh:643-645 -> W04 keyed on `url_seen` per lane with scope check (duplicate is same-lane S023/S034)
16 .ufo/waves/round-40/final/cite-zero-resolved-red-before.txt: M1 62/62 SURVIVED; fixture FAIL->PASS flip incl. JSON verdict=PASS citeCheck=CLEAN; green 64/64 with 2 new cases
17 .ufo/waves/round-40/final/mutants-open.txt: mutants=26 killed=23 survived=3 (M15, M09, M14), runtimeError=0
18 .ufo/waves/round-40/build/MutAnchorSurvivors.md: AT31-AT33 verified — pristine 33/33; M15 fails AT31, M09 fails AT32, M14 fails AT33; patch applies clean
19 .ufo/waves/round-40/build/CritRedReviewForge.md: 4/4 forges ACCEPTED at open (review:NoSuchSeat and review:Prose01 on S8#92, hand-written and --reviews routes, re-pin survival); anchor-reviews.json has 138 keys, none #92
20 .ufo/waves/round-40/build/ScoutReviewRecords.md: 138 review entries, 138 bound by record, 0 unbound; stricter variants refuse 1/2/4 real entries (L1#100, route-probe#43, census#103, census#228); record absent at base e18ff1af; record not digest-pinned
21 .ufo/waves/round-40/build/CritRedSwaps.md: 4/4 swaps ACCEPTED at open (451/453/454/455 with 456); carry variant 4/4 ACCEPTED with counts unchanged; 450,452 refused; ords 451-455 now true via review tokens
22 .ufo/waves/round-40/build/CritRedReorder.md: 5/5 review-swap reorders ACCEPTED at open; same patches with source `pair` REFUSED (TOKEN_FORGED); seat in no record
23 .ufo/waves/round-40/build/CritRedHeadroom.md: 188/196 accepted (census 73, route 58, wall 22, native 35); unchecked census=2000 CLEAN (unbounded); limit-debt-trade S8#99 CLEAN; committed-tree replays match
24 .ufo/waves/round-40/build/ScoutDebtIdentity.md: 19/20 debt identities map to base debt; S8#99 unmapped (round-38 re-attribution); headroom table 208 base -> 20 open
25 .ufo/waves/round-40/build/CritOperabilityCost.md: honest_clean=9/17; H1/H2/H5 (re-range base-true) refused at open; H3r/H4r/H7/H8/H9/H10r/H12/H13 CLEAN; H11 shows --write-pin --notes <one> drops other notes
26 .ufo/waves/round-40/build/CritC2Design.md: 5 cosmetic paths reach 0 AXES_DRIFT (E1, E2, E4/E4b, E7, E5/E6, E8 == honest verdict bytes); census literal-only change crashes --selftest (EEXIST); closure command chain given
27 .ufo/waves/round-40/build/CritClaimSizing.md: counting command necessary-not-sufficient (crash 0, downgrade 0, placeholder MATCH 0); proposed C1/C2 sentences; 6 SCORECARD/SHONEN mismatches M1-M6 listed
28 .ufo/waves/round-40/build/ScoutKimiWebbridge.md: seventh child is a new member (distinct inodes, 2.0.26 vs plugin 1.11.3); full census/SCORECARD/note change list; collision erratum required
29 .ufo/waves/round-40/build/ReviewPinMove.md: pin move approved (path-only, clone at 31c465f1, tree sha256 0ebe866a... identical to r39 closure clone; bare runs pass on all four gates with the working-copy pin)
30 considerthese/2026-10-22.md (lane commit 3a81b7c): true-count 777-vs-628 question; reused author date on 4e34c35; path-dependency disclosure duty
31 round-39 lesson L1-L3 and round-39-verifier-spotcheck.md R39-1..R39-8: as declared; S8#456 `hatch` true at base; 5/20 reorders at the r39 candidate
32 Routed-fix target check: scripts/anchor-truth.mjs:284-288 overrideValid (no record read), :306 review check, :309-311 TOKEN_FORGED, :343 DEBT_GREW per-note vs base, :352-381 identity+group floor, :430 pin schema accepts any review:<seat>
33 tools installed or upgraded: none; all runs read-only; lane writes limited to this report
