#!/usr/bin/env python3
"""make-controls96.py — build the round-96 pre-data controls from the BASE round-gate bytes.

Usage: python3 make-controls96.py <base round-gate.mjs> <out dir>

BASE = scripts/round-gate.mjs at the round-96 freeze (sha256 aba737dc…, the round-95 shipped bytes).
Every control except ctl-nothing applies the same plumbing (an `outsideRows: []` key on both
`citations` initialisers, an `outside` parameter, the caller passing `citations.outsideRows`, a text
info line) and one `declaredPins()` row loop; each patch is asserted to apply the stated number of times.

  ctl-nothing      BASE bytes unchanged (the do-nothing control)
  ctl-positive     L1 reference rule R96 (census section membership, plan.md)
  ctl-h3exits      any `##+` heading switches the section (a `###` sub-heading leaves the Registry)
  ctl-firstonly    once a `## Registry` heading is seen every later row is inside (later `##` ignored)
  ctl-closeseq     CommonMark closing sequence stripped (`## Registry ##` reads as Registry)
  ctl-crlftrim     heading text trimmed with JS `.trim()` (`## Registry\\r` reads as Registry)
  ctl-casefold     case-insensitive heading match (`## registry` reads as Registry)
  ctl-anyindent    a heading may carry any indentation (`    ## Leads` switches the section)
  ctl-nospace      `##` needs no following space/tab (`##Leads` switches the section)
  ctl-fence        headings inside ``` fences are ignored (CommonMark, not the census)
  ctl-defaultin    the state starts inside the Registry (rows before any heading declare)
  ctl-h1keep       a `#` heading does not clear the state
  ctl-nodisclose   reference rule, nothing pushed to outsideRows
  ctl-dedupe       an outside id already listed is not listed again
  ctl-sorted       outsideRows sorted instead of file order
  ctl-urlonly      an outside row is listed only when it carries a URL
  ctl-countfirst   the r95 field-count check runs before the section check
  ctl-dropall      any outside row makes the whole registry declare nothing
  ctl-nofailclosed reference rule, but the fail-closed `citations` object lacks outsideRows
  ctl-notext       reference rule, but no text-mode SOURCES_ROWS_OUTSIDE info line
"""
import hashlib
import os
import sys

base_path, out = sys.argv[1], sys.argv[2]
base = open(base_path, encoding='utf-8').read()

INIT_OLD = "declared: [], malformedRows: [], unresolved: []"
INIT_NEW = "declared: [], malformedRows: [], outsideRows: [], unresolved: []"
SIG_OLD = "function declaredPins(sourcesText, malformed = []) {\n"
SIG_NEW = "function declaredPins(sourcesText, malformed = [], outside = []) {\n"
CALL_OLD = "declaredPins(readRegistry(join(repo, 'corpus', 'SOURCES.md')), citations.malformedRows)"
CALL_NEW = "declaredPins(readRegistry(join(repo, 'corpus', 'SOURCES.md')), citations.malformedRows, citations.outsideRows)"
LOOP_OLD = ("  for (const line of sourcesText.split('\\n')) {\n"
            "    if (!SOURCES_ROW_RE.test(line)) continue;\n"
            "    const fields = line.split('|');\n"
            "    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }\n")
RET_OLD = "  }\n  return pins;\n}\n\n/** A token is declared iff"
TEXT_OLD = ("          + ` [${citations.malformedRows.join(' ')}]`);\n"
            "      }\n")
TEXT_NEW = TEXT_OLD + (
    "      if (citations.outsideRows.length) {\n"
    "        lines.push(`ROUND_GATE  info  SOURCES_ROWS_OUTSIDE  outside=${citations.outsideRows.length}`\n"
    "          + ` [${citations.outsideRows.join(' ')}]`);\n"
    "      }\n")

H2 = r"/^ {0,3}##[ \t]/"
H2_STRIP = r"/^ {0,3}##/"
TRIM_ST = r".replace(/^[ \t]+|[ \t]+$/g, '')"
H1 = r"/^ {0,3}#[ \t]/"
PUSH = "outside.push(fields[1].trim())"


