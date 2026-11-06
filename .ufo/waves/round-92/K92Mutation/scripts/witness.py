#!/usr/bin/env python3
"""Stratum / witness analysis for surviving oracle mutants (read-only on host sessions)."""
import collections, json, os, re, sys

IDX = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe/index92.tsv"
A = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe/sampleA.tsv"
C = [l.split("C_ITEM ",1)[1].split(None,1)[1].strip() for l in open("/fast/scratch/hyaku/kumitate-r92/K92Mutation/receipts-py/m01.txt")
     if l.startswith("C_ITEM ")]

idx = [l.rstrip("\n").split("\t") for l in open(IDX)]
print("index rows", len(idx))
by_name = collections.defaultdict(list)
for p, size, mt, st in idx:
    by_name[os.path.basename(p)].append((p, st))
dups = {k: v for k, v in by_name.items() if len(v) > 1}
print("duplicate basenames", len(dups))
for k, v in list(dups.items())[:10]:
    print("  ", k, [s for _, s in v])
# redact stratum
red = [(p, st) for p, size, mt, st in idx if "redact" in st]
print("redact stratum", red)

def rows(p):
    out, bad = [], 0
    for raw in open(p, "rb"):
        line = raw.strip()
        if not line:
            continue
        try:
            o = json.loads(line)
        except Exception:
            bad += 1
            continue
        if isinstance(o, dict):
            out.append(o)
        else:
            bad += 1
    return out, bad

# scan the scored corpus (A + C) for mutant witnesses
files = [l.rstrip("\n").split("\t")[1] for l in open(A) if l.strip()] + C
print("scanning", len(files), "scored transcripts")
len_runs, missing_pm, nonobj, mc_roles, longest = [], [], [], collections.Counter(), []
for p in files:
    rs, bad = rows(p)
    if bad:
        nonobj.append(p)
    mc = [r for r in rs if r.get("type") == "model_change"]
    if mc:
        mc_roles[json.dumps(mc[0].get("role"))] += 1
    for r in rs:
        m = r.get("message")
        if r.get("type") != "message" or not isinstance(m, dict) or m.get("role") != "assistant":
            continue
        pv, md = m.get("provider"), m.get("model")
        if not (isinstance(pv, str) and pv and isinstance(md, str) and md):
            missing_pm.append((p, pv, md))
        em = m.get("errorMessage")
        if isinstance(em, str) and em:
            for run in re.findall(r"[A-Za-z0-9_-]+", em.split("\n", 1)[0].strip()):
                if len(run) >= 20:
                    len_runs.append((len(run), p))
                    longest.append((len(run), run[:8] + "...", p))
    # first model_change role vs subagent role
    if len(mc) > 1 and mc[0].get("role") is not None and str(mc[0].get("role")).startswith("subagent:"):
        pass
print("transcripts with non-object parse lines:", len(nonobj), nonobj[:5])
print("turns with missing/empty provider or model:", len(missing_pm), missing_pm[:5])
print("first model_change roles:", dict(mc_roles))
lens = collections.Counter(n for n, _ in len_runs)
print("long [A-Za-z0-9_-] runs (>=20) in errorMessage first lines:", sorted(lens.items()))
print("runs of exactly 24:", [p for n, p in len_runs if n == 24][:5])
print("max run lengths:", sorted(longest, reverse=True)[:5])
