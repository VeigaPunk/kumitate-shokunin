#!/usr/bin/env python3
"""K93Sentinel — third shape pass: provenance of the run24 hits (counts + paths, never values).

For every distinct value in the four v2 string fields that matches the 24+ `[A-Za-z0-9_-]` shape:
  * sha256 prefix, length, character-class counts (no value printed)
  * the files (relative to the sessions root) that carry it and their first `session` timestamp
  * whether omp also writes it as message.model / model_change.model (model identity)
This separates organic omp data from fixtures written by today's fleet seats.
"""
import hashlib, json, os, re, time

ROOT = os.path.expanduser("~/.omp/agent/sessions")
SERVED = ("stop", "toolUse", "length")
RUN24 = re.compile(r"[A-Za-z0-9_-]{24,}")


def file_rows(fn):
    with open(fn, "rb") as fh:
        for raw in fh:
            if (b'"session_init"' not in raw and b'upstreamProvider' not in raw
                    and b'retryRecovery' not in raw and b'"model"' not in raw):
                continue
            try:
                o = json.loads(raw)
            except Exception:
                continue
            if isinstance(o, dict):
                yield o


def first_ts(path):
    try:
        for i, raw in enumerate(open(path, "rb")):
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


def walk():
    for dirpath, dirnames, filenames in os.walk(ROOT, followlinks=False):
        dirnames[:] = [d for d in dirnames if not os.path.islink(os.path.join(dirpath, d))]
        for fn in filenames:
            if fn.endswith(".jsonl"):
                p = os.path.join(dirpath, fn)
                try:
                    if os.path.isfile(p) and not os.path.islink(p):
                        yield p
                except OSError:
                    pass


def main():
    t0 = time.time()
    ident = set()
    hits = {}   # value -> {"fields": set, "files": set}
    for p in walk():
        for o in file_rows(p):
            t = o.get("type")
            if t == "message":
                m = o.get("message")
                if not isinstance(m, dict) or m.get("role") != "assistant":
                    continue
                for k in ("model", "provider"):
                    v = m.get(k)
                    if isinstance(v, str) and v:
                        ident.add(v)
                sr = m.get("stopReason")
                vals = []
                if sr in SERVED and isinstance(m.get("upstreamProvider"), str) and m["upstreamProvider"]:
                    vals.append(("upstreamProvider", m["upstreamProvider"]))
                elif sr == "error":
                    rr = m.get("retryRecovery")
                    sb = rr.get("supersededBy") if isinstance(rr, dict) else None
                    if isinstance(sb, dict):
                        for k in ("provider", "model"):
                            v = sb.get(k)
                            if isinstance(v, str) and v:
                                vals.append(("supersededBy." + k, v))
                for field, v in vals:
                    if RUN24.search(v):
                        e = hits.setdefault(v, {"fields": set(), "files": set()})
                        e["fields"].add(field)
                        e["files"].add(p)
            elif t == "model_change":
                v = o.get("model")
                if isinstance(v, str) and v:
                    ident.add(v)
            elif t == "session_init":
                vals = []
                rm = o.get("resolvedModel")
                if isinstance(rm, str):
                    vals.append(("resolvedModel", rm))
                rf = o.get("retryFallback")
                if isinstance(rf, dict) and isinstance(rf.get("chain"), list):
                    for c in rf["chain"]:
                        if isinstance(c, str):
                            vals.append(("chain[]", c))
                for field, v in vals:
                    if RUN24.search(v):
                        e = hits.setdefault(v, {"fields": set(), "files": set()})
                        e["fields"].add(field)
                        e["files"].add(p)

    def profile(v):
        cls = {"upper": 0, "lower": 0, "digit": 0, "underscore": 0, "hyphen": 0,
               "slash": 0, "colon": 0, "dot": 0, "plus": 0, "eq": 0, "at": 0, "other": 0}
        for ch in v:
            if ch.isupper():
                cls["upper"] += 1
            elif ch.islower():
                cls["lower"] += 1
            elif ch.isdigit():
                cls["digit"] += 1
            elif ch == "_":
                cls["underscore"] += 1
            elif ch == "-":
                cls["hyphen"] += 1
            elif ch == "/":
                cls["slash"] += 1
            elif ch == ":":
                cls["colon"] += 1
            elif ch == ".":
                cls["dot"] += 1
            elif ch == "+":
                cls["plus"] += 1
            elif ch == "=":
                cls["eq"] += 1
            elif ch == "@":
                cls["at"] += 1
            else:
                cls["other"] += 1
        return cls

    print(f"distinct_run24_values={len(hits)} seconds={time.time()-t0:.1f}")
    for i, (v, e) in enumerate(sorted(hits.items(), key=lambda kv: -len(kv[1]["files"]))):
        prof = profile(v)
        print(f"\n[{i}] sha256_12={hashlib.sha256(v.encode()).hexdigest()[:12]} len={len(v)} "
              f"in_ident={v in ident} files={len(e['files'])} fields={sorted(e['fields'])}")
        print("    chars=" + " ".join(f"{k}:{n}" for k, n in prof.items() if n))
        ts = []
        for p in sorted(e["files"])[:6]:
            ts.append((first_ts(p), os.path.relpath(p, ROOT)))
        for t, rel in sorted(ts):
            print(f"    file ts={t} rel={rel}")


if __name__ == "__main__":
    main()
