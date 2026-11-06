#!/usr/bin/env python3
"""Read-only census of omp seat transcripts for round-93 v2 field definitions.

Counts only; never copies transcript content. Prints aggregate counters.
"""
import json, os, random, sys, collections

SERVED = ("stop", "toolUse", "length")
ROOT = os.path.expanduser("~/.omp/agent/sessions")

c = collections.Counter()
multi = []
rr_on_served = 0
rr_status = collections.Counter()
rr_keys = collections.Counter()
sb_keys = collections.Counter()
sb_missing = 0
upstream_on_nonserved = 0
mc_roles = collections.Counter()
mc_fallback_flag = collections.Counter()
first_vs_last_diff = []
init_field_presence = collections.Counter()
files_seen = 0


def rows(path):
    out = []
    try:
        with open(path, "rb") as fh:
            for raw in fh:
                line = raw.strip()
                if not line:
                    continue
                try:
                    o = json.loads(line)
                except Exception:
                    continue
                if isinstance(o, dict):
                    out.append(o)
    except OSError:
        pass
    return out


def walk_files():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        for f in filenames:
            if f.endswith(".jsonl"):
                yield os.path.join(dirpath, f)


def main():
    global rr_on_served, upstream_on_nonserved, sb_missing
    seed = 20261106
    random.seed(seed)
    allf = list(walk_files())
    c["files_total"] = len(allf)
    sample = random.sample(allf, min(int(sys.argv[1]) if len(sys.argv) > 1 else 1500, len(allf)))
    c["files_sampled"] = len(sample)
    for path in sample:
        rs = rows(path)
        inits = [r for r in rs if r.get("type") == "session_init"]
        c["init_rows"] += len(inits)
        c["files_with_init"] += 1 if inits else 0
        if len(inits) > 1:
            c["files_multi_init"] += 1
            multi.append(path)
            def sig(r):
                return (r.get("resolvedModel"),
                        json.dumps(r.get("retryFallback"), sort_keys=True) if isinstance(r.get("retryFallback"), dict) else None)
            if sig(inits[0]) != sig(inits[-1]):
                c["files_multi_init_first_last_differ"] += 1
                first_vs_last_diff.append(path)
            # do any two inits differ?
            sigs = {sig(r) for r in inits}
            if len(sigs) > 1:
                c["files_multi_init_any_differ"] += 1
        for r in inits:
            init_field_presence["resolvedModel:" + ("present" if isinstance(r.get("resolvedModel"), str) else "absent")] += 1
            rf = r.get("retryFallback")
            init_field_presence["retryFallback:" + ("dict" if isinstance(rf, dict) else "other")] += 1
            if isinstance(rf, dict):
                ch = rf.get("chain")
                init_field_presence["chain:" + ("list" if isinstance(ch, list) else "other")] += 1
                if isinstance(ch, list):
                    init_field_presence["chain_items_all_str:" + str(all(isinstance(x, str) for x in ch))] += 1
                    init_field_presence["chain_len_%d" % len(ch)] += 1
        for r in rs:
            t = r.get("type")
            if t == "model_change":
                role = r.get("role")
                mc_roles[str(role)] += 1
                f = r.get("resolvedModelIsFallback")
                if f is True:
                    mc_fallback_flag["true"] += 1
                elif f is False:
                    mc_fallback_flag["false"] += 1
                elif f is None:
                    mc_fallback_flag["absent"] += 1
                else:
                    mc_fallback_flag["other:%r" % (type(f).__name__,)] += 1
                if role == "fallback":
                    c["mc_role_fallback"] += 1
                    mc_fallback_flag["fallback_and_" + ("true" if f is True else "false" if f is False else "absent")] += 1
                continue
            if t != "message":
                continue
            m = r.get("message")
            if not isinstance(m, dict) or m.get("role") != "assistant":
                continue
            sr = m.get("stopReason")
            rr = m.get("retryRecovery")
            if isinstance(rr, dict):
                c["turns_with_retryRecovery"] += 1
                rr_keys["|".join(sorted(rr.keys()))] += 1
                st = rr.get("status")
                rr_status[str(st)] += 1
                if sr in SERVED:
                    rr_on_served += 1
                elif sr != "error":
                    c["rr_on_other_stop"] += 1
                sb = rr.get("supersededBy")
                if isinstance(sb, dict):
                    sb_keys["|".join(sorted(sb.keys()))] += 1
                    if not isinstance(sb.get("provider"), str) or not sb.get("provider"):
                        sb_missing += 1
                    if not isinstance(sb.get("model"), str) or not sb.get("model"):
                        sb_missing += 1
                elif st == "recovered":
                    c["recovered_without_supersededBy"] += 1
            up = m.get("upstreamProvider")
            if up is not None:
                c["turns_with_upstreamProvider"] += 1
                if not isinstance(up, str):
                    c["upstream_nonstring"] += 1
                elif up == "":
                    c["upstream_empty"] += 1
                if sr not in SERVED:
                    upstream_on_nonserved += 1
    print("CENSUS seed=%d" % seed)
    for k in sorted(c):
        print("  %s = %d" % (k, c[k]))
    print("  retryRecovery_on_served_turns = %d" % rr_on_served)
    print("  retryRecovery_status_counts = %s" % dict(rr_status))
    print("  retryRecovery_key_shapes = %s" % dict(rr_keys))
    print("  supersededBy_key_shapes = %s" % dict(sb_keys))
    print("  supersededBy_missing_or_bad_provider_or_model = %d" % sb_missing)
    print("  upstreamProvider_on_nonserved_turns = %d" % upstream_on_nonserved)
    print("  model_change_roles = %s" % dict(mc_roles.most_common(12)))
    print("  model_change_resolvedModelIsFallback = %s" % dict(mc_fallback_flag))
    print("  session_init_field_presence = %s" % dict(init_field_presence))
    print("MULTI_INIT_EXAMPLES (path only):")
    for p in multi[:8]:
        print("  %s" % p)
    print("FIRST_VS_LAST_DIFF_EXAMPLES (path only):")
    for p in first_vs_last_diff[:8]:
        print("  %s" % p)


if __name__ == "__main__":
    main()
