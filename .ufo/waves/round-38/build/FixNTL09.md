ITEM FixNTL09 anchors=3 move=3 token=0 move_token=0 debt=0
VERDICT native-trial-launch#38 MOVE 522 | pin 522 "export function nativeReceiptDigests(ufoPath, payload, cwd) {" is the only occurrence of nativeReceiptDigests in evidence.mjs and is its definition; pin 520 is blank; note 407-408 "receipt digests `nativeReceiptDigests` (`:520`)" names the function
VERDICT native-trial-launch#39 MOVE 1005 | pin 1005 "export function buildCostLedger(allKeys, loaded, dispatchAttemptSeats, roleRoutes, rateCard, roundPlan, contractRoot, runRoot) {" is the only occurrence and the definition; pin 1003 "// dispatch-attempt seats, which have no transcript and report unavailable." is a doc-comment line without the token buildCostLedger; note 408 "cost rollup `buildCostLedger` (`:1003`)" names the function; the shared word attempt on 1003 is a mere mention, so TOKEN would mis-pair
VERDICT native-trial-launch#40 MOVE 1071 | pin 1071 "export function appendRoutingHealth(contractRoot, rows) {" is the only occurrence and the definition; pin 1067 "// symlinked intermediate planted after the chain check, while EEXIST here" is a line inside the doc-comment block 1064-1070 without the token appendRoutingHealth; note 409 "routing-health append `appendRoutingHealth` (`:1067`)" names the function

Evidence:
1. grep on pin evidence.mjs for nativeReceiptDigests|buildCostLedger|appendRoutingHealth: matches only at *522, *1005, *1071 (each symbol occurs once, on its export function line).
2. read pin :518-524 (displayed 517-527): 520 and 521 blank; 522 "export function nativeReceiptDigests(ufoPath, payload, cwd) {".
3. read pin :1001-1007 (displayed 1000-1010): 1002 "// The ledger covers every topology seat exactly once — including"; 1003 "// dispatch-attempt seats, which have no transcript and report unavailable."; 1004 "// Seat names are the canonical seatLabel derivation the judge re-renders."; 1005 "export function buildCostLedger(...) {".
4. read pin :1065-1073 (displayed 1064-1076): 1064-1070 doc comment; 1067 "// symlinked intermediate planted after the chain check, while EEXIST here"; 1071 "export function appendRoutingHealth(contractRoot, rows) {".
5. Pin identity: git -C /fast/scratch/kumitate-r36/src rev-parse HEAD = 31c465f15669f744848bd9f5d56191c5085670f7 (matches the pin). wc -l evidence.mjs = 1167.
6. Note at lane revision 753446a829edda519c75777ce95888443f51fa94 exported read-only via git show <rev>:corpus/knowledge/native-trial-launch.md to /fast/scratch/kumitate-r38/FixNTL09/note-753446a.md (450 lines); paragraph lines 404-409 identical to the working copy.
7. Anchor placement in the note: paragraph starts at 404 (the item's "note line 404"); `:520` and `:1003` sit on line 408, `:1067` on line 409.
8. Side observation, not an anchor and not changed: note header line 402 reads "(1163 L)"; pin evidence.mjs is 1167 lines.
9. Installs: none. Lane files untouched; only this report written (scratch under /fast/scratch/kumitate-r38/FixNTL09/).
