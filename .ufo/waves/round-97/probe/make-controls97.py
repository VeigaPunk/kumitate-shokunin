#!/usr/bin/env python3
"""make-controls97.py <BASE sources-check.mjs> <out dir>

Builds the round-97 pre-data controls for claim C1 from BASE bytes: each control replaces BASE's
section-state block (the `sourceLines` split through the `sectionAtLine` loop) with one variant.
ctl-positive is the L1 reference rule R97 (census `row_pass` section grammar on CR-kept lines);
every other control violates exactly one clause of R97. ctl-nothing is BASE unchanged.
"""
import sys, pathlib

base = pathlib.Path(sys.argv[1]).read_text()
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)

START = "  const sourceLines = sourceText.split(/\\r?\\n/).map(normalizeMarkdownIndent);\n"
END = "    sectionAtLine[index] = activeSection;\n  }\n"
i = base.index(START); j = base.index(END, i) + len(END)
mid = base[i + len(START):base.index("  const headings = Object.create(null);\n", i)]

def block(split="sourceText.split('\\n')", h2=r"/^ {0,3}##[ \t]/", strip=r"/^ {0,3}##/",
          trim=r"/^[ \t]+|[ \t]+$/g", h1=r"/^ {0,3}#[ \t]/", start="null", fold="", h1clear=True,
          emptyok=True, report=True):
    clear = "      activeSection = null;\n" if h1clear else "      /* h1 keeps the section */\n"
    guard = "" if emptyok else "      if (activeSection === '') activeSection = sectionAtLine[index - 1] ?? " + start + ";\n"
    return (START
            + f"  const rawLines = {split};\n"
            + mid
            + "  const headings = Object.create(null);\n"
            + "  const sectionAtLine = [];\n"
            + f"  let activeSection = {start};\n"
            + "  for (let index = 0; index < rawLines.length; index += 1) {\n"
            + "    const raw = rawLines[index];\n"
            + f"    if ({h2}.test(raw)) {{\n"
            + f"      activeSection = raw.replace({strip}, '').replace({trim}, ''){fold};\n"
            + guard
            + "      headings[activeSection] = true;\n"
            + f"    }} else if ({h1}.test(raw)) {{\n"
            + clear
            + "    }\n"
            + "    sectionAtLine[index] = activeSection;\n"
            + "  }\n")

variants = {
    "ctl-positive": block(),
    "ctl-crlfstrip": block(split="sourceText.split(/\\r?\\n/)"),
    "ctl-spaceonly": block(h2=r"/^ {0,3}## /"),
    "ctl-wsclass": block(h2=r"/^ {0,3}##\s/", h1=r"/^ {0,3}#\s/"),
    "ctl-jstrim": block(trim=r"/^\s+|\s+$/g"),
    "ctl-h1loose": block(h1=r"/^ {0,3}#(?:[ \t]|$)/"),
    "ctl-h1keep": block(h1clear=False),
    "ctl-emptyhead": block(emptyok=False),
    "ctl-anyindent": block(h2=r"/^[ \t]*##[ \t]/", strip=r"/^[ \t]*##/", h1=r"/^[ \t]*#[ \t]/"),
    "ctl-casefold": block(fold=".replace(/^registry$/i, 'Registry')"),
    "ctl-closeseq": block(fold=".replace(/[ \\t]+#+$/, '')"),
    "ctl-h3heading": block(h2=r"/^ {0,3}##+[ \t]/", strip=r"/^ {0,3}##+/"),
    "ctl-defaultin": block(start="'Registry'"),
    "ctl-trailcr": block(trim=r"/^[ \t]+|[ \t\r]+$/g"),
    "ctl-nbsp": block(trim=r"/^[ \t\u00a0]+|[ \t\u00a0]+$/g"),
}
(out / "ctl-nothing.mjs").write_text(base)
for name, blk in variants.items():
    (out / f"{name}.mjs").write_text(base[:i] + blk + base[j:])
# ctl-nodisclose: the reference rule but outside rows are never reported
pos = (out / "ctl-positive.mjs").read_text()
nd = pos.replace("        add('error', 'ROW_OUTSIDE_REGISTRY',", "        if (false) add('error', 'ROW_OUTSIDE_REGISTRY',", 1)
assert nd != pos
(out / "ctl-nodisclose.mjs").write_text(nd)
print("controls:", " ".join(sorted(p.stem for p in out.glob("ctl-*.mjs"))))
