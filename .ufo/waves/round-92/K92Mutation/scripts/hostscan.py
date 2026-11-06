#!/usr/bin/env python3
"""Host-wide (index92) scan: does ANY indexed transcript discriminate survivors m01/m04/m06/m12/m13?
Output: counts + first hitting paths + their strata."""
import collections, json, re, sys

IDX = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe/index92.tsv"
REDACT = re.compile(r"[A-Za-z0-9_-]{24,}")
RUN = re.compile(r"[A-Za-z0-9_-]+")
hits = collections.defaultdict(list)
stats = collections.Counter()
n = 0
for line in open(IDX):
    p, size, mt, st = line.rstrip("\n").split("\t")
    n += 1
    rows, bad = [], 0
    try:
        fh = open(p, "rb")
    except OSError:
        stats["unreadable"] += 1
        continue
    with fh:
        for raw in fh:
            s = raw.strip()
            if not s:
                continue
            try:
                o = json.loads(s)
            except Exception:
                bad += 1
                continue
            if isinstance(o, dict):
                rows.append(o)
            else:
                bad += 1
    if bad:
        hits["m13:nonobject"].append((p, st, bad))
    mc = [r for r in rows if r.get("type") == "model_change"]
    if mc and mc[0].get("role") not in (None, "default"):
        hits["m06:first-role"].append((p, st, json.dumps(mc[0].get("role"))))
    for r in rows:
        m = r.get("message")
        if r.get("type") != "message" or not isinstance(m, dict) or m.get("role") != "assistant":
            continue
        pv, md = m.get("provider"), m.get("model")
        if not (isinstance(pv, str) and pv and isinstance(md, str) and md):
            hits["m12:pm-guard"].append((p, st, json.dumps([pv, md])))
            break
        if m.get("stopReason") == "length":
            hits["m04:length"].append((p, st, "length"))
            break
        em = m.get("errorMessage")
        if isinstance(em, str) and em:
            first = em.split("\n", 1)[0].strip()
            lens = {len(x) for x in RUN.findall(first)}
            if 24 in lens:
                hits["m01:run24"].append((p, st, "24"))
print("scanned", n)
for k in sorted(hits):
    v = hits[k]
    print("%-18s files=%d  examples=%s" % (k, len(v), [(x[0].rsplit('/', 2)[-2:], x[1]) for x in v[:3]]))
print("strata of length hits:", collections.Counter(s for _, s, _ in hits["m04:length"]))
