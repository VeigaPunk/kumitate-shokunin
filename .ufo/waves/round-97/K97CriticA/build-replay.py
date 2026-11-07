#!/usr/bin/env python3
"""build-replay.py <ctl-positive.mjs> <repro-<seed>.json> <out x-replay.mjs>

Builds the M97-1 show-able-to-fail construction: a tool with no section reader at all that answers a
58357-line fixture from a table hardcoded out of ONE counter run (its seed), keyed only on line count and
CRLF shape. On that seed the counter compares its output with the very census run the table was copied
from, so it reads HELD; on any other seed the ids/order differ, so it must read UNMET.
"""
import json, sys, pathlib

pos = pathlib.Path(sys.argv[1]).read_text()
rep = json.loads(pathlib.Path(sys.argv[2]).read_text())
out = pathlib.Path(sys.argv[3])

table = {
    'lines': rep['lines'] + 1,  # fixture text lines (probe prints its line ARRAY length)
    'lf': {'ids': rep['lf']['ids'], 'rows': rep['lf']['rows']},
    'crlf': {'ids': rep['crlf']['ids'], 'rows': rep['crlf']['rows']},
    'mixed': {'ids': rep['mixed']['ids'], 'rows': rep['mixed']['rows']},
}
anchor = "function runCheck(opts) {"
assert pos.count(anchor) == 1
inject = (
    "/* K97CriticA hardcode/replay construction (mistake class M97-1): no section reader at all. */\n"
    f"const REPLAY = {json.dumps(table, separators=(',', ':'))};\n"
    "function replayLookup(text) {\n"
    "  if (text.split('\\n').length !== REPLAY.lines) return null;\n"
    "  const nl = (text.match(/\\n/g) ?? []).length;\n"
    "  const crlf = (text.match(/\\r\\n/g) ?? []).length;\n"
    "  const ratio = nl === 0 ? 0 : crlf / nl;\n"
    "  if (ratio >= 0.9) return REPLAY.crlf;\n"
    "  if (ratio >= 0.25) return REPLAY.mixed;\n"
    "  return REPLAY.lf;\n"
    "}\n\n"
    + anchor
)
s = pos.replace(anchor, inject)

hook_anchor = (
    "  const sourceLines = sourceText.split(/\\r?\\n/).map(normalizeMarkdownIndent);\n"
)
assert s.count(hook_anchor) == 1
hook = hook_anchor + (
    "  {\n"
    "    const t = replayLookup(sourceText);\n"
    "    if (t) {\n"
    "      return {\n"
    "        findings: t.ids.map((id) => ({ severity: 'error', kind: 'ROW_OUTSIDE_REGISTRY', path: 'corpus/SOURCES.md', line: 1, detail: `id=${id} row outside Registry section` })),\n"
    "        counts: { rows: t.rows, tiers: { A: 0, B: 0, C: 0 }, status: { queued: 0, mined: 0, rejected: 0 }, entriesWithSource: 0, legacy: 0 },\n"
    "        info: { legacyEntriesWithoutHeader: 0 },\n"
    "      };\n"
    "    }\n"
    "  }\n"
)
s = s.replace(hook_anchor, hook)
out.write_text(s)
print(f"wrote {out} bytes={len(s)} lines={rep['lines']} lf={len(table['lf']['ids'])} crlf={len(table['crlf']['ids'])} mixed={len(table['mixed']['ids'])}")
