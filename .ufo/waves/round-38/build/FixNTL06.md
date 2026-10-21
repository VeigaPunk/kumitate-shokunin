ITEM FixNTL06 anchors=3 move=3 token=0 move_token=0 debt=0
VERDICT native-trial-launch#23 MOVE 217 | pin 217 is the definition, quoted: `export const ROUTING_HEALTH_OUTCOMES = new Set([`. The note sentence (line 385, `ROUTING_HEALTH_OUTCOMES` (`:223`)) documents that constant, and the paired symbol occurs only on 217 in base.mjs. Current :223 is pin `]);`, the Set's closing bracket, which lacks the symbol. Round-36 value 120 lands on the neighbour `export const GODSPEED_MARKER = "| godspeed";` (wrong symbol).
VERDICT native-trial-launch#26 MOVE 758 | pin 758 is the definition, quoted: `export function classifyFailure(message) {`. The note (lines 386-387) reads "Classifier `classifyFailure`", i.e. the classifier definition, not a mention. Pin 682 is `? values` (ternary inside interval(), lines 681-687) and carries no classifyFailure token. The other occurrences are not the target: 62 is a comment, 916 is the call `const failureClass = classifyFailure(message);`.
VERDICT native-trial-launch#27 MOVE 297 | pin 297 is the definition, quoted: `export function die(message) {`. The note (lines 387-388) reads "Typed rejection helper `die`", i.e. the helper definition. Pin 303, quoted ``process.stderr.write(`BLOCKED: ${message}\n`);``, is inside die's body and has no die token; the first die occurrence in base.mjs is 297. Round-36 value 126 is not a die occurrence.

EVIDENCE
- Pin identity: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` -> 31c465f15669f744848bd9f5d56191c5085670f7 (matches pin). `wc -l base.mjs` -> 1002.
- Note header line 380 says "(955 L)"; the pin file is 1002 lines. Stale count, out of scope; no anchor verdict depends on it.
- Note sentence starts line 382 (matches item's note line). Anchors: `:223` on 385; `base.mjs:682` on 387; `:303` on 388.
- Convention check: sibling anchor `SEAT_CLASS_BY_ROLE` (`:196`) points at the definition line (pin 196: `export const SEAT_CLASS_BY_ROLE = {`), so definition-line anchors match the note's own style.
- grep `classifyFailure|ROUTING_HEALTH_OUTCOMES` over base.mjs: matches 62, 217, 758, 916. No match on 223 or 682.
- grep `\bdie\b` over base.mjs: 55 occurrences; first is 297 (definition). No occurrence on 303, 126, or 120.
- read base.mjs 223 -> `]);`; 682 -> `? values` (681: `const terminalValues = role === "main"`); 303 -> process.stderr.write(BLOCKED line); 120 -> `export const GODSPEED_MARKER = "| godspeed";`.
- glob pin lib dir -> events.mjs evidence.mjs policy.mjs screening.mjs base.mjs; grep `refusal-line` over pin scripts -> no match, so the note's "deleted refusal-line.mjs" claim holds at the pin.
- Installs: none. Pin and lane untouched; report written only to .ufo/waves/round-38/build/FixNTL06.md.
