#!/usr/bin/env python3
"""Per-survivor constructed witnesses: pristine vs mutant record diff on one input."""
import json, os, subprocess, sys

S = os.path.dirname(os.path.abspath(__file__))
ORC = os.path.join(S, "oracle92-pristine.py")

def run(tool, path):
    out = subprocess.run([sys.executable, tool, "--file", path, "--json"], capture_output=True)
    return json.loads(out.stdout.decode())

def msg(**kw):
    m = {"role": "assistant", "provider": "p", "model": "m", "stopReason": "stop", "content": []}
    m.update(kw)
    return {"type": "message", "message": m}

def write(name, rows):
    p = os.path.join(S, "wit", name + ".jsonl")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w") as fh:
        for r in rows:
            fh.write((r if isinstance(r, str) else json.dumps(r)) + "\n")
    return p

cases = []
# m01: credential-shaped run of exactly 24 chars in the last error's first line
cases.append(("m01", "run24", write("run24", [
    msg(stopReason="error", errorMessage="token abcdefghijklmnopqrstuvwx rejected\nsecond line")])))
# m06: first model_change carries a non-default role; the seat's captured row comes later
cases.append(("m06", "first-role", write("firstrole", [
    {"type": "model_change", "role": "main", "model": "prov/main-model"},
    {"type": "model_change", "role": "subagent:firstrole", "model": "prov/captured-model"},
    msg(provider="prov", model="captured-model")])))
# m12: assistant message with empty provider
cases.append(("m12", "empty-provider", write("pmguard", [msg(provider="", model="m")])))
# m13: a line that parses to a non-object
cases.append(("m13", "nonobject-line", write("nonobj", ['[1, 2]', msg()])))
# m04: real host transcript with a stopReason=length turn (from hostscan hit list)
LEN = ("/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/"
       "2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b/CritV3Spec.jsonl")
cases.append(("m04", "length-turn", LEN))
# m07/m14/m16 wave-mode: W2/W3 above; quote as evidence, no per-file diff

for mid, tag, path in cases:
    tool = os.path.join(S, "mutants-py", mid + ".py")
    a, b = run(ORC, path), run(tool, path)
    diff = {k: [a.get(k), b.get(k)] for k in a if a.get(k) != b.get(k)}
    print("%s %-14s input=%s" % (mid, tag, os.path.basename(path)))
    print("   pristine=%s" % json.dumps({k: a[k] for k in diff}))
    print("   mutant  =%s" % json.dumps({k: b[k] for k in diff}))
