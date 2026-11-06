#!/usr/bin/env python3
"""K92Sentinel COUNTER probe (not a candidate, never shipped): every frozen field implemented
EXCEPT `parse_errors`, which is hardcoded to 0. If the frozen counter reads HELD, then the
predicate cannot detect a tool that ignores parse errors.
"""
import json, os, sys

sys.path.insert(0, "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe")
import oracle92


def one(p):
    r = oracle92.read_one(p)
    r["parse_errors"] = 0
    return r


def main(argv):
    a = {"--sessions-root": os.path.expanduser("~/.omp/agent/sessions")}
    i = 0
    while i < len(argv):
        if argv[i] in ("--file", "--results", "--sessions-root"):
            a[argv[i]] = argv[i + 1]
            i += 2
        else:
            i += 1
    if "--file" in a:
        print(json.dumps(one(a["--file"]), sort_keys=True))
    elif "--results" in a:
        out = oracle92.read_wave(a["--results"], a["--sessions-root"])
        for r in out:
            r["parse_errors"] = 0
        print(json.dumps(out, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
