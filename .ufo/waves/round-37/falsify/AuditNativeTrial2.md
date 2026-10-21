AUDIT NativeTrial2 anchors=2 false=2 overreverted=1 notice=bad verdict=refuted

Axis: operability. Item: group 2/8 of the round-37 restoration of `corpus/knowledge/native-trial-launch.md`.
Pin `/fast/scratch/kumitate-r36/src` = 31c465f15669f744848bd9f5d56191c5085670f7, clean (`git -C … status --short | wc -l` → 0), files `-r-x`/`-r--`. No lane or pin edits, no installs, no package transactions, no REA. Scratch: /fast/scratch/kumitate-r37/AuditNativeTrial2/.

## 0. State audited (the lane moved during the audit)
- Audited first: 2de70ea (commit 5ceb8cd, "restore 123 shifted anchors"). That state had 9 anchors off 0614092 (`git diff 0614092 -- note`: 11+/9-).
- Superseded: 5bc40d0 "reset four notes to 0614092 bytes". HEAD now 469500f; note blob = 0614092 body + one notice line (`git diff 0614092 -- note` → `+1` line, the notice).
- Because the note now has zero anchor changes vs 0614092, the spawn-time population (the nine anchors changed in 2de70ea) is audited at its current restored lines, which are the 0614092 lines. Group 2/8 counts are the same under both states.

## 1. Population, group, standard
- Nine anchors A1–A9 in diff order. Eighths: ceil(9/8)=2 contiguous → G1={A1,A2} **G2={A3,A4}** G3={A5,A6} G4={A7,A8} G5={A9}; G6–G8 empty. Group 2 = anchors=2. Another 8-way split would put G2 at {A3} or {A2}; both are false, so the verdict holds either way.
- "Symbol on line" = pinned line contains the sentence's symbol (definition, use, or comment). false = restored line lacks it. overreverted = round-36 line (5833351) carried the symbol, the 0614092 line does not, and the restoration moved the anchor off the round-36 line.

## 2. Anchor table (restored = HEAD 469500f = 0614092 line; r36 = 5833351)
| id | grp | file · symbol | restored (HEAD) | symbol on restored line | r36 line | symbol on r36 line | pin def | result |
|---|---|---|---|---|---|---|---|---|
| A3 | 2 | trial · snapshotDispatchInputs | :171 | no (`text: bytes.toString("utf8"),`) | :639 (no) | no | :176 | **FALSE** |
| A4 | 2 | trial · die | :831 | no (`routeFamily: resolved.routeFamily,`) | :4315 | comment only | :838 | **FALSE**; overreverted (weak) |
| A1 | 1 | trial · die | :831 | no | :831 | no | :838 | FALSE |
| A2 | 1 | trial · PROPOSAL_WAVE_CEILING | :109 | no (`for (const blueprint …`) | :115 | yes | :115 | FALSE; overreverted (strong) |
| A5 | 3 | collector · parseArgs | :120 | yes | :118 (no) | no | :120 | TRUE |
| A6 | 3 | collector · writeEvidenceFile | :951 | no (comment) | :977 (no) | no | :955 | FALSE |
| A7 | 4 | base.mjs · EVIDENCE_KIND | :133 | yes | :62 (no) | no | :133 | TRUE |
| A8 | 4 | policy · resolveNativeProfile | :619 | no (`herdThreshold: …`) | :722 (no) | no | :637 | FALSE |
| A9 | 5 | policy · loadCanonicalDirective | :879 | no (`  };`) | :926 (no) | no | :897 | FALSE |

Group 2 result: anchors=2, false=2 (A3, A4), overreverted=1 (A4, comment-only truth).
Across all nine: 7 restored lines are false, 2 are true (A5, A7). Under 2de70ea, A5 and A7 had been left at false round-36 lines; the reset fixed them.

## 3. Evidence (command → output; pin paths abbreviated `…`)
- `read …/run-omp-native-trial.mjs:303` → `  // unchanged across every hop of this seat's chain.` (the 2de70ea value for A1/A4; not a round-36 value)
- `read …:831` → `    routeFamily: resolved.routeFamily,`
- `grep 'function die\b'` (trial) → `838:function die(message) {`
- `read …:4315` → `    // Every designed failure exits through die() as "BLOCKED: …" with code 2.` (the die() call is :4319)
- `grep 'PROPOSAL_WAVE_CEILING|snapshotDispatchInputs'` (trial) → `115:export const PROPOSAL_WAVE_CEILING = 16;`, `176:export function snapshotDispatchInputs({`, plus call sites 2711, 3257, 923, 924, 3277
- `read …:171` → `    text: bytes.toString("utf8"),`; `read …:639` → `export function resolveNativeDispatchPolicy(snapshot, profileName = PROFILE, {`
- `grep 'COLLECTOR_USAGE|function parseArgs|writeEvidenceFile|persistEvidenceWrites'` (collector) → `118:const COLLECTOR_USAGE = …`, `120:function parseArgs(argv) {`, `955:function writeEvidenceFile(dest, content) {`, `977:function persistEvidenceWrites() {`; `read …:951` → `// P2 (spec 02 §3): seats whose observed interval exceeded their deadline,`
- `grep 'EVIDENCE_KIND|classifyFailure'` (base.mjs) → `62:// always the capacity prefix plus the classifyFailure class.`, `133:export const EVIDENCE_KIND = {`
- `grep 'resolveNativeProfile|readRoundPlan|loadCanonicalDirective|parseRateCard'` (policy.mjs) → `637:export function resolveNativeProfile`, `722:export function readRoundPlan`, `897:export function loadCanonicalDirective`, `926:export function parseRateCard`; `read …:619` → `    herdThreshold: input.backpressure.herdThreshold,`; `read …:879` → `  };`
- `git diff 0614092 -- corpus/knowledge/native-trial-launch.md` (HEAD) → one added line (the notice). Body identical to 0614092.

