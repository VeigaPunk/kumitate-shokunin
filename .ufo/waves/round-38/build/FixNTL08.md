ITEM FixNTL08 anchors=4 move=4 token=0 move_token=0 debt=0
VERDICT native-trial-launch#34 MOVE 276 | pin 275 is blank; pin 276 "export function modelEvidence(events, role, route, options = {}) {" is the definition the sentence documents (pin 69, 500, 741 are comment mentions)
VERDICT native-trial-launch#35 MOVE 71 | pin 70 is the comment "// collector never invents an attempt: an unreconstructable hop died there." and lacks the symbol; pin 71 "export function attemptLedgerEntry(input) {" is the sole occurrence and the definition
VERDICT native-trial-launch#36 MOVE 476 | pin 474 is "}" closing modelEvidence (276-474); pin 476 "export function seatStatus(events, completion, role, artifactPath, profile) {" is the sole occurrence and the definition
VERDICT native-trial-launch#37 MOVE 633 | pin 631 is the comment "// seat is covered exactly once; a launch.json without the field is a legacy" inside the verifyEffectiveLaunch doc block (626-632); pin 633 "export function verifyEffectiveLaunch(records, allKeys, agents, roleRoutes, contractRoot, manifest) {" is the sole occurrence and the definition
Evidence:
- Pin identity: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` = 31c465f15669f744848bd9f5d56191c5085670f7; dir dr-xr-xr-x, evidence.mjs -r--r--r--; no pin writes.
- `wc -l evidence.mjs` = 1167 (note heading says "(1163 L)"; outside this item's four anchors, unchanged).
- _grep (gitignore off) modelEvidence|attemptLedgerEntry|seatStatus|verifyEffectiveLaunch: modelEvidence 69,276,500,741; attemptLedgerEntry 71; seatStatus 476; verifyEffectiveLaunch 633.
- sed -n exact: 70 "// collector never invents an attempt: an unreconstructable hop died there."; 71 "export function attemptLedgerEntry(input) {"; 275 ""; 276 "export function modelEvidence(events, role, route, options = {}) {"; 474 "}"; 476 "export function seatStatus(events, completion, role, artifactPath, profile) {"; 631 "// seat is covered exactly once; a launch.json without the field is a legacy"; 633 "export function verifyEffectiveLaunch(records, allKeys, agents, roleRoutes, contractRoot, manifest) {".
- Note lane working copy 404-407 matches the item anchor lines: 404 "Per-seat model evidence `modelEvidence`"; 405 "(`...evidence.mjs:275`); attempt ledger"; 406 "`attemptLedgerEntry` (`:70`); seat status `seatStatus` (`:474`); effective-launch"; 407 "verify `verifyEffectiveLaunch` (`:631`); receipt digests".
- Each of the four sentences documents the function definition; none documents a different symbol, so no TOKEN or MOVE_TOKEN; each symbol is defined at the pin, so no DEBT.
- The L1 round-36 reference values (71, 476, 633) agree with the definition lines verified here; used for cross-check only.
- Installs: none.
