#!/usr/bin/env python3
"""K93CriticB / how often does omp persist `errorMessage: null` (or no errorMessage) on an error turn?

The candidate's only real-corpus defect requires an error turn whose `errorMessage` is JSON null.
Scan the 61 A files, the 120 H files the builder scored, the files touched in the last 8 h, and a
random 600-transcript sample of the whole sessions root. Read-only.
"""
import json, os, random, sys

SROOT = os.path.expanduser("~/.omp/agent/sessions")
LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
OUT = os.path.join(LANE, ".ufo/waves/round-93/K93CriticB/errmsg_census.receipt.txt")


def scan(paths, label):
    err = nulls = missing = nonstr = 0
    ex = []
    for p in paths:
        try:
            fh = open(p, "rb")
        except OSError:
            continue
        with fh:
            for raw in fh:
                s = raw.strip()
                if not s:
                    continue
                try:
                    o = json.loads(s)
                except Exception:
                    continue
                if not isinstance(o, dict) or o.get("type") != "message":
                    continue
                m = o.get("message")
                if not isinstance(m, dict) or m.get("role") != "assistant":
                    continue
                if m.get("stopReason") != "error":
                    continue
                err += 1
                if "errorMessage" not in m:
                    missing += 1
                    if len(ex) < 3:
                        ex.append((p, "missing"))
                elif m["errorMessage"] is None:
                    nulls += 1
                    if len(ex) < 3:
                        ex.append((p, "null"))
                elif not isinstance(m["errorMessage"], str):
                    nonstr += 1
                    if len(ex) < 3:
                        ex.append((p, type(m["errorMessage"]).__name__))
    return "%s files=%d error_turns=%d errorMessage_null=%d missing=%d nonstr=%d ex=%s" % (
        label, len(paths), err, nulls, missing, nonstr, ex)


def main():
    a = [l.rstrip("\n").split("\t")[1] for l in open(os.path.join(LANE, ".ufo/waves/round-92/probe/sampleA.tsv")) if l.strip()]
    h = [l.split(" ", 1)[1].strip() for l in open(os.path.join(LANE, ".ufo/waves/round-93/K93ExecTool/score1-clean.txt")) if l.startswith("H_ITEM")]
    import time
    horizon = time.time() - 8 * 3600
    allp = []
    for dp, dn, fn in os.walk(SROOT):
        for f in fn:
            if f.endswith(".jsonl"):
                p = os.path.join(dp, f)
                try:
                    if os.stat(p).st_mtime >= horizon:
                        allp.append(p)
                except OSError:
                    pass
    rnd = random.Random(93)
    universe = []
    for dp, dn, fn in os.walk(SROOT):
        for f in fn:
            if f.endswith(".jsonl"):
                universe.append(os.path.join(dp, f))
    sample = rnd.sample(universe, min(600, len(universe)))
    lines = [scan(a, "A61"), scan(h, "H120_builder"), scan(allp, "touched8h"), scan(sample, "random600")]
    with open(OUT, "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
