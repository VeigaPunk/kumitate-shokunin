#!/usr/bin/env python3
"""Round-92 L1: redact fake secret-shaped fixture strings in K92Sentinel evidence before push
(GH013 push protection rejected d6bbe169). Records sha256 of each original; rewrites token bodies only."""
import hashlib, re, sys
PATS = [
 re.compile(r"AKIA[0-9A-Z]{16}"), re.compile(r"xox[bap]-[0-9A-Za-z-]{8,}"), re.compile(r"sk_live_[A-Za-z0-9]{6,}"),
 re.compile(r"eyJ[A-Za-z0-9_-]{4,}\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*"), re.compile(r"ghp_[A-Za-z0-9]{10,}"),
 re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
]
for p in sys.argv[1:]:
    b = open(p, encoding="utf-8").read()
    h = hashlib.sha256(b.encode()).hexdigest()
    n = 0
    for rx in PATS:
        b, k = rx.subn("<FAKE-REDACTED>", b); n += k
    open(p, "w", encoding="utf-8").write(b)
    print("%s original_sha256=%s replaced=%d" % (p, h, n))
