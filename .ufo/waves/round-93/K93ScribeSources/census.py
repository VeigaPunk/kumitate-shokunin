#!/usr/bin/env python3
"""Round-93 S270 census: which routing / retry fields omp actually persists in seat transcripts.

Reads a seeded random sample of seat transcripts under
~/.omp/agent/sessions/-Projects-shokunin/*/*.jsonl and counts the v2 field carriers.
Never prints transcript content; only counts and field names.
"""
import argparse
import glob
import hashlib
import json
import os
import random
import sys

SEED = 93
SAMPLE = 1500
ROOT = os.path.expanduser("~/.omp/agent/sessions/-Projects-shokunin")
SERVED = {"stop", "toolUse", "length"}


def sha256_lines(items):
    h = hashlib.sha256()
    for it in items:
        h.update(it.encode())
        h.update(b"\n")
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", default="", help="pinned sample: relative paths, one per line")
    ap.add_argument("--emit-list", default="", help="write the drawn sample here, one relative path per line")
    args = ap.parse_args()
    files = sorted(glob.glob(os.path.join(ROOT, "*", "*.jsonl")))
    pop = len(files)
    if args.list:
        with open(args.list, "r", encoding="utf-8") as fh:
            rels = [ln.rstrip("\n") for ln in fh if ln.strip()]
        sample = [os.path.join(ROOT, r) for r in rels]
    else:
        rng = random.Random(SEED)
        sample = rng.sample(files, min(SAMPLE, pop))
        sample.sort()
        if args.emit_list:
            with open(args.emit_list, "w", encoding="utf-8") as fh:
                for p_ in sample:
                    fh.write(os.path.relpath(p_, ROOT) + "\n")

    c = {
        "files": len(sample),
        "files_unreadable": 0,
        "lines": 0,
        "lines_bad_json": 0,
        "rows": 0,
        "assistant_rows": 0,
        "assistant_rows_with_retryRecovery": 0,
        "assistant_rows_with_retryRecovery_nonobject": 0,
        "error_turns": 0,
        "error_turns_with_retryRecovery_object": 0,
        "error_status_recovered": 0,
        "error_status_superseded": 0,
        "error_status_other": 0,
        "error_turns_with_supersededBy_object": 0,
        "supersededBy_with_provider_string": 0,
        "supersededBy_with_model_string": 0,
        "recovered_without_supersededBy": 0,
        "superseded_with_supersededBy": 0,
        "served_turns": 0,
        "served_with_upstreamProvider": 0,
        "served_with_upstreamModel": 0,
        "model_change_rows": 0,
        "flag_hops": 0,
        "revert_hops": 0,
        "role_fallback_rows": 0,
        "session_init_rows": 0,
        "session_init_with_resolvedModel": 0,
        "session_init_with_retryFallback_object": 0,
        "session_init_retryFallback_chain_list": 0,
        "session_init_retryFallback_chain_nonempty": 0,
        "attempt_ge2": 0,
        "attempt_max": 0,
        "attempt_hist": {},
        "stop_reason_hist": {},
    }
    upstream = set()

    for path in sample:
        try:
            with open(path, "r", encoding="utf-8", errors="replace") as fh:
                for line in fh:
                    line = line.strip()
                    if not line:
                        continue
                    c["lines"] += 1
                    try:
                        obj = json.loads(line)
                    except Exception:
                        c["lines_bad_json"] += 1
                        continue
                    if not isinstance(obj, dict):
                        continue
                    c["rows"] += 1
                    t = obj.get("type")
                    if t == "message":
                        msg = obj.get("message")
                        if not isinstance(msg, dict):
                            continue
                        role = msg.get("role")
                        if role == "assistant":
                            c["assistant_rows"] += 1
                            rr = msg.get("retryRecovery")
                            if rr is not None:
                                if isinstance(rr, dict):
                                    c["assistant_rows_with_retryRecovery"] += 1
                                else:
                                    c["assistant_rows_with_retryRecovery_nonobject"] += 1
                            sr = msg.get("stopReason")
                            c["stop_reason_hist"][str(sr)] = c["stop_reason_hist"].get(str(sr), 0) + 1
                            if sr == "error":
                                c["error_turns"] += 1
                                if isinstance(rr, dict):
                                    c["error_turns_with_retryRecovery_object"] += 1
                                    st = rr.get("status")
                                    if st == "recovered":
                                        c["error_status_recovered"] += 1
                                    elif st == "superseded":
                                        c["error_status_superseded"] += 1
                                    else:
                                        c["error_status_other"] += 1
                                    at = rr.get("attempt")
                                    if isinstance(at, int) and not isinstance(at, bool):
                                        c["attempt_hist"][str(at)] = c["attempt_hist"].get(str(at), 0) + 1
                                        if at >= 2:
                                            c["attempt_ge2"] += 1
                                        if at > c["attempt_max"]:
                                            c["attempt_max"] = at
                                    sb = rr.get("supersededBy")
                                    if isinstance(sb, dict):
                                        c["error_turns_with_supersededBy_object"] += 1
                                        if isinstance(sb.get("provider"), str):
                                            c["supersededBy_with_provider_string"] += 1
                                        if isinstance(sb.get("model"), str):
                                            c["supersededBy_with_model_string"] += 1
                                    if st == "recovered" and not isinstance(sb, dict):
                                        c["recovered_without_supersededBy"] += 1
                                    if st == "superseded" and isinstance(sb, dict):
                                        c["superseded_with_supersededBy"] += 1
                            elif sr in SERVED:
                                c["served_turns"] += 1
                                up = msg.get("upstreamProvider")
                                if isinstance(up, str) and up:
                                    c["served_with_upstreamProvider"] += 1
                                    upstream.add(up)
                                um = msg.get("upstreamModel")
                                if isinstance(um, str) and um:
                                    c["served_with_upstreamModel"] += 1
                    elif t == "model_change":
                        c["model_change_rows"] += 1
                        flag = obj.get("resolvedModelIsFallback")
                        role = obj.get("role")
                        if role == "fallback":
                            c["role_fallback_rows"] += 1
                        if flag is True:
                            c["flag_hops"] += 1
                        elif role == "fallback":
                            c["revert_hops"] += 1
                    elif t == "session_init":
                        c["session_init_rows"] += 1
                        rm = obj.get("resolvedModel")
                        if isinstance(rm, str):
                            c["session_init_with_resolvedModel"] += 1
                        rf = obj.get("retryFallback")
                        if isinstance(rf, dict):
                            c["session_init_with_retryFallback_object"] += 1
                            ch = rf.get("chain")
                            if isinstance(ch, list):
                                c["session_init_retryFallback_chain_list"] += 1
                                if ch:
                                    c["session_init_retryFallback_chain_nonempty"] += 1
        except OSError:
            c["files_unreadable"] += 1

    print("CENSUS93 seed=%d list=%s population=%d sample=%d root=%s" % (SEED, args.list or "-", pop, len(sample), ROOT))
    print("population_sha256=%s" % sha256_lines([os.path.relpath(p, ROOT) for p in files]))
    print("sample_sha256=%s" % sha256_lines([os.path.relpath(p, ROOT) for p in sample]))
    for k in c:
        if k in ("stop_reason_hist", "attempt_hist"):
            continue
        print("%s=%s" % (k, c[k]))
    print("attempt_hist=%s" % json.dumps(c["attempt_hist"], sort_keys=True))
    print("stop_reason_hist=%s" % json.dumps(c["stop_reason_hist"], sort_keys=True))
    print("upstreamProvider_distinct=%d values=%s" % (len(upstream), json.dumps(sorted(upstream), sort_keys=True)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
