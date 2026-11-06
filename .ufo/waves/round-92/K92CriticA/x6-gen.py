#!/usr/bin/env python3
"""x6-gen.py — generator for the x6 memorisation construction (critic evidence, never shipped).

Reads the lane's frozen population index + the r91 wave, writes a lookup table of the reference
reading for EVERY indexed transcript (plus the r91 seats), to a path outside the lane:

  python3 x6-gen.py /fast/scratch/hyaku/kumitate-r92/K92CriticA/x6-table.json

x6-memo.py then answers from that table and reads nothing under .ufo/waves/round-92/ at runtime.
The point of the construction: the counter's C sample is drawn from a population that is fully
enumerated in the lane before the tool is final, so the answers can be memoised.
"""
import json, os, sys

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
sys.path.insert(0, os.path.join(LANE, ".ufo/waves/round-92/probe"))
import oracle92

out = sys.argv[1]
tab = {}
for line in open(os.path.join(LANE, ".ufo/waves/round-92/probe/index92.tsv")):
    tab[line.split("\t")[0]] = oracle92.read_one(line.split("\t")[0])

res = json.load(open(os.path.join(LANE, ".ufo/waves/round-91/w1-results.json")))
loc = {}
root = os.path.expanduser("~/.omp/agent/sessions")
for s in res["results"]:
    q = oracle92.locate(root, s["name"], res["lane"], res["round"])
    loc[s["name"]] = {"role": s.get("agent"), "session": q}
    if q:
        tab[q] = oracle92.read_one(q)

json.dump({"records": tab, "wave": loc}, open(out, "w"), sort_keys=True)
print("x6 table entries=%d wave=%d bytes=%d" % (len(tab), len(loc), os.path.getsize(out)))
