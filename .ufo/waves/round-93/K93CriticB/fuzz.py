#!/usr/bin/env python3
"""K93CriticB / differential fuzz of the candidate against the frozen oracle.

Compares with the counter's own type-strict rule (probe93.canon / probe93.diff), so any
DISAGREE below is a clause-(c) class finding: the candidate's record contradicts the frozen
definition on a synthetic transcript.
"""
import importlib.util, json, os, random, shutil, subprocess, sys

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
PROBE = os.path.join(LANE, ".ufo/waves/round-93/probe")
CAND = os.path.join(LANE, ".ufo/waves/round-93/K93ExecTool/seat-route.mjs")
S = "/fast/scratch/hyaku/kumitate-r93/K93CriticB"
FX = os.path.join(S, "fuzz")
OUT = os.path.join(LANE, ".ufo/waves/round-93/K93CriticB/fuzz.receipt.txt")

sys.path.insert(0, PROBE)
import oracle93  # noqa: E402
_spec = importlib.util.spec_from_file_location("probe93", os.path.join(PROBE, "probe93-c1.py"))
probe93 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(probe93)

R = random.Random(93)
STOPS = ["stop", "toolUse", "length", "error", "aborted", "other", None, 1, "STOP"]


def s(*choices):
    return R.choice(choices)


def weird_text():
    return s(
        "plain", "line1\nline2", "  padded  ", "\ufeffbom-first", "nbsp\u00a0edge\u00a0",
        "\U0001F600" * 130, "a" * 23 + " " + "b" * 24, "x" * 200,
        "token " + "A" * 30 + " end", "", None, 42, ["not", "a", "string"],
        "trail\n\n", "\u2028sep", "ctrl\x1cstart", "tab\there",
    )


def row():
    k = R.randrange(14)
    if k == 0:
        return {"type": "session", "timestamp": s("2026-11-06T21:41:00.000Z", "", 5, None),
                "cwd": "/x"}
    if k == 1:
        return {"type": "model_change", "role": s("subagent:seat", None, "default", "fallback", "other"),
                "model": s("p/one", "", 7, None),
                "resolvedModelIsFallback": s(True, False, 1, "true", None, 0)}
    if k in (2, 3, 4, 5):
        m = {"role": s("assistant", "user", "tool"),
             "stopReason": R.choice(STOPS),
             "provider": s("prov", "", None, 3),
             "model": s("mod", "", None, 9),
             "upstreamProvider": s("Stealth", "", None, 5)}
        if R.random() < 0.6:
            m["errorMessage"] = weird_text()
        if R.random() < 0.6:
            rr = R.choice([
                {"status": "recovered"}, {"status": "superseded"},
                {"status": s("Recovered", "", None)},
                {"supersededBy": {"provider": s("a", "", None), "model": s("b", "", None)}},
                {"status": "superseded", "supersededBy": {"provider": "x", "model": "y"}},
                {"supersededBy": "not-an-object"}, {}, "not-an-object", None,
                {"status": "recovered", "supersededBy": {"provider": "p2"}},
            ])
            m["retryRecovery"] = rr
        if R.random() < 0.4:
            m["content"] = R.choice([
                [{"type": "toolCall", "name": "yield"}],
                [{"type": "toolCall", "name": s("yield", "read", None)}],
                [{"type": "text", "text": "hi"}],
                "not-a-list", None, [],
                [{"type": "toolCall"}, "junk"],
            ])
        return {"type": "message", "message": m}
    if k == 6:
        return {"type": "message", "message": s("not-a-dict", None, 3, [])}
    if k == 7:
        return {"type": "session_init", "resolvedModel": s("m/resolved", "", 5, None),
                "retryFallback": R.choice([
                    {"chain": ["a", 1, "b"]}, {"chain": []}, {"chain": "nope"},
                    {"chain": None}, {}, "nope", None, {"chain": [None, "z"]},
                ])}
    if k == 8:
        return {"type": s("other", "session_init", "model_change", None)}
    if k == 9:
        return s([], 5, "string-row", None, True)
    return {"type": "message", "message": {"role": "assistant", "stopReason": "error",
                                           "errorMessage": weird_text()}}


def make_file(i):
    path = os.path.join(FX, "case%03d.jsonl" % i)
    lines = []
    n = R.randrange(0, 9)
    for _ in range(n):
        r = row()
        lines.append(r if isinstance(r, str) and r.startswith("RAW:") else json.dumps(r, ensure_ascii=R.random() < 0.5))
    if R.random() < 0.3:
        lines.append(s("{not json", "", "   ", "[1,2]", "3.5", '"str"', '{"type":"message",}'))
    if R.random() < 0.3:
        lines.append('{"type":"model_change","type":"model_change","role":"subagent:seat","model":"dup/last"}')
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(lines))
        if lines and R.random() < 0.7:
            fh.write("\n")
    return path


def main():
    if os.path.isdir(FX):
        shutil.rmtree(FX)
    os.makedirs(FX)
    tool = os.path.join(S, "cand.mjs")
    shutil.copyfile(CAND, tool)
    bad, n = [], 300
    for i in range(n):
        p = make_file(i)
        orc = oracle93.read_one(p)
        pr = subprocess.run(["node", tool, "--file", p, "--json"], capture_output=True, text=True)
        try:
            rec = json.loads(pr.stdout)
        except Exception:
            rec = None
            d = ["unparsable-tool-stdout rc=%d %s" % (pr.returncode, pr.stderr[:120])]
        else:
            d = probe93.diff(orc, rec)
        if d:
            bad.append((p, d, orc, rec))
    import collections
    hist = collections.Counter()
    for _p, _d, _o, _r in bad:
        for f in _d:
            hist[f] += 1
    lines = ["candidate=%s sha256(tool)=%s cases=%d disagree=%d field_histogram=%s"
             % (CAND, __import__("hashlib").sha256(open(tool, "rb").read()).hexdigest(), n, len(bad),
                dict(hist))]
    for p, d, orc, rec in bad[:20]:
        lines.append("DISAGREE %s fields=%s" % (os.path.basename(p), ",".join(d)))
        with open(p) as fh:
            for ln in fh:
                lines.append("   ROW %s" % ln.rstrip()[:300])
        for f in d:
            lines.append("   oracle %s=%s" % (f, probe93.canon(orc.get(f))))
            lines.append("   tool   %s=%s" % (f, probe93.canon((rec or {}).get(f, "<missing>"))))
    with open(OUT, "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines[:40]))
    return 0 if not bad else 0


if __name__ == "__main__":
    sys.exit(main())
