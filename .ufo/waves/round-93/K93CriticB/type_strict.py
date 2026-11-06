#!/usr/bin/env python3
"""K93CriticB / type-strictness probe for probe93.canon (python json.dumps, sort_keys).

Question: is there a value pair where the counter's canon() treats two JSON texts as EQUAL
while JSON-from-node distinguishes them?  Anything the counter cannot separate is a hole:
a tool could emit the second text and still be scored as agreeing with the oracle.
"""
import json, subprocess, sys

CASES = [
    ("-0 vs 0 (int form)", "-0", "0"),
    ("1 vs 1.0", "1", "1.0"),
    ("true vs 1", "true", "1"),
    ("false vs 0", "false", "0"),
    ("null vs []", "null", "[]"),
    ("1e2 vs 100", "1e2", "100"),
    ("1e2 vs 100.0", "1e2", "100.0"),
    ("\\u00e9 vs é", '"\\u00e9"', '"\u00e9"'),
    ("\\u0041 vs A", '"\\u0041"', '"A"'),
    ("lone surrogate \\ud800 vs U+FFFD", '"\\ud800"', '"\ufffd"'),
    ("2**53 vs 2**53+1", "9007199254740992", "9007199254740993"),
    ("10**30 vs 1e30", "1000000000000000000000000000000", "1e30"),
    ("NaN vs null-ish", "NaN", "null"),
    ("-0.0 vs 0.0", "-0.0", "0.0"),
]

JS = r'''
const fs = require("fs");
const cases = JSON.parse(fs.readFileSync(0, "utf8"));
const out = cases.map(([name, a, b]) => {
  let pa, pb, ea = null, eb = null;
  try { pa = JSON.parse(a); } catch (e) { ea = String(e); }
  try { pb = JSON.parse(b); } catch (e) { eb = String(e); }
  const jsnodeEqual = (ea === null && eb === null) ? Object.is(pa, pb) : (ea === eb);
  return [name, a, b, ea, eb, jsnodeEqual,
          ea === null ? JSON.stringify(pa) : null,
          eb === null ? JSON.stringify(pb) : null,
          ea === null && typeof pa === "number" ? (1 / pa) : null,
          eb === null && typeof pb === "number" ? (1 / pb) : null];
});
process.stdout.write(JSON.stringify(out));
'''


def canon(v):
    return json.dumps(v, sort_keys=True)


def main():
    print("python %s" % sys.version.split()[0])
    print("%-34s %-10s %-10s %-6s %-6s" % ("case", "py-equal", "py-canon-a", "py-canon-b", "node-eq"))
    for name, a, b in CASES:
        try:
            pa, pb = json.loads(a), json.loads(b)
            eq = canon(pa) == canon(pb)
            ca, cb = canon(pa), canon(pb)
        except Exception as e:
            eq, ca, cb = "parse-err", str(e)[:24], ""
        print("%-34s %-10s %-10s %-10s" % (name, eq, ca[:26], cb[:26]))
    p = subprocess.run(["node", "-e", JS], input=json.dumps([[n, a, b] for n, a, b in CASES]),
                       capture_output=True, text=True)
    print("\nnode JSON.parse/== view:")
    for row in json.loads(p.stdout):
        print("  %-34s node-eq=%-6s jsonA=%-12s jsonB=%-12s" % (row[0], row[5], row[6], row[7]))
    print("\nCONTRADICTION (py-equal but node distinguishes):")
    for name, a, b in CASES:
        try:
            eq = canon(json.loads(a)) == canon(json.loads(b))
        except Exception:
            continue
        if eq:
            row = [r for r in json.loads(p.stdout) if r[0] == name][0]
            if row[4] is None and row[3] is None and not row[5]:
                print("  %-34s py canon EQUAL, node !=  (%r vs %r)" % (name, a, b))
    return 0


if __name__ == "__main__":
    sys.exit(main())
