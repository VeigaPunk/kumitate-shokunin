#!/usr/bin/env python3
"""x2b — critic construction: redaction boundary is exercised by exactly one token in one visible
A transcript (a 32-char hex error id). This tool redacts runs of 23+ instead of the defined 24+;
on the single real instance the boundary is invisible, so the counter cannot see the off-by-one.
Demonstration only, never shipped."""
import json, os, re, sys

PROBE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe"
sys.path.insert(0, PROBE)
import oracle92

ALT = re.compile(r"[A-Za-z0-9_-]{23,}")


def read_one(path):
    rec = oracle92.read_one(path)
    le = rec.get("last_error")
    if isinstance(le, str):
        rec["last_error"] = ALT.sub("<redacted>", le)[:120]
    return rec


def main(argv):
    a = {"--sessions-root": os.path.expanduser("~/.omp/agent/sessions")}
    i = 0
    while i < len(argv):
        if argv[i] == "--json":
            i += 1
            continue
        a[argv[i]] = argv[i + 1]
        i += 2
    if "--file" in a:
        print(json.dumps(read_one(a["--file"]), sort_keys=True))
    else:
        out = []
        for r in oracle92.read_wave(a["--results"], a["--sessions-root"]):
            le = r.get("last_error")
            if isinstance(le, str):
                r["last_error"] = ALT.sub("<redacted>", le)[:120]
            out.append(r)
        print(json.dumps(out, sort_keys=True))


if __name__ == "__main__":
    main(sys.argv[1:])
