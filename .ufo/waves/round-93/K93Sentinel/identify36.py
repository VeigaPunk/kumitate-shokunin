#!/usr/bin/env python3
"""K93Sentinel — structural identification of the one 36-char run24 value in resolvedModel/chain[].

Prints NO field value. Decomposes `provider/model:effort` and checks each part against the model
identities the same transcript actually carries (message.provider, message.model, model_change.model),
so the report can say whether the run24 hit is a model route or a free-text/credential blob.
"""
import hashlib, json, os

P = os.path.expanduser(
    "~/.omp/agent/sessions/-Projects-shokunin/"
    "2026-11-06T02-29-07-083Z_01a1aeb0-398b-7697-a39a-f6303733618c/ConnectorOverlap.jsonl")
EFFORT = {"low", "medium", "high", "xhigh", "max", "minimal", "none", "thinking", "think",
          "default", "auto"}


def main():
    val = None
    providers, models, mcmodels = set(), set(), set()
    for raw in open(P, "rb"):
        try:
            o = json.loads(raw)
        except Exception:
            continue
        if not isinstance(o, dict):
            continue
        if o.get("type") == "session_init" and val is None and isinstance(o.get("resolvedModel"), str):
            val = o["resolvedModel"]
        if o.get("type") == "model_change" and isinstance(o.get("model"), str):
            mcmodels.add(o["model"])
        if o.get("type") == "message":
            m = o.get("message")
            if isinstance(m, dict) and m.get("role") == "assistant":
                if isinstance(m.get("provider"), str):
                    providers.add(m["provider"])
                if isinstance(m.get("model"), str):
                    models.add(m["model"])
    assert val is not None
    pre, _, rest = val.partition("/")
    mid, _, suf = rest.rpartition(":")
    print(f"transcript={os.path.relpath(P, os.path.expanduser('~/.omp/agent/sessions'))}")
    print(f"value_sha256_12={hashlib.sha256(val.encode()).hexdigest()[:12]} len={len(val)} "
          f"slashes={val.count('/')} colons={val.count(':')}")
    print(f"decomposition: prefix_len={len(pre)} middle_len={len(mid)} suffix_len={len(suf)}")
    print(f"prefix==a message.provider in this transcript: {pre in providers}")
    print(f"middle==a message.model in this transcript:   {mid in models}")
    print(f"whole==a model_change.model:                   {val in mcmodels}")
    print(f"suffix is an omp reasoning-effort token:       {suf in EFFORT}")
    for name, s in (("prefix", pre), ("middle", mid), ("suffix", suf)):
        print(f"{name}: alnum/_/- only={all(c.isalnum() or c in '-_' for c in s)} "
              f"has_digit={any(c.isdigit() for c in s)} has_upper={any(c.isupper() for c in s)}")


if __name__ == "__main__":
    main()
