#!/usr/bin/env python3
"""m2-teeth.py <M2 round-gate.mjs> <scratch> — do the M2 arms (xxx)/(xxxi) kill the wave's R98-violating shapes?

Shapes: K98Mutation's two counter-only survivors (lead / trail `[ \\t]+`) and K98CriticA's HELD constructions that are
expressible on the row test (`[ \\t]{0,3}` pads, `S\\d{3,7}` ids, U+00AD / U+200E+200F / U+0008+001F / U+115F+3164+FFA0
pad classes, a file-start BOM strip). Each is applied to the M2 bytes and `--selftest` is run; KILLED iff exit != 0
and at least one of (xxx)/(xxxi) is among the FAIL lines. Prints `M2_TEETH: killed=<k>/<n>`.
"""
import os, pathlib, subprocess, sys

src = pathlib.Path(sys.argv[1]).read_text()
work = pathlib.Path(sys.argv[2]); work.mkdir(parents=True, exist_ok=True)
import shutil
lane_scripts = pathlib.Path(__file__).resolve().parents[4] / "scripts"
for dep in ("cap-spawn.mjs", "cap-run.mjs"):
    shutil.copyfile(lane_scripts / dep, work / dep)
CONST = "const SOURCES_ROW_RE = /^ {0,3}\\|[ \\t]*S\\d{3,}[ \\t]*\\|/;\n"
WALK = "  for (const line of sourcesText.split('\\n')) {\n"
assert src.count(CONST) == 1 and src.count(WALK) == 1

def const(rx):
    return src.replace(CONST, f"const SOURCES_ROW_RE = {rx};\n")

shapes = {
    "lead-plus": const("/^ {0,3}\\|[ \\t]+S\\d{3,}[ \\t]*\\|/"),
    "trail-plus": const("/^ {0,3}\\|[ \\t]*S\\d{3,}[ \\t]+\\|/"),
    "padlen-0-3": const("/^ {0,3}\\|[ \\t]{0,3}S\\d{3,}[ \\t]{0,3}\\|/"),
    "idlen-3-7": const("/^ {0,3}\\|[ \\t]*S\\d{3,7}[ \\t]*\\|/"),
    "pad-shy": const("/^ {0,3}\\|[ \\t\\u00ad]*S\\d{3,}[ \\t\\u00ad]*\\|/"),
    "pad-lrm": const("/^ {0,3}\\|[ \\t\\u200e\\u200f]*S\\d{3,}[ \\t\\u200e\\u200f]*\\|/"),
    "pad-c0": const("/^ {0,3}\\|[ \\t\\u0008\\u001f]*S\\d{3,}[ \\t\\u0008\\u001f]*\\|/"),
    "pad-filler": const("/^ {0,3}\\|[ \\t\\u115f\\u3164\\uffa0]*S\\d{3,}[ \\t\\u115f\\u3164\\uffa0]*\\|/"),
    "bom-strip": src.replace(WALK, "  for (const line of sourcesText.replace(/^\\ufeff/, '').split('\\n')) {\n"),
}
env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
env["TMPDIR"] = str(work)
killed = 0
for name, text in shapes.items():
    assert text != src, name
    p = work / f"t-{name}.mjs"; p.write_text(text)
    r = subprocess.run(["node", str(p), "--selftest"], capture_output=True, text=True, env=env, timeout=1200)
    fails = [l for l in r.stdout.splitlines() if l.startswith("FAIL")]
    m2 = [l.split("  ")[2].split(" ")[0] for l in fails if "(xxx)" in l or "(xxxi)" in l]
    k = r.returncode != 0 and bool(m2)
    killed += k
    print(f"{name} exit={r.returncode} {'KILLED' if k else 'SURVIVED'} m2_arms_failed={m2} total_failed={len(fails)}")
print(f"M2_TEETH: killed={killed}/{len(shapes)}")
sys.exit(0 if killed == len(shapes) else 1)
