#!/usr/bin/env python3
"""make-attacks95.py — round-95 K95CriticA: wrong gates that implement the *shape* of the L1
reference rule but violate a clause of the frozen rule.

Usage: python3 make-attacks95.py <base round-gate.mjs> <out dir>

Every attack is the BASE bytes with asserted textual patches.  Each is meant to be indistinguishable
from the reference rule by `probe/probe95-c1.mjs` arms (a)(b)(c)(d) while violating one named clause
of the frozen rule (`plan.md` §C1).
"""
import hashlib
import os
import sys

base_path, out = sys.argv[1], sys.argv[2]
base = open(base_path, encoding='utf-8').read()

INIT_RUNCHECKS_OLD = ("  const citations = {\n"
                      "    checked: 0, external: [], declared: [], unresolved: [], notAncestor: [], unverifiable: [],\n")
INIT_RUNCHECKS_NEW = ("  const citations = {\n"
                      "    checked: 0, external: [], declared: [], malformedRows: [], unresolved: [], notAncestor: [], unverifiable: [],\n")
INIT_FC_OLD = ("    citations: {\n"
               "      checked: 0, external: [], declared: [], unresolved: [], notAncestor: [], unverifiable: [],\n")
INIT_FC_NEW = ("    citations: {\n"
               "      checked: 0, external: [], declared: [], malformedRows: [], unresolved: [], notAncestor: [], unverifiable: [],\n")
SIG_OLD = "function declaredPins(sourcesText) {\n"
SIG_NEW = "function declaredPins(sourcesText, malformed = []) {\n"
CALL_OLD = "declaredPins(readRegistry(join(repo, 'corpus', 'SOURCES.md')))"
CALL_NEW = "declaredPins(readRegistry(join(repo, 'corpus', 'SOURCES.md')), citations.malformedRows)"
ROW_OLD = ("    if (!SOURCES_ROW_RE.test(line)) continue;\n"
           "    const status = (line.split('|')[8] ?? '').trim();\n"
           "    if (status.toLowerCase() === 'rejected') continue;\n")
RET_OLD = "  }\n  return pins;\n}\n\n/** A token is declared iff"
FUNC_START = "function declaredPins(sourcesText) {"
FUNC_END = "  return pins;\n}\n\n/** A token is declared iff"

HEAD = ("    if (!SOURCES_ROW_RE.test(line)) continue;\n"
        "    const fields = line.split('|');\n")
STATUS = ("    const status = (fields[8] ?? '').trim();\n"
          "    if (status.toLowerCase() === 'rejected') continue;\n")


def ref_row(cond="fields.length !== 13", extra=""):
    return (HEAD
            + "    if (" + cond + ") { malformed.push(fields[1].trim()); " + (extra or "") + "continue; }\n"
            + STATUS)


def build(row_new, ret_new=None, init_runchunks=True, init_fc=True):
    s = base
    pairs = [(SIG_OLD, SIG_NEW, 1), (CALL_OLD, CALL_NEW, 1), (ROW_OLD, row_new, 1)]
    if ret_new:
        pairs.append((RET_OLD, ret_new, 1))
    if init_runchunks:
        pairs.append((INIT_RUNCHECKS_OLD, INIT_RUNCHECKS_NEW, 1))
    if init_fc:
        pairs.append((INIT_FC_OLD, INIT_FC_NEW, 1))
    for old, new, n in pairs:
        assert s.count(old) == n, (old[:70], s.count(old))
        s = s.replace(old, new)
    assert "const fields = line.split('|');" in s or row_new.startswith("    if (!SOURCES_ROW_RE")
    return s


# 1. disclose only malformed rows that carry a URL (the rule discloses every non-13-field row).
ATK_URLONLY = (HEAD
               + "    if (fields.length !== 13) { if (line.includes('http')) malformed.push(fields[1].trim()); continue; }\n"
               + STATUS)

# 2. report the ids sorted instead of in file order.
SORT_RET = "  }\n  malformed.sort();\n  return pins;\n}\n\n/** A token is declared iff"

# 3. dedupe the disclosure (a Set identity) instead of appending every malformed row.
ATK_DEDUPE = (HEAD
              + "    if (fields.length !== 13) { const id = fields[1].trim(); if (!malformed.includes(id)) malformed.push(id); continue; }\n"
              + STATUS)

