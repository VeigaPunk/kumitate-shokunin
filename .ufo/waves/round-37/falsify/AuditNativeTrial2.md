AUDIT NativeTrial2 anchors=2 false=2 overreverted=1 notice=bad verdict=refuted

Axis: operability. Item: group 2/8 of the round-37 restoration of `corpus/knowledge/native-trial-launch.md`.
Lane HEAD fb5b90e; note blob 2de70ea (same blob since 5ceb8cd; `git diff HEAD -- corpus/knowledge/native-trial-launch.md` is empty). Pin `/fast/scratch/kumitate-r36/src` = 31c465f15669f744848bd9f5d56191c5085670f7, clean (`git -C … status --short | wc -l` → 0), files `-r-x`/`-r--`.
No lane or pin edits, no installs, no package transactions, no REA. Scratch: /fast/scratch/kumitate-r37/AuditNativeTrial2/.

## 1. Population, group, standard
- `git diff 0614092 -- corpus/knowledge/native-trial-launch.md` → 9 changed anchors (A1–A9, diff order) plus the notice.
- Eighths: 9 anchors into 8 contiguous groups, ceil(9/8)=2 → G1={A1,A2} **G2={A3,A4}** G3={A5,A6} G4={A7,A8} G5={A9}; G6–G8 empty. Group 2 therefore = anchors=2. Another 8-way split puts G2 at {A3} or {A2}; both are false, so the verdict holds either way. All nine are tabled.
- "Symbol on line" = the pinned line contains the sentence's symbol (definition, use, or comment). false = HEAD line lacks it. overreverted = round-36 line (5833351) had the symbol, the 0614092 line does not, and HEAD moved the anchor off the round-36 line.

## 2. Anchor table (base=0614092, r36=5833351, HEAD=2de70ea)
| id | grp | file · symbol | base | r36 | HEAD | symbol on HEAD line | symbol on base line | symbol on r36 line | pin def | result |
|---|---|---|---|---|---|---|---|---|---|---|
| A3 | 2 | trial · snapshotDispatchInputs | :171 | :639 | :639 | no (resolveNativeDispatchPolicy signature) | no | no | :176 | **FALSE** |
| A4 | 2 | trial · die | :831 | :4315 | :303 | no (comment on routeFamily) | no (`routeFamily:`) | comment only | :838 | **FALSE**; overreverted (weak) |
| A1 | 1 | trial · die | :831 | :831 | :303 | no | no | no | :838 | FALSE |
| A2 | 1 | trial · PROPOSAL_WAVE_CEILING | :109 | :115 | :96 | no (blueprint row) | no | yes | :115 | FALSE; overreverted (strong) |
| A5 | 3 | collector · parseArgs | :120 | :118 | :118 | no (COLLECTOR_USAGE) | yes | no | :120 | FALSE; true base not restored |
| A6 | 3 | collector · writeEvidenceFile | :951 | :977 | :977 | no (persistEvidenceWrites) | no (comment) | no | :955 | FALSE |
| A7 | 4 | base.mjs · EVIDENCE_KIND | :133 | :62 | :62 | no (comment) | yes | no | :133 | FALSE; true base not restored |
| A8 | 4 | policy.mjs · resolveNativeProfile | :619 | :722 | :722 | no (readRoundPlan) | no | no | :637 | FALSE |
| A9 | 5 | policy.mjs · loadCanonicalDirective | :879 | :926 | :926 | no (parseRateCard) | no | no | :897 | FALSE |

HEAD sits on the 0614092 line for 0 of 9 changed anchors (HEAD 303/96/639/303/118/977/62/722/926 vs base 831/109/171/831/120/951/133/619/879).

## 3. Evidence (command → output)
- `read run-omp-native-trial.mjs:303` → `  // unchanged across every hop of this seat's chain.` (no die)
- `read run-omp-native-trial.mjs:831` → `    routeFamily: resolved.routeFamily,`
- `grep 'function die\b'` (trial) → `838:function die(message) {`
- `read run-omp-native-trial.mjs:4315` → `    // Every designed failure exits through die() as "BLOCKED: …" with code 2.` (the die() call is :4319)
- `grep 'PROPOSAL_WAVE_CEILING|snapshotDispatchInputs'` (trial) → `115:export const PROPOSAL_WAVE_CEILING = 16;`, `176:export function snapshotDispatchInputs({`, `2711`, `3257`, `923`, `924`, `3277`
- `read run-omp-native-trial.mjs:639` → `export function resolveNativeDispatchPolicy(snapshot, profileName = PROFILE, {`; `read :171` → `    text: bytes.toString("utf8"),`
- `grep 'COLLECTOR_USAGE|function parseArgs|writeEvidenceFile|persistEvidenceWrites'` (collector) → `118:const COLLECTOR_USAGE = …`, `120:function parseArgs(argv) {`, `955:function writeEvidenceFile(dest, content) {`, `977:function persistEvidenceWrites() {`; `read :951` → `// P2 (spec 02 §3): seats whose observed interval exceeded their deadline,`
- `grep 'EVIDENCE_KIND|classifyFailure'` (base.mjs) → `62:// always the capacity prefix plus the classifyFailure class.`, `133:export const EVIDENCE_KIND = {`
- `grep 'resolveNativeProfile|readRoundPlan|loadCanonicalDirective|parseRateCard'` (policy.mjs) → `637:export function resolveNativeProfile`, `722:export function readRoundPlan`, `897:export function loadCanonicalDirective`, `926:export function parseRateCard`; `read policy.mjs:619` → `    herdThreshold: input.backpressure.herdThreshold,`; `read :879` → `  };`
- `git show 5ceb8cd -- corpus/knowledge/native-trial-launch.md` (index 328058f..2de70ea): of the nine, it touched only A1 (:831→:303), A2 (:115→:96), A4 (:4315→:303). A3 and A5–A9 still carry round-36 values.

