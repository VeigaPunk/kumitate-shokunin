# Recurrence Count Ledger & Analysis (Rounds 40–63 and Aggregator Audits)

**Seat:** `K64ConnRecurrenceCount` (kumitate round 64, wave w1)  
**Task:** Recurrence count (considerthese idea 4): count each routed-defect class across spot-check files (rounds 40–63) and round-N-aggregator files, determine whether a gate was added after the 3rd occurrence, distinguish mechanical gates from prose-only rules, and perform a deep-dive investigation into the R56-V3 readme-map drift.  
**Date:** 2026-10-25  

---

## 1. Executive Summary & Methodology

In `considerthese/2026-10-25.md`, Proposal 4 states:
> *"Count recurrences. Keep a running count of each routed defect class (the R56-V3 map drift is at seven). When a class passes three, propose a structural fix instead of another routed item."*

To ground this policy in complete empirical evidence, this study extracts and classifies every routed defect from:
1. All 24 post-round verifier spot-checks in `corpus/lessons/round-40-verifier-spotcheck.md` through `round-63-verifier-spotcheck.md`.
2. All 7 aggregator corpus audit and mirror files (`round-1-aggregator-audit.md`, `round-4-aggregator-audit.md`, `round-5-aggregator-audit.md`, `round-5-aggregator-mirror-out-of-province-membrane-seal.md`, `round-6-aggregator-audit.md`, `round-8-aggregator-box3-coldrun.md`, `round-9-aggregator-corpus-verdict.md`).

A total of 130 defect items across these files were analyzed and clustered into 12 distinct defect classes. Of these 12 classes:
- **11 classes meet or exceed the 3-occurrence threshold ($\ge 3$).**
- Only **1 class** (`placeholder in filed report`) has fewer than 3 occurrences (2 rounds: R60, R61).
- Out of the 11 recurring classes, only **2** currently possess comprehensive mechanical gates (`map drift` via `readme-map.mjs`, and in Round 64 `number drift between report and receipt` via `report-receipt-diff.mjs`). Two others possess partial/warning-only checkers (`registry gap` via `proxy-check.mjs`, `duplicate-URL warnings` via `sources-census.sh validate`). The remaining **7 recurring classes remain purely prose-only**, demonstrating that without a mandatory mechanical gate policy at $N=3$, defect classes routinely recur 4 to 13 times.

---

## 2. Recurrence Analysis Master Table

| Defect Class Label | Rounds Occurred | Total Times | $\ge 3$ Occurrences? | Gate Added After 3rd Occurrence? | Gate Type / Enforcement Mechanism |
|---|---|:---:|:---:|:---:|---|
| **map drift** (unmapped corpus file in README / unpinned) | Agg-r4, Agg-r5, Agg-r6, R40, R44, R52, R53, R54, R55, R56, R57, R58, R60, R61, R63, R64-base | 16 | **YES** | **YES** (Round 57 capability acquisition: `scripts/readme-map.mjs`; v2 in R58; Q60 in R64) | **Mechanical gate:** `scripts/readme-map.mjs` (contract `kumitate-readme-map-v1/v2`; exits 1 `DRIFT uncovered/unpinned`); previously `proxy-check` C2_total |
| **number drift between report and receipt** | Agg-r1, Agg-r6, Agg-r8, R46, R47, R50, R52, R55, R58, R60, R63 | 11 | **YES** | **NO** (Prose-only across 11 rounds until Round 64 Claim C1) | **Mechanical gate added in R64:** `scripts/report-receipt-diff.mjs` (`TALLY_UNRECEIPTED`). Prior to R64: prose-only |
| **count in prose without receipt** (unreceipted claims / missing artifacts) | Agg-r1, Agg-r5, Agg-r6, Agg-r8, R40, R42, R47, R48, R49, R51, R54, R60, R63 | 13 | **YES** | **NO** (Prose-only across 13 rounds until Round 64 Claim C1) | **Mechanical gate added in R64:** `scripts/report-receipt-diff.mjs` (`RECEIPT_MISSING`, `TALLY_UNRECEIPTED`). Prior to R64: prose-only (CORPUS rule 4, QUALITY Q47) |
| **counter forgeable** (vacuous / gameable / unhardened probe) | R41, R42, R43, R44, R47, R57, R61, R62, R63 | 9 | **YES** | **PARTIAL** (No universal gate; round-specific negative controls / mutant suites added ad-hoc) | **Partially mechanical / Adversarial:** Round probe negative controls (e.g. `receipt64-probe.mjs` P4 stub check; `controls/receipt/` cases); no universal static validator |
| **dead seats unreported / unreplaced** (wave seat loss) | R41, R44, R59, R60, R61, R62, R63 | 7 | **YES** | **NO** (Prose-only across 7 rounds) | **Prose-only:** Report contract rule and QUALITY Q58 (report must name every dead seat with last error text); launcher progress lacks automatic fail-closed gate |
| **duplicate-URL registry warnings (W04)** | R56, R57, R59, R60, R61, R62, R63, R64-base | 8 | **YES** | **NO** (Checker exists but emits non-blocking warnings) | **Prose-only in enforcement:** `sources-census.sh validate` emits W04 warnings but exits 0 (`ok`); non-blocking, so debt accumulates across rounds |
| **seat-mix below line** (model mix / role floor unmet / overstatement) | R40, R41, R56, R58, R60, R63 | 6 | **YES** | **NO** (Prose-only across 6 rounds) | **Prose-only:** Pre-dispatch planning guidelines; report shape deviations recorded retrospectively |
| **registry gap / unpinned gate** | Agg-r6, R40, R41, R48, R58, R61 | 6 | **YES** | **PARTIAL** (Gate pins checked; SKILL registry table un-gated) | **Partially mechanical:** `scripts/proxy-check.mjs` enforces `GATE_PINS` (`PIN_UNPINNED`), but `SKILL.md ## Gate registry` table synchronization remains prose-only |
| **filed-bytes edited in place** (append-only rule breach) | Agg-r6, R46, R57, R61 | 4 | **YES** | **NO** (Prose-only across 4 rounds) | **Prose-only:** CORPUS rule 2 / rule 9, QUALITY Q52; no git pre-commit hook preventing mutations to historical lesson/report/SOURCES rows |
| **uncommitted round work at close** (dirty tree / leftovers) | R42, R48, R50, R60 | 4 | **YES** | **NO** (Prose-only across 4 rounds) | **Prose-only:** QUALITY Q27, L1 status census, post-hoc orchestrator sweeps; no automated gate aborting close if git working tree is dirty |
| **unresolvable hash / ref** (scratch commit / dead sha / unresolvable rev) | Agg-r4, R46, R61, R63 | 4 | **YES** | **NO** (Prose-only across 4 rounds until Round 64 Claim C1) | **Mechanical gate added in R64:** `scripts/report-receipt-diff.mjs` (`HASH_DEAD`, `HASH_ORPHAN`). Prior to R64: prose-only |
| **placeholder in filed report** (`__TOKEN__`, `LANE_HASH`, `TBD`) | R60, R61 | 2 | **NO** | **N/A** (< 3 occurrences: 2 rounds) | **Mechanical gate added in R64:** `scripts/report-receipt-diff.mjs` (`PLACEHOLDER` regex check). Catches template tokens mechanically |

