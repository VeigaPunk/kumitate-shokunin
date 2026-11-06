#!/usr/bin/env python3
"""edgecases.py — critic edge-case differential: oracle92.read_one vs the shipped candidate on
synthetic transcripts built from the frozen field definitions. Inputs live in scratch; nothing is
written to the lane. Usage: python3 edgecases.py <scratch-dir> [candidate]"""
import json, os, subprocess, sys

sys.path.insert(0, "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe")
import oracle92

CAND = sys.argv[2] if len(sys.argv) > 2 else (
    "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/K92ExecTool/seat-route.mjs")
S = sys.argv[1]


def w(name, lines):
    p = os.path.join(S, name)
    with open(p, "wb") as f:
        for l in lines:
            f.write((l if isinstance(l, bytes) else l.encode()) + b"\n")
    return p


def mc(role, model):
    d = {"type": "model_change"}
    if role is not None:
        d["role"] = role
    if model is not None:
        d["model"] = model
    return json.dumps(d)


def msg(stop, prov="p", model="m", content=None, **kw):
    m = {"role": "assistant", "stopReason": stop, "provider": prov, "model": model}
    if content is not None:
        m["content"] = content
    m.update(kw)
    return json.dumps({"type": "message", "message": m})


cases = {}
cases["e1_parse-types"] = w("e1.jsonl", ["not json", "null", "[1,2]", "123", '"str"', "   ", msg("stop")])
cases["e2_utf8-BOM"] = w("e2.jsonl", [b"\xef\xbb\xbf" + msg("stop").encode()])
cases["e3_NaN-literal"] = w("e3.jsonl", ['{"type": NaN}', msg("stop")])
cases["e4_crlf"] = w("e4.jsonl", [msg("stop") + "\r", msg("toolUse") + "\r"])
cases["e5_sub-model-nonstring"] = w("e5.jsonl", [mc("default", "openai/gpt"), mc("subagent:e5", None), msg("stop")])
cases["e6_two-model-changes"] = w("e6.jsonl", [mc("default", "d/1"), mc("subagent:e6", "s/1"), mc("default", "d/2"), msg("stop", "x", "y")])
cases["e7_astral-130"] = w("e7.jsonl", [mc("subagent:e7", "s/1"), msg("error", errorMessage="\U0001F600" * 130)])
cases["e8_redact-24"] = w("e8.jsonl", [msg("error", errorMessage="key ABCDEFGHIJKLMNOPQRSTUVWX end")])
cases["e9_redact-23"] = w("e9.jsonl", [msg("error", errorMessage="key ABCDEFGHIJKLMNOPQRSTUVW end")])
cases["e10_errmsg-types"] = w("e10.jsonl", [msg("error", errorMessage=42), msg("error")])
cases["e11_provider-model"] = w("e11.jsonl", [msg("stop", prov="p", model=""), msg("stop", prov="", model="m"),
                                              msg("stop", prov=None, model="m"), msg("stop", prov=5, model="m")])
cases["e12_other-subagent"] = w("e12.jsonl", [mc("subagent:zzz", "z/1"), mc("default", "d/1"), msg("stop")])
cases["e13_no-extension"] = w("e13.txt", [msg("stop")])
cases["e14_content-string"] = w("e14.jsonl", [msg("stop", content="yield")])
cases["e15_yield-items"] = w("e15.jsonl", [msg("stop", content=[{"type": "toolCall", "name": "yield"}, {"type": "toolCall", "name": "bash"}])])
cases["e16_empty-model"] = w("e16.jsonl", [mc("subagent:e16", ""), msg("stop", "p", "m")])
cases["e17_nbsp-trim"] = w("e17.jsonl", [msg("error", errorMessage="\u00a0abc\u00a0")])
cases["e18_token-then-text"] = w("e18.jsonl", [msg("error", errorMessage="A" * 24 + " " + "B" * 200)])
cases["e19_120-cut"] = w("e19.jsonl", [msg("error", errorMessage="Z" * 200)])
cases["e20_error-abort-stop"] = w("e20.jsonl", [msg("error", errorMessage="boom"), msg("aborted"), msg("stop")])
cases["e21_default-null-model"] = w("e21.jsonl", [mc(None, None), mc("subagent:e21", "s/1"), msg("stop")])

bad = 0
for k, p in sorted(cases.items()):
    orc = oracle92.read_one(p)
    pr = subprocess.run(["node", CAND, "--file", p, "--json"], capture_output=True)
    try:
        rec = json.loads(pr.stdout)
    except Exception:
        bad += 1
        print("UNPARSABLE %s rc=%d" % (k, pr.returncode))
        continue
    d = {kk: (orc.get(kk), rec.get(kk, "__miss__")) for kk, v in orc.items() if rec.get(kk, "__miss__") != v}
    if d:
        bad += 1
        print("DIFF %-26s %s" % (k, d))
    else:
        print("ok   %s" % k)
print("EDGE: disagree=%d of %d" % (bad, len(cases)))
