author: hyaku closure (non-author integrator, @m_zfl)

# Round 85 — non-author verifier spot-check

Scope: kumitate lane-round 85 (2026-11-04). Pre-round base `a5d3e7549501ae76dbd86a6f81c5e858f1f92446`;
measured revision M `a882a334eaf7d817f484f9e68c2b2059f22fe797`; lane tip `602f1835a46b6627ed9f0c0e139279f4b6212444`;
report `.ufo/reports/round-85/kumitate.md` at fleet commit `b67837ee7136d0dfddce5b36589da3dca5add42f`
(author/committer `kumitate-shokunin <kumitate@shokunin.local>`). This file is written by the hyaku
closure integrator, not by the lane, and edits no lane-authored file; `SHONEN.md` is untouched.

Method: every number below was re-derived by the integrator with `git show`, `git ls-tree`, `git log`,
`sha256sum`, `grep`, `wc`, `awk`, `jq` or `find` over committed bytes, or read directly from a committed
receipt. The lane's gates, probes and selftests were **not executed** (PROTOCOL §Gate standard, Closure
consequence); their committed receipts were verified instead. The only executable run is the operator's
`scripts/sources-census.sh validate`, which the closure duty requires (result in §4).

## 1. Step-1 conformance

| check | command | observed | verdict |
|---|---|---|---|
| report committed by the lane identity | `git log --format='%an %H' -- .ufo/reports/round-85/kumitate.md` (fleet) | `kumitate-shokunin b67837ee7136d0dfddce5b36589da3dca5add42f` | PASS |
| report lands after the lane work | `git log -1 --format='%ci' b67837ee` (fleet) vs `git -C … log -1 --format='%ci' 602f1835` | report `2026-11-04 16:34:36 -0300`; lane tip `16:34:23 -0300` (+13 s) | PASS |
| `SHONEN` heading and one line per box | `grep -c '^## SHONEN'`; box-line count vs `SHONEN.md` | 1 heading; 4 lines; `SHONEN.md` has 4 boxes; 0 `[x]`, 0 `[ ]`, 4 `[~]`, each with an `evidence:` pointer | PASS |
| cited lane commits exist and are ancestors | `git -C … merge-base --is-ancestor <full> master` for `6663b3be`, `9db0c6b5`, `a882a334`, `6e3e4749`, `2688cc7f`, `de61175a`, `602f1835` | 7/7 resolve and are ancestors of `master` | PASS |
| lane pushed, no uncommitted round work | `scripts/hyaku/jj-lane.sh state …`; `git -C … status --porcelain`; `git ls-remote origin refs/heads/master` | `local=602f1835 remote=602f1835 ahead=0 behind=0 tracked=0 untracked=0`; status empty; `master` = tip = `602f1835` | PASS |
| prompt carries the template contract | rendered `templates/round-prompt.md` with LANE=kumitate, ROUND=85, FLEET_ROOT, AXES, lane-repo substitution; `diff` vs prompt lines 1–140 | 0 diff lines (140/140 byte-identical); §6 present with the five child-lane items and L2 floor/commit-then-push/push-scope/L0 | PASS |
| dispatch evidence durable | `git log -- .ufo/prompts/kumitate-round-85.md`; `.ufo/watchdog.log` digest | prompt `979beaab` (kumitate identity, 15:37:45); digest `15:37:46 launch … pgid=529354 driver=hyaku-inline attempt=1` / `16:35:17 complete … attempt=1` | PASS |
| marker vs real report | PROTOCOL minimum-content test | six required sections in order; 10 work bullets with receipt pointers; landed table tied to `LOG.md:2842`; commit `602f1835` resolvable | real report, status `ok` |

Conformance defects are recorded in §6 and are status-neutral: the report is defective, not a marker.

## 2. Declared claim C1 — re-check

**Declared (plan `.ufo/waves/round-85/plan.md`, frozen at `9db0c6b5`):** one claim, operability — capability
acquisition `counter-receipt` v2, on the lowest non-retired axis (integer terminal at 9 under `f_O`).
Frozen predicate: `probe85-c1.mjs` prints `C85_C1: HELD held=20/20` and exits 0 at M. Frozen kill rule:
"Any arm red, any control reaching 20/20, or a regression attributable to this change means unmet/harmed,
disclosed, never narrowed."

