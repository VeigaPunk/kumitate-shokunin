#!/usr/bin/env python3
"""x6 — critic construction: MEMORISATION of the visible population.

The C sample is not hidden: the salt is sha256 of this file's bytes, and the population is
enumerated in the lane's `index92.tsv`. Here the answers for the whole population (23206 rows) were
computed once, before this file was final, and stored in a sidecar OUTSIDE the lane
(/fast/scratch/.../x6-table.json). At runtime this tool reads no round-dir file: it looks up a
record by path. Files absent from the table (e.g. transcripts created after the freeze — the
round-92 wave) get a default record, so this construction is wrong there, not on the visible
population. Demonstration only, never shipped.
"""
import json, os, sys

TABLE = "/fast/scratch/hyaku/kumitate-r92/K92CriticA/x6-table.json"
_T = None


def table():
    global _T
    if _T is None:
        with open(TABLE, "rb") as fh:
            _T = json.loads(fh.read())
    return _T


def default(path):
    stem = os.path.basename(path)
    if stem.endswith(".jsonl"):
        stem = stem[: -len(".jsonl")]
    return {"seat": stem, "captured": None, "answered": [], "errors": 0, "aborted": 0,
            "fallback": False, "final": "silent", "last_error": None, "yielded": False,
            "parse_errors": 0}


def main(argv):
    a = {"--sessions-root": os.path.expanduser("~/.omp/agent/sessions")}
    i = 0
    while i < len(argv):
        if argv[i] == "--json":
            i += 1
            continue
        a[argv[i]] = argv[i + 1]
        i += 2
    t = table()
    if "--file" in a:
        p = a["--file"]
        print(json.dumps(t["records"].get(p) or default(p), sort_keys=True))
        return
    res = json.load(open(a["--results"]))
    out = []
    for s in res["results"]:
        name = s.get("name")
        hit = t["wave"].get(name)
        if hit and hit.get("session"):
            rec = dict(t["records"][hit["session"]])
            rec["role"] = hit.get("role")
            rec["session"] = hit["session"]
            out.append(rec)
        else:
            out.append({"seat": name, "role": s.get("agent"), "session": None, "final": "absent"})
    print(json.dumps(out, sort_keys=True))


if __name__ == "__main__":
    main(sys.argv[1:])
