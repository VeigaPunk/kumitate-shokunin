#!/usr/bin/env python3
"""K93Sentinel — second shape pass: are the run24 hits in the v2 fields model IDENTITIES?

Pass 1 collects the corpus's model-identity strings (message.model, message.provider,
model_change.model) without printing them; pass 2 counts, for every target-field value that
matches the 24+ `[A-Za-z0-9_-]` shape, whether it is ALSO written by omp as a model identity and
what its shape looks like (length, separator counts, matched-run length). Counts only, no values.
"""
import json, os, re, time

ROOT = os.path.expanduser("~/.omp/agent/sessions")
SERVED = ("stop", "toolUse", "length")
RUN24 = re.compile(r"[A-Za-z0-9_-]{24,}")
IDENT = set()
TARGET = {}  # field -> list of (value, run_len)

PATH_TYPES = {"resolvedModel", "chain[]", "upstreamProvider", "supersededBy.provider",
              "supersededBy.model"}


def note(field, v):
    m = RUN24.search(v)
    if m:
        TARGET.setdefault(field, []).append((v, m.end() - m.start()))


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


def main():
    t0 = time.time()
    files = 0
    for dirpath, dirnames, filenames in os.walk(ROOT, followlinks=False):
        dirnames[:] = [d for d in dirnames if not os.path.islink(os.path.join(dirpath, d))]
        for fn in filenames:
            if not fn.endswith(".jsonl"):
                continue
            p = os.path.join(dirpath, fn)
            try:
                if not os.path.isfile(p) or os.path.islink(p):
                    continue
            except OSError:
                continue
            files += 1
            for o in file_rows(p):
                t = o.get("type")
                if t == "message":
                    m = o.get("message")
                    if isinstance(m, dict) and m.get("role") == "assistant":
                        for k in ("model", "provider"):
                            v = m.get(k)
                            if isinstance(v, str) and v:
                                IDENT.add(v)
                elif t == "model_change":
                    v = o.get("model")
                    if isinstance(v, str) and v:
                        IDENT.add(v)

    for dirpath, dirnames, filenames in os.walk(ROOT, followlinks=False):
        dirnames[:] = [d for d in dirnames if not os.path.islink(os.path.join(dirpath, d))]
        for fn in filenames:
            if not fn.endswith(".jsonl"):
                continue
            p = os.path.join(dirpath, fn)
            try:
                if not os.path.isfile(p) or os.path.islink(p):
                    continue
            except OSError:
                continue
            for o in file_rows(p):
                t = o.get("type")
                if t == "session_init":
                    rm = o.get("resolvedModel")
                    if isinstance(rm, str):
                        note("resolvedModel", rm)
                    rf = o.get("retryFallback")
                    if isinstance(rf, dict) and isinstance(rf.get("chain"), list):
                        for c in rf["chain"]:
                            if isinstance(c, str):
                                note("chain[]", c)
                elif t == "message":
                    m = o.get("message")
                    if not isinstance(m, dict) or m.get("role") != "assistant":
                        continue
                    sr = m.get("stopReason")
                    if sr in SERVED:
                        up = m.get("upstreamProvider")
                        if isinstance(up, str) and up:
                            note("upstreamProvider", up)
                    elif sr == "error":
                        rr = m.get("retryRecovery")
                        if isinstance(rr, dict):
                            sb = rr.get("supersededBy")
                            if isinstance(sb, dict):
                                for k in ("provider", "model"):
                                    v = sb.get(k)
                                    if isinstance(v, str) and v:
                                        note("supersededBy." + k, v)

    print(f"files={files} identity_strings={len(IDENT)} seconds={time.time()-t0:.1f}")
    print(f"IDENT set: does it contain the corpus model/provider identity strings (counts only)")
    print("field\thits\tin_ident\tdistinct_vals\tmaxlen\tsep_slash\tdot\tplus\teq\tcolon\tat\tmax_run")
    for f in sorted(TARGET):
        hits = TARGET[f]
        vals = {v for v, _ in hits}
        in_ident = sum(1 for v, _ in hits if v in IDENT)
        seps = {"slash": 0, "dot": 0, "plus": 0, "eq": 0, "colon": 0, "at": 0}
        for v in vals:
            seps["slash"] += v.count("/")
            seps["dot"] += v.count(".")
            seps["plus"] += v.count("+")
            seps["eq"] += v.count("=")
            seps["colon"] += v.count(":")
            seps["at"] += v.count("@")
        print(f"{f}\t{len(hits)}\t{in_ident}\t{len(vals)}\t{max(len(v) for v in vals)}\t"
              f"{seps['slash']}\t{seps['dot']}\t{seps['plus']}\t{seps['eq']}\t"
              f"{seps['colon']}\t{seps['at']}\t{max(r for _, r in hits)}")
    # run-length histogram per field (counts only)
    for f in sorted(TARGET):
        hist = {}
        for _, r in TARGET[f]:
            hist[r] = hist.get(r, 0) + 1
        print(f"runlen_hist {f}: " + " ".join(f"{k}:{v}" for k, v in sorted(hist.items())))


if __name__ == "__main__":
    main()
