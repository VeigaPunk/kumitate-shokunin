#!/usr/bin/env python3
"""Locate (read-only) init rows missing resolvedModel / with non-dict retryFallback,
and compare FIRST vs LAST session_init across all shokunin-lane transcripts."""
import json, os, sys, collections

ROOT = os.path.expanduser("~/.omp/agent/sessions")
LANE = "-Projects-shokunin"

def rows(path):
    out = []
    try:
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
                    out.append(o)
    except OSError:
        pass
    return out

def sig(r):
    rf = r.get("retryFallback")
    return (r.get("resolvedModel"),
            tuple(rf.get("chain")) if isinstance(rf, dict) and isinstance(rf.get("chain"), list) else None)

anomalies = []
diff_first_last = []
files = 0
initfiles = 0
ninit = collections.Counter()

base = os.path.join(ROOT, LANE)
for dirpath, dirnames, filenames in os.walk(base):
    for f in filenames:
        if not f.endswith(".jsonl"):
            continue
        p = os.path.join(dirpath, f)
        files += 1
        rs = rows(p)
        inits = [r for r in rs if r.get("type") == "session_init"]
        if not inits:
            continue
        initfiles += 1
        ninit[len(inits)] += 1
        for idx, r in enumerate(inits):
            rf = r.get("retryFallback")
            bad = (not isinstance(r.get("resolvedModel"), str)) or (not isinstance(rf, dict))
            if bad:
                anomalies.append((p, idx, len(inits), type(r.get("resolvedModel")).__name__, type(rf).__name__))
        if sig(inits[0]) != sig(inits[-1]):
            diff_first_last.append((p, len(inits)))

print("lane_files=%d files_with_init=%d" % (files, initfiles))
print("init_count_histogram=%s" % dict(sorted(ninit.items())))
print("anomalous_init_rows=%d" % len(anomalies))
for a in anomalies[:12]:
    print("  ANOM path=%s idx=%d of=%d resolvedModel_type=%s retryFallback_type=%s" % a)
print("first_vs_last_signature_diff_files=%d" % len(diff_first_last))
for d in diff_first_last[:12]:
    print("  DIFF path=%s n_init=%d" % d)
