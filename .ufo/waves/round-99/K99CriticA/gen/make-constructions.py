#!/usr/bin/env python3
"""Build K99CriticA counter constructions from BASE sources-check bytes (r99 C1).

Each construction is a wrong trim/count implementation not among the 17 frozen controls.
Prints "<name> <sha256>" per construction.
"""
import hashlib, pathlib, sys

base = pathlib.Path(__file__).with_name('base.mjs').read_text()

TRIM = "function trim(value) { return value.trim(); }"
POS = "value.replace(/^[ \\t]+|[ \\t]+$/g, '')"
ROW_SRC = "      source: trim(fields[2]),"
ROW_SCOPE = "      scope: trim(fields[5]),"
ROW_ANCHOR = "      anchor: trim(fields[6]),"
ROW_TEACHES = "      teaches: trim(fields[7]),"
SET_ANCHOR = "  const sourceLines = sourceText.split(/\\r?\\n/).map(normalizeMarkdownIndent);"
RETURN_ANCHOR = "  return {\n    failClosed: null,\n    findings,\n    counts,\n    info: { legacyEntriesWithoutHeader: counts.legacy },\n  };"
EMPTY_BLOCK = ("    if (id === '') {\n"
               "      if (fields.slice(2, -1).some((field) => trim(field) !== '')) {\n"
               "        add('error', 'ID_FORM', 'corpus/SOURCES.md', index + 1, 'id=(empty)');\n"
               "      }\n"
               "      continue;\n"
               "    }")
IMPORT_ANCHOR = "import { fileURLToPath } from 'node:url';\n"

for anchor in (TRIM, ROW_SRC, ROW_SCOPE, ROW_ANCHOR, ROW_TEACHES, SET_ANCHOR, RETURN_ANCHOR, EMPTY_BLOCK, IMPORT_ANCHOR):
    assert base.count(anchor) == 1, anchor

def trim_with(body):
    return base.replace(TRIM, "function trim(value) { return " + body + "; }")

def sniff(prelude):
    text = base.replace(TRIM, "let TRIM_BLANK = false;\nfunction trim(value) { return TRIM_BLANK ? "
                       + POS + " : value.trim(); }")
    assert text != base
    return text.replace(SET_ANCHOR, prelude + "\n" + SET_ANCHOR)

ORDER_PRELUDE = """  {
    const idsInOrder = [];
    for (const raw of sourceText.split('\\n')) {
      const match = /^\\|[ \\t]*([^|]*?)[ \\t]*\\|/.exec(raw);
      if (!match) continue;
      const cell = match[1].replace(/^[ \\t]+|[ \\t]+$/g, '');
      if (/^S\\d{3,}$/.test(cell)) idsInOrder.push(Number(cell.slice(1)));
    }
    TRIM_BLANK = idsInOrder.some((n, i) => i > 0 && n < idsInOrder[i - 1]);
  }"""

CENSUS_COUNTS = """  try {
    const censusPath = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
    const censusRun = (mode) => spawnSync('bash', [censusPath, mode, '--file', sourcesPath, '--today', opts.today], { encoding: 'utf8', maxBuffer: 1 << 26, timeout: 60_000 });
    const validateOut = censusRun('validate');
    const censusOut = censusRun('census');
    const e02 = String(validateOut.stdout).split('\\n').filter((line) => line.split('\\t')[1] === 'E02').length;
    const rowsLine = String(censusOut.stdout).split('\\n').find((line) => line.split('\\t')[1] === 'rows');
    if (rowsLine) counts.rows = Math.max(0, Number(rowsLine.split('\\t')[2]) - e02);
  } catch { /* keep the in-house count */ }
"""

unchecked = trim_with(POS)
unchecked = unchecked.replace(ROW_SRC, "      source: fields[2].trim(),")
unchecked = unchecked.replace(ROW_SCOPE, "      scope: fields[5].trim(),")
unchecked = unchecked.replace(ROW_ANCHOR, "      anchor: fields[6].trim(),")
unchecked = unchecked.replace(ROW_TEACHES, "      teaches: fields[7].trim(),")

count_empty = trim_with(POS).replace(
    EMPTY_BLOCK,
    "    if (id === '') {\n"
    "      if (fields.slice(2, -1).some((field) => trim(field) !== '')) {\n"
    "        counts.rows += 1;\n"
    "        add('error', 'ID_FORM', 'corpus/SOURCES.md', index + 1, 'id=(empty)');\n"
    "      }\n"
    "      continue;\n"
    "    }")

delegate = trim_with(POS).replace(IMPORT_ANCHOR, IMPORT_ANCHOR + "import { spawnSync } from 'node:child_process';\n")
delegate = delegate.replace(RETURN_ANCHOR, CENSUS_COUNTS + RETURN_ANCHOR)

constructions = {
    'k01-transparent-nul': trim_with("value.replace(/^[ \\t\\u0000]+|[ \\t\\u0000]+$/g, '')"),
    'k02-transparent-u0080': trim_with("value.replace(/^[ \\t\\u0080]+|[ \\t\\u0080]+$/g, '')"),
    'k03a-padcap16': trim_with("value.replace(/^[ \\t]{1,16}|[ \\t]{1,16}$/g, '')"),
    'k03-padcap17': trim_with("value.replace(/^[ \\t]{1,17}|[ \\t]{1,17}$/g, '')"),
    'k04-unchecked-cells-js': unchecked,
    'k05-title-sniff': sniff("  TRIM_BLANK = /SOURCES — where fixture-[0-9a-f]+ learns/.test(sourceText);"),
    'k06-size-sniff': sniff("  TRIM_BLANK = sourceText.split('\\n').filter((line) => line.startsWith('|')).length > 200;"),
    'k07-order-sniff': sniff(ORDER_PRELUDE),
    'k08-empty-id-count': count_empty,
    'k09-bom-sniff': sniff("  TRIM_BLANK = !sourceText.startsWith('\\ufeff');"),
    'k10-census-counts': delegate,
    'k11-nel-extra': trim_with("value.replace(/^[ \\t\\u0085]+|[ \\t\\u0085]+$/g, '')"),
    'k12-env-sniff': sniff("  TRIM_BLANK = process.env.SHOKUNIN_ROOT !== undefined && process.env.SHOKUNIN_ROOT !== '/home/vgpnk/Projects/shokunin';"),
}
out = pathlib.Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
for name, text in constructions.items():
    assert text != base, name
    pathlib.Path(out / f'{name}.mjs').write_text(text)
    print(name, hashlib.sha256(text.encode()).hexdigest())
