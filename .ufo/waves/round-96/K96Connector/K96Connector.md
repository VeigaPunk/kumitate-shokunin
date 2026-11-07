# Kumitate Round 96 — Seat K96Connector Report
**Contract:** `kumitate-round-gate-v1` / R96 frozen rule / Godspeed leaf connector  
**Date:** 2026-11-06  
**Scope:** Parser parity across three section parsers deciding "outside Registry" on `corpus/SOURCES.md`, plus sibling tool transfer inventory.

---

## 1. Deciding Lines of the Three Parsers

### (i) Census gawk `row_pass` (`scripts/sources-census.sh:608-624`)
*Authority for rule R96 (`in_registry` state):*
```awk
    {
      line=$0
      if (line ~ /^ {0,3}##[ \t]/) {
        sub(/^ {0,3}/,"",line)
        in_registry=(trim(substr(line,3))=="Registry")
        next
      }
      if (line ~ /^ {0,3}#[ \t]/) { in_registry=0; next }
      if (line !~ /^ {0,3}\|/) next
      sub(/^ {0,3}/,"",line)
      $0=line
      if (!in_registry) {
        if (mode=="validate" && $0 ~ /^\|[ \t]*S[0-9]{3,}[ \t]*\|/) {
          id=trim($2)
          printf "%s\tE12\t%s row outside Registry section\n",lane,id
        }
        next
      }
```
*Note:* `trim(s)` at line 581 is `gsub(/^[ \t]+|[ \t]+$/,"",s); return s`. It strips only ASCII spaces and tabs, preserving `\r`.

### (ii) Census bash `usedby_findings` (`scripts/sources-census.sh:540-552`)
```bash
  local heading_re='^ {0,3}##[[:space:]]' top_heading_re='^ {0,3}#[[:space:]]'
  local table_re='^ {0,3}\|'
  local -a cells=() paths=()
  while IFS= read -r line; do
    if [[ "$line" =~ $heading_re ]]; then
      line="${line#"${line%%[! ]*}"}"
      section=$(trim_cell "${line:2}")
      [ "$section" = Registry ] && in_registry=1 || in_registry=0
      continue
    fi
    if [[ "$line" =~ $top_heading_re ]]; then in_registry=0; continue; fi
    [ "$in_registry" = 1 ] || continue
    [[ "$line" =~ $table_re ]] || continue
```
*Note:* `heading_re` uses `[[:space:]]`. `trim_cell` (lines 531-536) strips `[[:space:]]`, which includes `\r` and `\t`.

### (iii) Lane `sources-check.mjs` (`kumitate-shokunin/scripts/sources-check.mjs:191, 197-208, 228-236`)
```javascript
  const sourceLines = sourceText.split(/\r?\n/).map(normalizeMarkdownIndent);
...
  const headings = Object.create(null);
  const sectionAtLine = [];
  let activeSection = null;
  for (let index = 0; index < sourceLines.length; index += 1) {
    const match = /^## (.+?)\s*$/.exec(sourceLines[index]);
    if (match) {
      activeSection = match[1];
      headings[activeSection] = true;
    } else if (/^#(?:\s|$)/.test(sourceLines[index])) {
      activeSection = null;
    }
    sectionAtLine[index] = activeSection;
  }
...
  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index];
    if (!line.startsWith('|')) continue;
    const fields = line.split('|');
    const id = trim(fields[1] ?? '');
    if (sectionAtLine[index] !== 'Registry') {
      if (/^\|[ \t]*S\d{3,}[ \t]*\|/.test(line)) {
        add('error', 'ROW_OUTSIDE_REGISTRY', 'corpus/SOURCES.md', index + 1, `id=${id} row outside Registry section`);
      }
      continue;
    }
```
*Note:* `normalizeMarkdownIndent` (lines 136-138) executes `line.replace(/^ {1,3}(?=\S)/u, '')`. `split(/\r?\n/)` strips `\r`. Heading matching regex `/^## (.+?)\s*$/` requires an ASCII space after `##` and does not match a tab `\t`.

---

## 2. Parity Table

### Fixtures and Commands Executed
Fixtures constructed from `kumitate-shokunin/.ufo/waves/round-96/probe/probe96-c1.mjs` (`FA` and `FB` definitions):
- Standard fixtures: `/fast/scratch/hyaku/kumitate-r96/K96Connector/fx-standard/FA.md`, `FB.md`
- Crafted fixtures (every row given status `mined`, 13 fields, and `used-by` path `missing/<id>.md` to test bash `in_registry` via E11): `/fast/scratch/hyaku/kumitate-r96/K96Connector/fx-crafted/corpus/FA.md`, `FB.md`
- Scratch lane copies for `sources-check.mjs`: `/fast/scratch/hyaku/kumitate-r96/K96Connector/fx-check-a`, `fx-check-b`

