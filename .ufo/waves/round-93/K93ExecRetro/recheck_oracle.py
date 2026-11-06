#!/usr/bin/env python3
"""Independent (non-importing) re-implementation of the v2 record, for attacking of the oracle.

Written from plan.md §"Frozen field definitions (v2)" only; does not import oracle93.py.
Compares type-strictly against the oracle's own output over every located seat of r85..r92.
"""
import json, os, re, sys

SERVED = {"stop", "toolUse", "length"}
TOKEN = re.compile(r"[A-Za-z0-9_-]{24,}")
FIELDS = ["captured", "answered", "error_attempts", "recovered_attempts", "superseded_by",
          "upstream", "resolved", "chain", "flag_hops", "revert_hops", "aborted", "fallback",
          "final", "last_error", "yielded", "parse_errors", "seat"]


def load(path):
    rows, bad = [], 0
    with open(path, "rb") as fh:
        for raw in fh:
            t = raw.strip()
            if not t:
                continue
            try:
                o = json.loads(t)
            except Exception:
                bad += 1
                continue
            if isinstance(o, dict):
                rows.append(o)
            else:
                bad += 1
    return rows, bad


def pm(o):
    p, m = o.get("provider"), o.get("model")
    if not (isinstance(p, str) and p and isinstance(m, str) and m):
        return "?"
    return p + "/" + m


def redact(s):
    if not isinstance(s, str):
        return ""
    line = s.split("\n")[0].strip()
    return TOKEN.sub("<redacted>", line)[:120]


def rec(path):
    stem = os.path.basename(path)
    if stem.endswith(".jsonl"):
        stem = stem[:-6]
    rows, bad = load(path)
    captured = None
    sub = "subagent:" + stem
    for r in rows:
        if r.get("type") == "model_change" and r.get("role") == sub:
            captured = r.get("model") if isinstance(r.get("model"), str) else None
            break
    if captured is None:
        for r in rows:
            if r.get("type") == "model_change" and r.get("role") in (None, "default"):
                captured = r.get("model") if isinstance(r.get("model"), str) else None
                break
    fh = rh = 0
    for r in rows:
        if r.get("type") != "model_change":
            continue
        if r.get("resolvedModelIsFallback") is True:
            fh += 1
        elif r.get("role") == "fallback":
            rh += 1
    resolved = chain = None
    for r in rows:
        if r.get("type") == "session_init":
            rm = r.get("resolvedModel")
            resolved = rm if isinstance(rm, str) else None
            rf = r.get("retryFallback")
            chain = ([c for c in rf["chain"] if isinstance(c, str)]
                     if isinstance(rf, dict) and isinstance(rf.get("chain"), list) else None)
            break
    turns = [r["message"] for r in rows
             if r.get("type") == "message" and isinstance(r.get("message"), dict)
             and r["message"].get("role") == "assistant"]
    answered, superseded, upstream = [], [], []
    err = recov = aborted = 0
    last = None
    yielded = False
    for m in turns:
        sr = m.get("stopReason")
        if sr in SERVED:
            v = pm(m)
            if v not in answered:
                answered.append(v)
            up = m.get("upstreamProvider")
            if isinstance(up, str) and up and up not in upstream:
                upstream.append(up)
        elif sr == "error":
            err += 1
            last = redact(m.get("errorMessage"))
            rr = m.get("retryRecovery")
            if isinstance(rr, dict):
                if rr.get("status") == "recovered":
                    recov += 1
                sb = rr.get("supersededBy")
                if isinstance(sb, dict):
                    v = pm(sb)
                    if v not in superseded:
                        superseded.append(v)
        elif sr == "aborted":
            aborted += 1
        content = m.get("content")
        if isinstance(content, list):
            for c in content:
                if isinstance(c, dict) and c.get("type") == "toolCall" and c.get("name") == "yield":
                    yielded = True
    if not turns:
        final = "silent"
    else:
        sr = turns[-1].get("stopReason")
        final = "served" if sr in SERVED else ("dead" if sr == "error" else ("aborted" if sr == "aborted" else "other"))
    return {"seat": stem, "captured": captured, "answered": answered, "error_attempts": err,
            "recovered_attempts": recov, "superseded_by": superseded, "upstream": upstream,
            "resolved": resolved, "chain": chain, "flag_hops": fh, "revert_hops": rh,
            "aborted": aborted, "fallback": captured is not None and any(a != captured for a in answered),
            "final": final, "last_error": last, "yielded": yielded, "parse_errors": bad}


def main(sdir, odir):
    agree = disagree = 0
    diffs = []
    seats = 0
    for n in range(85, 93):
        op = os.path.join(odir, "o%d.json" % n)
        if not os.path.exists(op):
            continue
        for o in json.load(open(op)):
            if not o.get("session"):
                continue
            seats += 1
            mine = rec(o["session"])
            mine["session"] = o["session"]
            for f in FIELDS:
                a, b = mine[f], o[f]
                if type(a) is not type(b) or a != b:
                    disagree += 1
                    diffs.append((n, o["seat"], f, a, b))
                else:
                    agree += 1
    print("INDEPENDENT_VS_ORACLE: seats=%d agree=%d disagree=%d" % (seats, agree, disagree))
    for d in diffs:
        print("  DIFF r%s %s %s mine=%r oracle=%r" % d)
    return 0 if disagree == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
