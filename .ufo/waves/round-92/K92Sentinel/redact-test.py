#!/usr/bin/env python3
"""K92Sentinel step 1b: does the frozen 24-char redaction miss credential SHAPES?

Builds synthetic omp-shaped transcripts (fake secrets only) in scratch, runs the FROZEN oracle,
and prints the oracle's last_error so the residual is visible. Fixture secrets are fabricated.
"""
import json, os, subprocess, sys, tempfile

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
ORACLE = LANE + "/.ufo/waves/round-92/probe/oracle92.py"
SC = "/fast/scratch/hyaku/kumitate-r92/K92Sentinel"

CASES = [
    # (label, errorMessage first line, expectation)
    ("aws-access-key-id-20", "InvalidAccessKeyId <FAKE-REDACTED> is not valid", "survives: 20 alnum < 24"),
    ("jwt-3seg-short", "auth failed for <FAKE-REDACTED> sig", "survives: each JWT segment < 24"),
    ("bearer-short", "401 Bearer abcDEF12345ghi rejected", "survives: token 14 chars"),
    ("url-query-token", "GET https://api.example.test/v1/x?token=abc123def456&u=1 failed 403", "survives: token value 12 chars"),
    ("email", "no access for alice.wong@example.test on project", "survives: email, no 24-run besides domain?"),
    ("base64-punct", "decrypt dGhpcyBpcyBh+fake/c2VjcmV0= failed", "survives: +//= break the alnum runs"),
    ("labeled-secret", "config error api_key=shortFakeValue42 not accepted", "survives: value 16 chars"),
    ("pem-header", "<FAKE-REDACTED> unreadable", "survives: hyphen/space split"),
    ("stripe-short", "billing key <FAKE-REDACTED> rejected", "survives: hyphen/underscore split"),
    ("hex-32", "hash mismatch " + "0123456789abcdef" * 2, "REDACTED: 32-char alnum run"),
    ("long-b64-standard", "sig " + "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo=" , "partial: alnum run >=24 redacted, tail after = survives"),
    ("secret-at-118", "x" * 118 + "<FAKE-REDACTED>", "truncated at 120: first 2 chars of key survive"),
    ("multiline-secret", "boom\nkey=<FAKE-REDACTED>", "safe: only first line kept"),
    ("over-redact", "connection to svc-abcdefghijklmnopqrstuvwxyz01 refused", "OVER-REDACT: ordinary id destroyed"),
]


def mk(path, msg):
    sid = {"type": "session", "id": "s", "timestamp": "2026-11-01T00:00:00.000Z", "cwd": "/tmp"}
    mc = {"type": "model_change", "role": "subagent:T", "model": "p/m"}
    asst = {"type": "message", "message": {"role": "assistant", "provider": "p", "model": "m",
                                           "stopReason": "error", "errorMessage": msg, "content": []}}
    with open(path, "w") as fh:
        for r in (sid, mc, asst):
            fh.write(json.dumps(r) + "\n")


def main():
    os.makedirs(SC, exist_ok=True)
    d = tempfile.mkdtemp(dir=SC)
    out = []
    for label, msg, expect in CASES:
        p = os.path.join(d, label + ".jsonl")
        mk(p, msg)
        rec = json.loads(subprocess.run(["python3", ORACLE, "--file", p, "--json"],
                                        capture_output=True, text=True, check=True).stdout)
        le = rec["last_error"]
        # detect residual credential shape in last_error
        residual = "AKIA" in le or "eyJ" in le or "Bearer " in le or "token=" in le \
            or "@" in le or "sk_live" in le or "api_key=" in le or "BEGIN RSA" in le
        out.append((label, expect, len(le), residual, le))
    for label, expect, ln, residual, le in out:
        print(f"{label}\n  expect: {expect}\n  last_error(len={ln}, residual_shape={residual}): {le}")
    print()
    print("LEAK_CASES=" + ",".join(l for l, e, ln, r, le in out if r and "REDACTED" not in e and "safe" not in e))
    print("OVER_REDACT_CASES=" + ",".join(l for l, e, ln, r, le in out if "<redacted>" in le))
    return 0


if __name__ == "__main__":
    sys.exit(main())