**What I re-derived (counts over committed bytes; the probe was not executed):**

| item | command | observed |
|---|---|---|
| arm table is 20 and fixed | `grep -c "name: '"` equivalent over `probe/probe85-c1.mjs:31-51`; the file pins `cases.length === 20` at `:99` | 20 cases, unique names |
| before, v1 bytes | `grep` tallies over `controls/base.txt` | 20 arm lines, 1 `ok`, `C85_C1: UNMET held=1/20`; base tool `sha256sum` = `190a4c1f…` = the round-84 pin |
| constant control | `controls/stub.txt` | 20 arms, 0 `ok`, `UNMET held=0/20` |
| label-keyed no-reader control | `controls/noreader.txt` | 20 arms, 1 `ok`, `UNMET held=1/20` |
| same-path content variation | `controls/cv-*.txt` | 3 arms each, 0 `ok`, `UNMET held=0/3` (base `distinct_sha=true`, other two `false`) |
| after at M | `close/c1-probe.txt:1` `rev=a882a334…`; 20 arm lines, 20 `ok`, `:23 C85_C1: HELD held=20/20`, `:24 exit=0` | as reported |
| tool bytes at M | `git show a882a334:scripts/counter-receipt.mjs \| sha256sum`; same at `master` and worktree | `f385bd7a9fbf1dc49d465c8d83fecfd07aae34f6bf619aca7d935eda14f238cd` (3/3 identical; also `SCORECARD.md` `pin.counter-receipt`) |
| probe bytes frozen | `git show 9db0c6b5:.ufo/waves/round-85/probe/probe85-c1.mjs \| sha256sum` vs M and tip | `6e7b1eb7…` at all three; no diff M→tip |
| selftest | `close/selftest.txt:63` | `COUNTER_RECEIPT_SELFTEST: PASS held=60/60`, `exit=0` |
| real task | `close/history-v2.txt` | c1-probe → `DRIFT ARMS_TOTAL`; c1-repair `--src` → `DRIFT SOURCE_DECLARED`, `SOURCE: sites=28 declared=27 receipt=28`; `HISTORY: HELD held=28/28`, exit 0 |
| mutants | `build/K85Mutation/table.md` | M01–M11 all `UNMET` (killed); S01–S03 survive, disclosed |
| independent driver | `build/K85ExecFixture/independent-candidate.txt:43` | `HELD held=41/41` with `tool_sha256=7659be6e…` — **the seat candidate, not the integrated `f385bd7a…`** (defect R85-V3) |
| kill rule fires | `grep` over `build/K85Review/receipts/probe-att-pathkeyed.txt:28`, `build/K85Cheat/receipts/probe-c.txt`, `build/K85Critic/content-keyed/probe.txt:29` | three independent post-data controls each read `C85_C1: HELD held=20/20`; the content-keyed one also passes the same-path control (`cv.txt`, `held=3/3 distinct_sha=true`) |

**Ruling.** The reported before→after is accurate: 1/20 (v1) → 20/20 (v2 at M), with the two other
pre-data controls at 0/20 and 1/20. The frozen predicate is green, and the frozen kill rule fires on
controls the lane itself published. The lane takes UNMET rather than narrowing the rule after data; the
capability row is marked unverified and `capabilities_added` is empty. **C1: UNMET — rejected honest
stop, agreed.** The independent 41/41 and the pre-data control receipts carry the disclosure defects in
§6; neither changes the verdict.

## 3. Axis verdicts

`git diff a5d3e754 602f1835 -- SCORECARD.md` changes only the proxy stanza terms (`A` 908→972, `C` 44→45,
`C2`/`C2_total` 213→216), `pin.counter-receipt` (`190a4c1f…`→`f385bd7a…`), the appended round-85 row,
and the disposition/pre-registration sections. No `## Axes` score row moves; no sub-axis row moves.

| axis | verdict | evidence |
|---|---|---|
| operability | unchanged | integer 9 (`SCORECARD.md:366`); `f_O = (A+C)/(A+C+3)` is 9 at A=972, 975 and 980 with C=45; claim UNMET, capability row `(unverified)` at `SCORECARD.md:1982` |
| coverage | unchanged | 10, retired, `SCORECARD.md:367`; no claim this round |
| coverage:script-layer | unchanged | 10, `SCORECARD.md:368` |
| coverage:runtime-layer | unchanged | 10, `SCORECARD.md:369` |
| coverage:kimi-layer | unchanged | 10, `SCORECARD.md:370` |
| coverage:omp | unchanged | 10, `SCORECARD.md:371` |

