#!/usr/bin/env python3
"""Fleet-wide survey of registry id-cell pad classes + BASE/census disagreement."""
import glob, json, os, re, sys, unicodedata

FLEET = "/home/vgpnk/Projects/shokunin"

# ECMAScript \s (ES2015+) = WhiteSpace + LineTerminator
ES_WS = set("\t\n\v\f\r \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff")
BLANK = set(" \t")
# Python str.isspace()-ish extras (Cf format chars are NOT \s in ES)
WS_NONBLANK = sorted((ES_WS - BLANK) - {"\n"}, key=ord)

BASE_RE = re.compile(r"^ {0,3}\|\s*S\d{3,}\s*\|")
CENSUS_RE = re.compile(r"^\|[ \t]*S\d{3,}[ \t]*\|")
CENSUS_STRIP = re.compile(r"^ {0,3}")


def pad_class(cell):
    """cell = text between first and second '|'. Return (lead_pads, trail_pads, idcore)."""
    m = re.search(r"S\d{3,}", cell)
    if not m:
        return None, None, None
    lead = cell[: m.start()]
    trail = cell[m.end():]
    core = cell[m.start(): m.end()]
    return lead, trail, core


def classify(ch):
    if ch in BLANK:
        return "BLANK"
    if ch in ES_WS:
        return "ES_WS_NONBLANK"
    return "OTHER"


def scan(path):
    with open(path, "rb") as f:
        raw = f.read()
    crlf = b"\r\n" in raw
    text = raw.decode("utf-8")
    lines = text.split("\n")
    res = {
        "path": path,
        "crlf": crlf,
        "bytes": len(raw),
        "row_like": 0,
        "base_only": [],       # BASE matches, census does not
        "census_only": [],     # census matches, BASE does not
        "both": 0,
        "pad_classes": {},     # class -> count
        "pad_examples": {},
        "indent_classes": {},
        "nonblank_rows": 0,
    }
    for i, line in enumerate(lines, 1):
        stripped = CENSUS_STRIP.sub("", line)
        if not stripped.startswith("|"):
            continue
        if not line.startswith("|") and not re.match(r"^ {0,3}\|", line):
            # indent >3 spaces or other leading whitespace
            ind = line[: len(line) - len(line.lstrip(" \t"))]
            res["indent_classes"][repr(ind)] = res["indent_classes"].get(repr(ind), 0) + 1
        cell = stripped.split("|")[1] if len(stripped.split("|")) > 1 else ""
        lead, trail, core = pad_class(cell)
        if core is None:
            continue
        res["row_like"] += 1
        cls = []
        for ch in lead + trail:
            c = classify(ch)
            cls.append(c)
        key = ",".join(sorted(set(cls))) if cls else "NONE"
        res["pad_classes"][key] = res["pad_classes"].get(key, 0) + 1
        if key not in ("BLANK", "NONE"):
            res["nonblank_rows"] += 1
            res["pad_examples"].setdefault(key, []).append((i, repr(line[:90])))
        b = bool(BASE_RE.match(line))
        c = bool(CENSUS_RE.match(stripped))
        if b and not c:
            res["base_only"].append((i, repr(line[:110])))
        elif c and not b:
            res["census_only"].append((i, repr(line[:110])))
        elif b and c:
            res["both"] += 1
    return res


def main():
    out = {"lanes": []}
    for path in sorted(glob.glob(os.path.join(FLEET, "*-shokunin", "corpus", "SOURCES.md"))):
        lane = path.split("/")[-3]
        r = scan(path)
        r["lane"] = lane
        out["lanes"].append(r)
    print(json.dumps(out, indent=1, ensure_ascii=False))


main()
