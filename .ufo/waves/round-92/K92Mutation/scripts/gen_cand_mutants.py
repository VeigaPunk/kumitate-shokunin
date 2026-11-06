#!/usr/bin/env python3
"""Build single-point mutants of seat-route.mjs (candidate). Same assertions as the py battery."""
import difflib, os, subprocess, sys

SRC = sys.argv[1]
OUT = sys.argv[2]
MAN = sys.argv[3]
os.makedirs(OUT, exist_ok=True)

JS = [
    ("c01", "REDACT_RE 24+ -> 25+",
     "const REDACT_RE = /[A-Za-z0-9_-]{24,}/g;", "const REDACT_RE = /[A-Za-z0-9_-]{25,}/g;"),
    ("c02", "LAST_ERROR_CAP 120 -> 121",
     "const LAST_ERROR_CAP = 120;", "const LAST_ERROR_CAP = 121;"),
    ("c03", "last error -> first error",
     "      errors += 1;\n      lastErrorMessage = message.errorMessage;",
     "      errors += 1;\n      if (errors === 1) lastErrorMessage = message.errorMessage;"),
    ("c04", 'SERVED_STOPS drops "length"',
     "const SERVED_STOPS = new Set(['stop', 'toolUse', 'length']);",
     "const SERVED_STOPS = new Set(['stop', 'toolUse']);"),
    ("c05", 'SERVED_STOPS drops "stop"',
     "const SERVED_STOPS = new Set(['stop', 'toolUse', 'length']);",
     "const SERVED_STOPS = new Set(['toolUse', 'length']);"),
    ("c06", "captured = first model_change regardless of role",
     "      if (role === `subagent:${seat}`) {", "      if (role === `subagent:${seat}` || true) {"),
    ("c07", "locate tie-break newest -> oldest",
     "if (best === null || key.ts > best.ts || (key.ts === best.ts && key.path > best.path)) best = key;",
     "if (best === null || key.ts < best.ts || (key.ts === best.ts && key.path < best.path)) best = key;"),
    ("c08", "answered dedupe off",
     "      if (!seenModels.has(model)) {\n        seenModels.add(model);\n        answered.push(model);\n      }",
     "      answered.push(model);"),
    ("c09", "aborted turns also counted as errors",
     "      aborted += 1;", "      aborted += 1;\n      errors += 1;"),
    ("c10", "yield detected on toolResult instead of toolCall",
     "if (isPlainObject(item) && item.type === 'toolCall' && item.name === 'yield') {",
     "if (isPlainObject(item) && item.type === 'toolResult' && item.name === 'yield') {"),
    ("c11", "final silent when nothing served (not when no turns)",
     "  if (turnCount === 0) final = 'silent';", "  if (answered.length === 0) final = 'silent';"),
    ("c12", 'provider/model "?" guard dropped',
     "  return typeof v === 'string' && v !== '' ? v : '?';",
     "  return typeof v === 'string' ? v : '';"),
    ("c13", "non-object JSON rows skipped, not counted as parse errors",
     "    if (!isPlainObject(row)) {\n      parseErrors += 1;\n      continue;\n    }",
     "    if (!isPlainObject(row)) {\n      continue;\n    }"),
    ("c14", "locate ignores session timestamp (greatest path only)",
     "if (best === null || key.ts > best.ts || (key.ts === best.ts && key.path > best.path)) best = key;",
     "if (best === null || key.path > best.path) best = key;"),
    ("c15", "fallback from last answered model only",
     "fallback: captured !== null && answered.some((m) => m !== captured),",
     "fallback: captured !== null && answered.length > 0 && answered[answered.length - 1] !== captured,"),
    ("c16", "locate lane marker dropped (round marker only)",
     "    return s1 && s2;", "    return s1;"),
    ("c17", "cut to 120 before redaction instead of after",
     "  return firstLine.replace(REDACT_RE, '<redacted>').slice(0, LAST_ERROR_CAP);",
     "  return firstLine.slice(0, LAST_ERROR_CAP).replace(REDACT_RE, '<redacted>');"),
    ("c18", "last_error from whole text, not first line",
     "  const firstLine = text.split('\\n')[0].trim();", "  const firstLine = text.trim();"),
    ("c19", 'captured default branch drops role "default"',
     "      } else if (role === undefined || role === null || role === 'default') {",
     "      } else if (role === undefined || role === null) {"),
]

src = open(SRC, encoding="utf-8").read()
manifest = []
for mid, edit, old, new in JS:
    n = src.count(old)
    if n != 1:
        sys.exit("%s target occurs %d times: %r" % (mid, n, old[:70]))
    mut = src.replace(old, new)
    diffs = [l for l in difflib.unified_diff(src.splitlines(True), mut.splitlines(True), n=0)]
    hunks = sum(1 for l in diffs if l.startswith("@@"))
    if hunks != 1:
        sys.exit("%s produced %d hunks" % (mid, hunks))
    path = os.path.join(OUT, "%s.mjs" % mid)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(mut)
    r = subprocess.run(["node", "--check", path], capture_output=True)
    if r.returncode:
        sys.exit("%s fails node --check: %s" % (mid, r.stderr.decode()[:300]))
    manifest.append((mid, "mjs", os.path.basename(SRC), edit))
    print("built", mid, "hunks=1")

with open(MAN, "w", encoding="utf-8") as fh:
    for row in manifest:
        fh.write("\t".join(row) + "\n")
