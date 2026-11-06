#!/usr/bin/env python3
"""K92Sentinel: inspect the only 4 corpus transcripts whose errorMessage rows carry a
credential-shaped span. Prints raw-vs-redacted SHAPE flags and a masked residual only."""
import json, os, re, subprocess, sys

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
ORACLE = LANE + "/.ufo/waves/round-92/probe/oracle92.py"
FILES = "/fast/scratch/hyaku/kumitate-r92/K92Sentinel/err-cred.files"

MARK = re.compile(
    r"AKIA[0-9A-Z]{12}|eyJ[A-Za-z0-9_-]{4}|Bearer [A-Za-z0-9._~+/-]{8}|ghp_[A-Za-z0-9]{10}|xoxb-"
    r"|-----BEGIN [A-Z ]*PRIVATE KEY|[?&](?:token|key|api_key|sig|secret)=[^\s&]{2,}"
    r"|[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}")


def mask(s):
    return re.sub(r"[A-Za-z0-9_./+=@-]{6,}", lambda m: "<%d/%s>" % (len(m.group(0)), "A" if m.group(0).isalnum() else "M"), s)


def main():
    for path in [l.strip() for l in open(FILES) if l.strip()]:
        rows = []
        with open(path, "rb") as fh:
            for raw in fh:
                line = raw.strip()
                if not line:
                    continue
                try:
                    o = json.loads(line)
                except Exception:
                    continue
                if isinstance(o, dict):
                    rows.append(o)
        hits = []
        for r in rows:
            if r.get("type") != "message":
                continue
            m = r.get("message")
            if not isinstance(m, dict) or m.get("role") != "assistant" or m.get("stopReason") != "error":
                continue
            em = m.get("errorMessage")
            if isinstance(em, str) and MARK.search(em):
                hits.append(em)
        rec = json.loads(subprocess.run(["python3", ORACLE, "--file", path, "--json"],
                                        capture_output=True, text=True, check=True).stdout)
        le = rec["last_error"]
        print(f"== {os.path.basename(path)} error_rows_with_shape={len(hits)} final={rec['final']}")
        for i, em in enumerate(hits):
            first = em.split("\n", 1)[0].strip()
            print(f"  raw[{i}] linelen={len(first)} shape={bool(MARK.search(first))} "
                  f"masked={mask(first)[:100]}")
        print(f"  last_error(len={len(le)}) residual_shape={bool(le and MARK.search(le))} "
              f"masked={mask(le) if le else le}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
