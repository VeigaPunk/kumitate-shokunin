#!/usr/bin/env python3
"""Build K96CriticA constructions: wrong-but-plausible gates from ctl-positive bytes.

Each construction violates R96 in one way the 20-control battery does not pin, or is a
deliberate fixture-fitting game (hardcode). Every patch asserts its hit count.
"""
import hashlib
import os
import sys

src_dir, out = sys.argv[1], sys.argv[2]
pos = open(os.path.join(src_dir, 'ctl-positive.mjs'), encoding='utf-8').read()
assert hashlib.sha256(pos.encode()).hexdigest() == '8793e0d905ed690c329c884f6f6071409785fa1bb1594d7adaf0ae35071fbe6c'

H2 = ("    if (/^ {0,3}##[ \\t]/.test(line)) { inReg = line.replace(/^ {0,3}##/, '')"
      ".replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }")
H1 = "    if (/^ {0,3}#[ \\t]/.test(line)) { inReg = false; continue; }"
ROW = "    if (!SOURCES_ROW_RE.test(line)) continue;"
OUT = "    if (!inReg) { outside.push(fields[1].trim()); continue; }"
TXT = "      if (citations.outsideRows.length) {"
LOOP = "  for (const line of sourcesText.split('\\n')) {"
EARLY = "  if (typeof sourcesText !== 'string') return pins;"


def one(s, old, new):
    assert s.count(old) == 1, (old[:70], s.count(old), new[:70])
    return s.replace(old, new)


def tokens_pins():
    return {k: hashlib.sha256(f'kumitate-r96-{k}'.encode()).hexdigest()[:40]
            for k in ('okA', 'h3D', 'ind4E', 'nospF', 'reopenH', 'tabP', 'ind3Q')}


c = {}

# 1 ws-class: heading separator uses JS \s (enters on U+000B/U+00A0/...); R96 allows [ \t] only.
c['ws-class'] = one(pos, H2, (
    "    if (/^ {0,3}##\\s/.test(line)) { inReg = line.replace(/^ {0,3}##\\s/, '')"
    ".replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }"))

# 2 indent-class: up to 3 [ \t] indentation (tab-indented heading becomes a heading); R96 allows spaces only.
s = one(pos, H2, (
    "    if (/^[ \\t]{0,3}##[ \\t]/.test(line)) { inReg = line.replace(/^[ \\t]{0,3}##/, '')"
    ".replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }"))
s = one(s, H1, "    if (/^[ \\t]{0,3}#[ \\t]/.test(line)) { inReg = false; continue; }")
c['indent-class'] = s

# 3 trail-tab: trailing strip removes spaces only, not tabs; R96 strips spaces AND tabs.
c['trail-tab'] = one(pos, ".replace(/^[ \\t]+|[ \\t]+$/g, '')", ".replace(/^[ \\t]+| +$/g, '')")

# 4 text-always: text info line printed even when outside==0; R96 says only when n>0.
c['text-always'] = one(pos, TXT, "      if (citations.outsideRows.length >= 0) {")

# 5 lastindex: heading text taken after the LAST ## not the first; R96 says the first ##.
c['lastindex'] = one(pos, H2, (
    "    if (/^ {0,3}##[ \\t]/.test(line)) { inReg = line.slice(line.lastIndexOf('##') + 2)"
    ".replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }"))

# 6 outside-unindented: outside ids only for a pipe at column 0; R96 row shape allows <=3 spaces.
c['outside-unindented'] = one(pos, OUT,
    "    if (!inReg) { if (/^\\|[ \\t]*S[0-9]{3,}[ \\t]*\\|/.test(line)) outside.push(fields[1].trim()); continue; }")

# 7 fence-rows: row-shaped lines inside ``` fences are ignored (CommonMark); R96/census treat them as rows.
s = one(pos, LOOP, LOOP.replace('{', "{ let fence = false;")
        if False else "  let fence = false;\n" + LOOP)
s = one(s, "    if (/^ {0,3}```/.test(line)) { fence = !fence; continue; }" if False else ROW,
        "    if (/^ {0,3}```/.test(line)) { fence = !fence; continue; }\n    if (fence) continue;\n" + ROW)
c['fence-rows'] = s

# 8 no-registry-fastpath: a file whose text lacks "Registry" returns early; R96 still lists every row as outside.
c['no-registry-fastpath'] = one(pos, EARLY, EARLY + "\n  if (!sourcesText.includes('Registry')) return pins;")

# 9 hardcode-fixtures: recognise the frozen fixtures by their titles and replay the expected lists.
P = tokens_pins()
pins = ', '.join(f"'{p}'" for p in P.values())
hc = (
    "\n  if (sourcesText.includes('fixture r96 A')) {\n"
    f"    for (const p of [{pins}]) pins.add(p);\n"
    "    outside.push('S901','S007','S020','S011','S020','S021','S022','S023','S024','S025','S028');\n"
    "    malformed.push('S002');\n    return pins;\n  }\n"
    "  if (sourcesText.includes('fixture r96 B (whole file CRLF)')) {\n"
    "    outside.push('S101','S102','S103');\n    return pins;\n  }")
c['hardcode-fixtures'] = one(pos, EARLY, EARLY + hc)

# --- constructions expected to be CAUGHT by the counter (discrimination check) ---

# 10 startswith: heading text startswith('Registry') instead of exact equality.
c['startswith-registry'] = one(pos, H2, (
    "    if (/^ {0,3}##[ \\t]/.test(line)) { inReg = line.replace(/^ {0,3}##/, '')"
    ".replace(/^[ \\t]+|[ \\t]+$/g, '').startsWith('Registry'); continue; }"))

# 11 includes: 'Registry' anywhere in the heading line.
c['includes-registry'] = one(pos, H2, (
    "    if (/^ {0,3}##[ \\t]/.test(line)) { inReg = line.includes('Registry'); continue; }"))

# 12 cap10: outside list truncated to 10 entries.
c['cap-10'] = one(pos, OUT,
    "    if (!inReg) { if (outside.length < 10) outside.push(fields[1].trim()); continue; }")

# 13 field2: outside id taken from field 2 (the source cell) instead of field 1.
c['field-2'] = one(pos, OUT, "    if (!inReg) { outside.push(fields[2].trim()); continue; }")

# 14 blank-switch: a heading only switches when followed by a blank line.
c['blank-switch'] = one(pos, LOOP + "\n" + H2, (
    "  const xs = sourcesText.split('\\n');\n"
    "  for (let li = 0; li < xs.length; li++) {\n"
    "    const line = xs[li];\n"
    "    if (/^ {0,3}##[ \\t]/.test(line)) { if (xs[li + 1] === '') inReg = line.replace(/^ {0,3}##/, '')"
    ".replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }"))

os.makedirs(out, exist_ok=True)
for name, text in c.items():
    path = os.path.join(out, name + '.mjs')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(name, hashlib.sha256(text.encode()).hexdigest())