D1-conforming values at the pin (spot-check D1, corpus/lessons/round-36-verifier-spotcheck.md:193-196: keep the base line where its symbol is still on it, else the symbol's pin line): A1 :838, A2 :115, A3 :176, A4 :838, A5 :120, A6 :955, A7 :133, A8 :637, A9 :897.

## 4. Restorations outside G2 that reverted pin-true anchors (same note; base=HEAD there, so outside the nine-anchor diff)
5ceb8cd moved 19 anchors from round-36 lines to 0614092 lines that lack the symbol. Each round-36 line is a pin definition except taskDispatches (comment). Format: `r36 → HEAD` [pin def].
- trial: PROFILE :56→:50 [56]; parseArgs :851→:844 [851]; planLaunchMode :965→:958 [965]; resolveNativeDispatchPolicy :639→:646 [639]; handOffToSightingWall :1289→:1282 [1289]
- collector: validateDispatches :873→:869 [873]; persistEvidenceWrites :977→:973 [977]
- events.mjs: taskDispatches :20→:381 (r36 is a comment mention) [396]
- evidence.mjs: attemptLedgerEntry :71→:70 [71]; seatStatus :476→:474 [476]; verifyEffectiveLaunch :633→:631 [633]; buildCostLedger :1005→:1003 [1005]; appendRoutingHealth :1071→:1067 [1071]
- policy.mjs: splitRoute :66→:39 [66]; loadSeatRoutingMirror :173→:155 [173]; verifyLaunchSeatRouting :301→:283 [301]; readRoundPlan :722→:704 [722]; waveTokenFromContext :798→:780 [798]; parseRateCard :926→:908 [926]
Four restorations landed on true lines: normalizeTranscriptEvent :82→:16; DEADLINE_CLASS_BY_ROLE :196→:173; GODSPEED_MARKER :133→:120; base.mjs PROPOSAL_WAVE_CEILING :102→:96.
Base-false lines left in HEAD, not regressions (unchanged vs round-36 or already false): collector-lib `helper die (:303)` [def base.mjs:297]; ROUTING_HEALTH_OUTCOMES :223 [:217]; taskCalls :260 [:265]; modelEvidence :275 [:276]; nativeReceiptDigests :520 [:522].

## 5. Notice (`> **Round-37 anchor-truth restoration (2026-10-21).**`, HEAD line 2)
- Present: yes.
- Accurate: **no** → notice=bad.
  - "Anchors in this note were reverted to the lines their 0614092 sentences named": 0 of 9 changed anchors are on their 0614092 line (§2), and 19 more were moved onto 0614092 lines that lack the symbol (§4).
  - "treat line anchors here as at their base revision until then": at the pin the 0614092 line is false for 7 of the 9 changed anchors (A1, A2, A3, A4, A6, A8, A9). The instruction steers readers to false anchors and conflicts with the round-35 notice above it ("true only at the revision each section states").
  - "(spot-check D1)": the citation is real, but D1's rule (keep the base line only where the symbol still is; otherwise the pin line) was not applied. All nine changed anchors remain on lines lacking the symbol, and 19 pin-true anchors were moved onto false base lines.
  - Lane bookkeeping repeats the claim: `.ufo/waves/round-37/repairs.md:3-5` and `LOG.md:1715-1716` say these anchors were "reverted to its 0614092 sentence line". False for this note.

## 6. Findings (severity order)
1. HIGH — A3 (`snapshotDispatchInputs` at :639) and A4 (`die` at :303) are restored-but-false. Pin lines are :176 and :838.
2. HIGH — notice misstates scope (§5).
3. HIGH, outside G2 — 18 pin-true anchors reverted to false base lines (§4). In this note 5ceb8cd fixed 4 anchors and broke 18.
4. MEDIUM — A4 overreverted, weak: round-36 :4315 described die(); HEAD moved it to a routeFamily comment.
5. MEDIUM — A5 and A7: the base lines are true (:120, :133) but HEAD still carries :118 and :62. The restoration missed them.
6. Reported for G1 (not counted here): A2 strong overreverted (:115 true → :96).

## 7. Residual risk and gaps
- Pin truth = symbol presence on the pinned line (definition, use, or comment). I did not check every unchanged base anchor in the note; the list in §4 covers only the ones the 5ceb8cd diff touched or that sit in the changed population.
- Did not run claims-check or the fidelity gate (outside this item).
- The partition in §1 is my reading of "2th eighth"; the table carries all nine so any split can be read off.
