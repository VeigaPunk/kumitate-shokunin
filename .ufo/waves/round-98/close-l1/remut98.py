#!/usr/bin/env python3
"""remut98.py <shipped round-gate.mjs> <scratch dir> — K2 re-mutation (L1, round 98).

Applies each of the 13 violating row-recogniser shapes of probe/make-controls98.py, plus BASE's `\\s` row,
to the SHIPPED bytes (whose SOURCES_ROW_RE must be exactly the R98 regex) and runs `--selftest` on each mutant.
A mutant is KILLED iff the selftest exits non-zero. The unmutated shipped bytes must PASS (reference).
Prints one line per mutant and `REMUT: killed=<k>/<n>`; exit 0 iff every mutant is killed and the reference passes.
"""
import os, pathlib, subprocess, sys

src = pathlib.Path(sys.argv[1]).read_text()
work = pathlib.Path(sys.argv[2]); work.mkdir(parents=True, exist_ok=True)
# Local imports are part of the selftest runtime, not a mutant. Keep the driver rerunnable.
import shutil
lane_scripts = pathlib.Path(__file__).resolve().parents[4] / "scripts"
for dep in ("cap-spawn.mjs", "cap-run.mjs"):
    shutil.copyfile(lane_scripts / dep, work / dep)
POS = "/^ {0,3}\\|[ \\t]*S\\d{3,}[ \\t]*\\|/"
OLD = "/^ {0,3}\\|\\s*S\\d{3,}\\s*\\|/"
CONST = f"const SOURCES_ROW_RE = {POS};\n"
TEST = "    if (!SOURCES_ROW_RE.test(line)) continue;\n"
assert src.count(CONST) == 1, "shipped SOURCES_ROW_RE is not the R98 regex exactly once"
assert src.count(TEST) == 1, "shipped row test line not found exactly once"

def const(rx):
    return src.replace(CONST, f"const SOURCES_ROW_RE = {rx};\n")

def split(inside, outside):
    return src.replace(TEST, f"    if (!(inReg ? {inside} : {outside}).test(line)) continue;\n")

shapes = {
    "base-s": const(OLD),
    "spaceonly": const("/^ {0,3}\\| *S\\d{3,} *\\|/"),
    "asciiws": const("/^ {0,3}\\|[ \\t\\v\\f\\r]*S\\d{3,}[ \\t\\v\\f\\r]*\\|/"),
    "nbsp": const("/^ {0,3}\\|[ \\t\\u00a0]*S\\d{3,}[ \\t\\u00a0]*\\|/"),
    "zs": const("/^ {0,3}\\|[\\p{Zs}\\t]*S\\d{3,}[\\p{Zs}\\t]*\\|/u"),
    "leadonly": const("/^ {0,3}\\|[ \\t]*S\\d{3,}\\s*\\|/"),
    "trailonly": const("/^ {0,3}\\|\\s*S\\d{3,}[ \\t]*\\|/"),
    "anyindent": const("/^[ \\t]{0,3}\\|[ \\t]*S\\d{3,}[ \\t]*\\|/"),
    "indent4": const("/^ {0,4}\\|[ \\t]*S\\d{3,}[ \\t]*\\|/"),
    "digits2": const("/^ {0,3}\\|[ \\t]*S\\d{2,}[ \\t]*\\|/"),
    "casefold": const("/^ {0,3}\\|[ \\t]*S\\d{3,}[ \\t]*\\|/i"),
    "unicodedigit": const("/^ {0,3}\\|[ \\t]*S\\p{Nd}{3,}[ \\t]*\\|/u"),
    "insideonly": split(POS, OLD),
    "outsideonly": split(OLD, POS),
}
env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
env["TMPDIR"] = str(work)

def selftest(name, text):
    p = work / f"{name}.mjs"
    p.write_text(text)
    r = subprocess.run(["node", str(p), "--selftest"], capture_output=True, text=True, env=env, timeout=900)
    tally = next((l for l in r.stdout.splitlines() if l.startswith("ROUND_GATE_SELFTEST:")), "none")
    fails = [l.strip() for l in r.stdout.splitlines() if l.lstrip().startswith("FAIL")][:4]
    return r.returncode, tally, fails

rc, tally, _ = selftest("reference", src)
print(f"reference exit={rc} {tally}")
killed = 0
for name, text in shapes.items():
    assert text != src, name
    rc2, tally2, fails = selftest(f"m-{name}", text)
    k = rc2 != 0 and tally2 != "none" and bool(fails)
    killed += k
    print(f"{name} exit={rc2} {'KILLED' if k else 'SURVIVED'} {tally2} first_fails={fails}")
print(f"REMUT: killed={killed}/{len(shapes)} reference={'PASS' if rc == 0 else 'FAIL'}")
sys.exit(0 if killed == len(shapes) and rc == 0 else 1)
