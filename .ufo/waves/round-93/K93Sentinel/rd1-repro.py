#!/usr/bin/env python3
"""K93Sentinel — RD-1 reproduction on a NON-credential-shaped token (r92 RD-1 debt).

The r92 RD-1 finding (frozen redaction is shape-blind: a credential whose characters are split by
`/ + = @ : .` into runs shorter than 24 survives verbatim) could only be shown with a
credential-shaped fixture, which GH013 blocked. This driver shows the SAME code path — the frozen
`[A-Za-z0-9_-]{24,}` replace — with a token that matches NO credential family and NO 24-char run:

  SPLIT = "NOT-A-SECRET:alpha/beta.gamma+delta=epsilon@zeta-split"

  * `classify(SPLIT) == []` (same classifier as shape-scan.py: run24 / prefix / jwt / b64blob /
    pem / bearer) and the same holds for a real AWS-secret / DB-password SHAPE: those are 40-char
    or separator-split values too, so the redaction branch cannot see them either. The fixture
    itself carries no credential-shaped bytes, so it is committable.
  * `TWENTYFOUR = "a"*24` is the positive side: the branch DOES fire on a 24+ run.

Written at runtime in scratch; never committed. Reads the shipped v1, oracle93 (frozen executable
definition) and, when present, the round-93 candidate.
"""
import hashlib, json, os, re, subprocess, sys

SEAT = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/K93Sentinel"
LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
V1 = LANE + "/scripts/seat-route.mjs"
ORACLE = LANE + "/.ufo/waves/round-93/probe/oracle93.py"
CAND = LANE + "/.ufo/waves/round-93/K93ExecTool/seat-route.mjs"
READY = LANE + "/.ufo/waves/round-93/K93ExecTool/READY"
SCRATCH = "/fast/scratch/hyaku/kumitate-r93/K93Sentinel"

SPLIT = "NOT-A-SECRET:alpha/beta.gamma+delta=epsilon@zeta-split"
TWENTYFOUR = "a" * 24

RUN24 = re.compile(r"[A-Za-z0-9_-]{24,}")
PREFIX = re.compile(
    r"(?:^|[^A-Za-z0-9])(sk-[A-Za-z0-9_-]{8,}|sk_live_[A-Za-z0-9]{8,}|"
    r"gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|"
    r"xox[abprs]-[A-Za-z0-9-]{8,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|"
    r"AIza[0-9A-Za-z_-]{20,}|glpat-[A-Za-z0-9_-]{16,}|hf_[A-Za-z0-9]{20,}|"
    r"pypi-[A-Za-z0-9_-]{20,}|npm_[A-Za-z0-9]{20,})"
)
JWT = re.compile(r"^[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}$")
B64BLOB = re.compile(r"[A-Za-z0-9+/]{32,}={0,2}")
PEM = re.compile(r"-----BEGIN [A-Z ]+-----")
BEARER = re.compile(r"(?i)\bbearer\s+\S{8,}")


def classify(v):
    hits = []
    for name, rx in (("run24", RUN24), ("prefix", PREFIX), ("jwt", JWT),
                     ("b64blob", B64BLOB), ("pem", PEM), ("bearer", BEARER)):
        if rx.search(v) if name != "jwt" else rx.match(v):
            hits.append(name)
    return hits


def transcript(path, error_message, seat="EndToEnd"):
    rows = [
        {"type": "session", "timestamp": "2026-11-06T19:00:00.000Z"},
        {"type": "model_change", "role": "subagent:" + seat, "model": "provider-x/model-one"},
        {"type": "message", "message": {"role": "assistant", "provider": "provider-x",
                                        "model": "model-one", "stopReason": "error",
                                        "errorMessage": error_message}},
    ]
    with open(path, "w") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    return p.returncode, p.stdout.strip(), p.stderr.strip()


