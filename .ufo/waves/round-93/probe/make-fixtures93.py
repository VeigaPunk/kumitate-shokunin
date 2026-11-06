#!/usr/bin/env python3
"""make-fixtures93.py — synthetic member set F for round-93 C1 (Q86: a field whose real population
has no discriminating member gets a synthetic one). Deterministic; writes probe/fixtures/*.jsonl.
Each fixture names the field boundary it pins. Synthetic members test the definitions' text, not
omp's behaviour (Q86 limit). Run once before the freeze; the outputs are committed."""
import json, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures")
TOK23 = "A" * 23
TOK24 = "b" * 12 + "-_" + "9" * 10


def mc(model, role=None, flag=None):
    r = {"type": "model_change", "id": "m", "model": model}
    if role is not None:
        r["role"] = role
    if flag is not None:
        r["resolvedModelIsFallback"] = flag
    return r


def turn(sr, provider="p", model="one", **kw):
    m = {"role": "assistant", "stopReason": sr, "content": kw.pop("content", [{"type": "text", "text": "x"}])}
    if provider is not None:
        m["provider"] = provider
    if model is not None:
        m["model"] = model
    m.update(kw)
    return {"type": "message", "id": "t", "message": m}


def si(resolved=None, chain=None, rf=None):
    r = {"type": "session_init", "id": "s", "agent": "executor"}
    if resolved is not None:
        r["resolvedModel"] = resolved
    if rf is not None:
        r["retryFallback"] = rf
    elif chain is not None:
        r["retryFallback"] = {"primary": "p/one", "chain": chain}
    return r


HEAD = [{"type": "session", "version": 3, "id": "x", "timestamp": "2026-11-06T00:00:00.000Z"}]
Y = [{"type": "toolCall", "name": "yield", "arguments": {}}]

F = {
    # parse_errors: unparsable line, a JSON array, a JSON string, blank and whitespace-only lines skipped
    "F93ParseErr": ["{not json", "[1,2]", "\"str\"", "", "   "] + [mc("p/one", "subagent:F93ParseErr"), turn("stop")],
    # last_error: 23-char run survives, 24-char run (with - and _) redacted; 2nd line dropped; trimmed; cut 120
    "F93Redact": [mc("p/one", "subagent:F93Redact"),
                  turn("error", errorMessage="  402 key " + TOK23 + " and " + TOK24 + " end  \nsecond line " + TOK24),
                  turn("stop")],
    "F93RedactLong": [mc("p/one", "subagent:F93RedactLong"), turn("error", errorMessage="e " * 90)],
    # last_error: non-string errorMessage reads as ""
    "F93ErrNonStr": [mc("p/one", "subagent:F93ErrNonStr"), turn("error", errorMessage=123)],
    # answered '?' rule: missing provider, empty model
    "F93QModel": [mc("p/one", "subagent:F93QModel"), turn("stop", provider=None), turn("toolUse", model=""), turn("length")],
    # final=other
    "F93FinalOther": [mc("p/one", "subagent:F93FinalOther"), turn("stop"), turn("refused")],
    # flag_hops counts JSON true only (1 is not true); revert_hops = role fallback without a true flag
    "F93Flags": [mc("p/one", "subagent:F93Flags"), mc("q/two", "fallback", True), mc("p/one", "fallback", False),
                 mc("p/one", "fallback"), mc("q/two", "fallback", 1), mc("r/three", "default", True),
                 turn("stop", provider="q", model="two")],
    # superseded_by: object only, '?' rule, distinct first-seen; string supersededBy ignored; served-turn rr ignored
    "F93Supersede": [mc("p/one", "subagent:F93Supersede"),
                     turn("error", errorMessage="429", retryRecovery={"status": "recovered", "attempt": 1,
                          "supersededBy": {"provider": "q", "model": "two"}}),
                     turn("error", errorMessage="429", retryRecovery={"status": "Recovered", "attempt": 2,
                          "supersededBy": {"provider": "q"}}),
                     turn("error", errorMessage="429", retryRecovery={"status": "recovered",
                          "supersededBy": "q/two"}),
                     turn("error", errorMessage="429", retryRecovery={"attempt": 4,
                          "supersededBy": {"provider": "q", "model": "two"}}),
                     turn("error", errorMessage="429", retryRecovery=["recovered"]),
                     turn("stop", provider="q", model="two", retryRecovery={"status": "recovered",
                          "supersededBy": {"provider": "z", "model": "nine"}})],
    # upstream: served turns only, non-empty strings only, distinct first-seen
    "F93Upstream": [mc("p/one", "subagent:F93Upstream"), turn("toolUse", upstreamProvider="Stealth"),
                    turn("stop", upstreamProvider=""), turn("stop", upstreamProvider=5),
                    turn("error", errorMessage="x", upstreamProvider="ErrOnly"),
                    turn("stop", upstreamProvider="Other"), turn("stop", upstreamProvider="Stealth")],
    # resolved/chain: first session_init wins; non-string chain items dropped
    "F93Chain": [si("p/one:high", ["q/two:high", 7, None, "r/three:max"]), si("z/z", ["z/y"]),
                 mc("p/one", "subagent:F93Chain"), turn("stop")],
    # chain not a list -> null; resolvedModel non-string -> null
    "F93ChainBad": [si(resolved=5, rf={"primary": "p/one", "chain": "q/two"}), mc("p/one", "subagent:F93ChainBad"), turn("stop")],
    # retryFallback absent -> chain null; resolved present
    "F93ChainNone": [si("p/one"), mc("p/one", "subagent:F93ChainNone"), turn("stop")],
    # empty chain list -> [] (not null)
    "F93ChainEmpty": [si("p/one", []), mc("p/one", "subagent:F93ChainEmpty"), turn("stop")],
    # captured: subagent row of another seat ignored, default-role row used; silent (no turns)
    "F93CapDefault": [mc("x/other", "subagent:Someone"), mc("d/def", "default")],
    # captured null; aborted final after an earlier yield
    "F93AbortYield": [turn("toolUse", content=Y), turn("aborted", errorMessage="Request was aborted")],
    # fallback true from served turn differing; error_attempts vs recovered_attempts differ
    "F93Fallback": [mc("p/one", "subagent:F93Fallback"),
                    turn("error", errorMessage="503", retryRecovery={"status": "recovered", "supersededBy": {"provider": "q", "model": "two"}}),
                    turn("error", errorMessage="503", retryRecovery={"status": "failed"}),
                    turn("stop", provider="q", model="two", content=Y)],
}


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, rows in F.items():
        with open(os.path.join(OUT, name + ".jsonl"), "w") as fh:
            for r in HEAD + rows:
                fh.write((r if isinstance(r, str) else json.dumps(r)) + "\n")
    print("fixtures=%d dir=%s" % (len(F), OUT))


if __name__ == "__main__":
    main()
