#!/usr/bin/env python3
"""oracle_attack.py — attack the FROZEN oracle93.py with hand-derived expectations.

Ground truth is the plan text (plan.md § "Frozen field definitions (v2)"), transcribed by hand
into EXPECT below; the oracle is run on fixtures built at run time in scratch (never committed,
no credential-shaped strings: the only long run is 24 x 'A').

  python3 oracle_attack.py <scratch>
prints one PASS/FAIL line per (fixture, field); exit 1 on any FAIL.
"""
import json, os, subprocess, sys

ORACLE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/probe/oracle93.py"


def w(path, rows):
    with open(path, "w") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")


def turn(model="m", provider="p", stop="stop", **kw):
    m = {"role": "assistant", "model": model, "provider": provider, "stopReason": stop}
    m.update(kw)
    return {"type": "message", "message": m}


def mainfx(scratch):
    d = scratch
    os.makedirs(d, exist_ok=True)
    fx = {}

    # 1. no session_init at all: resolved/chain null, captured null (no model_change)
    w(os.path.join(d, "nosess.jsonl"), [turn()])
    fx["nosess"] = {"resolved": None, "chain": None, "captured": None, "final": "served",
                    "last_error": None, "error_attempts": 0}

    # 2. session_init with non-string resolvedModel and chain=[] -> resolved null, chain []
    w(os.path.join(d, "emptychain.jsonl"), [
        {"type": "session_init", "resolvedModel": 5, "retryFallback": {"chain": []}},
        {"type": "model_change", "role": None, "model": "p/m"},
        turn()])
    fx["emptychain"] = {"resolved": None, "chain": [], "final": "served"}

    # 3. chain mixes strings and non-strings: non-strings dropped, "" kept
    w(os.path.join(d, "chainmixed.jsonl"), [
        {"type": "session_init", "resolvedModel": "p/m", "retryFallback": {"chain": ["a", 5, "", None, "b"]}},
        turn()])
    fx["chainmixed"] = {"resolved": "p/m", "chain": ["a", "", "b"]}

    # 4. retryRecovery shapes on error turns
    w(os.path.join(d, "supnull.jsonl"), [
        {"type": "session_init", "resolvedModel": "p/m", "retryFallback": {"chain": ["x"]}},
        turn(stop="error", errorMessage="boom", retryRecovery={"status": "recovered"}),
        turn(stop="error", errorMessage="boom2", retryRecovery={"status": "superseded",
                                                               "supersededBy": {"provider": "q", "model": 5}}),
        turn(stop="error", errorMessage="boom3", retryRecovery={"supersededBy": {"provider": "", "model": "z"}}),
        turn()])
    # both "?" entries collapse: superseded_by is distinct, first-seen order
    fx["supnull"] = {"error_attempts": 3, "recovered_attempts": 1, "superseded_by": ["?"],
                     "final": "served", "last_error": "boom3"}

    # 5. status is matched case-exactly; non-object retryRecovery ignored
    w(os.path.join(d, "statuscase.jsonl"), [
        turn(stop="error", errorMessage="a", retryRecovery={"status": "Recovered"}),
        turn(stop="error", errorMessage="b", retryRecovery="recovered"),
        turn(stop="error", errorMessage="c", retryRecovery={"status": "recovered"}),
        turn()])
    fx["statuscase"] = {"error_attempts": 3, "recovered_attempts": 1, "superseded_by": []}

    # 6. upstreamProvider: served turns only, non-empty strings only, distinct first-seen
    w(os.path.join(d, "upstream.jsonl"), [
        turn(upstreamProvider="Stealth"),
        turn(upstreamProvider=""),
        turn(upstreamProvider=5),
        turn(upstreamProvider="Stealth"),
        turn(stop="error", errorMessage="e", upstreamProvider="Ignored"),
        turn()])
    fx["upstream"] = {"upstream": ["Stealth"], "answered": ["p/m"],
                      "error_attempts": 1, "last_error": "e"}

    # 7. flag_hops / revert_hops: JSON true only; role fallback only when not true
    w(os.path.join(d, "flag.jsonl"), [
        {"type": "model_change", "role": None, "model": "p/m"},
        {"type": "model_change", "role": "fallback", "model": "p/n", "resolvedModelIsFallback": 1},
        {"type": "model_change", "role": "fallback", "model": "p/o", "resolvedModelIsFallback": True},
        {"type": "model_change", "role": "fallback", "model": "p/m"},
        {"type": "model_change", "role": "subagent:flag", "model": "p/m"},
        turn()])
    fx["flag"] = {"flag_hops": 1, "revert_hops": 2, "captured": "p/m"}

    # 8. captured: subagent:<stem> wins over the role-less row even when later; first match wins
    w(os.path.join(d, "capture.jsonl"), [
        {"type": "model_change", "role": None, "model": "p/root"},
        {"type": "model_change", "role": "subagent:capture", "model": "p/sub"},
        {"type": "model_change", "role": "subagent:capture", "model": "p/sub2"},
        turn(model="n", provider="p")])
    fx["capture"] = {"captured": "p/sub", "fallback": True}

    # 9. ? model rule + distinct first-seen order
    w(os.path.join(d, "models.jsonl"), [
        turn(model="", provider="p"),
        turn(model="n", provider=""),
        turn(model="n", provider="p"),
        turn(model="n", provider="p")])
    fx["models"] = {"answered": ["?", "p/n"], "captured": None}

    # 10. final: aborted / other / silent
    w(os.path.join(d, "fin_aborted.jsonl"), [turn(), turn(stop="aborted")])
    fx["fin_aborted"] = {"final": "aborted", "aborted": 1}
    w(os.path.join(d, "fin_other.jsonl"), [turn(), turn(stop="max_tokens")])
    fx["fin_other"] = {"final": "other"}
    w(os.path.join(d, "fin_silent.jsonl"), [{"type": "session_init", "resolvedModel": "p/m"},
                                            {"type": "message", "message": {"role": "user"}}])
    fx["fin_silent"] = {"final": "silent", "answered": [], "error_attempts": 0}

    # 11. redaction: 24-char run -> <redacted>, first line, strip, cut 120
    long = "x" * 24
    msg = "  first  line " + long + " tail\nsecond line\n"
    w(os.path.join(d, "redact.jsonl"), [turn(stop="error", errorMessage=msg)])
    fx["redact"] = {"last_error": "first  line <redacted> tail",
                    "error_attempts": 1, "final": "dead"}
    w(os.path.join(d, "redactcut.jsonl"), [turn(stop="error", errorMessage="y" * 200)])
    fx["redactcut"] = {"last_error": "<redacted>"}   # plan order: redact, then cut 120
    # discriminates the order: a 30-char run straddling column 120, behind 112 non-class chars.
    # redact-then-cut -> "."*112 + "<redact"; cut-then-redact -> "."*112 + "B"*8 (8 < 24, survives).
    w(os.path.join(d, "redactstraddle.jsonl"), [turn(stop="error", errorMessage="." * 112 + "B" * 30)])
    fx["redactstraddle"] = {"last_error": "." * 112 + "<redacte"}
    w(os.path.join(d, "redactnonstr.jsonl"), [turn(stop="error", errorMessage={"a": 1})])
    fx["redactnonstr"] = {"last_error": ""}

    # 12. parse errors: malformed line and a non-object line
    with open(os.path.join(d, "parse.jsonl"), "w") as fh:
        fh.write(json.dumps({"type": "session_init", "resolvedModel": "p/m"}) + "\n")
        fh.write("{not json\n")
        fh.write("[1,2,3]\n")
        fh.write("\n")
        fh.write(json.dumps(turn()) + "\n")
    fx["parse"] = {"parse_errors": 2, "final": "served", "resolved": "p/m"}

    # 13. yielded: only toolCall named yield in content
    w(os.path.join(d, "yield.jsonl"), [
        turn(content=[{"type": "toolCall", "name": "yield"},
                      {"type": "toolCall", "name": "read"}])])
    fx["yield"] = {"yielded": True, "final": "served"}
    w(os.path.join(d, "noyield.jsonl"), [turn(content=[{"type": "toolCall", "name": "read"}])])
    fx["noyield"] = {"yielded": False}

    # 14. error string that is not a string after strip; late error does not make final dead
    w(os.path.join(d, "errlate.jsonl"), [turn(stop="error", errorMessage="e"), turn()])
    fx["errlate"] = {"final": "served", "last_error": "e", "error_attempts": 1}
    return fx


def main(scratch):
    fx = mainfx(scratch)
    bad = ok = 0
    for name in sorted(fx):
        out = subprocess.run([sys.executable, ORACLE, "--file", os.path.join(scratch, name + ".jsonl")],
                             capture_output=True, text=True)
        if out.returncode != 0:
            print("FAIL %-14s oracle exit %d %s" % (name, out.returncode, out.stderr.strip()))
            bad += 1
            continue
        got = json.loads(out.stdout)
        for f, want in fx[name].items():
            if type(got.get(f)) is not type(want) or got.get(f) != want:
                print("FAIL %-14s %-18s want=%r got=%r" % (name, f, want, got.get(f)))
                bad += 1
            else:
                ok += 1
        print("OK   %-14s seat=%s" % (name, got.get("seat")))
    print("ORACLE_ATTACK: checks_ok=%d checks_fail=%d fixtures=%d" % (ok, bad, len(fx)))
    return 0 if bad == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
