#!/usr/bin/env python3
"""make-controls95.py — build the round-95 pre-data controls from the BASE round-gate bytes.

Usage: python3 make-controls95.py <base round-gate.mjs> <out dir>

Each control is the base file with textual patches (each asserted to apply the stated number of times):
  ctl-nothing      base bytes unchanged (the do-nothing control)
  ctl-positive     L1 reference rule: a registry row declares pins only when `line.split('|')` has exactly
                   13 fields; any other count declares nothing and its id (field 1, trimmed) is pushed, in
                   file order, to `citations.malformedRows` (always-present array)
  ctl-escapeonly   refuse (and disclose) only rows containing a literal `\\|`
  ctl-gt13         refuse (and disclose) only rows with MORE than 13 fields
  ctl-lenient12    accept 12 or 13 fields (a missing trailing cell/pipe is tolerated)
  ctl-anyrej       disclose NF!=13 rows but still read them; skip a row when ANY cell reads `rejected`
  ctl-nodisclose   reference rule, but nothing is ever pushed to malformedRows
  ctl-dropall      reference rule, but one malformed row makes the whole registry declare nothing
"""
import hashlib
import os
import sys

base_path, out = sys.argv[1], sys.argv[2]
base = open(base_path, encoding='utf-8').read()

INIT_OLD = "declared: [], unresolved: []"
INIT_NEW = "declared: [], malformedRows: [], unresolved: []"
SIG_OLD = "function declaredPins(sourcesText) {\n"
SIG_NEW = "function declaredPins(sourcesText, malformed = []) {\n"
CALL_OLD = "declaredPins(readRegistry(join(repo, 'corpus', 'SOURCES.md')))"
CALL_NEW = "declaredPins(readRegistry(join(repo, 'corpus', 'SOURCES.md')), citations.malformedRows)"
ROW_OLD = ("    if (!SOURCES_ROW_RE.test(line)) continue;\n"
           "    const status = (line.split('|')[8] ?? '').trim();\n"
           "    if (status.toLowerCase() === 'rejected') continue;\n")
RET_OLD = "  }\n  return pins;\n}\n\n/** A token is declared iff"


def row(bad, push=True, status=None):
    push_s = "malformed.push(fields[1].trim()); " if push else ""
    status = status or ("    const status = (fields[8] ?? '').trim();\n"
                        "    if (status.toLowerCase() === 'rejected') continue;\n")
    return ("    if (!SOURCES_ROW_RE.test(line)) continue;\n"
            "    const fields = line.split('|');\n"
            "    if (" + bad + ") { " + push_s + "continue; }\n" + status)


def build(row_new, ret_new=None):
    s = base
    pairs = [(INIT_OLD, INIT_NEW, 2), (SIG_OLD, SIG_NEW, 1), (CALL_OLD, CALL_NEW, 1), (ROW_OLD, row_new, 1)]
    if ret_new:
        pairs.append((RET_OLD, ret_new, 1))
    for old, new, n in pairs:
        assert s.count(old) == n, (old[:60], s.count(old))
        s = s.replace(old, new)
    return s


ANYREJ = ("    if (!SOURCES_ROW_RE.test(line)) continue;\n"
          "    const fields = line.split('|');\n"
          "    if (fields.length !== 13) malformed.push(fields[1].trim());\n"
          "    if (fields.some((c) => c.trim().toLowerCase() === 'rejected')) continue;\n")
DROPALL_RET = "  }\n  if (malformed.length) pins.clear();\n  return pins;\n}\n\n/** A token is declared iff"

controls = {
    'ctl-nothing': base,
    'ctl-positive': build(row("fields.length !== 13")),
    'ctl-escapeonly': build(row("line.includes('\\\\|')")),
    'ctl-gt13': build(row("fields.length > 13")),
    'ctl-lenient12': build(row("fields.length !== 13 && fields.length !== 12")),
    'ctl-anyrej': build(ANYREJ),
    'ctl-nodisclose': build(row("fields.length !== 13", push=False)),
    'ctl-dropall': build(row("fields.length !== 13"), DROPALL_RET),
}

os.makedirs(out, exist_ok=True)
for name, text in controls.items():
    p = os.path.join(out, name + '.mjs')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(text)
    print(name, hashlib.sha256(text.encode()).hexdigest())
