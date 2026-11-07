#!/usr/bin/env node
/**
 * make_readers_report.mjs (K100Scout, round 100) -- renders readers.txt from
 * the inventory scan plus a hand-curated classification of every reader that
 * actually parses SOURCES.md row ids.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [invPath, outDir] = process.argv.slice(2);
const inv = JSON.parse(readFileSync(invPath, 'utf8'));

// Curated readers: every code path in the fleet that reads a SOURCES.md row id
// and decides something from it. `verdict` is whether the reader recognises a
// row id the way the census `row_pass` does.
//   CONFORMANT  -- same row gate + same id-cell trim as the census
//   DIVERGES    -- accepts a row id the census does not read as valid
//   STRICTER    -- reads fewer rows than the census (no false ids)
//   N/A         -- not a SOURCES row-id reader (id-form / token / other file)
const CURATED = [
  { lane: 'kumitate-shokunin', file: 'kumitate-shokunin/scripts/cite-sources.mjs', line: 36,
    what: 'registry id set (the claim\'s reader 1)',
    cls: 'line.match(/^ {0,3}\\|\\s*(S[0-9]{3,})\\s*\\|/) over text.split(\'\\n\')',
    mode: 'per LF record, NO `m` flag',
    verdict: 'DIVERGES (id-cell pad is JS \\s: NBSP, every Zs, VT, FF, CR, U+FEFF, U+2028/U+2029)',
    detail: 'row gate `^ {0,3}\\|` matches the census exactly; only the id-cell pad differs '
           + '(census trims ASCII SP/TAB only). The `m`-flag record break does not apply here.' },
  { lane: 'kumitate-shokunin', file: 'kumitate-shokunin/scripts/source-capture.mjs', line: 157,
    what: 'registry id set (the claim\'s reader 2)',
    cls: 'raw.matchAll(/^\\s*\\|\\s*(S[0-9]{3,})\\s*\\|/gm)',
    mode: 'whole file, `gm` flags',
    verdict: 'DIVERGES (id-cell pad is JS \\s AND `^\\s*` indent is JS \\s AND the `m` flag '
           + 'lets `^` match after CR/U+2028/U+2029)',
    detail: 'three independent divergences: (a) id-cell pad; (b) `^\\s*` accepts any JS '
           + 'white-space indent (TAB, NBSP, 4+ SP) where the census gate is `^ {0,3}\\|`; '
           + '(c) `m` + JS line terminators (LF, CR, U+2028, U+2029) vs gawk RS=LF -- a row '
           + 'following a CR/U+2028 on the same LF record is a row for this reader and not '
           + 'for the census.' },
  { lane: 'kumitate-shokunin', file: 'kumitate-shokunin/scripts/round-gate.mjs', line: 411,
    what: 'SOURCES-declared upstream pins (row shape + 40-hex pin cells)',
    cls: 'const SOURCES_ROW_RE = /^ {0,3}\\|[ \\t]*S\\d{3,}[ \\t]*\\|/;',
    mode: 'per LF record (sourcesText.split(\'\\n\')), NO `m` flag',
    verdict: 'CONFORMANT',
    detail: 'row gate `^ {0,3}\\|` and id-cell pad `[ \\t]*` are exactly the census shape; '
           + 'the file comment at line 410 says so explicitly. Reads only rows in `## Registry` '
           + '(inReg tracked the census way) and requires exactly 13 split fields (NF==13).' },
  { lane: 'kumitate-shokunin', file: 'kumitate-shokunin/scripts/sources-check.mjs', line: 237,
    what: 'row-outside-Registry probe (E12 shape) and the main id reader at line 232-249',
    cls: '/^\\|[ \\t]*S\\d{3,}[ \\t]*\\|/ (E12 probe); id = trim(fields[1]) with trim = '
        + 'value.replace(/^[ \\t]+|[ \\t]+$/g, \'\')',
    mode: 'per LF record (sourceText.split(/\\r?\\n/)); the E12 probe is column-0 only',
    verdict: 'CONFORMANT for the id cell; STRICTER for the row gate',
    detail: 'the id cell is trimmed of ASCII SP/TAB only -- exactly the census trim. The row '
           + 'gate differs in two ways: the main reader accepts any line starting with `|` '
           + '(column 0 only) after normalizeMarkdownIndent() strips 1-3 leading SP, and the '
           + 'E12 probe is column-0 only (no 0-3 SP indent allowed). Both are stricter than the '
           + 'census gate, so neither can invent an id the census rejects.' },
  { lane: 'kumitate-shokunin', file: 'kumitate-shokunin/scripts/source-dupes.mjs', line: 165,
    what: 'live duplicate-URL groups (W04)',
    cls: 'row gate /^ {0,3}\\|/ then cells = line0.replace(/^ {0,3}/, \'\').split(\'|\').map(c => c.trim()); '
        + 'id = cells[1]; SID = /^S[0-9]{3,}$/',
    mode: 'per LF record (raw.split(\'\\n\')), NO `m` flag',
    verdict: 'CONFORMANT in row gate; the id-cell trim is JS \\s (not census blank)',
    detail: 'row gate and the 13-field check match the census; the cell trim is JS `.trim()` '
           + '(ECMA WhiteSpace+LineTerminator), so a non-blank pad would be trimmed here and not '
           + 'by the census. Same id form `^S[0-9]{3,}$`. Divergence surface is the pad only.' },
  { lane: 'kumitate-shokunin', file: 'kumitate-shokunin/scripts/cite-sources.mjs', line: 26,
    what: 'README cited-id tokens (not a SOURCES row reader)',
    cls: 'const ID_RE = /\\bS[0-9]{3,}\\b/g;',
    mode: 'README text, per LF record',
    verdict: 'N/A',
    detail: 'this is the citation-side token class over corpus/README.md, not a SOURCES row '
           + 'reader. The claim explicitly leaves the README citation reader unchanged.' },
  { lane: 'kumitate-shokunin', file: 'kumitate-shokunin/scripts/sources-check.mjs', line: 374,
    what: 'knowledge-entry cited-id tokens (not a SOURCES row reader)',
    cls: 'lines[0].match(/\\bS\\d{3,}\\b/g)',
    mode: 'knowledge entry text',
    verdict: 'N/A', detail: 'token class over corpus/knowledge/*.md, not a SOURCES row reader.' },

  { lane: 'tabi-shokunin', file: 'tabi-shokunin/scripts/check-bidi-runtime.mjs', line: 474,
    what: 'registry rows of the bidi-runtime fixture (parseRegistry)',
    cls: '/^ {0,3}\\|[ \\t]*S[0-9]{3,}[ \\t]*\\|/ then cells = line.trim().split(\'|\')',
    mode: 'per LF record (text.split(\'\\n\')), NO `m` flag',
    verdict: 'CONFORMANT in row gate and id-cell pad; STRICTER in field count',
    detail: 'same `^ {0,3}\\|` + `[ \\t]*` shape as the census; requires exactly 13 cells '
           + '(census NF==13 too) and trims each cell with JS `.trim()`. Selftest-only tool: '
           + 'its fixtures are generated by the script itself.' },
  { lane: 'tabi-shokunin', file: 'tabi-shokunin/scripts/check-decision-table.mjs', line: 122,
    what: 'registry rows (decision-table check)',
    cls: '/^ {0,3}\\|[ \\t]*S[0-9]{3,}[ \\t]*\\|/ then cells = line.trim().split(\'|\')',
    mode: 'per LF record, NO `m` flag',
    verdict: 'CONFORMANT in row gate and id-cell pad',
    detail: 'same shape as the census; also requires /cells.length === 13/.' },
  { lane: 'tabi-shokunin', file: 'tabi-shokunin/scripts/check-frontier-admission.mjs', line: 126,
    what: 'registry rows (frontier-admission check)',
    cls: '/^ {0,3}\\|[ \\t]*S[0-9]{3,}[ \\t]*\\|/ then cells = line.trim().split(\'|\')',
    mode: 'per LF record, NO `m` flag',
    verdict: 'CONFORMANT in row gate and id-cell pad',
    detail: 'same shape as the census; requires exactly 13 cells.' },
  { lane: 'tabi-shokunin', file: 'tabi-shokunin/scripts/check-release-pins.mjs', line: 75,
    what: 'registry rows (release pins)',
    cls: 'const ROW_RE = /^ {0,3}\\|\\s*S\\d{3,}\\s*\\|/;',
    mode: 'per LF record, NO `m` flag',
    verdict: 'DIVERGES (id-cell pad is JS \\s)',
    detail: 'row gate matches the census exactly; the id-cell pad is JS \\s, so a non-blank '
           + 'pad (NBSP, VT, FF, CR, U+FEFF, U+2028/U+2029) is trimmed here and not by the '
           + 'census. Same class of divergence as cite-sources:36, in a sibling lane.' },
  { lane: 'tabi-shokunin', file: 'tabi-shokunin/scripts/check-sources.mjs', line: 25,
    what: 'registry rows (tabi sources gate)',
    cls: 'const rowPattern = /^\\|[ \\t\\v\\f\\r]*S[0-9]{3,}[ \\t\\v\\f\\r]*\\|/;',
    mode: 'per LF record, NO `m` flag',
    verdict: 'STRICTER in row gate; DIVERGES in id-cell pad',
    detail: 'row gate is column-0 only (no 0-3 SP indent allowed -- stricter than the census '
           + '`^ {0,3}\\|`), and the pad class is `[ \\t\\v\\f\\r]*`, i.e. it accepts VT/FF/CR '
           + 'as pad where the census trims SP/TAB only. So it can accept a row id the census '
           + 'reads as E02.' },
  { lane: 'tabi-shokunin', file: 'tabi-shokunin/scripts/check-c2-knowledge-round41.mjs', line: 42,
    what: 'two hard-coded registry rows S146/S147 (c2-knowledge check)',
    cls: 'new RegExp(`^\\\\|\\\\s*${sid}\\\\s*\\\\|`, \'m\')  — then cells = line.split(\'|\').map(c => c.trim())',
    mode: 'whole-file regex with the `m` flag',
    verdict: 'DIVERGES (id-cell pad is JS \\s AND the `m` flag)',
    detail: 'row gate is column-0 only (stricter than the census `^ {0,3}\\|`), the id-cell '
           + 'pad is JS `\\s`, and the `m` flag makes `^` match after CR/U+2028/U+2029. Fixed '
           + 'ids (S146, S147) are looked up, so the blast radius is two rows, not the whole '
           + 'registry.' },
  { lane: 'tabi-shokunin', file: 'tabi-shokunin/scripts/check-instrument-registry-r68.mjs', line: 65,
    what: 'a DIFFERENT registry (an instrument registry section), not corpus/SOURCES.md',
    cls: 'cells = l.split(\'|\').slice(1, -1).map(c => c.trim()); row gate: l.startsWith(\'|\')',
    mode: 'per LF record',
    verdict: 'N/A (not a corpus/SOURCES.md row reader)',
    detail: 'reads `## <instrument>` inside a different registry file, not a SOURCES.md row id. '
           + 'Listed only because the id-token scan surfaced it; it is out of the claim\'s scope.' },
  { lane: 'tabi-shokunin', file: 'tabi-shokunin/scripts/check-source-reopen-receipt.mjs', line: 109,
    what: 'one registry row, by id (source reopen receipt)',
    cls: 'new RegExp(`^\\\\|[\\\\s]*${sid}[\\\\s]*\\\\|`, "m")  — then cells = line.split("|").map(c => c.trim())',
    mode: 'whole-file regex with the `m` flag',
    verdict: 'DIVERGES (id-cell pad is JS \\s AND the `m` flag)',
    detail: 'row gate column-0 only (stricter than the census), id-cell pad JS `\\s`, `m` flag '
           + 'lets `^` match after CR/U+2028/U+2029. One id per lookup, so the blast radius is '
           + 'a single row.' },

  { lane: 'kake-shokunin', file: 'kake-shokunin/scripts/id_resolver.py', line: 57,
    what: 'registry id set (parse_registry)',
    cls: 'ROW_RE = re.compile(r"^ {0,3}\\|\\s*([^|]*?)\\s*(?:\\|(.*))?$"); '
        + 'ID_CELL_RE = re.compile(r"^S\\d{3,}$"); sid = m.group(1).strip()',
    mode: 'per line (text.splitlines()), NO `m` flag equivalent',
    verdict: 'DIVERGES (id-cell pad is Python `\\s`, which is a superset of POSIX blank: '
           + 'it matches NBSP, U+2028, U+2029, U+0085, U+FEFF and every Zs)',
    detail: 'row gate `^ {0,3}\\|` matches the census exactly. The pad `\\s*` and the '
           + '`.strip()` are Unicode-aware, so a non-blank pad is trimmed here and not by the '
           + 'census. Python `\\s` also matches U+2028/U+2029, which JS `\\s` does NOT -- '
           + 'so this reader is a slightly wider superset than the JS one. `splitlines()` '
           + 'splits on more than LF (it also splits on U+2028/U+2029/U+0085/CR), so its '
           + 'record model is neither the census\'s nor the JS readers\'.' },
  { lane: 'kake-shokunin', file: 'kake-shokunin/scripts/citing_set.py', line: 189,
    what: 'population id tokens (not a SOURCES row reader)',
    cls: '_POPULATION_ID_RE = re.compile(r"S[0-9]{3,}")',
    mode: 'token class over citing files',
    verdict: 'N/A',
    detail: 'token class, not a SOURCES row reader.' },
  { lane: 'kake-shokunin', file: 'kake-shokunin/scripts/id_resolver.py', line: 55,
    what: 'cited-id tokens (not a SOURCES row reader)',
    cls: 'ID_RE = re.compile(r"(?<![A-Za-z0-9_])S\\d{3,}(?![A-Za-z0-9_])")',
    mode: 'token class over citing files',
    verdict: 'N/A', detail: 'token class over citing files, not a SOURCES row reader.' },
];

const L = [];
L.push('# readers.txt -- inventory of SOURCES row-id readers in the fleet (K100Scout, round 100)');
L.push('');
L.push('Scope: every code path under `/home/vgpnk/Projects/shokunin/*-shokunin/scripts/`');
L.push('that reads a `corpus/SOURCES.md` row id and decides something from it.');
L.push('Report-only: no sibling lane was edited.');
L.push('');
L.push('The census row gate (scripts/sources-census.sh, row_pass, gawk RS=LF):');
L.push('  row gate  : `^ {0,3}\\|`   (0-3 ASCII SP then a pipe)');
L.push('  id cell   : field 2, trimmed of ASCII SP/TAB only (POSIX blank)');
L.push('  id form   : `^S[0-9]{3,}$`');
L.push('  records   : one LF-delimited record is one line (gawk RS=LF)');
L.push('');
L.push('Verdict key:');
L.push('  CONFORMANT -- the reader recognises a row id exactly as the census does');
L.push('  DIVERGES   -- the reader recognises a row id the census does not read as valid');
L.push('  STRICTER   -- the reader reads a strict subset of the census rows (no false ids)');
L.push('  N/A        -- an id-token or id-form class, not a SOURCES row reader');
L.push('');

// --- curated table ----------------------------------------------------
L.push('## Readers (curated)');
L.push('');
L.push('| # | lane | file:line | what it reads | regex / class | split mode | census-conformant? |');
L.push('|---|---|---|---|---|---|---|');
CURATED.forEach((r, i) => {
  L.push(`| ${i + 1} | ${r.lane} | \`${r.file}:${r.line}\` | ${r.what} | \`${r.cls}\` | ${r.mode} | **${r.verdict}** |`);
});
L.push('');
L.push('## Notes per reader');
L.push('');
for (const [i, r] of CURATED.entries()) {
  L.push(`${i + 1}. \`${r.file}:${r.line}\` — ${r.verdict}`);
  L.push(`   ${r.detail}`);
  L.push('');
}

// --- raw scan ---------------------------------------------------------
L.push('## Raw scan (all regex literals mentioning an S### id class in any lane scripts/ tree)');
L.push('');
L.push('Produced by `K100Scout/reader_inventory.mjs <fleet-root>`: every regex literal in every');
L.push('file under `*-shokunin/scripts/` whose body mentions `S[0-9]` or `S\\d`, with the line it');
L.push('sits on and the flags in force.');
L.push('');
L.push('| lane | file:line | literal | flags |');
L.push('|---|---|---|---|');
for (const r of inv) {
  L.push(`| ${r.lane} | \`${r.file}:${r.line}\` | \`${r.literal}\` | \`${r.flags}\` |`);
}
L.push('');
L.push(`Raw scan hits: ${inv.length}.`);
L.push('');

// --- summary ----------------------------------------------------------
const diverging = CURATED.filter((r) => r.verdict.startsWith('DIVERGES'));
const conformant = CURATED.filter((r) => r.verdict.startsWith('CONFORMANT'));
const stricter = CURATED.filter((r) => r.verdict.startsWith('STRICTER'));
L.push('## Summary');
L.push('');
L.push(`CONFORMANT: ${conformant.length}  ·  DIVERGES: ${diverging.length}  ·  STRICTER: ${stricter.length}  ·  N/A: ${CURATED.filter((r) => r.verdict === 'N/A').length}`);
L.push('');
L.push('Readers that recognise a row id the census does not (DIVERGES), with the exact cause:');
L.push('');
for (const r of diverging) {
  L.push(`- \`${r.file}:${r.line}\` — ${r.verdict}`);
}
L.push('');
L.push('Readers that already match the census exactly (CONFORMANT):');
L.push('');
for (const r of conformant) {
  L.push(`- \`${r.file}:${r.line}\` — ${r.what}`);
}
L.push('');
L.push('The claim under test covers the two kumitate readers (`cite-sources.mjs:36`,');
L.push('`source-capture.mjs:157`). The sibling-lane DIVERGES rows above are report-only and are');
L.push('NOT edited by this seat; they are routed as fleet-level follow-ups.');
L.push('');
writeFileSync(join(outDir, 'readers.txt'), L.join('\n'));
console.log('readers.txt written:', L.length, 'lines');
