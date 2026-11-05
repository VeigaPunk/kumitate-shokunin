#!/usr/bin/env python3
"""index92.py — FROZEN population index for the round-92 counter.

Walks <sessions-root>/<cwd-dir>/<orchestrator-session>/<seat>.jsonl (depth exactly 2 below the
cwd dir), reads each with oracle92.read_one, and writes one TSV row per transcript:
  path <TAB> size <TAB> mtime <TAB> strata (comma list)
Strata (plan.md § Strata): fallback, dead, aborted, silent, errfix, multi, clean, redact,
parseerr, capnone, other.
  python3 index92.py --cwd-dir ~/.omp/agent/sessions/-Projects-shokunin --out index92.tsv
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import oracle92


def strata(r):
    s = []
    if r["fallback"]:
        s.append("fallback")
    if r["final"] in ("dead", "aborted", "silent", "other"):
        s.append(r["final"])
    if r["errors"] > 0 and not r["fallback"]:
        s.append("errfix")
    if len(r["answered"]) >= 2:
        s.append("multi")
    if r["errors"] == 0 and r["aborted"] == 0 and not r["fallback"] and r["final"] == "served":
        s.append("clean")
    if r["last_error"] and "<redacted>" in r["last_error"]:
        s.append("redact")
    if r["parse_errors"] > 0:
        s.append("parseerr")
    if r["captured"] is None:
        s.append("capnone")
    return s


def main(argv):
    cwd_dir = os.path.expanduser(argv[argv.index("--cwd-dir") + 1])
    out = argv[argv.index("--out") + 1]
    rows = []
    for orch in sorted(os.listdir(cwd_dir)):
        d = os.path.join(cwd_dir, orch)
        if not os.path.isdir(d):
            continue
        for name in sorted(os.listdir(d)):
            if not name.endswith(".jsonl"):
                continue
            p = os.path.join(d, name)
            try:
                st = os.stat(p)
                r = oracle92.read_one(p)
            except Exception as e:  # unreadable: recorded, never drawn
                rows.append((p, 0, 0, "unreadable"))
                continue
            rows.append((p, st.st_size, int(st.st_mtime), ",".join(strata(r)) or "none"))
    with open(out, "w") as fh:
        for p, size, mt, s in rows:
            fh.write("%s\t%d\t%d\t%s\n" % (p, size, mt, s))
    print("INDEX92: rows=%d out=%s" % (len(rows), out))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