---

## 3. Detailed Catalog of Extracted Routed Defects

### Rounds 40–63 (from `corpus/lessons/round-*-verifier-spotcheck.md`)

- **Round 40:**
  - `R40-1 (registry)`: Add `--open REV` to the SKILL.md gate-registry `anchor-truth` row $\rightarrow$ **registry gap / unpinned gate**.
  - `R40-2 (honest-edit coverage)`: Re-measure 17 honest recipes; record in-round honest review refusal under `--open` $\rightarrow$ **open limit / coverage gap**.
  - `R40-3 (receipt)`: Commit a fleet cite-check receipt at tip for the 511 value $\rightarrow$ **count in prose without receipt**.
  - `R40-4 (sentinel)`: Cap `anchor-reviews.json` registries read under `--open`, size-check open pin $\rightarrow$ **unbounded input / resource limit**.
  - `R40-5 (sources linkage)`: Name S035 in K2 section of `kimi-skills-plugins.md` $\rightarrow$ **unlinked source reference**.
  - `R40-6 (calibration slip)`: Seat-gate item 4 says 4 mutation-testers, but 3 dispatched $\rightarrow$ **seat-mix below line**.
  - `R40-7 (recurring proxy drift)`: Spot-check file adds note without README row; C2_total reads 91 vs 90 $\rightarrow$ **map drift**.

- **Round 41:**
  - `R41-1`: No reject in `## Gate` recorded with reasons $\rightarrow$ **lesson format / missing gate section**.
  - `R41-2`: Proxy `PIN_UNPINNED scripts/wave-census.mjs` $\rightarrow$ **registry gap / unpinned gate**.
  - `R41-3`: Cite-check guard outer-marker recursion, skip-bypass mutants survive $\rightarrow$ **counter forgeable**.
  - `R41-4`: Report per-axis verdicts by axis, not per claim $\rightarrow$ **report format / verdict keying**.
  - `R41-5`: Section 3 floor unmet in wave 1; undeclared falsify wave without build wave $\rightarrow$ **seat-mix below line**.
  - `R41-6`: Carried open limits (R40-2, R40-4, census findings, sentinels) $\rightarrow$ **carried limits / open limits**.
  - `R41-7`: Receipt says over master `fae386aa` while measuring `fb7046ca` $\rightarrow$ **receipt commit mismatch**.

- **Round 42:**
  - `D1`: Three delivered falsify reports untracked in lane $\rightarrow$ **uncommitted round work at close**.
  - `D2`: C1 kill rule stated three different ways; "written before counted run" untrue $\rightarrow$ **kill rule inconsistency / timing claim false**.
  - `D3`: Operability proxy counter-blind (counts runnable files, not pass sensitivity) $\rightarrow$ **counter-blind proxy**.
  - `D4`: `gate-mutants.mjs` hard-codes scratch path to seat dir; isolation mutants survive $\rightarrow$ **hardcoded scratch path / isolation leakage**.
  - `D5`: Commit same-sha before receipt for cite-check errors/warnings or retract $\rightarrow$ **count in prose without receipt**.
  - `D6`: `kumitate-gate-pins-v1` prefix head match, fail-open when absent $\rightarrow$ **gate fail-open flaw**.
  - `D7`: C2 instrument gaps: `locks/` mode floor accepts 0777, owner unpinned, `locks/sessions` ungated $\rightarrow$ **counter forgeable**.
  - `D8`: Wave-census canonical-path refusal lacks red-before case $\rightarrow$ **missing red-before control**.

- **Round 43:**
  - `R43-1`: C1 counter gameable before data; Route A met K43+A1 before measured run $\rightarrow$ **counter forgeable**.
  - `R43-2`: A1 "before any measured run" holds only for integrated commit; seat runs preceded it $\rightarrow$ **timing claim false / chronology inaccuracy**.
  - `R43-3`: Measured != shipped; commit receipt over shipped bytes or record gap $\rightarrow$ **measured != shipped**.
  - `R43-4`: Capability row `gate-mutants` stands on unverified evidence $\rightarrow$ **capability row unverified**.
  - `R43-5`: Witness single points: WA/WB/WC survive K43; accepts PASS + FAIL $\rightarrow$ **counter forgeable**.
  - `R43-6`: Receipts must name earlier runs on same bytes; report minors $\rightarrow$ **receipt lineage incomplete**.

