# K78ExecKDerive — C1 implementation

Axes: operability (orchestration/tooling), coverage:kimi-layer.

## Delivery

Base: `ad2630d0566a561ee078f47fade5644a22c10621`. `build/K78ExecKDerive/patch.diff` plus full replacement files at the same build directory (`scripts/kimi-census.mjs`, `scripts/proxy-check.mjs`, `SCORECARD.md`). Patch generated directly against base bytes using read-only `git show` and `diff -u`; applicability was not tested. A pinned archive, rather than checkout/shared clone, avoided mutating git under the fleet restriction.

Census exports `decide(root, runningUid)` with the requested shared members/identities/indices, findings, rows, counts, infos and families; verify delegates. CLI passes a guarded uid; neither decision nor verify calls process.getuid. Existing verdict rendering is unchanged. The proxy imports that decision, removes the duplicate member table and enumeration helper, computes K_findings, compares it through the existing exact-delta mechanism, and scores findings rather than section count. K_sections remains derived and compared. Hermetic K fixtures are now shape-clean 55-member trees. Existing K expectations were migrated to findings scoring; five new arms cover clean/mode/stray/missing/tamper. No tests were deleted. Scorecard documents the new key and formula, inserts K_findings=0 in order, and re-pins the two edited scripts. Other score terms and frozen probes are untouched.

## Exact changed regions

Unified-diff hunk coordinates (old/new lines):

- scripts/kimi-census.mjs: @@ -114,7 +114,7 @@; @@ -261,7 +261,7 @@; @@ -276,6 +276,7 @@; @@ -288,6 +289,7 @@; @@ -310,6 +312,7 @@; @@ -331,6 +334,7 @@; @@ -341,7 +345,7 @@; @@ -410,7 +414,20 @@; @@ -441,7 +458,7 @@; @@ -706,7 +723,7 @@
- scripts/proxy-check.mjs: @@ -32,16 +32,14 @@; @@ -175,8 +173,9 @@; @@ -195,11 +194,11 @@; @@ -218,7 +217,7 @@; @@ -312,7 +311,7 @@; @@ -323,6 +322,7 @@; @@ -523,7 +523,7 @@; @@ -603,56 +603,13 @@; @@ -675,7 +632,7 @@; @@ -761,10 +718,6 @@; @@ -902,51 +855,11 @@; @@ -1022,7 +935,7 @@; @@ -1033,7 +946,8 @@; @@ -1463,6 +1377,9 @@; @@ -1550,25 +1467,21 @@; @@ -1582,6 +1495,11 @@; @@ -1762,12 +1680,10 @@; @@ -1822,7 +1738,7 @@; @@ -1832,13 +1748,13 @@; @@ -1878,10 +1794,10 @@; @@ -1901,13 +1817,13 @@; @@ -1939,7 +1855,7 @@; @@ -2160,7 +2076,7 @@; @@ -2181,15 +2097,44 @@; @@ -2197,11 +2142,11 @@; @@ -2209,29 +2154,29 @@; @@ -2242,22 +2187,22 @@; @@ -2265,11 +2210,11 @@; @@ -2279,9 +2224,9 @@; @@ -2297,29 +2242,29 @@; @@ -2334,13 +2279,13 @@; @@ -2355,7 +2300,7 @@; @@ -2377,10 +2322,8 @@; @@ -2396,7 +2339,7 @@; @@ -2408,8 +2351,6 @@; @@ -2419,15 +2360,13 @@; @@ -2438,16 +2377,16 @@; @@ -2463,8 +2402,6 @@; @@ -2482,8 +2419,8 @@; @@ -2543,7 +2480,7 @@; @@ -2731,7 +2668,7 @@; @@ -2772,7 +2709,7 @@; @@ -2962,7 +2899,7 @@
- SCORECARD.md: @@ -272,7 +272,7 @@; @@ -285,6 +285,11 @@; @@ -302,6 +307,7 @@; @@ -312,9 +318,9 @@

## Evidence and gate ownership

No build, test, linter, formatter, smoke run, proxy run, counter run, or git-apply check was executed. The developer fleet policy explicitly reserves verification for the parent after integration, overriding the task request to run receipts. The four named .txt files are explicit NOT RUN notices with no fabricated exit codes or output. Parent must execute all four commands with TMPDIR under its assigned scratch root and retain actual statuses; held=12/12, selftest pass counts and live MATCH remain unobserved. No claim of acceptance is made.

Observed script byte hashes used for scorecard pins:
- proxy-check: `12391b3e090c0d0773cc6db44795703a23d602d8255b83a8bdd037a7df947013`
- kimi-census: `7ea6b793028e2918ca920f0a5d225382bf687740d4cbee4545db963e50572439`

LSP is unavailable: no LSP tool is exposed in this session; text discovery/editing was used. No tools installed or updated. No credentials/session content read.

## Risks and blockers

Runtime behavior and all 151 migrated regression cases plus five new cases remain unverified. Parent owns final pin reconciliation if another patch edits these scripts/scorecard. The historical scorecard rows remain historical; new prose records the current formula. The only blocker is verification ownership, not missing implementation data.

## Self-evaluation

Accuracy 4/5: implementation grounded in displayed base code; runtime correctness unmeasured. Completeness 4/5: implementation and packaging complete, requested executed receipts prohibited. Clarity 5/5: NOT RUN notices distinguish absent evidence. Actionability 4/5: patch and replacements supplied, parent gates still needed. Conciseness 4/5: exact changed-region inventory is necessarily long. Overall 4.2/5. Improvement: parent executes the four recorded gates after integration. Would the user agree? The missing executed receipts are explicitly disclosed rather than claimed.
