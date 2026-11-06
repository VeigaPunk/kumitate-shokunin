#!/usr/bin/env python3
"""K92Sentinel step 1: credential-shape scan of oracle92 last_error over sampleA (61 transcripts).

Prints ONLY: path basename, detector class, match length, character classes. Never the secret.
Also computes, per transcript, the raw last-error first line, whether oracle REDACT touched it,
and whether any raw credential-shaped span survived into last_error.
"""
import json, os, re, subprocess, sys

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
ORACLE = LANE + "/.ufo/waves/round-92/probe/oracle92.py"
SAMPLE = LANE + "/.ufo/waves/round-92/probe/sampleA.tsv"
REDACT = re.compile(r"[A-Za-z0-9_-]{24,}")

DETECT = [
    ("aws-access-key-id", re.compile(r"\b(?:AKIA|ASIA|AGPA|AIDA|AROA)[0-9A-Z]{12,20}\b")),
    ("jwt-3seg", re.compile(r"\beyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}")),
    ("jwt-2seg", re.compile(r"\beyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}")),
    ("bearer-token", re.compile(r"(?i)\bbearer\s+([A-Za-z0-9._~+/=-]{8,})")),
    ("email", re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+")),
    ("url-query-cred", re.compile(
        r"[A-Za-z][A-Za-z0-9+.-]*://[^\s\"']*[?&](?:token|key|api_key|apikey|sig|signature|secret|"
        r"auth|access_token|password|pwd)=[^\s&\"']{2,}", re.I)),
    ("pem-header", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY(?: BLOCK)?-----")),
    ("labeled-secret", re.compile(
        r"(?i)\b(?:api[_-]?key|apikey|secret|token|password|passwd|pwd|auth|access[_-]?key)\b"
        r"\s*[:=]\s*[\"']?([^\s\"',;]{6,})")),
    ("b64-mixed", re.compile(r"(?<!<redacted>)(?<![A-Za-z0-9+/])[A-Za-z0-9+/]{16,}={0,2}")),
    ("gh-token", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{10,}\b")),
    ("sk-token", re.compile(r"\b(?:sk|rk)-[A-Za-z0-9_.-]{8,}\b")),
    ("hex-long", re.compile(r"\b(?:[0-9a-fA-F]{16,})\b")),
    ("scheme-cred", re.compile(r"[A-Za-z][A-Za-z0-9+.-]*://[^\s/\"']+:[^\s/@\"']+@")),
]


def classes(s):
    c = []
    for name, rx, in (("upper", r"[A-Z]"), ("lower", r"[a-z]"), ("digit", r"[0-9]"),
                      ("_", r"_"), ("-", r"-"), ("+", r"\+"), ("/", r"/"), ("=", r"="),
                      ("dot", r"\."), ("at", r"@"), ("colon", r":")):
        if re.search(rx, s):
            c.append(name)
    return "+".join(c) or "-"


def raw_last_error(path):
    rows = []
    with open(path, "rb") as fh:
        for raw in fh:
            line = raw.strip()
            if not line:
                continue
            try:
                o = json.loads(line)
            except Exception:
                continue
            if isinstance(o, dict):
                rows.append(o)
    last = None
    for r in rows:
        if r.get("type") != "message":
            continue
        m = r.get("message")
        if isinstance(m, dict) and m.get("role") == "assistant" and m.get("stopReason") == "error":
            last = m
    if last is None:
        return None
    em = last.get("errorMessage")
    if not isinstance(em, str):
        return ""
    return em.split("\n", 1)[0].strip()


def main():
    rows = [l.split("\t") for l in open(SAMPLE).read().splitlines() if l.strip()]
    findings = []
    n_err = 0
    for _stratum, path in rows:
        rec = json.loads(subprocess.run(
            ["python3", ORACLE, "--file", path, "--json"],
            capture_output=True, text=True, check=True).stdout)
        le = rec.get("last_error")
        raw = raw_last_error(path)
        if le is None:
            continue
        n_err += 1
        base = os.path.basename(path)
        redacted_count = le.count("<redacted>")
        raw_redacted = REDACT.sub("<redacted>", raw or "").count("<redacted>") if raw is not None else 0
        print(f"# {base} len={len(le)} redacted={redacted_count} raw_redacted={raw_redacted} "
              f"truncated={len(le)==120}")
        for name, rx in DETECT:
            for m in rx.finditer(le):
                span = m.group(0)
                # b64-mixed: only interesting when it carries + or / or = padding
                if name == "b64-mixed" and not re.search(r"[+/=]", span):
                    continue
                if name == "hex-long" and len(span) < 24:
                    pass
                findings.append((base, name, len(span), classes(span)))
    print()
    print(f"ERROR_TRANSCRIPTS={n_err} FINDINGS={len(findings)}")
    seen = set()
    for base, name, ln, cl in findings:
        key = (name, ln, cl)
        if key in seen:
            continue
        seen.add(key)
        print(f"FIND {name} len={ln} classes={cl} first_seen={base}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
