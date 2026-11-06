#!/usr/bin/env python3
"""x3 — critic construction: the counter's `!=` comparison is not type-strict, so the integer
counts `errors` / `aborted` / `parse_errors` may be emitted as JSON booleans (0==False, 1==True in
Python). The definition says "count"; a boolean is not a count. Reads HELD if the leniency is real.
Demonstration only, never shipped."""
import json, os, sys

PROBE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe"
sys.path.insert(0, PROBE)
import oracle92


def ab(rec):
    for k in ("errors", "aborted", "parse_errors"):
        v = rec.get(k)
        if isinstance(v, int) and v in (0, 1):
            rec[k] = bool(v)
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
        print(json.dumps(ab(oracle92.read_one(a["--file"])), sort_keys=True))
    else:
        out = []
        for r in oracle92.read_wave(a["--results"], a["--sessions-root"]):
            if r.get("session") is None:
                out.append(r)
            else:
                out.append(ab(r))
        print(json.dumps(out, sort_keys=True))


if __name__ == "__main__":
    main(sys.argv[1:])
