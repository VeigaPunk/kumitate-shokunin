#!/usr/bin/env python3
"""K93CriticB / re-check of the fixed candidate (READY f86bde98…).

Targeted edge cases for the three things the fix touched (last_error null sentinel, Python strip
set, captured fall-through) plus a randomized property test of pyStrip vs Python str.strip().
Every comparison uses the counter's own type-strict diff().
"""
import importlib.util, json, os, random, shutil, subprocess, sys

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
PROBE = os.path.join(LANE, ".ufo/waves/round-93/probe")
CAND = os.path.join(LANE, ".ufo/waves/round-93/K93ExecTool/seat-route.mjs")
S = "/fast/scratch/hyaku/kumitate-r93/K93CriticB"
FX = os.path.join(S, "recheck")
OUT = os.path.join(LANE, ".ufo/waves/round-93/K93CriticB/recheck.receipt.txt")

sys.path.insert(0, PROBE)
import oracle93  # noqa: E402
_spec = importlib.util.spec_from_file_location("probe93", os.path.join(PROBE, "probe93-c1.py"))
probe93 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(probe93)

WS = ["\t", "\n", "\x0b", "\x0c", "\r", "\x1c", "\x1d", "\x1e", "\x1f", " ", "\x85", "\xa0",
      "\u1680", "\u2000", "\u200a", "\u2028", "\u2029", "\u202f", "\u205f", "\u3000", "\ufeff"]


def write(name, lines):
    p = os.path.join(FX, name + ".jsonl")
    with open(p, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    return p


def msg(stop, **kw):
    m = {"role": "assistant", "stopReason": stop, "provider": "p", "model": "one"}
    m.update(kw)
    return json.dumps({"type": "message", "message": m}, ensure_ascii=False)


def mc(role, model, flag=None):
    r = {"type": "model_change", "model": model}
    if role is not ...:
        r["role"] = role
    if flag is not None:
        r["resolvedModelIsFallback"] = flag
    return json.dumps(r)


def case(name, lines):
    p = write(name, lines)
    orc = oracle93.read_one(p)
    pr = subprocess.run(["node", tool, "--file", p, "--json"], capture_output=True, text=True)
    try:
        rec = json.loads(pr.stdout)
    except Exception:
        return name, ["unparsable-stdout rc=%d %s" % (pr.returncode, pr.stderr[:100])], orc, None
    return name, probe93.diff(orc, rec), orc, rec


def main():
    global tool
    if os.path.isdir(FX):
        shutil.rmtree(FX)
    os.makedirs(FX)
    tool = os.path.join(S, "cand2.mjs")
    shutil.copyfile(CAND, tool)
    import hashlib
    lines = ["candidate=%s sha=%s" % (CAND, hashlib.sha256(open(tool, "rb").read()).hexdigest())]

    cases = []
    # last_error sentinel
    for name, val in [("Null", "null"), ("Missing", ...), ("Num", "7"), ("Arr", "[]"),
                      ("Bool", "true"), ("Empty", '""'), ("Obj", "{}")]:
        if val is ...:
            cases.append(("err_" + name, ['{"type":"session","timestamp":"2026-11-06T00:00:00.000Z"}',
                                          mc("subagent:err_" + name, "p/one"),
                                          '{"type":"message","message":{"role":"assistant","stopReason":"error","provider":"p","model":"one"}}']))
        else:
            cases.append(("err_" + name, ['{"type":"session","timestamp":"2026-11-06T00:00:00.000Z"}',
                                          mc("subagent:err_" + name, "p/one"),
                                          msg("error", errorMessage=json.loads(val))]))
    cases.append(("err_none_at_all", [mc("subagent:err_none_at_all", "p/one"), msg("stop")]))
    cases.append(("err_null_after_string", [mc("subagent:err_null_after_string", "p/one"),
                                            msg("error", errorMessage="first boom"),
                                            msg("error", errorMessage=None)]))
    cases.append(("err_string_after_null", [mc("subagent:err_string_after_null", "p/one"),
                                            msg("error", errorMessage=None),
                                            msg("error", errorMessage="second boom")]))
    # trim set, both edges, each character alone and doubled
    for i, w in enumerate(WS):
        cases.append(("trim_%02d" % i, [mc("subagent:trim_%02d" % i, "p/one"),
                                        msg("error", errorMessage=w + "core" + w)]))
    cases.append(("trim_all", [mc("subagent:trim_all", "p/one"),
                               msg("error", errorMessage="".join(WS) + "x" + "".join(reversed(WS)))]))
    # redaction boundaries and the 120 cap
    cases.append(("redact_23", [mc("subagent:redact_23", "p/one"), msg("error", errorMessage="k " + "a" * 23 + " y")]))
    cases.append(("redact_24", [mc("subagent:redact_24", "p/one"), msg("error", errorMessage="k " + "a" * 24 + " y")]))
    cases.append(("redact_cross", [mc("subagent:redact_cross", "p/one"), msg("error", errorMessage="x " * 55 + "K" * 40)]))
    cases.append(("cap_astral", [mc("subagent:cap_astral", "p/one"), msg("error", errorMessage="\U0001F600" * 130)]))
    cases.append(("cap_mixed", [mc("subagent:cap_mixed", "p/one"), msg("error", errorMessage="a" * 119 + "\U0001F600" + "b" * 10)]))
    cases.append(("first_line", [mc("subagent:first_line", "p/one"), msg("error", errorMessage="one\ntwo\nthree")]))
    # captured fall-through
    cases.append(("cap_empty_sub", [mc("subagent:cap_empty_sub", ""), mc("default", "d/m")]))
    cases.append(("cap_null_sub", [mc("subagent:cap_null_sub", None), mc("default", "d/m")]))
    cases.append(("cap_num_sub", [mc("subagent:cap_num_sub", 5), mc("default", "d/m")]))
    cases.append(("cap_null_sub_two", [mc("subagent:cap_null_sub_two", None), mc("subagent:cap_null_sub_two", "s/m")]))
    cases.append(("cap_no_role", [mc(..., "r/m")]))
    cases.append(("cap_default_null", [mc("default", None), mc("default", "d/m")]))
    cases.append(("cap_default_empty", [mc("default", ""), mc("default", "d/m")]))
    cases.append(("cap_sub_empty_only", [mc("subagent:cap_sub_empty_only", "")]))

    bad = 0
    for name, cl in cases:
        n, d, orc, rec = case(name, cl)
        if d:
            bad += 1
            lines.append("DISAGREE %s fields=%s oracle=%s tool=%s" % (
                n, d, {f: probe93.canon(orc.get(f)) for f in d},
                {f: probe93.canon((rec or {}).get(f, "<missing>")) for f in d}))
    lines.append("targeted_cases=%d disagree=%d" % (len(cases), bad))

    # property test: pyStrip vs python str.strip() through last_error
    rnd = random.Random(93)
    alpha = list("abcXYZ019_- ") + WS + ["\U0001F600", "\u00e9"]
    pbad = 0
    for i in range(120):
        s = "".join(rnd.choice(alpha) for _ in range(rnd.randrange(0, 40)))
        n, d, orc, rec = case("prop_%03d" % i, [mc("subagent:prop_%03d" % i, "p/one"), msg("error", errorMessage=s)])
        if d:
            pbad += 1
            lines.append("PROP_DISAGREE %s input=%r oracle=%s tool=%s" % (
                n, s, probe93.canon(orc.get("last_error")),
                probe93.canon((rec or {}).get("last_error", "<missing>"))))
    lines.append("property_cases=120 disagree=%d" % pbad)

    with open(OUT, "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines[:30]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
