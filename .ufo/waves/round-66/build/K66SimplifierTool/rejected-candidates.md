# Deletion candidates measured and DECLINED (with reasons)

The gate has no dead code: V8 coverage over the 33-case selftest plus the real CLI runs shows every function and
every non-defensive branch exercised (see EVIDENCE.md §7). What remains are duplicate authorities, each measured:

| # | candidate | saving | why declined |
|---|---|---|---|
| R1 | unify `ledgerRows`' separator test with `routedItems.sep` (i.e. add `&& l.includes('-')` to `ledgerRows`) | 0 lines | behaviour change on uncovered input: a `| |`-shaped ledger row is currently skipped as a separator; with the guard it would become `ROW_MALFORMED:cells=1`. Sounder, but no case and no contract sentence forces it — left as finding K66SimplifierTool-2. |
| R2 | drop `export` from `norm`, `ledgerRows`, `evaluate` (only `routedItems` has a caller: `.ufo/waves/round-66/probe/c1-controls.sh:30`) | 0 lines | −0 lines, and it narrows a surface a later gate may import; a frozen-round churn that buys nothing. |
| R3 | fold the classes-block class re-check (v1 line 231) into the main row loop by iterating validated rows | 1 line | changes which rows contribute `CLASS`/`RECURRENT` (today every syntactically valid `class` cell counts, matching the counter's independent class count in L3); would diverge from the counter. |
| R4 | validate `class` in `ledgerRows` (parse time) instead of in `evaluate` | 2 lines + 1 regex | moves the finding from the row loop to the pre-loop `malformed` block: changes `first=` and `rows=` for malformed-class rows. Unverified output change. |
| R5 | table-drive the six row validations (`const CHECKS = [[id, fn], …]`) | ~3 lines | trades boring straight-line checks for indirection at a gate; a second convention for one site. |
| R6 | table-drive `main`'s argv parsing | ~4 lines | same; `val()` closure and the `try` already handle the shared case. |
| R7 | drop the entity/`<script>` stripping from `norm` | 3 lines | `corpus/lessons/round-1.md` is the only corpus file with entities today, but any answer `path:line` may point there, and the docblock promises "markup-normalised" matching; removing it relaxes a contract sentence's intent. |
| R8 | drop `--ledger` (no case uses it; the counter and control use the default) | 3 lines | it is a documented CLI sentence in the docblock; removing it deletes a contract sentence, which the review gate forbids. |
| R9 | drop the `existsSync(root)` pre-check in `main` | 1 line | changes `FAIL-CLOSED reason=root-absent:<dir>` into `ledger-absent`, losing a diagnostic the CLI run in EVIDENCE.md §5 exercises. |
| R10 | drop the `?? ''` read fallback in `evaluate` | 0 lines | defensive for `--rev` on a renamed/absent spot-check; fail-open would silently count 0 items for that round. |
| R11 | recompute nothing: cache answer-file text per path across rows | 0 lines | adds a Map for ≤ a few dozen rows; the tool is not hot. |
