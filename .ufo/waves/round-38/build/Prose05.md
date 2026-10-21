ITEM Prose05 anchors=10 token=6 move_token=3 debt=1 skip=0
VERDICT remaining-scripts-census#334 MOVE_TOKEN 1442 stalled | 1424 is the closing `};` of makeRunningRow (1408-1424), a brace with no token; the sentence's claim is asserted at 1442 ("malformed receipts must not abort or mask the later stalled row"), with 1446-1447 pinning "skipped"; claim is true, only the anchor moves
VERDICT remaining-scripts-census#357 TOKEN window | 38 opens test("window reason (250 cp, ...)"); 39-40 assert the 250-cp case; sentence "250-code-point window case"
VERDICT remaining-scripts-census#358 TOKEN maximal | 51 opens test("maximal reason (code 256 + ... = 514 cp)"); 52-57 build the 514-cp blocker; sentence "maximal reason"
VERDICT remaining-scripts-census#359 TOKEN short | 60 opens test("short reason (<= activity bound)..."); 61-63 assert the short label shape; sentence "short-reason control"
VERDICT remaining-scripts-census#360 TOKEN explicit | 66 opens test("explicit distinct activity is still appended..."); 71 asserts the append; sentence "explicit-activity append"
VERDICT remaining-scripts-census#361 TOKEN bounded | 74 opens test("renderMissionActivity round-trips the bounded label"); 77-79 assert the round-trip; "round-trip" fails word-bounded on "round-trips", so "bounded" is used
VERDICT remaining-scripts-census#362 TOKEN wall | 2 "Display evidence only. The wall/dispatcher still own every lifecycle mutation." supports display-only and no mutation; no write call in the file (grep hits are comments only); capital "Display" cannot match the sentence's "display"
VERDICT remaining-scripts-census#371 DEBT empty-operand-reads-stdin | sentence says an explicit empty operand is refused "rather than silently rebinding to stdin"; pin 211 `if (source && source !== "-")` sends "" to the stdin read (219); CLI 245-246 passes args[0] unchecked; 227 is the not-JSON refusal; runtime: "" behaves exactly like "-"
VERDICT remaining-scripts-census#376 MOVE_TOKEN 262 redactFsErrorMessage | 262 is the fs-redaction branch and the claim holds, but no word is shared (sentence: "fs messages redacted"; lines 262-263 carry redactFsErrorMessage/error/message); same-line sentence fix: name `redactFsErrorMessage` in the sentence
VERDICT remaining-scripts-census#377 MOVE_TOKEN 265 exitCode | 265 `process.exitCode = 1;` supports "at exit 1"; the only shared word is "1" (not distinctive); "exit" is not word-bounded in "exitCode"; same-line sentence fix: write "at `process.exitCode = 1`"
EVIDENCE
1. `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` = 31c465f15669f744848bd9f5d56191c5085670f7 (matches the gate-design pin).
2. `git rev-parse 753446a…:corpus/knowledge/remaining-scripts-census.md` = `git hash-object corpus/knowledge/remaining-scripts-census.md` = 1ecb95baa61fb0033f775a43d41f60a5118d2575 (working note is lane revision 753446a).
3. note 652: "...malformed null/numeric receipt rows skipped without masking the later stalled row (`:1424`)."
4. pin l0-monitor 1408 `const makeRunningRow = (name, receiptTopLevel) => {`; 1424 `    };` (helper end); 1425-1427 build nullRow, numberRow, stalledRow.
5. pin l0-monitor 1442 `assert.equal(stalled.length, 1, "malformed receipts must not abort or mask the later stalled row");`; 1446-1447 `"malformed-receipt rows are skipped, not surfaced with whip decisions");`
6. pin lifecycle 211 `if (source && source !== "-") {`; 219 `raw = readBoundedFd(0, MAX_INPUT_BYTES, "input", ...)`; 222 `if (text.trim() === "") invalid("input is empty");`; 227 `invalid(\`input is not JSON: ...\`);`
7. pin lifecycle 245-246: `if (args.length > 1 || args[0]?.startsWith("--")) invalid(...)` / `const input = readBoundedJsonInput(args[0]);`; no empty-operand check exists.
8. runtime in scratch copy /fast/scratch/kumitate-r38/Prose05/scripts (node v24.21.0; pinned copy only, not run in lane): `printf '' | node ... ""` gives `{"schema":"ufo-mission-lifecycle-error-v1","code":"INVALID_INPUT","message":"input is empty"}` exit=1; `printf '{"task":{}}' | node ... ""` and `... -` both give `task.runId is invalid` exit=1.
9. pin lifecycle 2: `// Display evidence only. The wall/dispatcher still own every lifecycle mutation.`; grep for writeFile|appendFile|unlink|rename|mkdir|rmSync|copyFile|truncate|createWriteStream|openSync|symlink|chmod matches only lines 192, 204, 237, all comments; no write call.
10. pin lifecycle 261-263: `message: operatorFs` / `? redactFsErrorMessage(error)` / `: error instanceof Error ? error.message : String(error),`
11. pin lifecycle 265: `    process.exitCode = 1;`
12. Out of scope, flagged only: note 668 also pairs `readBoundedJsonInput` with `:215`; that symbol is defined at pin 202, and 215 is `if (error?.code === "ELOOP") invalid("input must be a regular file");`.
13. Fix options, not applied: 371 means reword to what the code does (empty operand falls through to stdin, `:211`) or change the code (out of scope); 376/377 need the sentence edits above; 334 moves the anchor to 1442.
14. Tooling: nothing installed (node v24.21.0 pre-existing); no lane or pin writes; scratch copy only.
