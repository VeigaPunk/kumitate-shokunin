ITEM FixS832 anchors=4 move=4 token=0 move_token=0 debt=0
VERDICT remaining-scripts-census#363 MOVE 85 | Sentence documents the function (`projectMissionLifecycle ... validates snapshots`); its definition is pin line 85 `export function projectMissionLifecycle(input) {`; 96 is the function's closing `}` and 247 is a CLI call mention.
VERDICT remaining-scripts-census#368 MOVE 174 | Sentence says the function "emits a `ufo-mission-lifecycle-v1` envelope"; the emitted schema string is pin line 174 `schema: "ufo-mission-lifecycle-v1",` in the `return {` at 173; 187 is the closing `}` and 17 is a `@property` typedef mention, not the emission.
VERDICT remaining-scripts-census#369 MOVE 168 | Sentence documents "an advisory `resumeHint`"; the definition is pin line 168 `const resumeHint = phase === "suspended" && task?.state === "paused"` (computes the advisory hint); 181 is `suspendedReason,` — a different envelope field — while 28 is a typedef mention and 185 the shorthand emission mention.
VERDICT remaining-scripts-census#370 MOVE 202 | Sentence documents the boundary (`Input crosses one shared boundary, readBoundedJsonInput`); its definition is pin line 202 `export function readBoundedJsonInput(source) {`; 215 is an ELOOP branch inside the body and 246 a CLI call mention.
Evidence (pin = /fast/scratch/kumitate-r36/src/scripts/ufo-mission-lifecycle.mjs @ 31c465f1):
- read 85: `export function projectMissionLifecycle(input) {`
- read 96: `}` (current #363 anchor — closing brace, symbol absent)
- read 168: `const resumeHint = phase === "suspended" && task?.state === "paused"`
- read 181: `suspendedReason,` (current #369 anchor — different field)
- read 173-174: `return {` / `    schema: "ufo-mission-lifecycle-v1",`
- read 187: `}` (current #368 anchor — function end)
- read 202: `export function readBoundedJsonInput(source) {`
- read 215: `if (error?.code === "ELOOP") invalid("input must be a regular file");` (current #370 anchor — inner branch)
- Note line 668 (raw) quotes: "`projectMissionLifecycle` (`scripts/ufo-mission-lifecycle.mjs:96`) validates snapshots", "emits a `ufo-mission-lifecycle-v1` envelope (`:187`) ... an advisory `resumeHint` (`:181`)", "Input crosses one shared boundary, `readBoundedJsonInput` (`scripts/ufo-mission-lifecycle.mjs:215`)".
- Parser-paired symbol equals the sentence's symbol in all four cases; no TOKEN/MOVE_TOKEN/DEBT cases. Round-36 reference values 85 and 202 agree; 17 and 28 were typedef mentions, not sentence targets.