def loop(h2=H2, strip=H2_STRIP, trim=TRIM_ST, eq="=== 'Registry'", h1=H1, start='false', set_expr=None,
         h1_body='inReg = false; continue;', push=PUSH, pre='', count_first=False):
    set_expr = set_expr or f"inReg = line.replace({strip}, ''){trim} {eq};"
    head = (f"  let inReg = {start};\n{pre}"
            "  for (const line of sourcesText.split('\\n')) {\n"
            f"    if ({h2}.test(line)) {{ {set_expr} continue; }}\n"
            f"    if ({h1}.test(line)) {{ {h1_body} }}\n"
            "    if (!SOURCES_ROW_RE.test(line)) continue;\n"
            "    const fields = line.split('|');\n")
    if count_first:
        return head + ("    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }\n"
                       f"    if (!inReg) {{ {push}; continue; }}\n")
    return head + (f"    if (!inReg) {{ {push}; continue; }}\n"
                   "    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }\n")


def build(loop_new, ret_new=None, init_n=2, text=True):
    s = base
    pairs = [(SIG_OLD, SIG_NEW, 1), (CALL_OLD, CALL_NEW, 1), (LOOP_OLD, loop_new, 1)]
    if init_n == 2:
        pairs.append((INIT_OLD, INIT_NEW, 2))
    if text:
        pairs.append((TEXT_OLD, TEXT_NEW, 1))
    if ret_new:
        pairs.append((RET_OLD, ret_new, 1))
    for old, new, n in pairs:
        assert s.count(old) == n, (old[:70], s.count(old))
        s = s.replace(old, new)
    if init_n == 1:  # only the round-mode initialiser (the first occurrence) gets the key
        assert s.count(INIT_OLD) == 2
        s = s.replace(INIT_OLD, INIT_NEW, 1)
    return s


FENCE_PRE = "  let fence = false;\n"
FENCE_H2 = "/^ {0,3}##[ \\t]/"
fence_loop = loop().replace(
    "  for (const line of sourcesText.split('\\n')) {\n",
    "  for (const line of sourcesText.split('\\n')) {\n"
    "    if (/^ {0,3}```/.test(line)) { fence = !fence; continue; }\n"
    "    if (fence && /^ {0,3}#/.test(line)) continue;\n").replace("  let inReg = false;\n", "  let inReg = false;\n" + FENCE_PRE)

controls = {
    'ctl-nothing': base,
    'ctl-positive': build(loop()),
    'ctl-h3exits': build(loop(h2=r"/^ {0,3}#{2,}[ \t]/", strip=r"/^ {0,3}#{2,}/")),
    'ctl-firstonly': build(loop(set_expr=f"inReg = inReg || line.replace({H2_STRIP}, ''){TRIM_ST} === 'Registry';")),
    'ctl-closeseq': build(loop(trim=TRIM_ST + r".replace(/[ \t]+#+$/, '')")),
    'ctl-crlftrim': build(loop(trim=".trim()")),
    'ctl-casefold': build(loop(trim=TRIM_ST + ".toLowerCase()", eq="=== 'registry'")),
    'ctl-anyindent': build(loop(h2=r"/^\s*##[ \t]/", strip=r"/^\s*##/", h1=r"/^\s*#[ \t]/")),
    'ctl-nospace': build(loop(h2=r"/^ {0,3}##(?!#)/")),
    'ctl-fence': build(fence_loop),
    'ctl-defaultin': build(loop(start='true')),
    'ctl-h1keep': build(loop(h1_body='continue;')),
    'ctl-nodisclose': build(loop(push='void 0')),
    'ctl-dedupe': build(loop(push="if (!outside.includes(fields[1].trim())) " + PUSH)),
    'ctl-sorted': build(loop(), ret_new="  }\n  outside.sort();\n  return pins;\n}\n\n/** A token is declared iff"),
    'ctl-urlonly': build(loop(push="if (/https?:\\/\\//.test(line)) " + PUSH)),
    'ctl-countfirst': build(loop(count_first=True)),
    'ctl-dropall': build(loop(), ret_new="  }\n  if (outside.length) pins.clear();\n  return pins;\n}\n\n/** A token is declared iff"),
    'ctl-nofailclosed': build(loop(), init_n=1),
    'ctl-notext': build(loop(), text=False),
}

os.makedirs(out, exist_ok=True)
for name, text in controls.items():
    p = os.path.join(out, name + '.mjs')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(text)
    print(name, hashlib.sha256(text.encode()).hexdigest())
