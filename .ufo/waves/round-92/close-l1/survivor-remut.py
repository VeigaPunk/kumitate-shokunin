#!/usr/bin/env python3
"""L1 re-run of the K92Mutation survivor family against the SHIPPED scripts/seat-route.mjs selftest.
usage: survivor-remut.py <shipped.mjs> <scratch dir>"""
import os, subprocess, sys, hashlib
src_path, out = sys.argv[1], sys.argv[2]
src = open(src_path, encoding="utf-8").read()
M = [
 ("c01'", "REDACT_MIN 24 -> 25", "const REDACT_MIN = 24;", "const REDACT_MIN = 25;"),
 ("c04", "SERVED_STOPS drops length", "const SERVED_STOPS = new Set(['stop', 'toolUse', 'length']);", "const SERVED_STOPS = new Set(['stop', 'toolUse']);"),
 ("c06", "captured = first model_change regardless of role", "      if (role === `subagent:${seat}`) {", "      if (role === `subagent:${seat}` || true) {"),
 ("c12'", "turn-model ? guard dropped", "  if (typeof provider !== 'string' || provider === '' || typeof model !== 'string' || model === '') return '?';", "  if (false) return '?';"),
 ("c13", "non-object rows not counted", "    if (!isPlainObject(row)) {\n      parseErrors += 1;\n      continue;\n    }", "    if (!isPlainObject(row)) {\n      continue;\n    }"),
 ("c14", "locate ignores timestamp", "if (best === null || key.ts > best.ts || (key.ts === best.ts && key.path > best.path)) best = key;", "if (best === null || key.path > best.path) best = key;"),
 ("c17'", "cut to 120 before redaction", "  const line = (nl < 0 ? text : text.slice(0, nl)).trim();", "  const line = [...(nl < 0 ? text : text.slice(0, nl)).trim()].slice(0, LAST_ERROR_CAP).join('');\n  return line.replace(/[A-Za-z0-9_-]{24,}/g, REDACT_MARK);"),
 ("c19", "captured default drops role default", "      } else if (role === undefined || role === null || role === 'default') {", "      } else if (role === undefined || role === null) {"),
 ("c20", "cut counts UTF-16 units", "  while (i < line.length && out.length < LAST_ERROR_CAP) {", "  while (i < line.length && out.join('').length < LAST_ERROR_CAP) {"),
]
print("shipped_sha256=%s" % hashlib.sha256(src.encode()).hexdigest())
killed = 0
for mid, what, old, new in M:
    n = src.count(old)
    if n != 1:
        print("%s\t%s\tTARGET_COUNT=%d\tNOT_BUILT" % (mid, what, n)); continue
    p = os.path.join(out, mid.replace("'", "p") + ".mjs")
    open(p, "w", encoding="utf-8").write(src.replace(old, new))
    r = subprocess.run(["node", p, "--selftest"], capture_output=True, text=True, timeout=300)
    last = (r.stdout.strip().splitlines() or [""])[-1]
    k = r.returncode != 0
    killed += k
    print("%s\t%s\trc=%d\t%s\t%s" % (mid, what, r.returncode, last, "KILLED" if k else "SURVIVED"))
print("ROWS_KILLED=%d of %d" % (killed, len(M)))
