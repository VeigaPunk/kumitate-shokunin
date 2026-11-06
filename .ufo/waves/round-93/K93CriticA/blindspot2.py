#!/usr/bin/env python3
"""blindspot2.py — K93CriticA: per-set breakdown of the alternative-reading disagreement counts, plus
population counts that bound how many discriminating members exist for a first/last ambiguity."""
import hashlib, json, os, sys, time

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
    seat = os.path.basename(path)[:-6] if path.endswith(".jsonl") else os.path.basename(path)

    last = []
    if errs:
        rr = errs[-1].get("retryRecovery")
        if isinstance(rr, dict) and isinstance(rr.get("supersededBy"), dict):
            oracle93._add(last, oracle93._pm(rr["supersededBy"]))
    out["superseded_last"] = (orc["superseded_by"], last)

    up = [m["upstreamProvider"] for m in served if isinstance(m.get("upstreamProvider"), str) and m["upstreamProvider"]]
    out["upstream_nodedup"] = (orc["upstream"], up)

    chain = None
    for r in reversed(sis):
        rf = r.get("retryFallback")
        if isinstance(rf, dict) and isinstance(rf.get("chain"), list):
            chain = [c for c in rf["chain"] if isinstance(c, str)]
            break
    out["chain_last"] = (orc["chain"], chain)

    ex = sum(1 for m in errs if not (isinstance(m.get("retryRecovery"), dict)
                                     and m["retryRecovery"].get("status") == "superseded"))
    out["err_excl_superseded"] = (orc["error_attempts"], ex)

    # first error turn instead of last
    first_err = oracle93._head(errs[0].get("errorMessage")) if errs else None
    out["last_error_first"] = (orc["last_error"], first_err)

    # answered also counts models of error turns
    ans = list(orc["answered"])
    for m in turns:
        if m.get("stopReason") not in oracle93.SERVED:
            oracle93._add(ans, oracle93._pm(m))
    out["answered_incl_error"] = (orc["answered"], ans)

    out["superseded_sorted"] = (orc["superseded_by"], sorted(orc["superseded_by"]))

    sup_p = []
    for m in errs:
        rr = m.get("retryRecovery")
        if isinstance(rr, dict) and isinstance(rr.get("supersededBy"), dict):
            p = rr["supersededBy"].get("provider")
            if isinstance(p, str) and p:
                oracle93._add(sup_p, p)
    out["superseded_provider_only"] = (orc["superseded_by"], sup_p)

    cap = None
    for r in mcs:
        if r.get("role") == "subagent:" + seat:
            cap = r.get("model") if isinstance(r.get("model"), str) else None
    if cap is None:
        for r in mcs:
            if r.get("role") in (None, "default"):
                cap = r.get("model") if isinstance(r.get("model"), str) else None
    out["captured_last"] = (orc["captured"], cap)

    # population facts
    out["_n_multi_superseded"] = (len(orc["superseded_by"]) > 1, True)
    out["_n_superseded_status"] = (sum(1 for m in errs if isinstance(m.get("retryRecovery"), dict)
                                       and m["retryRecovery"].get("status") == "superseded") > 0, True)
    out["_n_multi_si"] = (len(sis) > 1, True)
    out["_n_multi_err"] = (len(errs) > 1, True)
    out["_n_multi_err_diffmsg"] = (len({oracle93._head(m.get("errorMessage")) for m in errs}) > 1, True)
    out["_n_multi_subagent_mc"] = (sum(1 for r in mcs if r.get("role") == "subagent:" + seat) > 1, True)
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
                        if os.stat(p).st_mtime < time.time() - 900:
                            pool.append(p)
                    except OSError:
                        pass
    pool.sort(key=lambda p: hashlib.sha256(("r93-H\0" + p).encode()).hexdigest())
    items += [("H", p) for p in pool[:120]]
    for w in WAVES:
        items += [("W", r["session"]) for r in oracle93.read_wave(w, root) if isinstance(r.get("session"), str)]
    return items


def main():
    items = considered()
    per = {}
    pops = {}
    for lab, p in items:
        try:
            orc = oracle93.read_one(p)
            alt = alts(p, orc)
        except OSError:
            continue
        pops.setdefault(lab, 0)
        pops[lab] += 1
        for k, (want, got) in alt.items():
            d = json.dumps(want, sort_keys=True) != json.dumps(got, sort_keys=True)
            row = per.setdefault(k, {"A": 0, "H": 0, "W": 0})
            if d:
                row[lab] += 1
    print("sets", pops)
    for k in sorted(per):
        print("%-24s A=%d H=%d W=%d" % (k, per[k]["A"], per[k]["H"], per[k]["W"]))


main()
