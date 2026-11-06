#!/usr/bin/env python3
"""fuzz_candidate.py — K93CriticA: differential check of the shipped-candidate bytes against the frozen
oracle on synthetic edge transcripts built in scratch (never committed; no credential-shaped tokens).
Reports every field on which the candidate's record differs from oracle93's record, and whether
base.py (the plan-text-shaped independent construction) agrees with the oracle."""
import json, os, subprocess, sys, tempfile

S = "/fast/scratch/hyaku/kumitate-r93/K93CriticA"
FROZEN = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/probe"
CAND = os.path.join(S, "cand.mjs")
BASE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/K93CriticA/base.py"

SES = {"type": "session", "version": 3, "id": "x", "timestamp": "2026-11-06T00:00:00.000Z"}


def mc(**kw):
    d = {"type": "model_change", "id": "m"}
    d.update(kw)
    return d


def msg(**kw):
    d = {"type": "message", "id": "t",
         "message": {"role": "assistant", "content": [{"type": "text", "text": "x"}]}}
    d["message"].update(kw)
    return d


def si(**kw):
    d = {"type": "session_init", "id": "s", "agent": "executor"}
    d.update(kw)
    return d


def turn(provider="p", model="one", **kw):
    d = {"provider": provider, "model": model}
    d.update(kw)
    return msg(**d)


CASES = {
    "default-twice": [mc(role="default", model="a/one"), mc(role="default", model="b/two")],
    # control-character / unicode trimming at the head of errorMessage
    "err-head-0x1c": [turn(stopReason="error", errorMessage="\x1c402 payment")],
    "err-head-bom": [turn(stopReason="error", errorMessage="\ufeff402 payment")],
    "err-head-nbsp": [turn(stopReason="error", errorMessage="\u00a0402 payment")],
    "err-head-vtab": [turn(stopReason="error", errorMessage="\x0b402 payment")],
    "err-head-lsep": [turn(stopReason="error", errorMessage="\u2028402 payment")],
    "err-head-fs": [turn(stopReason="error", errorMessage="\x1c\x1d402")],
    # resolved / chain edges
    "si-empty-resolved": [si(resolvedModel="", retryFallback={"chain": []})],
    "si-twice": [si(resolvedModel="a/one", retryFallback={"chain": ["c/1"]}),
                 si(resolvedModel="b/two", retryFallback={"chain": ["d/2"]})],
    "si-chain-mixed": [si(resolvedModel="p/x", retryFallback={"chain": ["a/1", 3, None, "b/2"]})],
    "si-chain-string": [si(resolvedModel="p/x", retryFallback={"chain": "a/1"})],
    # hop counters
    "hops-mixed": [mc(role="fallback", resolvedModelIsFallback=True),
                   mc(role="fallback", resolvedModelIsFallback=1),
                   mc(role="fallback", resolvedModelIsFallback="true"),
                   mc(role="fallback", resolvedModelIsFallback=False),
                   mc(role="fallback"),
                   mc(resolvedModelIsFallback=True)],
    # recovery shapes
    "rr-served-recovered": [turn(stopReason="stop", retryRecovery={"status": "recovered"})],
    "rr-array": [turn(stopReason="error", errorMessage="e", retryRecovery=["recovered"])],
    "rr-provider-only": [turn(stopReason="error", errorMessage="e",
                              retryRecovery={"status": "superseded", "supersededBy": {"provider": "q"}})],
    "rr-empty-provider": [turn(stopReason="error", errorMessage="e",
                               retryRecovery={"supersededBy": {"provider": "", "model": "m"}})],
    # upstream edges
    "up-space": [turn(stopReason="stop", upstreamProvider=" ")],
    "up-zero": [turn(stopReason="stop", upstreamProvider="0")],
    "up-dup": [turn(stopReason="stop", upstreamProvider="A"),
               turn(stopReason="toolUse", upstreamProvider="A"),
               turn(stopReason="length", upstreamProvider="B")],
    # misc
    "no-turns": [],
    "content-nonlist": [msg(stopReason="stop", provider="p", model="one", content="yield")],
    "stop-null": [turn(stopReason=None)],
}


def write_case(d, name, rows):
    p = os.path.join(d, name + ".jsonl")
    with open(p, "w") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")
    return p


def run(cmd, path):
    p = subprocess.run(cmd + ["--file", path, "--json"], capture_output=True, text=True, timeout=120)
    try:
        return json.loads(p.stdout), None
    except Exception:
        return None, (p.returncode, p.stdout[:200], p.stderr[:200])


def main():
    d = tempfile.mkdtemp(prefix="fuzz-", dir=S)
    rows_out = []
    derived = {
        "subagent-nonstr-then-default": [mc(role="subagent:subagent-nonstr-then-default", model=7),
                                         mc(role="default", model="d/def")],
        "subagent-nonstr-only": [mc(role="subagent:subagent-nonstr-only", model=7)],
        "subagent-missing-model-then-default": [
            mc(role="subagent:subagent-missing-model-then-default"), mc(role="default", model="d/def")],
        "subagent-twice": [mc(role="subagent:subagent-twice", model="a/one"),
                           mc(role="subagent:subagent-twice", model="b/two")],
        "subagent-empty-model": [mc(role="subagent:subagent-empty-model", model="")],
        "subagent-nonstr-then-other-seat": [mc(role="subagent:SomeoneElse", model=7),
                                            mc(role="default", model="d/def")],
    }
    cases = dict(CASES)
    for n in derived:
        cases[n] = derived[n]
    for name, rows in cases.items():
        p = write_case(d, name, [SES] + rows)
        orc, oerr = run(["python3", os.path.join(FROZEN, "oracle93.py")], p)
        cand, cerr = run(["node", CAND], p)
        base, berr = run(["python3", BASE], p)
        if oerr or cerr:
            rows_out.append("%-38s ERROR oracle=%s cand=%s" % (name, oerr, cerr))
            continue
        bad = [k for k in orc if json.dumps(cand.get(k, "<missing>"), sort_keys=True)
               != json.dumps(orc[k], sort_keys=True)]
        bbad = [k for k in orc if json.dumps(base.get(k, "<missing>"), sort_keys=True)
                != json.dumps(orc[k], sort_keys=True)]
        state = "SAME" if not bad else "CAND-DIFF " + ",".join(bad)
        if bbad:
            state += " | base-DIFF " + ",".join(bbad)
        rows_out.append("%-38s %s" % (name, state))
        if bad:
            rows_out.append("    oracle=%s" % json.dumps({k: orc[k] for k in bad}, sort_keys=True))
            rows_out.append("    cand  =%s" % json.dumps({k: cand.get(k, "<missing>") for k in bad}, sort_keys=True))
        if bbad:
            rows_out.append("    base  =%s" % json.dumps({k: base.get(k, "<missing>") for k in bbad}, sort_keys=True))
    print("\n".join(rows_out))
    print("scratch=%s" % d)


main()