D1-conforming pin lines (spot-check D1, `corpus/lessons/round-36-verifier-spotcheck.md:193-196`: keep the base line where its symbol is still on it, else the symbol's pin line): A1 :838, A2 :115, A3 :176, A4 :838, A6 :955, A8 :637, A9 :897; A5 :120 and A7 :133 already correct.

## 4. Pin-true round-36 anchors reverted to false 0614092 lines (same note; outside the nine-anchor population because base=HEAD there)
Each row: `r36 → base` [pin def]. All 19 base lines are false at the pin. Every round-36 line is a pin definition except taskDispatches, whose round-36 line is a comment mention.
- trial: PROFILE :56→:50 [56]; parseArgs :851→:844 [851]; planLaunchMode :965→:958 [965]; resolveNativeDispatchPolicy :639→:646 [639]; handOffToSightingWall :1289→:1282 [1289]
- collector: validateDispatches :873→:869 [873]; persistEvidenceWrites :977→:973 [977]
- events.mjs: taskDispatches :20→:381 (r36 comment mention) [396]
- evidence.mjs: attemptLedgerEntry :71→:70 [71]; seatStatus :476→:474 [476]; verifyEffectiveLaunch :633→:631 [633]; buildCostLedger :1005→:1003 [1005]; appendRoutingHealth :1071→:1067 [1071]
- policy.mjs: splitRoute :66→:39 [66]; loadSeatRoutingMirror :173→:155 [173]; verifyLaunchSeatRouting :301→:283 [301]; readRoundPlan :722→:704 [722]; waveTokenFromContext :798→:780 [798]; parseRateCard :926→:908 [926]
Restorations that did land on true lines: normalizeTranscriptEvent :82→:16; DEADLINE_CLASS_BY_ROLE :196→:173; GODSPEED_MARKER :133→:120; base.mjs PROPOSAL_WAVE_CEILING :102→:96.
Base-false lines with no round-36 truth to lose (left in place): collector-lib `helper die (:303)` [def base.mjs:297]; ROUTING_HEALTH_OUTCOMES :223 [:217]; taskCalls :260 [:265]; modelEvidence :275 [:276]; nativeReceiptDigests :520 [:522].
Count of false sites checked: 7 (group population) + 19 (section 4) + 5 (left in place) = 31. `.ufo/pins/fidelity-ratchet.json:14` records `"corpus/knowledge/native-trial-launch.md": 31`. Consistent, though I did not audit every anchor in the note, so I cannot confirm completeness.

## 5. Notice (`> **Round-37 restoration (2026-10-21; final, amended by AuditSighting2/4).**`, HEAD line 2)
- Present: yes.
- Scope claims, accurate: "reset to its 0614092 bytes" (diff = notice line only); "no anchor here is a round-36 artifact" (body = 0614092); "Pre-existing anchors that were already false at the pin remain as ratcheted fidelity debt" (ratchet line 14 = 31, consistent with §4); "re-verification against the pin is owed"; "Do not claim this note as pin-true."
- Provenance, **inaccurate** → `notice=bad`: "amended by AuditSighting2/4". AuditSighting2 and AuditSighting4 audit `corpus/knowledge/sighting-wall.md` (`.ufo/waves/round-37/falsify-spec.json`, items "AuditSighting2" group 2/8 and "AuditSighting4" group 4/8). The identical sentence is pasted into four notes (`grep -n "amended by" corpus/knowledge/*.md`: native-trial-launch, remaining-scripts-census, route-probe-cluster, sighting-wall). For this note it claims a review history that does not exist.
- The superseded 2de70ea notice ("Anchors … were reverted to the lines their 0614092 sentences named") was false: 0 of 9 changed anchors were on their 0614092 line. Lane bookkeeping (`.ufo/waves/round-37/repairs.md:3-5`, `LOG.md:1715-1716`) describes the 2de70ea restoration; its "reverted to 0614092" wording now matches the bytes, but nothing in it accounts for the §4 reverts.

## 6. Findings (severity order)
1. HIGH — A3 (`snapshotDispatchInputs`, restored :171) and A4 (`die`, restored :831) are restored-but-false. D1 pins: :176 and :838.
2. HIGH — notice misstates provenance: "amended by AuditSighting2/4" for a note those items did not review (§5).
3. HIGH, outside G2 — 19 round-36 anchors (18 pin-true, 1 comment-only) reverted to false 0614092 lines (§4). Against round-36, the lane's restorations fixed 4 anchors and broke 18 pin-true ones.
4. MEDIUM — A4 overreverted, weak: round-36 :4315 described die(); the restoration moved it to a routeFamily line.
5. Reported for G1 (not counted here): A2 strong overreverted (:115 true → :109 false).

## 7. Residual risk and gaps
- Pin truth = symbol presence on the pinned line (definition, use, or comment). I did not audit unchanged base anchors outside the lists above, so the 31 count is a floor for false sites, not a census.
- Did not run claims-check or the fidelity gate (outside this item).
- My partition reading of "2th eighth" is stated in §1; the table carries all nine so another split can be read off.
