#!/usr/bin/env python3
"""build_mutants.py — derive single-point mutants of the round-96 R96 rule from a candidate.

Usage: python3 build_mutants.py <candidate round-gate.mjs> <outroot>

Each mutant is written to <outroot>/<name>/round-gate.mjs beside copies of cap-spawn.mjs and
cap-run.mjs (the gate imports ./cap-spawn.mjs). Every replacement is asserted to apply exactly
once; a shape that no longer exists aborts loudly instead of producing a vacuous mutant.
"""
import hashlib
import json
import os
import shutil
import sys

CAND = sys.argv[1]
OUT = sys.argv[2]
text = open(CAND, encoding='utf-8').read()

HERE = os.path.dirname(os.path.abspath(__file__))
CAPS = [os.path.join(HERE, 'lane', 'cap-spawn.mjs'), os.path.join(HERE, 'lane', 'cap-run.mjs')]

H2_LINE = "    if (/^ {0,3}##[ \\t]/.test(line)) { inReg = line.replace(/^ {0,3}##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }\n"
H1_LINE = "    if (/^ {0,3}#[ \\t]/.test(line)) { inReg = false; continue; }\n"
OUT_LINE = "    if (!inReg) { outside.push(fields[1].trim()); continue; }\n"
COUNT_LINE = "    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }\n"
REJ_LINES = ("    const status = (fields[8] ?? '').trim();\n"
             "    if (status.toLowerCase() === 'rejected') continue;\n")
PIN_LOOP = ("    for (const m of line.matchAll(SOURCES_URL_RE)) {\n"
            "      for (const seg of m[0].split(SOURCES_SEGMENT_RE)) if (SOURCES_PIN_RE.test(seg)) pins.add(seg);\n"
            "    }\n")
START_LINE = "  let inReg = false;\n"
INIT_OLD = "declared: [], malformedRows: [], unresolved: []"
INIT_NEW = "declared: [], malformedRows: [], outsideRows: [], unresolved: []"
TEXT_OUT = ("      if (citations.outsideRows.length) {\n"
            "        lines.push(`ROUND_GATE  info  SOURCES_ROWS_OUTSIDE  outside=${citations.outsideRows.length}`\n"
            "          + ` [${citations.outsideRows.join(' ')}]`);\n"
            "      }\n")

FULL_BODY = (START_LINE + "  for (const line of sourcesText.split('\\n')) {\n"
             + H2_LINE + H1_LINE
             + "    if (!SOURCES_ROW_RE.test(line)) continue;\n"
             + "    const fields = line.split('|');\n"
             + OUT_LINE + COUNT_LINE + REJ_LINES + PIN_LOOP
             + "  }\n  return pins;\n}\n\n/** A token is declared iff")

for name, s, n_want in [('FULL_BODY', FULL_BODY, 1), ('TEXT', TEXT_OUT, 1)]:
    n = text.count(s)
    if n < n_want:
        sys.exit(f'ABORT: candidate primitive {name} absent ({n} matches, want {n_want})')
    print(f'primitive {name}: {n} match(es)')
# The fail-closed initialiser mutation: drop outsideRows from the SECOND citations literal
# (base-like bytes carry INIT_OLD twice; candidate bytes carry INIT_NEW twice).
if text.count(INIT_NEW) == 2:
    INIT_MUT = 'candidate'
    print('primitive INIT: candidate form x2 (fail-closed drop = last occurrence)')
elif text.count(INIT_OLD) == 2:
    INIT_MUT = 'base'
    print('primitive INIT: base form x2')
else:
    sys.exit(f'ABORT: citations initialiser shape unknown (INIT_NEW={text.count(INIT_NEW)} INIT_OLD={text.count(INIT_OLD)})')

def _body(h2=H2_LINE, h1=H1_LINE, out=OUT_LINE, count=COUNT_LINE, start=START_LINE, pre='',
         count_first=False, after='', rej_before_out=False):
    """The whole declaredPins loop body from `let inReg` to the closing brace before the doc comment."""
    s = pre + start + "  for (const line of sourcesText.split('\\n')) {\n" + h2 + h1
    s += "    if (!SOURCES_ROW_RE.test(line)) continue;\n    const fields = line.split('|');\n"
    if rej_before_out:
        s += count + REJ_LINES + out + PIN_LOOP
    elif count_first:
        s += count + out + REJ_LINES + PIN_LOOP
    else:
        s += out + count + REJ_LINES + PIN_LOOP
    s += "  }\n" + after + "  return pins;\n}\n\n/** A token is declared iff"
    return s

def body(**kw):
    assert text.count(FULL_BODY) == 1
    return text.replace(FULL_BODY, _body(**kw), 1)

FENCE_PRE = ("  let fence = false;\n")
FENCE_LINES = ("    if (/^ {0,3}```/.test(line)) { fence = !fence; continue; }\n"
               "    if (fence && /^ {0,3}#/.test(line)) continue;\n")

specs = {}
def add(name, s, note=''):
    specs[name] = (s, note)


