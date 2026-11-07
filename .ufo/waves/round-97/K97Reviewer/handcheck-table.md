## Case hand-check — 30 hand-derived census-grammar cases

Fixture per case: `<context line>\n<test line>\n<probe row>\n`, probe row
`| S<n> | Probe S<n> https://example.test/S<n> | docs | B | scope | §1 | teaches S<n> | queued | 2026-10-01 | 90d | — |`
(NF=13, valid id). `OUT` = census E12 for the probe row and `rows=0`; `IN` = no E12 and `rows=1`.
Expectation is hand-derived from `sources-census.sh` `row_pass` (gawk RS=`\n`, `line=$0`, CR kept):
`^ {0,3}##[ \t]` -> `sub(/^ {0,3}/,"")` -> `trim(substr(line,3))` with `trim` = `[ \t]` only -> `== "Registry"`;
`^ {0,3}#[ \t]` clears; every other line keeps; `in_registry` starts 0; rows need `^ {0,3}\|` and
`/^\|[ \t]*S[0-9]{3,}[ \t]*\|/` for E12. Confirmed live by `sources-census.sh validate --file` and
`census --file` (receipt `handcheck-census.tsv`, rerun `handcheck-tool-318497b5.tsv`, 30/30 agree).

| # | context | test line (JSON) | expect | census | tool |
|---|---|---|---|---|---|
| 01 | `## Registry` | `"## Registry"` | IN/1 | IN/1 | IN/1 |
| 02 | `## Leads (unopened)` | `"## Registry"` | IN/1 | IN/1 | IN/1 |
| 03 | `## Registry` | `"## Registry\r"` | OUT/0 | OUT/0 | OUT/0 |
| 04 | `## Registry` | `"##\tRegistry"` | IN/1 | IN/1 | IN/1 |
| 05 | `## Registry` | `"##\u000bRegistry"` | IN/1 | IN/1 | IN/1 |
| 06 | `## Registry` | `"### Registry"` | IN/1 | IN/1 | IN/1 |
| 07 | `## Registry` | `"# Title"` | OUT/0 | OUT/0 | OUT/0 |
| 08 | `## Registry` | `"#\tTitle"` | OUT/0 | OUT/0 | OUT/0 |
| 09 | `## Registry` | `"#"` | IN/1 | IN/1 | IN/1 |
| 10 | `## Registry` | `"# "` | OUT/0 | OUT/0 | OUT/0 |
| 11 | `## Leads (unopened)` | `"  ## Registry"` | IN/1 | IN/1 | IN/1 |
| 12 | `## Leads (unopened)` | `"    ## Registry"` | OUT/0 | OUT/0 | OUT/0 |
| 13 | `## Leads (unopened)` | `"\t## Registry"` | OUT/0 | OUT/0 | OUT/0 |
| 14 | `## Registry` | `" \t## Registry"` | IN/1 | IN/1 | IN/1 |
| 15 | `## Registry` | `"## Registry ##"` | OUT/0 | OUT/0 | OUT/0 |
| 16 | `## Registry` | `"## Registry\u00a0"` | OUT/0 | OUT/0 | OUT/0 |
| 17 | `## Registry` | `"##  Registry"` | IN/1 | IN/1 | IN/1 |
| 18 | `## Registry` | `"##\u00a0Registry"` | IN/1 | IN/1 | IN/1 |
| 19 | `## Leads (unopened)` | `"##\r"` | OUT/0 | OUT/0 | OUT/0 |
| 20 | `## Registry` | `"## "` | OUT/0 | OUT/0 | OUT/0 |
| 21 | `## Registry` | `"##\t"` | OUT/0 | OUT/0 | OUT/0 |
| 22 | `# Title` | `" ## Registry"` | IN/1 | IN/1 | IN/1 |
| 23 | `## Registry` | `"## Registry\t"` | IN/1 | IN/1 | IN/1 |
| 24 | `## Registry` | `"## Registry\u000b"` | OUT/0 | OUT/0 | OUT/0 |
| 25 | `## Registry` | `"## registry"` | OUT/0 | OUT/0 | OUT/0 |
| 26 | `## Registry` | row indented 4 spaces | none/0 | none/0 | none/0 |
| 27 | `## Leads (unopened)` | row indented 4 spaces | none/0 | none/0 | none/0 |
| 28 | `## Registry` | row `|\tS…` | IN/1 | IN/1 | IN/1 |
| 29 | `## Leads (unopened)` | row `|\tS…` | OUT/0 | OUT/0 | OUT/0 |
| 30 | `## Leads (unopened)` | row indented 3 spaces | OUT/0 | OUT/0 | OUT/0 |

`none/0` = the line does not start a row at all (4-space code) and the census counts no row:
no finding on either side. Every case confirms the grammar used by frozen rule R97; there is no
census behaviour in this battery that R97's text does not describe.