No owned axis is harmed: no integer or evidence row drops, and the one red scoring term (`A_DRIFT`) leaves
the operability integer at 9. It is a report/gate defect (R85-V1/V2), not an axis move.

## 4. Discernment spot-check

Sample: the `## Gate` in `corpus/lessons/round-85.md` records one admit (S245) and one reject (S246).
Both were re-opened by the integrator, and the two newly written `corpus/SOURCES.md` rows were re-read.
The operator census (§4.4) was run by the integrator.

| item | decision recorded | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S245 admit (`round-85.md:32-36`; `SOURCES.md:199`) | admit, mined, tier A, 14-word quote | `https://arxiv.org/abs/2212.06118` (fresh fetch, abstract) plus the committed capture `build/L1/arxiv-2212.06118.html` | **agree on admit; disagree on title and tier** | The 14-word quote "it does not provide any insights into the quality or quantity of test oracles" is verbatim in the abstract (14 words, ≤25). But the source's title is *A Brief Survey on Oracle-based Test Adequacy Metrics*; `round-85.md:32` and `SOURCES.md:199` both drop "A Brief" (R85-V8). A survey is the contract's own example of tier B, not A (`CORPUS.md` §Shape, tier row), so the tier cell is inflated (R85-V9). |
| S246 reject (`round-85.md:37-40`; `SOURCES.md:200`) | reject; HTTP 403 with no located text; flip on an accessible full text with a locatable sentence | `https://dl.acm.org/doi/10.1109/TSE.2014.2372785` → HTTP 403; then `https://eecs481.org/readings/testoracles.pdf` | **agree with the reject as executed; disagree that "rejected" still stands** | ACM DL reproduces the recorded 403 exactly. The row's own flip is now satisfied: the full text is reachable as a PDF and carries locatable sentences (abstract p.1; §1: "we need a test oracle, a procedure that distinguishes between the correct and incorrect behaviors of the System Under Test (SUT)"). Re-open and adopt with a located quote next round (R85-V10); "unreachable at the cited locator" was not fabrication. |
| SOURCES row shape (`SOURCES.md:199-200`) | 11 cells each | `awk -F'|'` → NF=13 | agree | Both rows parse as 11 cells; `status` is `mined`/`rejected`; `used-by` paths exist (`corpus/knowledge/counter-receipt-discrimination.md`, `corpus/lessons/round-85.md`). |
| Q78 criterion (`QUALITY.md:1309-1324`) | new criterion grounded in the round-84 `vacuous` row | `corpus/lessons/round-84.md` `## Mistakes` | agree | Grounded on the named r84 lesson and states the four pre-data control classes with exact-verdict assertions; no lessonless criterion. |
| knowledge entry (`corpus/knowledge/counter-receipt-discrimination.md`) | provenance trio + S245 | file head `:1-3`; body `:24` | agree on provenance; defect in body | `source:`/`verified-at:`/`recheck:` present, S245 cited; `sha256sum scripts/counter-receipt.mjs` matches the `verified-at:` hash. Lines `:7-10` carry an orphan fragment ("the lane commands below / sha256 … / fetched … / → …") with no sentence and no command before the arrow (R85-V11). |
| README rows (`README.md:356-357`) | rows for the new knowledge and lesson entries | `.ufo/pins/readme-map.json` entries | agree rows exist; defect in placement | Both rows and both pins exist and the map gate is CLEAN, but the rows sit after `## Frontier` (line 344) and its bullets, outside the `## Coverage map` table that opens at line 14 (R85-V12). The gate is section-blind, so this is a gate gap to record, not a red. |
| `## Mistakes` (`round-85.md:46-53`) | four rows | evidence pointers | agree | Four rows with class · evidence · captured-by · fix; `close/map-repair.txt`, `close/s5-fix.txt`, `build/K85ExecHistory/receipts.txt` resolve. |

`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` (integrator run,
2026-11-04): exit **0**, `kumitate ok …/corpus/SOURCES.md`, six pre-existing `W04` duplicate-URL warnings
(S034, S068, S084, S095, S123, S126) — exactly the state the report describes.

