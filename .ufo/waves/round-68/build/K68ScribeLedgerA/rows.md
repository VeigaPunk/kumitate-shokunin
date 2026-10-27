# Draft routed-ledger rows — rounds 55–57 (seat K68ScribeLedgerA)

Draft only. Target file: `corpus/routed-ledger.md`. Paste the table body under
that file's `## Ledger` heading; column grammar is the frozen
`.ufo/waves/round-68/probe/ledger68-probe.mjs` `ledgerParse` rule, and every
row below is checked against the counter's own `items67`/`wb`/L3 arms by
`../K68ScribeLedgerA/check.mjs` (transcript in this dir's report).

Items: r55 = 3, r56 = 4, r57 = 4 (11 total). Status split: 7 closed, 4 open.
Classes are the canonical round-66 slugs (`.ufo/waves/round-66/build/K66ScribeClasses/table.md`,
rows 55.1-57.4 assign exactly these); do not substitute synonyms.

## Ledger

| id | round | k | quote | class | status | answer |
|---|---|---|---|---|---|---|
| R55-1 | 55 | 1 | "omitted the two trailing bookkeeping commits" | report-fidelity | closed | `corpus/lessons/round-56.md:31` — "this round's report lists every lane commit authored under round 56 including bookkeeping" |
| R55-2 | 55 | 2 | "Append-only correction entries owed in LOG.md and corpus/lessons/round-56.md" | tally-drift | closed | `LOG.md:2161` — "filed as B 9→10 measures B 9→11 over committed bytes" |
| R55-3 | 55 | 3 | "Carried (not this round's): R41-2 gate-pins ruling" | carried-unaddressed | open | - |
| R56-1 | 56 | 1 | "L2 floor unmet this round" | wave-shape | closed | `corpus/lessons/round-57.md:33` — "the L2 floor note records the orchestrator dispatches waves between rounds" |
| R56-2 | 56 | 2 | "stale frozen rules A54/A55" | frozen-predicate-defect | closed | `corpus/lessons/round-57.md:32` — "the A57 B7 arm freezes the amended convention" |
| R56-3 | 56 | 3 | "lands without a corpus/README.md map row" | reference-drift | closed | `corpus/README.md:168` — "repaired in round 57 by the readme-map gate" |
| R56-4 | 56 | 4 | "Carryovers unchanged: R41-2 gate-pins ruling" | carried-unaddressed | open | - |
| R57-1 | 57 | 1 | "two live L1s dispatched for one round" | dispatch-accounting | open | - |
| R57-2 | 57 | 2 | "append-only filed-bytes rule was not followed" | append-only-violation | closed | `corpus/lessons/round-58.md:56` — "filed under .ufo/reports/round-57/ was touched this round" |
| R57-3 | 57 | 3 | "B8 dead nonce-grep pathspec + absent argv assert" | frozen-predicate-defect | closed | `corpus/lessons/round-58.md:45` — "Routed-defect answers (round-57 → round-58, all four landed)" |
| R57-4 | 57 | 4 | "Carried L0 items unchanged" | carried-unaddressed | open | - |
