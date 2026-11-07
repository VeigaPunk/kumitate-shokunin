#!/usr/bin/env python3
"""Round-94 K2 mutants: single-point patches inside the candidate's NEW lines.

Usage: make_mutants.py <candidate round-gate.mjs> <out dir>
Each patch must occur exactly once in the candidate bytes; the output records
sha256 of the source and of every mutant.
"""
import hashlib
import json
import os
import sys

cand_path, out = sys.argv[1], sys.argv[2]
src = open(cand_path, encoding='utf-8').read()

M = []


def mut(name, old, new, why, expect):
    M.append({'name': name, 'old': old, 'new': new, 'why': why, 'expect': expect})


DECL_LOOP = "      } else if (isDeclaredPin(t, declaredPinsNow())) {"

mut('m01-blanket', DECL_LOOP, "      } else if (true) {",
    'ctl-blanket shape: every unresolvable token declared', 'KILLED-by-selftest')

mut('m02-substring', DECL_LOOP,
    "      } else if ((readText(join(repo, 'corpus', 'SOURCES.md')) ?? '').includes(t)) {",
    'ctl-substring shape: token anywhere in SOURCES.md', 'KILLED-by-selftest')

mut('m03-anyline',
    "    if (!SOURCES_ROW_RE.test(line)) continue;\n"
    "    const status = (line.split('|')[8] ?? '').trim();\n"
    "    if (status.toLowerCase() === 'rejected') continue;\n",
    "    // ctl-anyline shape: no registry-row filter, no status filter\n",
    'ctl-anyline shape: URLs on any line, any status', 'KILLED-by-selftest')

mut('m04-contains',
    "  for (const p of pins) if (p.startsWith(tok)) return true;",
    "  for (const p of pins) if (p.includes(tok)) return true;",
    'ctl-contains shape: segment contains token, not prefix', 'KILLED-by-selftest')

mut('m05-norejfilter',
    "    if (status.toLowerCase() === 'rejected') continue;\n", "",
    'ctl-norejfilter shape: rejected rows declare pins', 'KILLED-by-selftest')

mut('m06-slashonly',
    "const SOURCES_SEGMENT_RE = /[/?#]/;",
    "const SOURCES_SEGMENT_RE = /[/]/;",
    'ctl-slashonly shape: a #fragment hides the pin', 'KILLED-by-selftest')

mut('m07-pin-7-40',
    "const SOURCES_PIN_RE = /^[0-9a-f]{40}$/;",
    "const SOURCES_PIN_RE = /^[0-9a-f]{7,40}$/;",
    'regex boundary: a 7-39 hex segment becomes a "pin"', 'SURVIVED-expected')

mut('m08-row-sdigits',
    "const SOURCES_ROW_RE = /^ {0,3}\\|\\s*S\\d{3,}\\s*\\|/;",
    "const SOURCES_ROW_RE = /^ {0,3}\\|\\s*S\\d+\\s*\\|/;",
    'regex boundary: S1/S12 rows now count as registry rows', 'SURVIVED-expected')

mut('m09-status-idx7',
    "    const status = (line.split('|')[8] ?? '').trim();",
    "    const status = (line.split('|')[7] ?? '').trim();",
    'status cell read from column 7 (teaches) instead of 8', 'KILLED-by-selftest')

mut('m10-rejected-case',
    "    if (status.toLowerCase() === 'rejected') continue;",
    "    if (status === 'rejected') continue;",
    '`rejected` matched case-sensitively', 'SURVIVED-expected')

mut('m11-nolazy',
    "    let sourcesPins = null;\n"
    "    const declaredPinsNow = () => {\n"
    "      if (sourcesPins === null) sourcesPins = declaredPins(readText(join(repo, 'corpus', 'SOURCES.md')));\n"
    "      return sourcesPins;\n"
    "    };",
    "    const declaredPinsNow = () => declaredPins(readText(join(repo, 'corpus', 'SOURCES.md')));",
    'lazy read removed (re-reads per token)', 'EQUIVALENT-expected')

mut('m12-push-unresolved',
    "        citations.declared.push(t);",
    "        citations.unresolved.push(t);",
    'declared tokens pushed to unresolved', 'KILLED-by-selftest')

mut('m13-prefix-exact',
    "  for (const p of pins) if (p.startsWith(tok)) return true;",
    "  for (const p of pins) if (p === tok) return true;",
    'prefix rule -> exact-match rule (8-hex short forms die)', 'KILLED-by-selftest')

mut('m14-sources-path',
    "declaredPins(readText(join(repo, 'corpus', 'SOURCES.md')))",
    "declaredPins(readText(join(repo, 'SOURCES.md')))",
    'SOURCES.md read from repo root, not corpus/', 'KILLED-by-selftest')

mut('m15-row-inverted',
    "    if (!SOURCES_ROW_RE.test(line)) continue;",
    "    if (SOURCES_ROW_RE.test(line)) continue;",
    'registry rows skipped, non-registry lines scanned', 'KILLED-by-selftest')

mut('m16-failclosed-shape',
    "    citations: {\n"
    "      checked: 0, external: [], declared: [], unresolved: [], notAncestor: [], unverifiable: [],\n",
    "    citations: {\n"
    "      checked: 0, external: [], unresolved: [], notAncestor: [], unverifiable: [],\n",
    'fail-closed --json citations loses the new `declared` key', 'SURVIVED-expected')

os.makedirs(out, exist_ok=True)
manifest = {'source': os.path.abspath(cand_path), 'source_sha256': hashlib.sha256(src.encode()).hexdigest(),
            'bytes': len(src.encode()), 'mutants': []}
seen = set()
for m in M:
    assert m['name'] not in seen, m['name']
    seen.add(m['name'])
    n = src.count(m['old'])
    assert n == 1, f"{m['name']}: anchor count {n}"
    text = src.replace(m['old'], m['new'])
    assert text != src, m['name']
    p = os.path.join(out, m['name'] + '.mjs')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(text)
    manifest['mutants'].append({
        'name': m['name'], 'why': m['why'], 'expect': m['expect'],
        'sha256': hashlib.sha256(text.encode()).hexdigest(),
        'bytes_delta': len(text.encode()) - len(src.encode()),
    })
with open(os.path.join(out, 'manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=1)
print(json.dumps(manifest['source_sha256']))
print(len(M), 'mutants')
for m in manifest['mutants']:
    print(m['name'], m['sha256'][:16], m['bytes_delta'])
