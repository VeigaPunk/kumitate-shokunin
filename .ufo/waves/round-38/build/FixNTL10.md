ITEM FixNTL10 anchors=4 move=4 token=0 move_token=0 debt=0
VERDICT native-trial-launch#41 MOVE 66 | pin 66 `export function splitRoute(route) {` is the definition the sentence "Route parse `splitRoute`" documents; cited pin 39 is blank; other occurrences 97,98,117,140,236,261 are call sites only
VERDICT native-trial-launch#42 MOVE 173 | pin 173 `export function loadSeatRoutingMirror(contractRoot, roles) {` is the definition (only occurrence); cited pin 155 `    });` closes `map.set(role, {` inside requireRoleRoutes (103-158)
VERDICT native-trial-launch#43 MOVE 301 | pin 301 `export function verifyLaunchSeatRouting(launch, mirror, roleRoutes) {` is the definition (only occurrence); cited pin 283 `      requested: seat.requested,` sits inside loadSeatRoutingMirror's `table.set(role, {` (173-292)
VERDICT native-trial-launch#44 MOVE 637 | pin 637 `export function resolveNativeProfile(config, name) {` is the definition (only occurrence); cited pin 619 `    herdWindowMs: input.backpressure.herdWindowMs,` sits inside parseProfileRecovery (559-621)
EVIDENCE
- Pin identity: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` = 31c465f15669f744848bd9f5d56191c5085670f7 (read-only); `wc -l policy.mjs` = 942.
- Note read (lane file, read-only), lines 416-419: 416 "Route parse `splitRoute` (`scripts/collect-omp-native-handoff-lib/policy.mjs:39`);" / 417 "seat-routing mirror `loadSeatRoutingMirror` (`:155`) +" / 418 "`verifyLaunchSeatRouting` (`:283`); profile resolve `resolveNativeProfile`" / 419 "(`:619`); round plan `readRoundPlan` (`:704`); wave token".
- Pin 29-51: lines 38, 39, 40 are blank; line 41 begins the "Selector grammar" comment.
- Pin occurrence grep (splitRoute|loadSeatRoutingMirror|verifyLaunchSeatRouting|resolveNativeProfile): splitRoute at 66 (def), 97, 98, 117, 140, 236, 261; loadSeatRoutingMirror only at 173; verifyLaunchSeatRouting only at 301; resolveNativeProfile only at 637.
- Pin 66-68: `export function splitRoute(route) {` then `try { return parseRoute(route, { allowEffortless: true });` = the route-parse body the sentence describes, so 66 is the definition, not a mention.
- Pin 117 `const parsed = splitRoute(row.requested);` and 236/261 are callers inside requireRoleRoutes / loadSeatRoutingMirror, not definitions.
- Pin 722 `export function readRoundPlan(runRoot, manifest) {`: the round-36 value 722 offered for #44 is readRoundPlan's definition, so that shift landed on the wrong symbol. Round-36 values for #41 (66), #42 (173), #43 (301) coincide with the verified definition lines.
- Out of this item's scope, observed in passing: the section header says "(924 L)" but the pin file is 942 lines; note anchor `readRoundPlan` (`:704`) does not match its pin definition at 722. Not checked: `:780`, `:879`, `:908` in the same paragraph.
- Installs/updates: none (no tool needed; pacman not used).
- Lane files, lane jj/git state, and lane scripts were not touched; only the report file was written.
