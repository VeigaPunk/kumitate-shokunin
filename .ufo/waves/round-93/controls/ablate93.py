"""ablate93.py — round-93 pre-data controls: the oracle with ONE field reading replaced by a plausible
cheaper or v1-shaped reading. Each ctl-*.py shim names its mode. Not a candidate; never shipped.
Every mode except `positive` must read UNMET under probe93-c1.py, or the counter cannot see it."""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "probe"))
import oracle93


def _rows(path):
    out = []
    try:
        for l in open(path, "rb"):
            try:
                o = json.loads(l)
            except Exception:
                continue
            if isinstance(o, dict):
                out.append(o)
    except OSError:
        pass
    return out


def _turns(rows):
    return [r["message"] for r in rows if r.get("type") == "message" and isinstance(r.get("message"), dict)
            and r["message"].get("role") == "assistant"]


def ablate(rec, mode, path):
    if rec.get("session", "") is None:
        return rec
    rows = _rows(path) if path else []
    if mode == "v1names":          # v1 record shape: `errors`, none of the v2 fields
        rec["errors"] = rec.pop("error_attempts")
        for k in ("recovered_attempts", "superseded_by", "upstream", "resolved", "chain", "flag_hops", "revert_hops"):
            rec.pop(k)
    elif mode == "errname":        # only the D1 rename skipped
        rec["errors"] = rec.pop("error_attempts")
    elif mode == "supersedefromhops":  # who replaced = models of flagged model_change rows
        s = []
        for r in rows:
            if r.get("type") == "model_change" and r.get("resolvedModelIsFallback") is True and isinstance(r.get("model"), str):
                if r["model"] not in s:
                    s.append(r["model"])
        rec["superseded_by"] = s
    elif mode == "upstreamall":    # upstream from every turn, not served turns only
        u = []
        for m in _turns(rows):
            v = m.get("upstreamProvider")
            if isinstance(v, str) and v and v not in u:
                u.append(v)
        rec["upstream"] = u
    elif mode == "recoveredloose":  # any retryRecovery object counts as recovered
        rec["recovered_attempts"] = sum(1 for m in _turns(rows) if m.get("stopReason") == "error"
                                        and isinstance(m.get("retryRecovery"), dict))
    elif mode == "chainprimary":   # chain with the primary prepended
        if rec["chain"] is not None:
            for r in rows:
                if r.get("type") == "session_init":
                    p = (r.get("retryFallback") or {}).get("primary")
                    if isinstance(p, str):
                        rec["chain"] = [p] + rec["chain"]
                    break
    elif mode == "resolvedcaptured":  # resolved = the captured model_change string (no :level suffix)
        rec["resolved"] = rec["captured"]
    elif mode == "flagtruthy":     # truthy flag counts (1 counts as true)
        rec["flag_hops"] = sum(1 for r in rows if r.get("type") == "model_change" and r.get("resolvedModelIsFallback"))
    elif mode == "revertrole":     # every role=fallback row is a revert hop (D4 ignored)
        rec["revert_hops"] = sum(1 for r in rows if r.get("type") == "model_change" and r.get("role") == "fallback")
    elif mode == "typeloose":      # booleans emitted as 0/1 (Python 0 == False class)
        rec["fallback"] = int(rec["fallback"])
        rec["yielded"] = int(rec["yielded"])
    elif mode == "parseerr0":      # the r92 x2 construction: parse errors never counted
        rec["parse_errors"] = 0
    elif mode == "redact23":       # the r92 x2b construction: 23-char boundary
        if rec["last_error"] is not None:
            for m in reversed(_turns(rows)):
                if m.get("stopReason") == "error":
                    t = m.get("errorMessage")
                    if isinstance(t, str):
                        import re
                        first = t.split("\n", 1)[0].strip()
                        rec["last_error"] = re.sub(r"[A-Za-z0-9_-]{23,}", "<redacted>", first)[:120]
                    break
    elif mode == "positive":
        pass
    else:
        raise SystemExit("unknown mode " + mode)
    return rec


def main(mode, argv):
    a = {"--sessions-root": os.path.expanduser("~/.omp/agent/sessions")}
    i = 0
    while i < len(argv):
        if argv[i] == "--json":
            i += 1
            continue
        a[argv[i]] = argv[i + 1]
        i += 2
    if "--file" in a:
        print(json.dumps(ablate(oracle93.read_one(a["--file"]), mode, a["--file"]), sort_keys=True))
    else:
        out = [ablate(r, mode, r.get("session")) for r in oracle93.read_wave(a["--results"], a["--sessions-root"])]
        print(json.dumps(out, sort_keys=True))