Commands run:
1. `scripts/sources-census.sh validate --file /fast/scratch/hyaku/kumitate-r96/K96Connector/fx-standard/FA.md` (receipt: `.ufo/waves/round-96/K96Connector/receipt_census_fa.txt`)
2. `scripts/sources-census.sh validate --file /fast/scratch/hyaku/kumitate-r96/K96Connector/fx-standard/FB.md` (receipt: `.ufo/waves/round-96/K96Connector/receipt_census_fb.txt`)
3. `scripts/sources-census.sh validate --file /fast/scratch/hyaku/kumitate-r96/K96Connector/fx-crafted/corpus/FA.md` (receipt: `.ufo/waves/round-96/K96Connector/receipt_census_crafted_fa.txt`)
4. `scripts/sources-census.sh validate --file /fast/scratch/hyaku/kumitate-r96/K96Connector/fx-crafted/corpus/FB.md` (receipt: `.ufo/waves/round-96/K96Connector/receipt_census_crafted_fb.txt`)
5. `node kumitate-shokunin/scripts/sources-check.mjs --self /fast/scratch/hyaku/kumitate-r96/K96Connector/fx-check-a` (receipt: `.ufo/waves/round-96/K96Connector/receipt_sources_check_fa.txt`)
6. `node kumitate-shokunin/scripts/sources-check.mjs --self /fast/scratch/hyaku/kumitate-r96/K96Connector/fx-check-b` (receipt: `.ufo/waves/round-96/K96Connector/receipt_sources_check_fb.txt`)

### Table: Clause Row -> Parsers (i)/(ii)/(iii) State
Legend:
- **(i) gawk `row_pass`**: Authority R96. INSIDE: passes to field parsing (emits W03/E01/W02); OUTSIDE: emits `E12 row outside Registry section`.
- **(ii) bash `usedby_findings`**: INSIDE: sets `in_registry=1` (emits `E11 missing used-by` on crafted row); OUTSIDE: `in_registry=0` (no E11).
- **(iii) lane `sources-check.mjs`**: INSIDE: `sectionAtLine === 'Registry'` (emits MINED_UNUSED / ROW_MALFORMED / REJECTED_*); OUTSIDE: emits `ROW_OUTSIDE_REGISTRY`.

| Fixture | Clause / Preceding Line | Row ID | (i) Census gawk | (ii) Census bash | (iii) Lane sources-check | Status |
|:---|:---|:---|:---:|:---:|:---:|:---:|
| **FIX-A** | Line 1, before any heading | `S901` | OUTSIDE | OUTSIDE | OUTSIDE | Agreement |
| FIX-A | `## Registry` (opening) | `S001` | INSIDE | INSIDE | INSIDE | Agreement |
| FIX-A | Inside Registry, 12 fields | `S002` | INSIDE | INSIDE | INSIDE | Agreement |
| FIX-A | Inside Registry, rejected | `S003` | INSIDE | INSIDE | INSIDE | Agreement |
| FIX-A | `### Sub-band` (level-3 heading) | `S004` | INSIDE | INSIDE | INSIDE | Agreement |
| FIX-A | `    ## Leads` (4-space indent) | `S005` | INSIDE | INSIDE | INSIDE | Agreement |
| FIX-A | `##Leads` (no space) | `S006` | INSIDE | INSIDE | INSIDE | Agreement |
| FIX-A | ````text\n## Leads\n```` (inside fence) | `S007` | OUTSIDE | OUTSIDE | OUTSIDE | Agreement |
| FIX-A | `## Registry` (reopen, 3-space row) | `S008` | INSIDE | INSIDE | INSIDE | Agreement |
| FIX-A | `## Leads (unopened)` | `S020` | OUTSIDE | OUTSIDE | OUTSIDE | Agreement |
| FIX-A | `## Leads (unopened)`, URL-less | `S011` | OUTSIDE | OUTSIDE | OUTSIDE | Agreement |
| FIX-A | `## Leads (unopened)`, repeat ID | `S020` | OUTSIDE | OUTSIDE | OUTSIDE | Agreement |
| FIX-A | `## Leads (unopened)`, rejected | `S021` | OUTSIDE | OUTSIDE | OUTSIDE | Agreement |
| FIX-A | `## Leads (unopened)`, 12 fields | `S022` | OUTSIDE | OUTSIDE | OUTSIDE | Agreement |
| FIX-A | `## Registry ##` (closing sequence) | `S023` | OUTSIDE | OUTSIDE | OUTSIDE | Agreement |
| FIX-A | `## registry` (case difference) | `S024` | OUTSIDE | OUTSIDE | OUTSIDE | Agreement |
| FIX-A | `## Registry\r` (CRLF heading) | `S025` | **OUTSIDE** | **INSIDE** | **INSIDE** | **DISAGREEMENT (CRLF)** |
| FIX-A | `##\tRegistry` (tab after `##`) | `S026` | **INSIDE** | **INSIDE** | **INSIDE (artifact) / OUTSIDE (isolated)** | **DISAGREEMENT (Tab)** |
| FIX-A | `   ## Registry  ` (3-space, trailing space) | `S027` | INSIDE | INSIDE | INSIDE | Agreement |
| FIX-A | `# Appendix` (level-1 heading) | `S028` | OUTSIDE | OUTSIDE | OUTSIDE | Agreement |
| **FIX-B** | `## Registry\r\n` (CRLF file) | `S101` | **OUTSIDE** | **INSIDE** | **INSIDE** | **DISAGREEMENT (CRLF)** |
| FIX-B | `## Registry\r\n` (CRLF file) | `S102` | **OUTSIDE** | **INSIDE** | **INSIDE** | **DISAGREEMENT (CRLF)** |
| FIX-B | `## Registry\r\n` (CRLF file, rejected) | `S103` | **OUTSIDE** | **INSIDE** | **INSIDE** | **DISAGREEMENT (CRLF)** |

