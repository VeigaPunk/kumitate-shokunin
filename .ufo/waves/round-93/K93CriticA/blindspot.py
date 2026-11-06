#!/usr/bin/env python3
"""blindspot.py — K93CriticA: for each single-defect alternative reading of a v2 field, count how
many scored records (A + current H draw + r91/r92 waves) would DISAGREE with the frozen definition.
A variant with 0 disagreeing records is a counter blind spot. Analysis only; imports the frozen
oracle to obtain the canonical records (never shipped)."""
import hashlib, json, os, sys

PROBE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/probe"
sys.path.insert(0, PROBE)
import oracle93

A = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe/sampleA.tsv"
WAVES = ["/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/w1-results.json",
         "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/w1-results.json"]
AFTER = "2026-11-06T18:47:06.000Z"


def raw(path):
    rows, bad = oracle93._rows(path)
    turns = [r["message"] for r in rows if r.get("type") == "message"
             and isinstance(r.get("message"), dict) and r["message"].get("role") == "assistant"]
    mcs = [r for r in rows if r.get("type") == "model_change"]
    sis = [r for r in rows if r.get("type") == "session_init"]
    return rows, turns, mcs, sis


def alts(path, orc):
    rows, turns, mcs, sis = raw(path)
    out = {}
    errs = [m for m in turns if m.get("stopReason") == "error"]
    served = [m for m in turns if m.get("stopReason") in oracle93.SERVED]
    # 1 superseded_by from the LAST error turn only
    last = []
    if errs:
        rr = errs[-1].get("retryRecovery")
        if isinstance(rr, dict) and isinstance(rr.get("supersededBy"), dict):
            oracle93._add(last, oracle93._pm(rr["supersededBy"]))
    out["superseded_last"] = (orc["superseded_by"], last)
    # 2 upstream not deduplicated
    up = [m["upstreamProvider"] for m in served if isinstance(m.get("upstreamProvider"), str) and m["upstreamProvider"]]
    out["upstream_nodedup"] = (orc["upstream"], up)
    # 3 chain from the LAST session_init
    chain = None
    for r in reversed(sis):
        rf = r.get("retryFallback")
        if isinstance(rf, dict) and isinstance(rf.get("chain"), list):
            chain = [c for c in rf["chain"] if isinstance(c, str)]
            break
    out["chain_last"] = (orc["chain"], chain)
    # 3b resolved from the LAST session_init
    res = None
    if sis:
        rm = sis[-1].get("resolvedModel")
        res = rm if isinstance(rm, str) else None
    out["resolved_last"] = (orc["resolved"], res)
    # 4 recovered counted on served turns too
    rec = sum(1 for m in turns if isinstance(m.get("retryRecovery"), dict)
              and m["retryRecovery"].get("status") == "recovered")
    out["recovered_served"] = (orc["recovered_attempts"], rec)
    # 5 error_attempts excluding superseded attempts
    ex = sum(1 for m in errs if not (isinstance(m.get("retryRecovery"), dict)
                                     and m["retryRecovery"].get("status") == "superseded"))
    out["err_excl_superseded"] = (orc["error_attempts"], ex)
    # 6 resolved stripped of :level
    rl = orc["resolved"]
    out["resolved_level"] = (rl, rl.split(":")[0] if isinstance(rl, str) else rl)
    # 7 superseded sorted instead of first-seen
    out["superseded_sorted"] = (orc["superseded_by"], sorted(orc["superseded_by"]))
    # 8 captured from the LAST matching model_change
    seat = os.path.basename(path)[:-6] if path.endswith(".jsonl") else os.path.basename(path)
    cap = None
    for r in mcs:
        if r.get("role") == "subagent:" + seat:
            cap = r.get("model") if isinstance(r.get("model"), str) else None
    if cap is None:
        for r in mcs:
            if r.get("role") in (None, "default"):
                cap = r.get("model") if isinstance(r.get("model"), str) else None
    out["captured_last"] = (orc["captured"], cap)
    # 9 superseded from served turns too
    sup = list(orc["superseded_by"])
    for m in served:
        rr = m.get("retryRecovery")
        if isinstance(rr, dict) and isinstance(rr.get("supersededBy"), dict):
            oracle93._add(sup, oracle93._pm(rr["supersededBy"]))
    out["superseded_served"] = (orc["superseded_by"], sup)
    # 10 upstream from every turn (control already exists, kept as reference)
    up2 = []
    for m in turns:
        v = m.get("upstreamProvider")
        if isinstance(v, str) and v:
            oracle93._add(up2, v)
    out["upstreamall"] = (orc["upstream"], up2)
    return out


def considered():
    items = [("A", l.rstrip("\n").split("\t")[1]) for l in open(A) if l.strip()]
    root = os.path.expanduser("~/.omp/agent/sessions")
    pool = []
    for dirpath, dirnames, filenames in os.walk(root):
        for fn in filenames:
            if fn.endswith(".jsonl"):
                p = os.path.join(dirpath, fn)
                ts = oracle93.first_ts(p)
                if ts and ts >= AFTER:
                    try:
                        if os.stat(p).st_mtime < __import__("time").time() - 900:
                            pool.append(p)
                    except OSError:
                        pass
    pool.sort(key=lambda p: hashlib.sha256(("r93-H\0" + p).encode()).hexdigest())
    items += [("H", p) for p in pool[:120]]
    for w in WAVES:
        d = json.load(open(w))
        items += [("W", r["session"]) for r in oracle93.read_wave(w, root)
                  if isinstance(r.get("session"), str)]
    return items


def main():
    items = considered()
    counts = {}
    for lab, p in items:
        try:
            orc = oracle93.read_one(p)
            alt = alts(p, orc)
        except OSError:
            continue
        for k, (want, got) in alt.items():
            counts.setdefault(k, [0, 0])
            counts[k][1] += 1
            if json.dumps(want, sort_keys=True) != json.dumps(got, sort_keys=True):
                counts[k][0] += 1
    print("records=%d" % len(items))
    for k in sorted(counts):
        print("%-22s differ=%d/%d" % (k, counts[k][0], counts[k][1]))


main()