def sha256_file(p):
    h = hashlib.sha256()
    with open(p, "rb") as fh:
        for b in iter(lambda: fh.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def main():
    os.makedirs(SCRATCH, exist_ok=True)
    out = []

    def say(s):
        out.append(s)

    say("== RD-1 reproduction: non-credential-shaped token, frozen 24-char redaction ==")
    say(f"v1_sha256={sha256_file(V1)}")
    if os.path.exists(CAND):
        say(f"cand_sha256={sha256_file(CAND)}")
    if os.path.exists(READY):
        say(f"READY={open(READY).read().strip()}")
    say(f"SPLIT       = {SPLIT!r}  (len={len(SPLIT)})")
    say(f"TWENTYFOUR  = 24 x 'a'")
    say(f"classify(SPLIT)      = {classify(SPLIT)}")
    say(f"classify(TWENTYFOUR) = {classify(TWENTYFOUR)}  (the branch's positive trigger)")
    say("")

    fx = {}
    for label, val in (("split", SPLIT), ("run24", TWENTYFOUR)):
        p = os.path.join(SCRATCH, f"rd1-{label}.jsonl")
        transcript(p, "request failed: " + val + "\nsecond line ignored")
        fx[label] = p

    mism = 0
    for label, p in fx.items():
        want = {"split": "request failed: " + SPLIT,
                "run24": "request failed: <redacted>"}[label]
        say(f"-- fixture {label}: --file {p}")
        rc, so, se = run(["node", V1, "--file", p, "--json"])
        if rc == 0:
            rec = json.loads(so)
            got = rec.get("last_error")
            ok = got == want
            mism += 0 if ok else 1
            say(f"   v1     rc={rc} last_error=={got!r} expected_ok={ok} errors={rec.get('errors')}")
        else:
            mism += 1
            say(f"   v1     rc={rc} stdout={so!r} stderr={se[:200]!r}")
        # frozen executable definition
        rc_o, so_o, _ = run(["python3", ORACLE, "--file", p])
        if rc_o == 0:
            rec_o = json.loads(so_o)
            say(f"   oracle rc={rc_o} last_error=={rec_o.get('last_error')!r} "
                f"error_attempts={rec_o.get('error_attempts')}")
            mism += 0 if rec_o.get("last_error") == want else 1
        else:
            say(f"   oracle rc={rc_o}")
        if os.path.exists(CAND):
            rc_c, so_c, se_c = run(["node", CAND, "--file", p, "--json"])
            if rc_c == 0:
                rec_c = json.loads(so_c)
                say(f"   cand   rc={rc_c} last_error=={rec_c.get('last_error')!r} "
                    f"error_attempts={rec_c.get('error_attempts')}")
                mism += 0 if rec_c.get("last_error") == want else 1
            else:
                say(f"   cand   rc={rc_c} stderr={se_c[:200]!r}")
                mism += 1
        else:
            say("   cand   absent (no K93ExecTool/seat-route.mjs yet)")
        say("")

    # definition question: v2 prints the four new string fields unredacted
    say("== new v2 string fields are printed unredacted (definition check, not a tool defect) ==")
    p = os.path.join(SCRATCH, "rd1-newfields.jsonl")
    rows = [
        {"type": "session", "timestamp": "2026-11-06T19:00:00.000Z"},
        {"type": "session_init", "resolvedModel": SPLIT,
         "retryFallback": {"chain": [SPLIT, TWENTYFOUR]}},
        {"type": "model_change", "role": "subagent:NewFields", "model": "provider-x/model-one"},
        {"type": "message", "message": {"role": "assistant", "provider": "provider-x",
                                        "model": "model-one", "stopReason": "stop",
                                        "upstreamProvider": SPLIT}},
        {"type": "message", "message": {"role": "assistant", "provider": "provider-x",
                                        "model": "model-one", "stopReason": "error",
                                        "errorMessage": "x",
                                        "retryRecovery": {"status": "superseded",
                                                          "supersededBy": {"provider": SPLIT,
                                                                           "model": TWENTYFOUR}}}},
    ]
    with open(p, "w") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")
    rc_o, so_o, _ = run(["python3", ORACLE, "--file", p])
    if rc_o == 0:
        o = json.loads(so_o)
        say(f"   oracle resolved==SPLIT {o.get('resolved') == SPLIT} "
            f"chain[0]==SPLIT {o.get('chain', [None])[0] == SPLIT if o.get('chain') else None} "
            f"upstream==[SPLIT] {o.get('upstream') == [SPLIT]} "
            f"superseded_by==[SPLIT + '/' + 24a] {o.get('superseded_by') == [SPLIT + '/' + TWENTYFOUR]}")
    if os.path.exists(CAND):
        rc_c, so_c, se_c = run(["node", CAND, "--file", p, "--json"])
        if rc_c == 0:
            c = json.loads(so_c)
            say(f"   cand   resolved==SPLIT {c.get('resolved') == SPLIT} "
                f"chain==[{SPLIT!r}, 24a] {c.get('chain') == [SPLIT, TWENTYFOUR]} "
                f"upstream==[SPLIT] {c.get('upstream') == [SPLIT]} "
                f"superseded_by==[SPLIT + '/' + 24a] {c.get('superseded_by') == [SPLIT + '/' + TWENTYFOUR]}")
        else:
            say(f"   cand   rc={rc_c} stderr={se_c[:200]!r}")

    say("")
    say(f"mismatches={mism}")
    text = "\n".join(out) + "\n"
    with open(os.path.join(SEAT, "rd1-repro.txt"), "w") as fh:
        fh.write(text)
    print(text)
    # GH013 pre-check: the receipt itself must carry no credential-shaped bytes.
    # A 64-hex sha256 digest matches the b64 shape by construction and is expected; ignore it.
    HEX64 = re.compile(r"\b[0-9a-f]{64}\b")
    hits = []
    for i, ln in enumerate(text.splitlines(), 1):
        cs = classify(ln)
        if HEX64.search(ln):
            cs = [c for c in cs if c not in ("b64blob", "run24")]
        if cs:
            hits.append((i, cs))
    print(f"receipt_credential_shapes={len(hits)} detail={hits}")


if __name__ == "__main__":
    main()