# 4. a CRLF row (13 fields, status cell with a trailing \\r) is called malformed instead of declaring.
ATK_CRLF = (HEAD
            + "    if (line.includes('\\r')) { malformed.push(fields[1].trim()); continue; }\n"
            "    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }\n"
            + STATUS)

# 5. a 13-field row whose status cell is outside the census vocabulary is malformed (rule: only
#    `rejected` suppresses; every other status still declares).
ATK_VOCAB = (HEAD
             + "    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }\n"
             "    const status = (fields[8] ?? '').trim().toLowerCase();\n"
             "    if (status === 'rejected') continue;\n"
             "    if (!['mined', 'queued', 'rejected'].includes(status)) { malformed.push(fields[1].trim()); continue; }\n")

# 6. reference rule, but the fail-closed `--json` path keeps the old citations shape (no key).
#    -> handled by init_fc=False in build().

# 7. hardcoded fixture ids: every non-13-field row is refused, but only the four ids seen in the
#    fixture are disclosed (rule: every malformed row's id is disclosed, whatever it is).
ATK_HARDCODE = (HEAD
                + "    if (fields.length !== 13) { const id = fields[1].trim();"
                  " if (['S002', 'S003', 'S004', 'S007'].includes(id)) malformed.push(id); continue; }\n"
                + STATUS)


# 8. rows whose id appears twice are skipped entirely (refused silently, no disclosure).
DUP_FUNC = """function declaredPins(sourcesText, malformed = []) {
  const pins = new Set();
  if (typeof sourcesText !== 'string') return pins;
  const rows = sourcesText.split('\\n').filter((l) => SOURCES_ROW_RE.test(l));
  const ids = rows.map((l) => (l.split('|')[1] ?? '').trim());
  const dup = new Set(ids.filter((id, i) => ids.indexOf(id) !== i));
  for (const line of rows) {
    const fields = line.split('|');
    const id = fields[1].trim();
    if (dup.has(id)) continue;
    if (fields.length !== 13) { malformed.push(id); continue; }
    const status = (fields[8] ?? '').trim();
    if (status.toLowerCase() === 'rejected') continue;
    for (const m of line.matchAll(SOURCES_URL_RE)) {
      for (const seg of m[0].split(SOURCES_SEGMENT_RE)) if (SOURCES_PIN_RE.test(seg)) pins.add(seg);
    }
  }
  return pins;
}
"""

# 9. disclosure uses a second pass whose row regex drops the 0-3 space indent allowance, so an
#    indented malformed row is refused but never disclosed.
ATK_NOINDENT = (HEAD
                + "    if (fields.length !== 13) { if (/^\\|\\s*S\\d{3,}\\s*\\|/.test(line)) malformed.push(fields[1].trim()); continue; }\n"
                + STATUS)


def build_dup():
    s = base
    start = s.index(FUNC_START)
    end = s.index(FUNC_END) + len("  return pins;\n}\n")
    old_func = s[start:end]
    assert old_func.startswith(FUNC_START) and old_func.endswith("  return pins;\n}\n")
    s = s[:start] + DUP_FUNC + s[end:]
    for old, new, n in [(CALL_OLD, CALL_NEW, 1),
                        (INIT_RUNCHECKS_OLD, INIT_RUNCHECKS_NEW, 1),
                        (INIT_FC_OLD, INIT_FC_NEW, 1)]:
        assert s.count(old) == n, (old[:70], s.count(old))
        s = s.replace(old, new)
    return s


attacks = {
    'atk-urlonly': build(ATK_URLONLY),
    'atk-sorted': build(ref_row(), SORT_RET),
    'atk-dedupe': build(ATK_DEDUPE),
    'atk-crlf': build(ATK_CRLF),
    'atk-vocab': build(ATK_VOCAB),
    'atk-nofailclosed': build(ref_row(), init_fc=False),
    'atk-hardcode': build(ATK_HARDCODE),
    'atk-dupskip': build_dup(),
    'atk-noindent': build(ATK_NOINDENT),
}

os.makedirs(out, exist_ok=True)
for name in sorted(attacks):
    text = attacks[name]
    p = os.path.join(out, name + '.mjs')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(text)
    print(name, hashlib.sha256(text.encode()).hexdigest(), len(text))
