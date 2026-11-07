#!/usr/bin/env python3
"""mk-specs.py <candidate.mjs> <out.json>  — round-97 K2 mutant specs (single-point).

Every `find` is asserted unique against the candidate at generation time; the driver
re-asserts. Mutants 1-16 are the 16 violating control shapes of make-controls97.py,
applied to the candidate's own section reader / disclosure site.
"""
import json, sys, pathlib

cand = pathlib.Path(sys.argv[1]).read_text()
out = pathlib.Path(sys.argv[2])

H2 = "if (/^ {0,3}##[ \\t]/.test(raw)) {"
H1 = "} else if (/^ {0,3}#[ \\t]/.test(raw)) {"
H2_CLEAR = "} else if (/^ {0,3}##[ \\t]/.test(raw)) {"
ASSIGN = "      activeSection = raw.replace(/^ {0,3}##/, '').replace(/^[ \\t]+|[ \\t]+$/g, '');"
SPLIT = "  const rawLines = sourceText.split('\\n');"
INIT = "  let activeSection = null;"
STORE = "    sectionAtLine[index] = activeSection;"
DISC = "        add('error', 'ROW_OUTSIDE_REGISTRY', 'corpus/SOURCES.md', index + 1, `id=${id} row outside Registry section`);"
CMP = "    if (sectionAtLine[index] !== 'Registry') {"
HEAD = "      headings[activeSection] = true;"

S = []
def add(i, desc, find, replace, expect):
    S.append({"id": i, "desc": desc, "find": find, "replace": replace, "expect": expect})

# --- the 16 control shapes on the candidate's own code -------------------------------
add("m01-crlfstrip", "ctl-crlfstrip: section state from CR-stripped lines",
    SPLIT, "  const rawLines = sourceText.split(/\\r?\\n/);", "KILLED")
add("m02-spaceonly", "ctl-spaceonly: `##` must be followed by SPACE only",
    H2, H2.replace("##[ \\t]", "## "), "KILLED")
add("m03-wsclass-h2", "ctl-wsclass: JS \\s after `##`", H2, H2.replace("##[ \\t]", "##\\s"), "KILLED")
add("m04-wsclass-h1", "ctl-wsclass: JS \\s after `#`", H1, H1.replace("#[ \\t]", "#\\s"), "KILLED")
add("m05-jstrim", "ctl-jstrim: heading text trimmed with \\s", ASSIGN,
    ASSIGN.replace("[ \\t]+|[ \\t]+$", "\\s+|\\s+$"), "KILLED")
add("m06-trailcr", "ctl-trailcr: trailing CR trimmed", ASSIGN,
    ASSIGN.replace("[ \\t]+|[ \\t]+$", "[ \\t]+|[ \\t\\r]+$"), "KILLED")
add("m07-nbsp", "ctl-nbsp: NBSP trimmed", ASSIGN,
    ASSIGN.replace("[ \\t]+|[ \\t]+$", "[ \\t\\u00a0]+|[ \\t\\u00a0]+$"), "KILLED")
add("m08-h1loose", "ctl-h1loose: bare `#` clears", H1,
    H1.replace("#[ \\t]", "#(?:[ \\t]|$)"), "KILLED")
add("m09-h1keep", "ctl-h1keep: `#` heading does not clear", H1 + "\n      activeSection = null;",
    H1 + "\n      /* h1 keeps the section */", "KILLED")
add("m10-emptyhead", "ctl-emptyhead: empty `## ` keeps previous section",
    ASSIGN + "\n" + HEAD,
    ASSIGN + "\n      if (activeSection === '') activeSection = sectionAtLine[index - 1] ?? null;\n" + HEAD,
    "KILLED")
BLOCK = "    " + H2 + "\n" + ASSIGN + "\n" + HEAD + "\n    " + H1
add("m11-anyindent", "ctl-anyindent: tab / 4-space headings accepted", BLOCK,
    BLOCK.replace("^ {0,3}##", "^[ \\t]*##").replace("^ {0,3}#", "^[ \\t]*#"), "KILLED")
add("m12-casefold", "ctl-casefold: `## registry` accepted", ASSIGN,
    ASSIGN[:-1] + ".replace(/^registry$/, 'Registry');", "KILLED")
add("m13-closeseq", "ctl-closeseq: CommonMark closing sequence stripped", ASSIGN,
    ASSIGN[:-1] + ".replace(/[ \\t]+#+$/, '');", "KILLED")
add("m14-h3head", "ctl-h3heading: `###` treated as a section heading", H2,
    H2.replace("##[ \\t]", "##+[ \\t]"), "KILLED")
add("m15-defaultin", "ctl-defaultin: state starts inside the Registry", INIT,
    "  let activeSection = 'Registry';", "KILLED")
add("m16-nodisclose", "ctl-nodisclose: outside rows never reported", DISC,
    "        if (false) " + DISC.strip(), "KILLED")

# --- boundary / structural ------------------------------------------------------------
add("m17-indent2", "`{0,3}` -> `{0,2}` on the h2 heading", H2,
    H2.replace("{0,3}", "{0,2}"), "KILLED")
add("m18-indent4", "`{0,3}` -> `{0,4}` on the h2 heading", H2,
    H2.replace("{0,3}", "{0,4}"), "KILLED")
add("m19-h1-indent4", "`{0,3}` -> `{0,4}` on the h1 clearing heading", H1,
    H1.replace("{0,3}", "{0,4}"), "KILLED")
add("m20-registry-neq", "section test flipped: `!==` -> `===`", CMP,
    CMP.replace("!== 'Registry'", "=== 'Registry'"), "KILLED")
add("m21-split-regex", "`split('\\n')` -> `split(/\\n/)` (equivalent?)", SPLIT,
    "  const rawLines = sourceText.split(/\\n/);", "EQUIVALENT")
add("m22-headings-raw", "headings keyed on the raw line, not the section text", HEAD,
    "      headings[raw] = true;", "KILLED")
add("m23-index-offbyone", "sectionAtLine stored at index+1", STORE,
    "    sectionAtLine[index + 1] = activeSection;", "KILLED")
add("m24-sourcelines-h1", "h1 branch reads sourceLines (CR-stripped) instead of rawLines", H1,
    H1.replace(".test(raw)", ".test(sourceLines[index])"), "KILLED")
add("m25-trim-lead-only", "heading text trims leading spaces/tabs only", ASSIGN,
    ASSIGN.replace("[ \\t]+|[ \\t]+$", "[ \\t]+"), "KILLED")
add("m26-trim-trail-only", "heading text trims trailing spaces/tabs only", ASSIGN,
    ASSIGN.replace("[ \\t]+|[ \\t]+$", "[ \\t]+$"), "KILLED")
add("m27-strip-slice", "heading strip uses raw.slice(2) (drops 0-3 indent removal)", ASSIGN,
    "      activeSection = raw.slice(2).replace(/^[ \\t]+|[ \\t]+$/g, '');", "KILLED")
add("m28-loop-bound", "loop bounds on sourceLines.length, reads rawLines",
    "for (let index = 0; index < rawLines.length; index += 1) {",
    "for (let index = 0; index < sourceLines.length; index += 1) {",
    "KILLED")

# uniqueness audit
bad = [s["id"] for s in S if cand.count(s["find"]) != 1 or s["find"] == s["replace"]]
if bad:
    sys.exit(f"specs not unique/identical: {bad}")
out.write_text(json.dumps(S, indent=1) + "\n")
print(f"{len(S)} specs written to {out}")
for s in S:
    print(f"  {s['id']:24s} expect={s['expect']:10s} {s['desc']}")
