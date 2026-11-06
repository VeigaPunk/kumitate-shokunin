#!/usr/bin/env python3
"""K92Sentinel step 1d: real-data residual scan over index92 strata redact + errfix.

For each sampled real transcript: run the FROZEN oracle, then look for credential SHAPES that
survive its 24-char redaction in last_error. Prints masked residuals only.
"""
import json, os, random, re, subprocess, sys

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
ORACLE = LANE + "/.ufo/waves/round-92/probe/oracle92.py"
INDEX = LANE + "/.ufo/waves/round-92/probe/index92.tsv"
N = int(sys.argv[1]) if len(sys.argv) > 1 else 60

DET = [
    ("aws-access-key-id", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{12,20}\b")),
    ("jwt", re.compile(r"\beyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}")),
    ("bearer", re.compile(r"(?i)\bbearer\s+[A-Za-z0-9._~+/=-]{8,}")),
    ("email", re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}")),
    ("url-query-cred", re.compile(r"[?&](?:token|key|api_key|sig|signature|secret|auth)=[^\s&\"']{2,}", re.I)),
    ("pem", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY")),
    ("scheme-cred", re.compile(r"[A-Za-z][A-Za-z0-9+.-]*://[^\s/\"']+:[^\s/@\"']+@")),
    ("labeled-secret", re.compile(r"(?i)\b(?:api[_-]?key|secret|token|password|passwd)\b\s*[:=]\s*[\"']?[^\s\"',;]{6,}")),
    ("gh-token", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{10,}\b")),
    ("base64-plus-slash", re.compile(r"[A-Za-z0-9+/]{12,}[+/][A-Za-z0-9+/]{0,}={0,2}")),
]


def mask(s):
    return re.sub(r"[A-Za-z0-9_./+=@:-]{6,}",
                  lambda m: "<%d/%s>" % (len(m.group(0)), "A" if m.group(0).isalnum() else "M"), s)


def main():
    rows = [l.rstrip("\n").split("\t") for l in open(INDEX) if l.strip()]
    strata = {}
    for p, _sz, _mt, st in rows:
        for s in st.split(","):
            strata.setdefault(s, []).append(p)
    print("INDEX_STRATA=" + " ".join("%s:%d" % (k, len(v)) for k, v in sorted(strata.items())))
    pick = []
    for s in ("redact", "errfix"):
        cand = strata.get(s, [])
        random.Random(92).shuffle(cand)
        pick += [(s, p) for p in cand[:N]]
    hits = 0
    errs = 0
    for s, p in pick:
        try:
            rec = json.loads(subprocess.run(["python3", ORACLE, "--file", p, "--json"],
                                            capture_output=True, text=True, check=True).stdout)
        except Exception as e:
            print(f"SKIP {s} {p} {e}")
            continue
        le = rec.get("last_error")
        if le is None:
            continue
        errs += 1
        found = [(n, rx.search(le)) for n, rx in DET]
        found = [(n, m) for n, m in found if m]
        if found:
            hits += 1
            print(f"HIT {s} {os.path.basename(p)} classes={','.join(n for n, _ in found)} "
                  f"masked={mask(le)}")
    print(f"SCANNED={len(pick)} WITH_ERROR={errs} RESIDUAL_HITS={hits}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
