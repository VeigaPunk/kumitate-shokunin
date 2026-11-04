## Registry binding — family O1 (round 76)

Family `O1` is the OMP agent-plane registry slot; its member gate is `scripts/omp-census.mjs` (`kumitate-omp-census-v1`).
The round-76 proxy derivation is `coverage_omp = floor(10 × C1o/C1o_total × (O_members − O_findings)/O_members)`; a zero denominator scores 0.
`C1o` counts registry rows matching `/^\| O\d+ \|/` whose coverage cell starts `yes`; `C1o_total` counts all matching rows.
`O_members` counts live depth-1 root entries, including sidecars and generations; `O_findings` counts census findings, not distinct bad members (including EMPTY and NOTE_UNBOUND).
`O_bound` counts bound declarations from the 26 base-member names and 9 chain-family ids; it is reported separately, not multiplied into the score.
This index references the existing tables rather than re-declaring their kinds, ceilings or writer evidence. Anchors are original note lines at `cabc7aefd5f1562299f757e23207710c12e4ed58`; append-only additions preserve them.
“Members” means § Members OMP names (S053, S055, S060, S224); “Chains” means § Chain families — who writes each generation.

| Declared identifier | Owner slot | Existing binding row |
|---|---|---|
| `RULES.md` | base member | Members L46 |
| `agent.db` | base member | Members L33 |
| `agents` | base member | Members L43 |
| `blobs` | base member | Members L43 |
| `cache` | base member | Members L43 |
| `config.yml` | base member | Members L38 |
| `custom-session-files` | base member | Members L43 |
| `history.db` | base member | Members L34 |
| `hooks` | base member | Members L46 |
| `kimi-device-id` | base member | Members L42 |
| `last-changelog-version` | base member | Members L37 |
| `lsp.json` | base member | Members L40 |
| `mcp.json` | base member | Members L39 |
| `mcp.json.rea.backup` | base member | Chains L62 |
| `models.db` | base member | Members L35 |
| `models.yml` | base member | Members L41 |
| `predict` | base member | Members L43 |
| `sessions` | base member | Members L43 |
| `skill-descriptions.db` | base member | Members L36 |
| `terminal-sessions` | base member | Members L43 |
| `themes` | base member | Members L44 |
| `tools` | base member | Members L44 |
| `commands` | base member | Members L44 |
| `prompts` | base member | Members L44 |
| `memories` | base member | Members L44 |
| `extensions` | base member | Members L45 |
| `agent-pre-restore` | chain family | Chains L59 |
| `agent-recovered` | chain family | Chains L60 |
| `history-corrupt` | chain family | Chains L57 |
| `agent-corrupt` | chain family | Chains L58 |
| `mcp-pre-disable` | chain family | Chains L61 |
| `mcp-rea-backup-recovery` | chain family | Chains L62 |
| `config-pre` | chain family | Chains L63 |
| `agent-pre-named` | chain family | Chains L64 |
| `models-corrupt` | chain family | Chains L65 |

Binding requires a visible identifier token delimited on both sides by start/end or a character outside `[\w.\-]`: HTML comments are stripped; fenced code still binds. Lexical binding does not verify writers.
Absent members and absent chain generations are INFO, not findings; an empty root remains a finding.
Member content is out of scope by design: the root-shape path uses only `readdir` + `lstat`; reading this binding note is separate. No credential, configuration or database content is inspected.
S226 in `corpus/SOURCES.md` names the installed-release re-grounding of `packages/utils/src/dirs.ts` at v18.15.0. Re-open that row and its capture to re-check the directory-member subset; it does not establish other writers or settle the UNKNOWN models-store recovery opt-in above.
