#!/usr/bin/env python3
"""make-controls94.py — build the round-94 pre-data controls from the BASE round-gate bytes.

Usage: python3 make-controls94.py <base round-gate.mjs> <out dir>

Each control is the base file with ONE textual patch (asserted to apply exactly once):
  ctl-nothing      base bytes unchanged (the do-nothing control)
  ctl-positive     the L1 reference rule: a token is `declared` iff it is a prefix of a 40-hex
                   path segment (split on / ? #) of an http(s) URL inside a SOURCES.md registry
                   row (`^ {0,3}| S<3+ digits> |`) whose status cell (column 8) is not `rejected`
  ctl-blanket      every token resolving nowhere is `declared` (forgery: blanket external)
  ctl-substring    `declared` iff the token occurs anywhere in SOURCES.md (forgery: raw substring)
  ctl-anyline      positive rule but every line counts (no registry-row / status filter)
  ctl-contains     positive rule but segment.includes(token) instead of startsWith
  ctl-norejfilter  positive rule but rejected rows count
  ctl-slashonly    positive rule but URLs split on '/' only (a `#fragment` hides the pin)
"""
import hashlib
import os
import sys

base_path, out = sys.argv[1], sys.argv[2]
base = open(base_path, encoding='utf-8').read()

INIT_OLD = "  const citations = {\n    checked: 0, external: [], unresolved: [], notAncestor: [], unverifiable: [],\n"
INIT_NEW = "  const citations = {\n    checked: 0, external: [], declared: [], unresolved: [], notAncestor: [], unverifiable: [],\n"

LOOP_OLD = "      } else if (mainProbeableNow() && originProbeableNow()) {\n        citations.unresolved.push(t);\n"


def loop_new(cond):
    return ("      } else if (" + cond + ") {\n        citations.declared.push(t);\n" + LOOP_OLD)


FN_ANCHOR = "function runChecks({ repo, reportsDir, round, lane, close, mainRepo, origin }) {\n"


def pins_fn(row_filter=True, status_filter=True, splitter=r"/[/?#]/"):
    rows = "    if (!/^ {0,3}\\|\\s*S\\d{3,}\\s*\\|/.test(line)) continue;\n" if row_filter else ""
    status = ("    const cells = line.split('|').map((c) => c.trim());\n"
              "    if (/^rejected$/i.test(cells[8] ?? '')) continue;\n") if status_filter else ""
    return ("function declaredPins94(repo) {\n"
            "  const pins = [];\n"
            "  const text = readText(join(repo, 'corpus', 'SOURCES.md'));\n"
            "  if (text === null) return pins;\n"
            "  for (const line of text.split('\\n')) {\n"
            + rows + status +
            "    for (const m of line.matchAll(/https?:\\/\\/[^\\s|)`'\"<>]+/g)) {\n"
            "      for (const seg of m[0].split(" + splitter + ")) if (/^[0-9a-f]{40}$/.test(seg)) pins.push(seg);\n"
            "    }\n"
            "  }\n"
            "  return pins;\n"
            "}\n\n")


def build(fn, cond, extra_pre=""):
    s = base
    for old, new in ((INIT_OLD, INIT_NEW), (LOOP_OLD, loop_new(cond)), (FN_ANCHOR, fn + FN_ANCHOR)):
        assert s.count(old) == 1, old[:60]
        s = s.replace(old, new)
    return s


SRC_FN = ("function sourcesText94(repo) {\n"
          "  return readText(join(repo, 'corpus', 'SOURCES.md')) ?? '';\n"
          "}\n\n")

controls = {
    'ctl-nothing': base,
    'ctl-positive': build(pins_fn(), "declaredPins94(repo).some((p) => p.startsWith(t))"),
    'ctl-blanket': build("", "true"),
    'ctl-substring': build(SRC_FN, "sourcesText94(repo).includes(t)"),
    'ctl-anyline': build(pins_fn(row_filter=False, status_filter=False), "declaredPins94(repo).some((p) => p.startsWith(t))"),
    'ctl-contains': build(pins_fn(), "declaredPins94(repo).some((p) => p.includes(t))"),
    'ctl-norejfilter': build(pins_fn(status_filter=False), "declaredPins94(repo).some((p) => p.startsWith(t))"),
    'ctl-slashonly': build(pins_fn(splitter="'/'"), "declaredPins94(repo).some((p) => p.startsWith(t))"),
}

os.makedirs(out, exist_ok=True)
for name, text in controls.items():
    p = os.path.join(out, name + '.mjs')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(text)
    print(name, hashlib.sha256(text.encode()).hexdigest())