- **Round 44:**
  - `R44-1`: Counter memorisable; p44d CLEAN shapes few and enumerable $\rightarrow$ **counter forgeable**.
  - `R44-2`: Provenance statements false ("still no census scored", "ZERO frozen runs") $\rightarrow$ **provenance statement false**.
  - `R44-3`: Counter sandbox leaks: bwrap PID 1 environ carries launcher environ; proc/memory leaks $\rightarrow$ **counter sandbox leak**.
  - `R44-4`: Owed review: 19 cancelled seats left findings absent; mutants survive $\rightarrow$ **dead seats unreported / unreplaced**.
  - `R44-5`: Proxy A counts throwaway round probes, inflating score $\rightarrow$ **metric inflation / proxy probe counting**.
  - `R44-6`: Record minors: move log order, C2 prose vs stanza mismatch, S059 body pin unreproducible $\rightarrow$ **number drift between report and receipt**.

- **Round 45:**
  - `D1`: Plan cites uncommitted attempt-1 receipt `build/CritRoundShape.md` $\rightarrow$ **unresolvable reference**.
  - `D2`: K3/K3' carry no erratum clause, yet report reads failures as corrected by errata $\rightarrow$ **erratum clause missing**.
  - `D3`: S076 reject reason contradicts S063 admit $\rightarrow$ **self-contradiction / reject reason invalid**.
  - `D4`: Guard tested in one form prescribed in another (X4), failed ablation $\rightarrow$ **tested != prescribed**.

- **Round 46:**
  - `R46-1`: 13 SOURCES rows rewritten in place instead of `supersedes` rows $\rightarrow$ **filed-bytes edited in place**.
  - `R46-2`: Count defects in filed report: 15 vs 13 rows; 3 of 4 vs 4 of 4; open census W04 count $\rightarrow$ **number drift between report and receipt**.
  - `R46-3`: Gate-mutants item 697 load-sensitive; receipts omit stdout/load/wall time $\rightarrow$ **load-sensitive test / incomplete receipt**.
  - `R46-4`: Unresolvable control commits: 7af3d978 etc. exist only in scratch clones $\rightarrow$ **unresolvable hash**.
  - `R46-5`: Verdict-flush race at `cap-run.mjs:182-183`, budget regex rejecting decimals $\rightarrow$ **race condition / regex bug**.

- **Round 47:**
  - `R47-1`: C1 decided by IRC quotes from cancelled seats; no committed receipts $\rightarrow$ **count in prose without receipt**.
  - `R47-2`: Misstatements in report & SCORECARD: "all read 0/5" vs 3/5 and 1/5; "all 16 re-opened" vs 3 lack reports $\rightarrow$ **number drift between report and receipt**.
  - `R47-3`: Future-dated amendment headings (plan headings later than commit timestamps) $\rightarrow$ **chronology inaccuracy**.
  - `R47-4`: Harm unprobed: no checklist run at judged commit; cancelled seats $\rightarrow$ **unprobed harm**.
  - `R47-5`: Counter observation gap: A2 scores ROUTED_HELD with $n < base_n$ $\rightarrow$ **counter forgeable**.

- **Round 48:**
  - Item 1: 5 uncommitted leftover paths at close $\rightarrow$ **uncommitted round work at close**.
  - Item 2: Registry gap: `counter-rerun` has no row in SKILL.md gate registry $\rightarrow$ **registry gap / unpinned gate**.
  - Item 3: LOG.md wording: "two mistakes" vs four mined $\rightarrow$ **number drift between report and receipt**.
  - Item 4: Minor timestamp imprecision in report (18:52Z vs 19:01:13Z) $\rightarrow$ **chronology inaccuracy**.
  - Item 5: Leak-delta evidence completeness: one-line `leak-delta=13` vs claimed quiet-host delta 0 $\rightarrow$ **count in prose without receipt**.

- **Round 49:**
  - Item 1: Report landed before its last commits (report-last ordering); stale tallies against tip $\rightarrow$ **report-last ordering**.
  - Item 2: No `## Gate` section in `corpus/lessons/round-49.md` $\rightarrow$ **lesson format / missing gate section**.
  - Item 3: S095/S098 "re-opened" has no committed receipt $\rightarrow$ **count in prose without receipt**.
  - Item 4: C1 "three time-spaced runs" is one sha256 in one commit $\rightarrow$ **count in prose without receipt**.
  - Item 5: Correction sweep incomplete: SKILL.md contradictory gate counts (11 vs 12) $\rightarrow$ **self-contradiction / incomplete sweep**.
  - Item 6: Wave claims without committed receipt (validator exit 0 and slot granted) $\rightarrow$ **count in prose without receipt**.

- **Round 50:**
  - `R51-1`: Sweep-attribution: L1 returned without committing; receipts swept by orchestrator $\rightarrow$ **uncommitted round work at close**.
  - `R51-2`: Terms-line precision / explanation drift: wrong parenthetical justification for stanza deltas $\rightarrow$ **number drift between report and receipt**.
  - `R51-3`: L0 citation style: cited line number instead of lane + round + opening words $\rightarrow$ **citation style format**.
  - `R51-4`: Repair-counter shape: reads live fleet/lane state instead of pinned snapshot $\rightarrow$ **counter reads live state**.

- **Round 51:**
  - `R52-11`: Missing receipt at measured close revision; C1 after-citation has no file at close commit $\rightarrow$ **count in prose without receipt**.

- **Round 52:**
  - `R53-1`: SCORECARD prose inconsistency: says "D51 5/5 at R2", receipt reads 4/5 $\rightarrow$ **number drift between report and receipt**.
  - `R53-2`: Seat accounting: report says "all other 63 seats returned", w1 holds 62 reports $\rightarrow$ **seat accounting discrepancy**.

- **Round 53:**
  - Item 1: Lesson `## Gate` spot-check line still `<pending>` in committed bytes $\rightarrow$ **placeholder in filed lesson**.

- **Round 54:**
  - `R54-C1`: S108 rejection rests on source bytes never committed; reviewer artifact missing $\rightarrow$ **count in prose without receipt**.

