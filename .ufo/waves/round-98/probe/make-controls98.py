#!/usr/bin/env python3
"""make-controls98.py <BASE round-gate.mjs> <out dir>

Builds the round-98 pre-data controls for claim C1 from BASE bytes. Each control rewrites only the
registry-row recogniser of `declaredPins()` (the `SOURCES_ROW_RE` constant and, for the split
controls, the one line that tests it). ctl-positive is the L1 reference rule R98 (census id-cell
class `[ \\t]` on both sides); every other control violates exactly one clause of R98.
ctl-nothing is BASE unchanged.
"""
import sys, pathlib

base = pathlib.Path(sys.argv[1]).read_text()
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)

CONST = "const SOURCES_ROW_RE = /^ {0,3}\\|\\s*S\\d{3,}\\s*\\|/;\n"
TEST = "    if (!SOURCES_ROW_RE.test(line)) continue;\n"
assert base.count(CONST) == 1, "BASE SOURCES_ROW_RE line not found exactly once"
assert base.count(TEST) == 1, "BASE row test line not found exactly once"

POS = "/^ {0,3}\\|[ \\t]*S\\d{3,}[ \\t]*\\|/"
OLD = "/^ {0,3}\\|\\s*S\\d{3,}\\s*\\|/"

def const(rx):
    return base.replace(CONST, f"const SOURCES_ROW_RE = {rx};\n")

def split(inside, outside):
    b = const(POS)
    return b.replace(TEST, f"    if (!(inReg ? {inside} : {outside}).test(line)) continue;\n")

variants = {
    "ctl-positive": const(POS),
    "ctl-spaceonly": const("/^ {0,3}\\| *S\\d{3,} *\\|/"),
    "ctl-asciiws": const("/^ {0,3}\\|[ \\t\\v\\f\\r]*S\\d{3,}[ \\t\\v\\f\\r]*\\|/"),
    "ctl-nbsp": const("/^ {0,3}\\|[ \\t\\u00a0]*S\\d{3,}[ \\t\\u00a0]*\\|/"),
    "ctl-zs": const("/^ {0,3}\\|[\\p{Zs}\\t]*S\\d{3,}[\\p{Zs}\\t]*\\|/u"),
    "ctl-leadonly": const("/^ {0,3}\\|[ \\t]*S\\d{3,}\\s*\\|/"),
    "ctl-trailonly": const("/^ {0,3}\\|\\s*S\\d{3,}[ \\t]*\\|/"),
    "ctl-anyindent": const("/^[ \\t]{0,3}\\|[ \\t]*S\\d{3,}[ \\t]*\\|/"),
    "ctl-indent4": const("/^ {0,4}\\|[ \\t]*S\\d{3,}[ \\t]*\\|/"),
    "ctl-digits2": const("/^ {0,3}\\|[ \\t]*S\\d{2,}[ \\t]*\\|/"),
    "ctl-casefold": const("/^ {0,3}\\|[ \\t]*S\\d{3,}[ \\t]*\\|/i"),
    "ctl-unicodedigit": const("/^ {0,3}\\|[ \\t]*S\\p{Nd}{3,}[ \\t]*\\|/u"),
    "ctl-insideonly": split(POS, OLD),
    "ctl-outsideonly": split(OLD, POS),
}
(out / "ctl-nothing.mjs").write_text(base)
for name, text in variants.items():
    assert text != base, name
    (out / f"{name}.mjs").write_text(text)
print(f"controls={len(variants) + 1} out={out}")
