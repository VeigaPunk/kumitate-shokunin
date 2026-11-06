#!/usr/bin/env python3
"""Build single-point mutants of a copy of oracle92.py / seat-route.mjs.

Each mutant = pristine text with exactly ONE replacement. Assertions:
  * the target snippet occurs exactly once,
  * the mutant differs from pristine by exactly one contiguous hunk,
  * the mutant compiles / passes `node --check`.
Writes mutants/<id>.{py,mjs} plus mutants/manifest.tsv (id, kind, site, edit).
"""
import difflib, os, re, subprocess, sys

SRC = sys.argv[1]
OUT = sys.argv[2]
MAN = sys.argv[3]
os.makedirs(OUT, exist_ok=True)

PY = [
    # id, edit description, old, new
    ("m01", "redaction threshold {24,} -> {25,}",
     'REDACT = re.compile(r"[A-Za-z0-9_-]{24,}")',
     'REDACT = re.compile(r"[A-Za-z0-9_-]{25,}")'),
    ("m02", "truncate last_error [:120] -> [:121]",
     "    return first[:120]", "    return first[:121]"),
    ("m03", "last error -> first error",
     '        elif sr == "error":\n            errors += 1\n            last_error = _head(m.get("errorMessage"))',
     '        elif sr == "error":\n            errors += 1\n            if errors == 1:\n                last_error = _head(m.get("errorMessage"))'),
    ("m04", 'SERVED drops "length"',
     'SERVED = ("stop", "toolUse", "length")', 'SERVED = ("stop", "toolUse")'),
    ("m05", 'SERVED drops "stop"',
     'SERVED = ("stop", "toolUse", "length")', 'SERVED = ("toolUse", "length")'),
    ("m06", "captured = first model_change regardless of role",
     'if r.get("type") == "model_change" and r.get("role") == sub:',
     'if r.get("type") == "model_change":'),
    ("m07", "locate tie-break: newest -> oldest",
     "    return os.path.realpath(hits[-1])", "    return os.path.realpath(hits[0])"),
    ("m08", "answered dedupe off",
     "            if pm not in answered:\n                answered.append(pm)",
     "            answered.append(pm)"),
    ("m09", "aborted turns also counted as errors",
     '        elif sr == "aborted":\n            aborted += 1',
     '        elif sr == "aborted":\n            aborted += 1\n            errors += 1'),
    ("m10", "yield detected on toolResult instead of toolCall",
     'c.get("type") == "toolCall" and c.get("name") == "yield"',
     'c.get("type") == "toolResult" and c.get("name") == "yield"'),
    ("m11", "final silent when nothing served (not when no turns)",
     "    if not turns:\n        final = \"silent\"", "    if not answered:\n        final = \"silent\""),
    ("m12", 'provider/model "?" guard dropped',
     '    if not isinstance(p, str) or not p or not isinstance(m, str) or not m:\n        return "?"\n',
     ""),
    ("m13", "non-object parse targets ignored, not counted",
     '            if isinstance(obj, dict):\n                rows.append(obj)\n            else:\n                bad += 1',
     '            if isinstance(obj, dict):\n                rows.append(obj)'),
    ("m14", "locate newest by path, session timestamp ignored",
     '    hits.sort(key=lambda p: (_first_ts(p), p))',
     '    hits.sort(key=lambda p: p)'),
    ("m15", "fallback from last answered model only",
     "any(a != captured for a in answered)",
     "bool(answered) and answered[-1] != captured"),
    ("m16", "locate lane marker dropped (round marker only)",
     "if all(mk in data for mk in marks):", "if marks[0] in data:"),
    ("m17", "last_error takes whole text stripped, not first line",
     '    first = text.split("\\n", 1)[0].strip()', "    first = text.strip()"),
]

src = open(SRC, encoding="utf-8").read()
manifest = []
for mid, edit, old, new in PY:
    n = src.count(old)
    if n != 1:
        sys.exit("%s target occurs %d times: %r" % (mid, n, old[:60]))
    mut = src.replace(old, new)
    diffs = [l for l in difflib.unified_diff(src.splitlines(True), mut.splitlines(True), n=0)]
    hunks = sum(1 for l in diffs if l.startswith("@@"))
    if hunks != 1:
        sys.exit("%s produced %d hunks" % (mid, hunks))
    path = os.path.join(OUT, "%s.py" % mid)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(mut)
    r = subprocess.run([sys.executable, "-m", "py_compile", path], capture_output=True)
    if r.returncode:
        sys.exit("%s does not compile: %s" % (mid, r.stderr.decode()[:300]))
    manifest.append((mid, "py", os.path.basename(SRC), edit))
    print("built", mid, "hunks=1")

with open(MAN, "w", encoding="utf-8") as fh:
    for row in manifest:
        fh.write("\t".join(row) + "\n")
