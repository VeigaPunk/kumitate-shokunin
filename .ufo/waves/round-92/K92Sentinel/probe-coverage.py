#!/usr/bin/env python3
"""K92Sentinel step 1e (COUNTER finding): is `parse_errors` reachable by the frozen probe?

Runs the FROZEN oracle over exactly the files the positive-control receipt scored (A from
sampleA.tsv, C from ctl-positive-oracle.txt C_ITEM lines, W from r91 w1) and reports how many
have parse_errors > 0. If zero, the counter cannot distinguish a tool that implements
parse_errors from one that hardcodes 0.
"""
import json, os, re, subprocess, sys

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
ORACLE = LANE + "/.ufo/waves/round-92/probe/oracle92.py"
SAMPLE = LANE + "/.ufo/waves/round-92/probe/sampleA.tsv"
RECEIPT = LANE + "/.ufo/waves/round-92/controls/ctl-positive-oracle.txt"
W1 = LANE + "/.ufo/waves/round-91/w1-results.json"


def oracle_file(p):
    return json.loads(subprocess.run(["python3", ORACLE, "--file", p, "--json"],
                                     capture_output=True, text=True, check=True).stdout)


def main():
    a = [l.split("\t")[1] for l in open(SAMPLE).read().splitlines() if l.strip()]
    c = [m.group(1) for m in re.finditer(r"^C_ITEM \S+ (.+)$", open(RECEIPT).read(), re.M)]
    w = json.loads(subprocess.run(["python3", ORACLE, "--results", W1, "--json"],
                                  capture_output=True, text=True, check=True).stdout)
    wf = [r["session"] for r in w if r.get("session")]
    for label, paths in (("A", a), ("C", c), ("W", wf)):
        dist = {}
        pe = 0
        for p in paths:
            try:
                n = oracle_file(p)["parse_errors"]
            except Exception as e:
                print(f"SKIP {label} {p} {e}")
                continue
            dist[n] = dist.get(n, 0) + 1
            pe += 1 if n else 0
        print(f"{label} n={len(paths)} with_parse_errors_gt0={pe} dist={sorted(dist.items())}")
    # also: stratum histogram of sampleA and of the probe QUOTA vs the frozen index
    idx = [l.rstrip("\n").split("\t") for l in open(LANE + "/.ufo/waves/round-92/probe/index92.tsv") if l.strip()]
    hist = {}
    for _p, _s, _m, st in idx:
        for s in st.split(","):
            hist[s] = hist.get(s, 0) + 1
    print("INDEX_HIST=" + " ".join("%s:%d" % kv for kv in sorted(hist.items())))
    print("QUOTA=fallback:12 dead:6 aborted:6 silent:4 errfix:8 multi:8 clean:12 redact:4 parseerr:2 capnone:4")
    sa = {}
    for line in open(SAMPLE):
        if line.strip():
            s = line.split("\t")[0]
            sa[s] = sa.get(s, 0) + 1
    print("SAMPLEA_HIST=" + " ".join("%s:%d" % kv for kv in sorted(sa.items())))
    return 0


if __name__ == "__main__":
    sys.exit(main())
