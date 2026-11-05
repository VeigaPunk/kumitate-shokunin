"""ablate92.py — round-92 pre-data controls: the oracle with ONE field reading replaced by a
plausible cheaper reading. Each ctl-*.py shim names its mode. Not a candidate; never shipped."""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "probe"))
import oracle92

def ablate(rec, mode):
    if "session" in rec and rec.get("session") is None:
        return rec
    if mode == "captured":      # Amendment-44 class: report the captured route as the answering model
        rec["answered"] = [rec["captured"]] if rec["captured"] else []
        rec["fallback"] = False
    elif mode == "lastmodel":   # only the last served model, no hop history
        rec["answered"] = rec["answered"][-1:]
    elif mode == "flagonly":    # fallback from resolvedModelIsFallback flags, not from served turns
        rec["fallback"] = rec.get("_flag", False)
    elif mode == "noerror":     # ignore failed requests
        rec["errors"] = 0; rec["last_error"] = None
        if rec["final"] == "dead": rec["final"] = "served"
    elif mode == "noabort":
        rec["aborted"] = 0
        if rec["final"] == "aborted": rec["final"] = "served"
    elif mode == "noredact":    # last error without credential-shape redaction
        if rec["last_error"]: rec["last_error"] = rec["last_error"].replace("<redacted>", "")
    elif mode == "yieldfinal":  # 'served' iff the seat yielded
        if rec["final"] != "silent": rec["final"] = "served" if rec["yielded"] else "dead"
    rec.pop("_flag", None)
    return rec

def flag(path):
    try:
        for l in open(path, "rb"):
            try: o = json.loads(l)
            except Exception: continue
            if isinstance(o, dict) and o.get("type") == "model_change" and o.get("resolvedModelIsFallback") is True:
                return True
    except OSError: pass
    return False

def main(mode, argv):
    a = {"--sessions-root": os.path.expanduser("~/.omp/agent/sessions")}
    i = 0
    while i < len(argv):
        if argv[i] == "--json": i += 1; continue
        a[argv[i]] = argv[i + 1]; i += 2
    if "--file" in a:
        r = oracle92.read_one(a["--file"]); r["_flag"] = flag(a["--file"])
        print(json.dumps(ablate(r, mode), sort_keys=True))
    else:
        out = []
        for r in oracle92.read_wave(a["--results"], a["--sessions-root"]):
            if r.get("session"): r["_flag"] = flag(r["session"])
            out.append(ablate(r, mode))
        print(json.dumps(out, sort_keys=True))
