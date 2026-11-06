#!/usr/bin/env python3
"""Constructed witnesses.

W1: oracle `captured` fallback branch entered although a subagent:<seat> row exists
    (contradicts plan.md Frozen field definitions: fallback only "if none").
W2: wave-mode locate tie-break: synthetic sessions root where pristine / m07 (oldest) /
    m14 (path-order) / m16 (lane marker dropped) pick different sessions.
W3: same, on a REAL host seat name with two same-round kumitate hits.
"""
import json, os, shutil, subprocess, sys

S = os.path.dirname(os.path.abspath(__file__))
ORC = os.path.join(S, "oracle92-pristine.py")
MUT = {m: os.path.join(S, "mutants-py", m + ".py") for m in ("m07", "m14", "m16")}

def msg(pm, stop, err=None, content=None):
    m = {"role": "assistant", "provider": pm[0], "model": pm[1], "stopReason": stop,
         "content": content or []}
    if err is not None:
        m["errorMessage"] = err
    return {"type": "message", "message": m}

def w1():
    d = os.path.join(S, "w1")
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, "Seat.jsonl")
    rows = [
        {"type": "session", "timestamp": "2026-01-01T00:00:00.000Z"},
        {"type": "model_change", "role": "subagent:Seat", "model": None},
        {"type": "model_change", "role": "default", "model": "prov/default-model"},
        msg(("prov", "default-model"), "stop"),
    ]
    with open(p, "w") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")
    out = subprocess.run([sys.executable, ORC, "--file", p, "--json"], capture_output=True)
    print("W1 oracle:", out.stdout.decode().strip())
    print("W1 definition: captured=null (subagent row exists with non-string model; fallback is 'if none')")

def w2():
    d = os.path.join(S, "w2")
    shutil.rmtree(d, ignore_errors=True)
    files = {
        "aaa195": ("2026-09-01T00:00:00.000Z", "kumitate-shokunin"),
        "mmm195": ("2026-12-01T00:00:00.000Z", "tabi-shokunin"),
        "zzz195": ("2026-01-01T00:00:00.000Z", "kumitate-shokunin"),
    }
    for sub, (ts, lane) in files.items():
        os.makedirs(os.path.join(d, sub), exist_ok=True)
        p = os.path.join(d, sub, "Seat.jsonl")
        with open(p, "w") as fh:
            fh.write(json.dumps({"type": "session", "timestamp": ts}) + "\n")
            fh.write(json.dumps({"type": "message", "message":
                                 {"role": "user", "content": "/.ufo/waves/round-45/%s" % lane}}) + "\n")
            fh.write(json.dumps(msg(("prov", "x"), "stop")) + "\n")
    r = os.path.join(d, "r45-results.json")
    with open(r, "w") as fh:
        json.dump({"lane": "kumitate", "round": 45, "results": [{"name": "Seat", "agent": "task"}]}, fh)
    for tag, tool in [("pristine", ORC)] + [(m, MUT[m]) for m in MUT]:
        out = subprocess.run([sys.executable, tool, "--results", r, "--sessions-root", d, "--json"],
                             capture_output=True)
        rec = json.loads(out.stdout.decode())[0]
        print("W2 %-9s session=%s" % (tag, os.path.basename(os.path.dirname(rec["session"]))))

def w3(name="R45RevProvince", rnd=45):
    d = os.path.join(S, "w3")
    os.makedirs(d, exist_ok=True)
    r = os.path.join(d, "r%s-%s-results.json" % (rnd, name))
    with open(r, "w") as fh:
        json.dump({"lane": "kumitate", "round": rnd,
                   "results": [{"name": name, "agent": "task"}]}, fh)
    for tag, tool in [("pristine", ORC)] + [(m, MUT[m]) for m in MUT]:
        out = subprocess.run([sys.executable, tool, "--results", r, "--json"],
                             capture_output=True)
        try:
            rec = json.loads(out.stdout.decode())[0]
        except Exception:
            print("W3", tag, "ERR", out.stderr.decode()[:200])
            continue
        print("W3 %-9s session=%s final=%s answered=%s" % (tag, rec.get("session"), rec.get("final"),
                                                          rec.get("answered")))

w1(); w2(); w3()
