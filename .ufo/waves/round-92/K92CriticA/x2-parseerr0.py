#!/usr/bin/env python3
"""x2 — critic construction: the EIGHTH one-field ablation the frozen control table omits.
`parse_errors` is forced to 0 (nothing counts unparsable lines). If the population contains no
transcript with a parse error, this reads HELD, i.e. the counter cannot separate an implementation
of the `parse_errors` rule from its absence. Demonstration only, never shipped."""
import json, os, sys

PROBE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe"
sys.path.insert(0, PROBE)
import oracle92


def ab(rec):
    rec["parse_errors"] = 0
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