## 5. Trend verdicts

- **expansion — unchanged.** No admitted knowledge entry stands on ground the coverage map did not hold:
  the new `counter-receipt-discrimination.md` deepens the round-84 counter-transcript surface already held
  (`counter-transcript-reconciliation.md` is in the map), and no capability row enters the verified
  repertoire (`counter-receipt` is `(unverified)`). Rows 182→184 are registry curation, not knowledge
  expansion (`CORPUS.md` rule 4). Evidence: `corpus/README.md` coverage map; `SCORECARD.md:1982`.
- **quality — improved.** A weaker instrument is superseded by a stronger one on the same surface and the
  round proves it on committed bytes: the r83 repair receipt (28/28, CLEAN under v1) reads
  `DRIFT SOURCE_DECLARED` with `SOURCE: sites=28 declared=27 receipt=28` (`close/history-v2.txt:54-56`),
  and `Q78` adds a grounded criterion. No admitted entry fails its re-check; the knowledge note's
  orphan fragment and the S245 title are presentation/curation defects (R85-V8/V11), not a falsification.
- **discernment — improved.** The integrator's sample agrees with the gate on both decisions (S245 admit,
  S246 reject as executed); the lane mined its own freeze-order mistake with a shown-able-to-fail receipt
  (`close/map-repair.txt`), kept the strict kill rule after its own controls beat the predicate, and
  pre-registered the randomized-fixture remedy. The disagreements in §4 are row-accuracy and staleness
  defects, routed below for the next round.

## 6. Routed defects — the lane fixes these next round

These ride the routed-defect queue; none is an axis harm and none changes this round's `ok` status or the
C1 verdict.

