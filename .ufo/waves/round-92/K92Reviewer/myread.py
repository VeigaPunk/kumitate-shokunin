#!/usr/bin/env python3
"""myread.py — K92Reviewer independent reading of one omp seat transcript.

Implemented from plan.md § "Frozen field definitions" sentences only (not from oracle92.py).
Mode --derive prints per-field derivation evidence (error text redacted by the plan's rule).
"""
import json, os, re, sys

SERVED = ("stop", "toolUse", "length")
REDACT = re.compile(r"[A-Za-z0-9_-]{24,}")


def redact(text):
    return REDACT.sub("<redacted>", text)


def head(text):
    # plan: errorMessage's first line, trimmed, redacted, cut to 120; non-string -> ""
    if not isinstance(text, str):
        return ""
    first = text.split("\n", 1)[0].strip()
    first = redact(first)
    return first[:120]


def load(path):
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
            if not isinstance(obj, dict):
                bad += 1
                continue
            rows.append(obj)
    return rows, bad


def model_str(msg):
    # plan: provider + "/" + model, either missing or empty -> "?"
    p, m = msg.get("provider"), msg.get("model")
    if not isinstance(p, str) or p == "" or not isinstance(m, str) or m == "":
        return "?"
    return p + "/" + m


def read_one(path):
    stem = os.path.basename(path)
    if stem.endswith(".jsonl"):
        stem = stem[: -len(".jsonl")]
    rows, bad = load(path)
    ev = {"model_changes": [], "turns": []}
    seat = "subagent:" + stem
    captured = None
    cap_src = None
    # plan: model of the first model_change row whose role is subagent:<seat>
    for i, r in enumerate(rows):
        if r.get("type") == "model_change":
            ev["model_changes"].append((i, r.get("role"), r.get("model"), r.get("resolvedModelIsFallback")))
        if r.get("type") == "model_change" and r.get("role") == seat and captured is None and cap_src is None:
            m = r.get("model")
            if isinstance(m, str):
                captured, cap_src = m, "subagent-row"
            else:
                cap_src = "subagent-row-nonstring-model"
    # plan: if none, of the first model_change whose role is absent or default
    if cap_src is None:
        for i, r in enumerate(rows):
            if r.get("type") == "model_change" and (r.get("role") is None or r.get("role") == "default"):
                m = r.get("model")
                captured = m if isinstance(m, str) else None
                cap_src = "default-row" if isinstance(m, str) else "default-row-nonstring-model"
                break
    turns = []
    for i, r in enumerate(rows):
        if r.get("type") != "message":
            continue
        m = r.get("message")
        if isinstance(m, dict) and m.get("role") == "assistant":
            turns.append((i, m))
    answered, errors, aborted, last_error, yielded = [], 0, 0, None, False
    for i, m in turns:
        sr = m.get("stopReason")
        ev["turns"].append((i, sr, model_str(m), bool(m.get("errorMessage"))))
        if sr in SERVED:
            pm = model_str(m)
            if pm not in answered:
                answered.append(pm)
        elif sr == "error":
            errors += 1
            last_error = head(m.get("errorMessage"))
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
        sr = turns[-1][1].get("stopReason")
        final = "served" if sr in SERVED else "dead" if sr == "error" else "aborted" if sr == "aborted" else "other"
    fallback = captured is not None and any(a != captured for a in answered)
    rec = {
        "seat": stem, "captured": captured, "answered": answered, "errors": errors,
        "aborted": aborted, "fallback": fallback, "final": final, "last_error": last_error,
        "yielded": yielded, "parse_errors": bad,
    }
    return rec, ev


def main(argv):
    if "--file" not in argv:
        sys.stderr.write("usage: myread.py --file T.jsonl [--json] [--derive]\n")
        return 64
    path = argv[argv.index("--file") + 1]
    rec, ev = read_one(path)
    if "--derive" in argv:
        print("== derivation %s" % path, file=sys.stderr)
        print("rows: model_change entries (idx, role, model, fallbackFlag): %s" % (ev["model_changes"][:8],), file=sys.stderr)
        print("assistant turns (idx, stopReason, model, hasErrorMessage): %s" % (ev["turns"],), file=sys.stderr)
    print(json.dumps(rec, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
