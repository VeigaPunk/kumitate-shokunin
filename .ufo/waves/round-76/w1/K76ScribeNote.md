# K76ScribeNote — registry-note draft

Axes: coverage:omp and operability; this seat supplies only the C1 documentation surface, not implementation or admission evidence.

Grounding: scratch clone checked out `cabc7aefd5f1562299f757e23207710c12e4ed58`; existing note lines 1–108 and census declarations/binding/counting code were read there. Frozen plan read first among lane files. Product files were not edited. No installs, commits, pushes, judge runs, or product gates.

## Paste-ready append-only note section

Append to `corpus/knowledge/omp-agent-root.md`; retain the historical source/verification header and existing member tables.

```markdown
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
```

## Frontier line

Replace the existing round-75 sub-bullet at baseline `corpus/README.md:312` with this single sub-bullet; do not append a second history bullet:

```markdown
  - advanced round 76: the harness **agent plane** (`~/.omp/agent` shape) is registry family `O1`; `scripts/omp-census.mjs` supplies the live member findings and note binding from which `scripts/proxy-check.mjs` derives `coverage:omp` and cross-checks its Axes row. `knowledge/omp-agent-root.md` indexes each declaration to its existing evidence; S226 re-grounds the directory resolver at the installed release without extending that evidence to other writers or member contents.
```

This is proposed post-integration wording, not a claim this scribe executed the new proxy or observed its admission.

## SOURCES row text

Append to `corpus/SOURCES.md` only alongside the source seat's captured bytes and provenance. This concise draft derives release/digest provenance from the existing artifact `.ufo/waves/round-76/build/K76ScoutDirsRelease/row-s226.md`, read by this seat; it is not an independent network fetch or checksum measurement. The source seat's full row remains the authoritative fuller enumeration.

```markdown
| S226 | oh-my-pi v18.15.0, packages/utils/src/dirs.ts — https://github.com/can1357/oh-my-pi/blob/3fedf8d53267e32a6d7521ce725fdcc4a36fdc67/packages/utils/src/dirs.ts | code | A | installed-release re-grounding of the agent-directory resolver and its member-name subset; not every census declaration or writer | tag v18.15.0 = 3fedf8d53267e32a6d7521ce725fdcc4a36fdc67; captured body `.ufo/waves/round-76/build/K76ScoutDirsRelease/dirs-v18.15.0.ts`; source-seat SHA-256 2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24, identical to S053's historical body | The directory-member source can be rechecked at the installed release rather than inferred from the historical release; other member writers and the models-store recovery opt-in retain their separately stated evidence limits | mined | 2026-11-04 | on-release | corpus/knowledge/omp-agent-root.md |
```

## Exact commands and observed outcomes

Setup (exit 0):

```sh
S=/fast/scratch/hyaku/kumitate-r76/K76ScribeNote && mkdir -p "$S" && git clone --shared /home/vgpnk/Projects/shokunin/kumitate-shokunin "$S/lane" && git -C "$S/lane" checkout -q cabc7aefd5f1562299f757e23207710c12e4ed58 && git -C "$S/lane" rev-parse HEAD && git -C "$S/lane" rev-parse --show-toplevel
```

Observed stdout:

```text
cabc7aefd5f1562299f757e23207710c12e4ed58
/fast/scratch/hyaku/kumitate-r76/K76ScribeNote/lane
```

The only executed check was the assignment-required small lexical script, operating over the existing note plus the proposed section. It extracts declarations from the scaffold census source and uses its exact comment-stripping and identifier-boundary rule. Script preserved at `.ufo/waves/round-76/build/K76ScribeNote/check.cjs`; section preserved beside it as `section.md`.

Command (exit 0):

```sh
node /fast/scratch/hyaku/kumitate-r76/K76ScribeNote/check.cjs
```

Output:

```text
revision=cabc7aefd5f1562299f757e23207710c12e4ed58
BASE_MEMBERS=26 CHAIN_FAMILIES=9 DECLARED_NAMES=35
BOUND RULES.md
BOUND agent.db
BOUND agents
BOUND blobs
BOUND cache
BOUND config.yml
BOUND custom-session-files
BOUND history.db
BOUND hooks
BOUND kimi-device-id
BOUND last-changelog-version
BOUND lsp.json
BOUND mcp.json
BOUND mcp.json.rea.backup
BOUND models.db
BOUND models.yml
BOUND predict
BOUND sessions
BOUND skill-descriptions.db
BOUND terminal-sessions
BOUND themes
BOUND tools
BOUND commands
BOUND prompts
BOUND memories
BOUND extensions
BOUND agent-pre-restore
BOUND agent-recovered
BOUND history-corrupt
BOUND agent-corrupt
BOUND mcp-pre-disable
BOUND mcp-rea-backup-recovery
BOUND config-pre
BOUND agent-pre-named
BOUND models-corrupt
bound=35/35 missing=none
section_lines=52 index_rows=35 table_separator_counts=4
```

For replay after scratch removal, place the preserved `check.cjs` and `section.md` together in a private scratch root, with a `lane` clone at the revision printed above. No claim is made that the scratch-root command remains executable after mandatory cleanup.

## Findings, limits and touched surfaces

- Unbound declared identifiers: none in the checked concatenation. The index is 35 rows and the proposed section 52 lines, within the requested ceiling; every table row has exactly four pipe separators for three cells.
- Existing note already contained the declaration tokens; this draft adds registry/proxy explanation and a location index, not newly measured root coverage.
- Important counting distinction: `O_findings` is the census findings-array length, not a count of distinct affected members; note-binding failures contribute too. `O_bound` is not a formula multiplier.
- Source subset versus census policy remains explicit. Reading S226 cannot independently authenticate operator copies or establish the models-store recovery opt-in.
- Only this report and this seat's build receipts are lane writes. Proposed product surfaces are the note append, the Frontier sub-bullet replacement, and S226; L1 applies them. Census, proxy, scorecard, oracle, index and frozen plan were not edited.
- C1/C2 acceptance gates, mutation kills, live-root counts, network capture and release identity were not rerun by this seat. No admission judgment follows from this lexical check.
- Process limitation: clone setup was a one-shot shell without a persistent EXIT trap. Mandatory final receipt-copy/cleanup uses an EXIT trap so the scratch clone is removed, rather than relying on shell-session persistence.
- No tool installations or updates.

## Self-evaluation

Accuracy 4/5: lexical claims have executable output; upstream capture provenance is attributed to the source seat rather than independently reproduced. Completeness 5/5: section, index, formula terms, binding rule, scope limits, Frontier replacement, S226 draft and enumeration are supplied. Clarity 4/5: original line anchors are stable only under append-only integration. Actionability 5/5: section is paste-ready and source artifact paths are explicit. Conciseness 4/5: this auditable report necessarily repeats the section preserved as a standalone artifact. Overall 4.4/5. Highest-impact integration consideration: keep the appendix append-only so its original-row anchors remain valid. A reader should agree the draft is lexical documentation evidence, not a proxy acceptance receipt.

## Receipt preservation and cleanup

Executed once, exit 0, no stdout; the shell EXIT trap removed this seat's scratch root after copying the two small deliverables:

```sh
S=/fast/scratch/hyaku/kumitate-r76/K76ScribeNote; trap 'rm -rf -- "$S"' EXIT; B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76ScribeNote; mkdir -p "$B" && cp "$S/section.md" "$S/check.cjs" "$B/"
```
