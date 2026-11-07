#!/usr/bin/env python3
"""K97ScribeLesson — one example line per BASE departure from the census row_pass section rule.

Runs the lane BASE tool (git show 477afff7:scripts/sources-check.mjs) and the fleet census
(scripts/sources-census.sh validate --file) over a six-case fixture: a control plus one line for
each of BASE's four departures (CR split, literal-space heading regex, JS `\s` trim, bare-`#`
clear) and the heading-regex leading-space twin. Reports E12 ids and ROW_OUTSIDE_REGISTRY ids.
"""
import hashlib
import json
import os
import pathlib
import subprocess

S = "/fast/scratch/hyaku/kumitate-r97/K97ScribeLesson"
FX = os.path.join(S, "fx")
CENSUS = "/home/vgpnk/Projects/shokunin/scripts/sources-census.sh"
BASE = os.path.join(S, "base-sources-check.mjs")
TODAY = "2026-11-07"


def row(sid):
    return (f"| {sid} | https://example.test/{sid.lower()} | spec | A | scope | anchor | teaches "
            f"| mined | 2026-01-01 | on-release | corpus/knowledge/foo.md |")


CASES = [
    ("control (no departure)", "# Title", "## Registry", row("S010")),
    ("D2 literal-space heading regex", "# Title", "##\tRegistry", row("S011")),
    ("D1 CR split (\\r?\\n)", "# Title", "## Registry\r", row("S012")),
    ("D3 JS \\s trim (VT)", "# Title", "## Registry\v", row("S013")),
    ("D4 bare '#' clears", "# Title", "## Registry\n#", row("S014")),
    ("D2 twin: '##  Registry' keeps a leading space", "# Title", "##  Registry", row("S015")),
]

blocks = []
for _, ctx, heading, r in CASES:
    blocks.append("\n".join([ctx, heading, r]))
data = "\n".join(blocks) + "\n"
path = os.path.join(FX, "corpus", "SOURCES.md")
pathlib.Path(path).write_text(data, encoding="utf-8", newline="")

print("# K97ScribeLesson — BASE vs census on one example line per departure")
print(f"# base: git show 477afff790787cd2ce48ccf976afafcb5aef0cbc:scripts/sources-check.mjs "
      f"(sha256 {hashlib.sha256(open(BASE,'rb').read()).hexdigest()})")
print(f"# census: {CENSUS} (sha256 {hashlib.sha256(open(CENSUS,'rb').read()).hexdigest()})")
print(f"# fixture: {path} sha256 {hashlib.sha256(data.encode()).hexdigest()} today={TODAY}")
print("# fixture lines (1-based; \\r, \\v, \\t shown escaped):")
for i, line in enumerate(data.split("\n"), 1):
    print(f"#  {i:>2} {line.replace(chr(13), chr(92)+'r').replace(chr(11), chr(92)+'v').replace(chr(9), chr(92)+'t')}")

val = subprocess.run(["bash", CENSUS, "validate", "--file", path, "--today", TODAY],
                     capture_output=True, text=True)
print(f"\n## census validate rc={val.returncode}")
print(val.stdout.rstrip())

cen = subprocess.run(["bash", CENSUS, "census", "--file", path, "--today", TODAY],
                     capture_output=True, text=True)
print(f"\n## census census rc={cen.returncode} (rows line)")
for line in cen.stdout.splitlines():
    if "rows" in line or "file" in line:
        print(line)

base = subprocess.run(["node", BASE, "--self", FX, "--json", "--today", TODAY],
                      capture_output=True, text=True)
obj = json.loads(base.stdout)
outside = [(f["line"], f["detail"]) for f in obj["findings"] if f["kind"] == "ROW_OUTSIDE_REGISTRY"]
print(f"\n## BASE --json rc={base.returncode} verdict={obj['verdict']} counts.rows={obj['counts']['rows']}")
print("## BASE ROW_OUTSIDE_REGISTRY (line, detail):")
for item in outside:
    print("  ", item)

e12 = [ln.split("\t")[2].split()[0] for ln in val.stdout.splitlines() if "\tE12\t" in ln]
out_ids = [d.split("id=")[1].split(" ")[0] for _, d in outside]
print("\n## verdict per case")
for name, ctx, heading, r in CASES:
    sid = r.split("|")[1].strip()
    print(f"  {sid}  {name:52s} census={'E12' if sid in e12 else 'inside'} "
          f"base={'outside' if sid in out_ids else 'inside'}")
print(f"\nSUMMARY census_e12={e12} base_outside={out_ids}")
agree = [c[3].split("|")[1].strip() for c in CASES
         if (c[3].split("|")[1].strip() in e12) == (c[3].split("|")[1].strip() in out_ids)]
print(f"SUMMARY agree={len(agree)}/6 cases ({','.join(agree) or 'none'}); "
      f"divergent={6-len(agree)}/6")