- **Round 55:**
  - `R55-V1`: Report "Landed changes" omitted two trailing bookkeeping commits $\rightarrow$ **report omission**.
  - `R55-V2`: SOURCES tier count `B=9→10` in report/LOG/lesson vs measured `B=9→11` $\rightarrow$ **number drift between report and receipt**.

- **Round 56:**
  - `R56-V1`: L2 floor unmet (prepared-but-undispatched wave) $\rightarrow$ **seat-mix below line**.
  - `R56-V2`: Stale frozen rules A54/A55 (exactly-24/25 literals) $\rightarrow$ **stale frozen literal**.
  - `R56-V3`: Spot-check artifact lands without `corpus/README.md` map row $\rightarrow$ **map drift**.

- **Round 57:**
  - Item 1: Double-live L1 orchestration defect $\rightarrow$ **orchestration defect**.
  - Item 2: Filed report `7c3d1203` rewritten in place by `8e43dbcd` instead of appending erratum $\rightarrow$ **filed-bytes edited in place**.
  - `R57-V1..V4`: Dead nonce pathspec, drop-one held=9/9 acceptance, name-only covered members, forged receipt replay $\rightarrow$ **counter forgeable**.

- **Round 58:**
  - `R58-V1`: C2 base counter misreported as held=0/5 (receipt & re-run read held=2/5) $\rightarrow$ **number drift between report and receipt**.
  - `R58-V2`: "Seats spawned: 64/64" overstates dispatch (35 reports, 29 never spawned) $\rightarrow$ **seat-mix below line / number drift**.
  - `R58-V3`: README cites S121, not in SOURCES.md (another lane's id) $\rightarrow$ **unresolvable reference**.
  - `R58-V4`: Tier counts wrong: report says 96→99 A vs census reads 99→102 A $\rightarrow$ **number drift between report and receipt**.
  - `R58-V5`: SKILL says 17 are gates while 18 table rows exist $\rightarrow$ **self-contradiction / count discrepancy**.
  - `R58-V6`: SCORECARD capabilities table gained no receipt-evidence row; readme-map row stale $\rightarrow$ **capability row missing / stale**.
  - `R58-V7`: Spot-check file lands without README row or readme-map pin $\rightarrow$ **map drift**.
  - `R58-V8`: Reject reason wording calls shared page duplicate $\rightarrow$ **wording precision**.

- **Round 59:**
  - No new lane-owned defect routed. Orchestrator: `inline.sh dispatch` omitted.

- **Round 60:**
  - `R60-V1`: Uncommitted round work: 6 modified files, 7 untracked wave evidence paths $\rightarrow$ **uncommitted round work at close**.
  - `R60-V2`: Placeholders filed in fleet report (`__TIP__`, `__MEASURED__`, `__COMMITS__`) $\rightarrow$ **placeholder in filed report**.
  - `R60-V3`: Report 9/10 contradicts receipt 8/10 $\rightarrow$ **number drift between report and receipt**.
  - `R60-V4`: Nonexistent evidence files cited (`dispatch60-tip.txt`, `doctrine60-tip.txt`) $\rightarrow$ **count in prose without receipt**.
  - `R60-V5`: Dispatch registry not in gate's schema $\rightarrow$ **schema mismatch**.
  - `R60-V6`: Dead seats unreported: 27/32 exit=-9 session=null, ValueError traceback $\rightarrow$ **dead seats unreported / unreplaced**.
  - `R60-V7`: LOG tie unsupported at tip (LOG entry uncommitted) $\rightarrow$ **uncommitted round work at close**.
  - `R60-V8`: Corpus map drift (sixth recurrence of R56-V3 / R58-V7) $\rightarrow$ **map drift**.
  - `R60-V9`: Reject reason cites wrong snapshot id (S141 vs S211) $\rightarrow$ **unresolvable reference**.

- **Round 61:**
  - `R61-V1`: Falsifier fixtures live only in tmpfs (`/tmp/kumitate-r61*`) $\rightarrow$ **unresolvable hash / uncommitted evidence in tmpfs**.
  - `R61-V2`: Frozen counters admit fabrication and reject honest work (worktree reads, substring match, file counts) $\rightarrow$ **counter forgeable**.
  - `R61-V3`: In-place edits to filed bytes in `165b830` (`round-60.md` A=102→104, SCORECARD row gained "first working round 60") $\rightarrow$ **filed-bytes edited in place**.
  - `R61-V4`: R60 fleet-report placeholders persisted $\rightarrow$ **placeholder in filed report**.
  - `R61-V5`: Proxy DRIFT and unpinned tool `make-dispatch-actual`; 7th recurrence of R56-V3 $\rightarrow$ **map drift** & **registry gap / unpinned gate**.
  - `R61-V6`: Dead seat `Audit19` invalid_prompt stayed unattacked $\rightarrow$ **dead seats unreported / unreplaced**.

- **Round 62:**
  - `R62-1`: Claims undeclared / uncommitted before evidence seats run $\rightarrow$ **claims undeclared before evidence**.
  - `R62-2`: Unvalidated waves: 5 batches, 96 seats without validator bridge proof $\rightarrow$ **unvalidated waves**.
  - `R62-3` (carried R61-V2): Probes accept fabrication (4th consecutive round) $\rightarrow$ **counter forgeable**.
  - `R62-4` (Audit19 residuals): `RevS126Quote` committed for seat that never ran (exit=-9) $\rightarrow$ **dead seats unreported / unreplaced**.
  - `R62-5`: Six pre-existing W04 duplicate-URL registry warnings persist $\rightarrow$ **duplicate-URL registry warnings (W04)**.

- **Round 63:**
  - `D1`: 10th recurrence of R56-V3 map drift (spotcheck file lands without README row) $\rightarrow$ **map drift**.
  - `D2`: Commit transcript of `inline-dispatch-evidence --selftest`; 69/69 is prose only $\rightarrow$ **count in prose without receipt**.
  - `D3`: Correct report/lesson count of w2 collisions (3 -2 stems, report says 1) $\rightarrow$ **number drift between report and receipt**.
  - `D4`: `K_members` 52→49 masks four missing kimi-root members $\rightarrow$ **proxy masking defects**.
  - `D5`: Carried Audit19 residuals, Q51 hash `9237a72` resolves nowhere, six W04 warnings, counter holes $\rightarrow$ **unresolvable hash**, **duplicate-URL registry warnings (W04)**, **counter forgeable**.
  - `D6`: m_flash share 44.3% < 50% line; seat band missed by one $\rightarrow$ **seat-mix below line**.

---

### Aggregator Corpus Audits & Mirrors

- **round-1-aggregator-audit.md:**
  - Defect 1: "128 swarm lanes" false attribution to installed skill $\rightarrow$ **false attribution / pointer falsified**.
  - Defect 2: Stale inventory counts (`scripts/` 74 vs 82, `ufo-sighting-lib/` 25 vs 26) $\rightarrow$ **number drift between report and receipt**.
  - Defect 3: Unverifiable proportion ("~80% of SKILL.md content") $\rightarrow$ **count in prose without receipt**.
  - Defect 4: Counting convention undocumented (.rs files 93 vs 102) $\rightarrow$ **undocumented counting convention**.

- **round-4-aggregator-audit.md:**
  - Minor 1: `loop-driver.md` line citations far off (:97 vs :319, :347 vs :556) $\rightarrow$ **line citation drift**.
  - Minor 2: `failure-telemetry.md` still cites `classify_failure` vs `classify_failure_fields` $\rightarrow$ **self-contradiction / stale symbol**.
  - Minor 3: `README.md` has no row for `lessons/round-4.md` $\rightarrow$ **map drift**.
  - Minor 4: `lessons/round-4.md` cites commit as "round-4" (git rev-parse fails) $\rightarrow$ **unresolvable hash / ref**.
  - Carried 1: `lessons/round-1.md` false 128 attribution persists $\rightarrow$ **filed-bytes uncorrected**.

- **round-5-aggregator-audit.md:**
  - Adjudication 1: No SHONEN section in round-5 report $\rightarrow$ **report conformance / section missing**.
  - Adjudication 2: README lacks `lessons/round-4.md` row $\rightarrow$ **map drift**.
  - Minor 3: `queue-and-claim.md` counter-legend range starts 4–5 lines early $\rightarrow$ **line citation drift**.
  - Minor 4: `native-trial-launch.md` `membraneSealState` cited :1870-1892; def is :1862 $\rightarrow$ **line citation drift**.
  - Minor 5: `queue-and-claim.md` sweep command unprinted $\rightarrow$ **count in prose without receipt / unprinted command**.
  - Minor 6: `/tmp/clap-probe` durability (target/ absent, parse-fail exists only in report quote) $\rightarrow$ **count in prose without receipt / throwaway probe**.

- **round-5-aggregator-mirror-out-of-province-membrane-seal.md:**
  - Cross-province defect: `sealBoundaryViaRuntime` argv `"membrane-seal", "write"` fails against clap flat struct $\rightarrow$ **CLI argv mismatch**.

- **round-6-aggregator-audit.md:**
  - Defect 1: 128 false attribution 4 refreshes old $\rightarrow$ **false attribution / pointer falsified**.
  - Defect 2: Corpus contradicts itself on classifier symbol (`classify_failure` vs `classify_failure_fields`) $\rightarrow$ **self-contradiction / stale symbol**.
  - Defect 3: Three falsified line pointers for `GateDecision` (`gate.rs:11` vs `:15`) $\rightarrow$ **line citation drift**.
  - Defect 4: Index is not a claim about the tree it ships with (README carries 16 knowledge and 4 lessons rows vs 21 and 9 files) $\rightarrow$ **map drift**.
  - Defect 5: Committed corpus notes cite session-scoped pointers (`local://kumitate-r6-*.md` unreadable in fresh session) $\rightarrow$ **unresolvable session pointer**.
  - Defect 6: Commit identity off-invariant on 11/11 commits $\rightarrow$ **git identity off-invariant**.
  - Defect 7: In-flight rewrite of `corpus/lessons/round-5-aggregator-audit.md` $\rightarrow$ **filed-bytes edited in place**.
  - Defect 8: Counts without commands / falsified count in SCORECARD (113=72+41 vs 42; charter-scribe 5 vs 6) $\rightarrow$ **number drift between report and receipt** & **count in prose without receipt**.
  - Defect 9: Cross-lane calibration numbers in SCORECARD not re-derived (kake 6 vs 8, kagi 11 vs 13) $\rightarrow$ **number drift between report and receipt**.
  - Defect 10: `~80% of SKILL.md content` proportion with no measure $\rightarrow$ **count in prose without receipt**.
  - Defect 11: SHONEN heading absent in r5, r6, r7 reports $\rightarrow$ **report conformance / section missing**.

- **round-8-aggregator-box3-coldrun.md:**
  - Break 1: `proxy-check.mjs` exits 1 `PROXY: DRIFT (A_DRIFT term=A declared=4 computed=5)` $\rightarrow$ **proxy drift**.
  - Break 2: `cite-check` errors=6 vs SKILL.md live claim "errors=2" $\rightarrow$ **number drift between report and receipt**.
  - Break 3: `--integrations` advertised in SKILL.md does not exist in `round-gate.mjs` (exit 64) $\rightarrow$ **missing CLI flag / doc drift**.
  - Break 4: `sighting-wall.md` "(26 files, 10.6k lines)" unverifiable as written $\rightarrow$ **count in prose without receipt**.

- **round-9-aggregator-corpus-verdict.md:**
  - Rules 1, 2, 4, 6, 7, 9 failed. Rule 8 FAIL-literal: `op://` placeholder in `round-5-aggregator-audit.md:79` $\rightarrow$ **placeholder / forbidden path literal**.

---

## 4. Deep-Dive on Defect Classes with $\ge 3$ Occurrences

### 4.1 Map Drift (16 Rounds, $\ge 3$: YES)
- **Rounds:** Agg-r4, Agg-r5, Agg-r6, R40, R44, R52, R53, R54, R55, R56, R57, R58, R60, R61, R63, R64-base.
- **Root Cause:** Verifiers or integrators commit new files (particularly post-close spot-checks) into `corpus/lessons/` or `corpus/knowledge/` without simultaneously adding a row in `corpus/README.md` or pinning them in `.ufo/pins/readme-map.json`.
- **Gate Added after 3rd Occurrence?** Yes. In Round 57, kumitate acquired `scripts/readme-map.mjs` (contract `kumitate-readme-map-v1`) as a counted capability, promoted to v2 in Round 58 (lstat regular file enforcement).
- **Enforcement Status:** Mechanical gate exists (`scripts/readme-map.mjs`). However, until Round 64 QUALITY Q60, `readme-map.mjs` was executed only during the round or at round close. Because spot-check files land *post-close* via the non-author verifier, the gate consistently failed at the open of the subsequent round.

### 4.2 Number Drift between Report and Receipt (11 Rounds, $\ge 3$: YES)
- **Rounds:** Agg-r1, Agg-r6, Agg-r8, R46, R47, R50, R52, R55, R58, R60, R63.
- **Root Cause:** L1 scribes write reports claiming counts, tallies, or pass rates (e.g. R47 "all 0/5", R58 base "held=0/5", R60 "held=9/10", R63 w2 collisions "1") that contradict committed receipts or actual test outputs (`close/*.txt`, diffs, git trees).
- **Gate Added after 3rd Occurrence?** No. Remained prose-only across 11 rounds until Round 64 Claim C1.
- **Enforcement Status:** In Round 64, `scripts/report-receipt-diff.mjs` was introduced as a mechanical capability (`TALLY_UNRECEIPTED`), checking that every `<LABEL>_HELD|UNMET held=x/y` in the report matches a line in `.ufo/waves/round-N/{base,close}/*`. Prior to Round 64, it was purely prose-only.

### 4.3 Count in Prose without Receipt (13 Rounds, $\ge 3$: YES)
- **Rounds:** Agg-r1, Agg-r5, Agg-r6, Agg-r8, R40, R42, R47, R48, R49, R51, R54, R60, R63.
- **Root Cause:** Reports and lesson files cite quantitative results, percentages, or statuses without committing the underlying command output, transcript, or receipt file (e.g. IRC quotes in R47, uncommitted transcripts in R63, uncommitted control runs in R49/R51).
- **Gate Added after 3rd Occurrence?** No. Remained prose-only across 13 rounds until Round 64 Claim C1.
- **Enforcement Status:** In Round 64, `scripts/report-receipt-diff.mjs` added `RECEIPT_MISSING` and `TALLY_UNRECEIPTED`. Prior to Round 64, governed only by CORPUS rule 4 and QUALITY Q47 ("a number filed is a number re-measured").

### 4.4 Counter Forgeable (9 Rounds, $\ge 3$: YES)
- **Rounds:** R41, R42, R43, R44, R47, R57, R61, R62, R63.
- **Root Cause:** Frozen counter scripts rely on vacuous heuristics, worktree `readFileSync`, loose substring regexes, or memorizable output shapes, allowing hand-written or fabricated fixtures to pass without satisfying the real claim.
- **Gate Added after 3rd Occurrence?** Partial. Round-specific negative controls (e.g. P4 stub checks, mutated fixtures) were committed, but no universal mechanical counter-hardening gate exists.
- **Enforcement Status:** Primarily governed by adversarial wave falsification (forge seats, mutation testing).

### 4.5 Dead Seats Unreported / Unreplaced (7 Rounds, $\ge 3$: YES)
- **Rounds:** R41, R44, R59, R60, R61, R62, R63.
- **Root Cause:** Seats that terminate abnormally (SIGKILL `exit=-9`, timeout, launcher `ValueError`, `invalid_prompt`) are omitted from the report, concealed, or left without required attack replacement.
- **Gate Added after 3rd Occurrence?** No. Remained prose-only across 7 rounds.
- **Enforcement Status:** Prose-only rule (QUALITY Q58, report contract rule: every dead seat must be named with its last error text).

### 4.6 Duplicate-URL Registry Warnings (W04) (8 Rounds, $\ge 3$: YES)
- **Rounds:** R56, R57, R59, R60, R61, R62, R63, R64-base.
- **Root Cause:** `corpus/SOURCES.md` contains multiple rows pointing to the same URL without scope disambiguation or proper supersession.
- **Gate Added after 3rd Occurrence?** No.
- **Enforcement Status:** Non-blocking checker exists (`sources-census.sh validate`), but it emits warnings (W04) and exits 0 (`ok`). Because it does not fail closed, the warning debt persisted unchanged from round 56 through round 64.

### 4.7 Seat-Mix Below Line (6 Rounds, $\ge 3$: YES)
- **Rounds:** R40, R41, R56, R58, R60, R63.
- **Root Cause:** Dispatch waves fail to meet required role allocations, model distributions (e.g. R63 m_flash share 44.3% vs 50% line), or L2 seat floors.
- **Gate Added after 3rd Occurrence?** No.
- **Enforcement Status:** Prose-only. Governed by pre-dispatch planning rules and post-hoc report shape disclosures.

### 4.8 Registry Gap / Unpinned Gate (6 Rounds, $\ge 3$: YES)
- **Rounds:** Agg-r6, R40, R41, R48, R58, R61.
- **Root Cause:** New tools or gates are added without updating `SKILL.md ## Gate registry` or without adding pins to `kumitate-gate-pins-v1`.
- **Gate Added after 3rd Occurrence?** Partial.
- **Enforcement Status:** Mechanical gate `proxy-check.mjs` validates `GATE_PINS` (`PIN_UNPINNED`), but synchronization of the markdown registry table in `SKILL.md` remains prose-only.

### 4.9 Filed-Bytes Edited in Place (4 Rounds, $\ge 3$: YES)
- **Rounds:** Agg-r6, R46, R57, R61.
- **Root Cause:** Historical lesson notes, SOURCES rows, or earlier filed reports are modified in place rather than preserved append-only with superseding rows or appended errata.
- **Gate Added after 3rd Occurrence?** No.
- **Enforcement Status:** Prose-only rule (CORPUS rule 2 / rule 9, QUALITY Q52). No git hook or mechanical gate prevents committing in-place modifications to historical files.

### 4.10 Uncommitted Round Work at Close (4 Rounds, $\ge 3$: YES)
- **Rounds:** R42, R48, R50, R60.
- **Root Cause:** L1s conclude rounds leaving modified files or untracked wave evidence sitting uncommitted in the working tree, requiring subsequent sweep commits or orchestrator cleanups.
- **Gate Added after 3rd Occurrence?** No.
- **Enforcement Status:** Prose-only (QUALITY Q27, L1 status checks). No mechanical gate prevents round closure while `git status --porcelain` is non-empty.

### 4.11 Unresolvable Hash / Ref (4 Rounds, $\ge 3$: YES)
- **Rounds:** Agg-r4, R46, R61, R63.
- **Root Cause:** Plans, lessons, or reports cite git commit hashes that exist only in scratch clones, tmpfs repositories, or external repos, rendering evidence chains broken.
- **Gate Added after 3rd Occurrence?** No. Remained prose-only until Round 64.
- **Enforcement Status:** Mechanical gate added in Round 64 via `scripts/report-receipt-diff.mjs` (`HASH_DEAD`, `HASH_ORPHAN`).

---

## 5. Investigation: The R56-V3 Readme-Map Drift

### 5.1 Verification of Recurrence Count & Chronology
The R56-V3 map drift is kumitate's most persistent defect class. It specifically describes:
> *A non-author verifier's post-close spot-check file lands in `corpus/lessons/round-NN-verifier-spotcheck.md` without a corresponding row in `corpus/README.md` or entry in `.ufo/pins/readme-map.json`.*

Tracking the spot-check files' own words and git evidence across history reveals the exact 10-step recurrence progression:

| # | Round | Spot-Check File / Source | Own Words from Corpus / Spot-Check Artifacts | Detection Mechanism at Base |
|:---:|:---:|---|---|---|
| **1** | Round 52 | `round-52-verifier-spotcheck.md` | *"C2 117→120 (the two new rows + the unrowed round-51-spotcheck repair + this entry/lesson)"* | `proxy-check` C2_total drift |
| **2** | Round 53 | `round-53-verifier-spotcheck.md` | *"three inherited drifts (spotcheck README row, D51 re-anchor, r52-entry citation re-bind) repaired and named, not hidden; H1–H6 green"* | `proxy-check` C2_total drift |
| **3** | Round 54 | `corpus/lessons/round-54.md` (M2) & spot-check | *"M2 — the committed round-53 verifier spot-check had no README map row. Class: landing... proxy read C2=125, C2_total=126... retired coverage aggregate computed 9 against the declared 10"* | `proxy-check` (`C2_TOTAL_DRIFT`) |
| **4** | Round 55 | `round-55-verifier-spotcheck.md` | *"SCORECARD proxy stanza: C2=129, C2_total=129 at tip (was 126/126)... the inherited README drift (r54 spotcheck row missing) is repaired and verified."* | `proxy-check` (`C2_TOTAL_DRIFT`) |
| **5** | Round 56 | `round-56-verifier-spotcheck.md` (§6, R56-V3) | *"3. R56-V3 — this artifact lands without a corpus/README.md map row (closure scope allows only this path; the same C2_total drift class the round repaired for the r55 file). Add the row next round."* | Routed as **R56-V3**; `proxy-check` |
| **6** | Round 57 | `corpus/lessons/round-57.md` & spot-check | *"coverage-map drift \| R56-V3 (round-56-verifier-spotcheck.md §6): round-56-verifier-spotcheck.md landed post-close without a corpus/README.md map row — third recurrence of the class (r52, r55 spotchecks)... R57-1: the readme-map gate makes the bimap mechanical"* | `proxy-check` $\rightarrow$ **`readme-map.mjs` gate created** |
| **7** | Round 58 | `round-58-verifier-spotcheck.md` (§8, R58-V7) | *"R58-V7 — this non-author file lands without a README row or a readme-map pin. The lane owns both (Q48 pattern, and the same gap recurred four times); without them the next round opens with readme-map DRIFT (files=139 / rows=138 / covered=138)."* | `readme-map.mjs` DRIFT |
| **8** | Round 60 | `round-60-verifier-spotcheck.md` (§5, R60-V8) | *"R60-V8 — corpus map drift, integrator-caused (sixth recurrence of the R56-V3 / R58-V7 class). This file adds corpus/lessons/round-60-verifier-spotcheck.md; round 61 must add its corpus/README.md row, its covered entry in .ufo/pins/readme-map.json..."* | `readme-map.mjs` DRIFT |
| **9** | Round 61 | `round-61-verifier-spotcheck.md` (§6, R61-V5) | *"or readme-map opens in DRIFT again (seventh recurrence of the R56-V3 class)."* | `readme-map.mjs` DRIFT |
| **10** | Round 63 | `round-63-verifier-spotcheck.md` (§5, D1) & R64 `plan.md` | *"D1 (R56-V3 recurrence, tenth time). This file lands without a corpus/README.md map row; the lane adds lessons/round-63-verifier-spotcheck.md (and keeps readme-map CLEAN) before its next gate run. The mechanism (readme-map-close.mjs) remains unlanded."* (R64 `plan.md:114` confirms 10th recurrence) | `readme-map.mjs` DRIFT (`base/readme-map-before.txt`) |

### 5.2 Comparative Analysis: `report-receipt-diff.mjs` vs `readme-map.mjs`

The prompt specifically directs:
> *"say whether report-receipt-diff (/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs) or readme-map (/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs) would have caught each."*

#### 1. Evaluation of `report-receipt-diff.mjs`:
- **Contract & Scope:** `kumitate-report-receipt-diff-v1` (C1 tool in Round 64). Its sole input is a round report (`--report <path>`) and the committed receipts in `.ufo/waves/round-N/{base,close}/*` read at a revision M.
- **Checks performed:**
  1. `PLACEHOLDER`: Scans for unfilled template tokens (`__NAME__`, `LANE_HASH`, `TBD`).
  2. `SECTION_MISSING`: Verifies presence of the 6 required report sections.
  3. `SHONEN_COUNT`: Checks that the SHONEN heading and box markers exist.
  4. `RECEIPT_MISSING`: Checks that any receipt path cited in the report actually exists at rev M.
  5. `TALLY_UNRECEIPTED`: Compares report tallies (`<LABEL>_HELD|UNMET held=x/y`) against strings in committed receipts.
  6. `HASH_DEAD` / `HASH_ORPHAN`: Verifies git commit hashes against the lane and fleet object stores.
- **Would it have caught map drift?** **NO. NEVER.**
  `report-receipt-diff.mjs` has **zero awareness** of `corpus/README.md`, `corpus/lessons/`, or `.ufo/pins/readme-map.json`. It does not perform any filesystem or index bimap checks. Even if every spotcheck file landed without a README row, `report-receipt-diff.mjs` would report `REPORT_RECEIPT: CLEAN`.

#### 2. Evaluation of `readme-map.mjs`:
- **Contract & Scope:** `kumitate-readme-map-v1` (Round 57) / `kumitate-readme-map-v2` (Round 58).
- **Checks performed:**
  1. `uncovered`: Every regular file in `corpus/knowledge` and `corpus/lessons` must have a row in `corpus/README.md`.
  2. `orphan-row`: Every row in `corpus/README.md` must correspond to a live regular file.
  3. `duplicate-row`: No row may be repeated in `corpus/README.md`.
  4. `unpinned`: Every regular file must be enumerated in `.ufo/pins/readme-map.json` (`covered` array).
  5. `stale-covered` / `covered-not-file`: Every pinned path must lstat as a regular file.
- **Would it have caught map drift?** **YES. ALWAYS.**
  Whenever a verifier lands a spot-check file without updating `corpus/README.md` and `.ufo/pins/readme-map.json`, `readme-map.mjs` exits 1 with:
  `README_MAP: note unpinned:lessons/round-NN-verifier-spotcheck.md`
  `README_MAP: DRIFT files=X rows=Y covered=Y bad=2 first=uncovered:lessons/round-NN-verifier-spotcheck.md`
  (Directly demonstrated at Round 64 base: `base/readme-map-before.txt` and verified live on current tree).

#### 3. Why Did the Defect Recur 10 Times Despite `readme-map.mjs`?
The defect recurred because of an **architectural lifecycle mismatch**:
- `readme-map.mjs` is run by the lane *during* the round.
- The spot-check file is written and committed by a *non-author verifier after round close*, whose permission scope is strictly limited to adding their own spot-check note. The verifier cannot edit `corpus/README.md`.
- Thus, the spot-check lands post-close, creating an unmapped file that only triggers `readme-map.mjs` DRIFT when the *next* round opens.
- **The Round 64 Structural Fix (QUALITY Q60):** As declared in `plan.md:116-117`, Round 64 adds a mechanical pre-freeze round-start gate (QUALITY Q60) requiring a clean `readme-map.mjs` run before the plan can be frozen, supported by a red-before receipt at base (`base/readme-map-before.txt`).

---

## 6. Synthesis & Proposed Non-Obvious Move

### Synthesis Across Round Proposals
Round 64 introduces two primary thrusts:
1. **C1 (Operability):** `scripts/report-receipt-diff.mjs` mechanically terminates the classes `number drift between report and receipt`, `count in prose without receipt`, and `unresolvable hash`.
2. **C2 (Coverage):** `scripts/jj-seat-demo.sh` demonstrates jj workspace seat containment, grounding frontier mechanism M7.
3. **Considerthese Idea 4:** Counting recurrences and demanding a structural fix at $N=3$.

### The Proposed Move: Mechanical Enforcement of the $N=3$ Rule (The Recurrence Lockout Gate)
**Affected Axes:** Operability (+), Quality (+) without harming Coverage or any other axis.

**Move:**
Formalize the Considerthese Idea 4 recurrence count into a mechanical pre-freeze check: `scripts/recurrence-guard.mjs`.
- The script checks a structured ledger (`.ufo/pins/defect-recurrences.json`).
- If any defect class has occurred $\ge 3$ times, the round plan **cannot declare a purely prose fix** for that class. It requires either:
  1. A mechanical gate (an executable `.mjs` or `.sh` script cited in `SKILL.md ## Gate registry`), OR
  2. An explicit orchestrator exemption token.
- Specifically, this directly targets the 7 classes currently languishing as prose-only despite $\ge 3$ occurrences (e.g. `dead seats unreported`, `filed-bytes edited in place`, `uncommitted round work at close`).

**Second-Order Effects:**
- *Runtime:* Closes the gap between verifier observations and lane capability acquisition.
- *Contract:* Prevents rounds from repeatedly "routing" defects across 4–13 rounds without engineering mechanical solutions.
- *Substrate:* Fully compatible with jj workspaces and git archive checks.

**Verification:**
Run `node scripts/report-receipt-diff.mjs --selftest` (verifying 20/20 PASS) and `node scripts/readme-map.mjs` (verifying DRIFT at base and CLEAN upon row insertion).