---

## 3. Disagreement List

### Finding 1: Intra-file Contradiction in Fleet Census on CRLF Headings
- **Parsers:** `scripts/sources-census.sh:609-612` (gawk `row_pass`) vs `scripts/sources-census.sh:544-547` (bash `usedby_findings`).
- **Clause:** `## Registry\r` in Fixture A (row `S025`) and all rows in Fixture B (`S101`, `S102`, `S103`).
- **Detail:** In gawk `row_pass`, `trim()` strips only `[ \t]`. `\r` remains attached, so `trim(substr(line, 3))` yields `"Registry\r"`, which does not equal `"Registry"`. Gawk classifies the section as outside and emits `E12 row outside Registry section`. In bash `usedby_findings`, `trim_cell` strips `[[:space:]]`, which removes `\r`, yielding `"Registry"`. Bash classifies the section as inside and emits `E11 missing used-by`. Running `sources-census.sh validate` on the same file emits both `E12` and `E11` simultaneously for the same row.
- **Route:** Fleet census → operator follow-up.

### Finding 2: `sources-check.mjs` Strips CRLF via `split(/\r?\n/)`
- **Parsers:** `kumitate-shokunin/scripts/sources-check.mjs:191` vs `scripts/sources-census.sh:609-612` (authority).
- **Clause:** `## Registry\r` (Fixture A row `S025` and Fixture B rows `S101`-`S103`).
- **Detail:** `sources-check.mjs` splits input lines using `/\r?\n/`, discarding carriage returns. Consequently, `## Registry\r` is normalized to `## Registry`, placing rows inside the Registry section. Frozen rule R96 and the census authority gawk script do not strip `\r`, keeping such rows outside.
- **Route:** Lane `sources-check.mjs` → next kumitate round follow-up.

### Finding 3: `sources-check.mjs` Tab-Separated Heading Incompatibility
- **Parsers:** `kumitate-shokunin/scripts/sources-check.mjs:200` vs census parsers (i) and (ii).
- **Clause:** `##\tRegistry` (Fixture A row `S026`).
- **Detail:** In `sources-check.mjs`, heading detection uses `/^## (.+?)\s*$/`, which requires a literal ASCII space after `##`. It fails to match `##\tRegistry` (tab). Because it also fails `/^#(?:\s|$)/`, the active section remains whatever was previously set. In FIX-A, `S026` was evaluated as inside only because `S025` preceding it had matched `## Registry\r`. If preceded by an outside heading (e.g. `## Leads`), `sources-check.mjs` fails to recognize `##\tRegistry` and stays in `Leads`. In contrast, both census parsers match `\t` via `^ {0,3}##[ \t]` and `^ {0,3}##[[:space:]]`.
- **Route:** Lane `sources-check.mjs` → next kumitate round follow-up.

