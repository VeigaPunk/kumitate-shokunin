#!/usr/bin/env python3
"""K96Scout — kumitate corpus/SOURCES.md history: outside row-shaped lines per revision.

Read-only: `git -C <lane> show <rev>:corpus/SOURCES.md` only (no mutating git).
Census rule as in scripts/sources-census.sh row_pass (gawk).
"""
import re, subprocess, json, os, hashlib

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
CENSUS_ROW = re.compile(r"^\|[ \t]*S[0-9]{3,}[ \t]*\|")
GATE_ROW = re.compile(r"^ {0,3}\|\s*S\d{3,}\s*\|")
HEAD2 = re.compile(r"^ {0,3}##[ \t]")
HEAD1 = re.compile(r"^ {0,3}#[ \t]")

def trim_sp_tab(s):
    return s.strip(" \t")

def analyze(text):
    in_registry = False
    outside = []
    inside = 0
    for i, raw in enumerate(text.split("\n"), 1):
        if HEAD2.match(raw):
            stripped = re.sub(r"^ {0,3}", "", raw)
            in_registry = (trim_sp_tab(stripped[3:]) == "Registry")
            continue
        if HEAD1.match(raw):
            in_registry = False
            continue
        if not re.match(r"^ {0,3}\|", raw):
            continue
        body = re.sub(r"^ {0,3}", "", raw)
        if not CENSUS_ROW.match(body) and not GATE_ROW.match(raw):
            continue
        if in_registry:
            inside += 1
        else:
            idc = trim_sp_tab(body.split("|")[1])
            outside.append((i, idc))
    return inside, outside

def main():
    revs = subprocess.run(["git", "-C", LANE, "log", "--format=%H", "--", "corpus/SOURCES.md"],
                          capture_output=True, text=True, check=True).stdout.split()
    print(f"# kumitate corpus/SOURCES.md revisions: {len(revs)}")
    rows = []
    for rev in revs:
        blob = subprocess.run(["git", "-C", LANE, "show", f"{rev}:corpus/SOURCES.md"],
                               capture_output=True, check=True).stdout
        text = blob.decode("utf-8", "replace")
        inside, outside = analyze(text)
        date = subprocess.run(["git", "-C", LANE, "log", "-1", "--format=%ad", "--date=short", rev],
                              capture_output=True, text=True).stdout.strip()
        subj = subprocess.run(["git", "-C", LANE, "log", "-1", "--format=%s", rev],
                              capture_output=True, text=True).stdout.strip()
        crlf = b"\r\n" in blob
        rows.append(dict(rev=rev, date=date, subject=subj, inside=inside,
                         outside=outside, n_outside=len(outside), crlf=crlf,
                         sha=hashlib.sha256(blob).hexdigest()))
    # newest-first order (git log default)
    print("\nrev | date | inside | outside_n | outside_ids | crlf")
    for r in rows:
        ids = ",".join(x[1] for x in r["outside"]) or "-"
        print(f"{r['rev'][:12]} | {r['date']} | {r['inside']:4d} | {r['n_outside']:4d} | {ids} | {r['crlf']}")
    hits = [r for r in rows if r["n_outside"] > 0]
    print(f"\nrevisions with >=1 outside row: {len(hits)} / {len(rows)}")
    for r in hits:
        print(f"  {r['rev'][:12]} {r['date']} outside={r['n_outside']} ids={[x[1] for x in r['outside']]}")
    if hits:
        print(f"NEWEST with outside: {hits[0]['rev']} ({hits[0]['date']})")
        print(f"OLDEST with outside: {hits[-1]['rev']} ({hits[-1]['date']})")
    else:
        print("no revision has an outside row-shaped line")
    # dedupe ids across revisions
    allids = {}
    for r in rows:
        for _, i in r["outside"]:
            allids.setdefault(i, []).append(r["rev"][:12])
    print(f"\noutside ids ever seen: {json.dumps(allids)}")
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kumitate-history.json")
    with open(out, "w") as f:
        json.dump(rows, f, indent=1)
    print(f"\nwritten {out}")

main()
