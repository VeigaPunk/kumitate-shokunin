#!/usr/bin/env python3
"""Locate-multiplicity, stopReason=length, and marker distribution checks (read-only)."""
import collections, json, os, re, sys

IDX = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe/index92.tsv"
idx = [l.rstrip("\n").split("\t") for l in open(IDX)]
print("index rows", len(idx))
mk = collections.Counter()
for p, *_ in idx:
    try:
        d = open(p, "rb").read()
    except OSError:
        mk["unreadable"] += 1
        continue
    r = re.search(rb"/\.ufo/waves/round-(\d+)/", d)
    mk["round-" + (r.group(1).decode() if r else "none")] += 1
print("round markers:", dict(sorted(mk.items())))
lane = collections.Counter()
for p, *_ in idx:
    d = open(p, "rb").read()
    m = re.search(rb"([A-Za-z0-9_.-]+)-shokunin", d)
    lane[m.group(1).decode() if m else "none"] += 1
print("lane markers:", dict(sorted(lane.items())))

# duplicate basenames: how many locate hits per (name, round, lane) under default lane kumitate
by = collections.defaultdict(list)
for p, *_ in idx:
    by[os.path.basename(p)].append(p)
multi = {k: v for k, v in by.items() if len(v) > 1}
print("names with >1 file:", len(multi))
def first_ts(p):
    for raw in open(p, "rb"):
        try:
            o = json.loads(raw)
        except Exception:
            continue
        if isinstance(o, dict) and o.get("type") == "session":
            return str(o.get("timestamp") or "")
    return ""
hits = collections.Counter()
same = []
for name, ps in multi.items():
    for p in ps:
        d = open(p, "rb").read()
        m = re.search(rb"/\.ufo/waves/round-(\d+)/", d)
        if not m or b"kumitate-shokunin" not in d:
            continue
        hits[(name, m.group(1).decode())] += 1
for k, n in hits.items():
    if n > 1:
        same.append((k, n))
print("seat names with >1 kumitate hit in SAME round:", len(same))
for k, n in same[:15]:
    print("   ", k, n)
ex = [k for k, n in hits.items() if n > 1]
if ex:
    name, rnd = ex[0]
    ps = [p for p in by[name] if ("/.ufo/waves/round-%s/" % rnd).encode() in open(p, "rb").read()]
    for p in ps:
        print("   HIT", first_ts(p), p)
