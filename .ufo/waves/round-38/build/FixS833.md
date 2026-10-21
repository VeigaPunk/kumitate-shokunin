ITEM FixS833 anchors=2 move=2 token=0 move_token=0 debt=0
VERDICT remaining-scripts-census#372 MOVE 115 | pin 115 is the definition `const acceptanceConflict = task?.blocker?.code === "acceptance_evidence_missing"` (pin 117 `|| acceptanceConflict)` is a use); the sentence's parenthetical names the symbol, so the definition is the target; current :126 `let suspendedReason = null;` lacks the symbol; round-36 value 120 is the throw line and lacks it too
VERDICT remaining-scripts-census#373 MOVE 120 | pin 120 `invalid("mission and task lifecycle snapshots conflict");` is the only occurrence of the sentence phrase (exact-phrase grep); the sentence says the refusal "dies as" that message; current :131 `source = "mission";` lacks the phrase
Evidence: pin /fast/scratch/kumitate-r36/src; `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` = 31c465f15669f744848bd9f5d56191c5085670f7 (matches item); script mode -r-xr-xr-x.
Note remaining-scripts-census.md:668 (raw read): "...with an acceptance-blocked task (`acceptanceConflict`, `scripts/ufo-mission-lifecycle.mjs:126`), dies as `mission and task lifecycle snapshots conflict` (`:131`)..."
pin 114 `const live = mission?.status === "starting" || mission?.status === "running";`
pin 115 `const acceptanceConflict = task?.blocker?.code === "acceptance_evidence_missing"`; pin 116 `|| task?.blocker?.code === "acceptance_receipt_missing";`
pin 117 `if (live && (TERMINAL_PHASES.has(task?.state) || acceptanceConflict)`; pin 119 `|| task?.state === "running")) {`
pin 120 `invalid("mission and task lifecycle snapshots conflict");`
pin 126 `let suspendedReason = null;`
pin 129-131 `if (live) {` / `phase = mission.status === "starting" ? "queued" : "working";` / `source = "mission";`
_grep `acceptanceConflict` -> lines 115 (definition) and 117 (use) only.
_grep `snapshots conflict` -> line 120 only.
Parser extra hits 2, 17, 174, 190 are single-word matches (`lifecycle`, `ufo-mission-lifecycle-v1`, `mission-display`), not the phrase.
#372 rejects 120 (round-36 value): that line carries the message, not the symbol. The token is already right (`acceptanceConflict` is in the sentence and on 115), so no TOKEN or MOVE_TOKEN is needed; the sentence names the same symbol the parser paired.
Installs: none. Reads only; lane state untouched. Report at .ufo/waves/round-38/build/FixS833.md under the lane root.
