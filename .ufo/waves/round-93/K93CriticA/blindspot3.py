#!/usr/bin/env python3
"""blindspot3.py — K93CriticA: per-set (A, F, H-current, W) disagreement counts for alternative
readings, including ones the 12 pre-data controls do not cover. Analysis only."""
import hashlib, json, os, sys, time

PROBE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/probe"
sys.path.insert(0, PROBE)
import oracle93

A = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe/sampleA.tsv"
FIX = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/probe/fixtures"
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
    seat = os.path.basename(path)[:-6] if path.endswith(".jsonl") else os.path.basename(path)
    errs = [m for m in turns if m.get("stopReason") == "error"]
    served = [m for m in turns if m.get("stopReason") in oracle93.SERVED]
    out = {}

    # captured: keep scanning past a non-string subagent model instead of stopping (null)
    cap = None
    found = False
    for r in mcs:
        if r.get("role") == "subagent:" + seat and isinstance(r.get("model"), str):
            cap = r["model"]
            found = True
            break
    if not found:
        for r in mcs:
            if r.get("role") in (None, "default") and isinstance(r.get("model"), str):
                cap = r["model"]
                break
    out["captured_skip_nonstring"] = (orc["captured"], cap)

    # captured from the LAST matching row
    cap2 = None
    for r in mcs:
        if r.get("role") == "subagent:" + seat:
            cap2 = r.get("model") if isinstance(r.get("model"), str) else None
    if cap2 is None:
        for r in mcs:
            if r.get("role") in (None, "default"):
                cap2 = r.get("model") if isinstance(r.get("model"), str) else None
    out["captured_last"] = (orc["captured"], cap2)

    # resolved: "" stays "" instead of reading as null? (definition: string stays string)
    # alternative: empty resolvedModel -> null
    res = orc["resolved"]
    out["resolved_empty_null"] = (res, None if res == "" else res)

    # answered: sorted distinct instead of first-seen
    out["answered_sorted"] = (orc["answered"], sorted(set(orc["answered"])))

    # upstream: sorted distinct instead of first-seen
    out["upstream_sorted"] = (orc["upstream"], sorted(set(orc["upstream"])))

    # superseded: reversed first-seen order
    out["superseded_reversed"] = (orc["superseded_by"], list(reversed(orc["superseded_by"])))

    # chain: last session_init
    chain = None
    for r in reversed(sis):
        rf = r.get("retryFallback")
        if isinstance(rf, dict) and isinstance(rf.get("chain"), list):
            chain = [c for c in rf["chain"] if isinstance(c, str)]
            break
    out["chain_last"] = (orc["chain"], chain)

    # resolved: last session_init
    res2 = None
    if sis:
        rm = sis[-1].get("resolvedModel")
        res2 = rm if isinstance(rm, str) else None
    out["resolved_last"] = (orc["resolved"], res2)

    # error_attempts excludes superseded attempts
    ex = sum(1 for m in errs if not (isinstance(m.get("retryRecovery"), dict)
                                     and m["retryRecovery"].get("status") == "superseded"))
    out["err_excl_superseded"] = (orc["error_attempts"], ex)

    # recovered on all turns (served included)
    rec = sum(1 for m in turns if isinstance(m.get("retryRecovery"), dict)
              and m["retryRecovery"].get("status") == "recovered")
    out["recovered_all_turns"] = (orc["recovered_attempts"], rec)

    # superseded from last error turn only
    last = []
    if errs:
        rr = errs[-1].get("retryRecovery")
        if isinstance(rr, dict) and isinstance(rr.get("supersededBy"), dict):
            last = [oracle93._pm(rr["supersededBy"])]
    out["superseded_last"] = (orc["superseded_by"], last)

    # superseded from served turns too
    sup = list(orc["superseded_by"])
    for m in served:
        rr = m.get("retryRecovery")
        if isinstance(rr, dict) and isinstance(rr.get("supersededBy"), dict):
            oracle93._add(sup, oracle93._pm(rr["supersededBy"]))
    out["superseded_served"] = (orc["superseded_by"], sup)

    # upstream not deduplicated
    up = [m["upstreamProvider"] for m in served if isinstance(m.get("upstreamProvider"), str) and m["upstreamProvider"]]
    out["upstream_nodedup"] = (orc["upstream"], up)

    # last_error from the first error turn
    out["last_error_first"] = (orc["last_error"], oracle93._head(errs[0].get("errorMessage")) if errs else None)

    # answered also counts error-turn models
    ans = list(orc["answered"])
    for m in turns:
        if m.get("stopReason") not in oracle93.SERVED:
            oracle93._add(ans, oracle93._pm(m))
    out["answered_incl_error"] = (orc["answered"], ans)

    # flag_hops restricted to role=fallback rows
    fh = sum(1 for r in mcs if r.get("resolvedModelIsFallback") is True and r.get("role") == "fallback")
    out["flag_hops_fallback_role"] = (orc["flag_hops"], fh)
    return out


def considered():
    items = [("A", l.rstrip("\n").split("\t")[1]) for l in open(A) if l.strip()]
    items += [("F", os.path.join(FIX, f)) for f in sorted(os.listdir(FIX)) if f.endswith(".jsonl")]
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
    for lab, p in items:
        try:
            orc = oracle93.read_one(p)
            alt = alts(p, orc)
        except OSError:
            continue
        for k, (want, got) in alt.items():
            row = per.setdefault(k, {"A": 0, "F": 0, "H": 0, "W": 0})
            if json.dumps(want, sort_keys=True) != json.dumps(got, sort_keys=True):
                row[lab] += 1
    print("records A=61 F=16 H<=120 W=24")
    for k in sorted(per):
        r = per[k]
        flag = "  <== NO DISCRIMINATOR" if sum(r.values()) == 0 else ""
        print("%-26s A=%-3d F=%-2d H=%-3d W=%-2d%s" % (k, r["A"], r["F"], r["H"], r["W"], flag))


main()
