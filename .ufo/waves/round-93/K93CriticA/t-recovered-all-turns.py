#!/usr/bin/env python3
"""base.py — K93CriticA reference-shaped construction of seat-route v2 (contract
`kumitate-seat-route-v2`). Independent of probe93/oracle93 at runtime; implements the plan's
frozen field definitions directly. Variants derive from this file by one textual edit each.

  python3 base.py --file T.jsonl --json
  python3 base.py --results R.json --sessions-root D --json [--strict]
"""
import json
import os
import re
import sys

SERVED = ("stop", "toolUse", "length")
REDACT = re.compile(r"[A-Za-z0-9_-]{24,}")
USAGE = "usage: base.py --file T.jsonl [--json] | --results R.json [--sessions-root D] [--json]\n"


def pm(obj):
    p, m = obj.get("provider"), obj.get("model")
    if not isinstance(p, str) or not p or not isinstance(m, str) or not m:
        return "?"
    return p + "/" + m


def head(text):
    if not isinstance(text, str):
        return ""
    first = text.split("\n", 1)[0].strip()
    first = REDACT.sub("<redacted>", first)
    return first[:120]


def add(lst, v):
    if v not in lst:
        lst.append(v)


def rows_of(path):
    rows, bad = [], 0
    with open(path, "rb") as fh:
        for raw in fh:
            line = raw.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except Exception:
                bad += 1
                continue
            if isinstance(obj, dict):
                rows.append(obj)
            else:
                bad += 1
    return rows, bad


def read_one(path):
    stem = os.path.basename(path)
    if stem.endswith(".jsonl"):
        stem = stem[: -len(".jsonl")]
    rows, bad = rows_of(path)

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

    flag_hops = revert_hops = 0
    for r in rows:
        if r.get("type") != "model_change":
            continue
        if r.get("resolvedModelIsFallback") is True:
            flag_hops += 1
        elif r.get("role") == "fallback":
            revert_hops += 1

    resolved, chain = None, None
    for r in rows:
        if r.get("type") == "session_init":
            rm = r.get("resolvedModel")
            resolved = rm if isinstance(rm, str) else None
            rf = r.get("retryFallback")
            if isinstance(rf, dict) and isinstance(rf.get("chain"), list):
                chain = [c for c in rf["chain"] if isinstance(c, str)]
            break

    turns = []
    for r in rows:
        if r.get("type") != "message":
            continue
        m = r.get("message")
        if isinstance(m, dict) and m.get("role") == "assistant":
            turns.append(m)

    answered, superseded, upstream = [], [], []
    error_attempts = recovered = aborted = 0
    last_error, yielded = None, False
    for m in turns:
        sr = m.get("stopReason")
        if sr in SERVED:
            add(answered, pm(m))
            up = m.get("upstreamProvider")
            if isinstance(up, str) and up:
                add(upstream, up)
        elif sr == "error":
            error_attempts += 1
            last_error = head(m.get("errorMessage"))
            rr = m.get("retryRecovery")
            if isinstance(rr, dict):
                if rr.get("status") == "recovered":
                    pass
                sb = rr.get("supersededBy")
                if isinstance(sb, dict):
                    add(superseded, pm(sb))
        elif sr == "aborted":
            aborted += 1
        content = m.get("content")
        if isinstance(content, list):
            for c in content:
                if isinstance(c, dict) and c.get("type") == "toolCall" and c.get("name") == "yield":
                    yielded = True

    recovered = sum(1 for m in turns if isinstance(m.get("retryRecovery"), dict)
                    and m["retryRecovery"].get("status") == "recovered")
    if not turns:
        final = "silent"
    else:
        sr = turns[-1].get("stopReason")
        final = "served" if sr in SERVED else "dead" if sr == "error" else "aborted" if sr == "aborted" else "other"
    fallback = captured is not None and any(a != captured for a in answered)
    return {
        "seat": stem, "captured": captured, "answered": answered, "error_attempts": error_attempts,
        "recovered_attempts": recovered, "superseded_by": superseded, "upstream": upstream,
        "resolved": resolved, "chain": chain, "flag_hops": flag_hops, "revert_hops": revert_hops,
        "aborted": aborted, "fallback": fallback, "final": final, "last_error": last_error,
        "yielded": yielded, "parse_errors": bad,
    }


def first_ts(path):
    try:
        with open(path, "rb") as fh:
            for i, raw in enumerate(fh):
                if i > 50:
                    break
                try:
                    o = json.loads(raw)
                except Exception:
                    continue
                if isinstance(o, dict) and o.get("type") == "session":
                    return str(o.get("timestamp") or "")
    except OSError:
        pass
    return ""


def locate(root, name, lane, rnd):
    marks = ("/.ufo/waves/round-%s/" % rnd).encode(), ("%s-shokunin" % lane).encode()
    hits = []
    for dirpath, dirnames, filenames in os.walk(root):
        if name + ".jsonl" in filenames:
            p = os.path.join(dirpath, name + ".jsonl")
            try:
                data = open(p, "rb").read()
            except OSError:
                continue
            if all(mk in data for mk in marks):
                hits.append(p)
    if not hits:
        return None
    hits.sort(key=lambda p: (first_ts(p), p))
    return os.path.realpath(hits[-1])


def read_wave(results, root):
    d = json.load(open(results))
    lane, rnd = d["lane"], d["round"]
    out = []
    for s in d["results"]:
        name = s["name"]
        p = None
        if not any(ch in name for ch in ("/", "\\", "\0")) and ".." not in name:
            p = locate(root, name, lane, rnd)
        if p is None:
            out.append({"seat": name, "role": s.get("agent"), "session": None, "final": "absent"})
        else:
            rec = read_one(p)
            rec["role"] = s.get("agent")
            rec["session"] = p
            out.append(rec)
    return out


def main(argv):
    a = {"--sessions-root": os.path.expanduser("~/.omp/agent/sessions")}
    i = 0
    while i < len(argv):
        if argv[i] in ("--file", "--results", "--sessions-root") and i + 1 < len(argv):
            a[argv[i]] = argv[i + 1]
            i += 2
        elif argv[i] in ("--json", "--strict"):
            a[argv[i]] = True
            i += 1
        else:
            sys.stderr.write(USAGE)
            return 64
    if "--file" in a:
        print(json.dumps(read_one(a["--file"]), sort_keys=True))
    elif "--results" in a:
        print(json.dumps(read_wave(a["--results"], a["--sessions-root"]), sort_keys=True))
    else:
        sys.stderr.write(USAGE)
        return 64
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
