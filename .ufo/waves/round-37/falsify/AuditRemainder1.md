AUDIT Remainder1 anchors=22 false=16 overreverted=0 notice=bad verdict=refuted

Scope: corpus/knowledge/remaining-scripts-census.md. Lane HEAD 86c0676, working tree clean for this file, restoration commit 5ceb8cd (ancestor of HEAD). Base = 0614092. Pre-restoration (round-36) = 91da27c6 (identical note to 5833351). Pinned source /fast/scratch/kumitate-r36/src, HEAD 31c465f15669f744848bd9f5d56191c5085670f7 (verified).
Group 1/8 = changed anchors #1-#22 of 172 in document order (172/8 = 21.5, rounded up; working-tree lines 466-520). "Changed" = a working-tree anchor (path:line[-end]) not present on its 0614092 line. Symbol = the backticked identifier the sentence attaches to the anchor, read by hand from the sentence. Automated symbol attribution mis-assigned chained `:N` tokens and dotted keys, so it was not used for verdicts.
Codes: ON = symbol on cited line; NO = absent; ON* = literal ON but wrong referent (not counted in false=).

| # | wt L | wt anchor (symbol) | pinned line at wt anchor | wt | base 0614092 | r36 | class |
|---|---|---|---|---|---|---|---|
| 1 | 466 | config.json:24 (maxEntryHtmlBytes) | 24 = `"maxSubjectChars": 160` | NO | :23 ON | :23 ON | FALSE; base TRUE moved off |
| 2 | 466 | config.json:6 (grokWeb.bin) | 6 = `"charterOrigin"` | NO | :8 ON | :6 NO | FALSE; r36 value kept |
| 3 | 466 | config.json:6 (grokWeb.launcher) | 6 | NO | :13 ON | :6 NO | FALSE; r36 value kept |
| 4 | 466 | config.json:6 (kimi.bridge) | 6 | NO | :16 ON | :6 NO | FALSE; r36 value kept |
| 5 | 474 | sync.mjs:717-718 (BEGIN_MARKER, "exported") | 717 = `split(BEGIN_MARKER)`; export is :56 | ON* | :56 ON | :57 NO | wrong referent; r36 value replaced |
| 6 | 478 | timer:9 (WorkingDirectory=) | 9 = `Unit=charter-scribe.service` | NO | service:10 ON | service:10 ON | FALSE; file moved off base |
| 7 | 484 | timer:5 ([Timer]) | 5 = `OnBootSec=10min` | NO | :4 ON | :5 NO | FALSE; r36 value kept |
| 8 | 495 | timer:11 ([Install]) | 11 = `[Install]` | ON | :12 NO | :11 ON | TRUE; base was FALSE, r36 value kept |
| 9 | 504 | check-hand-authored-sets.test.mjs:14 (DECLARED_PRE_HOOKS) | 14 = import from "./check-hand-authored-sets.mjs" | ON* | mjs:35 ON | mjs:35 ON | wrong file for .mjs member |
| 10 | 504 | ...test.mjs:82 (enumerateSets, via #9 path) | test.mjs has no enumerateSets | NO | mjs:82 ON | mjs:82 ON | FALSE; cascade from #9 |
| 11 | 512 | check-routing-free-config.test.mjs:12 (checkRoutingFreeConfig) | 12 = import from "./check-routing-free-config.mjs" | ON* | mjs:87 ON | mjs:87 ON | wrong file for .mjs member |
| 12 | 520 | fleet-dispatcher.test.mjs:2848-2852 (check(name, ok, detail = null)) | 2848-2852 = checks.filter / rmSync / process.exit; no check( call | NO | :51 ON | :3-8 NO | FALSE; def is at :51 |
| 13 | 520 | :2850 (KEEP, "sets") | 2850 = `if (!KEEP) rmSync(...)`, a read not a set | ON* | :38 ON | :38 ON | claim mismatch (use-site) |
| 14 | 520 | rotate.test.mjs:42 (LIFECYCLE_SCHEMA) | 42 = import list entry | ON* | dispatcher:36 ON | :36 ON | wrong file; cascade source |
| 15 | 520 | rotate:85 (fillerLine) | symbol absent from file | NO | dispatcher:85 ON | :85 ON | FALSE; inherits #14 path |
| 16 | 520 | rotate:226 (runDispatcher) | absent | NO | :226 ON | :226 ON | FALSE; inherits #14 path |
| 17 | 520 | rotate:40 (UFO_TEST_SCRATCH) | absent | NO | :40 ON | :33 NO | FALSE |
| 18 | 520 | rotate:33 (MAX_LEDGER_SEGMENTS) | absent | NO | :33 ON | :34 NO | FALSE |
| 19 | 520 | rotate:273 (MAX_LEDGER_READ_BYTES) | absent | NO | :34 ON | :34 ON | FALSE; inherits #14 path |
| 20 | 520 | rotate:273 ("section 1", no symbol) | 273 = `});` closing an unrelated test | NO | dispatcher:273 = `// ── 1. status over >32MiB` ON | :3-8 NO | FALSE |
| 21 | 520 | rotate:285 (fixture_exceeds_read_budget) | absent | NO | :285 ON | :285 ON | FALSE; inherits #14 path |
| 22 | 520 | rotate:293 (coverageComplete === true) | absent | NO | :293 ON | :293 ON | FALSE; inherits #14 path |

Counts for group 1:
- Restored exactly to 0614092: 0 of 22.
- Restored-but-still-false (the 16 FALSE rows): every one was TRUE at 0614092. Rows 2, 3, 4, 7 are round-36 values the repair did not revert. Rows 1, 6, 10, 12, 15-22 were moved to false lines.
- Overreverted (true round-36 improvement reverted to a base-false line): 0. The only row that is base-FALSE is #8 (base :12 is WantedBy). The working tree kept the true round-36 value :11.
- ON* rows (5, 9, 11, 13, 14) are literal-true but attach the sentence's claim to the wrong file or site.

Notice (working-tree line 2, "Round-37 anchor-truth restoration (2026-10-21)"): present, but accuracy is bad.
- Claim "Anchors in this note were reverted to the lines their 0614092 sentences named" is false. Key-level: 521 base anchors; 350 still on their base line; 171 are not. 172 working-tree anchors differ from 0614092.
- Of 122 round-36-shifted base anchors (lead's figure is 123; key-level here gives 122), 96 are back on base lines and 26 are not (group-1 rows 2-5, 7, 8, 12, 17, 18, 20).
- 145 anchors that round-36 never shifted (base = r36) were changed anyway. Group-1 rows 1, 6, 9-11, 13-16, 19, 21, 22 are in this class.
- Causes visible in group 1: #14 changed a full path to rotate.test.mjs:42; the short `:N` forms that follow in that paragraph (#15-#22) now resolve to that file without any text change. #9 did the same to #10. #9 and #11 moved .mjs-member anchors into test-file imports. Section `## scripts/check-hand-authored-sets.mjs` (L502-504) now has no anchor in its own file. Read by hand, not probed.
- The disclaimer "treat line anchors here as at their base revision" conflicts with lines in the same note that say "re-censused at 31c465f1" (e.g., L504, L512).

Evidence (commands and key output):
E1. `git -C <lane> diff -U0 0614092 -- corpus/knowledge/remaining-scripts-census.md` gives 145 diff lines in one file. A python line/key alignment in /fast/scratch/kumitate-r37/AuditRemainder1/ gives: anchors base/wt/r36 = 521/521/521; wt changed = 172; r36-shifted base = 122 (96 restored, 26 not); unshifted-but-changed = 145.
E2. `git -C <lane> show 91da27c6:corpus/...note` equals `5833351:` (True). `git status --short -- <note>` prints nothing. `git merge-base --is-ancestor 5ceb8cd HEAD` returns ancestor.
E3. Pinned greps (`/fast/scratch/kumitate-r36/src/scripts/...`):
- config.json: 6 charterOrigin; 8 "bin"; 13 "launcher"; 16 "bridge"; 23 maxEntryHtmlBytes; 24 maxSubjectChars.
- sync.mjs: 56 `export const BEGIN_MARKER`; 57 `export const END_MARKER`; 717 `split(BEGIN_MARKER)`.
- service:10 `WorkingDirectory=`. timer: 4 `[Timer]`; 5 `OnBootSec=10min`; 9 `Unit=`; 11 `[Install]`; 12 `WantedBy=`.
- check-hand-authored-sets.mjs: 35 `export const DECLARED_PRE_HOOKS`; 82 `export function enumerateSets`. .test.mjs: 14 is an import; no enumerateSets in it.
- check-routing-free-config.mjs: 87 `export function checkRoutingFreeConfig`. .test.mjs: 12 is an import.
- fleet-dispatcher.test.mjs: 33 MAX_LEDGER_SEGMENTS; 34 MAX_LEDGER_READ_BYTES; 36 LIFECYCLE_SCHEMA def; 38 KEEP def; 40 UFO_TEST_SCRATCH; 51 `function check`; 85 fillerLine; 226 runDispatcher; 285 check("fixture_exceeds_read_budget"); 293 coverageComplete.
- fleet-ledger-rotate.test.mjs: of the 12 symbols searched, only LIFECYCLE_SCHEMA matches (lines 42, 75, 621; line 624 is context only).
E4. `read` of dispatcher 2844-2852 (verdict block: `checks.filter`, `if (!KEEP) rmSync`, `process.exit`); dispatcher 273 = `// ── 1. status over >32MiB`; rotate 273 = `});`; dispatcher 3-8 = header comment list, no `check(`.

Verification gaps:
- Overreverted was assessed for group 1 only. The 96 restored and 26 unrestored shifts elsewhere were not symbol-checked.
- The note's member-probe was not run (its script is not in /tmp). The own-file finding comes from reading L502-504.
- The "spot-check D1" cited in the notice was not examined.
- No installs or updates. Git was used read-only; `git status` may refresh the index. Nothing was written to lane, fleet, or sibling paths. Scratch only: /fast/scratch/kumitate-r37/AuditRemainder1/.