| id | severity | defect | smallest safe fix |
|---|---|---|---|
| R85-V1 | HIGH | Report `:112` and `SCORECARD.md:4113` claim `PROXY: MATCH --strict (A=972 …)`; three committed receipts say DRIFT: `close/harm-matrix.txt:2` (`A_DRIFT declared=972 computed=975 delta=+3` at M), `close/checklists.txt:8-10` (item 724 FAIL; `computed=980 delta=+8` at close), `build/K85Scout/proxy-by-revision.txt:12-14`. The only MATCH receipt is pre-freeze at `6663b3be` with A=908/C=44. | Quote the committed DRIFT line; count the proxy row among the checklist reds; do not re-baseline A (the exclusion is already pre-registered for round 86). |
| R85-V2 | MEDIUM | The A accounting is wrong: declared 908→972, "59 wave-scaffolding files", "shipped-only A = 36". Measured `git ls-tree -r <rev> \| grep -cE '\.(mjs\|js\|sh\|py)$'`: **908** base, **913** freeze, **975** at M, **980** at tip; shipped-only at tip = **35**. 59 counts only the work commit's `.mjs` and omits three added `.sh`. | Replace the prose with the four measured counts and 35; keep the declared stanza separate from the computed value. |
| R85-V3 | MEDIUM | Report `:96` and `SCORECARD.md:4110` present `HELD held=41/41` as evidence for the integrated instrument; `build/K85ExecFixture/independent-candidate.txt:43` names `tool_sha256=7659be6e…`, the pre-S5-fix candidate, not integrated `f385bd7a…`. | Relabel it "candidate bytes (pre-S5)" or re-run the 41 cases against `f385bd7a` and commit that receipt. |
| R85-V4 | MEDIUM | Report `:35` quotes `READY_HANDOFF: READY wave=w1 seats=13 resumes=0 total=13 attack=4/13 connector=1`; no round-85 artifact contains that line, and the tool's READY render always appends `roles=… policy=… agents=…`. `plan.md:10`/`LOG.md` say 5/13 while the gate's `ATTACK` set excludes sentinel and yields 4/13. | Commit the full gate output (or downgrade "gated" to counts derived from `w1-dispatch.json`) and state that v3 excludes sentinel from the attack set. |
| R85-V5 | MEDIUM | The three pre-data control receipts (`controls/{base,stub,noreader}.txt`) carry no `rev=`/`cmd=`/`exit=` header, and `close/harm-matrix.txt` carries no `exit=0` line — a regression from round 84. The report's `exit 1`/`exit 0` claims are derivable from tool logic but not receipted. | Add the header and exit lines to new receipts; where a receipt is frozen evidence, commit a dated re-run beside it rather than editing it. |
| R85-V6 | MEDIUM | The probe does not assert `out.length === 3` on the four `--src` arms; `build/K85Critic/line-lenient/probe.txt:29` scores 20/20 while its direct output carries a fourth line (`EXTRA-LINE-NOT-CHECKED`). The plan's "the input-derived `RECEIPT:`/`SOURCE:` lines" is satisfied, but "exactly" is not, and the report does not disclose this survivor. | Disclose it as a predicate limit now; add a `--src` output-length arm to the round-86 randomized probe. |
| R85-V7 | LOW-MEDIUM | Report `:22-25` attributes both gates' after-state to `close/map-repair.txt`; that receipt has `README_MAP`, `SPOTCHECK_COVERAGE` and `MAP`, but no `plan-before-ready` line (only the pre-repair FAIL is in `w1/K85Scribe.md`). | Add the gate's CLEAN line to the receipt next round, or cite the seat report for the after-state. |
| R85-V8 | LOW | S245's title is mis-transcribed in `corpus/lessons/round-85.md:32` and `corpus/SOURCES.md:199`: "Oracle-based Test Adequacy Metrics: A Survey" for *A Brief Survey on Oracle-based Test Adequacy Metrics* (the committed capture's `<title>` and citation meta prove it). | Supersede S245 with a corrected row (`teaches: supersedes S245 —`) and cite the correction from the round-86 lesson; leave the filed lesson bytes and append the erratum. |
| R85-V9 | LOW | S245's tier is `A` for a survey; `CORPUS.md` names a survey as tier `B` (strong secondary). The scope does not make the survey a primary source for its own synthesis. | In the superseding row, set tier `B` (or narrow the scope to the survey's own abstract statement and justify A explicitly). |
| R85-V10 | LOW | S246's flip is satisfied: the ACM locator 403s, but `https://eecs481.org/readings/testoracles.pdf` is reachable and carries the paper's title, abstract and §1. "Rejected" is no longer the honest status. | Re-open the full text next round; adopt with a ≤25-word located quote or restate the reject with the new evidence. |
| R85-V11 | LOW | `corpus/knowledge/counter-receipt-discrimination.md:7-10` is an orphan fragment ("the lane commands below / sha256 … / fetched … / → …") with no leading sentence and no command before the arrow. | Append a correction block or a new entry with the recheck transcript in sentence form; corpus corrections are new entries, never in-place rewrites. |
| R85-V12 | LOW | `corpus/README.md:356-357` places the two new index rows after `## Frontier` and its bullets, outside the `## Coverage map` table (line 14). The map gate scans every `|` line, so it is green; the human index is not. | Move the rows into the coverage map next round and add a section-membership arm to `readme-map.mjs` (gate gap). |
| R85-V13 | LOW | Landed-table/LOG gaps: the report's own row (`:70`) has no hash (fleet `b67837ee` exists); the SKILL r84 item and `## Planned` pointer rows are not named in `LOG.md:2842`. | Name the report commit and fold the two sub-items into the named LOG rows next round. |
| R85-V14 | LOW | Report `:144` calls all four checklist reds "live-host"; the proxy red (`SKILL.md:724`) is lane-state (`A_DRIFT`), not host state. | Reclassify: two host-bound (OMP census, OMP shape) and two lane/derived (proxy, Kimi composite). |
| R85-V15 | INFO | The report's census claim had no committed receipt in `.ufo/waves/round-85/`; this closure re-ran the operator census (exit 0, six W04) and records the result in §4. | No lane action; the durable pointer is this file. |

Also for the next round: this spot-check file is itself a non-author closure artifact and needs its
`corpus/README.md` row plus its `readme-map.json` pin through `spotcheck-adopt --adopt` **before** the
round-86 freeze — the same class as the round-84 file that round 85 had to adopt by hand.

SHONEN note for the operator: the four report boxes are `[~]` with resolvable evidence and, in this
integrator's read, are checkable end to end by a non-author (SKILL gate row + 45-item checklist, the r83
real-task battery logged in `LOG.md:2842`, runnable checklist commands, `PROVINCE.md` unchanged with the
connector's nine-lane scan reported not absorbed). Promotion remains operator-owned; this file writes no
`[x]`.
