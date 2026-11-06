#!/usr/bin/env python3
"""oracle92.py — kumitate round 92 reference reading of one omp seat transcript (FROZEN).

Independent of the candidate tool (different language, written before the tool exists).
Field definitions are plan.md § "Frozen field definitions"; this file is their executable form.

  python3 oracle92.py --file T.jsonl [--json]            one record
  python3 oracle92.py --results R.json [--sessions-root D] [--json]   one record per seat
"""
import json, os, re, sys

SERVED = ("stop", "toolUse", "length")
REDACT = re.compile(r"[A-Za-z0-9_-]{24,}")


def _rows(path):
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


def _pm(msg):
    p, m = msg.get("provider"), msg.get("model")
    if not isinstance(p, str) or not p or not isinstance(m, str) or not m:
        return "?"
    return p + "/" + m


def _head(text):
    if not isinstance(text, str):
        return ""
    first = text.split("\n", 1)[0].strip()
    first = REDACT.sub("<redacted>", first)
    return first[:120]


def read_one(path):
    stem = os.path.basename(path)
    if stem.endswith(".jsonl"):
        stem = stem[: -len(".jsonl")]
    rows, bad = _rows(path)
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
    turns = []
    for r in rows:
        if r.get("type") != "message":
            continue
        m = r.get("message")
        if isinstance(m, dict) and m.get("role") == "assistant":
            turns.append(m)
    answered, errors, aborted, last_error, yielded = [], 0, 0, None, False
    for m in turns:
        sr = m.get("stopReason")
        if sr in SERVED:
            pm = _pm(m)
            answered.append(pm)
        elif sr == "error":
            errors += 1
            last_error = _head(m.get("errorMessage"))
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
        final = "served" if sr in SERVED else "dead" if sr == "error" else "aborted" if sr == "aborted" else "other"
    fallback = captured is not None and any(a != captured for a in answered)
    return {
        "seat": stem, "captured": captured, "answered": answered, "errors": errors,
        "aborted": aborted, "fallback": fallback, "final": final, "last_error": last_error,
        "yielded": yielded, "parse_errors": bad,
    }


def _first_ts(path):
    with open(path, "rb") as fh:
        for raw in fh:
            try:
                o = json.loads(raw)
            except Exception:
                continue
            if isinstance(o, dict) and o.get("type") == "session":
                return str(o.get("timestamp") or "")
    return ""


def locate(sessions_root, name, lane, rnd):
    marks = ("/.ufo/waves/round-%s/" % rnd).encode(), ("%s-shokunin" % lane).encode()
    hits = []
    for dirpath, dirnames, filenames in os.walk(sessions_root):
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
    hits.sort(key=lambda p: (_first_ts(p), p))
    return os.path.realpath(hits[-1])


def read_wave(results, sessions_root):
    d = json.load(open(results))
    lane, rnd = d["lane"], d["round"]
    out = []
    for s in d["results"]:
        p = locate(sessions_root, s["name"], lane, rnd)
        if p is None:
            out.append({"seat": s["name"], "role": s.get("agent"), "session": None, "final": "absent"})
        else:
            rec = read_one(p)
            rec["role"] = s.get("agent")
            rec["session"] = p
            out.append(rec)
    return out


def main(argv):
    a = {"--sessions-root": os.path.expanduser("~/.omp/agent/sessions")}
    i = 0
    flags = set()
    while i < len(argv):
        if argv[i] in ("--file", "--results", "--sessions-root"):
            a[argv[i]] = argv[i + 1]
            i += 2
        else:
            flags.add(argv[i])
            i += 1
    if "--file" in a:
        print(json.dumps(read_one(a["--file"]), sort_keys=True))
    elif "--results" in a:
        print(json.dumps(read_wave(a["--results"], a["--sessions-root"]), sort_keys=True))
    else:
        sys.stderr.write("usage: oracle92.py --file T.jsonl | --results R.json [--sessions-root D]\n")
        return 64
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
