#!/usr/bin/env python3
"""Constructed witnesses for surviving candidate mutants (JS). pristine vs mutant on one input."""
import json, os, subprocess, sys

S = os.path.dirname(os.path.abspath(__file__))
PRI = os.path.join(S, "cand", "seat-route.pristine.mjs")

def run(tool, args):
    p = subprocess.run(["node", tool] + args, capture_output=True)
    try:
        return json.loads(p.stdout.decode())
    except Exception:
        return {"_stdout": p.stdout.decode()[:200], "_rc": p.returncode}

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
# c03: two error turns with different messages -> last vs first
cases.append(("c03", "two-errors", write("twoerr", [
    msg(stopReason="error", errorMessage="first boom"),
    msg(stopReason="error", errorMessage="second boom")])))
# c04: real host transcript with a stopReason=length turn
cases.append(("c04", "length-turn", "/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/"
              "2026-10-26T03-41-55-460Z_01a1764c-ed84-730d-b290-e516d052c218/RevC2Counter.jsonl"))
# c06: first model_change role is not the seat; the seat's captured row comes later
cases.append(("c06", "first-role", write("cand-firstrole", [
    {"type": "model_change", "role": "main", "model": "prov/main-model"},
    {"type": "model_change", "role": "subagent:cand-firstrole", "model": "prov/captured-model"},
    msg(provider="prov", model="captured-model")])))
# c17: a 24+ run crossing the 120-char cut: redact-then-cut vs cut-then-redact
cases.append(("c17", "run-across-cap", write("capcross", [
    msg(stopReason="error", errorMessage="! " * 50 + "a" * 40 + " tail")])))
# c19: first model_change carries role "default" (no subagent row)
cases.append(("c19", "role-default", write("defrole", [
    {"type": "model_change", "role": "default", "model": "prov/def-model"},
    msg(provider="prov", model="def-model")])))

for mid, tag, path in cases:
    tool = os.path.join(S, "mutants-mjs", mid + ".mjs")
    a, b = run(PRI, ["--file", path, "--json"]), run(tool, ["--file", path, "--json"])
    d = {k: [a.get(k), b.get(k)] for k in a if a.get(k) != b.get(k)}
    print("%s %-15s input=%s" % (mid, tag, os.path.basename(path)))
    print("   pristine=%s" % json.dumps({k: a[k] for k in d})[:400])
    print("   mutant  =%s" % json.dumps({k: b[k] for k in d})[:400])

# c14: locate ignores the session timestamp -> synthetic root (path order beats timestamp)
root = os.path.join(S, "w2")
res = os.path.join(root, "r45-results.json")
for mid in ("c14", "c07"):
    tool = os.path.join(S, "mutants-mjs", mid + ".mjs")
    a = run(PRI, ["--results", res, "--sessions-root", root, "--json"])[0]
    b = run(tool, ["--results", res, "--sessions-root", root, "--json"])[0]
    print("%s %-15s pristine=%s mutant=%s" % (mid, "locate-tiebreak",
          os.path.basename(os.path.dirname(a["session"])),
          os.path.basename(os.path.dirname(b["session"]))))
