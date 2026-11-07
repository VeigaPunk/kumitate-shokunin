#!/usr/bin/env python3
"""K96Scout — registry section survey (read-only) for kumitate round 96.

Re-implements the census section rule from scripts/sources-census.sh `row_pass`
(gawk block, lines 605-624) exactly:

  line matches ^ {0,3}##[ \t]  -> in_registry = (trim(substr(line,3)) == "Registry")
                                  where trim strips leading/trailing SPACES and TABS only
                                  (line has already had up to 3 leading spaces removed)
                                  declares nothing
  else line matches ^ {0,3}#[ \t] -> in_registry = 0, declares nothing
  state starts false.

Row-shaped for E12 (census): after removing up to 3 leading spaces,
  ^\\|[ \\t]*S[0-9]{3,}[ \\t]*\\|
Row-shaped for the gate (round-gate.mjs SOURCES_ROW_RE, unchanged):
  ^ {0,3}\\|\\s*S\\d{3,}\\s*\\|
"""
import os, re, subprocess, sys, json, hashlib

FLEET = "/home/vgpnk/Projects/shokunin"
LANES = sorted(d for d in os.listdir(FLEET) if d.endswith("-shokunin") and os.path.isdir(os.path.join(FLEET, d)))

CENSUS_ROW = re.compile(r"^\|[ \t]*S[0-9]{3,}[ \t]*\|")
GATE_ROW = re.compile(r"^ {0,3}\|\s*S\d{3,}\s*\|")
HEAD2 = re.compile(r"^ {0,3}##[ \t]")
HEAD1 = re.compile(r"^ {0,3}#[ \t]")
HEAD_ANY = re.compile(r"^ {0,3}(#{1,6})([ \t].*)?$")

def trim_sp_tab(s):
    return s.strip(" \t")

def split_lines(text):
    # census/gawk reads lines split on \n; a trailing \r stays inside the line.
    return text.split("\n")

def analyze(text):
    """Return dict with headings, per-section row counts, outside rows, flags."""
    lines = split_lines(text)
    in_registry = False
    headings = []          # (lineno, level, raw_heading_text)
    section = "(before any heading)"
    counts = {}            # section label -> row-shaped line count (census rule)
    outside = []           # (lineno, id) census-rule outside rows
    outside_gate_only = [] # outside under gate regex but not census regex
    fence = False
    fence_rows = []
    registry_heading_variants = []
    crlf = "\r\n" in text or text.endswith("\r")
    for i, raw in enumerate(lines, 1):
        line = raw
        if HEAD2.match(line):
            stripped = re.sub(r"^ {0,3}", "", line)
            txt = trim_sp_tab(stripped[3:])   # substr(line,3) in awk == chars from index 3 (1-based) => after "##"
            in_registry = (txt == "Registry")
            headings.append((i, 2, raw))
            section = (raw if txt != "Registry" else "## Registry")
            if txt != "Registry" and "Registry" in txt:
                registry_heading_variants.append((i, raw, "near-variant"))
            if txt == "Registry" and raw.rstrip("\r") != raw.rstrip("\r").rstrip():
                registry_heading_variants.append((i, raw, "trailing-cr"))
            if not fence:
                counts.setdefault(section, 0)
            continue
        if HEAD1.match(line):
            in_registry = False
            headings.append((i, 1, raw))
            section = raw
            counts.setdefault(section, 0)
            continue
        m = HEAD_ANY.match(line)
        if m:
            headings.append((i, len(m.group(1)), raw))
            if not fence:
                section = raw
                counts.setdefault(section, 0)
            continue
        # fence tracking (REPORT ONLY — the census does NOT track fences, so a
        # "## " line inside a ``` fence IS a census heading)
        if re.match(r"^ {0,3}(`{3,}|~{3,})", line):
            fence = not fence
            fence_rows.append((i, raw))
            continue
        if not re.match(r"^ {0,3}\|", line):
            continue
        body = re.sub(r"^ {0,3}", "", line)
        is_census = bool(CENSUS_ROW.match(body))
        is_gate = bool(GATE_ROW.match(line))
        if not is_census and not is_gate:
            continue
        if fence:
            fence_rows.append((i, raw + "  [row-shaped inside fence]"))
            # census counts it per its own (fence-blind) section state
        if in_registry:
            counts[section] = counts.get(section, 0) + 1
        else:
            if is_census:
                idc = trim_sp_tab(body.split("|")[1])
                outside.append((i, idc))
            else:
                idg = trim_sp_tab(body.split("|")[1])
                outside_gate_only.append((i, idg))
    return dict(headings=headings, counts=counts, outside=outside,
                outside_gate_only=outside_gate_only, fence_rows=fence_rows,
                variants=registry_heading_variants, crlf=crlf, in_fence_content=fence)

def census_validate(path, lane):
    """Run the real census on one file; return its E12/E01 lines."""
    p = subprocess.run(["/home/vgpnk/Projects/shokunin/scripts/sources-census.sh", "validate", "--file", path],
                       capture_output=True, text=True, timeout=120)
    e12 = [l for l in p.stdout.splitlines() if "\tE12\t" in l]
    e01 = [l for l in p.stdout.splitlines() if "\tE01\t" in l]
    return p.returncode, e12, e01, p.stdout, p.stderr

def main():
    out = {}
    print("== per-lane registry survey (census row_pass rule) ==")
    for lane in LANES:
        path = os.path.join(FLEET, lane, "corpus", "SOURCES.md")
        if not os.path.isfile(path):
            print(f"{lane}: NO corpus/SOURCES.md")
            continue
        data = open(path, "rb").read()
        text = data.decode("utf-8", "replace")
        a = analyze(text)
        rc, e12, e01, cout, cerr = census_validate(path, lane)
        sha = hashlib.sha256(data).hexdigest()
        print(f"\n## lane {lane}  file_sha256={sha[:16]} bytes={len(data)} crlf={a['crlf']} census_rc={rc}")
        print(f"  headings ({len(a['headings'])}):")
        for ln, lvl, raw in a["headings"]:
            mark = "  <== ## Registry" if re.match(r"^ {0,3}##[ \t]", raw) and trim_sp_tab(re.sub(r"^ {0,3}", "", raw)[3:]) == "Registry" else ""
            print(f"    {ln}: {'#'*lvl} {raw!r}{mark}")
        print(f"  row-shaped counts per section (census rule): {a['counts']}")
        print(f"  outside rows (my rule): {a['outside']}")
        print(f"  outside rows (gate regex only): {a['outside_gate_only']}")
        print(f"  census E12 lines: {e12}")
        print(f"  census E01 count: {len(e01)}")
        if a["variants"]: print(f"  Registry heading variants: {a['variants']}")
        if a["fence_rows"]: print(f"  row-shaped lines inside a fence: {a['fence_rows']}")
        if a["crlf"]: print("  ** file contains CRLF **")
        out[lane] = dict(sha256=sha, bytes=len(data), crlf=a["crlf"],
                          headings=[[l, lv, r] for l, lv, r in a["headings"]],
                          counts=a["counts"], outside=a["outside"],
                          outside_gate_only=a["outside_gate_only"],
                          census_e12=e12, census_e01_count=len(e01),
                          fence_rows=a["fence_rows"], variants=a["variants"])

    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "lane-survey.json"), "w") as f:
        json.dump(out, f, indent=1)
    tot_out = sum(len(v["outside"]) for v in out.values())
    print(f"\nTOTAL outside rows across {len(out)} lanes: {tot_out}")

main()
