#!/usr/bin/env python3
"""K93Sentinel — shape-only scan of host omp transcripts for the NEW v2 fields.

Reads ~/.omp/agent/sessions read-only, never copies a transcript, never prints a field VALUE.
For each of the four new string-bearing fields it counts how many values exist and how many
match credential-ish SHAPES (counts only). Output is counts + shape class names.

Fields (plan.md v2 definitions):
  session_init.resolvedModel                     -> record.resolved    (str|null)
  session_init.retryFallback.chain[*]            -> record.chain       (list[str]|null)
  message.upstreamProvider (served turns)        -> record.upstream    (list[str])
  message.retryRecovery.supersededBy.{provider,model} (error turns)
                                                 -> record.superseded_by (list[str])
"""
import json, os, re, sys, time

ROOT = os.path.expanduser("~/.omp/agent/sessions")
SERVED = ("stop", "toolUse", "length")

RUN24 = re.compile(r"[A-Za-z0-9_-]{24,}")
# credential prefixes / families (checked against the whole value)
PREFIX = re.compile(
    r"(?:^|[^A-Za-z0-9])(sk-[A-Za-z0-9_-]{8,}|sk_live_[A-Za-z0-9]{8,}|"
    r"gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|"
    r"xox[abprs]-[A-Za-z0-9-]{8,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|"
    r"AIza[0-9A-Za-z_-]{20,}|glpat-[A-Za-z0-9_-]{16,}|hf_[A-Za-z0-9]{20,}|"
    r"pypi-[A-Za-z0-9_-]{20,}|npm_[A-Za-z0-9]{20,})"
)
JWT = re.compile(r"^[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}$")
B64BLOB = re.compile(r"[A-Za-z0-9+/]{32,}={0,2}")
PEM = re.compile(r"-----BEGIN [A-Z ]+-----")
BEARER = re.compile(r"(?i)\bbearer\s+\S{8,}")


def classify(v):
    """Return list of shape classes matched by value v (empty = clean shape)."""
    hits = []
    if RUN24.search(v):
        hits.append("run24")
    if PREFIX.search(v):
        hits.append("prefix")
    if JWT.match(v):
        hits.append("jwt")
    if B64BLOB.search(v):
        hits.append("b64blob")
    if PEM.search(v):
        hits.append("pem")
    if BEARER.search(v):
        hits.append("bearer")
    return hits


def main():
    files = bad_files = 0
    bytes_read = 0
    t0 = time.time()
    counts = {}      # field -> [values, distinct, shape_hits, maxlen]
    classes = {}     # (field, class) -> count
    field_vals = {}  # field -> set of distinct values (shape-only reporting; never printed)

    def note(field, v):
        c = counts.setdefault(field, [0, 0, 0, 0])
        s = field_vals.setdefault(field, set())
        c[0] += 1
        if len(v) > c[3]:
            c[3] = len(v)
        first = v not in s
        if first:
            s.add(v)
            c[1] += 1
        hits = classify(v)
        if hits:
            c[2] += 1
            for h in hits:
                classes[(field, h)] = classes.get((field, h), 0) + 1

    for dirpath, dirnames, filenames in os.walk(ROOT, followlinks=False):
        dirnames[:] = [d for d in dirnames if not os.path.islink(os.path.join(dirpath, d))]
        for fn in filenames:
            if not fn.endswith(".jsonl"):
                continue
            p = os.path.join(dirpath, fn)
            try:
                st = os.stat(p, follow_symlinks=False)
            except OSError:
                bad_files += 1
                continue
            if not os.path.isfile(p) or os.path.islink(p):
                bad_files += 1
                continue
            files += 1
            try:
                with open(p, "rb") as fh:
                    for raw in fh:
                        bytes_read += len(raw)
                        if (b'"session_init"' not in raw and b'upstreamProvider' not in raw
                                and b'retryRecovery' not in raw):
                            continue
                        try:
                            o = json.loads(raw)
                        except Exception:
                            continue
                        if not isinstance(o, dict):
                            continue
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
                                        pr = sb.get("provider")
                                        if isinstance(pr, str) and pr:
                                            note("supersededBy.provider", pr)
                                        mo = sb.get("model")
                                        if isinstance(mo, str) and mo:
                                            note("supersededBy.model", mo)
            except OSError:
                bad_files += 1

    dt = time.time() - t0
    print(f"root={ROOT}")
    print(f"files_scanned={files} files_skipped_nonregular={bad_files} bytes_read={bytes_read} seconds={dt:.1f}")
    print("field\tvalues\tdistinct\tshape_hits\tmaxlen")
    for f in ("resolvedModel", "chain[]", "upstreamProvider", "supersededBy.provider", "supersededBy.model"):
        c = counts.get(f, [0, 0, 0, 0])
        print(f"{f}\t{c[0]}\t{c[1]}\t{c[2]}\t{c[3]}")
    print("shape classes fired:")
    if not classes:
        print("  (none)")
    for (f, h), n in sorted(classes.items()):
        print(f"  {f}\t{h}\t{n}")


if __name__ == "__main__":
    main()