### Finding 4: `source-dupes.mjs` Uses `.trim()` on Heading Text
- **Parsers:** `kumitate-shokunin/scripts/source-dupes.mjs:159` vs `scripts/sources-census.sh:609-612` (authority).
- **Clause:** `## Registry\r` (CRLF heading).
- **Detail:** `source-dupes.mjs` extracts the heading with `const h = line0.replace(/^ {0,3}/, '').replace(/^##[ \t]+/, '').trim()`. Because JavaScript `.trim()` strips `\r`, `h === 'Registry'` evaluates to `true` on `## Registry\r`. This is the exact defect tested by frozen control `ctl-crlftrim`.
- **Route:** Lane `source-dupes.mjs` → next kumitate round follow-up.

---

## 4. Sibling Transfer Table

Command executed:
```bash
grep -ln "SOURCES.md" /home/vgpnk/Projects/shokunin/*-shokunin/scripts/* 2>/dev/null
```
Receipt: `.ufo/waves/round-96/K96Connector/receipt_sibling_grep.txt`

### Tools Reading `SOURCES.md` Rows With NO Section Check
Every tool below extracts or validates `corpus/SOURCES.md` rows across the entire file without tracking whether the row is within `## Registry`.

| Lane | Tool File : Line | Reading Function / Pattern | Impact |
|:---|:---|:---|:---|
| `kumitate` | `scripts/cite-sources.mjs:36` | `registryIds`: `/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/` line loop | Considers outside rows as valid declared IDs |
| `kumitate` | `scripts/round-gate.mjs:418` | `declaredPins` (BASE): `SOURCES_ROW_RE.test(line)` | Considers outside rows as declaring upstream pins (C1 target) |
| `kumitate` | `scripts/source-capture.mjs:159` | `loadSourceIds`: `/^\s*\|\s*(S[0-9]{3,})\s*\|/gm` | Enforces capture bindings on outside rows |
| `tabi` | `scripts/check-bidi-runtime.mjs:474` | `parseRegistry`: `/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/` | Ingests outside rows into registry Map |
| `tabi` | `scripts/check-c2-knowledge-round41.mjs:42` | Regex `/^\|\s*${sid}\s*\|/m` | Resolves rows outside Registry |
| `tabi` | `scripts/check-decision-table.mjs:122` | `parseRegistry`: `/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/` | Ingests outside rows into decision table Map |
| `tabi` | `scripts/check-frontier-admission.mjs:126` | `parseRegistry`: `/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/` | Ingests outside rows into admission Map |
| `tabi` | `scripts/check-release-pins.mjs:118` | `parseRegistry`: `ROW_RE.test(line)` | Extracts release pin tags from outside rows |
| `tabi` | `scripts/check-source-reopen-receipt.mjs:108` | `supersessionRow`: `/^\|[\s]*${sid}[\s]*\|/m` | Matches supersession rows outside Registry |

*Fleet Exposure Context:* A fleet-wide census validate (`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin`) returns clean across all 21 lanes (rc=0, 21/21 ok, 0 E12, 0 E01), with zero outside row-shaped lines across all committed revisions. Therefore, all 9 section-blind tools currently observe identical row sets as a section-aware parser; the exposure is prospective (protecting future rounds against outside row contamination), matching the soundness framing established in round 95.

### Audited Sibling Tools With Compliant Section Checks
- `kake-shokunin/scripts/id_resolver.py:218`: Checks `REGISTRY_HEADING_RE = re.compile(r"^ {0,3}##[ \t]+Registry[ \t]*(?:#+[ \t]*)?$")` and resets on ATX/setext headings.
- `kumitate-shokunin/scripts/source-dupes.mjs:157`: Checks `^ {0,3}##[ \t]` with `h === 'Registry'` and resets on `^ {0,3}#[ \t]`.
- `kumitate-shokunin/scripts/sources-check.mjs:200`: Tracks `sectionAtLine` via `^## (.+?)\s*$` and checks `sectionAtLine[index] === 'Registry'`.
- `tabi-shokunin/scripts/check-sources.mjs:258`: Tracks `section === '## Registry'` and flags `row_outside_registry`.

### Audited Sibling Files Without Row Parsing
- `kake-shokunin/scripts/sitemap_audit.py`: Mention in docstring only.
- `kake-shokunin/scripts/sitemap_audit_selftest.py`: Mention in docstring only.
- `kumitate-shokunin/scripts/omp-census.mjs`: Mention in comment only.
- `kumitate-shokunin/scripts/wave-census.mjs`: Mention in docstring only.
- `tabi-shokunin/scripts/aria-loopback-round13.mjs`: Substring check only (`sourcesText.includes(...)`).