# --- 18 control shapes applied to the candidate's own R96 code ---------------
add('m01-ctl-h3exits', body(h2="    if (/^ {0,3}#{2,}[ \\t]/.test(line)) { inReg = line.replace(/^ {0,3}#{2,}/, '').replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }\n"), 'any ##+ heading switches the section')
add('m02-ctl-firstonly', body(h2="    if (/^ {0,3}##[ \\t]/.test(line)) { inReg = inReg || line.replace(/^ {0,3}##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }\n"), 'later ## headings ignored')
add('m03-ctl-closeseq', body(h2="    if (/^ {0,3}##[ \\t]/.test(line)) { inReg = line.replace(/^ {0,3}##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '').replace(/[ \\t]+#+$/, '') === 'Registry'; continue; }\n"), 'CommonMark closing sequence stripped')
add('m04-ctl-crlftrim', body(h2="    if (/^ {0,3}##[ \\t]/.test(line)) { inReg = line.replace(/^ {0,3}##/, '').trim() === 'Registry'; continue; }\n"), 'JS .trim() strips \\r')
add('m05-ctl-casefold', body(h2="    if (/^ {0,3}##[ \\t]/.test(line)) { inReg = line.replace(/^ {0,3}##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '').toLowerCase() === 'registry'; continue; }\n"), 'case-insensitive')
add('m06-ctl-anyindent', body(h2="    if (/^\\s*##[ \\t]/.test(line)) { inReg = line.replace(/^\\s*##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }\n",
                              h1="    if (/^\\s*#[ \\t]/.test(line)) { inReg = false; continue; }\n"), 'any indentation')
add('m07-ctl-nospace', body(h2="    if (/^ {0,3}##(?!#)/.test(line)) { inReg = line.replace(/^ {0,3}##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }\n"), 'no space/tab needed after ##')
add('m08-ctl-fence', body(pre=FENCE_PRE, start=START_LINE, h2=FENCE_LINES + H2_LINE), 'fence-aware heading scan')
add('m09-ctl-defaultin', body(start="  let inReg = true;\n"), 'state starts inside')
add('m10-ctl-h1keep', body(h1="    if (/^ {0,3}#[ \\t]/.test(line)) { continue; }\n"), '# heading does not clear')
add('m11-ctl-nodisclose', body(out="    if (!inReg) { void 0; continue; }\n"), 'outsideRows never filled')
add('m12-ctl-dedupe', body(out="    if (!inReg) { if (!outside.includes(fields[1].trim())) outside.push(fields[1].trim()); continue; }\n"), 'repeats collapsed')
add('m13-ctl-sorted', body(after="  outside.sort();\n"), 'outsideRows sorted')
add('m14-ctl-urlonly', body(out="    if (!inReg) { if (/https?:\\/\\//.test(line)) outside.push(fields[1].trim()); continue; }\n"), 'URL-less rows unlisted')
add('m15-ctl-countfirst', body(count_first=True), 'field count before section')
add('m16-ctl-dropall', body(after="  if (outside.length) pins.clear();\n"), 'outside row silences registry')
if INIT_MUT == 'base':
    _m17 = text.replace(INIT_OLD, INIT_NEW, 1)
else:
    _i = text.rindex(INIT_NEW)
    _m17 = text[:_i] + INIT_OLD + text[_i + len(INIT_NEW):]
add('m17-ctl-nofailclosed', _m17, 'fail-closed citations lacks key')
add('m18-ctl-notext', text.replace(TEXT_OUT, '', 1), 'no text-mode line')

# --- boundary mutants --------------------------------------------------------
add('b19-indent4', body(h2="    if (/^ {0,4}##[ \\t]/.test(line)) { inReg = line.replace(/^ {0,4}##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }\n",
                        h1="    if (/^ {0,4}#[ \\t]/.test(line)) { inReg = false; continue; }\n"), '{0,3} -> {0,4}')
add('b20-spaceclass', body(h2="    if (/^ {0,3}##\\s/.test(line)) { inReg = line.replace(/^ {0,3}##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '') === 'Registry'; continue; }\n"), '[ \\t] -> \\s')
add('b21-not-eq', body(h2="    if (/^ {0,3}##[ \\t]/.test(line)) { inReg = line.replace(/^ {0,3}##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '') !== 'Registry'; continue; }\n"), '=== -> !==')
add('b22-start-true', body(start="  let inReg = true;\n"), 'initial state flipped (dup of m09)')
add('b23-unshift', body(out="    if (!inReg) { outside.unshift(fields[1].trim()); continue; }\n"), 'push -> unshift')
add('b24-id-field2', body(out="    if (!inReg) { outside.push(fields[2].trim()); continue; }\n"), 'id fields[1] -> fields[2]')
add('b25-outside-after-rejected', body(rej_before_out=True), 'outside check after rejected'); 

os.makedirs(OUT, exist_ok=True)
manifest = {}
for name, (s, note) in specs.items():
    d = os.path.join(OUT, name)
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, 'round-gate.mjs')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)
    for c in CAPS:
        shutil.copy2(c, d)
    manifest[name] = {'sha256': hashlib.sha256(s.encode()).hexdigest(), 'note': note,
                      'lines_changed': sum(1 for a, b in zip(text.split('\n'), s.split('\n')) if a != b)}
    print(f'{name:30s} {manifest[name]["sha256"][:16]} lines_changed={manifest[name]["lines_changed"]}  {note}')
with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
    json.dump({'candidate': CAND, 'candidate_sha256': hashlib.sha256(text.encode()).hexdigest(),
               'candidate_lines': len(text.split('\n')), 'mutants': manifest}, f, indent=1)
