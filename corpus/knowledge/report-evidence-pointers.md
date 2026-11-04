source: S229
verified-at: 2026-11-04 (committed GNU grep capture read; round-79 Amendment 1 supplies the local design contract)
recheck: on-release for S229; after pointer resolution changes, run `node .ufo/waves/round-79/probe/probe79-c2.mjs --set c2` from the lane root

# A report's evidence pointers are evidence

A report's evidence includes its pointers, not merely the existence of similar bytes somewhere else. A pointer resolving to nothing is reference drift even when the intended content survives under another name. The round-79 frozen plan records ten such pointers in the filed round-78 report; the first is `close/proxy-json.txt`. This historical count comes from the plan, not a fresh execution here.

## Separate absence from error

S229, GNU grep manual §2.3 Exit Status, gives the ordinary status distinction:

> 0 if a line is selected, 1 if no lines were selected, and 2 if an error occurred.

The manual qualifies this rule: quiet mode can return success on a selected line despite an error, and other implementations can use error statuses above 2. This entry adopts the ordinary three-way distinction, not those exceptions or a claim about every tool.

The lane's design rule is analogous: a gate must distinguish a dead pointer/non-match (absence) from an unreadable report or unverifiable revision (error). Absence needs the pointer or intended artifact repaired; error needs the input/access/revision problem repaired before a verdict can be trusted. An error must not become a clean result or an ordinary missing-pointer count. GNU grep documents grep; applying that separation to a report gate is a local design decision.

## Local resolution contract

Round-79 Amendment 1 deepens `scripts/report-receipt-diff.mjs` to v4 instead of creating a second report tool. Its new finding is `POINTER_DEAD`. Eligible backticked repository-path tokens use the gate's extension allow-list and have `:line` selectors stripped. Resolve each against these three bases:

1. The lane tree supplied by `--lane`.
2. The report's own directory.
3. The round base `<lane>/.ufo/waves/round-<N>/`, inferred from the report's round context.

With `--rev`, resolve candidate paths against that revision's git tree (`git ls-tree`), not current worktree existence: a file added after the revision cannot satisfy an older-revision pointer. Scheme tokens such as HTTPS and agent URLs are excluded. Receipt-shaped tokens remain `RECEIPT_MISSING`, never a duplicate `POINTER_DEAD` finding.

A dead eligible pointer produces drift (exit 1); an unreadable/absent report or unverifiable revision fails closed (exit 2). These are specified local behaviors, not observed gate results in this note. S229 supports the absence/error distinction; it does not prescribe the lane's path grammar, bases, finding names, or implementation.
