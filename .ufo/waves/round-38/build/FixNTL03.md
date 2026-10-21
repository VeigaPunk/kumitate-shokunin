ITEM FixNTL03 anchors=4 move=4 token=0 move_token=0 debt=0
VERDICT native-trial-launch#6 MOVE 851 | pin 851 `export function parseArgs(argv) {` is the definition the sentence "Argv: `parseArgs`" documents; pin 844 `const VALUE_FLAGS = new Set([...]);` lacks the token parseArgs
VERDICT native-trial-launch#7 MOVE 965 | pin 965 `export function planLaunchMode(args, env = {}) {` is the definition; pin 958 `* Pure launch-mode resolution, kept separate from parseArgs so tests can` is a JSDoc prose mention and lacks the token planLaunchMode
VERDICT native-trial-launch#8 MOVE 176 | pin 176 `export function snapshotDispatchInputs({` is the definition; pin 171 `text: bytes.toString("utf8"),` is a field of readSnapshotFile's return object and lacks the token
VERDICT native-trial-launch#9 MOVE 639 | pin 639 `export function resolveNativeDispatchPolicy(snapshot, profileName = PROFILE, {` is the definition; pin 646 `fail("malformed", "canonical config snapshot is missing");` is a guard statement inside its body and lacks the token

Evidence:
- grep -E 'parseArgs|planLaunchMode|snapshotDispatchInputs|resolveNativeDispatchPolicy' on /fast/scratch/kumitate-r36/src/scripts/run-omp-native-trial.mjs: 14 matching lines, equal to the parser's lists. Definitions: 176, 639, 851, 965. Calls: 2711, 3257 (snapshotDispatchInputs); 2745, 3261 (resolveNativeDispatchPolicy); 3235 (parseArgs); 3238 (planLaunchMode). Comment mentions: 908, 2681, 2947 (resolveNativeDispatchPolicy); 958 (parseArgs).
- wc -l on the pin file = 4321; git -C /fast/scratch/kumitate-r36/src rev-parse HEAD = 31c465f15669f744848bd9f5d56191c5085670f7 (pin identity confirmed).
- The paragraph starts at note 352; the anchors sit at note 356 ("Argv: `parseArgs` (`:844`); launch mode: `planLaunchMode` (`:958`) from"), 357 ("interactive/headless/wall flags. Frozen dispatch: `snapshotDispatchInputs`") and 358 ("(`:171`) → `resolveNativeDispatchPolicy` (`:646`) with global OMP as sole").
- Pin 844 is `const VALUE_FLAGS = new Set([...]);`. Pin 3235 `const args = parseArgs(process.argv.slice(2));` is a call inside main.
- TOKEN for #7 considered and rejected: "launch" appears on pin 958 ("launch-mode") and in the note sentence, but the sentence documents the function planLaunchMode, and 957-964 is its JSDoc block, not its definition.
- Pin 161-174 is readSnapshotFile; pin 176 starts snapshotDispatchInputs. Calls: 2711 `freshSnapshot = snapshotDispatchInputs({`, 3257 `snapshot = snapshotDispatchInputs();`.
- Pin 639-651 is resolveNativeDispatchPolicy; 645 `if (!snapshot || snapshot.parsed == null) {` precedes 646.
- Round-36 values were not used as authority. For #8 the round-36 value 639 is resolveNativeDispatchPolicy's definition, so it is one symbol off. 851, 965 and 639 (#9) agree with the fresh reads.
- Note heading "(4304 L)" vs pin 4321 lines [INFERENCE: the note was written against a different revision]; verdicts are judged against the pin per the truth standard.
- Out of scope, observed only: note 353 gives `main` at `:3229`; pin 3234 is `function main() {` (read 3232-3243).
- Installs or updates: none (read, grep and bash only; no tool was needed).
