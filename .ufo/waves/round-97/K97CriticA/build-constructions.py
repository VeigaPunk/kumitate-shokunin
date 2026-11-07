#!/usr/bin/env python3
"""build-constructions.py — K97CriticA round-97 counter attack.

Reads ctl-positive.mjs (the L1 reference rule R97, built by the frozen generator
probe/make-controls97.py from the lane's sources-check.mjs) and emits 12 wrong-but-plausible
section readers, each violating at least one clause of frozen rule R97. 9 of them differ from
R97 only on inputs the frozen battery never draws; those are the ones expected to reach HELD.

usage: build-constructions.py <ctl-positive.mjs> <out dir>
"""
import sys, pathlib

pos = pathlib.Path(sys.argv[1]).read_text()
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)

SPLIT = "  const rawLines = sourceText.split('\\n');\n"
TRIM = ".replace(/^[ \\t]+|[ \\t]+$/g, '')"
ASSIGN = "      activeSection = raw.replace(/^ {0,3}##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '');\n"
LOOP = "  for (let index = 0; index < rawLines.length; index += 1) {\n    const raw = rawLines[index];\n"
H2 = "    if (/^ {0,3}##[ \\t]/.test(raw)) {"
H1 = "    } else if (/^ {0,3}#[ \\t]/.test(raw)) {"
TAIL = "    sectionAtLine[index] = activeSection;\n  }\n  for (const section of REQUIRED_SECTIONS) {"
ADD_OUT = "        add('error', 'ROW_OUTSIDE_REGISTRY', 'corpus/SOURCES.md', index + 1, `id=${id} row outside Registry section`);"

for anchor in (SPLIT, TRIM, ASSIGN, LOOP, H2, H1, TAIL, ADD_OUT):
    assert pos.count(anchor) == 1, (anchor, pos.count(anchor))

def patch(*pairs):
    s = pos
    for old, new in pairs:
        assert s.count(old) == 1, old
        s = s.replace(old, new)
    return s

constructs = {}

# ---- A. invisible-input violations (expected HELD: the battery/corpus never draw the char) ----
constructs['x-bom-strip'] = patch((SPLIT,
    "  const rawLines = sourceText.replace(/^\\uFEFF/, '').split('\\n');\n"))
constructs['x-zwnbsp-trim'] = patch((TRIM, ".replace(/^[ \\t\\uFEFF]+|[ \\t\\uFEFF]+$/g, '')"))
constructs['x-u2003-trim'] = patch((TRIM, ".replace(/^[ \\t\\u2003]+|[ \\t\\u2003]+$/g, '')"))
constructs['x-zwsp-strip'] = patch((TRIM, ".replace(/^[ \\t]+|[ \\t]+$/g, '').replace(/\\u200B/g, '')"))
constructs['x-u2028-split'] = patch((SPLIT,
    "  const rawLines = sourceText.split(/\\n|\\u2028/);\n"))
constructs['x-fence-aware'] = patch((LOOP,
    "  let inFence = false;\n"
    "  for (let index = 0; index < rawLines.length; index += 1) {\n"
    "    const raw = rawLines[index];\n"
    "    if (/^ {0,3}```/.test(raw)) {\n"
    "      inFence = !inFence;\n"
    "      sectionAtLine[index] = activeSection;\n"
    "      continue;\n"
    "    }\n"
    "    if (inFence) { sectionAtLine[index] = activeSection; continue; }\n"))

# ---- B. shapes the battery is built to catch (expected UNMET) ----
constructs['x-prefix-match'] = patch((ASSIGN,
    "      const headingText = raw.replace(/^ {0,3}##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '');\n"
    "      activeSection = headingText.startsWith('Registry') ? 'Registry' : headingText;\n"))
constructs['x-blank-gated'] = patch(
    (LOOP, "  let prevBlank = true;\n" + LOOP),
    (H2, "    if (prevBlank && /^ {0,3}##[ \\t]/.test(raw)) {"),
    (H1, "    } else if (prevBlank && /^ {0,3}#[ \\t]/.test(raw)) {"),
    (TAIL, "    sectionAtLine[index] = activeSection;\n    prevBlank = /^[ \\t]*$/.test(raw);\n  }\n  for (const section of REQUIRED_SECTIONS) {"))
constructs['x-outside-cap'] = patch(
    (LOOP, "  let outsideCount = 0;\n" + LOOP),
    (ADD_OUT, "        if (outsideCount < 1000) { outsideCount += 1; " + ADD_OUT.lstrip() + " }"))
constructs['x-reset-1000'] = patch((LOOP,
    LOOP + "    if (index > 0 && index % 1000 === 0) activeSection = null;\n"))
constructs['x-cr-break'] = patch((SPLIT,
    "  const rawLines = sourceText.split(/\\r\\n|\\r|\\n/);\n"))
constructs['x-space4-head'] = patch(
    ("    if (/^ {0,3}##[ \\t]/.test(raw)) {", "    if (/^ {0,4}##[ \\t]/.test(raw)) {"),
    ("raw.replace(/^ {0,3}##/, '')", "raw.replace(/^ {0,4}##/, '')"))

for name, body in constructs.items():
    (out / f'{name}.mjs').write_text(body)
print('constructions:', ' '.join(sorted(constructs)))
