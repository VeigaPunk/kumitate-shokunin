ITEM FixS834 anchors=4 move=2 token=2 move_token=0 debt=0
VERDICT remaining-scripts-census#382 MOVE 81 | sentence documents the returned `label` field; pin 81 `    label: activity.label,` is its object-literal definition inside `return {` (65-82); pin 27 `*            resumeHint, activity, label }` is a doc-comment mention only; pin 66 `    schema: OBSERVATION_SCHEMA,` holds none of the listed fields (phase 72, terminal 73, suspendedReason 75, failureClass 77, activity 80, label 81); round-36 value 27 rejected.
VERDICT remaining-scripts-census#383 MOVE 59 | sentence says queued prefers configured `task?.route`; pin 59 `      ? [task?.route, task?.lastDispatch?.route]` is the queued candidate list with it first; pin 58 `    : lifecycle.phase === "queued"` has no `task?.route`; round-36 value 57 `    ? [task?.lastDispatch?.route, task?.route]` is the working arm, so rejected.
VERDICT remaining-scripts-census#389 TOKEN 1 | sentence clause "then exit 1 (`:124`)" describes pin 124 `    process.exitCode = 1;` (current line right); `cliErrorCode` sits on 12/108/117, not 124; `exit` is only a non-word-bounded prefix of `exitCode`, so `1` is the sole word-bounded token shared by sentence and line (weak lexical override); the cliErrorCode claim is covered by range `:116-124` via pin 117 `      code: cliErrorCode(error),`.
VERDICT remaining-scripts-census#391 TOKEN attested | test name at pin 39 `test("working phase prefers the attested serving route over the configured route", () => {` is the working-phase claim (current line right); `reconcileObservation` occurs on test lines 3 (comment), 30 (import), 36 (`pair` call), none of which is the claim; `attested` is word-bounded on 39 and in note line 676.

Evidence
E1 pin: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` -> 31c465f15669f744848bd9f5d56191c5085670f7; both pin files mtime 00:57:10 (unchanged); no pin writes by me.
E2 lane: `git show 753446a8…:corpus/knowledge/remaining-scripts-census.md` -> /fast/scratch/kumitate-r38/FixS834/census-753446a8.md; `diff` against working copy: IDENTICAL.
E3 note 672 clauses: "...returning `phase`/`terminal`/`suspendedReason`/`failureClass`/`activity`/`label` fields (`:66`)"; "`queued` prefers configured `task?.route` (`:58`)"; "Failures use `ufo-mission-observation-error-v1` (`:116-124`) with `cliErrorCode` ... then exit 1 (`:124`)".
E4 note 676: "working phase prefers the dispatcher's attested serving route (`scripts/ufo-mission-observation.test.mjs:39`)".
E5 grep `label` pin mjs: 27 (doc comment), 81 `label: activity.label,`; 65 `  return {`, 66 `    schema: OBSERVATION_SCHEMA,`.
E6 grep `task?.route|task.route` pin mjs: code 57 and 59; comments 50, 51, 54; line 58 has none.
E7 grep `cliErrorCode|exitCode|emitErrorJson` pin mjs: 12 import, 108 comment, 117 `code: cliErrorCode(error),`, 123, 124 `    process.exitCode = 1;`.
E8 grep `reconcileObservation|attested|test(` pin test: 3, 30, 36 for reconcileObservation; 39 is the working-phase test declaration.
E9 gate-design.md L36-37: an override token must be word-bounded on the cited line(s) AND in the note sentence. `exit` fails against `exitCode`; `1` passes both checks. MOVE verdicts pair positionally with the last backticked symbol (`label`, `task?.route`), and both occur on the new lines.
E10 disclosed side effect: my `git status --porcelain` on the pin (~04:18) refreshed /fast/scratch/kumitate-r36/src/.git/index (stat cache only; status empty, HEAD unchanged). Future pin git calls need GIT_OPTIONAL_LOCKS=0.
E11 out of scope, not verdicted: note 672 says "blank candidates fall through"; pin 61-63 `candidates.find((route) => typeof route === "string")` filters on type only. [INFERENCE] blank-string handling, if any, lives in projectMissionActivity (not checked).
E12 suggestion for the lane owner, not an anchor repair: naming `process.exitCode` in the 672 clause would give a word-bounded symbol on line 124.
E13 installs: none. Scratch writes: /fast/scratch/kumitate-r38/FixS834/ only.
