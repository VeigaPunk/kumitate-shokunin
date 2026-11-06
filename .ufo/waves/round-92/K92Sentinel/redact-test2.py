#!/usr/bin/env python3
"""K92Sentinel step 1c: named credential families vs the frozen 24-char redaction.

Fabricated (fake) values only. Reports survival per family; prints the oracle last_error for
inspection because every value here is synthetic.
"""
import json, os, subprocess, sys, tempfile

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
ORACLE = LANE + "/.ufo/waves/round-92/probe/oracle92.py"
SC = "/fast/scratch/hyaku/kumitate-r92/K92Sentinel"

CASES = [
    ("aws-secret-access-key-40",
     "SignatureDoesNotMatch: signing key <FAKE-REDACTED> rejected"),
    ("aws-session-token",
     "ExpiredToken " + "FwoGZXIvYXdzE" + "A+/" + "B" * 30 + "/C" * 10),
    ("slack-bot-token", "invalid_auth <FAKE-REDACTED>"),
    ("stripe-live", "billing error <FAKE-REDACTED> declined"),
    ("openai-proj", "auth error <FAKE-REDACTED>"),
    ("db-url-password", "connect failed <FAKE-REDACTED>db.internal:5432/app"),
    ("jwt-hs256-short", "jwt invalid <FAKE-REDACTED>"),
    ("trunc-boundary-partial-key",
     "x" * 99 + " <FAKE-REDACTED>"),          # key starts at col 100 -> cut at 120
    ("innocuous-overredact", "trace id 0123456789abcdef0123456789abcdef not found"),
]


def mk(path, msg):
    with open(path, "w") as fh:
        for r in ({"type": "session", "timestamp": "2026-11-01T00:00:00.000Z"},
                  {"type": "model_change", "role": "subagent:T", "model": "p/m"},
                  {"type": "message", "message": {"role": "assistant", "provider": "p",
                                                  "model": "m", "stopReason": "error",
                                                  "errorMessage": msg, "content": []}}):
            fh.write(json.dumps(r) + "\n")


def main():
    os.makedirs(SC, exist_ok=True)
    d = tempfile.mkdtemp(dir=SC)
    out = []
    for label, msg in CASES:
        p = os.path.join(d, label + ".jsonl")
        mk(p, msg)
        rec = json.loads(subprocess.run(["python3", ORACLE, "--file", p, "--json"],
                                        capture_output=True, text=True, check=True).stdout)
        le = rec["last_error"]
        out.append((label, len(le), le))
    for label, ln, le in out:
        print(f"{label}\n  last_error(len={ln}): {le}")
    print()
    print("SURVIVES_WHOLE_SECRET=" + ",".join(l for l, ln, le in out
          if l == "aws-secret-access-key-40" and "<FAKE-REDACTED>" in le))
    return 0


if __name__ == "__main__":
    sys.exit(main())
