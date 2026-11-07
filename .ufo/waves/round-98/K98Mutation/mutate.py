#!/usr/bin/env python3
"""mutate.py <candidate round-gate.mjs> <out dir> [--only name,name]

Single-point mutants of the round-98 row recogniser (rule R98). Each mutant rewrites ONE
behavior-bearing point of `declaredPins()` / the new selftest arms' subject: the id-cell pad
class (13 control shapes), BASE `\\s`, boundary mutants ({0,3}, \\d{3,}, [ \\t]?, [ \\t]+,
anchors, inReg, fields[1].trim()). Writes <out>/<name>/round-gate.mjs plus a manifest.
"""
import hashlib, pathlib, re, sys

cand_path = pathlib.Path(sys.argv[1])
out = pathlib.Path(sys.argv[2])
only = None
if '--only' in sys.argv:
    only = set(sys.argv[sys.argv.index('--only') + 1].split(','))
base = cand_path.read_text()

POS = r"/^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/"
CONST_RE = re.compile(r"const SOURCES_ROW_RE = (/(?:[^/\\\n]|\\.)*/[a-z]*);\n")
TEST = "    if (!SOURCES_ROW_RE.test(line)) continue;\n"

m = CONST_RE.search(base)
assert m, "candidate has no `const SOURCES_ROW_RE = /.../;` line"
assert m.group(1) == POS, f"candidate row regex is not R98: {m.group(1)!r}"
assert base.count(TEST) == 1, "candidate row test line not found exactly once"

def const(rx):
    return base[:m.start(1)] + rx + base[m.end(1):]

def split(inside, outside):
    b = const(POS)
    return b.replace(TEST, f"    if (!(inReg ? {inside} : {outside}).test(line)) continue;\n")

V = {
  # 13 control shapes applied to the candidate's own code
  'm-spaceonly':    const(r"/^ {0,3}\| *S\d{3,} *\|/"),
  'm-asciiws':      const(r"/^ {0,3}\|[ \t\v\f\r]*S\d{3,}[ \t\v\f\r]*\|/"),
  'm-nbsp':         const(r"/^ {0,3}\|[ \t\u00a0]*S\d{3,}[ \t\u00a0]*\|/"),
  'm-zs':           const(r"/^ {0,3}\|[\p{Zs}\t]*S\d{3,}[\p{Zs}\t]*\|/u"),
  'm-leadonly':     const(r"/^ {0,3}\|[ \t]*S\d{3,}\s*\|/"),
  'm-trailonly':    const(r"/^ {0,3}\|\s*S\d{3,}[ \t]*\|/"),
  'm-anyindent':    const(r"/^[ \t]{0,3}\|[ \t]*S\d{3,}[ \t]*\|/"),
  'm-indent4':      const(r"/^ {0,4}\|[ \t]*S\d{3,}[ \t]*\|/"),
  'm-digits2':      const(r"/^ {0,3}\|[ \t]*S\d{2,}[ \t]*\|/"),
  'm-casefold':     const(r"/^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/i"),
  'm-unicodedigit': const(r"/^ {0,3}\|[ \t]*S\p{Nd}{3,}[ \t]*\|/u"),
  'm-insideonly':   split(POS, r"/^ {0,3}\|\s*S\d{3,}\s*\|/"),
  'm-outsideonly':  split(r"/^ {0,3}\|\s*S\d{3,}\s*\|/", POS),
  # BASE \s restored on the candidate
  'm-base-ws':      const(r"/^ {0,3}\|\s*S\d{3,}\s*\|/"),
  # boundary mutants
  'm-indent-max2':  const(r"/^ {0,2}\|[ \t]*S\d{3,}[ \t]*\|/"),
  'm-digits4':      const(r"/^ {0,3}\|[ \t]*S\d{4,}[ \t]*\|/"),
  'm-pad-opt':      const(r"/^ {0,3}\|[ \t]?S\d{3,}[ \t]*\|/"),
  'm-pad-plus':     const(r"/^ {0,3}\|[ \t]+S\d{3,}[ \t]*\|/"),
  'm-pad-opt-trail':   const(r"/^ {0,3}\|[ \t]*S\d{3,}[ \t]?\|/"),
  'm-pad-plus-trail':  const(r"/^ {0,3}\|[ \t]*S\d{3,}[ \t]+\|/"),
  'm-no-right-pipe': const(r"/^ {0,3}\|[ \t]*S\d{3,}[ \t]*/"),
  'm-no-caret':     const(r"/ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/"),
}

# non-constant single-point mutants: one line elsewhere in declaredPins()
ALT_RAW = {
  'm-inreg-flip': ("    if (!inReg) { outside.push(fields[1].trim()); continue; }\n",
                   "    if (inReg) { outside.push(fields[1].trim()); continue; }\n"),
  'm-f1trim-outside': ("    if (!inReg) { outside.push(fields[1].trim()); continue; }\n",
                       "    if (!inReg) { outside.push(fields[1]); continue; }\n"),
  'm-f1trim-malformed': ("    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }\n",
                         "    if (fields.length !== 13) { malformed.push(fields[1]); continue; }\n"),
}

out.mkdir(parents=True, exist_ok=True)
ALT = {}
for name, (old, new) in ALT_RAW.items():
    assert base.count(old) == 1, f"{name}: target line occurs {base.count(old)} times"
    ALT[name] = base.replace(old, new)
manifest = []
for name, text in list(V.items()) + list(ALT.items()):
    if only and name not in only:
        continue
    assert text != base, f"{name}: no change"
    d = out / name
    d.mkdir(parents=True, exist_ok=True)
    p = d / 'round-gate.mjs'
    p.write_text(text)
    for sib in ('cap-spawn.mjs', 'cap-run.mjs'):
        src = cand_path.parent / sib
        if not src.exists():
            src = pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts') / sib
        assert src.exists(), sib
        (d / sib).write_bytes(src.read_bytes())
    manifest.append(f"{name} {hashlib.sha256(text.encode()).hexdigest()}")
(out / 'MANIFEST.txt').write_text('\n'.join(manifest) + '\n')
print(f"mutants={len(manifest)} out={out}")
